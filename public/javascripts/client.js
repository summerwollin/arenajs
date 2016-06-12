var socket = io();
var myUsername = "";
var targetUsername = "";
var peerConnection = null;

var dataChannel = null;

function handleICEConnectionStateChangeEvent(event) {
console.log("*** ICE connection state changed to " + peerConnection.iceConnectionState);

  switch(peerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      //closeVideoCall();
      break;
  }
}


function handleRemoveStreamEvent(event) {
console.log("*** Stream removed");
  //closeVideoCall();
}

function handleICECandidateEvent(event) {
  if (event.candidate) {
  console.log("Outgoing ICE candidate: " + event.candidate.candidate);

    //sendToServer({
    //  type: "new-ice-candidate",
    //  target: targetUsername,
    //  candidate: event.candidate
    //});
  }
}


function handleICEGatheringStateChangeEvent(event) {
console.log("*** ICE gathering state changed to: " + peerConnection.iceGatheringState);
}

function handleSignalingStateChangeEvent(event) {
console.log("*** WebRTC signaling state changed to: " + peerConnection.signalingState);
  switch(peerConnection.signalingState) {
    case "closed":
      //closeVideoCall();
      break;
  }
}

  function handleNegotiationNeededEvent() {
  console.log("*** Negotiation needed");

  console.log("---> Creating offer");
    peerConnection.createOffer().then(function(offer) {
    console.log("---> Creating new description object to send to remote peer");
      return peerConnection.setLocalDescription(offer);
    })
    .then(function() {
    console.log("---> Sending offer to remote peer");
      //sendToServer({
      //  name: myUsername,
      //  target: targetUsername,
      //  type: "video-offer",
      //  sdp: peerConnection.localDescription
      //});
    })
    .catch(reportError);
  }

function handleSendChannelStatusChange(event) {
console.log("handleSendChannelStatusChange", event);
  // if (sendChannel) {
  //   var state = sendChannel.readyState;
  //
  //   if (state === "open") {
  //     messageInputBox.disabled = false;
  //     messageInputBox.focus();
  //     sendButton.disabled = false;
  //     disconnectButton.disabled = false;
  //     connectButton.disabled = true;
  //   } else {
  //     messageInputBox.disabled = true;
  //     sendButton.disabled = true;
  //     connectButton.disabled = false;
  //     disconnectButton.disabled = true;
  //   }
  // }
}

function createPeerConnection() {
  console.log("Setting up a connection...");

// Create an RTCPeerConnection which knows to use our chosen
// STUN server.

peerConnection = new RTCPeerConnection({
  iceServers: [     // Information about ICE servers - Use your own!
//    {url:'stun:stun01.sipphone.com'},
    {url:'stun:stun.ekiga.net'}
    // {url:'stun:stun.fwdnet.net'},
    // {url:'stun:stun.ideasip.com'},
    // {url:'stun:stun.iptel.org'},
    // {url:'stun:stun.rixtelecom.se'},
    // {url:'stun:stun.schlund.de'},
    // {url:'stun:stun.l.google.com:19302'},
    // {url:'stun:stun1.l.google.com:19302'},
    // {url:'stun:stun2.l.google.com:19302'},
    // {url:'stun:stun3.l.google.com:19302'},
    // {url:'stun:stun4.l.google.com:19302'},
    // {url:'stun:stunserver.org'},
    // {url:'stun:stun.softjoys.com'},
    // {url:'stun:stun.voiparound.com'},
    // {url:'stun:stun.voipbuster.com'},
    // {url:'stun:stun.voipstunt.com'},
    // {url:'stun:stun.voxgratia.org'},
    // {url:'stun:stun.xten.com'},
    // {
    // 	url: 'turn:numb.viagenie.ca',
    // 	credential: 'muazkh',
    // 	username: 'webrtc@live.com'
    // },
    // {
    // 	url: 'turn:192.158.29.39:3478?transport=udp',
    // 	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    // 	username: '28224511:1379330808'
    // },
    // {
    // 	url: 'turn:192.158.29.39:3478?transport=tcp',
    // 	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    // 	username: '28224511:1379330808'
    // }
  ]
});

console.log("peerConnection", peerConnection);


  // Set up event handlers for the ICE negotiation process.

  peerConnection.onicecandidate = handleICECandidateEvent;
  peerConnection.onremovestream = handleRemoveStreamEvent;
  peerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
  peerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  peerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;

  dataChannel = peerConnection.createDataChannel('sendChannel');
  dataChannel.onopen = handleSendChannelStatusChange;
  dataChannel.onclose = handleSendChannelStatusChange;

  peerConnection.createOffer();
}

function onInvite(username) {
    console.log("Starting to prepare an invitation");
    if (peerConnection !== null) {
      alert("You can't start a call because you already have one open!");
    } else {
      // Record the username being called for future reference

      targetUsername = username;
      console.log("Inviting user " + targetUsername);

      // Call createPeerConnection() to create the RTCPeerConnection.

      console.log("Setting up connection to invite user: " + targetUsername);
      createPeerConnection();
    }
}

function onUserAdded(username) {
  if(myUsername !== username) {
    $('#ul-users').append(
      $('<li>').text(username)
      .on('click', function() {
        onInvite(username);
      }));
    }
  }

  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('connect', function() {
    socket.emit('auth', localStorage.getItem('token'));
  });
  socket.on('auth-ok', function(msg) {
    console.log('got auth ok msg', msg);
    $('#h1-username').text("User: " + msg.username);
    myUsername = msg.username;
  });
  socket.on('chat message', function(msg){
    console.log('got chat message msg', msg);
    $('#messages').append($('<li>').text(msg));
  });
  socket.on('currentUsers', function (msg) {
    console.log('got curentUsers msg', msg);
    msg.forEach(function (user) {
      onUserAdded(user);
    });
  });
  socket.on('user added', function(user) {
    console.log('got user added msg', user);
    onUserAdded(user);
  });
  socket.on('user disconnected', function (msg) {
    console.log('got user disconnected msg', msg);
    $('#ul-users').empty();
    msg.users.forEach(function (user) {
      onUserAdded(user);
    })
    console.log(msg.username, ': disconnected');
  })


function reportError(errMessage) {
  log_error("Error " + errMessage.name + ": " + errMessage.message);
}


function log_error(text) {
  var time = new Date();

  console.error("[" + time.toLocaleTimeString() + "] " + text);
}
