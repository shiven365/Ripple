const { Kafka } = require('kafkajs');
const { getFollowers } = require('../clients/userServiceClient');
const { addToFeed, trimFeed } = require('../redis/feedStore');

const kafka = new Kafka({
  clientId: 'feed-service-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'feed-cg' });

const connectConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'post-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    console.log('Kafka Consumer connected and subscribed to post-events and user-events');

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`[Kafka Consumer] Received event: ${event.type}`, event);

          if (event.type === 'PostCreated') {
            const { postId, authorId, createdAt } = event;
            
            console.log(`[Kafka Consumer] Fetching followers for author ${authorId}...`);
            const followers = await getFollowers(authorId);
            
            // Fan-out to followers
            console.log(`[Kafka Consumer] Fan-out to ${followers.length} followers...`);
            for (const follower of followers) {
              const followerId = follower.id || follower.follower_id; // depending on user-service return structure
              await addToFeed(followerId, postId, createdAt);
              await trimFeed(followerId);
              console.log(`[Kafka Consumer] Added post ${postId} to feed of user ${followerId}`);
            }
            console.log(`Fanned out post ${postId} to ${followers.length} followers`);
          } else if (event.type === 'UserFollowed') {
            const { followerId, followeeId } = event;
            console.log(`[Kafka Consumer] User ${followerId} followed ${followeeId}, rebuilding feed...`);
            
            const { getRecentPostsByAuthor } = require('../clients/postServiceClient');
            const recentPosts = await getRecentPostsByAuthor(followeeId, 10);
            
            for (const post of recentPosts) {
              await addToFeed(followerId, post.id, post.created_at);
            }
            await trimFeed(followerId);
            
            console.log(`[Kafka Consumer] Backfilled ${recentPosts.length} posts for user ${followerId}`);
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
