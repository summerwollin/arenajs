(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajChat', chatDirective);


  function chatDirective () {
    return {
      scope: {
        myUsername: '='
      },
      templateUrl: 'app/chat/chat.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }

  controller.$inject = ['$http', '$scope', '$window'];

  function controller($http, $scope, $watch, $window) {
    let vm = this;
    vm.sendmsg = sendmsg;
    // vm.myUsername = window.myUsername;
    console.log('chat-dir-username: ', window.myUsername);

    function sendmsg() {
      if(p) {
        window.p.send(JSON.stringify({
          user: myUsername,
          msg: vm.form.sendmsg.msg
        }));
      }
    }

    // $scope.$watch(window.myUsername, function (newValue, oldValue) {
    //   console.log('watch: ', newValue, oldValue);
    //   if (newValue !== oldValue) {
    //     vm.username = newValue;
    //   }
    // })
    // $scope.$watch(function(){
    //   console.log('watching');
    //   return window.myUsername;
    // }, function(value){
    //   console.log('watching2', value);
    //
    //   vm.username = value;
    // }, true)

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
