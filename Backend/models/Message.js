const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() { return this.type === 'text'; }
  },
  type: {
    type: String,
    enum: ['text', 'file'],
    default: 'text'
  },
  fileName: {
    type: String,
    required: function() { return this.type === 'file'; }
  },
  fileSize: {
    type: String,
    required: function() { return this.type === 'file'; }
  },
  filePath: {
    type: String,
    default: '',
    // required: function() { return this.type === 'file'; }
  },
  fileUrl: {
    type: String,
    required: function() { return this.type === 'file'; }
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    required: function() { return this.type === 'file'; }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);