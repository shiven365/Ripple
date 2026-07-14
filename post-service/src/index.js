const express = require('express');
const dotenv = require('dotenv');
const postRoutes = require('./routes/postRoutes');
const { connectProducer } = require('./kafka/producer');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3002;

app.use('/posts', postRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`Post Service is running on port ${PORT}`);
  await connectProducer();
});
