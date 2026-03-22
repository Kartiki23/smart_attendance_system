const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// ==========================
// ✅ CREATE HTTP SERVER
// ==========================
const server = http.createServer(app);

// ==========================
// ✅ ALLOWED ORIGINS (UPDATED)
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'https://smartattendancesystem-gilt.vercel.app' // ✅ ADD THIS
];

// ==========================
// ✅ SOCKET.IO SETUP (FIXED)
// ==========================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ==========================
// ✅ STORE ONLINE USERS
// ==========================
const users = {};

// ==========================
// ✅ SOCKET CONNECTION
// ==========================
io.on('connection', (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log("User registered:", userId);
  });

  socket.on('disconnect', () => {
    console.log("🔴 User disconnected:", socket.id);

    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

// ==========================
// EXPORT SOCKET
// ==========================
module.exports.io = io;
module.exports.users = users;

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json());

// ✅ FIXED CORS (IMPORTANT)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ HANDLE PREFLIGHT
app.options("*", cors());

// ==========================
// ROUTES
// ==========================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/students', require('./routes/students'));
app.use('/api/parents', require('./routes/parents'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/notification', require('./routes/notification'));
app.use('/api/otp',require('./routes/otp'));
// ==========================
// ROOT ROUTE
// ==========================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Attendance API is running 🚀'
  });
});

// ==========================
// ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5173; // ✅ FIXED (Render friendly)

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ==========================
// HANDLE PROMISE ERRORS
// ==========================
process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});