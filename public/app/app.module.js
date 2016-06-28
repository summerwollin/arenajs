(function() {
  'use strict';

  var dependencies = [
    'ngRoute',
  ];

  angular.module('arenaApp', dependencies)
  .config(setupRoutes)
  .controller('MainController', function ($scope, sessionService, $location) {

    $scope.canvasWidth = 400;
    $scope.canvasHeight = 400;
    $scope.dofillcontainer = true;
    $scope.scale = 1;
    $scope.materialType = 'lambert';

    var vm = this;
    vm.session = sessionService;
    vm.session.users = [];

    var socket = io();
    var targetUsername = "";
    var Peer = SimplePeer;


    function onUserAdded(username) {
        if (vm.session.myUsername !== username) {
          if (!vm.session.users.includes(username)) {
            vm.session.users.push(username);
            $scope.$apply();
            console.log('trying to add user', username, vm.session.users);
          } else {
            console.log('vm.session.users already had', username, vm.session.users);
          }
            // $('#ul-users').append(
            //     $('<li>').text(username)
            //     .on('click', function() {
            //         onInvite(username);
            //     }));
        }
    }
    //
    // var p = null;

    // document.querySelector('#simple-peer-form').addEventListener('submit', function(ev) {
    //   ev.preventDefault();
    //   if(p) {
    //     window.p.send(JSON.stringify({
    //       user: myUsername,
    //       msg: document.querySelector("#incoming").value
    //     }));
    //   }
    // })

    //function initializePeer(isInitiator) {
      // window.p = new Peer({
      //     initiator: isInitiator,
      //     trickle: false
      // })
      //
      // console.log("initializePeer: ", p);
      //
      // window.p.on('error', function(err) {
      //     console.log('error', err)
      // })
      //
      // window.p.on('signal', function(data) {
      //     console.log('SIGNAL', data)
      //     if(isInitiator) {
      //       socket.emit("offer", {
      //         target: targetUsername,
      //         host: myUsername,
      //         sdp: data
      //       })
      //     } else {
      //       socket.emit("answer", {
      //         target: targetUsername,
      //         peer: myUsername,
      //         sdp: data
      //       })
      //     }
      // })
      //
      // window.p.on('connect', function() {
      //     console.log('CONNECT')
      // })
      //
      // window.p.on('data', function(data) {
      //     var msg = JSON.parse(new TextDecoder("utf-8").decode(data));
      //     console.log('data: ', data)
      //     $('#messages').append($('<li>').text(
      //       "[" + msg.user + "(webrtc)]:" + msg.msg));
      // })
    //}

    //function onInvite(username) {
      // targetUsername = username;
      //
      // initializePeer(true);
    //}

    // $('sendmsg-form').submit(function(ev) {
    //   ev.preventDefault();
    //     socket.emit('chat message', $('#m').val());
    //     $('#m').val('');
    //     return false;
    // });
    socket.on('connect', function() {
        console.log('on-connect - client.js');
        socket.emit('auth', localStorage.getItem('token'));
    });
    socket.on('auth-ok', function(msg) {
        console.log('got auth ok msg', msg);
        // $('#h1-username').text("User: " + msg.username);
        vm.session.myUsername = msg.username;
        $scope.$apply();
    });
    // socket.on('chat message', function(msg) {
    //     console.log('got chat message msg', msg);
    //     // $('#messages').append($('<li>').text(msg));
    // });
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
        // $('#ul-users').empty();
        msg.users.forEach(function(user) {
            onUserAdded(user);
        })
        console.log(msg.username, ': disconnected');
    });
    // socket.on('offer', function(msg) {
    //   console.log(msg);
    //   if(msg.target === vm.session.myUsername) {
    //     targetUsername = msg.host;
    //     initializePeer(false);
    //     p.signal(msg.sdp);
    //   }
    // });
    // socket.on('answer', function(msg) {
    //   if(msg.target === vm.session.myUsername) {
    //     p.signal(msg.sdp);
    //   }
    // })

  })

  setupRoutes.$inject = [
    '$routeProvider',
    '$locationProvider',
    '$httpProvider'
  ];

  function setupRoutes($routeProvider, $locationProvider, $httpProvider){

    $routeProvider
    .when('/', {
      template: '<aj-main></aj-main>',
    })
    .when('/lobby', {
      template: '<aj-lobby></aj-lobby>'
    })
    .when('/game', {
      template: '<aj-invaders></aj-invaders>'
    })
    .when('/webgl', {
      template: '<aj-webgl></aj-webgl>'
    });

    $locationProvider.html5Mode(true);
  };
}());
