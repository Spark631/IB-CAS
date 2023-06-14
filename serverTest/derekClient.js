game = new Chess();
var socket = io();

var color = "white";
var players;
var roomId;
var rn = roomId;
var play = true;
var gameOn = false;
var playerType;

var room = document.getElementById("room");
var roomNumber = document.getElementById("roomNumbers");
var state = document.getElementById("state");
var board = document.getElementById("board");

socket.on("full", function (msg) {
  if (roomId == msg) window.location.replace("/spectate.php");
});

socket.on("sendtimecontrol", function (msg) {
  if (msg.room == roomId) seconds = msg.t * 60;
  document.getElementById("timeopp").innerHTML = format(seconds);
  document.getElementById("timeme").innerHTML = format(seconds);
  document.getElementById("secondsme").innerHTML = seconds;
  document.getElementById("secondsopp").innerHTML = seconds;
  if (msg.t == null) {
    stoptheclock();
    document.getElementById("timeopp").innerHTML = "∞";
    document.getElementById("timeme").innerHTML = "∞";
    document.getElementById("secondsme").innerHTML = "∞";
    document.getElementById("secondsopp").innerHTML = "∞";
  }
});

var connect = function () {
  roomId = room.value;
  if (roomId !== "" && parseInt(roomId) <= 1000000) {
    room.remove();
    roomNumber.innerHTML = "";
    socket.emit("joinedC", roomId);
  }
};

socket.on("play", function (msg) {
  if (msg == roomId) {
    play = false;
    state.style.opacity = "0";
    setTimeout(function () {
      state.innerHTML = "";
    }, 1000);
    var seconds = document.getElementById("secondsme").innerHTML;
    var minutes = seconds / 60;
    if (playerType == "1") {
      socket.emit("sendtimecontrol", { t: minutes, room: roomId });
    }
    if (playerType == "2") {
      document.getElementById("fliptimer").innerHTML =
        "<style>#whitepiecescaptured {display: inline-block !important;} #blackpiecescaptured {display: inline-block !important;} #timeme {position: absolute; top: -3em; opacity: 1 !important;} #timeopp{position: absolute; bottom: -3.14em; opacity: 1 !important;} #blackpiecescaptured {position: absolute !important; top: -3em !important; left: 6.7em !important;} #whitepiecescaptured {position: absolute; bottom: -3.14em; left: 6.7em;} #resign{display: inline-block !important; opacity: 1 !important;} #offerdraw{display: inline-block !important; opacity: 1 !important;}</style>";
    }
    if (playerType == "1") {
      document.getElementById("fliptimer").innerHTML =
        "<style>#whitepiecescaptured {display: inline-block !important;} #blackpiecescaptured {display: inline-block !important;} #timeopp {position: absolute; top: -3em; opacity: 1 !important;} #timeme{position: absolute; bottom: -3.14em; opacity: 1 !important;} #whitepiecescaptured {position: absolute !important; top: -3em !important; left: 6.7em !important;} #blackpiecescaptured {position: absolute; bottom: -3.14em; left: 6.7em;} #resign{display: inline-block !important; opacity: 1 !important;} #offerdraw{display: inline-block !important; opacity: 1 !important;}</style>";
    }
  }
  // console.log(msg)
});

function beforesubmit() {
  document.getElementById("pgn").value = game.pgn();
  console.log(game.pgn());
  document.getElementById("fen").value = game.fen();
  console.log(game.fen());
}

function winloss() {
  setInterval(function () {
    function get_captured_pieces(game, color) {
      const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };

      for (const move of game.history({ verbose: true })) {
        if (move.hasOwnProperty("captured") && move.color !== color[0]) {
          captured[move.captured]++;
        }
      }

      return captured;
    }

    wp = get_captured_pieces(game, "white");

    wcapturedp = wp.p;
    wcapturedn = wp.n;
    wcapturedb = wp.b;
    wcapturedr = wp.r;
    wcapturedq = wp.q;

    bp = get_captured_pieces(game, "black");

    bcapturedp = bp.p;
    bcapturedn = bp.n;
    bcapturedb = bp.b;
    bcapturedr = bp.r;
    bcapturedq = bp.q;

    document.getElementById("whitepiecescaptured").innerHTML = "";
    document.getElementById("blackpiecescaptured").innerHTML = "";

    function repeat(func, times) {
      func();
      times && --times && repeat(func, times);
    }

    if (wcapturedp != "0") {
      repeat(function () {
        document.getElementById("whitepiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/wP.png" style="width: 15px;height: 15px;">';
      }, wcapturedp);
    }
    if (bcapturedp != "0") {
      repeat(function () {
        document.getElementById("blackpiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/bP.png" style="width: 15px;height: 15px;">';
      }, bcapturedp);
    }

    if (wcapturedn != "0") {
      repeat(function () {
        document.getElementById("whitepiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/wN.png" style="width: 15px;height: 15px;">';
      }, wcapturedn);
    }
    if (bcapturedn != "0") {
      repeat(function () {
        document.getElementById("blackpiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/bN.png" style="width: 15px;height: 15px;">';
      }, bcapturedn);
    }

    if (wcapturedb != "0") {
      repeat(function () {
        document.getElementById("whitepiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/wB.png" style="width: 15px;height: 15px;">';
      }, wcapturedb);
    }
    if (bcapturedb != "0") {
      repeat(function () {
        document.getElementById("blackpiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/bB.png" style="width: 15px;height: 15px;">';
      }, bcapturedb);
    }

    if (wcapturedr != "0") {
      repeat(function () {
        document.getElementById("whitepiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/wR.png" style="width: 15px;height: 15px;">';
      }, wcapturedr);
    }
    if (bcapturedr != "0") {
      repeat(function () {
        document.getElementById("blackpiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/bR.png" style="width: 15px;height: 15px;">';
      }, bcapturedr);
    }

    if (wcapturedq != "0") {
      repeat(function () {
        document.getElementById("whitepiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/wQ.png" style="width: 15px;height: 15px;">';
      }, wcapturedq);
    }
    if (bcapturedq != "0") {
      repeat(function () {
        document.getElementById("blackpiecescaptured").innerHTML +=
          '<img src="img/chesspieces/wikipedia/bQ.png" style="width: 15px;height: 15px;">';
      }, bcapturedq);
    }

    const get_piece_positions = (game, piece) => {
      return []
        .concat(...game.board())
        .map((p, index) => {
          if (p !== null && p.type === piece.type && p.color === piece.color) {
            return index;
          }
        })
        .filter(Number.isInteger)
        .map((piece_index) => {
          const row = "abcdefgh"[piece_index % 8];
          const column = Math.ceil((64 - piece_index) / 8);
          return row + column;
        });
    };
    if (game.in_check()) {
      var kinglocarray = get_piece_positions(game, {
          type: "k",
          color: game.turn(),
        }),
        kingloc = kinglocarray[0];
      document
        .getElementsByClassName("square-" + kingloc)[0]
        .classList.add("checkhighlight");
    } else {
      var kinglocarray = get_piece_positions(game, { type: "k", color: "b" }),
        kingloc = kinglocarray[0];
      document
        .getElementsByClassName("square-" + kingloc)[0]
        .classList.remove("checkhighlight");
      var kinglocarrayw = get_piece_positions(game, { type: "k", color: "w" }),
        kinglocw = kinglocarrayw[0];
      document
        .getElementsByClassName("square-" + kinglocw)[0]
        .classList.remove("checkhighlight");

      document
        .getElementsByClassName("square-a8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h8")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h7")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h6")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h5")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h4")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h3")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h2")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-a1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-b1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-c1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-d1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-e1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-f1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-g1")[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-h1")[0]
        .classList.remove("checkhighlight");
    }

    if (playerType == "2") {
      checkforwinbytime = document.getElementById("timeme").innerHTML;
      checkforlossbytime = document.getElementById("timeopp").innerHTML;
      if (checkforwinbytime == "0:00") {
        beforesubmit();
        document.getElementById("winorloss").action =
          "https://www.chess.gq/w/time.php";
        document.getElementById("winorloss").submit();

        //window.location.replace('/w/time.php');
        console.log("You Won By Time");
        var audio = new Audio("resignation.wav");
        audio.play();
      }
      if (checkforlossbytime == "0:00") {
        beforesubmit();
        document.getElementById("winorloss").action =
          "https://www.chess.gq/l/time.php";
        document.getElementById("winorloss").submit();

        //window.location.replace('/l/time.php');
        console.log("You Lost By Time");
        var audio = new Audio("resignation.wav");
        audio.play();
      }
    }
    if (playerType == "1") {
      checkforwinbytime = document.getElementById("timeopp").innerHTML;
      checkforlossbytime = document.getElementById("timeme").innerHTML;
      if (checkforwinbytime == "0:00") {
        beforesubmit();
        document.getElementById("winorloss").action =
          "https://www.chess.gq/w/time.php";
        document.getElementById("winorloss").submit();

        //window.location.replace('/w/time.php');
        console.log("You Won By Time");
        var audio = new Audio("resignation.wav");
        audio.play();
      }
      if (checkforlossbytime == "0:00") {
        beforesubmit();
        document.getElementById("winorloss").action =
          "https://www.chess.gq/l/time.php";
        document.getElementById("winorloss").submit();

        //window.location.replace('/l/time.php');
        console.log("You Lost By Time");
        var audio = new Audio("resignation.wav");
        audio.play();
      }
    }
  }, 200);
}

function startmovetimers() {
  setInterval(function () {
    if (game.turn() == "b") {
      checkb = document.getElementById("stopme").innerHTML;
      if (checkb == "") {
        document.getElementById("stopopp").innerHTML = "";
        document.getElementById("stopme").innerHTML = "stop";
        document.getElementById("turn").innerHTML =
          "<style>#timeopp {background-color: #276683 !important; color: white !important}'</style>";
      } else {
        return;
      }
    }
    if (game.turn() == "w") {
      checkw = document.getElementById("stopopp").innerHTML;
      if (checkw == "") {
        document.getElementById("stopme").innerHTML = "";
        document.getElementById("stopopp").innerHTML = "stop";
        document.getElementById("turn").innerHTML =
          "<style>#timeme {background-color: #276683 !important; color: white !important}'</style>";
      } else {
        return;
      }
    }
  }, 10);
}

socket.on("moveC", function (msg) {
  if (msg.room == roomId) {
    game.move(msg.move);
    var audio = new Audio("move.wav");
    audio.play();
    board.position(game.fen());
    timersstarted = document.getElementById("timersstarted").innerHTML;
    if (timersstarted != "started") {
      startmovetimers(); // this is why
      console.log("started");
      countdownopp();
      countdownme();
      winloss();
      document.getElementById("timersstarted").innerHTML = "started";
      const get_piece_positions = (game, piece) => {
        return []
          .concat(...game.board())
          .map((p, index) => {
            if (
              p !== null &&
              p.type === piece.type &&
              p.color === piece.color
            ) {
              return index;
            }
          })
          .filter(Number.isInteger)
          .map((piece_index) => {
            const row = "abcdefgh"[piece_index % 8];
            const column = Math.ceil((64 - piece_index) / 8);
            return row + column;
          });
      };

      var kinglocarray = get_piece_positions(game, { type: "k", color: "b" }),
        kingloc = kinglocarray[0];
      document
        .getElementsByClassName("square-" + kingloc)[0]
        .classList.remove("checkhighlight");
      var kinglocarrayw = get_piece_positions(game, { type: "k", color: "w" }),
        kinglocw = kinglocarrayw[0];
      document
        .getElementsByClassName("square-" + kinglocw)[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-" + msg.sourcefor)[0]
        .classList.remove("checkhighlight");
      document
        .getElementsByClassName("square-" + msg.targetfor)[0]
        .classList.remove("checkhighlight");
      document.getElementsByClassName("square-" + msg.targetfor)[0].innerHTML =
        "";
    }
  }
});

socket.on("gameOver", function (msg) {
  if (msg.room == roomId) {
    document.getElementById("notif").innerHTML = "Game Over!";
    var audio = new Audio("loss.wav");
    audio.play();
    state.innerHTML = "GAME OVER";
    gameOn = false;
    beforesubmit();
    document.getElementById("winorloss").action =
      "https://www.chess.gq/l/" + msg.reasonlost + ".php";
    document.getElementById("winorloss").submit();
    //window.location.replace('/l/' + msg.reasonlost + '.php');
  }
});

socket.on("check", function (msg) {
  if (msg.room == roomId && msg.checkfrom != game.turn()) {
    document.getElementById("notif").innerHTML = "Check!";
    checkalert();
    var audio = new Audio("check.wav");
    audio.play();
  }
});

socket.on("captured", function (msg) {
  if (msg.room == roomId) {
    if (typeof msg.moo != "undefined") {
      var audio = new Audio("capture.mp3");
      audio.play();
    }
  }
});

socket.on("castled", function (msg) {
  if (msg.room == roomId) {
    if (msg.moo != "n" && msg.moo != "b" && msg.moo != "e" && msg.moo != "c") {
      var audio = new Audio("castle.wav");
      audio.play();
      //--or promotion
    }
  }
});

socket.on("player1", function (roomId) {
  if (roomId == rn) {
    playerType = "1";
    console.log("player:" + playerType);
  }
});

socket.on("player2", function (roomId) {
  if (roomId == rn) {
    playerType = "2";
    console.log("player:" + playerType);
  }
});
socket.on("nan", function (r) {
  if (r == roomId) {
    state.innerHTML = "LEFT";
    gameOn = false;
    console.log("nan received");
    console.log(gameOn);
    beforesubmit();
    document.getElementById("winorloss").action =
      "https://www.chess.gq/w/resignation.php";
    document.getElementById("winorloss").submit();
    //window.location.replace('/w/resignation.php');
    var audio = new Audio("resignation.wav");
    audio.play();
  }
});

var removeGreySquares = function () {
  $("#board .square-55d63").css("background", "");
};

var greySquare = function (square) {
  var squareEl = $("#board .square-" + square);

  var background = "#a9a9a9";
  if (squareEl.hasClass("black-3c85d") === true) {
    background = "#696969";
  }

  squareEl.css("background", background);
};

var onDragStart = function (source, piece) {
  // do not pick up pieces if the game is over
  // or if it's not that side's turn
  if (
    game.game_over() === true ||
    play ||
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1) ||
    (game.turn() === "w" && color === "black") ||
    (game.turn() === "b" && color === "white")
  ) {
    return false;
  }
  // console.log({play, players});
};

var onDrop = function (source, target) {
  removeGreySquares();

  fromindex = document.getElementById("currentfen").innerHTML;
  const chess = Chess(fromindex);
  var array = source.split(""),
    optiontwo = array[0];
  var arrayt = target.split(""),
    rank = arrayt[1];
  optionthree =
    optiontwo.substring(0, optiontwo.length - 1) +
    String.fromCharCode(optiontwo.charCodeAt(optiontwo.length - 1) + 1);
  optionone =
    optiontwo.substring(0, optiontwo.length - 1) +
    String.fromCharCode(optiontwo.charCodeAt(optiontwo.length - 1) - 1);

  argone = optionone + rank;
  argtwo = optiontwo + rank;
  argthree = optionthree + rank;

  if (target == argone) {
    var mustbe = argone;
  } else {
    if (target == argtwo) {
      var mustbe = "no";
    }
    if (target == argthree) {
      var mustbe = argthree;
    } else {
    }
  }

  if (
    (target.includes("8") &&
      source.includes("7") &&
      playerType == "1" &&
      chess.get(target) == null) ||
    (target.includes("8") &&
      source.includes("7") &&
      playerType == "1" &&
      chess.get(source).type == "p" &&
      chess.get(target).type.length > 0 == true &&
      chess.get(target).color == "b" &&
      target.includes(mustbe))
  ) {
    document.getElementsByClassName("square-" + source)[0].innerHTML =
      "<div style='height: 500px;'></div>";
    document.getElementById("promotionoptions").classList.add("down");
    document.getElementById("container").classList.add("boardblur");

    function pollDOM() {
      const el = document.getElementById("piecetopromoteto").innerHTML;

      if (el.length > 0) {
        0;

        var pieceforpromotion =
          document.getElementById("piecetopromoteto").innerHTML;

        if (pieceforpromotion.includes("q") == true) {
          var move = game.move({
            from: source,
            to: target,
            promotion: "q",
          });
          document.getElementById("promotionoptions").classList.remove("down");
          document.getElementById("container").classList.remove("boardblur");
          document.getElementById("piecetopromoteto").innerHTML = "";
          if (game.game_over()) {
            var audio = new Audio("win.wav");
            audio.play();
            state.innerHTML = "GAME OVER";
            gameOn = false;
            if (game.in_checkmate()) {
              var reasonopplost = "checkmate";
            }
            if (game.in_draw()) {
              var reasonopplost = "draw";
            }
            if (game.in_stalemate()) {
              var reasonopplost = "stalemate";
            }
            if (game.in_threefold_repetition()) {
              var reasonopplost = "threefoldrepetition";
            }
            if (game.insufficient_material()) {
              var reasonopplost = "insufficient";
            }
            socket.emit("gameOver", {
              room: roomId,
              reasonlost: reasonopplost,
            });
            beforesubmit();
            document.getElementById("winorloss").action =
              "https://www.chess.gq/w/" + reasonopplost + ".php";
            document.getElementById("winorloss").submit();
            //window.location.replace('/w/' + reasonopplost + '.php');
          }

          if (game.in_check()) {
            against = game.turn();
            //error sound?
            socket.emit("check", { room: roomId, checkfrom: against });
          }

          // illegal move
          if (move === null) {
            return "snapback";
          } else
            socket.emit("moveC", {
              addthis: "q",
              move: move,
              board: game.fen(),
              room: roomId,
            });
          console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
          document.getElementById("pgn").value = game.pgn({
            max_width: 5,
            newline_char: "<br>",
          });
          console.log(game.fen());
          document
            .getElementsByClassName("square-" + source)[0]
            .classList.remove("checkhighlight");
          document.getElementById("currentfen").innerHTML = game.fen();
          document.getElementById("fen").value = game.fen();
          document.getElementsByClassName("square-" + target)[0].innerHTML =
            '<img src="img/chesspieces/wikipedia/wQ.png" alt="" class="piece-417db" data-piece="wQ" style="width: 100%;height: 100%;">';
          if (move.flags.includes("p") == false) {
            var audio = new Audio("move.wav");
            audio.play();
          }
          if (typeof move.captured != "undefined") {
            var audio = new Audio("capture.mp3");
            audio.play();
            socket.emit("captured", { room: roomId, moo: move.captured });
          }
          if (
            move.flags != "n" &&
            move.flags != "b" &&
            move.flags != "e" &&
            move.flags != "c"
          ) {
            var audio = new Audio("castle.wav");
            audio.play();
            socket.emit("castled", { room: roomId, moo: move.flags });
            //--or promotion
          }
        }

        if (pieceforpromotion.includes("r") == true) {
          var move = game.move({
            from: source,
            to: target,
            promotion: "r",
          });
          document.getElementById("promotionoptions").classList.remove("down");
          document.getElementById("container").classList.remove("boardblur");
          document.getElementById("piecetopromoteto").innerHTML = "";
          if (game.game_over()) {
            var audio = new Audio("win.wav");
            audio.play();
            state.innerHTML = "GAME OVER";
            gameOn = false;
            if (game.in_checkmate()) {
              var reasonopplost = "checkmate";
            }
            if (game.in_draw()) {
              var reasonopplost = "draw";
            }
            if (game.in_stalemate()) {
              var reasonopplost = "stalemate";
            }
            if (game.in_threefold_repetition()) {
              var reasonopplost = "threefoldrepetition";
            }
            if (game.insufficient_material()) {
              var reasonopplost = "insufficient";
            }
            socket.emit("gameOver", {
              room: roomId,
              reasonlost: reasonopplost,
            });
            beforesubmit();
            document.getElementById("winorloss").action =
              "https://www.chess.gq/w/" + reasonopplost + ".php";
            document.getElementById("winorloss").submit();
            //window.location.replace('/w/' + reasonopplost + '.php');
          }

          if (game.in_check()) {
            against = game.turn();
            socket.emit("check", { room: roomId, checkfrom: against });
          }

          // illegal move
          if (move === null) {
            return "snapback";
          } else
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              "";
          socket.emit("moveC", {
            move: move,
            board: game.fen(),
            room: roomId,
            sourcefor: source,
            targetfor: target,
          });
          console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
          document.getElementById("pgn").value = game.pgn({
            max_width: 5,
            newline_char: "<br>",
          });
          console.log(game.fen());
          document
            .getElementsByClassName("square-" + source)[0]
            .classList.remove("checkhighlight");
          document.getElementsByClassName("square-" + target)[0].innerHTML =
            '<img src="img/chesspieces/wikipedia/wR.png" alt="" class="piece-417db" data-piece="wR" style="width: 100%;height: 100%;">';
          document.getElementById("currentfen").innerHTML = game.fen();
          document.getElementById("fen").value = game.fen();
          if (move.flags.includes("p") == false) {
            var audio = new Audio("move.wav");
            audio.play();
          }
          if (typeof move.captured != "undefined") {
            var audio = new Audio("capture.mp3");
            audio.play();
            socket.emit("captured", { room: roomId, moo: move.captured });
          }
          if (
            move.flags != "n" &&
            move.flags != "b" &&
            move.flags != "e" &&
            move.flags != "c"
          ) {
            var audio = new Audio("castle.wav");
            audio.play();
            socket.emit("castled", { room: roomId, moo: move.flags });
            //--or promotion
          }
        }

        if (pieceforpromotion.includes("b") == true) {
          var move = game.move({
            from: source,
            to: target,
            promotion: "b",
          });
          document.getElementById("promotionoptions").classList.remove("down");
          document.getElementById("container").classList.remove("boardblur");
          document.getElementById("piecetopromoteto").innerHTML = "";
          if (game.game_over()) {
            var audio = new Audio("win.wav");
            audio.play();
            state.innerHTML = "GAME OVER";
            gameOn = false;
            if (game.in_checkmate()) {
              var reasonopplost = "checkmate";
            }
            if (game.in_draw()) {
              var reasonopplost = "draw";
            }
            if (game.in_stalemate()) {
              var reasonopplost = "stalemate";
            }
            if (game.in_threefold_repetition()) {
              var reasonopplost = "threefoldrepetition";
            }
            if (game.insufficient_material()) {
              var reasonopplost = "insufficient";
            }
            socket.emit("gameOver", {
              room: roomId,
              reasonlost: reasonopplost,
            });
            beforesubmit();
            document.getElementById("winorloss").action =
              "https://www.chess.gq/w/" + reasonopplost + ".php";
            document.getElementById("winorloss").submit();
            //window.location.replace('/w/' + reasonopplost + '.php');
          }

          if (game.in_check()) {
            against = game.turn();
            socket.emit("check", { room: roomId, checkfrom: against });
          }

          // illegal move
          if (move === null) {
            return "snapback";
          } else
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              "";
          socket.emit("moveC", {
            move: move,
            board: game.fen(),
            room: roomId,
            sourcefor: source,
            targetfor: target,
          });
          console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
          document.getElementById("pgn").value = game.pgn({
            max_width: 5,
            newline_char: "<br>",
          });
          console.log(game.fen());
          document
            .getElementsByClassName("square-" + source)[0]
            .classList.remove("checkhighlight");
          document.getElementsByClassName("square-" + target)[0].innerHTML =
            '<img src="img/chesspieces/wikipedia/wB.png" alt="" class="piece-417db" data-piece="wB" style="width: 100%;height: 100%;">';
          document.getElementById("currentfen").innerHTML = game.fen();
          document.getElementById("fen").value = game.fen();
          if (move.flags.includes("p") == false) {
            var audio = new Audio("move.wav");
            audio.play();
          }
          if (typeof move.captured != "undefined") {
            var audio = new Audio("capture.mp3");
            audio.play();
            socket.emit("captured", { room: roomId, moo: move.captured });
          }
          if (
            move.flags != "n" &&
            move.flags != "b" &&
            move.flags != "e" &&
            move.flags != "c"
          ) {
            var audio = new Audio("castle.wav");
            audio.play();
            socket.emit("castled", { room: roomId, moo: move.flags });
            //--or promotion
          }
        }

        if (pieceforpromotion.includes("n") == true) {
          var move = game.move({
            from: source,
            to: target,
            promotion: "n",
          });
          document.getElementById("promotionoptions").classList.remove("down");
          document.getElementById("container").classList.remove("boardblur");
          document.getElementById("piecetopromoteto").innerHTML = "";
          if (game.game_over()) {
            var audio = new Audio("win.wav");
            audio.play();
            state.innerHTML = "GAME OVER";
            gameOn = false;
            if (game.in_checkmate()) {
              var reasonopplost = "checkmate";
            }
            if (game.in_draw()) {
              var reasonopplost = "draw";
            }
            if (game.in_stalemate()) {
              var reasonopplost = "stalemate";
            }
            if (game.in_threefold_repetition()) {
              var reasonopplost = "threefoldrepetition";
            }
            if (game.insufficient_material()) {
              var reasonopplost = "insufficient";
            }
            socket.emit("gameOver", {
              room: roomId,
              reasonlost: reasonopplost,
            });
            beforesubmit();
            document.getElementById("winorloss").action =
              "https://www.chess.gq/w/" + reasonopplost + ".php";
            document.getElementById("winorloss").submit();
            //window.location.replace('/w/' + reasonopplost + '.php');
          }

          if (game.in_check()) {
            against = game.turn();
            socket.emit("check", { room: roomId, checkfrom: against });
          }

          // illegal move
          if (move === null) {
            return "snapback";
          } else
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              "";
          socket.emit("moveC", {
            move: move,
            board: game.fen(),
            room: roomId,
            sourcefor: source,
            targetfor: target,
          });
          console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
          document.getElementById("pgn").value = game.pgn({
            max_width: 5,
            newline_char: "<br>",
          });
          console.log(game.fen());
          document
            .getElementsByClassName("square-" + source)[0]
            .classList.remove("checkhighlight");
          document.getElementsByClassName("square-" + target)[0].innerHTML =
            '<img src="img/chesspieces/wikipedia/wN.png" alt="" class="piece-417db" data-piece="wN" style="width: 100%;height: 100%;">';
          document.getElementById("currentfen").innerHTML = game.fen();
          document.getElementById("fen").value = game.fen();
          if (move.flags.includes("p") == false) {
            var audio = new Audio("move.wav");
            audio.play();
          }
          if (typeof move.captured != "undefined") {
            var audio = new Audio("capture.mp3");
            audio.play();
            socket.emit("captured", { room: roomId, moo: move.captured });
          }
          if (
            move.flags != "n" &&
            move.flags != "b" &&
            move.flags != "e" &&
            move.flags != "c"
          ) {
            var audio = new Audio("castle.wav");
            audio.play();
            socket.emit("castled", { room: roomId, moo: move.flags });
            //--or promotion
          }
        }
      } else {
        setTimeout(pollDOM, 300); // try again in 300 milliseconds
      }
    }

    pollDOM();
  } else {
    if (
      (target.includes("1") &&
        source.includes("2") &&
        playerType == "2" &&
        chess.get(target) == null) ||
      (target.includes("1") &&
        source.includes("2") &&
        playerType == "2" &&
        chess.get(source).type == "p" &&
        chess.get(target).type.length > 0 == true &&
        chess.get(target).color == "w" &&
        target.includes(mustbe))
    ) {
      document.getElementsByClassName("square-" + source)[0].innerHTML =
        "<div style='height: 500px;'></div>";
      document.getElementById("promotionoptions").classList.add("down");
      document.getElementById("container").classList.add("boardblur");
      document.getElementById("promotion1").src =
        "img/chesspieces/wikipedia/bQ.png";
      document.getElementById("promotion2").src =
        "img/chesspieces/wikipedia/bR.png";
      document.getElementById("promotion3").src =
        "img/chesspieces/wikipedia/bB.png";
      document.getElementById("promotion4").src =
        "img/chesspieces/wikipedia/bN.png";

      function pollDOM() {
        const el = document.getElementById("piecetopromoteto").innerHTML;

        if (el.length > 0) {
          pieceforpromotion =
            document.getElementById("piecetopromoteto").innerHTML;
          console.log(pieceforpromotion);

          if (pieceforpromotion.includes("q") == true) {
            var move = game.move({
              from: source,
              to: target,
              promotion: "q",
            });
            document
              .getElementById("promotionoptions")
              .classList.remove("down");
            document.getElementById("container").classList.remove("boardblur");
            document.getElementById("piecetopromoteto").innerHTML = "";
            if (game.game_over()) {
              var audio = new Audio("win.wav");
              audio.play();
              state.innerHTML = "GAME OVER";
              gameOn = false;
              if (game.in_checkmate()) {
                var reasonopplost = "checkmate";
              }
              if (game.in_draw()) {
                var reasonopplost = "draw";
              }
              if (game.in_stalemate()) {
                var reasonopplost = "stalemate";
              }
              if (game.in_threefold_repetition()) {
                var reasonopplost = "threefoldrepetition";
              }
              if (game.insufficient_material()) {
                var reasonopplost = "insufficient";
              }
              socket.emit("gameOver", {
                room: roomId,
                reasonlost: reasonopplost,
              });
              beforesubmit();
              document.getElementById("winorloss").action =
                "https://www.chess.gq/w/" + reasonopplost + ".php";
              document.getElementById("winorloss").submit();
              //window.location.replace('/w/' + reasonopplost + '.php');
            }

            if (game.in_check()) {
              against = game.turn();
              socket.emit("check", { room: roomId, checkfrom: against });
            }

            // illegal move
            if (move === null) {
              return "snapback";
            } else
              document.getElementsByClassName("square-" + target)[0].innerHTML =
                "";
            socket.emit("moveC", {
              move: move,
              board: game.fen(),
              room: roomId,
              sourcefor: source,
              targetfor: target,
            });
            console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
            document.getElementById("pgn").value = game.pgn({
              max_width: 5,
              newline_char: "<br>",
            });
            console.log(game.fen());
            document
              .getElementsByClassName("square-" + source)[0]
              .classList.remove("checkhighlight");
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              '<img src="img/chesspieces/wikipedia/bQ.png" alt="" class="piece-417db" data-piece="bQ" style="width: 100%;height: 100%;">';
            document.getElementById("currentfen").innerHTML = game.fen();
            document.getElementById("fen").value = game.fen();
            if (move.flags.includes("p") == false) {
              var audio = new Audio("move.wav");
              audio.play();
            }
            if (typeof move.captured != "undefined") {
              var audio = new Audio("capture.mp3");
              audio.play();
              socket.emit("captured", { room: roomId, moo: move.captured });
            }
            if (
              move.flags != "n" &&
              move.flags != "b" &&
              move.flags != "e" &&
              move.flags != "c"
            ) {
              var audio = new Audio("castle.wav");
              audio.play();
              socket.emit("castled", { room: roomId, moo: move.flags });
              //--or promotion
            }
          }

          if (pieceforpromotion.includes("r") == true) {
            var move = game.move({
              from: source,
              to: target,
              promotion: "r",
            });
            document
              .getElementById("promotionoptions")
              .classList.remove("down");
            document.getElementById("container").classList.remove("boardblur");
            document.getElementById("piecetopromoteto").innerHTML = "";
            if (game.game_over()) {
              var audio = new Audio("win.wav");
              audio.play();
              state.innerHTML = "GAME OVER";
              gameOn = false;
              if (game.in_checkmate()) {
                var reasonopplost = "checkmate";
              }
              if (game.in_draw()) {
                var reasonopplost = "draw";
              }
              if (game.in_stalemate()) {
                var reasonopplost = "stalemate";
              }
              if (game.in_threefold_repetition()) {
                var reasonopplost = "threefoldrepetition";
              }
              if (game.insufficient_material()) {
                var reasonopplost = "insufficient";
              }
              socket.emit("gameOver", {
                room: roomId,
                reasonlost: reasonopplost,
              });
              beforesubmit();
              document.getElementById("winorloss").action =
                "https://www.chess.gq/w/" + reasonopplost + ".php";
              document.getElementById("winorloss").submit();
              //window.location.replace('/w/' + reasonopplost + '.php');
            }

            if (game.in_check()) {
              against = game.turn();
              socket.emit("check", { room: roomId, checkfrom: against });
            }

            // illegal move
            if (move === null) {
              return "snapback";
            } else
              document.getElementsByClassName("square-" + target)[0].innerHTML =
                "";
            socket.emit("moveC", {
              move: move,
              board: game.fen(),
              room: roomId,
              sourcefor: source,
              targetfor: target,
            });
            console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
            document.getElementById("pgn").value = game.pgn({
              max_width: 5,
              newline_char: "<br>",
            });
            console.log(game.fen());
            document
              .getElementsByClassName("square-" + source)[0]
              .classList.remove("checkhighlight");
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              '<img src="img/chesspieces/wikipedia/bR.png" alt="" class="piece-417db" data-piece="bR" style="width: 100%;height: 100%;">';
            document.getElementById("currentfen").innerHTML = game.fen();
            document.getElementById("fen").value = game.fen();
            if (move.flags.includes("p") == false) {
              var audio = new Audio("move.wav");
              audio.play();
            }
            if (typeof move.captured != "undefined") {
              var audio = new Audio("capture.mp3");
              audio.play();
              socket.emit("captured", { room: roomId, moo: move.captured });
            }
            if (
              move.flags != "n" &&
              move.flags != "b" &&
              move.flags != "e" &&
              move.flags != "c"
            ) {
              var audio = new Audio("castle.wav");
              audio.play();
              socket.emit("castled", { room: roomId, moo: move.flags });
              //--or promotion
            }
          }

          if (pieceforpromotion.includes("b") == true) {
            var move = game.move({
              from: source,
              to: target,
              promotion: "b",
            });
            document
              .getElementById("promotionoptions")
              .classList.remove("down");
            document.getElementById("container").classList.remove("boardblur");
            document.getElementById("piecetopromoteto").innerHTML = "";
            if (game.game_over()) {
              var audio = new Audio("win.wav");
              audio.play();
              state.innerHTML = "GAME OVER";
              gameOn = false;
              if (game.in_checkmate()) {
                var reasonopplost = "checkmate";
              }
              if (game.in_draw()) {
                var reasonopplost = "draw";
              }
              if (game.in_stalemate()) {
                var reasonopplost = "stalemate";
              }
              if (game.in_threefold_repetition()) {
                var reasonopplost = "threefoldrepetition";
              }
              if (game.insufficient_material()) {
                var reasonopplost = "insufficient";
              }
              socket.emit("gameOver", {
                room: roomId,
                reasonlost: reasonopplost,
              });
              beforesubmit();
              document.getElementById("winorloss").action =
                "https://www.chess.gq/w/" + reasonopplost + ".php";
              document.getElementById("winorloss").submit();
              //window.location.replace('/w/' + reasonopplost + '.php');
            }

            if (game.in_check()) {
              against = game.turn();
              socket.emit("check", { room: roomId, checkfrom: against });
            }

            // illegal move
            if (move === null) {
              return "snapback";
            } else
              document.getElementsByClassName("square-" + target)[0].innerHTML =
                "";
            socket.emit("moveC", {
              move: move,
              board: game.fen(),
              room: roomId,
              sourcefor: source,
              targetfor: target,
            });
            console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
            document.getElementById("pgn").value = game.pgn({
              max_width: 5,
              newline_char: "<br>",
            });
            console.log(game.fen());
            document
              .getElementsByClassName("square-" + source)[0]
              .classList.remove("checkhighlight");
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              '<img src="img/chesspieces/wikipedia/bB.png" alt="" class="piece-417db" data-piece="bB" style="width: 100%;height: 100%;">';
            document.getElementById("currentfen").innerHTML = game.fen();
            document.getElementById("fen").value = game.fen();
            if (move.flags.includes("p") == false) {
              var audio = new Audio("move.wav");
              audio.play();
            }
            if (typeof move.captured != "undefined") {
              var audio = new Audio("capture.mp3");
              audio.play();
              socket.emit("captured", { room: roomId, moo: move.captured });
            }
            if (
              move.flags != "n" &&
              move.flags != "b" &&
              move.flags != "e" &&
              move.flags != "c"
            ) {
              var audio = new Audio("castle.wav");
              audio.play();
              socket.emit("castled", { room: roomId, moo: move.flags });
              //--or promotion
            }
          }

          if (pieceforpromotion.includes("n") == true) {
            var move = game.move({
              from: source,
              to: target,
              promotion: "n",
            });
            document
              .getElementById("promotionoptions")
              .classList.remove("down");
            document.getElementById("container").classList.remove("boardblur");
            document.getElementById("piecetopromoteto").innerHTML = "";
            if (game.game_over()) {
              var audio = new Audio("win.wav");
              audio.play();
              state.innerHTML = "GAME OVER";
              gameOn = false;
              if (game.in_checkmate()) {
                var reasonopplost = "checkmate";
              }
              if (game.in_draw()) {
                var reasonopplost = "draw";
              }
              if (game.in_stalemate()) {
                var reasonopplost = "stalemate";
              }
              if (game.in_threefold_repetition()) {
                var reasonopplost = "threefoldrepetition";
              }
              if (game.insufficient_material()) {
                var reasonopplost = "insufficient";
              }
              socket.emit("gameOver", {
                room: roomId,
                reasonlost: reasonopplost,
              });
              beforesubmit();
              document.getElementById("winorloss").action =
                "https://www.chess.gq/w/" + reasonopplost + ".php";
              document.getElementById("winorloss").submit();
              //window.location.replace('/w/' + reasonopplost + '.php');
            }

            if (game.in_check()) {
              against = game.turn();
              socket.emit("check", { room: roomId, checkfrom: against });
            }

            // illegal move
            if (move === null) {
              return "snapback";
            } else
              document.getElementsByClassName("square-" + target)[0].innerHTML =
                "";
            socket.emit("moveC", {
              move: move,
              board: game.fen(),
              room: roomId,
              sourcefor: source,
              targetfor: target,
            });
            console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
            document.getElementById("pgn").value = game.pgn({
              max_width: 5,
              newline_char: "<br>",
            });
            console.log(game.fen());
            document
              .getElementsByClassName("square-" + source)[0]
              .classList.remove("checkhighlight");
            document.getElementsByClassName("square-" + target)[0].innerHTML =
              '<img src="img/chesspieces/wikipedia/bN.png" alt="" class="piece-417db" data-piece="bN" style="width: 100%;height: 100%;">';
            document.getElementById("currentfen").innerHTML = game.fen();
            document.getElementById("fen").value = game.fen();
            if (move.flags.includes("p") == false) {
              var audio = new Audio("move.wav");
              audio.play();
            }
            if (typeof move.captured != "undefined") {
              var audio = new Audio("capture.mp3");
              audio.play();
              socket.emit("captured", { room: roomId, moo: move.captured });
            }
            if (
              move.flags != "n" &&
              move.flags != "b" &&
              move.flags != "e" &&
              move.flags != "c"
            ) {
              var audio = new Audio("castle.wav");
              audio.play();
              socket.emit("castled", { room: roomId, moo: move.flags });
              //--or promotion
            }
          }
        } else {
          setTimeout(pollDOM, 300); // try again in 300 milliseconds
        }
      }

      pollDOM();
    } else {
      var move = game.move({
        from: source,
        to: target,
        promotion: "q",
      });
      if (game.game_over()) {
        var audio = new Audio("win.wav");
        audio.play();
        state.innerHTML = "GAME OVER";
        gameOn = false;
        if (game.in_checkmate()) {
          var reasonopplost = "checkmate";
        }
        if (game.in_draw()) {
          var reasonopplost = "draw";
        }
        if (game.in_stalemate()) {
          var reasonopplost = "stalemate";
        }
        if (game.in_threefold_repetition()) {
          var reasonopplost = "threefoldrepetition";
        }
        if (game.insufficient_material()) {
          var reasonopplost = "insufficient";
        }
        socket.emit("gameOver", { room: roomId, reasonlost: reasonopplost });

        document.getElementById("pgn").innerHTML = game.pgn();
        console.log(game.pgn());
        document.getElementById("fen").innerHTML = game.fen();
        beforesubmit();
        setTimeout(function () {
          document.getElementById("winorloss").action =
            "https://www.chess.gq/w/" + reasonopplost + ".php";
          document.getElementById("winorloss").submit();
        }, 200);
        //window.location.replace('/w/' + reasonopplost + '.php');
      }

      if (game.in_check()) {
        against = game.turn();
        socket.emit("check", { room: roomId, checkfrom: against });
      }

      // illegal move
      if (move === null) {
        return "snapback";
      } else
        document.getElementsByClassName("square-" + target)[0].innerHTML = "";
      socket.emit("moveC", {
        move: move,
        board: game.fen(),
        room: roomId,
        sourcefor: source,
        targetfor: target,
      });
      console.log(game.pgn({ max_width: 5, newline_char: "<br>" }));
      document.getElementById("pgn").value = game.pgn({
        max_width: 5,
        newline_char: "<br>",
      });
      console.log(game.fen());
      document
        .getElementsByClassName("square-" + source)[0]
        .classList.remove("checkhighlight");
      document.getElementById("currentfen").innerHTML = game.fen();
      document.getElementById("fen").value = game.fen();
      timersstarted = document.getElementById("timersstarted").innerHTML;
      if (timersstarted != "started") {
        startmovetimers(); // this is why
        console.log("started");
        countdownopp();
        countdownme();
        winloss();
        document.getElementById("timersstarted").innerHTML = "started";
      }
      if (move.flags.includes("p") == false) {
        var audio = new Audio("move.wav");
        audio.play();
      }
      if (typeof move.captured != "undefined") {
        var audio = new Audio("capture.mp3");
        audio.play();
        socket.emit("captured", { room: roomId, moo: move.captured });
      }
      if (
        move.flags != "n" &&
        move.flags != "b" &&
        move.flags != "e" &&
        move.flags != "c"
      ) {
        var audio = new Audio("castle.wav");
        audio.play();
        socket.emit("castled", { room: roomId, moo: move.flags });
        //--or promotion
      }
    }
  }
};

function updatethefen() {
  game.load(game.fen());
}

var onMouseoverSquare = function (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

var onMouseoutSquare = function (square, piece) {
  removeGreySquares();
};

var onSnapEnd = function () {
  board.position(game.fen());
};

socket.on("player", (msg) => {
  if (msg.roomId == roomId) {
    var plno = document.getElementById("player");
    color = msg.color;
    if (color == "white") playerType = "1";
    else playerType = "2";

    players = msg.players;

    if (players == 2) {
      play = false;
      socket.emit("play", msg.roomId);
      var audio = new Audio("begin.wav");
      audio.play();
      document.getElementById("notif").innerHTML =
        "Connected<style>#notif {background-color: #19ca94;}</style>";
      checkalert();
      state.style.opacity = "0";
      setTimeout(function () {
        state.innerHTML = "";
      }, 1000);
      gameOn = true;
    } else
      state.innerHTML =
        "<b id='stateb' style='transition: 0.3s !important; color: #095e85 !important; padding: 100000px; backdrop-filter: blur(10px); background-color: rgba(255, 255, 255, 0.5);'>Waiting for second player<br><div id='link' style='display: inline-block; color: #242424; font-size: 0.42em; font-weight: 200;'>Match link: <input id='copy-text' onclick='copylink()' type='text' style='border-radius: 5px; padding: 10px; position: relative; border: none; width: 18em; text-align: center; top: -2px; left: 15px;' value='chess.gq/match/#" +
        roomId +
        "' readonly></div></b><style>#board {filter: blur(19px); pointer-events: none !important; transition: 0.3s ease-out !important;}</style>";

    var cfg = {
      orientation: color,
      draggable: true,
      position: "start",
      onDragStart: onDragStart,
      onDrop: onDrop,
      onMouseoutSquare: onMouseoutSquare,
      onMouseoverSquare: onMouseoverSquare,
      onSnapEnd: onSnapEnd,
    };
    board = ChessBoard("board", cfg);
  }
});
// console.log(color)

var board;
