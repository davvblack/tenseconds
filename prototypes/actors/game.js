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
    // if idling
    var d = vdiff(this.body.pos, this.targetActor.body.pos).dist()
    if (this.state === 0 && abs(d - (this.targetArena.r * 2)) > 5)
        this.moveToArena()
    else if (this.state === 2)
        this.moveToAttack()
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
    this.moveTo.free()
    this.moveTo = null
}

Actor.prototype.moveState = function (state, cooldown) {
    this.state = 1
    this.moveCoolDown = cooldown
}

var ctx = new Layer(900, 500)
document.body.appendChild(ctx.canvas)

var ring = new Circle(ctx.canvas.width/2, ctx.canvas.height/2, 50)
var p1 = new Actor(200, 200, 'rgb(192, 57, 43)')
var p2 = new Actor(600, 400, 'rgb(39, 174, 96)')

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

function draw () {
    requestAnimationFrame(draw)

    // do dem ticks
    p1.tick()
    p2.tick()



    // do dem draws
    ctx.clear()
    ctx.save()
        ctx.strokeStyle = 'rgb(200,200,200)'
        ring.draw(ctx)
    ctx.restore()
    p1.draw(ctx)
    p2.draw(ctx)
    ui.draw(ctx)
}

draw()

ctx.canvas.addEventListener('mousedown', function (e) {
    ring.r = 30 + (Math.random() * 70) | 0
    ring.pos.set(v(e.offsetX, e.offsetY))
})

window.addEventListener('keydown', function (e) {
    var key = e.keyCode

    if (key === 81)
        p1.state = 2
})