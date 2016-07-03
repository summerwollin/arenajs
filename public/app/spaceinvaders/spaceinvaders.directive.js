(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajInvaders', invadersDirective);

  function invadersDirective () {
    return {
      templateUrl: 'app/spaceinvaders/spaceinvaders.directive.html',
      controller: controller,
      controllerAs: 'vm',
      link: link
    }
  }

  function link(scope, element, attributes) {

    //  Setup the canvas.
    var canvas = document.getElementById("gameCanvas");
    console.log('canvas: ', canvas);
    canvas.width = 800;
    canvas.height = 600;

    //  Create the game.
    window.game = new Game(
      scope.isHost,
      scope.options,
      scope.backendService,
      scope.peerService,
      scope.hostService
    );

    //  Initialise it with the game canvas.
    game.initialise(canvas);

    //  Start the game.
    game.start();

    window.addEventListener("keyup", keyupFunc);
    window.addEventListener("keydown", keydownFunc);

    function keyupFunc(e) {
      var keycode = e.which || window.event.keycode;
      game.keyUp(keycode);
    }

    function keydownFunc(e) {
      var keycode = e.which || window.event.keycode;
      //  Supress further processing of left/right/space (37/29/32)
      if (keycode == 37 || keycode == 39 || keycode == 32) {
          e.preventDefault();
          e.stopPropagation();
      }
      game.keyDown(keycode);
    };

    scope.$on("$destroy", function() {
      window.removeEventListener("keyup", keyupFunc);
      window.removeEventListener("keydown", keydownFunc);
      console.log('scope was DESTROYED');
    });


  }


  controller.$inject = ['$scope', '$rootScope', '$location', 'peerService', 'hostService', 'backendService'];

  function controller($scope, $rootScope, $location, peerService, hostService, backendService) {
    var vm = this;
    $scope.peerService = peerService;
    $scope.hostService = hostService;
    $scope.backendService = backendService;
  }


}());
