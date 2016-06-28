(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajWebgl', webglDirective);

  function webglDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/webGl/webGl.directive.html',
      controller: controller,
      controllerAs: 'vm',
      link: link
    }
  }


  function link(scope, element, attributes) {


  }





  controller.$inject = ['$scope'];

  function controller($scope) {
    $scope.canvasWidth = 400;
    $scope.canvasHeight = 400;
    $scope.dofillcontainer = true;
    $scope.scale = 1;
    $scope.materialType = 'lambert';

  }


}());
