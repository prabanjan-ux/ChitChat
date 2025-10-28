require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const Message = require('./models/message');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Database
sequelize
  .sync()
  .then(() => console.log('✅ Database synced successfully'))
  .catch((err) => console.error('❌ Database sync error:', err));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  const userId = socket.handshake.auth.userId;
  if (userId) {
    users.set(userId, socket.id);
    User.update({ is_online: true, last_seen: new Date() }, { where: { id: userId } });
    console.log(`User ${userId} is now online.`);
  }

  // Join room manually
  socket.on('join', (joinedUserId) => {
    users.set(joinedUserId, socket.id);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, text } = data;

      const message = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        text,
      });

      const receiverSocket = users.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('receive_message', message.toJSON());

      const senderSocket = users.get(senderId);
      if (senderSocket) io.to(senderSocket).emit('receive_message', message.toJSON());
    } catch (err) {
      console.error('❌ Error sending message:', err);
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log('🔴 User disconnected:', socket.id);

    let disconnectedUserId = null;
    for (const [uid, sid] of users.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = uid;
        users.delete(uid);
        break;
      }
    }

    if (disconnectedUserId) {
      await User.update(
        { is_online: false, last_seen: new Date() },
        { where: { id: disconnectedUserId } }
      );
      console.log(`User ${disconnectedUserId} is now offline.`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
