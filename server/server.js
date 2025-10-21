// --- 1. Import Dependencies ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const  User  = require('./models/user');
const  Message  = require('./models/message');
require('dotenv').config(); // Loads variables from .env file

const sequelize = require('./config/db'); // Import the database connection

// --- 2. Initialize the Application ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow our React client to connect
        methods: ["GET", "POST"]
    }
});

// --- 3. Middleware ---
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Allow the server to understand JSON data

// --- 4. Database Connection & Table Synchronization ---
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
        
        // This command checks the database and creates the tables
        // if they don't already exist. It's the equivalent of `db.create_all()`.
        sequelize.sync(); 
        
        console.log('All models were synchronized successfully.');
    })
    .catch(err => console.error('Unable to connect to the database:', err));


// --- 5. API Routes (Coming Soon) ---

const authRoutes = require('./routes/auth'); // Assuming auth.js is in a 'routes' folder
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Chat Server is Running!</h1><p>Database and models are synchronized.</p>');
});


// --- 6. Socket.IO Logic ---
io.on('connection', (socket) => {
    console.log('A user connected with socket ID:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId.toString());
        console.log(`User with ID ${userId} joined their room.`);
    });

    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        const { receiver_id } = data;
        io.to(receiver_id.toString()).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected with socket ID:', socket.id);
    });
});


// --- 7. Start the Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

