const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ejs = require("ejs");
const { Server } = require("socket.io");
const io = new Server(server);
const crypto = require("crypto");
var port = Number(process.env.port) || 1337;

const socketToToken = new Map();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/templates/homeScreen.html");
});

let rooms = [{ roomid: "1234", owner: "", users: [] }];

app.get("/lobby", (req, res) => {
  const lobbyName = req.query.id;
  const token = socketToToken.get(req.query.user);

  console.log("Lobby Name:", lobbyName);
  console.log("Tokensss:", token);

  res.set("lobby-name", lobbyName);
  res.set("socket-id", token);

  res.sendFile(__dirname + "/templates/lobby.html");

  // res.sendFile(__dirname + "/templates/lobby.html", {
  //   headers: {
  //     "lobby-name": lobbyName,
  //     "socket-id": token,
  //   },
  // });
});

app.get("/info", (req, res) => {
  const tokenHash = req.query.id;
  const token = socketToToken.get(tokenHash);
  res.send(token);
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});

io.on("connection", (socket) => {
  socket.on("create lobby", (data) => {
    const secretKey = crypto.randomBytes(8).toString("hex");
    console.log("Secret Key:", secretKey);
    console.log("This is your og socketid: " + socket.id);
    socketToToken.set(secretKey, socket.id);

    rooms.push({ roomid: data, owner: socket.id, users: [] });
    io.emit("lobby created", secretKey);
  });
});
