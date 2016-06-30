var io = require('socket.io')();
const jwt = require('jsonwebtoken');

var currentUsers = [];
var hostedGames = [];

console.log('io [hostedGames !!!!!!!!!!!!!]', hostedGames);

function addUser(sessionUser) {
  var count = 0;
  currentUsers.forEach(function (user) {
    if (user === sessionUser) {
      count += 1;
    }
  })
  if (count === 0) {
    currentUsers.push(sessionUser);
  }
}
function removeUser(sessionUser) {
  currentUsers.forEach(function (user, i) {
    if (user === sessionUser) {
      currentUsers.splice(i, 1);
      console.log('CU: ', currentUsers);
    }
  })
}

io.on('connection', function(socket){
  console.log('io.on connection - io.js');
  var session = {
    authorized: false
  };
  socket.on('auth', function(msg){
    console.log('received auth:  ' + msg);
    var payload = jwt.verify(msg, 'shhhhhhhhh');
    console.log('payload: ', payload);
    session.authorized = true;
    session.username = payload;
    socket.emit('auth-ok', {username: session.username});
    console.log('emmited auth-ok');
    addUser(session.username);
    console.log('added user: ', currentUsers);
    socket.emit('currentUsers', currentUsers)
    io.emit('user added', session.username);
  });
  socket.on('chat message', function(msg){
    if(!session.authorized) {
      console.log("angry shtuff");
      //kill connection here
      return;
    }
    io.emit('chat message', session.username + ":  " + msg);
  });
  socket.on('disconnect', function (msg) {
    removeUser(session.username);
    io.emit('user disconnected', {username: session.username, users: currentUsers});
    io.emit('get-users', currentUsers);
  });
  socket.on('offer', function(msg) {
    console.log('on offer: ', msg);
    io.emit('offer', msg);
  });
  socket.on('answer', function(msg) {
    console.log('on answer: ', msg);
    io.emit('answer', msg);
  });
  socket.on('new-host', function (msg) {
    console.log('io.js [on new-host]');
    hostedGames.push(msg);
    io.emit('on-new-host', msg);
  })
  socket.on('get-hosted-games', function () {
    console.log('io send HG: ', hostedGames);
    socket.emit('send-hosted-games', hostedGames);
  })
  socket.on('remove-game-session', function (username) {
    hostedGames.forEach(function (game, i) {
      if (game.hostUser === username) {
        hostedGames.splice(i,1);
      }
    })
    io.emit('send-hosted-games', hostedGames)
  })
  socket.on('join-game', function (msg) {
    console.log('io [join-game]');
    io.emit('join-game', msg);
  })
  socket.on('get-users', function () {
    io.emit('get-users', currentUsers);
  })
  socket.on('send-message', function (msg) {
    io.emit('send-message', msg);
  })

});



module.exports = io;
