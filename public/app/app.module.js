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
    .when('/lobby', {
      template: '<aj-lobby></aj-lobby>'
    });

    $locationProvider.html5Mode(true);
  };
}());
