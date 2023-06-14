const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var port = Number(process.env.port) || 1337;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("join lobby", function (roomid) {
    socket.join(roomid);
    console.log("we have joined the room?");
    console.log("This is the roomid" + roomid);

    //send to client

    const rooms = io.sockets.adapter.rooms;
    if (rooms.has(roomid) && rooms.get(roomid).has(socket.id)) {
      console.log("User is in the room: " + roomid);
    } else {
      console.log("User is not in the room: " + roomid);
    }
  });

  socket.on("check room", function (roomid) {
    console.log("checking room");
    console.log(roomid);
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
