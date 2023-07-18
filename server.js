const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { testAnswer } = require('./check');
const users = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

// Set up event handler for new socket connections
io.on('connection', (socket) => {

  let roomId;
  
  let playerId = socket.handshake.query.playerId;
   // Set player Id
   socket.on('setPlayerId', (newPlayerId) => {
        playerId = newPlayerId;
        console.log('User id set to ' + playerId);
  });

  console.log('User connected');

  // Join a room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    users.set(socket.id, { playerId, room, score: 0 });
    console.log('User with id ' + playerId + ' joined room ' + room);
    socket.to(room).emit('userJoined', playerId);
    roomId = room;
  });

  // Buzzed in
  socket.on('buzzedIn', (room) => {
    console.log('User with id ' + playerId + ' buzzed in room ' + room);
    socket.to(room).emit('userBuzzed', playerId);
  });

  // Get users in a room
  socket.on('getUsersInRoom', (room) => {
    const usersInRoom = Array.from(users.values())
      .filter(user => user.room === room)
      .map(user => ({ username: user.playerId, score: user.score }));
    console.log(`Users in room ${room}:`, usersInRoom);
    socket.emit('usersInRoom', usersInRoom);
  });

// Update user score
socket.on('updateScore', (score) => { // also need to save scores in local storage (which can be edited lmao but im lazy)
  const user = Array.from(users.values()).find(user => user.playerId === playerId);
  if (user) {
    user.score = score;
    console.log(`Updated score for ${playerId} in room ${user.room}: ${score}`);
  }
});

  // Leave a room
  socket.on('leaveRoom', (room) => {
    socket.to(room).emit('userLeft', playerId);
    socket.leave(room);
    console.log(`User left room: ${room}`);
    users.delete(socket.id);
  });

  // Handle chat messages
  socket.on('chatMessage', (room, message) => {
    var answerGrade = testAnswer(message, "Derek Steriods", "Donny Kronladge", "Noah Pielmier");
    if (answerGrade === "pass") {
      console.log("Passed!");
      const user = Array.from(users.values()).find(user => user.playerId === playerId);
  if (user) {
    user.score+=10;
    console.log(`Updated score for ${playerId} in room ${user.room}: ${user.score}`);
  }
    } else if (answerGrade === "prompt") {
        console.log("Prompt!");
    } else if (answerGrade === "fail") {
        console.log("Failed!");
        const user = Array.from(users.values()).find(user => user.playerId === playerId);
  if (user) {
    user.score-=10;
    console.log(`Updated score for ${playerId} in room ${user.room}: ${user.score}`);
  }
    }

    // Broadcast the message to all sockets in the room
    socket.to(room).emit('chatMessage', message);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user with id ' + playerId + ' disconnected');
    if (roomId) {
      const { playerId } = users.get(socket.id);
      io.to(roomId).emit('userLeft', playerId);
      users.delete(socket.id);
    }
  });
});

// Start the server
const port = 8083;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
