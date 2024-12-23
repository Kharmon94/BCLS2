const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Link = require('../models/Link');
const User = require('../models/User');

router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    const totalLinks = await Link.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    res.json({ totalLinks, totalUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/links', [auth, isAdmin], async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/links/:id', [auth, isAdmin], async (req, res) => {
  try {
    await Link.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
