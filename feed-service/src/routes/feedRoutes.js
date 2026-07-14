const express = require('express');
const { fetchFeed, rebuildFeed } = require('../controllers/feedController');

const router = express.Router();

router.get('/', fetchFeed);
router.post('/rebuild', rebuildFeed);

module.exports = router;
