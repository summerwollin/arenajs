/*
 * This code has been modified for multiplayer gameplay.
 * All code relating to game state, host, peer, game objects
 * other than map assets have been added by Summer Wollin.
 */

/*
 * main.js - Setup for Quake 3 WebGL demo
 */

/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

 /*
  * This code has been modified for multiplayer gameplay.
  * All code relating to game state, host, peer, game objects
  * other than map assets have been added by Summer Wollin
  */

// The bits that need to change to load different maps are right here!
// ===========================================

var mapName = 'q3tourney2';

// If you're running from your own copy of Quake 3, you'll want to use these shaders
/*var mapShaders = [
    'scripts/base.shader', 'scripts/base_button.shader', 'scripts/base_floor.shader',
    'scripts/base_light.shader', 'scripts/base_object.shader', 'scripts/base_support.shader',
    'scripts/base_trim.shader', 'scripts/base_wall.shader', 'scripts/common.shader',
    'scripts/ctf.shader', 'scripts/eerie.shader', 'scripts/gfx.shader',
    'scripts/gothic_block.shader', 'scripts/gothic_floor.shader', 'scripts/gothic_light.shader',
    'scripts/gothic_trim.shader', 'scripts/gothic_wall.shader', 'scripts/hell.shader',
    'scripts/liquid.shader', 'scripts/menu.shader', 'scripts/models.shader',
    'scripts/organics.shader', 'scripts/sfx.shader', 'scripts/shrine.shader',
    'scripts/skin.shader', 'scripts/sky.shader', 'scripts/test.shader'
];*/

// For my demo, I compiled only the shaders the map used into a single file for performance reasons
var mapShaders = ['scripts/web_demo.shader'];

// ===========================================
// Everything below here is common to all maps
var leftViewMat, rightViewMat, leftProjMat, rightProjMat;
var leftViewport, rightViewport;
var activeShader;
var map, playerMover;
var mobileSite = false;

var zAngle = 3;
var xAngle = 0;
var cameraPosition = [0, 0, 0];
var onResize = null;

// VR Globals
var vrDisplay = null;

// These values are in meters
var playerHeight = 57; // Roughly where my eyes sit (1.78 meters off the ground)
var vrIPDScale = 32.0; // There are 32 units per meter in Quake 3
var vrPose = null;

var vrDrawMode = 0;

var SKIP_FRAMES = 0;
var REPEAT_FRAMES = 1;

var demo_obj = null;

var allPeersConnected = false;

var hostPositionData = [0,0,0];
var hostAngleData;

var peerPositionData = [0,0,0];
var peerAngleData;

var playerIsHost = false;

var gameState = {
  bullets: []
};
var gameOver = false;

function isVRPresenting() {
  return (vrDisplay && vrDisplay.isPresenting);
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return unescape(pair[1]);
        }
    }
    return null;
}

// Set up basic GL State up front
function initGL(gl, canvas) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);

    leftViewMat = mat4.create();
    rightViewMat = mat4.create();
    leftProjMat = mat4.create();
    rightProjMat = mat4.create();

    leftViewport = { x: 0, y: 0, width: 0, height: 0 };
    rightViewport = { x: 0, y: 0, width: 0, height: 0 };

    demo_obj = new cube(gl);

    initMap(gl);
}

// Load the map
function initMap(gl) {
    var titleEl = document.getElementById("mapTitle");
    titleEl.innerHtml = mapName.toUpperCase();

    var tesselation = getQueryVariable("tesselate");
    if(tesselation) {
        tesselation = parseInt(tesselation, 10);
    }

    var vrMode = getQueryVariable("vrDrawMode");
    if (vrMode) {
      vrDrawMode = parseInt(vrMode, 10);
    }

    map = new q3bsp(gl);
    map.onentitiesloaded = initMapEntities;
    map.onbsp = initPlayerMover;
    //map.onsurfaces = initSurfaces;
    map.loadShaders(mapShaders);
    map.load('maps/' + mapName +'.bsp', tesselation);
}

// Process entities loaded from the map
function initMapEntities(entities) {
  if (playerIsHost) {
    respawnPlayer(0);
  } else {
    respawnPlayer(-1);
  }

}

function initPlayerMover(bsp) {
    playerMover = new q3movement(bsp);
    if (playerIsHost) {
      respawnPlayer(0);
    } else {
      respawnPlayer(-1);
    }
    document.getElementById('viewport').style.display = 'block';
    onResize();
}

var lastIndex = 0;
// "Respawns" the player at a specific spawn point. Passing -1 will move the player to the next spawn point.
function respawnPlayer(index) {
    if(map.entities && playerMover) {
        if(index == -1) {
            index = (lastIndex+1)% map.entities.info_player_deathmatch.length;
        }
        lastIndex = index;

        var spawnPoint = map.entities.info_player_deathmatch[index];
        playerMover.position = [
            spawnPoint.origin[0],
            spawnPoint.origin[1],
            spawnPoint.origin[2]+30 // Start a little ways above the floor
        ];

        playerMover.velocity = [0,0,0];

        zAngle = -(spawnPoint.angle || 0) * (3.1415/180) + (3.1415*0.5); // Negative angle in radians + 90 degrees
        xAngle = 0;
    }
}

function eulerFromQuaternion(out, q, order) {
  function clamp(value, min, max) {
    return (value < min ? min : (value > max ? max : value));
  }
  // Borrowed from Three.JS :)
  // q is assumed to be normalized
  // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
  var sqx = q[0] * q[0];
  var sqy = q[1] * q[1];
  var sqz = q[2] * q[2];
  var sqw = q[3] * q[3];

  if ( order === 'XYZ' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] - q[1] * q[2] ), ( sqw - sqx - sqy + sqz ) );
    out[1] = Math.asin(  clamp( 2 * ( q[0] * q[2] + q[1] * q[3] ), -1, 1 ) );
    out[2] = Math.atan2( 2 * ( q[2] * q[3] - q[0] * q[1] ), ( sqw + sqx - sqy - sqz ) );
  } else if ( order ===  'YXZ' ) {
    out[0] = Math.asin(  clamp( 2 * ( q[0] * q[3] - q[1] * q[2] ), -1, 1 ) );
    out[1] = Math.atan2( 2 * ( q[0] * q[2] + q[1] * q[3] ), ( sqw - sqx - sqy + sqz ) );
    out[2] = Math.atan2( 2 * ( q[0] * q[1] + q[2] * q[3] ), ( sqw - sqx + sqy - sqz ) );
  } else if ( order === 'ZXY' ) {
    out[0] = Math.asin(  clamp( 2 * ( q[0] * q[3] + q[1] * q[2] ), -1, 1 ) );
    out[1] = Math.atan2( 2 * ( q[1] * q[3] - q[2] * q[0] ), ( sqw - sqx - sqy + sqz ) );
    out[2] = Math.atan2( 2 * ( q[2] * q[3] - q[0] * q[1] ), ( sqw - sqx + sqy - sqz ) );
  } else if ( order === 'ZYX' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] + q[2] * q[1] ), ( sqw - sqx - sqy + sqz ) );
    out[1] = Math.asin(  clamp( 2 * ( q[1] * q[3] - q[0] * q[2] ), -1, 1 ) );
    out[2] = Math.atan2( 2 * ( q[0] * q[1] + q[2] * q[3] ), ( sqw + sqx - sqy - sqz ) );
  } else if ( order === 'YZX' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] - q[2] * q[1] ), ( sqw - sqx + sqy - sqz ) );
    out[1] = Math.atan2( 2 * ( q[1] * q[3] - q[0] * q[2] ), ( sqw + sqx - sqy - sqz ) );
    out[2] = Math.asin(  clamp( 2 * ( q[0] * q[1] + q[2] * q[3] ), -1, 1 ) );
  } else if ( order === 'XZY' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] + q[1] * q[2] ), ( sqw - sqx + sqy - sqz ) );
    out[1] = Math.atan2( 2 * ( q[0] * q[2] + q[1] * q[3] ), ( sqw + sqx - sqy - sqz ) );
    out[2] = Math.asin(  clamp( 2 * ( q[2] * q[3] - q[0] * q[1] ), -1, 1 ) );
  } else {
    console.log('No order given for quaternion to euler conversion.');
    return;
  }
}

var lastMove = 0;

function playerDied(which, hostService) {
  console.log("player died" + ((which === 0) ? 'host' : 'peer'));
  player = gameState.players[which];
  player.lives--;
  if(player.lives === 0) {
    var score = [gameState.players[0].lives, gameState.players[1].lives];
    hostService.sendBroadcastMessage({
      type: 'p-gameOver',
      score
    });
    gameover(score);
  }
  player.health = 100;
}

function gameover(scores) {
  var won = (playerIsHost && (scores[0] > scores[1])) ||
           (!playerIsHost && (scores[0] < scores[1]));
  var message = "Game Over!\n" +
    "Final Lives:  " + scores[0] + " - " + scores[1] + "\n" +
    ((won) ? "You Won!" : "You Lost");
  alert(message);
  gameOver = true;
  window.location = 'lobby';

  //TODO: Disable redraw and goto /lobby
}

function removeHealthFromPlayer(player, amount, hostService) {
  player.health -= amount;
  console.log("player " + player.num + " hit");
  if(player.health < 0) {
    if(player.num === 0) {
      respawnPlayer(-1);
    }
    hostService.sendBroadcastMessage({
      type: "p-playerDied",
      player: player.num
    });
    playerDied(player.num, hostService);
  }
}

function onFrame(gl, event, playerLives, hostService, peerService, opponentLives, myHealth) {
    if(!map || !playerMover) { return; }

    // Update player movement @ 60hz
    // The while ensures that we update at a fixed rate even if the rendering bogs down
    while(event.elapsed - lastMove >= 16) {
        updateInput(16, peerService);
        lastMove += 16;
    }

    if(playerIsHost && allPeersConnected) {
      if(playerMover.position[2] < -1000) {
        playerDied(0, hostService);
        respawnPlayer(-1);
        hostService.sendBroadcastMessage({
          type: "p-playerDied",
          player: 0,
        });
      }
      if(peerPositionData[2] < -1000) {
        playerDied(1, hostService);
        hostService.sendBroadcastMessage({
          type: "p-playerDied",
          player: 1,
        });
      }
      // Check bullets for collisions with players
      gameState.bullets.forEach(function(bullet, index) {
        var bulletSphere = {
          pos: bullet.pos,
          radius: 5
        };
        var playerSphere = {
          radius: 20
        };
        if(bullet.player === 1) {
          playerSphere.pos = [
            playerMover.position[0],
            playerMover.position[1],
            playerMover.position[2] + 60];
        } else {
          playerSphere.pos = [
            peerPositionData[0],
            peerPositionData[1],
            peerPositionData[2] + 60];
        }
        if(spheresCollide(bulletSphere, playerSphere)) {
          var player = gameState.players[bullet.player ^ 1];
          removeHealthFromPlayer(player, 10, hostService);
          //delete bullet
          gameState.bullets.splice(index, 1);
          return;
        }
      });
      // Move remaining bullets
      gameState.bullets.forEach(function(bullet) {
        var velocityVector = [0,10,0];
        vec3.rotateZ(velocityVector, velocityVector, vec3.create(), -bullet.zAngle);
        vec3.add(bullet.pos, bullet.pos, velocityVector);
      });
    }

    // For great laggage!
    for (var i = 0; i < REPEAT_FRAMES; ++i)
      drawFrame(gl, playerLives, hostService, peerService, opponentLives, myHealth);
}

var poseMatrix = mat4.create();
function getViewMatrix(out, pose, eye) {
  mat4.identity(out);

  mat4.translate(out, out, playerMover.position);
  //if (!vrDisplay || !vrDisplay.stageParameters)
    mat4.translate(out, out, [0, 0, playerHeight]);
  mat4.rotateZ(out, out, -zAngle);
  mat4.rotateX(out, out, -xAngle+Math.PI/2);

  if (pose) {
    var orientation = pose.orientation;
    var position = pose.position;
    if (!orientation) { orientation = [0, 0, 0, 1]; }
    if (!position) { position = [0, 0, 0]; }

    mat4.fromRotationTranslation(poseMatrix, orientation, [
      position[0] * vrIPDScale,
      position[1] * vrIPDScale,
      position[2] * vrIPDScale
    ]);
    /*if (vrDisplay.stageParameters) {
      mat4.multiply(poseMatrix, vrDisplay.stageParameters.sittingToStandingTransform, out);
    }*/

    if (eye) {
      mat4.translate(poseMatrix, poseMatrix, [eye.offset[0] * vrIPDScale, eye.offset[1] * vrIPDScale, eye.offset[2] * vrIPDScale]);
    }

    mat4.multiply(out, out, poseMatrix);
  }

  mat4.invert(out, out);
}

// Draw a single frame
function drawFrame(gl, playerLives, hostService, peerService, opponentLives, myHealth) {


    if(allPeersConnected) {
      if (playerIsHost) {
        playerLives.innerHTML = gameState.players[0].lives;
        opponentLives.innerHTML = gameState.players[1].lives;
        myHealth.innerHTML = gameState.players[0].health;

        hostService.sendBroadcastMessage({
          type: "p-state",
          position: playerMover.position,
          zAngle: zAngle,
          bullets: gameState.bullets,
          players: gameState.players
        })
      } else {
      playerLives.innerHTML = gameState.players[1].lives;
      opponentLives.innerHTML = gameState.players[0].lives;
      myHealth.innerHTML = gameState.players[1].health;

      peerService.sendToHost({
        type: "p-peerPosition",
        position: playerMover.position,
        zAngle: zAngle
      })
    }
  }

    // Clear back buffer but not color buffer (we expect the entire scene to be overwritten)
    gl.depthMask(true);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    if(!map || !playerMover) { return; }

    if (!isVRPresenting()) {
      // Matrix setup
      getViewMatrix(leftViewMat, vrPose);

      // Here's where all the magic happens...
      map.draw(leftViewMat, leftProjMat);
      if(playerIsHost && allPeersConnected) {
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [peerPositionData[0], peerPositionData[1], peerPositionData[2] + 10],
          peerAngleData,
          20);
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [peerPositionData[0], peerPositionData[1], peerPositionData[2] + 20],
          peerAngleData,
          20);
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [peerPositionData[0], peerPositionData[1], peerPositionData[2] + 40],
          peerAngleData,
          20);
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [peerPositionData[0], peerPositionData[1], peerPositionData[2] + 60],
          peerAngleData,
          20);
      } else {
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [hostPositionData[0], hostPositionData[1], hostPositionData[2] + 10],
          hostAngleData,
          20);
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [hostPositionData[0], hostPositionData[1], hostPositionData[2] + 20],
          hostAngleData,
          20);
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [hostPositionData[0], hostPositionData[1], hostPositionData[2] + 40],
          hostAngleData,
          20);
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [hostPositionData[0], hostPositionData[1], hostPositionData[2] + 60],
          hostAngleData,
          20);
      }
      gameState.bullets.forEach(function(bullet) {
        demo_obj.draw(
          leftViewMat,
          leftProjMat,
          [bullet.pos[0], bullet.pos[1], bullet.pos[2]],
          bullet.zAngle,
          2);
        });
    } else if (vrDrawMode == 1) {
      var canvas = document.getElementById("viewport");
      leftViewport.width = canvas.width / 2.0;
      leftViewport.height = canvas.height;

      rightViewport.x = canvas.width / 2.0;
      rightViewport.width = canvas.width / 2.0;
      rightViewport.height = canvas.height;

      var leftEye = vrDisplay.getEyeParameters("left");
      var rightEye = vrDisplay.getEyeParameters("right");

      getViewMatrix(leftViewMat, vrPose, leftEye);
      mat4.perspectiveFromFieldOfView(projectionMat, leftEye.fieldOfView, 1.0, 4096.0);

      getViewMatrix(rightViewMat, vrPose, rightEye);
      mat4.perspectiveFromFieldOfView(projectionMat, rightEye.fieldOfView, 1.0, 4096.0);

      map.draw(leftViewMat, leftProjMat, leftViewport,
               rightViewMat, rightProjMat, rightViewport);
    } else {
      var canvas = document.getElementById("viewport");

      var leftEye = vrDisplay.getEyeParameters("left");
      var rightEye = vrDisplay.getEyeParameters("right");

      // Left Eye
      gl.viewport(0, 0, canvas.width / 2.0, canvas.height);
      getViewMatrix(leftViewMat, vrPose, leftEye);
      mat4.perspectiveFromFieldOfView(leftProjMat, leftEye.fieldOfView, 1.0, 4096.0);

      map.draw(leftViewMat, leftProjMat);

      // Right Eye
      gl.viewport(canvas.width / 2.0, 0, canvas.width / 2.0, canvas.height);
      getViewMatrix(rightViewMat, vrPose, rightEye);
      mat4.perspectiveFromFieldOfView(rightProjMat, rightEye.fieldOfView, 1.0, 4096.0);

      map.draw(rightViewMat, rightProjMat);
    }

    if (vrDisplay && vrDisplay.isPresenting)
      vrDisplay.submitFrame(vrPose);
}

var pressed = new Array(128);
var cameraMat = mat4.create();

function moveLookLocked(xDelta, yDelta) {
    zAngle += xDelta*0.0025;
    while (zAngle < 0)
        zAngle += Math.PI*2;
    while (zAngle >= Math.PI*2)
        zAngle -= Math.PI*2;

  if (!isVRPresenting()) {
    xAngle += yDelta*0.0025;
    while (xAngle < -Math.PI*0.5)
        xAngle = -Math.PI*0.5;
    while (xAngle > Math.PI*0.5)
        xAngle = Math.PI*0.5;
  }
}

function filterDeadzone(value) {
    return Math.abs(value) > 0.35 ? value : 0;
}

var vrEuler = vec3.create();
function moveViewOriented(dir, frameTime) {
  if(dir[0] !== 0 || dir[1] !== 0 || dir[2] !== 0) {
      mat4.identity(cameraMat);
      if (isVRPresenting()) {
        eulerFromQuaternion(vrEuler, vrPose.orientation, 'YXZ');
        mat4.rotateZ(cameraMat, cameraMat, zAngle - vrEuler[1]);
      } else {
        mat4.rotateZ(cameraMat, cameraMat, zAngle);
      }
       mat4.invert(cameraMat, cameraMat);

      vec3.transformMat4(dir, dir, cameraMat);
  }

  // Send desired movement direction to the player mover for collision detection against the map
  playerMover.move(dir, frameTime);
}

function updateInput(frameTime, peerService) {
    if(!playerMover) { return; }

    var dir = [0, 0, 0];

    // This is our first person movement code. It's not really pretty, but it works
    if((!playerIsHost) || allPeersConnected) {
      if(pressed['W'.charCodeAt(0)]) {
          dir[1] += 1;
      }
      if(pressed['S'.charCodeAt(0)]) {
          dir[1] -= 1;
      }
      if(pressed['A'.charCodeAt(0)]) {
          dir[0] -= 1;
      }
      if(pressed['D'.charCodeAt(0)]) {
          dir[0] += 1;
      }
      if(pressed['F'.charCodeAt(0)]) {
        spawnBullet(playerMover.position, zAngle, peerService);
      }
    }

    var gamepads = [];
    if (navigator.getGamepads) {
        gamepads = navigator.getGamepads();
    } else if (navigator.webkitGetGamepads) {
        gamepads = navigator.webkitGetGamepads();
    }

    for (var i = 0; i < gamepads.length; ++i) {
        var pad = gamepads[i];
        if(pad) {
            dir[0] += filterDeadzone(pad.axes[0]);
            dir[1] -= filterDeadzone(pad.axes[1]);

            moveLookLocked(
                filterDeadzone(pad.axes[2]) * 25.0,
                filterDeadzone(pad.axes[3]) * 25.0
            );

            for(var j = 0; j < Math.max(pad.buttons.length, 4); ++j) {
                var button = pad.buttons[j];
                if (typeof(button) == "number" && button == 1.0) {
                    playerMover.jump();
                } else if (button.pressed) {
                    playerMover.jump();
                }
            }
        }
    }

    if (vrDisplay) {
      vrPose = vrDisplay.getPose();
    }

    moveViewOriented(dir, frameTime);
}

// Set up event handling
function initEvents() {
    var movingModel = false;
    var lastX = 0;
    var lastY = 0;
    var lastMoveX = 0;
    var lastMoveY = 0;
    var viewport = document.getElementById("viewport");
    var viewportFrame = document.getElementById("viewport-frame");

    document.addEventListener("keydown", function(event) {

        if(event.keyCode == 32 && !pressed[32]) {
          console.log('jump pressed: ', playerIsHost, allPeersConnected);
          if ((!playerIsHost) || allPeersConnected) {
            playerMover.jump();
          }
        }
        pressed[event.keyCode] = true;
        if ((event.keyCode == 'W'.charCodeAt(0) ||
             event.keyCode == 'S'.charCodeAt(0) ||
             event.keyCode == 'A'.charCodeAt(0) ||
             event.keyCode == 'D'.charCodeAt(0) ||
             event.keyCode == 32) && !event.ctrlKey) {
            event.preventDefault();
        }
    }, false);

    document.addEventListener("keypress", function(event) {
        if(event.charCode == 'R'.charCodeAt(0) || event.charCode == 'r'.charCodeAt(0)) {
          if ((!playerIsHost) || allPeersConnected) {
            respawnPlayer(-1);
          }
        }
        if(event.charCode == 'C'.charCodeAt(0) || event.charCode == 'c'.charCodeAt(0)) {
            if (vrDisplay) {
              vrDisplay.resetPose();
            }
        }
    }, false);

    document.addEventListener("keyup", function(event) {
        pressed[event.keyCode] = false;
    }, false);

    function startLook(x, y) {
        movingModel = true;

        lastX = x;
        lastY = y;
    }

    function endLook() {
        movingModel = false;
    }

    function moveLook(x, y) {
        var xDelta = x - lastX;
        var yDelta = y - lastY;
        lastX = x;
        lastY = y;

        if (movingModel) {
            moveLookLocked(xDelta, yDelta);
        }
    }

    function startMove(x, y) {
        lastMoveX = x;
        lastMoveY = y;
    }

    function moveUpdate(x, y, frameTime) {
        var xDelta = x - lastMoveX;
        var yDelta = y - lastMoveY;
        lastMoveX = x;
        lastMoveY = y;

        var dir = [xDelta, yDelta * -1, 0];

        moveViewOriented(dir, frameTime*2);
    }

    viewport.addEventListener("click", function(event) {
        viewport.requestPointerLock();
    }, false);

    // Mouse handling code
    // When the mouse is pressed it rotates the players view
    viewport.addEventListener("mousedown", function(event) {
        if(event.which == 1) {
            startLook(event.pageX, event.pageY);
        }
    }, false);
    viewport.addEventListener("mouseup", function(event) {
        endLook();
    }, false);
    viewportFrame.addEventListener("mousemove", function(event) {
        if(document.pointerLockElement) {
            moveLookLocked(event.movementX, event.movementY);
        } else {
            moveLook(event.pageX, event.pageY);
        }
    }, false);

    // Touch handling code
    viewport.addEventListener('touchstart', function(event) {
        var touches = event.touches;
        switch(touches.length) {
            case 1: // Single finger looks around
                startLook(touches[0].pageX, touches[0].pageY);
                break;
            case 2: // Two fingers moves
                startMove(touches[0].pageX, touches[0].pageY);
                break;
            case 3: // Three finger tap jumps
                playerMover.jump();
                break;
            default:
                return;
        }
        event.stopPropagation();
        event.preventDefault();
    }, false);
    viewport.addEventListener('touchend', function(event) {
        endLook();
        return false;
    }, false);
    viewport.addEventListener('touchmove', function(event) {
        var touches = event.touches;
        switch(touches.length) {
            case 1:
                moveLook(touches[0].pageX, touches[0].pageY);
                break;
            case 2:
                moveUpdate(touches[0].pageX, touches[0].pageY, 16);
                break;
            default:
                return;
        }
        event.stopPropagation();
        event.preventDefault();
    }, false);
}

// Utility function that tests a list of webgl contexts and returns when one can be created
// Hopefully this future-proofs us a bit
function getAvailableContext(canvas, contextList) {
    if (canvas.getContext) {
        for(var i = 0; i < contextList.length; ++i) {
            try {
                var context = canvas.getContext(contextList[i], { antialias:false });
                if(context !== null)
                    return context;
            } catch(ex) { }
        }
    }
    return null;
}

function spheresCollide(sphere1, sphere2) {
  var diffX = (sphere2.pos[0] - sphere1.pos[0]);
  var diffY = (sphere2.pos[1] - sphere1.pos[1]);
  var diffZ = (sphere2.pos[2] - sphere1.pos[2]);
  var distance = Math.sqrt((diffX * diffX) + (diffY * diffY) + (diffZ * diffZ));
  return (sphere1.radius + sphere2.radius) > distance;
}

function spawnBullet(pos, zAngle, peerService) {
  console.log("shots", gameState.bullets.length);
  if(playerIsHost) {
    gameState.bullets.push({
      pos: [pos[0], pos[1], pos[2] + 55],
      player: 0,
      zAngle});
  } else {
    peerService.sendToHost({
      type: "p-shotsFired!",
      pos: [pos[0], pos[1], pos[2] + 55],
      zAngle
    })
  }
}

function renderLoop(gl, element, stats, playerLives, hostService, peerService, opponentLives, myHealth) {
    var startTime = new Date().getTime();
    var lastTimestamp = startTime;
    var lastFps = startTime;

    var frameId = 0;

    function onRequestedFrame(){
        timestamp = new Date().getTime();
        if (gameOver) {
          //console.log('window.location: ', window.location);
          //window.location = 'lobby';
        }

        window.requestAnimationFrame(onRequestedFrame, element);

        frameId++;
        if (SKIP_FRAMES != 0 && frameId % SKIP_FRAMES != 0)
          return;

        stats.begin();

        onFrame(gl, {
            timestamp: timestamp,
            elapsed: timestamp - startTime,
            frameTime: timestamp - lastTimestamp
        }, playerLives, hostService, peerService, opponentLives, myHealth);

        stats.end();
    }
    window.requestAnimationFrame(onRequestedFrame, element);
}

function main(
  viewportFrame,
  viewport,
  webglError,
  viewportInfo,
  showFPS,
  vrToggle,
  mobileVrBtn,
  fullscreenButton,
  mobileFullscreenBtn,
  playerLives,
  isHost,
  options,
  backendService,
  peerService,
  hostService,
  opponentLives,
  myHealth,
  startingDiv,
  waitingDiv
) {
    if (isHost) {

      playerIsHost = true;

      gameState = {
        players: [
          {lives: 3, health: 100, num: 0},
          {lives: 3, health: 100, num: 1}
        ],
        bullets: [],
      };

      hostService.hostGame(options.numPlayers);
      hostService.onSignallingReady(function(data, username) {
        backendService.answer(username, data);
      });

      backendService.onJoinGame(function(msg) {
        hostService.joinGameReceived(msg);
      });

      hostService.onAllPeersConnected(function() {
        console.log('arenajs [onAllPeersConnected]');
        waitingDiv.style.display = 'none';
        allPeersConnected = true;
        hostService.sendBroadcastMessage({type: 'overall-allClear'});
        // console.log('Ready...Set...play!');
        // startingDiv.style.display = 'block';
        // console.log('after style = block');
        //
        // setTimeout(removeStartingDiv(), 20000);
        // function removeStartingDiv() {
        //   console.log('~~~REMOVE_STARTING_DIV~~~');
        //   startingDiv.style.display = 'none';
        // }
      })

      hostService.onDataReceived(function(peer, msg) {
        if(msg.type === "p-peerPosition") {
          peerPositionData = msg.position;
          peerAngleData = msg.zAngle;
        } else if (msg.type === "p-shotsFired!") {
          gameState.bullets.push({
            pos: msg.pos,
            player: 1,
            zAngle: msg.zAngle});
        } else {
          console.log("unknown message[" + peer + "]", msg)
        }
      })

      //this.moveToState(new WelcomeState(this));

    } else {
      waitingDiv.style.display = 'none';
      let game = this;
      peerService.onDataReceived(function (msg) {
        if(msg.type === "p-state") {
          hostPositionData = msg.position;
          hostAngleData = msg.zAngle;
          gameState = {bullets: msg.bullets, players: msg.players};
          allPeersConnected = true;
        } else if(msg.type === 'p-gameOver') {
          gameover(msg.score);
        } else if(msg.type === 'p-playerDied') {
          if(msg.player === 1) {
            console.log("I totes died");
            respawnPlayer(-1);
          }
        } else {
          console.log("unknown message[host]", msg);
        }
      })
      //this.moveToState(new GhostedLevelIntroState());
    }

      var stats = new Stats();
      viewportFrame.appendChild( stats.domElement );

      var canvas = viewport;

      // Get the GL Context (try 'webgl' first, then fallback)
      var gl = getAvailableContext(canvas, ['webgl', 'experimental-webgl']);

      onResize = function() {
          if (vrDisplay && vrDisplay.isPresenting) {
            var leftEye = vrDisplay.getEyeParameters("left");
            var rightEye = vrDisplay.getEyeParameters("right");

            canvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
            canvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
          } else {
            var devicePixelRatio = window.devicePixelRatio || 1;

            if(document.fullscreenElement) {
                canvas.width = screen.width * devicePixelRatio;
                canvas.height = screen.height * devicePixelRatio;
            } else {
                canvas.width = canvas.clientWidth * devicePixelRatio;
                canvas.height = canvas.clientHeight * devicePixelRatio;
            }

            if (!isVRPresenting()) {
              gl.viewport(0, 0, canvas.width, canvas.height);
              mat4.perspective(leftProjMat, 45.0, canvas.width/canvas.height, 1.0, 4096.0);
            }
          }
      }

      if(!gl) {
          viewportFrame.style.display = 'none';
          webglError.style.display = 'block';
      } else {
          viewportInfo.style.display = 'block';
          initEvents();
          initGL(gl, canvas);
          renderLoop(gl, canvas, stats, playerLives, hostService, peerService, opponentLives, myHealth);
      }

      onResize();
      window.addEventListener("resize", onResize, false);

      showFPS.addEventListener("change", function() {
          stats.domElement.style.display = showFPS.checked ? "block" : "none";
      });

      function EnumerateVRDisplays(displays) {
        if (displays.length > 0) {
          vrDisplay = displays[0];

          vrToggle.style.display = "block";
          mobileVrBtn.style.display = "block";

          // Handle VR presentation change
          window.addEventListener("vrdisplaypresentchange", function() {
            onResize();
          }, false);
        }
      }

      if (navigator.getVRDisplays) {
        navigator.getVRDisplays().then(EnumerateVRDisplays);
      }

      /*var playMusic = document.getElementById("playMusic");
      playMusic.addEventListener("change", function() {
          if(map) {
              map.playMusic(playMusic.checked);
          }
      });*/

      // Handle fullscreen transition
      document.addEventListener("fullscreenchange", function() {
          if(document.fullscreenElement) {
              viewport.requestPointerLock(); // Attempt to lock the mouse automatically on fullscreen
          }
          onResize();
      }, false);

      // Fullscreen
      function goFullscreen() {
          viewportFrame.requestFullScreen();
      }
      fullscreenButton.addEventListener('click', goFullscreen, false);
      mobileFullscreenBtn.addEventListener('click', goFullscreen, false);

      // VR
      function presentVR() {
        if (vrDisplay.isPresenting) {
          vrDisplay.exitPresent();
        } else {
          xAngle = 0.0;
          vrDisplay.requestPresent({ source: viewport });
        }
      }


    //vrBtn.addEventListener("click", presentVR, false);
  //  mobileVrBtn.addEventListener("click", presentVR, false);

}
//window.addEventListener("load", main); // Fire this once the page is loaded up
