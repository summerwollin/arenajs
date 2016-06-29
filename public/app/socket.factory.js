(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('socketService', factory);


  factory.$inject = ['sessionService', '$rootScope'];

  function factory (sessionService, $rootScope) {

    const STATE_UNCONNECTED = 'STATE_UNCONNECTED';
    const STATE_CONNECTING = 'STATE_CONNECTING';
    const STATE_CONNECTED = 'STATE_CONNECTED';

    var socket = null;
    var state = STATE_UNCONNECTED;
    var stateChangeHandlers = [];
    var hostedGames = [];
    var myUsername = "";

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
      hostedGames,
      getHostedGames
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

        socket.on('connect', function() {
          console.log('socketService:[connect]');
          socket.emit('auth', localStorage.getItem('token'));
        });

        socket.on('error', function() {
          console.log('socketService:[error]');
          changeState(STATE_UNCONNECTED);
          reject('socket error');
        });

        socket.on('auth-ok', function(msg) {
            console.log('socketService:[auth-ok]', msg);
            myUsername = msg.username;
            changeState(STATE_CONNECTED);
            resolve('resolve auth-ok');
            // $('#h1-username').text("User: " + msg.username);
            //vm.session.myUsername = msg.username;
            //$scope.$apply();
        });

        socket.on('on-new-host', function(msg) {
          getHostedGames();
          //hostedGames.push(msg); //vs getHostedGames()
          console.log('socketService [on-new-host]', hostedGames);

        })

        //getHostedGames();
        // socket.emit('get-hosted-games');
        // socket.on('send-hosted-games', function (msg) {
        //   hostedGames = msg;
        //   console.log('startAuth on-send-HG: ', hostedGames);
        // })
      });

      return promise;
    }

    function newGameHost(options) {
      console.log('socketService [new-host]', myUsername);
      socket.emit('new-host', {gameOptions: options, hostUser: myUsername});
    }

    function getHostedGames() {
      socket.emit('get-hosted-games');
      socket.on('send-hosted-games', function (msg) {
        hostedGames = msg;
        $rootScope.$broadcast('sending-hostedGames', hostedGames);
        console.log('socketFactory [send-hosted-games]: ', msg);
        console.log('socketFactory [send-hosted-games]: ', hostedGames);
        //return hostedGames;
      })
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
