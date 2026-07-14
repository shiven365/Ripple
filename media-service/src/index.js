const express = require('express');
const dotenv = require('dotenv');
const mediaRoutes = require('./routes/mediaRoutes');
const { initMinio } = require('./storage/minioClient');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005; 

app.use('/media', mediaRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`Media Service is running on port ${PORT}`);
  await initMinio();
});
