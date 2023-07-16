const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ejs = require("ejs");
const { Server } = require("socket.io");
const io = new Server(server);
const session = require("express-session");
const sessionMiddleware = session({
  secret: "maowmaowmoaw",
  resave: true,
  saveUninitialized: true,
});

var port = Number(process.env.port) || 1337;

let rooms = [
  { roomid: "1234", users: [] },
  { roomid: "5678", users: [] },
];

app.use(sessionMiddleware);
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/room.html", (req, res) => {
  const roomId = req.query.id; // Retrieve the unique ID from the query parameter
  res.render("room", { roomId });
});

app.get("/lobby", (req, res) => {
  const lobbyName = req.query.id;
  console.log(lobbyName);
  // res.render("create-lobby", { roomId });
  // res.sendFile(__dirname + "/create-lobby.html");
  // res.redirect("/lobby.html");
  res.sendFile(__dirname + "/lobby.html", {
    headers: {
      "lobby-name": lobbyName,
    },
  });
});

io.on("connection", (socket) => {
  // socket.request.session.socketId = socket.id;
  // socket.request.session.save();

  socket.on("join lobby", function (roomid) {
    let lobbyCheck = false;
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomid == roomid) {
        rooms[i].users.push(socket.id);
        console.log("User - " + socket.id + " has joined the room: " + roomid);
        lobbyCheck = true;
        break;
      }
      for (let i = 0; i < rooms.length; i++) {
        console.log("In total in this room " + rooms[i].roomid);
        for (let j = 0; j < rooms[i].users.length; j++) {
          console.log("-----" + rooms[i].users[j]);
        }
      }
    }

    if (lobbyCheck == false) {
      console.log("Room does not exist");
      return;
    }

    socket.join(roomid);
    console.log("This is the roomid" + roomid);

    // const rooms = io.sockets.adapter.rooms;
    // if (rooms.has(roomid) && rooms.get(roomid).has(socket.id)) {
    //   console.log("User is in the room: " + roomid);
    // } else {
    //   console.log("User is not in the room: " + roomid);
    // }
  });

  socket.on("chat message", (msg, clientID) => {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].users.includes(clientID)) {
        io.to(rooms[i].roomid).emit("chat message", msg);
      }
    }
  });

  socket.on("check room", function (roomid) {
    console.log("checking room");
    console.log(roomid);
  });

  socket.on("create room", function (roomid) {
    let temp = { roomid: roomid, users: [socket.id] };
    rooms.push(temp);
    socket.join(roomid);
    socket.emit("room created", roomid);
    for (let i = 0; i < rooms.length; i++) {
      console.log(rooms[i].roomid);
      for (let j = 0; j < rooms[i].users.length; j++) {
        console.log("-----" + rooms[i].users[j]);
      }
    }
  });

  socket.on("bye", (arg) => {
    console.log(arg + " has meowmeowmoewmoew");
  });

  socket.on("disconnect", () => {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].users.includes(socket.id)) {
        rooms[i].users.splice(rooms[i].users.indexOf(socket.id), 1);
        console.log(
          "User - " + socket.id + " has left the room: " + rooms[i].roomid
        );
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
