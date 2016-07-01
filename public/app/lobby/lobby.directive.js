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

  controller.$inject = ['socketService', '$scope', 'peerService'];

  function controller(socketService, $scope, peerService) {
    var vm = this;
    vm.startHosting = startHosting;
    vm.hostedGames = [];
    vm.joinGame = joinGame;
    activate();

    function activate() {
      socketService.getHostedGames();
      console.log('activate: ', vm.hostedGames);
    }

    function startHosting(gameOption, numPlayers) {
      if (numPlayers === undefined) {
        numPlayers = 2;
      }
      console.log('start hosting: ', gameOption, numPlayers);
      socketService.newGameHost({game: gameOption, numPlayers: numPlayers});
    }

    function joinGame(game) {
      console.log('joinGame: ', game);
      peerService.joinGame(game);
    }

    $scope.$on('sending-hostedGames', function (event, data) {
      console.log('on result data: ', data);
      vm.hostedGames = data;
      console.log('vm.hostedGames', vm.hostedGames);
      $scope.$apply();
    })

  }

}());
