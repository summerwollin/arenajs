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
    var socket = io();
    let vm = this;
    vm.login = login;

    function login() {
      return $http.post('https://arenajs.herokuapp.com/', {username: vm.form.login.username})
      .then(function (response) {
        $window.localStorage.setItem('token', response.data.token);
        socket.emit('auth', localStorage.getItem('token'));
        $location.path('/lobby');
      })
    }

  }

}());
