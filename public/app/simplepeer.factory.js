(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('simplepeerService', factory);


  factory.$inject = [];

  function factory () {

    return {
      joinGame
    };

    function joinGame(game) {
      console.log('simplepeer service');
    }

  }
}());
