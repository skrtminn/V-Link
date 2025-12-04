const express = require('express');
const Analytics = require('../models/Analytics');
const Link = require('../models/Link');
const BioPage = require('../models/BioPage');

const router = express.Router();

// Get link analytics
router.get('/links/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const { period = '7d' } = req.query;

    // Verify link ownership
    const link = await Link.findOne({ _id: linkId, user: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const analytics = await Analytics.find({
      link: linkId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Aggregate data
    const totalClicks = analytics.length;
    const clicksByDate = {};
    const clicksByDevice = {};
    const clicksByLocation = {};

    analytics.forEach(click => {
      // By date
      const date = click.createdAt.toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      // By device (simplified from user agent)
      const userAgent = click.userAgent || '';
      let device = 'Unknown';
      if (userAgent.includes('Mobile')) device = 'Mobile';
      else if (userAgent.includes('Tablet')) device = 'Tablet';
      else device = 'Desktop';
      clicksByDevice[device] = (clicksByDevice[device] || 0) + 1;

      // By location
      const location = click.location || 'Unknown';
      clicksByLocation[location] = (clicksByLocation[location] || 0) + 1;
    });

    res.json({
      link: {
        id: link._id,
        shortCode: link.shortCode,
        totalClicks: link.clickCount,
      },
      period,
      analytics: {
        totalClicks,
        clicksByDate,
        clicksByDevice,
        clicksByLocation,
        recentClicks: analytics.slice(0, 50), // Last 50 clicks
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bio page analytics
router.get('/bio', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Get user's bio page
    const bioPage = await BioPage.findOne({ user: req.user.id });
    if (!bioPage) {
      return res.status(404).json({ message: 'Bio page not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const analytics = await Analytics.find({
      bioPage: bioPage._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Aggregate data
    const totalViews = analytics.length;
    const viewsByDate = {};
    const viewsByDevice = {};
    const viewsByLocation = {};

    analytics.forEach(view => {
      // By date
      const date = view.createdAt.toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;

      // By device (simplified from user agent)
      const userAgent = view.userAgent || '';
      let device = 'Unknown';
      if (userAgent.includes('Mobile')) device = 'Mobile';
      else if (userAgent.includes('Tablet')) device = 'Tablet';
      else device = 'Desktop';
      viewsByDevice[device] = (viewsByDevice[device] || 0) + 1;

      // By location
      const location = view.location || 'Unknown';
      viewsByLocation[location] = (viewsByLocation[location] || 0) + 1;
    });

    res.json({
      bioPage: {
        id: bioPage._id,
        title: bioPage.title,
        totalViews: bioPage.viewCount,
      },
      period,
      analytics: {
        totalViews,
        viewsByDate,
        viewsByDevice,
        viewsByLocation,
        recentViews: analytics.slice(0, 50), // Last 50 views
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
