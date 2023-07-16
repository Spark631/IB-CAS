const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    let name = socket.id;

    io.emit("chat message", name + " : " + msg);
  });
});

server.listen(5500, () => {
  console.log("listening on *:5500");
});
