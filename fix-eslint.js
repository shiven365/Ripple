const fs = require('fs');
const path = require('path');

const services = [
  'api-gateway', 'auth-service', 'user-service', 'post-service',
  'feed-service', 'notification-service', 'media-service'
];

const eslintConfig = `module.exports = [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off"
    }
  }
];`;

services.forEach(service => {
  const oldLint = path.join(service, '.eslintrc.json');
  if (fs.existsSync(oldLint)) {
    fs.unlinkSync(oldLint);
  }
  
  const newLint = path.join(service, 'eslint.config.js');
  fs.writeFileSync(newLint, eslintConfig);
});

console.log('Fixed ESLint configs for ESLint v9!');
