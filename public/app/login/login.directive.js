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

  controller.$inject = ['$http', '$window', '$location'];

  function controller($http, $window, $location) {
    let vm = this;
    vm.login = login;

    function login() {
      console.log(vm.form.login.username);
      return $http.post('http://localhost:3000/login', {username: vm.form.login.username})
      .then(function (response) {
        console.log('res: ', response);
        $window.localStorage.setItem('token', response.token);
        $location.path('/lobby');
      })
    }

  }

}());
