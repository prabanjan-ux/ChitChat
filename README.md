# ChitChat

ChitChat is a full-stack MERN chat application built with React, Node.js, Express, MongoDB, and Socket.IO. It delivers real-time messaging, user status updates, and a WebRTC-based audio/video calling experience optimized for modern web usage.

## Features

- Real-time chat between users
- User authentication and session persistence
- Online/offline presence status
- Typing indicators
- WebRTC audio and video calling
- Message history storage with MongoDB
- Responsive React UI with dark mode support

## Tech Stack

- Frontend: React, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB, Mongoose
- Authentication: JWT (JSON Web Tokens)
- Deployment tools: Create React App production build

## Folder Structure

```text
ChitChat/
├── client/                 # React frontend
│   ├── public/             # Static public files
│   ├── src/                # React source code
│   ├── package.json        # Client dependencies and scripts
│   └── .env               # Client environment variables
├── server/                 # Express backend
│   ├── config/             # Database and configuration files
│   ├── models/             # Mongoose models (User, Message)
│   ├── routes/             # REST API routes
│   ├── server.js           # HTTP and Socket.IO server entry point
│   ├── package.json        # Server dependencies and scripts
│   └── .env               # Server environment variables
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or via a managed service
- A code editor such as VS Code
- Basic knowledge of React and Express

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ChitChat.git
   cd ChitChat
   ```

2. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:

   ```bash
   cd ../client
   npm install
   ```

## Environment Variables

Create `.env` files in both `server/` and `client/`.

### Server `.env`

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/ChitChat
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

### Client `.env`

```bash
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Running the Application Locally

Start the backend server:

```bash
cd server
npm start
```

Start the React frontend:

```bash
cd client
npm start
```

Open the app in your browser at:

```text
http://localhost:3000
```

## Available Scripts

### Server

- `npm start` — Start the backend server.

### Client

- `npm start` — Start the React development server.
- `npm run build` — Create a production build for deployment.
- `npm test` — Run client tests.

## API Overview

### Auth Routes

- `POST /api/auth/register` — Register a new user.
- `POST /api/auth/login` — Authenticate an existing user.

### User Routes

- `GET /api/users` — Retrieve all users.
- `GET /api/users/:id` — Retrieve a single user profile.

### Message Routes

- `GET /api/messages/:senderId/:receiverId` — Get conversation history between two users.
- `POST /api/messages` — Send a new message.

### WebSocket Events

- `send_message` — Send a chat message.
- `receive_message` — Receive a chat message.
- `typing` / `stop_typing` — Typing indicators.
- `call_user` — Initiate an audio/video call.
- `incoming_call` — Receive an incoming call notification.
- `answer_call` — Send a call answer.
- `ice_candidate` — Exchange WebRTC ICE candidates.
- `end_call` — End the active call.

## Screenshots

> Add your app screenshots here after capture.

- `screenshots/chat-screen.png`
- `screenshots/video-call.png`
- `screenshots/login-screen.png`

## Deployment

1. Build the React app:

   ```bash
   cd client
   npm run build
   ```

2. Deploy the `client/build` folder and the `server/` API to your hosting provider.
3. Configure `REACT_APP_BACKEND_URL` to your production backend URL.
4. Configure `CLIENT_URL` and `MONGO_URI` for the production server.

## Future Enhancements

- Group chat support
- File and image sharing
- Push notifications
- Improved call UI with user avatars and call duration
- End-to-end encryption for messages and calls
- Better mobile responsiveness

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add feature"
4. Push to your branch: `git push origin feature/your-feature`
5. Create a pull request.

## License

This project is open source and available under the MIT License.
