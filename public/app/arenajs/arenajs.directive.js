(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajArenajs', arenajsDirective);

  function arenajsDirective () {
    return {
      templateUrl: 'app/arenajs/arenajs.directive.html',
      controller: controller,
      controllerAs: 'vm',
      link: link
    }
  }

  function link(scope, element, attributes) {
    var viewportFrame = document.getElementById('viewport-frame');
    var viewport = document.getElementById('viewport');
    var webglError = document.getElementById('webgl-error');
    var viewportInfo = document.getElementById('viewport-info');
    var showFPS = document.getElementById('showFPS');
    var vrToggle = document.getElementById('vrToggle');
    var mobileVrBtn = document.getElementById('mobileVrBtn');
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    var mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    var playerPosition = document.getElementById('playerPosition');


    main(
      viewportFrame,
      viewport,
      webglError,
      viewportInfo,
      showFPS,
      vrToggle,
      mobileVrBtn,
      fullscreenBtn,
      mobileFullscreenBtn,
      playerPosition,
      scope.isHost,
      scope.options,
      scope.backendService,
      scope.peerService,
      scope.hostService
    )

  }


  controller.$inject = ['$scope', 'peerService', 'hostService', 'backendService'];

  function controller($scope, peerService, hostService, backendService) {
    var vm = this;
    $scope.peerService = peerService;
    $scope.hostService = hostService;
    $scope.backendService = backendService;
  }


}());
