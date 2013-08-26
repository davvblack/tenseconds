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
var COUNTER_MAP = {}
COUNTER_MAP[HIGH_ATTACK] = HIGH_BLOCK;
COUNTER_MAP[LOW_ATTACK] = LOW_BLOCK;
COUNTER_MAP[HIGH_BLOCK] = LOW_ATTACK;
COUNTER_MAP[LOW_BLOCK] = HIGH_ATTACK;
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
   
    //console.log(((this.fighter.is_player)?"player:":"enemy: ") + show_moves + " stance: " + STANCE_NAMES[this.fighter.stance] + this.fighter.power);
    
    this.queue[FIGHT_QUEUE_DEPTH - 1] = {stance: NO_STANCE, power: 0};
};

var MockBody = function MockBody () {};

MockBody.prototype.add_fight = function (fight_coords) {
    console.log(fight_coords);
}

var AiManager = function AiManager (body, ai_params) {
    this.initiative = .4;
    this.high_low = .5;
    this.reactiveness = 0;
    this.agro = .6;
    this.defense = .4;
    this.berserk = 0;

    for (var param in (ai_params || {}))
        if (ai_params.hasOwnProperty(param))
            this[param] = ai_params[param];

    this.body = body;
}

AiManager.prototype.pick_action = function () {
    if (roll(this.initiative)) {
        this.body.add_fight([roll(this.agro)?ATTACKS[(Number)(roll(this.high_low))]:BLOCKS[(Number)(roll(this.high_low))], FIGHT_QUEUE_DEPTH-1]);
    } else if (roll(this.reactiveness)) {
        var countering = this.body.target.fight_queue.queue.random_choice(true);
        if (countering[1].stance != NO_STANCE) {
            my_counter_stance = COUNTER_MAP[countering[1].stance];
            if (BLOCKS.contains(my_counter_stance)) {
                var bother = 1;
                var my_queue = this.body.fight_queue.queue;
                for (var i = countering[0] - 1; i > 0; i--) {
                    if (my_queue[i].stance == my_counter_stance) {
                        bother = 0;
                        break;
                    }
                    if (my_queue[i].stance != NO_STANCE && my_queue[i].stance != my_counter_stance) {
                        break;
                    }
                }
                if (bother) {
                    this.body.add_fight([my_counter_stance, countering[0]]);
                }
            } else {
                this.body.add_fight([my_counter_stance, countering[0]]);
            }

        }
    } else if (roll(this.berserk)) {
        this.body.add_fight([ATTACKS[(Number)(!roll(this.high_low))], Math.floor(Math.random() * FIGHT_QUEUE_DEPTH)]);
    }
}

var Fighter = function Fighter (is_player, hp, hp_max, hp_charge, stam, stam_max, stam_charge, dmg_base, stagger, stager_charge, ai_params) {
    this.is_player = is_player || false;
    this.is_dead = false;
    this.hp = hp || 100;
    this.hp_max = hp_max || 100;
    this.hp_charge = hp_charge || 0;
    this.stam = stam || 20;
    this.stam_max = stam_max || 20;
    this.stam_charge = stam_charge || 2;
    this.dmg_base = dmg_base || 10;
    this.fight_queue = new FightQueue(this);
    this.stagger = 0;
    this.stagger_charge = -.125;
    this.target = null;
    this.ai_manager = new AiManager(this, ai_params || {});

    //Public interface for view:
    this.tired = !this.stam;
    this.stance = NO_STANCE;
    this.bloodied = (this.hp/this.hp_max < .5);
    this.power = 0;
    this.max_power = 0;

    this.is_fighter = true;
}

Fighter.prototype.reset = function () {
    this.hp = this.hp_max;
    this.stam = this.stam_max;
    this.stagger = 0;
    this.tired = !this.stam;
    this.stance = NO_STANCE;
    this.bloodied = (this.hp/this.hp_max < .5);
    this.power = 0;
    this.max_power = 0;
    this.is_dead = false;
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
            damage = this.dmg_base * (this.power - this.target.power);
            if (damage>0) {
                this.target.damage(damage);
            }
        } else {
            this.target.damage(this.dmg_base * (this.power + 1) * (1 / (1 + this.stagger)));
            this.target.stagger += this.power;
        }
    }

    if (!this.is_player) {
        this.ai_manager.pick_action();
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
    damage = Math.floor(damage);
    this.hp -= damage;
    if (this.hp / this.hp_max < .5) {
        this.bloodied = true;
    }
    if (this.hp < 0) {
        this.dead = true;
    }
}

var TenModel = function TenModel () {
    this.player = null;
    this.opponent = null;
    this.fighters = [];
}

TenModel.prototype.set_player_by_id = function(player_id){
    this.player = this.fighters[player_id].fighter;
}

TenModel.prototype.set_opponent_by_id = function(opponent_id){
    this.opponent = this.fighters[opponent_id].fighter;
    this.reset_fight();
}

TenModel.prototype.reset_fight = function () {
    this.player.set_target(this.opponent);
    this.opponent.set_target(this.player);

    for (member in this) {
        if (this.hasOwnProperty(member) && this[member].is_fighter) {
            var fighter = this[member];
            fighter.reset();
        }
    }
}


var GameEngine = function GameEngine(ctx, keyboard_layout) {
    var that = this;
    
    this.paused = true;
    this.ctx = ctx;
    this.keyboard_layout = keyboard_layout;

    this.model = new TenModel();

    this.view = new TenView(ctx, this.model);

    this.input_controller = new KeyListener(qwerty, function(input){input_handler(input, that.model)});

    
    this.heartbeat = setInterval(function () {if(tick)that.tick();} , 1000);
    
    this.frame_renderer = setInterval(function () {that.view.render();}, 100);

    parse_fighters(fighter_definitions, this.model.fighters);

    this.model.set_player_by_id(0);
    this.model.set_opponent_by_id(1);
    
};

// moved ctx definition into view.js

GameEngine.prototype.tick = function () {
    for (member in this.model) {
        if (this.model.hasOwnProperty(member) && this.model[member].tick) {
            this.model[member].tick();
        }
    }
    for (member in this.model) {
        if (this.model.hasOwnProperty(member) && this.model[member].post_tick) {
            if (this.model[member].is_fighter && this.model[member].is_dead) {
                console.log(",.,, someone died");
            }
            this.model[member].post_tick();
        }
    }
}

var engine = new GameEngine(ctx, qwerty);

//var listener = new KeyListener(qwerty, function(pressed){console.log(pressed)});

