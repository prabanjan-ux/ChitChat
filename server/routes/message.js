const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// ✅ SEND MESSAGE
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // create new message in MongoDB
    const message = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      text,
    });

    // Transform for client compatibility
    const transformedMessage = {
      id: message._id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      text: message.text,
      created_at: message.createdAt,
      updated_at: message.updatedAt
    };

    res.status(201).json(transformedMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET MESSAGES BETWEEN TWO USERS
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId },
      ],
    })
    .sort({ createdAt: 1 })
    .lean(); // ASC order by time

    // Transform for client compatibility
    const transformedMessages = messages.map(msg => ({
      id: msg._id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      text: msg.text,
      created_at: msg.createdAt,
      updated_at: msg.updatedAt
    }));

    res.json(transformedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
