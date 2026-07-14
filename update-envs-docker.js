const fs = require('fs');

['auth-service', 'user-service', 'post-service', 'feed-service', 'notification-service', 'media-service'].forEach(s => {
  try {
    let content = fs.readFileSync(`${s}/.env`, 'utf-8');
    content = content.replace(/DB_HOST=.*/g, `DB_HOST=postgres-${s.split('-')[0]}`);
    content = content.replace(/KAFKA_BROKER=.*/g, 'KAFKA_BROKER=kafka:9092');
    content = content.replace(/DB_PORT=.*/g, 'DB_PORT=5432');
    
    if (s === 'feed-service') {
      content = content.replace(/REDIS_HOST=.*/g, 'REDIS_HOST=redis');
    }
    if (s === 'media-service') {
      content = content.replace(/MINIO_ENDPOINT=.*/g, 'MINIO_ENDPOINT=minio');
      content = content.replace(/MINIO_PORT=.*/g, 'MINIO_PORT=9000');
    }
    
    fs.writeFileSync(`${s}/.env`, content);
    console.log(`Updated ${s}/.env`);
  } catch (err) {
    console.log(`Error updating ${s}/.env:`, err.message);
  }
});

// Update API Gateway
try {
  let content = fs.readFileSync(`api-gateway/.env`, 'utf-8');
  content = content.replace(/AUTH_SERVICE_URL=.*/g, 'AUTH_SERVICE_URL=http://auth-service:3000');
  content = content.replace(/USER_SERVICE_URL=.*/g, 'USER_SERVICE_URL=http://user-service:3001');
  content = content.replace(/POST_SERVICE_URL=.*/g, 'POST_SERVICE_URL=http://post-service:3002');
  content = content.replace(/FEED_SERVICE_URL=.*/g, 'FEED_SERVICE_URL=http://feed-service:3003');
  content = content.replace(/NOTIFICATION_SERVICE_URL=.*/g, 'NOTIFICATION_SERVICE_URL=http://notification-service:3004');
  content = content.replace(/MEDIA_SERVICE_URL=.*/g, 'MEDIA_SERVICE_URL=http://media-service:3005');
  fs.writeFileSync(`api-gateway/.env`, content);
  console.log(`Updated api-gateway/.env`);
} catch (err) {
  console.log(`Error updating api-gateway/.env:`, err.message);
}
