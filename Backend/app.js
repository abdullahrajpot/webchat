// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const socketHandler = require('./utils/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with proper CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Initialize socket handler
socketHandler(io);

// Import routes
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/tasks');
const chatRoutes = require('./routes/chatRoutes');
const auth = require('./middleware/auth');

// CORS middleware - MUST be before routes
app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Database connection
connectDB();

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chat App Server is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', auth, taskRoutes);
app.use('/api/chat', auth, chatRoutes);

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Test route to verify auth is working
app.get('/api/test-auth', auth, (req, res) => {
  res.json({ 
    message: 'Auth is working', 
    user: req.user,
    userId: req.userId,
    userRole: req.userRole,
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - MUST be last
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/users (requires auth)',
      'GET /api/chat/groups (requires auth)',
      'POST /api/chat/groups (requires auth)'
    ]
  });
});

const PORT = process.env.PORT || 5001; // Changed to 5001 to match your frontend
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌍 Test URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/users/login`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat/groups`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
});