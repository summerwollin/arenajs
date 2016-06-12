var io = require('socket.io')();
const jwt = require('jsonwebtoken');

var currentUsers = [];

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
    addUser(session.username);
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
  });
  socket.on('rtc offer', function (msg) {
    console.log('rtc offer: ', msg);
    io.emit('rtc offer', msg)
  })
});



module.exports = io;
