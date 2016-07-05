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


  controller.$inject = ['$http', '$window', '$location', 'backendService', '$scope'];

  function controller($http, $window, $location, backendService, $scope) {
    let vm = this;
    vm.login = login;
    vm.signup = signup;
    backendService.onStateChange(onServerStateChange);

    $scope.$on("$destroy", function () {
      backendService.removeStateChangeHandler(onServerStateChange);
    });

    function login() {
      return $http.post('login', {username: vm.form.login.username, password: vm.form.login.password})
      .then(function (response) {
        console.log('login success, set token');
        backendService.setToken(response.data.token);
      })
    }

    function signup() {
      console.log('fn signup');
      return $http.post('signup', {username: vm.form.signup.username, password: vm.form.signup.password})
      .then(function (response) {
        console.log('signup success, set token');
        backendService.setToken(response.data.token);
     })
    }

    function onServerStateChange(newState) {
      console.log('server state change to: ', newState);
      if(newState === backendService.STATE_CONNECTED) {
        $scope.$apply(function() {
          console.log('we totes should\'ve redirected', $location);
          $location.path('/lobby');
        });
      }
    }

  }

}());
