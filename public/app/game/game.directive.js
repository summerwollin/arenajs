(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajGame', gameDirective);


  function gameDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/game/game.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }

  controller.$inject = [];

  function controller() {
    var vm = this;


  }

}());
