(function() {
  'use strict';

  angular.module('arenaApp')
    .factory('chatService', factory);


  factory.$inject = ['sessionService'];

  function factory (sessionService) {

    var Peer = SimplePeer;
    var socket = io();
    var targetUsername = "";
    var myUsername = sessionService.myUsername;
    var p = null;

    return {
      
    };




  }
}());
