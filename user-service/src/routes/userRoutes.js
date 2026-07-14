const express = require('express');
const {
  getMe,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', getMe);
router.get('/search', searchUsers);
router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
