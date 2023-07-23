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
const questionAnswered = {};
const playerSocket = {};
const fs = require('fs');
let randomQuestion = "";
const rawdata = fs.readFileSync('questions.json');
const triviaQuestions = JSON.parse(rawdata).questions;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
  return triviaQuestions[randomIndex];
}

// Set up event handler for new socket connections
io.on('connection', (socket) => {

  let roomId;
  let questionDoneSoFar = "";
  
  let playerId = socket.handshake.query.playerId;
   // Set player Id
   socket.on('setPlayerId', (newPlayerId) => {
        playerId = newPlayerId;
        console.log('User id set to ' + playerId);
  });

  console.log('User connected');

  socket.on('updateUsername', (enteredUsername, room) => {
    if (playerSocket[enteredUsername + room]){
      console.log("that username already exists");
      socket.emit('alertMessage', "That username already exists in this room. Try another.");
    } else {
      socket.emit('refresh', enteredUsername);
    }
  });

  // Join a room
  socket.on('joinRoom', (room) => {

    if (playerSocket[playerId + room]){
      console.log("that username already exists");
      socket.emit('refresh', "2938y482y23333333333333");
      return;
    }

    players[socket.id] = playerId;
    playerSocket[playerId + room] = socket.id;
    roomVotes[room] = [];
    questionAnswered[room] = 0;
    // If there is no existing room leader for the room, assign the current socket as the room leader
    if (!roomLeaders[room]) {
      roomLeaders[room] = socket.id;
      socket.emit('roomLeader', true, playerId, questionDoneSoFar);
    } else {
      socket.emit('roomLeader', false, players[roomLeaders[room]], questionDoneSoFar);
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

    socket.on('didNotAnswer', (room) => {
      socket.emit('userDidntAnswer', playerId);
      socket.to(room).emit('userDidntAnswer', playerId);
    });

  socket.on('kick', (room) => {
    const roomLeader = roomLeaders[room];
    const votes = roomVotes[room];
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (!(roomSize > 1)) {
      console.log("cant vote out self");
      socket.emit('alertMessage', "Kicking failed. Can not vote out self.");
      return;
    }

    if (roomLeader != socket.id && !votes.includes(playerSocket[playerId+room])) {
      votes.push(playerSocket[playerId+room]);
      var value = (roomVotes[room].length)/(roomSize-1);
      if (value == 1) {
        console.log(players[roomLeader] + " voted out by " + playerId);
        socket.to(roomLeader).emit('refresh', "2222222224dsfsdfsdfsdfs");
        socket.emit('userKicked', players[roomLeader]);
        socket.to(room).emit('userKicked', players[roomLeader]);
        users.delete(roomLeader);
      } else {
        socket.emit('votesNeeded', (roomVotes[room].length), (roomSize-1));
        socket.to(room).emit('votesNeeded', (roomVotes[room].length), (roomSize-1));
      }
    } else if (roomLeader == socket.id) {
      console.log("cant vote out self");
      socket.emit('alertMessage', "Kicking failed. Can not vote out self.");
    } else if (votes.includes(playerSocket[playerId+room])) {
      console.log("cant vote out self");
      socket.emit('alertMessage', "You have already voted.");
    }
  });

  socket.on('questionFinished', (room) => {
    const roomLeader = roomLeaders[room];
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    questionAnswered[room] += 1;
    var value = (questionAnswered[room])/(roomSize);
    console.log("Users who have answered: " + questionAnswered[room]);
    console.log("Users in room: " + roomSize);
    console.log("Value is " + value);
      if (value == 1) {
        socket.to(room).emit('readyForNextQuestion'); // to all rooms
        socket.emit('readyForNextQuestion');
        console.log("ready for next q");
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

  socket.on('questionFinishedAlert', (room) => {
    socket.to(room).emit('giveQuestionFinishedAlert');
  });


// Update user score
socket.on('updateScore', (room, score) => {
  if (score != 0) {
    return;
  }
  const user = Array.from(users.values()).find(user => user.playerId === playerId);
  if (user) {
    user.score = score;
    console.log(`Updated score for ${playerId} in room ${user.room}: ${score}`);
    socket.emit('alertMessage', "Score successfully set to zero.");
    const usersInRoom = Array.from(users.values())
    .filter(user => user.room === room)
    .map(user => ({ username: user.playerId, score: user.score }));
    socket.emit('usersInRoom', usersInRoom);
    socket.to(room).emit('usersInRoom', usersInRoom);
  }
});

socket.on('writeQuestion', (room, speed) => {
  if (roomLeaders[room] != socket.id) {
    console.log("permission denied, not room leader");
    return;
  }

  questionAnswered[room] = 0;
  console.log("Questions answered set to " + questionAnswered[room]);

  randomQuestion = getRandomQuestion();

let question = randomQuestion.question;
let subject = randomQuestion.subject;

socket.emit('updateSubject', subject, speed);
socket.to(room).emit('updateSubject', subject, speed);

socket.emit('clearQuestion', players[roomLeaders[room]]);
socket.to(room).emit('clearQuestion', players[roomLeaders[room]]);

const word = question.split(" ");
var readSpeed = speed;

var i = -1;
var interval = setInterval(increment, readSpeed);

function increment(){
  i = i + 1;
  if (i == word.length) {
     clearInterval(interval);
     socket.emit('questionDone');
     socket.to(room).emit('questionDone');
     questionDoneSoFar = "";
  } else {
     questionDoneSoFar += (word[i] + " "); 
     socket.emit('increment', word[i] + " ");
     socket.to(room).emit('increment', word[i] + " ");
  }
}
});

    socket.on('scorePromptAnswer', (room, answer) => {
      if (answer.length < 1) {
        answer = "222222222222222222222222222222222222222222222222222222222222";
      }
      var answerGrade = testAnswer(answer, ...randomQuestion.answers);
      if (answerGrade === "pass") {
        socket.to(room).emit('chatanswer', playerId, "pass");
        const user = Array.from(users.values()).find(user => user.playerId === playerId);
        if (user) {
          user.score+=10;
        }
        socket.emit('chatanswerReply', "pass");
        socket.emit('updateLeaderboard', playerId);
      } else if (answerGrade === "prompt") {
        socket.to(room).emit('chatanswer', playerId, "fail");
        socket.emit('chatanswerReply', "fail");
        socket.emit('updateLeaderboard', playerId);
      } else if (answerGrade === "fail") {
          console.log("Failed!");
          socket.to(room).emit('chatanswer', playerId, "fail");
          socket.emit('chatanswerReply', "fail");
          socket.emit('updateLeaderboard', playerId); // change this for after timer expires or all have answered.
      }
  });

  // Handle chat answers
  socket.on('chatanswer', (room, answer, points) => {
    var answerGrade = testAnswer(answer, ...randomQuestion.answers);
    console.log(randomQuestion.answers);
    if (answerGrade === "pass") {
      console.log("Passed!");
      socket.to(room).emit('chatanswer', playerId, "pass");
      const user = Array.from(users.values()).find(user => user.playerId === playerId);
      if (user) {
        user.score+=points;
        console.log(`Updated score for ${playerId} in room ${user.room}: ${user.score}`);
      }
      socket.emit('chatanswerReply', "pass");
    } else if (answerGrade === "prompt") {
      socket.to(room).emit('chatanswer', playerId, "prompt");
      console.log("Prompt!");
      socket.emit('chatanswerReply', "prompt");
    } else if (answerGrade === "fail") {
        console.log("Failed!");
        socket.to(room).emit('chatanswer', playerId, "fail");
        socket.emit('chatanswerReply', "fail");
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
          io.to(room).emit('userLeft', playerId);
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
