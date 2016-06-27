(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajMain', mainDirective);


  function mainDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/main/main.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }

  controller.$inject = [];

  function controller() {


  }

}());
