const MAX_ENEMIES = 4;
const TILE_HEIGHT = 83;
const TILE_WIDTH = 101;
const GEMS = [
    {type: 'green', sprite: 'images/gem-green.png', value: '10'},
    {type: 'blue', sprite: 'images/gem-blue.png', value: '50'},
    {type: 'orange', sprite: 'images/gem-orange.png', value: '100'},
];

// Enemies our player must avoid
class Enemy {
    constructor(x, y, speed) {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = 'images/enemy-bug.png';
        this.x = x;
        this.y = y;
        this.speed = speed;
        //WIP: "glitch" filter, use negative
    };

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x += dt*this.speed;

        return this.x;
    };

    // Draw the enemy on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    reset() {
        this.x = -100;
    }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
class Player {
    constructor(x, y, sprite) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.speed = {
            x: 101,
            y: 83
        };
    }

    update() {

    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    handleInput(dir) {
        switch(dir) {
            case 'left':
                this.x -= this.speed.x;
                break;
            case 'up':
                this.y -= this.speed.y;
                break;
            case 'right':
                this.x += this.speed.x;
                break;
            case 'down':
                this.y += this.speed.y;
                break;
            default:
                console.error('Player handleInput received invalid input', dir);
                break;
        }
    }
}


class Gem {
    constructor(x, y, gem) {
        this.x = x;
        this.y = y;
        this.value = gem.value;
        this.sprite = gem.sprite;
    }

    update() {

    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class HUD {
    constructor() {

        this.score = 0;
    }

    update() {

    }

    render() {
        ctx.font = '20pt sans-serif';
        ctx.fillText(pad(this.score,6), 2,40);
    }


}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
// Place the player object in a variable called player
var player;
// Enemy spawn interval
var enemySpawner;
var hud = new HUD();
var gem;

function spawnPlayer() {
    player = new Player(202,405,'images/char-boy.png');
}

// Spawn up to MAX_ENEMIES number of enemies
function spawnEnemy() {
    if(allEnemies.length >= MAX_ENEMIES)
        clearInterval(enemySpawner);

    allEnemies.push(new Enemy(
        -TILE_WIDTH,
        Math.ceil(Math.random() * 3) * TILE_HEIGHT-20,
        Math.random() * 150 + 50)
    );
}

function spawnGem() {
    gem = new Gem(
        Math.floor(Math.random()*7)*TILE_WIDTH,
        Math.floor(Math.random()*6)*TILE_HEIGHT,
        GEMS[Math.floor(Math.random()*3)]);
}

function startGame() {
    spawnPlayer();
    enemySpawner = setInterval(spawnEnemy,1400);
    spawnGem();
}


startGame();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
