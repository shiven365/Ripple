const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('../config/serviceRegistry');
const express = require('express');

const router = express.Router();

Object.entries(serviceRegistry).forEach(([pathPrefix, targetUrl]) => {
  router.use(
    pathPrefix, 
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        return pathPrefix + req.url;
      },
      onProxyReq: (proxyReq, req, res) => {
        if (req.userId) {
          proxyReq.setHeader('x-user-id', req.userId);
        }
      },
    })
  );
});

module.exports = router;
