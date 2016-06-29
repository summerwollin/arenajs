(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('socketService', factory);


  factory.$inject = [];

  function factory () {

    const STATE_UNCONNECTED = 'STATE_UNCONNECTED';
    const STATE_CONNECTING = 'STATE_CONNECTING';
    const STATE_CONNECTED = 'STATE_CONNECTED';

    var socket = null;
    var state = STATE_UNCONNECTED;
    var stateChangeHandlers = [];

    return {
      STATE_UNCONNECTED,
      STATE_CONNECTING,
      STATE_CONNECTED,
      currentState,
      onStateChange,
      removeStateChangeHandler,
      setToken,
      startAuthorization
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
            changeState(STATE_CONNECTED);
            resolve();
            // $('#h1-username').text("User: " + msg.username);
            //vm.session.myUsername = msg.username;
            //$scope.$apply();
        });
      });

      return promise;
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
