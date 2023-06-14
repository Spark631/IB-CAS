const express = require("express");
const http = require("http");
const socket = require("socket.io");

const port = process.env.PORT || 8083;

var app = express();
const server = http.createServer(app);
const io = socket(server);
var players;
var joined = true;

app.use(express.static(__dirname + "/"));

var games = Array(1000000);
for (let i = 0; i < 1000000; i++) {
  games[i] = { players: 0, pid: [0, 0] };
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  // console.log(players);
  var color;
  var playerId = Math.floor(Math.random() * 1000000 + 1);

  console.log(playerId + " connected");

  socket.on("joinedC", function (roomId) {
    // games[roomId] = {}
    if (games[roomId].players < 2) {
      games[roomId].players++;
      games[roomId].pid[games[roomId].players - 1] = playerId;
    } else {
      socket.emit("full", roomId);
      return;
    }

    console.log(games[roomId]);
    players = games[roomId].players;

    if (players % 2 == 0) color = "black";
    else color = "white";

    socket.emit("player", { playerId, players, color, roomId });
    // players--;
    if (players == 2) {
      color = "white";
      socket.broadcast.emit("player", { playerId, players, color, roomId });
    }
  });

  socket.on("moveC", function (msg) {
    socket.broadcast.emit("moveC", msg);
    // console.log(msg);
  });

  socket.on("sendtimecontrol", function (msg) {
    socket.broadcast.emit("sendtimecontrol", msg);
    // console.log(msg);
  });

  socket.on("play", function (msg) {
    socket.broadcast.emit("play", msg);
    console.log("ready " + msg);
  });

  socket.on("check", function (msg) {
    socket.broadcast.emit("check", msg);
  });

  socket.on("captured", function (msg) {
    socket.broadcast.emit("captured", msg);
  });

  socket.on("castled", function (msg) {
    socket.broadcast.emit("castled", msg);
  });

  socket.on("gameOver", function (msg) {
    socket.broadcast.emit("gameOver", msg);
    console.log("Game Over");
  });

  socket.on("disconnect", function () {
    var r;
    for (let i = 0; i < 1000000; i++) {
      if (games[i].pid[0] == playerId) {
        games[i].players--;
        games[i].pid[0] = 0;
        r = i;
      } else if (games[i].pid[1] == playerId) {
        games[i].players--;
        games[i].pid[1] = 0;
        r = i;
      }
    }

    console.log("test");
    console.log(playerId + " disconnected");
    console.log("r is " + r);
    if (r != undefined) {
      socket.broadcast.emit("nan", r);
      socket.broadcast.emit("player1", r);
    }
  });
});

server.listen(port);
console.log("Connected");
