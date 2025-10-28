const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email'],
      order: [['username', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
