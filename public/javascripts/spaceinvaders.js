
function ViewMode(shipSrc, invaderSrc, width, height) {
  this.shipImg = new Image();
  this.shipImg.src = shipSrc;

  this.invaderImg = new Image();
  this.invaderImg.src = invaderSrc;

  this.shipWidth = width;
  this.shipHeight = height;
}

function Game(isHost, options, socketService, peerService, hostService) {
  console.log("isHost", isHost);
  console.log("gameOptions", options, socketService, peerService, hostService);

    //  Set the initial config.
    this.config = {
        bombRate: 0.05,
        bombMinVelocity: 50,
        bombMaxVelocity: 50,
        invaderInitialVelocity: 25,
        invaderAcceleration: 0,
        invaderDropDistance: 20,
        rocketVelocity: 120,
        rocketMaxFireRate: 2,
        gameWidth: 400,
        gameHeight: 300,
        fps: 50,
        debugMode: false,
        invaderRanks: 5,
        invaderFiles: 10,
        shipSpeed: 120,
        levelDifficultyMultiplier: 0.2,
        pointsPerInvader: 5,
        isHost,
        options,
        socketService,
        peerService,
        hostService
    };

    //  All state is in the variables below.
    this.lives = 3;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    };
    this.intervalId = 0;
    this.score = 0;
    this.level = 1;

    //  The state stack.
    this.stateStack = [];

    //  Input/output
    this.pressedKeys = {};
    this.gameCanvas = null;

    // //  All sounds.
    // this.sounds = null;
}

//  Initialis the Game with a canvas.
Game.prototype.initialise = function(gameCanvas) {
    //  Set the game canvas.
    this.gameCanvas = gameCanvas;

    //  Set the game width and height.
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };
};

Game.prototype.moveToState = function(state) {
    //  If we are in a state, leave it.
    if (this.currentState() && this.currentState().leave) {
        this.currentState().leave(game);
        this.stateStack.pop();
    }

    //  If there's an enter function for the new state, call it.
    if (state.enter) {
        state.enter(game);
    }

    //  Set the current state.
    this.stateStack.pop();
    this.stateStack.push(state);
};

//  Start the Game.
Game.prototype.start = function() {
    //  Move into the 'welcome' state.
    this.moveToState(new WelcomeState(this.config));

    //  Set the game variables.
    this.lives = 3;
    this.config.debugMode = /debug=true/.test(window.location.href);

    //  Start the game loop.
    var game = this;
    this.intervalId = setInterval(function() {
        GameLoop(game);
    }, 1000 / this.config.fps);

};

//  Returns the current state.
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

//  The main loop.
function GameLoop(game) {
    var currentState = game.currentState();
    if (currentState) {

        //  Delta t is the time to update/draw.
        var dt = 1 / game.config.fps;

        //  Get the drawing context.
        var ctx = game.gameCanvas.getContext("2d");

        //  Update if we have an update function. Also draw
        //  if we have a draw function.
        if (currentState.update) {
            currentState.update(game, dt);
        }
        if (currentState.draw) {
            currentState.draw(game, dt, ctx);
        }

    }
}


//  Inform the game a key is down.
Game.prototype.keyDown = function(keyCode) {
  console.log('keyDown:' + keyCode)
    this.pressedKeys[keyCode] = true;
    //  Delegate to the current state too.
    if (this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};

//  Inform the game a key is up.
Game.prototype.keyUp = function(keyCode) {
    console.log('keyUp')
    delete this.pressedKeys[keyCode];
    //  Delegate to the current state too.
    if (this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

function WelcomeState(config) {
  console.log('WelcomeState config', config);
}

WelcomeState.prototype.update = function(game, dt) {


};

WelcomeState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px arcadeFont";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Space Invaders", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px arcadeFont";

    ctx.fillText("Press 'Space' to start.", game.width / 2, game.height / 2);

    // if (userid) {
    //   ctx.fillText("Welcome back, " + userid + "!", game.width / 2, game.height / 2 + 40);
    // }

};

WelcomeState.prototype.keyDown = function(game, keyCode) {
    if (keyCode == 32) /*space*/ {
        //  Space starts the game.
        game.level = 1;
        game.score = 0;
        game.lives = 3;
        game.moveToState(new LevelIntroState(game.level));
    }
};

function GameOverState() {

}

GameOverState.prototype.update = function(game, dt) {

};

GameOverState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px arcadeFont";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px arcadeFont";
    ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height / 2);
    ctx.font = "16px arcadeFont";
    ctx.fillText("Press 'Space' to play again.", game.width / 2, game.height / 2 + 40);

    //add last game score to game over screen
    // if (score) {
    //   ctx.fillText("(Last score: " + score + ")", game.width / 2, game.height / 2 + 80);
    // }

  localStorage.setItem("score", game.score);


};

GameOverState.prototype.keyDown = function(game, keyCode) {
    if (keyCode == 32) /*space*/ {
        //  Space restarts the game.
        // scoreCounter(game.score);

        score = localStorage.getItem("score");
        game.lives = 3;
        game.score = 0;
        game.level = 1;
        game.moveToState(new LevelIntroState(1));
    }
};

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    //  Game state.
    this.invaderCurrentVelocity = 10;
    this.invaderCurrentDropDistance = 0;
    this.invadersAreDropping = false;
    this.lastRocketTime = null;

    //  Game entities.
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
}

PlayState.prototype.enter = function(game) {

    //  Create the ship.
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

    //  Setup initial state.
    this.invaderCurrentVelocity = 10;
    this.invaderCurrentDropDistance = 0;
    this.invadersAreDropping = false;

    //  Set the ship speed for this level, as well as invader params.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);

    //  Create the invaders.
    var ranks = this.config.invaderRanks;
    var files = this.config.invaderFiles;
    var invaders = [];
    for (var rank = 0; rank < ranks; rank++) {
        for (var file = 0; file < files; file++) {
            invaders.push(new Invader(
                (game.width / 2) + ((files / 2 - file) * 200 / files),
                (game.gameBounds.top + rank * 20),
                rank, file, 'Invader'));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {
        x: -this.invaderInitialVelocity,
        y: 0
    };
    this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt) {

    //  If the left or right arrow keys are pressed, move
    //  the ship. Check this on ticks rather than via a keydown
    //  event for smooth movement, otherwise the ship would move
    //  more like a text editor caret.
    if (game.pressedKeys[37]) {
        this.ship.x -= this.shipSpeed * dt;
    }
    if (game.pressedKeys[39]) {
        this.ship.x += this.shipSpeed * dt;
    }
    if (game.pressedKeys[32]) {
        this.fireRocket();
    }

    //  Keep the ship in bounds.
    if (this.ship.x < game.gameBounds.left) {
        this.ship.x = game.gameBounds.left;
    }
    if (this.ship.x > game.gameBounds.right) {
        this.ship.x = game.gameBounds.right;
    }

    //  Move each bomb.
    for (var i = 0; i < this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.y += dt * bomb.velocity;

        //  If the rocket has gone off the screen remove it.
        if (bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }

    //  Move each rocket.
    for (i = 0; i < this.rockets.length; i++) {
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        //  If the rocket has gone off the screen remove it.
        if (rocket.y < 0) {
            this.rockets.splice(i--, 1);
        }
    }

    //  Move the invaders.
    var hitLeft = false,
        hitRight = false,
        hitBottom = false;
    for (i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if (hitLeft == false && newx < game.gameBounds.left) {
            hitLeft = true;
        } else if (hitRight == false && newx > game.gameBounds.right) {
            hitRight = true;
        } else if (hitBottom == false && newy > game.gameBounds.bottom) {
            hitBottom = true;
        }

        if (!hitLeft && !hitRight && !hitBottom) {
            invader.x = newx;
            invader.y = newy;
        }
    }

    //  Update invader velocities.
    if (this.invadersAreDropping) {
        this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
        if (this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
            this.invadersAreDropping = false;
            this.invaderVelocity = this.invaderNextVelocity;
            this.invaderCurrentDropDistance = 0;
        }
    }
    //  If we've hit the left, move down then right.
    if (hitLeft) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {
            x: 0,
            y: this.invaderCurrentVelocity
        };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {
            x: this.invaderCurrentVelocity,
            y: 0
        };
    }
    //  If we've hit the right, move down then left.
    if (hitRight) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {
            x: 0,
            y: this.invaderCurrentVelocity
        };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {
            x: -this.invaderCurrentVelocity,
            y: 0
        };
    }
    //  If we've hit the bottom, it's game over.
    if (hitBottom) {
        this.lives = 0;
    }

    //  Check for rocket/invader collisions.
    for (i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        var bang = false;

        for (var j = 0; j < this.rockets.length; j++) {
            var rocket = this.rockets[j];

            if (rocket.x >= (invader.x - invader.width / 2) && rocket.x <= (invader.x + invader.width / 2) &&
                rocket.y >= (invader.y - invader.height / 2) && rocket.y <= (invader.y + invader.height / 2)) {

                //  Remove the rocket, set 'bang' so we don't process
                //  this rocket again.
                this.rockets.splice(j--, 1);
                bang = true;
                game.score += this.config.pointsPerInvader;
                break;
            }
        }
        if (bang) {
            this.invaders.splice(i--, 1);
        }
    }

    //  Find all of the front rank invaders.
    var frontRankInvaders = {};
    for (var i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        //  If we have no invader for game file, or the invader
        //  for game file is futher behind, set the front
        //  rank invader to game one.
        if (!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
            frontRankInvaders[invader.file] = invader;
        }
    }

    //  Give each front rank invader a chance to drop a bomb.
    for (var i = 0; i < this.config.invaderFiles; i++) {
        var invader = frontRankInvaders[i];
        if (!invader) continue;
        var chance = this.bombRate * dt;
        if (chance > Math.random()) {
            //  Fire!
            this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
                this.bombMinVelocity + Math.random() * (this.bombMaxVelocity - this.bombMinVelocity)));
        }
    }

    //  Check for bomb/ship collisions.
    for (var i = 0; i < this.bombs.length; i++) {
        var bomb = this.bombs[i];
        if (bomb.x >= (this.ship.x - this.ship.width / 2) && bomb.x <= (this.ship.x + this.ship.width / 2) &&
            bomb.y >= (this.ship.y - this.ship.height / 2) && bomb.y <= (this.ship.y + this.ship.height / 2)) {
            this.bombs.splice(i--, 1);
            game.lives--;
        }

    }

    //  Check for invader/ship collisions.
    for (var i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        if ((invader.x + invader.width / 2) > (this.ship.x - this.ship.width / 2) &&
            (invader.x - invader.width / 2) < (this.ship.x + this.ship.width / 2) &&
            (invader.y + invader.height / 2) > (this.ship.y - this.ship.height / 2) &&
            (invader.y - invader.height / 2) < (this.ship.y + this.ship.height / 2)) {
            //  Dead by collision!
            game.lives = 0;
            // game.sounds.playSound('explosion');
        }
    }

    //  Check for failure
    if (game.lives <= 0) {
        game.moveToState(new GameOverState());
    }

    //  Check for victory
    if (this.invaders.length === 0) {
        game.score += this.level * 50;
        game.level += 1;
        game.moveToState(new LevelIntroState(game.level));
    }

};

PlayState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    //  Draw ship.
    ctx.drawImage(currentMode.shipImg, this.ship.x - currentMode.shipWidth / 2, this.ship.y - currentMode.shipHeight / 2, currentMode.shipWidth, currentMode.shipHeight);

    //  Draw invaders.
    ctx.fillStyle = '#006600';
    for (var i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        ctx.drawImage(currentMode.invaderImg, invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width, invader.height);
    }

    //  Draw bombs.
    ctx.fillStyle = '#ff5555';
    for (var i = 0; i < this.bombs.length; i++) {
        var bomb = this.bombs[i];
        ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
    }

    //  Draw rockets.
    ctx.fillStyle = '#ff0000';
    for (var i = 0; i < this.rockets.length; i++) {
        var rocket = this.rockets[i];
        ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
    }

    //  Draw info.
    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14 / 2;
    ctx.font = "14px arcadeFont";
    ctx.fillStyle = '#ffffff';
    var info = "Lives: " + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.left, textYpos);
    info = "Score: " + game.score + ", Level: " + game.level;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, textYpos);

    //  If we're in debug mode, draw bounds.
    if (this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0, 0, game.width, game.height);
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
            game.gameBounds.right - game.gameBounds.left,
            game.gameBounds.bottom - game.gameBounds.top);
    }

};

PlayState.prototype.keyDown = function(game, keyCode) {

    if (keyCode == 32) {
        //  Fire!
        this.fireRocket();
    }

};

PlayState.prototype.keyUp = function(game, keyCode) {

};

PlayState.prototype.fireRocket = function() {
    //  If we have no last rocket time, or the last rocket time
    //  is older than the max rocket rate, we can fire.
    if (this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.config.rocketMaxFireRate)) {
        //  Add a rocket.
        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date()).valueOf();
    }
};

/*
    Level Intro State

    The Level Intro state shows a 'Level X' message and
    a countdown for the level.
*/
function LevelIntroState(level) {
    this.level = level;
    this.countdownMessage = "3";
}

LevelIntroState.prototype.update = function(game, dt) {

    //  Update the countdown.
    if (this.countdown === undefined) {
        this.countdown = 3; // countdown from 3 secs
    }
    this.countdown -= dt;

    if (this.countdown < 2) {
        this.countdownMessage = "2";
    }
    if (this.countdown < 1) {
        this.countdownMessage = "1";
    }
    if (this.countdown <= 0) {
        //  Move to the next level, popping this state.
        game.moveToState(new PlayState(game.config, this.level));
    }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "36px arcadeFont";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Level " + this.level, game.width / 2, game.height / 2);
    ctx.font = "24px arcadeFont";
    ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + 36);
    return;
};


/*

  Ship

  The ship has a position and that's about it.

*/
function Ship(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 16;
}

/*
    Rocket

    Fired by the ship, they've got a position, velocity and state.

    */
function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/*
    Bomb

    Dropped by invaders, they've got position, velocity.

*/
function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/*
    Invader

    Invader's have position, type, rank/file and that's about it.
*/

function Invader(x, y, rank, file, type) {
    this.x = x;
    this.y = y;
    this.rank = rank;
    this.file = file;
    this.type = type;
    this.width = 18;
    this.height = 14;
}

/*
    Game State

    A Game State is simply an update and draw proc.
    When a game is in the state, the update and draw procs are
    called, with a dt value (dt is delta time, i.e. the number)
    of seconds to update or draw.

*/
function GameState(updateProc, drawProc, keyDown, keyUp, enter, leave) {
    this.updateProc = updateProc;
    this.drawProc = drawProc;
    this.keyDown = keyDown;
    this.keyUp = keyUp;
    this.enter = enter;
    this.leave = leave;
}

//  Setup the canvas.
// var canvas = document.getElementById("gameCanvas");
// console.log('canvas: ', canvas);
// canvas.width = 800;
// canvas.height = 600;

var invadersMode = new ViewMode('/app/img/spaceship-orange.png', '/app/img/aliensprite.gif', 30, 30);
var githubMode = new ViewMode('/app/img/octocat.png', '/app/img/bitbucket.png', 35, 35);
var cookieMode = new ViewMode('/app/img/milk.png', '/app/img/cookie.png', 20, 35);

var currentMode = invadersMode;

//  Create the game.
// var game = new Game();
//
// //  Initialise it with the game canvas.
// game.initialise(canvas);
//
// //  Start the game.
// game.start();

//  Listen for keyboard events.
// window.addEventListener("keydown", function keydown(e) {
//     var keycode = e.which || window.event.keycode;
//     //  Supress further processing of left/right/space (37/29/32)
//     if (keycode == 37 || keycode == 39 || keycode == 32) {
//         e.preventDefault();
//     }
//     game.keyDown(keycode);
// });
// window.addEventListener("keyup", function keydown(e) {
//     var keycode = e.which || window.event.keycode;
//     game.keyUp(keycode);
// });
