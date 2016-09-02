/**
* CONSTANTS
*/

// Show hitboxes for debugging
const DRAW_HITBOXES = false;

const LIMITS = {
    x: 505,
    y: 605
};

const   NUM_ROWS = 6,
        NUM_COLS = 5,
        TILE_HEIGHT = 83,
        TILE_WIDTH = 101,
        MAX_ENEMIES = 5,
        MAX_HEALTH = 3;

const PLAYER_SPAWN = {
    x: 202,
    y: 405
};

const IMG_SRC = {
    BLOCK_STONE:    'images/stone-block.png',
    BLOCK_WATER:    'images/water-block.png',
    BLOCK_GRASS:    'images/grass-block.png',
    GEM_GREEN:      'images/gem-green.png',
    GEM_BLUE:       'images/gem-blue.png',
    GEM_ORANGE:     'images/gem-orange.png',
    ENEMY_BUG:      'images/enemy-bug.png',
    CHAR_BOY:       'images/char-boy.png',
    CHAR_PRINCESS:  'images/char-princess-girl.png',
    CHAR_CAT_GIRL:  'images/char-cat-girl.png',
    CHAR_HORN_GIRL: 'images/char-horn-girl.png',
    CHAR_PINK_GIRL: 'images/char-pink-girl.png',
    SELECTOR:       'images/Selector.png',
    HEART:          'images/heart-filled.png'
};

const GEMS = [
    {sprite: IMG_SRC.GEM_GREEN,  value: 10},
    {sprite: IMG_SRC.GEM_BLUE,   value: 50},
    {sprite: IMG_SRC.GEM_ORANGE, value: 100},
];

const KEYS = {
    UP:     0,
    RIGHT:  1,
    LEFT:   2,
    DOWN:   3,
    ENTER:  4
};

const PLAYER_SPRITES = [
    IMG_SRC.CHAR_BOY,
    IMG_SRC.CHAR_PRINCESS,
    IMG_SRC.CHAR_CAT_GIRL,
    IMG_SRC.CHAR_HORN_GIRL,
    IMG_SRC.CHAR_PINK_GIRL,
];

const GAME_STATES = {
    CHOOSING: 0,
    PLAYING:  1,
    GAME_OVER: 2
};

/**
* VARIABLES
*/
var allEnemies = [],
    player,
    enemySpawner,
    hud,
    gem,
    selector,
    currentState;


/**
* CLASSES
*/

/**
* @description General Renderable class for common methods on an item drawn on the canvas
* @constructor
* @param {number} x - x coordinate of object
* @param {number} y - y coordinate of object
* @param {string} sprite - url path of image sprite
* @param {number[]} hitbox - hitbox bounds [XOffset, YOffset, Width, Height]
*/
class Renderable {
    constructor(x, y, sprite, hitbox) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.hitbox = hitbox;
        this.collisions = true;
    }

    // Draw the enemy on the screen, required method for game
    render() {
        if(DRAW_HITBOXES && this.hitbox)
            ctx.strokeRect(this.hitbox[0]+this.x, this.hitbox[1]+this.y, this.hitbox[2], this.hitbox[3]);

        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    // Does this object collide with the other object?
    checkCollision(obj) {
        if(!this.collisions || !obj.collisions)
            return;

        var leftA = this.hitbox[0] + this.x;
        var rightA = leftA + this.hitbox[2];
        var leftB = obj.hitbox[0] + obj.x;
        var rightB = leftB + obj.hitbox[2];
        var topA = this.hitbox[1] + this.y;
        var bottomA = topA + this.hitbox[3];
        var topB = obj.hitbox[1] + obj.y;
        var bottomB = topB + obj.hitbox[3];

        return leftA < rightB
            && rightA > leftB
            && topA < bottomB
            && bottomA > topB;
    }
}

/**
* @description Enemies our player must avoid
* @constructor
* @param {number} x - x coordinate of object
* @param {number} y - y coordinate of object
* @param {number} speed - movement speed
*/
class Enemy extends Renderable {
    constructor(x, y, speed) {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        super(x, y, IMG_SRC.ENEMY_BUG, [10, 80, 70,60]);
        this.speed = speed;
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

    reset() {
        this.x = -100;
    }
}

/**
* @description Our playable hero
* @constructor
* @param {string} sprite - url path of image sprite
*/
class Player extends Renderable {
    constructor(sprite) {
        super(PLAYER_SPAWN.x, PLAYER_SPAWN.y, sprite, [27, 65, 50,70]);
        this.speed = {
            x: TILE_WIDTH,
            y: TILE_HEIGHT
        };
        this.isHit = false;
    }

    update() {

    }

    render() {
        if(this.isHit) {
            ctx.save();
            ctx.translate(this.x+TILE_WIDTH+20, this.y+10);
            ctx.rotate(1);
            ctx.drawImage(Resources.get(this.sprite), 0,0);
            ctx.restore();
        } else {
            super.render();
        }
    }

    handleInput(dir) {
        switch(dir) {
            case KEYS.LEFT:
                this.x -= this.speed.x;
                if(this.x < 0)
                    this.x = 0;
                break;

            case KEYS.UP:
                this.y -= this.speed.y;
                if(this.y < -10)
                    this.y = -10;
                break;

            case KEYS.RIGHT:
                this.x += this.speed.x;
                if(this.x > LIMITS.x - TILE_WIDTH)
                    this.x = LIMITS.x - TILE_WIDTH;
                break;

            case KEYS.DOWN:
                this.y += this.speed.y;
                if(this.y > LIMITS.y - 200)
                    this.y = LIMITS.y - 200;
                break;

            default:
                console.error('Player handleInput received invalid input', dir);
                break;
        }
    }

    takeDamage() {
        this.isHit = true;
        this.collisions = false;
        setTimeout(() => { this.respawn(); }, 1000);
    }

    respawn() {
        this.x = PLAYER_SPAWN.x;
        this.y = PLAYER_SPAWN.y;
        this.isHit = false;
        this.collisions = true;
    }
}

/**
* @description Gem is a collection item that gives points
* @constructor
* @param {number} x - x coordinate of object
* @param {number} y - y coordinate of object
* @param {GEMS} gem - one of the GEMS array items
*/
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
        if (super.checkCollision(player)) {
            hud.changeScore(this.value);
            this.collisions = false;
            this.collected = true;
            setTimeout(spawnGem, 100);
        }
    }
}

/**
* @description HUD to display in-game scores and health
* @constructor
*/
class HUD {
    constructor() {
        this.score = 0;
        this.health = MAX_HEALTH;
    }

    changeScore(val) {
        this.score += val;
    }

    changeHealth(val) {
        this.health += val;
    }

    update() {
        if(this.health === 0)
            currentState = GAME_STATES.GAME_OVER;
    }

    render() {
        ctx.fillStyle = 'black';
        ctx.font = '20pt sans-serif';
        ctx.fillText(pad(this.score,6), 2,40);

        for(let i = 0; i < this.health; i++) {
            ctx.drawImage(Resources.get(IMG_SRC.HEART), 410+30*i, 18);
        }

        if(currentState === GAME_STATES.GAME_OVER) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillRect(30,180, ctx.canvas.width-60, 140);
            ctx.globalAlpha = 1;
            ctx.font = "50pt sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.fillText("GAME OVER", ctx.canvas.width/2, 250);
            ctx.font = "14pt sans-serif";
            ctx.fillText("Press any key to try again", ctx.canvas.width/2, 290);
            ctx.restore();
        }
    }
}

/**
* @description Selector to choose character
* @constructor
*/
class Selector extends Renderable{
    constructor() {
        super(202, 120, IMG_SRC.SELECTOR, null);
        this.chosen = 2;
    }

    render() {
        ctx.canvas.width = ctx.canvas.width;
        ctx.font ="28pt sans-serif";
        ctx.textAlign ="center";
        ctx.fillText("Choose your character", ctx.canvas.width/2,100);

        super.render();

        // render character sprites on top of selector
        for(var i = 0; i < 5; i++) {
            ctx.drawImage(Resources.get(PLAYER_SPRITES[i]), i*TILE_WIDTH, 120);
        }
    }

    handleInput(dir) {
        switch(dir) {
            case KEYS.LEFT:
                this.chosen--;
                this.x -= TILE_WIDTH;
                if(this.chosen < 0){
                    this.chosen = 0;
                    this.x = 0;
                }
                break;

            case KEYS.RIGHT:
                this.chosen++;
                this.x += TILE_WIDTH;
                if(this.chosen >= PLAYER_SPRITES.length){
                    this.chosen = PLAYER_SPRITES.length - 1;
                    this.x = LIMITS.x - TILE_WIDTH;
                }
                break;

            case KEYS.ENTER:
                startGame(PLAYER_SPRITES[this.chosen]);
                break;

            default:
                console.error('Selector handleInput received invalid input', dir);
                break;
        }
    }
}

function spawnGem() {
    gem = new Gem(
        Math.floor(Math.random()*NUM_COLS)*TILE_WIDTH,
        Math.floor(Math.random()*NUM_ROWS)*TILE_HEIGHT,
        GEMS[Math.floor(Math.random()*3)]);
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

function showCharacterSelect() {
    currentState = GAME_STATES.CHOOSING;
    selector = new Selector();
}

function startGame(playerSprite) {
    currentState = GAME_STATES.PLAYING;
    player = new Player(playerSprite);
    enemySpawner = setInterval(spawnEnemy,1400);
    spawnGem();
    hud = new HUD();
}


/**
* UTILITIES
*/
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        13: KEYS.ENTER,
        37: KEYS.LEFT,
        38: KEYS.UP,
        39: KEYS.RIGHT,
        40: KEYS.DOWN
    };
    if(currentState === GAME_STATES.CHOOSING)
        selector.handleInput(allowedKeys[e.keyCode]);

    else if(currentState === GAME_STATES.PLAYING)
        player.handleInput(allowedKeys[e.keyCode]);

    else if(currentState === GAME_STATES.GAME_OVER)
        showCharacterSelect();

    else
        console.error('Unknown game state', currentState);

});
