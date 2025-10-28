const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// --- REGISTER ---
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // --- Check if email already exists ---
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // --- Check if username already exists ---
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // --- Create new user ---
    const newUser = await User.create({ username, email, password });

    // --- Auto-login after registration ---
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // --- Send success response with token ---
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isValid = await user.isValidPassword(password);
    if (!isValid) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login Route Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

module.exports = router;
