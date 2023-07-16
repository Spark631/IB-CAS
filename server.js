const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
// Set up event handler for new socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Leave a room
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  // Handle chat messages
  socket.on('chatMessage', (room, message) => {
    // Broadcast the message to all sockets in the room
    socket.to(room).emit('chatMessage', message);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = 8083;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
