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

  controller.$inject = ['$http', '$scope', '$window', 'sessionService', 'chatService'];

  function controller($http, $scope, $window, sessionService, chatService) {
    let vm = this;
    var socket = io();
    vm.sendmsg = sendmsg;
    vm.userClicked = userClicked;
    vm.messages = [];
    vm.myUsername = sessionService.myUsername;
    vm.users = [];
    vm.targetUsername = sessionService.targetUsername;

    var Peer = SimplePeer;
    var myUsername = sessionService.myUsername;
    var p = null;

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
            socket.emit("offer", {
              target: vm.targetUsername,
              host: vm.myUsername,
              sdp: data
            })
          } else {
            console.log("sending answer", data);
            socket.emit("answer", {
              target: vm.targetUsername,
              peer: vm.myUsername,
              sdp: data
            })
          }
      })

      p.on('connect', function() {
          console.log('CONNECT')
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

    socket.on('chat message', function(msg) {
        console.log('got chat message msg', msg);
        vm.messages.push("[" + msg.user + "(webrtc)]:" + msg.msg)
    });

    socket.on('offer', function(msg) {
      console.log('received offer', msg);
      if(msg.target === vm.myUsername) {
        console.log('target same as myUsername');
        vm.targetUsername = msg.host;
        initializePeer(false);
        p.signal(msg.sdp);
      }
    });
    socket.on('answer', function(msg) {
      console.log('received answer', msg);
      console.log(msg.peer);
      console.log('target: ', msg.target);
      if(msg.target === vm.myUsername) {
        console.log('I am the target: ', msg.target);
        p.signal(msg.sdp);
      }
    });



    $scope.$watch(function(){
      console.log('getting watch myUsername');
      return sessionService.myUsername;
    }, function(value){
      console.log('watching myUsername', value);

      vm.myUsername = value;
    }, true)

    $scope.$watchCollection(function(){
      console.log('getting watch users');
      return sessionService.users;
    }, function(value){
      console.log('watching users', value, vm.users);

      vm.users = value;
    }, true)

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
