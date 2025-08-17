const Group = require('../models/Groups');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io) => {
  // Store active connections
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', async ({ userId, role }) => {
      try {
        // Update user status to online
        await User.findByIdAndUpdate(userId, { 
          status: 'online',
          lastActive: new Date()
        });

        // Store user connection info
        activeUsers.set(socket.id, {
          userId,
          role,
          socket
        });

        console.log(`User ${userId} authenticated (Role: ${role})`);
        
        // Broadcast user status update to all connected clients
        socket.broadcast.emit('userStatusUpdate', {
          userId,
          status: 'online'
        });

        // Send current online users to the newly connected user
        const onlineUserIds = Array.from(activeUsers.values()).map(user => user.userId);
        socket.emit('onlineUsers', onlineUserIds);

      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', 'Authentication failed');
      }
    });

    // Admin creates a new group
    socket.on('createGroup', async ({ groupName, memberIds }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user || user.role !== 'admin') {
          socket.emit('error', 'Only admins can create groups');
          return;
        }

        // Create group in database
        const group = new Group({
          name: groupName,
          admin: user.userId,
          members: [...memberIds, user.userId]
        });

        await group.save();

        // Populate the group data
        const populatedGroup = await Group.findById(group._id)
          .populate('admin', 'name email')
          .populate('members', 'name email');

        // Notify all members about the new group
        const groupData = {
          id: populatedGroup._id,
          name: populatedGroup.name,
          type: 'group',
          admin: populatedGroup.admin,
          members: populatedGroup.members,
          messages: []
        };

        // Send to all connected members
        activeUsers.forEach((connectedUser) => {
          if (groupData.members.some(member => member._id.toString() === connectedUser.userId)) {
            connectedUser.socket.emit('groupCreated', groupData);
          }
        });

        console.log(`Group ${groupName} created by admin ${user.userId}`);
      } catch (error) {
        console.error('Create group error:', error);
        socket.emit('error', 'Failed to create group');
      }
    });

    // Handle joining a group
    socket.on('joinGroup', async (groupId) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit('error', 'User not authenticated');
          return;
        }

        // Verify user is member of the group
        const group = await Group.findOne({
          _id: groupId,
          members: user.userId
        });

        if (!group) {
          socket.emit('error', 'Cannot join group');
          return;
        }

        // Join the socket room
        socket.join(groupId);

        // Send recent messages
        const messages = await Message.find({ groupId })
          .sort('timestamp')
          .populate('senderId', 'name email')
          .limit(50); // Limit to last 50 messages

        const formattedMessages = messages.map(msg => ({
          id: msg._id,
          senderId: msg.senderId._id,
          senderName: msg.senderId.name,
          content: msg.content,
          type: msg.type,
          timestamp: msg.timestamp,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileUrl: msg.fileUrl,
          fileType: msg.fileType
        }));

        socket.emit('groupHistory', {
          groupId,
          messages: formattedMessages
        });

        console.log(`User ${user.userId} joined group ${groupId}`);
      } catch (error) {
        console.error('Join group error:', error);
        socket.emit('error', 'Failed to join group');
      }
    });

    // Handle new messages
    socket.on('sendMessage', async ({ groupId, content, type, fileName, fileSize, fileUrl, fileType }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit('error', 'User not authenticated');
          return;
        }

        // Verify user is member of the group
        const group = await Group.findOne({
          _id: groupId,
          members: user.userId
        });

        if (!group) {
          socket.emit('error', 'Cannot send message to this group');
          return;
        }

        // Create message in database
        const message = new Message({
          groupId,
          senderId: user.userId,
          content,
          type: type || 'text',
          ...(type === 'file' && { fileName, fileSize, fileUrl, fileType })
        });

        await message.save();

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'name email');

        const messageData = {
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
        };

        // Broadcast to all users in the group
        io.to(groupId).emit('newMessage', {
          groupId,
          message: messageData
        });

        console.log(`Message sent in group ${groupId} by user ${user.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle user status updates
    socket.on('updateStatus', async ({ status }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit('error', 'User not authenticated');
          return;
        }

        if (!['online', 'away', 'busy', 'offline'].includes(status)) {
          socket.emit('error', 'Invalid status');
          return;
        }

        // Update in database
        await User.findByIdAndUpdate(user.userId, { status });

        // Broadcast status update
        socket.broadcast.emit('userStatusUpdate', {
          userId: user.userId,
          status
        });

        console.log(`User ${user.userId} status updated to ${status}`);
      } catch (error) {
        console.error('Update status error:', error);
        socket.emit('error', 'Failed to update status');
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const user = activeUsers.get(socket.id);
        if (user) {
          // Update user status to offline
          await User.findByIdAndUpdate(user.userId, { 
            status: 'offline',
            lastActive: new Date()
          });

          // Broadcast status update
          socket.broadcast.emit('userStatusUpdate', {
            userId: user.userId,
            status: 'offline'
          });

          console.log(`User ${user.userId} disconnected`);
          activeUsers.delete(socket.id);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      
      console.log('Client disconnected:', socket.id);
    });

    // Handle typing indicators (optional)
    socket.on('typing', ({ groupId, isTyping }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.to(groupId).emit('userTyping', {
          userId: user.userId,
          isTyping
        });
      }
    });
  });
};