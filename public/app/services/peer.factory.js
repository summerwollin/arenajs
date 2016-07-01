(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('peerService', factory);


  factory.$inject = ['socketService'];

  function factory (socketService) {

    var dataChannel;

    return {
      joinGame,
      onJoinGame
    };

    function joinGame(game) {
      console.log('peerService [joinGame]');
      dataChannel = new SimplePeer({initiator: true});
      dataChannel.on('signal', function(data) {
        // Send join-game message to server here
        socketService.joinGame({gameInfo: game, sdp: data, senderUsername: socketService.myUsername});
      });
      dataChannel.on('connect', function() {
        // We're connected to the host here
      });
      dataChannel.on('close', function() {
        // The connection to the host has been closed
      });
      dataChannel.on('error', function(err) {
        // Similar to close.  Connetion killed.  Back
      });
    }
    function onJoinGame(msg) {
      dataChannel.signal(msg.sdp);
    }


  }
}());
