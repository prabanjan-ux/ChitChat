const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username email is_online last_seen')
      .sort({ username: 1 })
      .lean();
    
    // Transform _id to id for client compatibility
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      is_online: user.is_online,
      last_seen: user.last_seen
    }));
    
    res.json(transformedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'username email').lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Transform _id to id for client compatibility
    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
