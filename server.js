const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { testAnswer } = require('./check');
const users = new Map();
const roomLeaders = {};
const players = {};
const roomVotes = {};
const playerSocket = {};

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

    if (playerSocket[playerId + room]){
      console.log("that username already exists");
      return;
    }

    players[socket.id] = playerId;
    playerSocket[playerId + room] = socket.id;
    roomVotes[room] = []
    // If there is no existing room leader for the room, assign the current socket as the room leader
    if (!roomLeaders[room]) {
      roomLeaders[room] = socket.id;
      socket.emit('roomLeader', true, playerId);
    } else {
      socket.emit('roomLeader', false, players[roomLeaders[room]]);
    }
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

  socket.on('kick', (room) => {
    const roomLeader = roomLeaders[room];
    const votes = roomVotes[room];
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (roomLeader != socket.id && !votes.includes(playerSocket[playerId+room])) {
      votes.push(playerSocket[playerId+room]);
      var value = (roomVotes[room].length)/(roomSize-1);
      if (value == 1) {
        console.log(players[roomLeader] + " voted out by " + playerId);
        socket.to(roomLeader).emit('refresh', players[roomLeader]);
        socket.to(room).emit('userKicked', players[roomLeader]);
        users.delete(roomLeader);
      } else {
        socket.emit('votesNeeded', (roomVotes[room].length), (roomSize-1));
        socket.to(room).emit('votesNeeded', (roomVotes[room].length), (roomSize-1));
      }
    }
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

socket.on('writeQuestion', (room, speed) => {
  if (roomLeaders[room] != socket.id) {
    console.log("permission denied, not room leader");
    return;
  }

let question = "The creation of this type of substance generally starts by putting atoms in a magneto-optical trap, immediately followed by an evaporative method. In attempting the first synthesis of this type of substance, Wolfgang Ketterle worked with sodium atoms, while contemporaneously Eric Cornell and Carl Wieman succeeded with rubidium atoms. Atoms in this type of substance are all at the lowest quantum level. For 10 points, name this 'fifth state of matter' in which atoms are";

const word = question.split(" ");
var readSpeed = speed;

var i = -1;
var interval = setInterval(increment, readSpeed);

function increment(){
  i = i + 1;
  if (i == word.length) {
     clearInterval(interval);
  } else {
     socket.emit('increment', word[i] + " ");
     socket.to(room).emit('increment', word[i] + " ");
  }
}
});

    socket.on('scorePromptAnswer', (room, answer) => {
      var answerGrade = testAnswer(answer, "Derek Steriods", "Donny Kronladge", "Red");
      if (answerGrade === "pass") {
        socket.to(room).emit('chatMessage', playerId, "pass");
        const user = Array.from(users.values()).find(user => user.playerId === playerId);
        if (user) {
          user.score+=10;
        }
        socket.emit('chatMessageReply', "pass");
        socket.emit('updateLeaderboard', playerId);
      } else if (answerGrade === "prompt") {
        socket.to(room).emit('chatMessage', playerId, "fail");
        const user = Array.from(users.values()).find(user => user.playerId === playerId);
        if (user) {
          user.score-=10;
        }
        socket.emit('chatMessageReply', "fail");
        socket.emit('updateLeaderboard', playerId);
      } else if (answerGrade === "fail") {
          console.log("Failed!");
          socket.to(room).emit('chatMessage', playerId, "fail");
          const user = Array.from(users.values()).find(user => user.playerId === playerId);
          if (user) {
            user.score-=10;
          }
          socket.emit('chatMessageReply', "fail");
          socket.emit('updateLeaderboard', playerId);
      }
  });

  // Handle chat messages
  socket.on('chatMessage', (room, message) => {
    var answerGrade = testAnswer(message, "Derek Steriods", "Donny Kronladge", "Red");
    if (answerGrade === "pass") {
      console.log("Passed!");
      socket.to(room).emit('chatMessage', playerId, "pass");
      const user = Array.from(users.values()).find(user => user.playerId === playerId);
      if (user) {
        user.score+=10;
        console.log(`Updated score for ${playerId} in room ${user.room}: ${user.score}`);
      }
      socket.emit('chatMessageReply', "pass");
    } else if (answerGrade === "prompt") {
      socket.to(room).emit('chatMessage', playerId, "prompt");
      console.log("Prompt!");
      socket.emit('chatMessageReply', "prompt");
    } else if (answerGrade === "fail") {
        console.log("Failed!");
        socket.to(room).emit('chatMessage', playerId, "fail");
        const user = Array.from(users.values()).find(user => user.playerId === playerId);
        if (user) {
          user.score-=10;
          console.log(`Updated score for ${playerId} in room ${user.room}: ${user.score}`);
        }
        socket.emit('chatMessageReply', "fail");
    }
  });

  // Handle disconnections NEED TO GIVE SOMEONE ELSE ROOM LEADER, make extra settings appear,
  socket.on('disconnect', () => {
    console.log('A user with id ' + playerId + ' disconnected');

    if(roomId) {
      var room = roomId;
      const roomLeader = roomLeaders[room];

      if (roomLeader == socket.id) {
        const room = Object.keys(roomLeaders).find(
          (key) => roomLeaders[key] === socket.id
        );
        delete roomLeaders[room];
        const socketsInRoom = io.sockets.adapter.rooms.get(room);
        if (socketsInRoom && socketsInRoom.size > 0) {
          const newLeader = Array.from(socketsInRoom)[0];
          roomLeaders[room] = newLeader;
          io.to(room).emit('roomLeaderTransferred', players[newLeader]);
          console.log("new leader is:" + players[newLeader]);
        }
      } else {
          io.to(room).emit('userLeft', playerId);
      }

      delete players[socket.id];
      delete playerSocket[playerId + room];
      roomVotes[room] = [];
    }
    try {
        users.delete(socket.id);
    } catch (error) {
        console.log("error: " + error);
    }
  });
});

// Start the server
const port = 8083;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
