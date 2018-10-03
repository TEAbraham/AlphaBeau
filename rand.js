var board;
game = new Chess();
var statusEl = $('#status');
var historyEl = $('#history');
var mv_history = "";
var enabled = true;
var playouts = 50;
var canMove = true;
var promotePiece = "q";
var preMove = "";
var thinking = false;

$("#fenbox").html(game.fen())

var makeRandomMove = function() {
  var possibleMoves = game.moves();

  // exit if the game is over
  if (game.game_over() === true ||
    game.in_draw() === true ||
    possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIndex]);
  board.position(game.fen());

  window.setTimeout(makeRandomMove, 500);
};

board = ChessBoard('board', 'start');

window.setTimeout(makeRandomMove, 500);

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
      moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
  }

  // game still on
  else {
      status = moveColor + ' to move';

  // check?
  if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
  }
  }
  statusEl.html(status);
  var htmlStr = "";
  var pgn = game.pgn();
  console.log(pgn);
  for (var i = 1;; i += 1) {
      pos = pgn.indexOf(i + ".");
      next = pgn.indexOf((i + 1) + ".");

      if (next == -1) {
          htmlStr += pgn.substring(pos, pgn.length) + " <br />";
          break;
      } else {
          htmlStr += pgn.substring(pos, next) + " <br />";
      }
  }

  historyEl.html(htmlStr);
$("#historybox").scrollTop($("#historybox")[0].scrollHeight);
};

updateStatus();

$('#startPositionBtn').on('click', function() {
  game = new Chess();
  $("#fenbox").html(game.fen())
  mv_history = "";
  board.start();
  updateStatus();
});
$('#flipBtn').on('click', board.flip);
$('#move1Btn').on('click', function() {
  if (enabled) {
      $('#move1Btn').attr("value", "Steve: Disabled");
  } else {
      $('#move1Btn').attr("value", "Steve: Enabled");

  }
  enabled = !enabled;
});

$('#slowBtn').on('click', function() {
  $('#curMode').html("Hard");
  playouts = 400;
  $('#playouts').html(playouts);
});

$('#fastBtn').on('click', function() {
  $('#curMode').html("Normal");
  playouts = 50;
  $('#playouts').html(playouts);
});

$('#ultrafastBtn').on('click', function() {
  $('#curMode').html("Easy");
  playouts = 1;
  $('#playouts').html(playouts);
});

$('#hardcoreBtn').on('click', function() {
  $('#curMode').html("Hardcore");
  playouts = 2000;
  $('#playouts').html(playouts);
});

$('#promoteBtn').on('click', function() {
  var newName;
  if (promotePiece == "q") {
      newName = "Knight";
      promotePiece = "n";
  } else if (promotePiece == "n") {
      newName = "Bishop";
      promotePiece = "b";
  } else if (promotePiece == "b") {
      newName = "Rook";
      promotePiece = "r";
  } else if (promotePiece == "r") {
      newName = "Queen";
      promotePiece = "q";
  }

  $('#promoteBtn').attr("value", "Will promote to: " + newName);
});

$('#move2Btn').on('click', function() {
  if (canMove) {
      playComputer();
  } else {
  $("#status").html("Force Steve move registered. Steve will play when time is over")
  preMove = true;
  }
});