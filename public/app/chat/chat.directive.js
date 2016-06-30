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

  controller.$inject = ['sessionService', 'socketService', '$scope'];

  function controller(sessionService, socketService, $scope) {
    let vm = this;
    vm.sendMessage = sendMessage;
    vm.messages = [];

    function sendMessage() {
      socketService.sendMessage(vm.form.sendMessage.message);
    }

    $scope.$on('got-chat-message', function (event, data) {
      console.log('got-chat-message: ', data);
      if (vm.messages.length === 0) {
        vm.messages.push(data);
      }
      else if (vm.messages[vm.messages.length - 1] !== data) {
        vm.messages.push(data);
        console.log('?');
        console.log('whYYYY', vm.messages[vm.messages.length - 1]);
      }
      if (vm.messages.length > 10) {
        console.log('splice msg');
        vm.messages.splice(0,1);
      }
      console.log('vm.messages', vm.messages);
      $scope.$apply();
    })
  }

}());
