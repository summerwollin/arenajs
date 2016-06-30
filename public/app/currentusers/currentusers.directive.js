(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajUsers', usersDirective);


  function usersDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/currentusers/currentusers.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }


  controller.$inject = ['socketService', '$scope'];

  function controller(socketService, $scope) {
    let vm = this;
    vm.users = [];
    activate();

    function activate() {
      socketService.getUsers();
    }

    $scope.$on('got-users', function (event, data) {
      console.log('got-users-broadcast: ', data);
      vm.users = data;
      $scope.$apply();
    })
  }

}());
