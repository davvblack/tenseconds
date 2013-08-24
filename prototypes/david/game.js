var FIGHT_QUEUE_DEPTH = 10;

//Stance constants. Always refer to them by name.
var NO_STANCE = -1;
var HIGH_ATTACK = 0;
var HIGH_BLOCK = 1;
var LOW_ATTACK = 3;
var LOW_BLOCK = 2;
var BLOCKS = [LOW_BLOCK, HIGH_BLOCK];
var ATTACKS = [LOW_ATTACK, HIGH_ATTACK];
var BLOCK_MAP = {}
BLOCK_MAP[HIGH_ATTACK] = HIGH_BLOCK;
BLOCK_MAP[LOW_ATTACK] = LOW_BLOCK;


function input_handler(key_coords, model) {
    
    model.player.add_fight(key_coords);
}

var FightQueue = function FightQueue (fighter) {
    var i;
    
    this.fighter = fighter;
    this.queue = [];
    this.max_power = 0;
    
    for (i = 0; i < FIGHT_QUEUE_DEPTH; i++) {
        this.queue[i] = {stance: NO_STANCE, power: 0};
    }
}

FightQueue.prototype.tick = function () {
    var i;
    
    var next_move = this.queue[0];
    
    if (!((BLOCKS.contains(this.fighter.stance) && this.fighter.next_move.stance == NO_STANCE))) {
        this.fighter.stance = this.queue[0].stance;
    }
    if(ATTACKS.contains(next_move)){
        this.fighter.make_attack(next_move);
    }
    
    var max = 0;
    i = FIGHT_QUEUE_DEPTH - 1;
    while (i-- + 1) {
        max = Math.max(max, this.queue.power);
    }
    
    this.fighter.power = max;
    
    for (i = 0; i < FIGHT_QUEUE_DEPTH - 1; i++) {
        this.queue[i] = this.queue[i+1];
    }
    
    this.queue[FIGHT_QUEUE_DEPTH - 1] = {stance: NO_STANCE, power: 0};
    
    if (fighter.is_player) {
        console.log(this.queue);
    }
};

var Fighter = function Fighter (is_player, hp, hp_max, hp_charge, stam, stam_max, stam_charge, dmg_base) {
    this.is_player = is_player || false;
    this.hp = hp || 10;
    this.hp_max = hp_max || 10;
    this.hp_charge = hp_charge || 0;
    this.stam = stam || 10;
    this.stam_max = stam_max || 10;
    this.stam_charge = stam_charge || 1;
    this.dmg_base = dmg_base || .5;
    this.fight_queue = new FightQueue(this);
    this.target = null;
    
    //Public interface for view:
    this.tired = !stam;
    this.stance = NO_STANCE;
    this.blodied = (hp/hp_max < .5);
    this.charged = 0;
}

Fighter.prototype.tick = function () {
    this.stam = Math.min(this.stam_max, this.stam + this.stam_charge);
    this.hp = Math.min(this.hp_max, this.hp + this.hp_charge);
    this.tired = false;
    this.fight_queue.tick();
}

Fighter.prototype.add_fight = function (key_coords) {
    var stance = key_coords[0];
    var delay = key_coords[1];

    
    var energy_spent = (stance != NO_STANCE) && (FIGHT_QUEUE_DEPTH - delay);
    
    if (energy_spent > this.stam) {
        this.tired = true;
    } else {
        this.stam -= energy_spent;
        if ((stance != NO_STANCE) && (this.fight_queue.queue[delay].stance == stance )) {
            this.fight_queue.queue[delay].power++;
        } else {
            this.fight_queue.queue[delay].power = 0;
            this.fight_queue.queue[delay].stance = stance;
        }
    }
}

Fighter.prototype.set_target = function (new_target) {
    this.target = new_target;
}

Fighter.prototype.make_attack = function (attack_stance) {
    console.log("Making Attack " + attack_stance);
}


var TenModel = function TenModel () {
    this.player = new Fighter(true);
    this.opponent = new Fighter(false);
    
    this.player.set_target(this.opponent);
    this.opponent.set_target(this.player);
    
}

TenModel.prototype.tick = function () {
    for (member in this) {
        if ('tick' in member) {
            member.tick();
        }
    }
}



var GameEngine = function GameEngine(ctx, keyboard_layout) {
    var that = this;
    
    this.ctx = ctx;
    this.keyboard_layout = keyboard_layout;

    this.model = new TenModel();

    this.input_controller = new KeyListener(qwerty, function(input){input_handler(input, that.model)});
    
    
};


var ctx = new Layer(900, 500);
document.body.appendChild(ctx.canvas);

var engine = new GameEngine(ctx, qwerty);

//var listener = new KeyListener(qwerty, function(pressed){console.log(pressed)});

