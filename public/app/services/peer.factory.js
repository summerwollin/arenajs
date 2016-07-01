(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('peerService', factory);


  factory.$inject = ['socketService'];

  function factory (socketService) {

    var hostDataChannel;

    return {
      joinGame,
      onJoinGame
    };

    function joinGame(game) {
      console.log('peerService [joinGame]');
      hostDataChannel = new SimplePeer({initiator: true});
      hostDataChannel.on('signal', function(data) {
        // Send join-game message to server here
        socketService.joinGame({gameInfo: game, sdp: data, senderUsername: socketService.myUsername});
      });
      hostDataChannel.on('connect', function() {
        // We're connected to the host here
      });
      hostDataChannel.on('close', function() {
        // The connection to the host has been closed
      });
      hostDataChannel.on('error', function(err) {
        // Similar to close.  Connetion killed.  Back
      });
    }
    function onJoinGame(msg) {
      hostDataChannel.signal(msg.sdp);
    }


  }
}());
