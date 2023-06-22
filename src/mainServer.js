const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ejs = require("ejs");
const { Server } = require("socket.io");
const io = new Server(server);

var port = Number(process.env.port) || 1337;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/templates/homeScreen.html");
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
