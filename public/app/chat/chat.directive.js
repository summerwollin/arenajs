(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajChat', chatDirective);


  function chatDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/chat/chat.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }

  controller.$inject = ['$http', '$scope', '$window', 'sessionService', 'socketService'];

  function controller($http, $scope, $window, sessionService, socketService) {
    let vm = this;
    vm.sendmsg = sendmsg;
    vm.userClicked = userClicked;
    vm.messages = [];
    vm.myUsername = sessionService.myUsername;
    vm.users = [];
    vm.targetUsername = sessionService.targetUsername;

    var Peer = SimplePeer;
    var myUsername = sessionService.myUsername;
    var p = null;

    socketService.onStateChange(function (newState) {
      console.log('socket state changed: ', newState);
    })

    function sendmsg() {
      if(p) {
        window.p.send(JSON.stringify({
          user: myUsername,
          msg: vm.form.sendmsg.msg
        }));
      }
    }

    function userClicked(username) {
      console.log('userClicked triggered: ', username);
      onInvite(username);
    }




    // document.querySelector('#simple-peer-form').addEventListener('submit', function(ev) {
    //   ev.preventDefault();
    //   if(p) {
    //     p.send(JSON.stringify({
    //       user: myUsername,
    //       msg: document.querySelector("#incoming").value
    //     }));
    //   }
    // })

    function initializePeer(isInitiator) {
      p = new Peer({
          initiator: isInitiator,
          trickle: false
      })

      console.log("initializePeer: ", p);

      p.on('error', function(err) {
          console.log('error', err)
      })

      p.on('signal', function(data) {
          console.log('SIGNAL', data)
          if(isInitiator) {
            console.log("sending offer target: ", vm.targetUsername);
          } else {
            console.log("sending answer", data);
          }
      })

      p.on('connect', function() {
          console.log('CONNECT')
      })

      p.on('close', function () {
        console.log('CONNECTION CLOSED');
      })

      p.on('data', function(data) {
          var msg = JSON.parse(new TextDecoder("utf-8").decode(data));
          console.log('data: ', data)
          vm.messages.push("[" + msg.user + "(webrtc)]:" + msg.msg)
          // $('#messages').append($('<li>').text(
          //   "[" + msg.user + "(webrtc)]:" + msg.msg));
      })
    }

    function onInvite(username) {
      vm.targetUsername = username;
      console.log('onInvite triggered for target: ', vm.targetUsername);
      initializePeer(true);
    }

  //   document.querySelector('#simple-peer-form').addEventListener('submit', function(ev) {
  //     ev.preventDefault();
  //     if(p) {
  //       window.p.send(JSON.stringify({
  //         user: myUsername,
  //         msg: document.querySelector("#incoming").value
  //       }));
  //     }
  //   })
  //
  }

}());
