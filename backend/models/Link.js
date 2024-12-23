const mongoose = require('mongoose');
const shortid = require('shortid');

const linkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    default: shortid.generate,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
