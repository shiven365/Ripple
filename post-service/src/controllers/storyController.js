const { v4: uuidv4 } = require('uuid');
const { insertStory, getActiveStoriesByAuthors } = require('../models/Story');

const createStory = async (req, res) => {
  try {
    const authorId = req.headers['x-user-id'] || req.body.userId;
    if (!authorId) return res.status(401).json({ error: 'Unauthorized' });

    const { mediaUrl } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: 'Media URL is required' });

    const storyId = uuidv4();
    const story = await insertStory(storyId, authorId, mediaUrl);

    res.status(201).json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchStories = async (req, res) => {
  try {
    const { authorIds } = req.query; // Expecting comma separated string
    if (!authorIds) return res.json([]);

    const idArray = authorIds.split(',').filter(id => id.trim() !== '');
    if (idArray.length === 0) return res.json([]);

    const stories = await getActiveStoriesByAuthors(idArray);
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createStory, fetchStories };
