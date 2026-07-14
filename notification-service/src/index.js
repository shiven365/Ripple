const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { connectConsumer } = require('./kafka/consumer');
const { initSocketServer } = require('./websocket/socketServer');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3004;

app.use('/notifications', notificationRoutes);
app.use('/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, async () => {
  console.log(`Notification Service is running on port ${PORT}`);
  await connectConsumer();
});
