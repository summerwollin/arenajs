(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajLogin', loginDirective);


  function loginDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/login/login.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }

  controller.$inject = [];

  function controller() {


  }

}());
