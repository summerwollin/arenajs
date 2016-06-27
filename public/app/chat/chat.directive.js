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

  controller.$inject = ['$http'];

  function controller($http) {
    let vm = this;
    vm.sendmsg = sendmsg;

    function sendmsg() {
      if(p) {
        window.p.send(JSON.stringify({
          user: myUsername,
          msg: vm.form.sendmsg.msg
        }));
      }
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
