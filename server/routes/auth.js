const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Correctly import the User model

// This route handles new user registration
// It's the equivalent of your POST logic in the `auth()` function in app.py
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if a user with that email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // Create the new user. The 'beforeCreate' hook in the model will hash the password.
        const user = await User.create({ username, email, password });
        
        // Send a success response
        res.status(201).json({ message: "Registration successful! Please log in." });

    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// This route handles user login
// It's the equivalent of your `login()` function in app.py
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by their email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        // Use the method we will add to the model to check the password
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }
        
        // If credentials are correct, create a JSON Web Token (JWT)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET, // The secret key from our .env file
            { expiresIn: '1d' } // The token will be valid for 1 day
        );

        // Send the token and user info back to the client
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

module.exports = router;
