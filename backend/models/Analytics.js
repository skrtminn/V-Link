const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: function() {
      return !this.bioPage; // Either link or bioPage must be present
    },
  },
  bioPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BioPage',
    required: function() {
      return !this.link; // Either link or bioPage must be present
    },
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    default: '',
  },
  referrer: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown',
  },
  browser: {
    type: String,
    default: 'unknown',
  },
  os: {
    type: String,
    default: 'unknown',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
analyticsSchema.index({ link: 1, createdAt: -1 });
analyticsSchema.index({ bioPage: 1, createdAt: -1 });
analyticsSchema.index({ createdAt: -1 });

// Pre-save middleware to extract device/browser info from user agent
analyticsSchema.pre('save', function(next) {
  if (this.userAgent) {
    const ua = this.userAgent.toLowerCase();

    // Device detection
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      this.device = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      this.device = 'tablet';
    } else {
      this.device = 'desktop';
    }

    // Browser detection
    if (ua.includes('chrome') && !ua.includes('edg')) {
      this.browser = 'chrome';
    } else if (ua.includes('firefox')) {
      this.browser = 'firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      this.browser = 'safari';
    } else if (ua.includes('edg')) {
      this.browser = 'edge';
    } else {
      this.browser = 'unknown';
    }

    // OS detection
    if (ua.includes('windows')) {
      this.os = 'windows';
    } else if (ua.includes('mac os x') || ua.includes('macos')) {
      this.os = 'macos';
    } else if (ua.includes('linux')) {
      this.os = 'linux';
    } else if (ua.includes('android')) {
      this.os = 'android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      this.os = 'ios';
    } else {
      this.os = 'unknown';
    }
  }

  next();
});

module.exports = mongoose.model('Analytics', analyticsSchema);
