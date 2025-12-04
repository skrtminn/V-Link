const mongoose = require('mongoose');

const bioPageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    default: 'My Bio',
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'custom'],
    default: 'light',
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Background color must be a valid hex color'
    }
  },
  textColor: {
    type: String,
    default: '#000000',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Text color must be a valid hex color'
    }
  },
  profileImage: {
    type: String,
    default: '',
  },
  links: [{
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL must start with http:// or https://'
      }
    },
    icon: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  socialLinks: [{
    platform: {
      type: String,
      required: true,
      enum: ['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'github', 'tiktok', 'discord', 'twitch', 'other'],
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL must start with http:// or https://'
      }
    },
    username: {
      type: String,
      default: '',
    },
  }],
  viewCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
bioPageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
bioPageSchema.index({ user: 1 });
bioPageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BioPage', bioPageSchema);
