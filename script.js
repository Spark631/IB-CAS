const socket = io();
const adjectives = ['Happy', 'Brave', 'Clever', 'Sunny', 'Kind', 'Playful', 'Witty', 'Gentle', 'Vibrant'];
const nouns = ['Cat', 'Dog', 'Bird', 'Sun', 'Moon', 'Flower', 'Star', 'Tree', 'Ocean'];
const table = document.getElementById('scoreboard');

function generateRandomUsername() {
const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
const noun = nouns[Math.floor(Math.random() * nouns.length)];
const number = Math.floor(Math.random() * 1000);

return adjective + noun + number;
}

function sortTable() {
const table = document.getElementById('pointTable');
const tbody = table.getElementsByTagName('tbody')[0];
const rows = Array.from(tbody.getElementsByTagName('tr'));

rows.sort((a, b) => {
const cellA = a.getElementsByTagName('td')[0].textContent;
const cellB = b.getElementsByTagName('td')[0].textContent;
return cellB - cellA;
});

rows.forEach(row => tbody.appendChild(row));
}

socket.on('usersInRoom', (users) => {
  users.forEach((user) => {
    table.innerHTML = users.map(user => `<tr><td>${user.score}</td><td>${user.username}</td></tr>`).join('');
    sortTable();
  });
});

let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = generateRandomUsername();
  localStorage.setItem('playerId', playerId);
  socket.emit('setPlayerId', playerId);
} else {
  socket.emit('setPlayerId', playerId);
}

function handleKeyPress(event) {
if (event.key === "Enter") {
  sendanswer(); // also update this
}
}

function buzzIn() {
  const room = document.getElementById('room-input').value;
  document.getElementById('answerFrame').innerHTML = '<input type="text" id="answer-input" onkeypress="handleKeyPress(event)" style="color: black;" placeholder="Type an answer" /> <div id="buzzer" onclick="sendanswer();"><b>Answer</b></div>'; // will need to change function name
  document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + playerId + '</b> buzzed in!</div>');
  socket.emit('buzzedIn', room);
}

function joinRoom() {
  const room = document.getElementById('room-input').value;
  socket.emit('joinRoom', room);
  document.getElementById('overlay').style.opacity = 0;
  document.getElementById('joinRoomBox').style.opacity = 0;
  document.getElementById('settings').innerHTML = "Room code: " + room; // update this with new website
  socket.emit('getUsersInRoom', room);
  document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + playerId + '</b> has joined the room!</div>');
  setTimeout(function() {
document.getElementById('overlay').style.display = "none";
  document.getElementById('joinRoomBox').style.display = "none";
}, 800);
}

function joinRandomRoom() {
  const room = Math.floor(Math.random() * 10000) + 1;
  socket.emit('joinRoom', room);
  document.getElementById('overlay').style.opacity = 0;
  document.getElementById('joinRoomBox').style.opacity = 0;
  document.getElementById('settings').innerHTML = "Room code: " + room; // update this with new website
  document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + playerId + '</b> has joined the room!</div>');
  setTimeout(function() {
document.getElementById('overlay').style.display = "none";
  document.getElementById('joinRoomBox').style.display = "none";
}, 800);
}

function updateScore(score) {
    socket.emit('updateScore', score);
}

function leaveRoom() {
  const room = document.getElementById('room-input').value;
  socket.emit('leaveRoom', room);
}

function writeQ() {
  const room = document.getElementById('room-input').value;
  socket.emit('writeQuestion', room, 200); // change the speed
}

function sendanswer() {
  const room = document.getElementById('room-input').value;
  const answer = document.getElementById('answer-input').value;
  socket.emit('chatanswer', room, answer);
  socket.emit('getUsersInRoom', room);
}

function kick() {
  const room = document.getElementById('room-input').value;
  socket.emit('kick', room);
}

socket.on('chatanswerReply', (grade) => {
  const room = document.getElementById('room-input').value;
  if (grade === "pass") {
    document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + playerId + '</b> answered correctly!</div>');
  } else if (grade === "prompt") {
    document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + playerId + '</b> was prompted!</div>');
    var promptAnswer = prompt("'" + document.getElementById('questionText').innerHTML + "'\n \nPrompt on " + document.getElementById('answer-input').value + ". Enter the correct answer below, then click OK.");
    socket.emit('scorePromptAnswer', room, promptAnswer);
  } else if (grade === "fail") {
    document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + playerId + '</b> was wrong.</div>');
  }
});

socket.on('votesNeeded', (numerator, denominator) => {
var roomLeader = document.getElementById('roomOwner').innerHTML;
document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity">' + numerator + '/' + denominator + ' votes received to kick <b>' + roomLeader + '</b></div>');
});

socket.on('refresh', (username) => {
playerId = generateRandomUsername();
  localStorage.setItem('playerId', playerId);
location.reload();
});

socket.on('userKicked', (username) => {
const room = document.getElementById('room-input').value;
socket.emit('getUsersInRoom', room);
document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> was kicked.</div>');
});

socket.on('userJoined', (username) => {
const room = document.getElementById('room-input').value;
socket.emit('getUsersInRoom', room);
document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> has joined the room!</div>');
});

socket.on('updateLeaderboard', (username) => {
const room = document.getElementById('room-input').value;
socket.emit('getUsersInRoom', room);
});

socket.on('userBuzzed', (username) => {
const room = document.getElementById('room-input').value;
document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> buzzed in!</div>');
});

socket.on('userLeft', (username) => {
const room = document.getElementById('room-input').value;
socket.emit('getUsersInRoom', room);
document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> returned to the abyss.</div>');
});

socket.on('increment', (word) => {
document.getElementById("writeButton").style.display = "none";
document.getElementById("questionText").innerHTML += word;
});

socket.on('roomLeader', (isRoomLeader, RoomLeader) => {
if (isRoomLeader) {
console.log('You are the room leader.');
} else {
console.log('The room leader is player:', RoomLeader);
document.getElementById("writeButton").style.display = "none";
}
document.getElementById("roomOwner").innerHTML = RoomLeader;
});

socket.on('roomLeaderTransferred', (RoomLeader) => {
if (RoomLeader == playerId) {
console.log('You are the room leader.');
document.getElementById("writeButton").style.display = "block";
} else {
console.log('The room leader is player:', RoomLeader);
document.getElementById("writeButton").style.display = "none";
}
document.getElementById("roomOwner").innerHTML = RoomLeader;
});

socket.on('chatanswer', (username, answer) => {
  
  if (answer === "pass") {
    document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> answered correctly!</div>');
  } else if (answer === "prompt") {
    document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> was prompted!</div>');
  } else if (answer === "fail") {
    document.getElementById('activityFrame').insertAdjacentHTML('afterbegin', '<div class="activity"><b>' + username + '</b> was wrong.</div>');
  }

  const room = document.getElementById('room-input').value;
  socket.emit('getUsersInRoom', room);
});