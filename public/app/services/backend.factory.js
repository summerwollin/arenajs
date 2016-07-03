(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('backendService', factory);


  factory.$inject = ['sessionService', '$rootScope'];

  function factory (sessionService, $rootScope) {

    const STATE_UNCONNECTED = 'STATE_UNCONNECTED';
    const STATE_CONNECTING = 'STATE_CONNECTING';
    const STATE_CONNECTED = 'STATE_CONNECTED';

    var socket = null;
    var state = STATE_UNCONNECTED;
    var stateChangeHandlers = [];
    var myUsername = "";
    var messages = [];
    var onJoinGameCallback = null;
    var onAnswerCallback = null;

    return {
      STATE_UNCONNECTED,
      STATE_CONNECTING,
      STATE_CONNECTED,
      currentState,
      onStateChange,
      removeStateChangeHandler,
      setToken,
      startAuthorization,
      newGameHost,
      getHostedGames,
      removeGameSessions,
      joinGame,
      getUsers,
      sendMessage,
      messages,
      onJoinGame,
      answer,
      onAnswer,
      getMyUsername
   };

    ////////////////////////////////////////////////
    // exported functions
    function currentState() {
      return state;
    }

    function onStateChange(fn) {
      stateChangeHandlers.push(fn);
    }

    function removeStateChangeHandler(fn) {
      var index = stateChangeHandlers.indexOf(fn);
      if (index > -1) {
        stateChangeHandlers.splice(index,1);
      }
    }

    function setToken(newToken) {
      localStorage.setItem('token', newToken);
      startAuthorization();
    }

    function startAuthorization() {
      changeState(STATE_UNCONNECTED);

      let promise = new Promise(function(resolve, reject) {
        if(null === localStorage.getItem('token')) {
          reject('no token');
          return;
        }

        socket = io();
        console.log("~~~~~~~~ Adding socket ~~~~~~", socket)

        socket.on('connect', function() {
          console.log('backendService:[connect]');
          socket.emit('auth', localStorage.getItem('token'));
        });

        socket.on('error', function() {
          console.log('backendService:[error]');
          changeState(STATE_UNCONNECTED);
          reject('socket error');
        });

        socket.on('auth-ok', function(msg) {
            console.log('backendService:[auth-ok]', msg);
            myUsername = msg.username;
            console.log('auth-ok username: ', myUsername);
            changeState(STATE_CONNECTED);
            resolve('resolve auth-ok');
            // $('#h1-username').text("User: " + msg.username);
            //session.myUsername = msg.username;
            //$scope.$apply();
        });

        socket.on('on-new-host', function(msg) {
          getHostedGames();
          console.log('backendService [on-new-host]', msg);
        })

        socket.on('join-game', function (msg) {
          console.log('socket on [join-game]');
          if (onJoinGameCallback) {
            onJoinGameCallback(msg);
          }
        })

        socket.on('answer', function (msg) {
          if(onAnswerCallback) {
            onAnswerCallback(msg);
          }
        })

        socket.on('send-message', function (msg) {
          if (messages.length === 0) {
            messages.push(msg);
          }
          else if (messages[messages.length - 1].message !== msg.message || messages[messages.length - 1].username !== msg.username) {
            messages.push(msg);
          }
          if (messages.length > 10) {
            messages.splice(0,1);
          }
          $rootScope.$broadcast('got-chat-message');
        })


      });

      return promise;
    }

    function newGameHost(options) {
      console.log('backendService [new-host]', myUsername);
      socket.emit('new-host', {gameOptions: options, hostUser: myUsername});
    }

    function getHostedGames() {
      socket.emit('get-hosted-games');
      socket.on('send-hosted-games', function (msg) {
        $rootScope.$broadcast('sending-hostedGames', msg);
        console.log('socketFactory [send-hosted-games]: ', msg);
      })
    }

    function removeGameSessions() {
      socket.emit('remove-game-session', myUsername);
    }

    function joinGame(msg) {
      console.log('backendService.emit[join-game]');
      socket.emit('join-game', msg);
    }

    function answer(target, sdp) {
      console.log('backendService.emit[answer]');
      socket.emit('answer', {host: myUsername, peer: target, sdp});
    }

    function getMyUsername() {
      return myUsername;
    }

    function onJoinGame(callback) {
      onJoinGameCallback = callback;
    }

    function onAnswer(callback) {
      onAnswerCallback = callback;
    }

    function getUsers() {
      socket.emit('get-users');
      socket.on('get-users', function (users) {
        console.log('get-users: ', users);
        $rootScope.$broadcast('got-users', users);
      })
    }

    function sendMessage(msg) {
      console.log('backendService [sendMessage]: ', msg, myUsername);
      socket.emit('send-message', {message: msg, username: myUsername});
    }

    ////////////////////////////////////////////////
    // private functions
    function changeState(newState) {
      state = newState;
      stateChangeHandlers.forEach(function (fn) {
        fn(newState);
      })
    }

  }
}());
