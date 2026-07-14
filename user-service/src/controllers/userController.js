const { getProfileById, updateProfile, searchProfiles, createProfile } = require('../models/Profile');
const { insertFollow, deleteFollow, listFollowers, listFollowing } = require('../models/Follow');
const { sendEvent } = require('../kafka/producer');
const Joi = require('joi');

const getMe = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
    
    let profile = await getProfileById(userId);
    if (!profile) {
      profile = await createProfile(userId);
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfileSchema = Joi.object({
  display_name: Joi.string().max(100).optional(),
  bio: Joi.string().allow(null, '').optional(),
  avatar_url: Joi.string().uri().max(500).allow(null, '').optional()
});

const updateProfileHandler = async (req, res) => {
  try {
    const currentUserId = req.headers['x-user-id'] || req.body.userId; // Mocked auth
    if (currentUserId !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update other user profile' });
    }

    const { error, value } = updateProfileSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updated = await updateProfile(req.params.id, value);
    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const followUser = async (req, res) => {
  try {
    const followerId = req.headers['x-user-id'] || req.body.userId; // Mocked auth
    const followeeId = req.params.id;

    if (!followerId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
    if (followerId === followeeId) return res.status(400).json({ error: 'Cannot follow yourself' });

    const follow = await insertFollow(followerId, followeeId);
    
    await sendEvent('user-events', { type: 'UserFollowed', followerId, followeeId });

    res.status(201).json(follow);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Already following this user' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const followerId = req.headers['x-user-id'] || req.body.userId; // Mocked auth
    const followeeId = req.params.id;

    if (!followerId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const deleted = await deleteFollow(followerId, followeeId);
    if (!deleted) return res.status(404).json({ error: 'Follow relationship not found' });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFollowers = async (req, res) => {
  try {
    const followers = await listFollowers(req.params.id);
    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFollowing = async (req, res) => {
  try {
    const following = await listFollowing(req.params.id);
    res.json(following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Search query is required' });
    
    const profiles = await searchProfiles(query);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMe,
  getProfile,
  updateProfile: updateProfileHandler,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
};
