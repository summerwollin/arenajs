(function() {
  'use strict';

  angular.module('arenaApp')
    .directive('ajLogin', loginDirective);


  function loginDirective () {
    return {
      scope: {
        filters: '='
      },
      templateUrl: 'app/login/login.directive.html',
      controller: controller,
      controllerAs: 'vm'
    }
  }


  controller.$inject = ['$http', '$window', '$location', 'socketService', '$scope'];

  function controller($http, $window, $location, socketService, $scope) {
    let vm = this;
    vm.login = login;
    socketService.onStateChange(onServerStateChange);

    $scope.$on("$destroy", function () {
      socketService.removeStateChangeHandler(onServerStateChange);
    });

    function login() {
      return $http.post('https://arenajs.herokuapp.com/login', {username: vm.form.login.username})
      .then(function (response) {
        console.log('set token');
        socketService.setToken(response.data.token);
      })
    }

    function onServerStateChange(newState) {
      console.log('server state change to: ', newState);
      if(newState === socketService.STATE_CONNECTED) {
        $scope.$apply(function() {
          console.log('we totes should\'ve redirected', $location);
          $location.path('/lobby');
        });
      }
    }

  }

}());
