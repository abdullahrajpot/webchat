const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Groups');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only specific file types are allowed!'));
    }
  }
});

// Get all groups for a user
router.get('/groups', auth, async (req, res) => {
  try {
    console.log('Fetching groups for user:', req.user);
    const groups = await Group.find({ members: req.user._id })
      .populate('admin', 'name email role')
      .populate('members', 'name email role');
    console.log('Found groups:', groups);
    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get messages for a group
router.get('/groups/:groupId/messages', auth, async (req, res) => {
  try {
    // Check if user is member of the group
    const group = await Group.findOne({
      _id: req.params.groupId,
      members: req.user._id
    });

    if (!group) {
      return res.status(403).json({ error: 'Not authorized to access this group' });
    }

    const messages = await Message.find({ groupId: req.params.groupId })
      .sort('timestamp')
      .populate('senderId', 'name email role');

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin creates a new group (via HTTP)
router.post('/groups', auth, async (req, res) => {
  try {
    console.log('Creating group - User:', req.user);
    console.log('Creating group - Request body:', req.body);
    
    // Check if user is admin using role
    if (req.user.role !== 'admin') {
      console.log('User is not admin:', req.user.role);
      return res.status(403).json({ error: 'Only admins can create groups' });
    }

    const { name, members } = req.body;

    // Validate input
    if (!name || !name.trim()) {
      console.log('Group name is missing or empty');
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      console.log('Members array is invalid:', members);
      return res.status(400).json({ error: 'At least one member is required' });
    }

    console.log('Creating group with data:', {
      name: name.trim(),
      admin: req.user._id,
      members: [...members, req.user._id]
    });

    const group = new Group({
      name: name.trim(),
      admin: req.user._id,
      members: [...members, req.user._id]
    });

    await group.save();
    console.log('Group saved successfully:', group);

    // Populate the response
    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role');

    console.log('Populated group:', populatedGroup);
    res.status(201).json(populatedGroup);
  } catch (err) {
    console.error('Error creating group:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update group (admin only)
router.put('/groups/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the admin of this group
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only group admin can update the group' });
    }

    const { name, members } = req.body;

    if (name) group.name = name.trim();
    if (members && Array.isArray(members)) {
      // Ensure admin remains in the group
      group.members = [...new Set([...members, req.user._id])];
    }

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role');

    res.json(populatedGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete group (admin only)
router.delete('/groups/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the admin of this group
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only group admin can delete the group' });
    }

    // Delete all messages in the group
    await Message.deleteMany({ groupId: req.params.groupId });
    
    // Delete the group
    await Group.findByIdAndDelete(req.params.groupId);

    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave group (members only, admin cannot leave)
router.post('/groups/:groupId/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Admin cannot leave their own group
    if (group.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Group admin cannot leave the group' });
    }

    // Remove user from members
    group.members = group.members.filter(
      member => member.toString() !== req.user._id.toString()
    );

    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload file to group
router.post('/groups/:groupId/upload', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request:', req.file);
    
    const group = await Group.findOne({
      _id: req.params.groupId,
      members: req.user._id
    });

    if (!group) {
      return res.status(403).json({ error: 'Not authorized to upload to this group' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine file type for better display
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension);
    const isVideo = ['.mp4', '.avi', '.mov'].includes(fileExtension);
    const isAudio = ['.mp3', '.wav', '.ogg'].includes(fileExtension);

    // Create message with file info
    const message = new Message({
      groupId: req.params.groupId,
      senderId: req.user._id,
      content: req.body.content || `Shared ${isImage ? 'an image' : isVideo ? 'a video' : isAudio ? 'an audio file' : 'a file'}: ${req.file.originalname}`,
      type: 'file',
      fileName: req.file.originalname,
      fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      filePath: req.file.path,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: isImage ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : 'document'
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email role');

    res.json({
      message: 'File uploaded successfully',
      messageData: {
        id: populatedMessage._id,
        senderId: populatedMessage.senderId._id,
        senderName: populatedMessage.senderId.name,
        content: populatedMessage.content,
        type: populatedMessage.type,
        timestamp: populatedMessage.timestamp,
        fileName: populatedMessage.fileName,
        fileSize: populatedMessage.fileSize,
        fileUrl: populatedMessage.fileUrl,
        fileType: populatedMessage.fileType
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Download file
router.get('/files/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    console.log('Download request for:', filename);
    console.log('File path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Find the message to verify user has access
    const message = await Message.findOne({ 
      fileUrl: `/uploads/${filename}`
    }).populate('groupId');

    if (!message) {
      return res.status(404).json({ error: 'File not found in database' });
    }

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: message.groupId,
      members: req.user._id
    });

    if (!group) {
      return res.status(403).json({ error: 'Not authorized to download this file' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${message.fileName}"`);
    
    // Set content type based on file extension
    const ext = path.extname(message.fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;