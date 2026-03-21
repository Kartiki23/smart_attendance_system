const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // ✅ NEW
const { Server } = require('socket.io'); // ✅ NEW
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
// ✅ SOCKET.IO SETUP
// ==========================
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true
    }
});

// ==========================
// ✅ STORE ONLINE USERS
// ==========================
const users = {}; // { userId: socketId }

// ==========================
// ✅ SOCKET CONNECTION
// ==========================
io.on('connection', (socket) => {

    console.log("🟢 User connected:", socket.id);

    // 🔑 Register user
    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log("User registered:", userId);
    });

    // ❌ Disconnect
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
// ✅ EXPORT FOR CONTROLLERS
// ==========================
module.exports.io = io;
module.exports.users = users;

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:3000'
    ],
    credentials: true
}));

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
const PORT = process.env.PORT || 5173;

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