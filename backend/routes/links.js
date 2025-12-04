const express = require('express');
const { body, validationResult } = require('express-validator');
const Link = require('../models/Link');
const Analytics = require('../models/Analytics');
const qrcode = require('qrcode');

const router = express.Router();

// Create shortened link
router.post('/', [
  body('originalUrl').isURL(),
  body('title').optional().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('customAlias').optional().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('password').optional().isLength({ min: 4 }),
  body('expiresAt').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, title, description, customAlias, password, expiresAt, tags } = req.body;

    // Check if custom alias is taken
    if (customAlias) {
      const existingLink = await Link.findOne({ customAlias });
      if (existingLink) {
        return res.status(400).json({ message: 'Custom alias already taken' });
      }
    }

    // Generate short code
    let shortCode;
    do {
      shortCode = Math.random().toString(36).substring(2, 8);
    } while (await Link.findOne({ shortCode }));

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create link
    const link = new Link({
      originalUrl,
      shortCode,
      customAlias,
      user: req.user.id,
      title,
      description,
      password: hashedPassword,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      tags: tags || [],
    });

    await link.save();

    // Generate QR code
    const qrCodeDataURL = await qrcode.toDataURL(`${process.env.FRONTEND_URL}/${shortCode}`);
    link.qrCode = qrCodeDataURL;
    await link.save();

    res.status(201).json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's links
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const links = await Link.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Link.countDocuments(query);

    res.json({
      links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single link
router.get('/:id', async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update link
router.put('/:id', [
  body('title').optional().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('customAlias').optional().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('password').optional().isLength({ min: 4 }),
  body('expiresAt').optional().isISO8601(),
  body('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const link = await Link.findOne({ _id: req.params.id, user: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const { title, description, customAlias, password, expiresAt, isActive, tags } = req.body;

    // Check if custom alias is taken by another link
    if (customAlias && customAlias !== link.customAlias) {
      const existingLink = await Link.findOne({ customAlias });
      if (existingLink) {
        return res.status(400).json({ message: 'Custom alias already taken' });
      }
      link.customAlias = customAlias;
    }

    // Update password if provided
    if (password !== undefined) {
      if (password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        link.password = await bcrypt.hash(password, salt);
      } else {
        link.password = null;
      }
    }

    if (title !== undefined) link.title = title;
    if (description !== undefined) link.description = description;
    if (expiresAt !== undefined) link.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) link.isActive = isActive;
    if (tags !== undefined) link.tags = tags;

    await link.save();
    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete link
router.delete('/:id', async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Delete associated analytics
    await Analytics.deleteMany({ link: req.params.id });

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get link stats
router.get('/:id/stats', async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const analytics = await Analytics.find({ link: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      link: {
        id: link._id,
        shortCode: link.shortCode,
        clickCount: link.clickCount,
      },
      analytics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
