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


    main(viewportFrame, viewport, webglError, viewportInfo, showFPS, vrToggle, mobileVrBtn, fullscreenBtn, mobileFullscreenBtn, playerPosition)

  }


  controller.$inject = [];

  function controller() {
    var vm = this;
  }


}());
