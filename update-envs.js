const fs = require('fs');

['auth-service', 'user-service', 'post-service', 'feed-service', 'notification-service', 'media-service'].forEach(s => {
  try {
    let content = fs.readFileSync(`${s}/.env`, 'utf-8');
    content = content.replace(/DB_HOST=.*/g, 'DB_HOST=localhost');
    content = content.replace(/KAFKA_BROKER=.*/g, 'KAFKA_BROKER=localhost:9092');
    
    if (s === 'auth-service') content = content.replace(/DB_PORT=.*/g, 'DB_PORT=5433');
    if (s === 'user-service') content = content.replace(/DB_PORT=.*/g, 'DB_PORT=5434');
    if (s === 'post-service') content = content.replace(/DB_PORT=.*/g, 'DB_PORT=5435');
    if (s === 'notification-service') content = content.replace(/DB_PORT=.*/g, 'DB_PORT=5436');
    
    if (s === 'feed-service') {
      content = content.replace(/REDIS_HOST=.*/g, 'REDIS_HOST=localhost');
    }
    if (s === 'media-service') {
      content = content.replace(/MINIO_ENDPOINT=.*/g, 'MINIO_ENDPOINT=localhost');
      content = content.replace(/MINIO_PORT=.*/g, 'MINIO_PORT=9000');
    }
    
    fs.writeFileSync(`${s}/.env`, content);
    console.log(`Updated ${s}/.env`);
  } catch (err) {
    console.log(`Error updating ${s}/.env:`, err.message);
  }
});
