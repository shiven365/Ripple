const { execSync } = require('child_process');

async function checkHealth() {
  try {
    const res = await fetch('http://localhost:4000/health');
    if (res.ok) {
      const data = await res.json();
      return data.status === 'ok';
    }
  } catch (e) {
    return false;
  }
  return false;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('🛑 Stopping and wiping existing containers and volumes...');
  execSync('docker compose down -v', { stdio: 'inherit' });

  console.log('\n🚀 Building and starting containers...');
  execSync('docker compose up -d --build', { stdio: 'inherit' });

  console.log('\n⏳ Waiting for API Gateway to be healthy...');
  let isHealthy = false;
  while (!isHealthy) {
    isHealthy = await checkHealth();
    if (!isHealthy) {
      process.stdout.write('.');
      await sleep(2000);
    }
  }
  
  // Wait an extra few seconds for Kafka and Databases to fully initialize internal schemas
  console.log('\n⏳ API is reachable. Waiting 10s for backend services (Kafka/DBs) to fully stabilize...');
  await sleep(10000);

  console.log('\n✅ Stack is ready!');

  console.log('\n🌱 Running seed script...');
  execSync('node scripts/seed.js', { stdio: 'inherit' });
}

run().catch(console.error);
