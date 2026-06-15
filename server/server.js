// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const connectDB = require('./config/db'); // Mongoose connection
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const Message = require('./models/message');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const users = new Map(); // Maps userId to socketId

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.userId = userId; // store on socket
    users.set(userId, socket.id);

    if (
      typeof userId === 'string' &&
      userId.length === 24 &&
      mongoose.Types.ObjectId.isValid(userId)
    ) {
      User.findByIdAndUpdate(userId, { is_online: true, last_seen: new Date() }, { new: true })
        .then((updatedUser) => {
          if (updatedUser) {
            console.log(`User ${userId} is now online.`);
            socket.broadcast.emit('user_status_update', {
              userId: updatedUser._id.toString(),
              is_online: true,
              last_seen: updatedUser.last_seen,
            });
          }
        })
        .catch(err => console.error("Error setting online status:", err));
    } else {
      console.warn(`⚠️ Invalid userId format: ${userId}. Skipping database update.`);
    }
  }

  socket.on('join', (joinedUserId) => {
    users.set(joinedUserId, socket.id);
  });

  // ---------- TYPING INDICATORS ----------
  socket.on('typing', ({ userId, receiverId }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { userId });
    }
  });

  socket.on('stop_typing', ({ userId, receiverId }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stop_typing', { userId });
    }
  });

  // ---------- CHAT MESSAGES ----------
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, text } = data;

      const message = new Message({
        sender_id: senderId,
        receiver_id: receiverId,
        text,
      });
      await message.save();

      const transformedMessage = {
        id: message._id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        text: message.text,
        created_at: message.createdAt,
        updated_at: message.updatedAt,
      };

      const receiverSocketId = users.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', transformedMessage);
      }
      socket.emit('receive_message', transformedMessage);
    } catch (err) {
      console.error('❌ Error sending message:', err);
    }
  });

  // ---------- WEBRTC SIGNALING ----------

  // Caller sends offer to callee
  socket.on('call_user', ({ to, from, offer, callType }) => {
    const receiverSocketId = users.get(to);
    console.log(`📞 call_user from ${from} to ${to}`);
    console.log("👥 users map:", users);
    console.log("receiverSocketId:", receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming_call', {
        from,
        offer,
        callType,
      });
    }
  });

  // Callee accepts and sends answer back to caller
  socket.on('answer_call', ({ to, from, answer }) => {
    const callerSocketId = users.get(to);
    console.log(`✅ answer_call from ${from} to ${to}`);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_answered', {
        from,
        answer,
      });
    }
  });

  // ICE candidate exchange
  socket.on('ice_candidate', ({ to, from, candidate }) => {
    const peerSocketId = users.get(to);
    if (peerSocketId) {
      io.to(peerSocketId).emit('ice_candidate', {
        from,
        candidate,
      });
    }
  });

  // End call
  socket.on('end_call', ({ to, from }) => {
    const peerSocketId = users.get(to);
    console.log(`📴 end_call from ${from} to ${to}`);
    if (peerSocketId) {
      io.to(peerSocketId).emit('call_ended', { from });
    }
  });

  // ---------- DISCONNECT ----------
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

    if (
      disconnectedUserId &&
      typeof disconnectedUserId === 'string' &&
      disconnectedUserId.length === 24 &&
      mongoose.Types.ObjectId.isValid(disconnectedUserId)
    ) {
      try {
        const updatedUser = await User.findByIdAndUpdate(disconnectedUserId, {
          is_online: false,
          last_seen: new Date(),
        }, { new: true }).exec();

        if (updatedUser) {
          console.log(`User ${disconnectedUserId} is now offline.`);
          socket.broadcast.emit('user_status_update', {
            userId: updatedUser._id.toString(),
            is_online: false,
            last_seen: updatedUser.last_seen,
          });
        }
      } catch (err) {
        console.error("Error setting offline status:", err);
      }
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));