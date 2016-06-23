var socket = io();
var myUsername = "";
var targetUsername = "";

var Peer = require('simple-peer')
var p = new Peer({
    initiator: location.hash === '#1',
    trickle: false
})

p.on('error', function(err) {
    console.log('error', err)
})

p.on('signal', function(data) {
    console.log('SIGNAL', JSON.stringify(data))
    document.querySelector('#outgoing').textContent = JSON.stringify(data)
})

document.querySelector('form').addEventListener('submit', function(ev) {
    ev.preventDefault()
    p.signal(JSON.parse(document.querySelector('#incoming').value))
})

p.on('connect', function() {
    console.log('CONNECT')
    p.send('whatever' + Math.random())
})

p.on('data', function(data) {
    console.log('data: ' + data)
})

function onUserAdded(username) {
    if (myUsername !== username) {
        $('#ul-users').append(
            $('<li>').text(username)
            .on('click', function() {
                onInvite(username);
            }));
    }
}

function onInvite(username) {

}

$('form').submit(function() {
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
})