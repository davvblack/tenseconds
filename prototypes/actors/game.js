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

    if (d < 0.5)
        this.moveTo = null

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
    this.moveToArena()
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

    this.moveCoolDown = 30
}

// choose a target vector moving toward the opponent
Actor.prototype.moveToAttack = function () {

}

// choose a target vector moving away from attacking opponent
// move and resize arena up
Actor.prototype.moveToDefend = function () {
    // pick a point that is desired arena size away from opponent
    // and in opposite direction of them
    // move the arena point to between two actors
}

// choose a target vector moving to the side of opponent
Actor.prototype.moveToCircleStrafe = function () {}

// slow move in, resizing arena doown
Actor.prototype.moveIn = function () {
    // move in small amount, push arena toward opponent and shink
}

// slow move out, defensive move
Actor.prototype.moveOut = function () {
    // moveout small amount, pull arena towards self and expand
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

function draw () {
    requestAnimationFrame(draw)

    // do dem ticks
    p1.tick()
    p2.tick()

    // do dem draws
    ctx.clear()
    ring.draw(ctx)
    p1.draw(ctx)
    p2.draw(ctx)
}

draw()

ctx.canvas.addEventListener('mousedown', function (e) {
    ring.r = 30 + (Math.random() * 70) | 0
    ring.pos.set(v(e.offsetX, e.offsetY))
})