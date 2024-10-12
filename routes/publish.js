// routes/publish.js
const express = require('express');
const { publishProfileDeleted } = require('../publishers/profilePublisher');
const router = express.Router();

router.post('/trigger-publish', async (req, res) => {
  const { type, id } = req.body;

  try {
    await publishProfileDeleted(type, id);
    res.status(200).json({ message: 'Publish event triggered successfully' });
  } catch (error) {
    console.error('Error triggering publish event:', error);
    res.status(500).json({ message: 'Error triggering publish event' });
  }
});

module.exports = router;