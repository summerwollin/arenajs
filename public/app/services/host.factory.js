(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('hostService', factory);


  factory.$inject = [];

  function factory () {

    var peers = [];
    var numPlayers;
    var onSignallingReadyCallback = null;
    var allPeersConnectedCallback = null;
    var dataReceivedCallback = null;

    return {
      hostGame,
      numPeers,
      joinGameReceived,
      onSignallingReady,
      onAllPeersConnected,
      sendBroadcastMessage,
      onDataReceived
    };

    function hostGame(numberOfPlayers) {
      numPlayers = numberOfPlayers;
      console.log('hostGame() called');
    }

    function numPeers() {
      return peers.length
    }

    function joinGameReceived(msg) {
      if (findPeerForUsername(msg.senderUsername) === null) {
        let peer = {
          username: msg.senderUsername,
          sdp: msg.sdp,
          connected: false,
          dataChannel: new SimplePeer({trickle: false})
        }

        peers.push(peer);

        peer.dataChannel.on('signal', function(data) {
          if(onSignallingReadyCallback) {
            onSignallingReadyCallback(data, peer.username);
          } else {
            console.log('peer.dataChannel.onSignal', onSignallingReadyCallback, data, peer.username);
          }
        });

        peer.dataChannel.on('connect', function() {
          console.log('peer.dataChannel.onConnect');
          peer.connected = true;
          anotherPeerConnected();
        });

        peer.dataChannel.on('data', function(data) {
          var msg = JSON.parse(data);
          if(dataReceivedCallback) {
            dataReceivedCallback(peer.username, msg);
          }
        });

        peer.dataChannel.on('error', function(err) {
          console.log('hostService [dataChannel.onError]', err)
          // Similar to close.  Connetion killed.  Back
        });

        peer.dataChannel.signal(peer.sdp);
      }
      console.log("hostService.joinGameReceived(",msg,")");
    }

    function stopHosting() {
      peers.forEach(function (peer) {
        peer.destroy();
      })
    }

    function onSignallingReady(callback) {
      console.log("onSignallingReady", callback);
      onSignallingReadyCallback = callback;
    }

    function onAllPeersConnected(callback) {
      console.log("onPeersConnected", callback);
      allPeersConnectedCallback = callback;
    }

    function sendBroadcastMessage(msg) {
      peers.forEach(function(peer) {
        //console.log('hostService [sendBroadcastMessage]');
        peer.dataChannel.send(JSON.stringify(msg));
      })
    }

    function onDataReceived(callback) {
      dataReceivedCallback = callback;
    }

    ////////////////////////////////////////////
    // Private functions
    function findPeerForUsername(username) {
      let result = null;

      peers.forEach(function (element) {
        if(element.username === username) {
          result = element
        }
      });

      return result;
    }

    function anotherPeerConnected() {
      if(peers.length != numPlayers - 1) {
        //Still waiting for more peers
        return;
      }

      var allConnected = true;
      peers.forEach(function(peer) {
        if(!peer.connected) {
          allConnected = false;
        }
      })

      if (allConnected) {
        if (allPeersConnectedCallback) {
          allPeersConnectedCallback();
        }
      }
    }
  }
}());
