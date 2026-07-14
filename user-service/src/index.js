const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const userRoutes = require('./routes/userRoutes');
const { connectProducer } = require('./kafka/producer');
const { connectConsumer } = require('./kafka/consumer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001; // Using 3001 to distinguish from auth-service

app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`User Service is running on port ${PORT}`);
  await connectProducer();
  await connectConsumer();
});
