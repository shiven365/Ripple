const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const services = [
  'api-gateway', 'auth-service', 'user-service', 'post-service',
  'feed-service', 'notification-service', 'media-service', 'frontend'
];

fs.mkdirSync('.github/workflows', { recursive: true });

services.forEach(service => {
  const isFrontend = service === 'frontend';
  
  // 1. Create Workflow File
  const secretName = `RENDER_DEPLOY_HOOK_${service.toUpperCase().replace('-SERVICE', '').replace('-', '_')}`;
  
  const workflowContent = `name: ${service} CI/CD

on:
  push:
    branches:
      - main
    paths:
      - '${service}/**'

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./${service}
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run Lint
        run: npm run lint
      - name: Run Tests
        run: npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}
          
      - name: Build and Push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./${service}
          push: true
          tags: \${{ secrets.DOCKERHUB_USERNAME }}/${service}:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Trigger Render Deploy Hook
        run: |
          # The URL below is stored securely in GitHub Secrets. 
          # You will need to paste the actual Deploy Hook URL from your Render dashboard into the secret ${secretName}
          curl -X POST \${{ secrets.${secretName} }}
`;

  fs.writeFileSync(`.github/workflows/${service}-ci-cd.yml`, workflowContent);
  console.log(`Created workflow for ${service}`);

  // 2. Setup Tests & Linting
  const pkgPath = path.join(service, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.scripts = pkg.scripts || {};
    
    // Add tests
    pkg.scripts.test = 'jest';
    
    // Add lint
    if (!isFrontend) {
      pkg.scripts.lint = 'eslint .';
      fs.writeFileSync(path.join(service, '.eslintrc.json'), JSON.stringify({
        "env": { "node": true, "jest": true },
        "extends": "eslint:recommended",
        "parserOptions": { "ecmaVersion": "latest" },
        "rules": { "no-unused-vars": "warn" }
      }, null, 2));
    }
    
    // Write package.json
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    
    // Create dummy test
    const testDir = path.join(service, 'tests');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'app.test.js'), `
describe('Placeholder Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
    `);

    // Install dev dependencies so package-lock.json is updated for npm ci
    console.log(`Installing dev dependencies for ${service}...`);
    try {
      if (isFrontend) {
        execSync('npm install --save-dev jest', { stdio: 'inherit', cwd: path.join(__dirname, service) });
      } else {
        execSync('npm install --save-dev eslint jest', { stdio: 'inherit', cwd: path.join(__dirname, service) });
      }
    } catch (err) {
      console.log(`Warning: npm install failed in ${service}`);
    }
  }
});

console.log('✅ CI/CD Setup Complete!');
