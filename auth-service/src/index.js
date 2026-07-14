const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/authRoutes');
const { connectProducer } = require('./kafka/producer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`Service is running on port ${PORT}`);
  await connectProducer();
});
