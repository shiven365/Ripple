const express = require('express');
const dotenv = require('dotenv');
const feedRoutes = require('./routes/feedRoutes');
const { connectConsumer } = require('./kafka/consumer');
const { connectRedis } = require('./redis/feedStore');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003; 

app.use('/feed', feedRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`Feed Service is running on port ${PORT}`);
  await connectRedis();
  await connectConsumer();
});
