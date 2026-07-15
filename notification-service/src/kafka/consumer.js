const { Kafka } = require('kafkajs');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { emitToUser } = require('../websocket/socketServer');

const kafkaConfig = {
  clientId: 'notification-service-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
};

if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
  kafkaConfig.ssl = true;
  kafkaConfig.sasl = {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD
  };
}

const kafka = new Kafka(kafkaConfig);

const consumer = kafka.consumer({ groupId: 'notif-cg' });

const insertNotification = async (recipientId, type, payload) => {
  if (!recipientId) return;
  const id = uuidv4();
  const result = await pool.query(
    'INSERT INTO notifications (id, recipient_id, type, payload) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, recipientId, type, payload]
  );
  
  const notification = result.rows[0];
  
  // Emit in real-time
  emitToUser(recipientId, 'notification', notification);
};

const connectConsumer = async () => {
  try {
    await consumer.connect();
    // Subscribe to both topics
    await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'post-events', fromBeginning: true });
    console.log('Kafka Consumer connected and subscribed to user-events and post-events');

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          
          if (topic === 'user-events' && event.type === 'UserFollowed') {
            await insertNotification(event.followeeId, 'NEW_FOLLOWER', event);
          } else if (topic === 'post-events' && event.type === 'PostLiked') {
            // Don't notify if liking own post
            if (event.likedBy !== event.postOwnerId) {
              await insertNotification(event.postOwnerId, 'POST_LIKED', event);
            }
          } else if (topic === 'post-events' && event.type === 'CommentAdded') {
             // Don't notify if commenting on own post
             if (event.commenterId !== event.postOwnerId) {
               await insertNotification(event.postOwnerId, 'COMMENT_ADDED', event);
             }
          }
        } catch (err) {
          console.error('Error processing Kafka message:', err.message);
        }
      },
    });
  } catch (error) {
    console.error('Error connecting Kafka Consumer (non-fatal):', error.message);
  }
};

module.exports = { connectConsumer };
