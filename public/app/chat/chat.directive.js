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

  controller.$inject = ['$http', '$scope', '$window', 'sessionService'];

  function controller($http, $scope, $window, sessionService) {
    let vm = this;
    vm.sendmsg = sendmsg;
    console.log('sessionService: ', sessionService);
    vm.myUsername = sessionService.myUsername;
    // vm.users = sessionService.users;

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
    $scope.$watch(function(){
      console.log('watching');
      return sessionService.myUsername;
    }, function(value){
      console.log('watching2', value);

      vm.myUsername = value;
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
