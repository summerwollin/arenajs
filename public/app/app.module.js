(function() {
  'use strict';

  var dependencies = [
    'ngRoute',
  ];

  angular.module('arenaApp', dependencies)
  .config(setupRoutes)
  .controller('MainController', function ($scope, sessionService, $location) {

    $scope.canvasWidth = 400;
    $scope.canvasHeight = 400;
    $scope.dofillcontainer = true;
    $scope.scale = 1;
    $scope.materialType = 'lambert';

    var vm = this;
    vm.session = sessionService;
    vm.session.users = [];

    var targetUsername = "";
    var Peer = SimplePeer;


    function onUserAdded(username) {
        if (vm.session.myUsername !== username) {
          if (!vm.session.users.includes(username)) {
            vm.session.users.push(username);
            $scope.$apply();
            console.log('trying to add user', username, vm.session.users);
          } else {
            console.log('vm.session.users already had', username, vm.session.users);
          }
        }
    }

  });

  setupRoutes.$inject = [
    '$routeProvider',
    '$locationProvider',
    '$httpProvider'
  ];

  function setupRoutes($routeProvider, $locationProvider, $httpProvider){



    $routeProvider
    .when('/', {
      template: '<aj-main></aj-main>',
      resolve: {
        startAuth: function (backendService, $location) {
          console.log('startAuthorization /');
          backendService.startAuthorization()
          .then(function (response) {
            backendService.removeGameSessions();
            console.log('startAuth response: ', response);
            $location.path('/lobby');
          })
          .catch(function (er) {
            console.log('resolve catch: ', er);
          })
        }
      }
    })
    .when('/lobby', {
      template: '<aj-lobby></aj-lobby>',
      resolve: {
        startAuth: function (backendService, $location) {
          console.log('startAuthorization /lobby');
          backendService.startAuthorization()
          .then(function (response) {
            backendService.removeGameSessions();
            console.log('startAuth response: ', response);
          })
          .catch(function (er) {
            console.log('resolve catch: ', er);
            $location.path('/');
          })
        }
      }
    })
    .when('/invaders', {
      template: '<aj-invaders></aj-invaders>'
    })
    .when('/webgl', {
      template: '<aj-webgl></aj-webgl>'
    })
    .when('/arenajs', {
      template: '<aj-arenajs></aj-arenajs>'
    });

    $locationProvider.html5Mode(true);
  };
}());
