(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajQ3gl', q3glDirective);

  function q3glDirective () {
    return {
      templateUrl: 'app/q3gl/q3gl.directive.html',
      controller: controller,
      controllerAs: 'vm',
      link: link
    }
  }

  function link(scope, element, attributes) {


  }


  controller.$inject = [];

  function controller() {
    var vm = this;
  }


}());
