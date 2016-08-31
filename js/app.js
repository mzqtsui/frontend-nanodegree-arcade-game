const LIMITS = {
    x: 505,
    y: 605
};

const DRAW_HITBOXES = false;
const MAX_ENEMIES = 4;
const TILE_HEIGHT = 83;
const TILE_WIDTH = 101;
const GEMS = [
    {type: 'green', sprite: 'images/gem-green.png', value: 10},
    {type: 'blue', sprite: 'images/gem-blue.png', value: 50},
    {type: 'orange', sprite: 'images/gem-orange.png', value: 100},
];

// General Renderable class for common methods on an item drawn on the canvas
class Renderable {
    constructor(x, y, sprite, hitbox) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.hitbox = hitbox; //[XOffset, YOffset, Width, Height]
        this.collisions = true;
    }

    // Draw the enemy on the screen, required method for game
    render() {
        if(DRAW_HITBOXES)
            ctx.strokeRect(this.hitbox[0]+this.x, this.hitbox[1]+this.y, this.hitbox[2], this.hitbox[3]);

        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    // Does this object collide with the player?
    checkPlayerCollision(p) {
        if(!this.collisions)
            return;

        var leftA = this.hitbox[0] + this.x;
        var rightA = leftA + this.hitbox[2];
        var leftB = p.hitbox[0] + p.x;
        var rightB = leftB + p.hitbox[2];
        var topA = this.hitbox[1] + this.y;
        var bottomA = topA + this.hitbox[3];
        var topB = p.hitbox[1] + p.y;
        var bottomB = topB + p.hitbox[3];

        return (leftA < rightB
            && rightA > leftB
            && topA < bottomB
            && bottomA > topB);
    }
}


// Enemies our player must avoid
class Enemy extends Renderable {
    constructor(x, y, speed) {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        super(x, y, 'images/enemy-bug.png', [0, 80, 95,60]);
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
        super.checkPlayerCollision(player);
        return this.x;
    };

    reset() {
        this.x = -100;
    }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
class Player extends Renderable {
    constructor(x, y, sprite) {
        super(x, y, sprite, [20, 65, 62,70]);
        this.speed = {
            x: 101,
            y: 83
        };
    }

    update() {

    }

    handleInput(dir) {
        switch(dir) {
            case 'left':
                this.x -= this.speed.x;
                if(this.x < 0)
                    this.x = 0;
                break;

            case 'up':
                this.y -= this.speed.y;
                if(this.y < -10)
                    this.y = -10;
                break;

            case 'right':
                this.x += this.speed.x;
                if(this.x > LIMITS.x - TILE_WIDTH)
                    this.x = LIMITS.x - TILE_WIDTH;
                break;

            case 'down':
                this.y += this.speed.y;
                if(this.y > LIMITS.y - 200)
                    this.y = LIMITS.y - 200;
                break;

            default:
                console.error('Player handleInput received invalid input', dir);
                break;
        }
    }
}


class Gem extends Renderable {
    constructor(x, y, gem) {
        super(x, y, gem.sprite, [18, 52, 66,75]);
        this.value = gem.value;
        this.collected = false;
    }

    update() {
        if(this.collected) {
            this.y -= 5;
        }
        if (super.checkPlayerCollision(player)) {
            hud.addScore(this.value);
            this.collisions = false;
            this.collected = true;
            setTimeout(spawnGem, 100);
        }
    }
}

class HUD {
    constructor() {

        this.score = 0;
    }

    addScore(val) {
        this.score += val;
    }

    update() {

    }

    render() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0, 101,40);
        ctx.fillStyle = 'black';
        ctx.font = '20pt sans-serif';
        ctx.fillText(pad(this.score,6), 2,40);
    }
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}


// Now instantiate your objects.
var allEnemies = [],
    player,
    enemySpawner,
    hud,
    gem;

function spawnPlayer() {
    player = new Player(202,405,'images/char-boy.png');
}

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
        Math.floor(Math.random()*5)*TILE_WIDTH,
        Math.floor(Math.random()*6)*TILE_HEIGHT,
        GEMS[Math.floor(Math.random()*3)]);
}

function startGame() {
    spawnPlayer();
    enemySpawner = setInterval(spawnEnemy,1400);
    spawnGem();
    hud = new HUD();
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
