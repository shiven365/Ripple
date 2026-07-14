const { spawn } = require('child_process');
const path = require('path');

const services = [
  'auth-service',
  'user-service',
  'post-service',
  'feed-service',
  'notification-service',
  'media-service',
  'api-gateway'
];

services.forEach(service => {
  const child = spawn('node', ['--watch', 'src/index.js'], {
    cwd: path.join(__dirname, service),
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => console.error(`[${service}] Error:`, err));
  child.on('close', (code) => console.log(`[${service}] Exited with code ${code}`));
});

console.log('All backend services started.');
