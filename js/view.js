
var ctx = new Layer(900, 500);
document.body.appendChild(ctx.canvas);

var TenView = function TenView(ctx, model) {
    this.ctx = ctx;
    this.model = model;

    this.uiComponents = {}

    var fighter, uiComponent
    for (member in model) {
        if (!model.hasOwnProperty(member))
            continue

        fighter = model[member]
        uiComponent = new Layer(900, 100)
        uiComponent.canvas.id = (fighter.is_player) ? "player-ui" : "enemy-ui"
        document.body.appendChild(uiComponent)
        this.uiComponents[member] = uiComponent
    }
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

//                                   .                 .                                         88                         .
//                                 .o8               .o8                                        .8'                       .o8
// oo.ooooo.  oooo d8b  .ooooo.  .o888oo  .ooooo.  .o888oo oooo    ooo oo.ooooo.   .ooooo.     .8'   .oooo.    .ooooo.  .o888oo  .ooooo.  oooo d8b  .oooo.o
//  888' `88b `888""8P d88' `88b   888   d88' `88b   888    `88.  .8'   888' `88b d88' `88b   .8'   `P  )88b  d88' `"Y8   888   d88' `88b `888""8P d88(  "8
//  888   888  888     888   888   888   888   888   888     `88..8'    888   888 888ooo888  .8'     .oP"888  888         888   888   888  888     `"Y88b.
//  888   888  888     888   888   888 . 888   888   888 .    `888'     888   888 888    .o .8'     d8(  888  888   .o8   888 . 888   888  888     o.  )88b
//  888bod8P' d888b    `Y8bod8P'   "888" `Y8bod8P'   "888"     .8'      888bod8P' `Y8bod8P' 88      `Y888""8o `Y8bod8P'   "888" `Y8bod8P' d888b    8""888P'
//  888                                                    .o..P'       888
// o888o                                                   `Y8P'       o888o

function Actor (x, y, c) {
    // body will track where the actor is MOVING to
    this.body = new Box(x, y, 15, 20, PI, c)
    // head tracks what the actor is LOOKING at
    this.head = new Box(x, y, 10, 8, PI, 'rgb(0, 0, 0)')

    this.moveTo = null
    this.targetActor = null
    this.targetArena = null
    this.speed = 0
    this._speed = 0
    this.state = 0
    this.attacking = 0
    this.defending = 0
    this.moveCoolDown = 0
    this.reactionCoolDown = 0
    this.attackRange = 30
}

Actor.prototype.draw = function (ctx) {
    this.body.draw(ctx)
    this.head.draw(ctx)
}

Actor.prototype.tick = function () {
    if (this.reactionCoolDown) {
        this.reactionCoolDown--
        if(!this.reactionCoolDown) {
            return this.moveToDefend()
        }
    }

    if (this.moveTo !== null)
        this.move()
    else if (this.moveCoolDown > 0)
        this.moveCoolDown--
    else
        this.chooseMoveTo()
}

// move the actor towards its current moveTo position
Actor.prototype.move = function () {
    var A = this.body.pos
    var B = this.moveTo
    // offset and direction of this body to move target
    var AB = vdiff(B, A).get()
    var AB_ = AB.norm().get()
    var d = AB.dist()

    if (d < 1) {
        this.idle()
    }

    d = clamp(approach(this.speed, d / 10, 1), -8, 8)

    A.set(vsum(A, AB_.prod(d)))
    this.body.norm.set(vsum(this.body.norm, AB_.prod(0.25)).norm())
    this.head.pos.set(vsum(A, AB_.prod(d)))
    this.speed = d

    AB.free()
    AB_.free()

    this.rotateHead()
}

// rotates actor's head to face opponent
Actor.prototype.rotateHead = function () {
    var A = this.head.pos
    var B = this.targetActor.head.pos
    // direction of this head to target head
    var AB_ = vdiff(B, A).norm().get()

    if (!isFinite(AB_[0]))
        return

    this.head.norm.set(vsum(this.head.norm, AB_.prod(0.25)).norm())
    AB_.free()
}

// choose a new target vector to move to
Actor.prototype.chooseMoveTo = function () {
    var d = vdiff(this.body.pos, this.targetActor.body.pos).dist()
    var d2 = vdiff(this.body.pos, this.targetArena.pos).dist()
    if (this.state === 0
    && (abs(d - (this.targetArena.r * 2)) > 5
    || abs(d2 - this.targetArena.r) > 5))
        return this.moveToArena()
    else if (this.state === 2)
        return this.moveToAttack()
}

// choose a target vector moving to arena position
Actor.prototype.moveToArena = function () {
    var A = this.body.pos
    var B = this.targetActor.body.pos
    var C = this.targetArena.pos
    var r = this.targetArena.r

    var AC_ = vdiff(C, A).norm().get()
    var CB_ = vdiff(B, C).norm().get()
    var ACCB_ = vsum(AC_, CB_).norm().get()
    var ACCB = ACCB_.prod(r).get()

    // the actual target point
    this.moveTo = vdiff(C, ACCB).get()

    AC_.free()
    CB_.free()
    ACCB_.free()
    ACCB.free()

    this.moveState(15)
}

// choose a target vector moving toward the opponent
Actor.prototype.moveToAttack = function () {
    // console.log('attack')
    this.attacking = 1
    this.targetActor.reactionCoolDown = 10

    var A = this.body.pos
    var B = this.targetActor.body.pos
    // vector from target to this
    var BA = vdiff(A, B).get()

    var r = rand()
    if (r < 0.2)
        this.moveTo = B.clone().get()
    else if (r < 0.9)
        this.moveTo = vsum(B, BA.norm().prod(this.attackRange)).get()
    else
        this.moveTo = vsum(B, BA.norm().prod(-this.attackRange)).get()

    BA.free()
}

// choose a target vector moving away from attacking opponent
// move and resize arena up
Actor.prototype.moveToDefend = function () {
    // console.log('defend')
    this.defending = 1
    // pick a point that is desired arena size away from opponent
    // and in opposite direction of them
    // move the arena point to between two actors
    var A = this.body.pos
    var B = this.targetActor.body.pos
    var AB = vdiff(B, A).get()
    var BA = AB.norm().prod(-1 * rand()).get()
    var dir = (rand() < 0.5) ? -1 : 1
    // get vector to position that is perpendicular to attacker movement
    // and twice attack range
    // var ABr = AB.norm().cross().prod(dir * this.attackRange * 2).get()
    var ABr = vsum(AB.norm().cross().prod(dir), BA).norm().prod(this.attackRange * 2).get()

    this.moveTo = vsum(A, ABr).get()

    var D2B2 = vdiff(this.targetActor.moveTo, this.moveTo).get()
    this.targetArena.setPos(vsum(this.moveTo, D2B2.norm().prod(D2B2.dist() / 2)))

    AB.free()
    BA.free()
    ABr.free()
    D2B2.free()
}

// choose a target vector moving to the side of opponent
Actor.prototype.moveToCircleStrafe = function () {

}

// slow move in, resizing arena doown
Actor.prototype.moveIn = function () {

    // move in small amount, push arena toward opponent and shink
}

// slow move out, defensive move
Actor.prototype.moveOut = function () {
    // moveout small amount, pull arena towards self and expand
}

// set moveTo to null and update state
Actor.prototype.idle = function () {
    // this.state = 0
    // this.reactionCoolDown = 3

    if (this.attacking){
        this.attacking = 0
        this.moveCoolDown = 10
    } else {
        this.state = 0
    }
    if (this.defending) {
        this.moveCoolDown = 10
        this.defending = 0
    }
    this.moveTo.free()
    this.moveTo = null
}

Actor.prototype.moveState = function (cooldown) {
    this.state = 1
    // this.moveCoolDown = cooldown
}





//  .oooooooo  .oooo.   ooo. .oo.  .oo.    .ooooo.
// 888' `88b  `P  )88b  `888P"Y88bP"Y88b  d88' `88b
// 888   888   .oP"888   888   888   888  888ooo888
// `88bod8P'  d8(  888   888   888   888  888    .o
// `8oooooo.  `Y888""8o o888o o888o o888o `Y8bod8P'
// d"     YD
// "Y88888P'


// var ctx = new Layer(900, 500)
// document.body.appendChild(ctx.canvas)

var ring = new Circle(ctx.canvas.width/2, ctx.canvas.height/2, 50)
var p1 = new Actor(200, 200, 'rgb(192, 57, 43)')
var p2 = new Actor(600, 400, 'rgb(39, 174, 96)')

ring.moveTo = ring.pos.clone().get()
ring.speed = 0
ring.setPos = function (v) {
    ring.moveTo.set(v)
    cam.updateDelay = 30
}

ring.tick = function () {
    var A = this.pos
    var B = this.moveTo
    var AB = vdiff(B, A).get()
    var d = AB.dist()

    if (d > 0.5) {
        // update position and speed of the ring
        d = clamp(approach(this.speed, d / 15, 0.5), -10, 10)
        this.pos.set(vsum(this.pos, AB.norm().prod(d)))
        this.speed = d
    }

    AB.free()
}

p1.targetActor = p2
p1.targetArena = ring
p2.targetActor = p1
p2.targetArena = ring

var ui = {}
ui.draw = function (ctx) {
    var w = ctx.canvas.width
    var h = ctx.canvas.height
    ctx.save()
    ctx.fillStyle = 'rgb(0, 0, 0)'
    ctx.fillRect(0, 0, w, 100)
    ctx.fillRect(0, h - 100, w, 100)
    ctx.fillStyle = p1.body.color
    ctx.fillRect(10, 10, 80, 80)
    ctx.fillStyle = p2.body.color
    ctx.fillRect(w - 90, h - 90, 80, 80)
    ctx.restore()
}

// camera movement
var cam = {}
cam.pos = v(0, 0).get()
cam.center = v(ctx.canvas.width / 2, ctx.canvas.height / 2).get()
cam.moveTo = null
cam.target = ring
cam.speed = 0
cam.updateDelay = 15
cam.scaleSize1 = ctx.canvas.height - 200
cam.scaleDist1 = cam.center.dist()
cam.scaleDistNorm = cam.center.norm().get()
cam.scale = 1

/**
this is the place i'm having trouble
this function updates the camera position, so as fighters
move around, the camera will follow them so they don't go off screen

when the fighters move close together to do attacks, I want the
camera to zoom in, because its cool and makes it more interesting

the problem is that i can't wrap my fucking head around how to account
for the scaling in determining the offset of the camera position
it seems relatively straightforward, but everything I've tried has
been either totally wrong, or 'close'
 */

cam.tick = function (f) {
    // adjust camera scale
    var rs = 2 * (this.target.r + 25)
    var s = approach(this.scale, this.scaleSize1 / rs, 0.01)
    this.scale = s

    var scaleOffsetVector = this.target.pos.prod(s - 1).get()

    // A is the center point of the screen, where we want to ring to be
    var A = vsum(this.pos, this.center).get()
    // B is the position of 'the ring'
    var B = this.target.pos
    // get the offset between A and B, as well as the distance
    var AB = vdiff(B, A).get()
    var d = AB.dist()

    // this adds a bit of delay to camera follow
    // if (this.updateDelay) {
    //     this.updateDelay--
    // } else
    if (d > 0.5) {
        // update position and speed of the camera
        d = clamp(approach(this.speed, d / 15, 0.5), -10, 10)
        this.pos.set(vsum(this.pos, AB.norm().prod(d)))
        this.speed = d
    }

    var offsetVector = vsum(this.pos, scaleOffsetVector).prod(-1).get()

    // prevent scaling
    // comment out to see my problem
    // s = 1
    // transform does translate first, then scale
    // this workds fine for s == 1...
    // console.log(SOFF + '')
    ctx.setTransform(s, 0, 0, s, offsetVector[0], offsetVector[1])
    // ctx.translate(SOFF[0], SOFF[1])

    A.free()
    AB.free()
    offsetVector.free()
    scaleOffsetVector.free()
}

var ticksTillRandomAction = 60

function draw () {
    requestAnimationFrame(draw)

    // do dem ticks
    p1.tick()
    p2.tick()

    if (p1.state === 0 && p2.state === 0) {
        if (ticksTillRandomAction)
            ticksTillRandomAction--
        else {
            console.log('random action')
            ticksTillRandomAction = 60
        }

    }
    // do dem draws
    ctx.clear()
    ctx.save()
        ring.tick()
        cam.tick()
        ctx.save()
            ctx.strokeStyle = 'rgb(240,210,210)'
            ring.draw(ctx)
        ctx.restore()
        p1.draw(ctx)
        p2.draw(ctx)
    ctx.restore()
    ui.draw(ctx)
}

draw()

ctx.canvas.addEventListener('mousedown', function (e) {
    ring.r = 30 + (((rand() * 2) + 0.4 | 0) * 20)
    ring.setPos(vsum(cam.pos, v(e.offsetX, e.offsetY)))
    p1.state = 0
})

window.addEventListener('keydown', function (e) {
    var key = e.keyCode

    if (key === 81)
        if (p1.state === 2)
            p1.state = 0
        else
            p1.state = 2
})

document.getElementById('size').addEventListener('change', function (e) {
    ring.r = +this.value
})


