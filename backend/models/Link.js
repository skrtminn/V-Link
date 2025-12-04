const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must start with http:// or https://'
    }
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    minlength: 3,
    maxlength: 20
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    maxlength: 100,
    default: ''
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  tags: [String],
  password: {
    type: String,
    select: false // Don't include in queries by default
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: String, // Base64 or URL
    default: ''
  },
  clickCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
linkSchema.index({ shortCode: 1 });
linkSchema.index({ customAlias: 1 });
linkSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Link', linkSchema);
