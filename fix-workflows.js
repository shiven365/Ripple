const fs = require('fs');
const path = require('path');

const dir = '.github/workflows';
const files = fs.readdirSync(dir);

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the curl line with a conditional check
  content = content.replace(
    /curl -X POST \${{ secrets\.(RENDER_DEPLOY_HOOK_[A-Z_]+) }}/,
    'if [ -z "${{ secrets.$1 }}" ]; then echo "No deploy hook configured yet. Skipping."; else curl -X POST ${{ secrets.$1 }}; fi'
  );
  
  fs.writeFileSync(filePath, content);
});

console.log('Workflows updated to handle empty Render secrets gracefully!');
