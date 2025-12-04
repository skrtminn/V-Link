const express = require('express');
const { body, validationResult } = require('express-validator');
const BioPage = require('../models/BioPage');
const Analytics = require('../models/Analytics');

const router = express.Router();

// Create bio page
router.post('/', [
  body('title').isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('theme').optional().isIn(['light', 'dark', 'custom']),
  body('backgroundColor').optional().matches(/^#[0-9A-F]{6}$/i),
  body('textColor').optional().matches(/^#[0-9A-F]{6}$/i),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, theme, backgroundColor, textColor, links, socialLinks, profileImage } = req.body;

    // Check if user already has a bio page
    let bioPage = await BioPage.findOne({ user: req.user.id });
    if (bioPage) {
      return res.status(400).json({ message: 'Bio page already exists' });
    }

    bioPage = new BioPage({
      user: req.user.id,
      title,
      description,
      theme: theme || 'light',
      backgroundColor,
      textColor,
      links: links || [],
      socialLinks: socialLinks || [],
      profileImage,
    });

    await bioPage.save();
    res.status(201).json(bioPage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bio page
router.get('/', async (req, res) => {
  try {
    const bioPage = await BioPage.findOne({ user: req.user.id });
    if (!bioPage) {
      return res.status(404).json({ message: 'Bio page not found' });
    }
    res.json(bioPage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bio page
router.put('/', [
  body('title').optional().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('theme').optional().isIn(['light', 'dark', 'custom']),
  body('backgroundColor').optional().matches(/^#[0-9A-F]{6}$/i),
  body('textColor').optional().matches(/^#[0-9A-F]{6}$/i),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bioPage = await BioPage.findOne({ user: req.user.id });
    if (!bioPage) {
      return res.status(404).json({ message: 'Bio page not found' });
    }

    const { title, description, theme, backgroundColor, textColor, links, socialLinks, profileImage } = req.body;

    if (title) bioPage.title = title;
    if (description !== undefined) bioPage.description = description;
    if (theme) bioPage.theme = theme;
    if (backgroundColor) bioPage.backgroundColor = backgroundColor;
    if (textColor) bioPage.textColor = textColor;
    if (links) bioPage.links = links;
    if (socialLinks) bioPage.socialLinks = socialLinks;
    if (profileImage !== undefined) bioPage.profileImage = profileImage;

    await bioPage.save();
    res.json(bioPage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete bio page
router.delete('/', async (req, res) => {
  try {
    const bioPage = await BioPage.findOneAndDelete({ user: req.user.id });
    if (!bioPage) {
      return res.status(404).json({ message: 'Bio page not found' });
    }

    // Delete associated analytics
    await Analytics.deleteMany({ bioPage: bioPage._id });

    res.json({ message: 'Bio page deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public bio page by username
router.get('/public/:username', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bioPage = await BioPage.findOne({ user: user._id });
    if (!bioPage) {
      return res.status(404).json({ message: 'Bio page not found' });
    }

    // Track analytics
    const analytics = new Analytics({
      bioPage: bioPage._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      location: req.get('CF-IPCountry') || 'Unknown'
    });
    await analytics.save();

    // Increment view count
    bioPage.viewCount += 1;
    await bioPage.save();

    res.json({
      bioPage: {
        title: bioPage.title,
        description: bioPage.description,
        theme: bioPage.theme,
        backgroundColor: bioPage.backgroundColor,
        textColor: bioPage.textColor,
        links: bioPage.links,
        socialLinks: bioPage.socialLinks,
        profileImage: bioPage.profileImage,
        viewCount: bioPage.viewCount,
      },
      user: {
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bio page stats
router.get('/stats', async (req, res) => {
  try {
    const bioPage = await BioPage.findOne({ user: req.user.id });
    if (!bioPage) {
      return res.status(404).json({ message: 'Bio page not found' });
    }

    const analytics = await Analytics.find({ bioPage: bioPage._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      bioPage: {
        id: bioPage._id,
        title: bioPage.title,
        viewCount: bioPage.viewCount,
      },
      analytics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
