(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajLobby', lobbyDirective);


  function lobbyDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/lobby/lobby.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }

  controller.$inject = ['socketService', '$scope'];

  function controller(socketService, $scope) {
    var vm = this;
    vm.startHosting = startHosting;
    vm.hostedGames = [];
    vm.joinGame = joinGame;
    activate();

    function activate() {
      socketService.getHostedGames();
      console.log('activate: ', vm.hostedGames);
    }

    function startHosting(gameOption) {
      console.log('start hosting: ', gameOption);
      socketService.newGameHost(gameOption);
    }

    function joinGame(game) {
      console.log('joinGame: ', game);
    }

    $scope.$on('sending-hostedGames', function (event, data) {
      console.log('on result data: ', data);
      vm.hostedGames = data;
      console.log('vm.hostedGames', vm.hostedGames);
      $scope.$apply();
    })

  }

}());
