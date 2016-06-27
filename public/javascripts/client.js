var socket = io();
var myUsername = "";
var targetUsername = "";

var Peer = require('simple-peer')

//$apply
//$scope.$on('destroy')
//move code into controller
//ng-submit = funcname
//angular.run -> $root

function onUserAdded(username) {
    if (myUsername !== username) {
        $('#ul-users').append(
            $('<li>').text(username)
            .on('click', function() {
                onInvite(username);
            }));
    }
}

var p = null;

// document.querySelector('#simple-peer-form').addEventListener('submit', function(ev) {
//   ev.preventDefault();
//   if(p) {
//     window.p.send(JSON.stringify({
//       user: myUsername,
//       msg: document.querySelector("#incoming").value
//     }));
//   }
// })

function initializePeer(isInitiator) {
  window.p = new Peer({
      initiator: isInitiator,
      trickle: false
  })

  console.log("initializePeer: ", p);

  window.p.on('error', function(err) {
      console.log('error', err)
  })

  window.p.on('signal', function(data) {
      console.log('SIGNAL', data)
      if(isInitiator) {
        socket.emit("offer", {
          target: targetUsername,
          host: myUsername,
          sdp: data
        })
      } else {
        socket.emit("answer", {
          target: targetUsername,
          peer: myUsername,
          sdp: data
        })
      }
  })

  window.p.on('connect', function() {
      console.log('CONNECT')
  })

  window.p.on('data', function(data) {
      var msg = JSON.parse(new TextDecoder("utf-8").decode(data));
      console.log('data: ', data)
      $('#messages').append($('<li>').text(
        "[" + msg.user + "(webrtc)]:" + msg.msg));
  })
}

function onInvite(username) {
  targetUsername = username;

  initializePeer(true);
}

$('sendmsg-form').submit(function(ev) {
  ev.preventDefault();
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
});
socket.on('connect', function() {
    socket.emit('auth', localStorage.getItem('token'));
});
socket.on('auth-ok', function(msg) {
    console.log('got auth ok msg', msg);
    $('#h1-username').text("User: " + msg.username);
    myUsername = msg.username;
});
socket.on('chat message', function(msg) {
    console.log('got chat message msg', msg);
    $('#messages').append($('<li>').text(msg));
});
socket.on('currentUsers', function(msg) {
    console.log('got curentUsers msg', msg);
    msg.forEach(function(user) {
        onUserAdded(user);
    });
});
socket.on('user added', function(user) {
    console.log('got user added msg', user);
    onUserAdded(user);
});
socket.on('user disconnected', function(msg) {
    console.log('got user disconnected msg', msg);
    $('#ul-users').empty();
    msg.users.forEach(function(user) {
        onUserAdded(user);
    })
    console.log(msg.username, ': disconnected');
});
socket.on('offer', function(msg) {
  console.log(msg);
  if(msg.target === myUsername) {
    targetUsername = msg.host;
    initializePeer(false);
    p.signal(msg.sdp);
  }
});
socket.on('answer', function(msg) {
  if(msg.target === myUsername) {
    p.signal(msg.sdp);
  }
})
