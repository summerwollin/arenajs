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

  controller.$inject = ['sessionService', 'backendService', '$scope'];

  function controller(sessionService, backendService, $scope) {
    let vm = this;
    vm.sendMessage = sendMessage;
    vm.messages = backendService.messages;

    function sendMessage() {
      backendService.sendMessage(vm.form.sendMessage.message);
    }

    $scope.$on('got-chat-message', function (event) {
      $scope.$apply();
    })
  }

}());
