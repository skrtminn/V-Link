require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Import routes
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const bioRoutes = require('./routes/bio');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://v-link10.vercel.app',
    'https://v-link.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection (optional for deployment)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGODB_URI provided - running without database');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', auth, linkRoutes);
app.use('/api/bio', auth, bioRoutes);
app.use('/api/analytics', auth, analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'V-Link API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      links: '/api/links',
      bio: '/api/bio',
      analytics: '/api/analytics',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint
app.get('/test', (req, res) => {
  try {
    res.json({
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
        port: process.env.PORT || 10000,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : null
      },
      mongoose: {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error in test endpoint',
      error: error.message,
      stack: error.stack
    });
  }
});

// Redirect route for shortened links
app.get('/:shortCode', async (req, res) => {
  try {
    const Link = require('./models/Link');
    const link = await Link.findOne({ shortCode: req.params.shortCode });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).json({ message: 'Link expired' });
    }

    if (!link.isActive) {
      return res.status(410).json({ message: 'Link is inactive' });
    }

    // Check password if required
    if (link.password) {
      return res.json({
        requiresPassword: true,
        message: 'Password required for this link'
      });
    }

    // Track analytics
    const Analytics = require('./models/Analytics');
    const analytics = new Analytics({
      link: link._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      location: req.get('CF-IPCountry') || 'Unknown' // Cloudflare header
    });
    await analytics.save();

    // Increment click count
    link.clickCount += 1;
    await link.save();

    // Redirect to original URL
    res.redirect(link.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password verification for protected links
app.post('/:shortCode', async (req, res) => {
  try {
    const Link = require('./models/Link');
    const bcrypt = require('bcryptjs');
    const { password } = req.body;

    const link = await Link.findOne({ shortCode: req.params.shortCode });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    if (!link.password) {
      return res.status(400).json({ message: 'This link is not password protected' });
    }

    const isValidPassword = await bcrypt.compare(password, link.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Track analytics
    const Analytics = require('./models/Analytics');
    const analytics = new Analytics({
      link: link._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      location: req.get('CF-IPCountry') || 'Unknown' // Cloudflare header
    });
    await analytics.save();

    // Increment click count
    link.clickCount += 1;
    await link.save();

    res.json({ originalUrl: link.originalUrl });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
