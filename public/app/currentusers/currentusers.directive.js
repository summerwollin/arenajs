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


  }

}());
