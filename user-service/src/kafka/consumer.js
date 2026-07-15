const { Kafka } = require('kafkajs');
const pool = require('../config/db');

const kafkaConfig = {
  clientId: 'user-service-consumer',
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

const consumer = kafka.consumer({ groupId: 'user-service-cg' });

const connectConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    console.log('Kafka Consumer connected and subscribed to user-events');

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          if (event.type === 'UserRegistered') {
            const { userId, email, username } = event;
            const displayName = username || email.split('@')[0];
            
            // Insert profile if it doesn't exist
            await pool.query(
              `INSERT INTO profiles (id, display_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
              [userId, displayName]
            );
            console.log(`Created profile for new user ${userId}`);
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
