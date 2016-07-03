(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('peerService', factory);


  factory.$inject = [];

  function factory () {

    var dataChannel;
    var hasReceivedAnswer = false;
    var signallingInfoAvailableCallback = null;

    return {
      joinGame,
      onSignallingInfoAvailable
    };

    function joinGame(game) {
      console.log('peerService [joinGame]');
      dataChannel = new SimplePeer({initiator: true, trickle: false});
      dataChannel.on('signal', function(data) {
        // Send join-game message to server here
        if (signallingInfoAvailableCallback) {
          signallingInfoAvailableCallback(data);
        }
      });
      dataChannel.on('connect', function() {
        console.log('peerService [dataChannel.onConnect]')
        // We're connected to the host here
      });
      dataChannel.on('close', function() {
        console.log('peerService [dataChannel.onClose]');
        // The connection to the host has been closed
      });
      dataChannel.on('error', function(err) {
        console.log('peerService [dataChannel.onError]', err)
        // Similar to close.  Connetion killed.  Back
      });
      dataChannel.on('data', function(data) {
        let msg = JSON.parse(data);
        console.log('peerService [dataChannel.onData]', msg)
      })
      backendService.onAnswer(function(msg) {
        console.log("peerService [answering]", msg)
        if(!hasReceivedAnswer) {
          // Send an answer only once
          dataChannel.signal(msg.sdp)
          hasReceivedAnswer = true;
        }
      });
    }
    function onSignallingInfoAvailable(callback) {
      signallingInfoAvailableCallback  = callback;
    }


  }
}());