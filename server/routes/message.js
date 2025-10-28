const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Message = require('../models/message');

// SEND MESSAGE
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const message = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET MESSAGES BETWEEN TWO USERS
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      },
      order: [['timestamp', 'ASC']],
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
