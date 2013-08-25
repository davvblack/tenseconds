var tick = 1;

var FIGHT_QUEUE_DEPTH = 10;

//Stance constants. Always refer to them by name.
var NO_STANCE = -1;
var HIGH_ATTACK = 0;
var HIGH_BLOCK = 1;
var LOW_ATTACK = 2;
var LOW_BLOCK = 3;
var BLOCKS = [LOW_BLOCK, HIGH_BLOCK];
var ATTACKS = [LOW_ATTACK, HIGH_ATTACK];
var BLOCK_MAP = {}
BLOCK_MAP[HIGH_ATTACK] = HIGH_BLOCK;
BLOCK_MAP[LOW_ATTACK] = LOW_BLOCK;
var STANCE_NAMES = {}
STANCE_NAMES[HIGH_ATTACK] = 'HIGH_ATTACK';
STANCE_NAMES[HIGH_BLOCK] = 'HIGH_BLOCK';
STANCE_NAMES[LOW_ATTACK] = 'LOW_ATTACK';
STANCE_NAMES[LOW_BLOCK] = 'LOW_BLOCK';
STANCE_NAMES[NO_STANCE] = 'NO_STANCE';
var STANCES = [NO_STANCE, HIGH_ATTACK, HIGH_BLOCK, LOW_ATTACK, LOW_BLOCK];

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
    
    if (BLOCKS.contains(this.fighter.stance)) {
        console.log("decay block");
        this.fighter.power = 0;
    }
    
    if ((next_move.stance != this.fighter.stance) && BLOCKS.contains(next_move.stance)) {
        console.log("new block");
        this.fighter.stance = next_move.stance;
        this.fighter.power = 1;
    }
    
    if (ATTACKS.contains(next_move.stance)) {
        this.fighter.stance = next_move.stance;
        this.fighter.power = next_move.power;
    } else {
        if (ATTACKS.contains(this.fighter.stance)) {
            this.fighter.stance = NO_STANCE;
            this.fighter.power = 0;
        }
    }
    
    var max = 0;
    i = FIGHT_QUEUE_DEPTH - 1;
    while (i-- + 1) {
        max = Math.max(max, this.queue.power);
    }
    
    this.fighter.max_power = max;
    
    var show_moves = '';
    
    for (i = 0; i < FIGHT_QUEUE_DEPTH - 1; i++) {
        this.queue[i] = this.queue[i+1];
        show_moves += this.queue[i].stance + ',';
    }
    
    
    console.log(((this.fighter.is_player)?"player:":"enemy: ") + show_moves + " stance: " + STANCE_NAMES[this.fighter.stance] + this.fighter.power);
    
    
    if (this.fighter.is_player) {
        this.queue[FIGHT_QUEUE_DEPTH - 1] = {stance: NO_STANCE, power: 0};
    } else {
        this.queue[FIGHT_QUEUE_DEPTH - 1] = {stance: (Math.random()>.5)?STANCES.random_choice(): NO_STANCE, power: 0};
    }
    
};

var Fighter = function Fighter (is_player, hp, hp_max, hp_charge, stam, stam_max, stam_charge, dmg_base, stagger, stager_charge) {
    this.is_player = is_player || false;
    this.hp = hp || 10;
    this.hp_max = hp_max || 10;
    this.hp_charge = hp_charge || 0;
    this.stam = stam || 20;
    this.stam_max = stam_max || 20;
    this.stam_charge = stam_charge || 2;
    this.dmg_base = dmg_base || .5;
    this.fight_queue = new FightQueue(this);
    this.stagger = 0;
    this.stagger_charge = -.125;
    this.target = null;
    
    //Public interface for view:
    this.tired = !stam;
    this.stance = NO_STANCE;
    this.bloodied = (hp/hp_max < .5);
    this.power = 0;
    this.max_power = 0;
}

Fighter.prototype.tick = function () {
    this.stam = Math.min(this.stam_max, this.stam + this.stam_charge);
    this.hp = Math.min(this.hp_max, this.hp + this.hp_charge);
    if (this.hp / this.hp_max >= .5) {
        this.bloodied = false;
    }
    
    this.stagger = Math.max(0, this.stagger + this.stagger_charge);
    this.tired = false;
    this.fight_queue.tick();
}

Fighter.prototype.post_tick = function () {
    
    var damage = 0;
    
    if(ATTACKS.contains(this.stance)){
        if (BLOCK_MAP[this.stance] == this.target.stance) {
            this.stagger += this.target.power;
            damage = this.power - this.target.power;
            if (damage>0) {
                this.target.damage(damage);
            }
        } else {
            this.target.damage((this.power + 1) * (1 / (1 + this.stagger)));
            this.target.stagger += this.power;
        }
        
    }
}

Fighter.prototype.add_fight = function (key_coords) {
    var stance = key_coords[0];
    var delay = key_coords[1];

    
    var energy_spent = (stance != NO_STANCE) && (FIGHT_QUEUE_DEPTH - delay);
    
    if (energy_spent > this.stam) {
        this.tired = true;
        console.log('...zzz');
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
    console.log("Making Attack " + STANCE_NAMES[attack_stance.stance] + attack_stance.power);
}

Fighter.prototype.damage = function (damage) {
    damage = Math.floor(damage*4)/4;
    this.hp -= damage;
    if (this.hp / this.hp_max < .5) {
        this.bloodied = true;
    }
    if (this.hp < 0) {
        this.dead = true;
    }
}

var TenModel = function TenModel () {
    this.player = new Fighter(true);
    this.opponent = new Fighter(false);
    
    this.player.set_target(this.opponent);
    this.opponent.set_target(this.player);
    
}

TenModel.prototype.tick = function () {
    for (member in this) {
        if (this.hasOwnProperty(member)) {
            this[member].tick();
        }
    }
    for (member in this) {
        if (this.hasOwnProperty(member) && this[member].post_tick) {
            this[member].post_tick();
        }
    }
}


var TenView = function TenView(ctx, model) {
    this.ctx = ctx;
    this.model = model;
}

TenView.prototype.render = function () {
    var fighter, prefix, i;
    var props = ["bloodied", "hp", "stam", "stagger", "tired"];
    for (member in this.model) {
        if (this.model.hasOwnProperty(member)) {
            fighter = this.model[member];
            prefix = (fighter.is_player)?"player_":"enemy_";
            for (i = 0; i < props.length; i++) {
                document.getElementById(prefix + props[i]).innerHTML = fighter[props[i]];
            }
            
            var html =""
            for (i = 0; i < fighter.fight_queue.queue.length; i++) {
                html+='<div class="action sword sword-' + fighter.fight_queue.queue[i].stance + '"></div>';
            }
            
            document.getElementById(prefix + "actions").innerHTML = html;
        }
    }
}  


var GameEngine = function GameEngine(ctx, keyboard_layout) {
    var that = this;
    
    this.ctx = ctx;
    this.keyboard_layout = keyboard_layout;

    this.model = new TenModel();
    this.view = new TenView(ctx, this.model);
    
    this.input_controller = new KeyListener(qwerty, function(input){input_handler(input, that.model)});
    
    this.heartbeat = setInterval(function () {if(tick)that.model.tick();} , 1000);
    
    this.frame_renderer = setInterval(function () {that.view.render();}, 100)
};


var ctx = new Layer(900, 500);
document.body.appendChild(ctx.canvas);

var engine = new GameEngine(ctx, qwerty);

//var listener = new KeyListener(qwerty, function(pressed){console.log(pressed)});

