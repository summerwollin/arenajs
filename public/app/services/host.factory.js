(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('hostService', factory);


  factory.$inject = [];

  function factory () {

    var peers = [];
    var numPlayers;

    return {
      hostGame
    };

    function hostGame(options) {
      numPlayers = options.numPlayers;
    }

    function stopHosting() {
      peers.forEach(function (peer) {
        peer.destroy();
      })
    }

  }
}());
