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

    function startHosting(gameOption) {
      console.log('start hosting: ', gameOption);
      socketService.newGameHost(gameOption);
    }

    $scope.$on('sending-hostedGames', function (event, data) {
      console.log('on result data: ', data);
      vm.hostedGames = data;
      console.log('vm.hostedGames', vm.hostedGames);
      $scope.$apply();
    })
    // $scope.$watch(function(){
    //   console.log('getting watch hostedGames', socketService.hostedGames);
    //   return socketService.hostedGames;
    // }, function(value){
    //   console.log('watching hostedGames', value);
    //
    //   vm.hostedGames = value;
    // }, true)

  }

}());
