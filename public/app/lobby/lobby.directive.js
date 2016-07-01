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

  controller.$inject = ['socketService', '$scope', 'peerService', '$rootScope'];

  function controller(socketService, $scope, peerService, $rootScope) {
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

      let options = {
        game: gameOption,
        numPlayers
      };

      $rootScope.isHost = true;
      $rootScope.options = options;

      console.log('start hosting: ', gameOption, numPlayers);
      socketService.newGameHost(options);
    }

    function joinGame(game) {
      console.log('joinGame: ', game);

      $rootScope.isHost = false;
      $rootScope.options = game;

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
