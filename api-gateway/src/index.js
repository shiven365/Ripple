const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');
const proxyRoutes = require('./routes/proxyRoutes');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

app.use(globalLimiter);

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.use(authMiddleware);

app.use('/api', proxyRoutes);

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
