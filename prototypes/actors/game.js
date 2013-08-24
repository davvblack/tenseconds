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
    this.moveCoolDown = 0
    this.attackRange = 30
}

Actor.prototype.draw = function (ctx) {
    this.body.draw(ctx)
    this.head.draw(ctx)
}

Actor.prototype.tick = function () {
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

    if (d < 0.5) {
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
    if (this.targetActor.state === 2) {
        if (this.reactionCoolDown)
            return this.reactionCoolDown--
        else
            return this.moveToDefend()
    }
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

    this.moveState(30)
}

// choose a target vector moving toward the opponent
Actor.prototype.moveToAttack = function () {
    var A = this.body.pos
    var B = this.targetActor.body.pos
    // vector from target to this
    var BA = vdiff(A, B).get()

    this.moveTo = vsum(B, BA.norm().prod(this.attackRange)).get()

    BA.free()
}

// choose a target vector moving away from attacking opponent
// move and resize arena up
Actor.prototype.moveToDefend = function () {
    // pick a point that is desired arena size away from opponent
    // and in opposite direction of them
    // move the arena point to between two actors
    var A = this.body.pos
    var B = this.targetActor.body.pos
    var AB = vdiff(B, A).get()
    var dir = (rand() < 0.5) ? -1 : 1
    // get vector to position that is perpendicular to attacker movement
    // and twice attack range
    var ABr = AB.norm().cross().prod(dir * this.attackRange * 2).get()

    this.moveTo = vsum(A, ABr).get()

    var D2B2 = vdiff(this.targetActor.moveTo, this.moveTo).get()
    this.targetArena.setPos(vsum(this.moveTo, D2B2.norm().prod(D2B2.dist() / 2)))

    AB.free()
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
    this.state = 0
    this.reactionCoolDown = 10
    this.moveTo.free()
    this.moveTo = null
}

Actor.prototype.moveState = function (state, cooldown) {
    this.state = 1
    this.moveCoolDown = cooldown
}





//  .oooooooo  .oooo.   ooo. .oo.  .oo.    .ooooo.
// 888' `88b  `P  )88b  `888P"Y88bP"Y88b  d88' `88b
// 888   888   .oP"888   888   888   888  888ooo888
// `88bod8P'  d8(  888   888   888   888  888    .o
// `8oooooo.  `Y888""8o o888o o888o o888o `Y8bod8P'
// d"     YD
// "Y88888P'


var ctx = new Layer(900, 500)
document.body.appendChild(ctx.canvas)

var ring = new Circle(ctx.canvas.width/2, ctx.canvas.height/2, 50)
var p1 = new Actor(200, 200, 'rgb(192, 57, 43)')
var p2 = new Actor(600, 400, 'rgb(39, 174, 96)')

ring.setPos = function (v) {
    ring.pos.set(v)
    cam.updateDelay = 60
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
cam.updateDelay = 15

cam.tick = function () {
    // get relative position of target (ring) to cam position
    // set moveTo if necessary
    // update position gradually
    // change ctx transform?



    var A = vsum(this.pos, this.center).get()
    var B = this.target.pos
    var AB = vdiff(B, A).get()
    var d = AB.dist()

    if (this.updateDelay) {
        this.updateDelay--
    } else if (d > 0.5) {
        this.pos.set(vsum(this.pos, AB.norm().prod(d / 20)))
    }

    // var O = vdiff(this.pos, this.center).get()

    ctx.setTransform(1, 0, 0, 1, -this.pos[0], -this.pos[1])

    A.free()
    AB.free()
    // O.free()
}

function draw () {
    requestAnimationFrame(draw)

    // do dem ticks
    p1.tick()
    p2.tick()



    // do dem draws
    ctx.clear()
    ctx.save()
        cam.tick()
        // ctx.save()
        //     ctx.strokeStyle = 'rgb(255,220,220)'
        //     ring.draw(ctx)
        // ctx.restore()
        p1.draw(ctx)
        p2.draw(ctx)
    ctx.restore()
    ui.draw(ctx)
}

draw()

ctx.canvas.addEventListener('mousedown', function (e) {
    ring.r = 50 + (Math.random() * 50) | 0
    ring.setPos(vsum(cam.pos, v(e.offsetX, e.offsetY)))

})

window.addEventListener('keydown', function (e) {
    var key = e.keyCode

    if (key === 81)
        p1.state = 2
})