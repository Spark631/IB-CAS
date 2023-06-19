const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var port = Number(process.env.port) || 1337;

let rooms = [
  { roomid: "1234", users: [] },
  { roomid: "5678", users: [] },
];

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/room.html", (req, res) => {
  const roomId = req.query.id; // Retrieve the unique ID from the query parameter
  res.render("room", { roomId });
});

io.on("connection", (socket) => {
  socket.on("join lobby", function (roomid) {
    let lobbyCheck = false;
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomid == roomid) {
        rooms[i].users.push(socket.id);
        console.log("User - " + socket.id + " has joined the room: " + roomid);
        lobbyCheck = true;
        break;
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
