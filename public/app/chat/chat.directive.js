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
    vm.messages = socketService.messages;

    function sendMessage() {
      socketService.sendMessage(vm.form.sendMessage.message);
    }

    $scope.$on('got-chat-message', function (event) {
      $scope.$apply();
    })
  }

}());
