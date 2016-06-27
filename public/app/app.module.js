(function() {
  'use strict';

  var dependencies = [
    'ngRoute'
  ];

  angular.module('arenaApp', dependencies)
  .config(setupRoutes);

  setupRoutes.$inject = [
    '$routeProvider',
    '$locationProvider',
    '$httpProvider'
  ];

  function setupRoutes($routeProvider, $locationProvider, $httpProvider, env){

    $routeProvider
    .when('/', {
      template: '<aj-main></aj-main>',
    })

    $locationProvider.html5Mode(true);
  };
}());
