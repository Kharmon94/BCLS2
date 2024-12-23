const express = require('express');
const router = express.Router();
const LinkService = require('../services/LinkService');
const { asyncHandler } = require('../utils/asyncHandler');
const Link = require('../models/Link');
const { auth } = require('../middleware/auth');
const LinkClick = require('../models/LinkClick');

// Dependency injection setup
const linkService = new LinkService(
  new LinkRepository(Link),
  new AnalyticsRepository(LinkClick)
);

router.post('/shorten', auth, asyncHandler(async (req, res) => {
  const { originalUrl } = req.body;
  const link = await linkService.createShortLink(originalUrl, req.user.id);
  res.json(link);
}));

router.get('/:shortCode', asyncHandler(async (req, res) => {
  const originalUrl = await linkService.trackClick(req.params.shortCode, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    referer: req.headers.referer
  });
  res.redirect(originalUrl);
}));

router.get('/analytics/:linkId', auth, async (req, res) => {
  try {
    const clicks = await LinkClick.find({ linkId: req.params.linkId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    const analytics = {
      totalClicks: clicks.length,
      browsers: {},
      referrers: {},
      clicksByDay: {}
    };

    clicks.forEach(click => {
      // Process analytics data
      const day = click.timestamp.toISOString().split('T')[0];
      analytics.clicksByDay[day] = (analytics.clicksByDay[day] || 0) + 1;
    });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
