const serviceRegistry = {
  '/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
  '/users': process.env.USER_SERVICE_URL || 'http://localhost:3001',
  '/posts': process.env.POST_SERVICE_URL || 'http://localhost:3002',
  '/feed': process.env.FEED_SERVICE_URL || 'http://localhost:3003',
  '/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
  '/messages': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
  '/media': process.env.MEDIA_SERVICE_URL || 'http://localhost:3005',
};

module.exports = serviceRegistry;
