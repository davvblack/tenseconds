
//                         .
//                       .o8
//  .oooo.    .ooooo.  .o888oo  .ooooo.  oooo d8b
// `P  )88b  d88' `"Y8   888   d88' `88b `888""8P
//  .oP"888  888         888   888   888  888
// d8(  888  888   .o8   888 . 888   888  888
// `Y888""8o `Y8bod8P'   "888" `Y8bod8P' d888b

var Actor = function Actor (x, y, w, h, t, color) {
    Box.call(this, x, y, w, h, t)
    this.color = color
    this.follow = null // other player
    this.moveTo = null // ring
    this.state = 1
    this.side = 1
}

Actor.prototype = Object.create(Box.prototype)

Actor.prototype._draw = Box.prototype.draw
Actor.prototype.draw = function (ctx) {
    ctx.save()
    ctx.fillStyle = this.color
    this._draw(ctx)
    ctx.restore()
}

Actor.prototype.tick = function () {
    if (this.moveTo === null || this.follow === null)
        return


    if (this.state === 1)
        this.moveToRing()
    else if (this.state === 2)
        this.moveOppositeTarget()
    else if (this.state === 3)
        this.moveToPosition()
}

Actor.prototype.moveToRing = function () {
    // offest to thing we are moving to
    // direction to thing we are moving towards
    var A = this.pos
    var B = this.follow
    var C = this.moveTo.pos
    var r = this.moveTo.r
    var AC = vdiff(C, A).get()
    var ACnorm = AC.norm().get()
    var CBnorm = vdiff(B, C).norm().get()
    var ACCBnorm = vsum(ACnorm, CBnorm).norm().get()
    var ACCB = ACCBnorm.prod(r).get()

    // the actual target point
    var D = vdiff(C, ACCB).get()
    var AD = vdiff(D, A).get()
    var ADnorm = AD.norm().get()

    // offset / direction to thing we are facing
    var vFace = vdiff(B, A).get()
    var vFaceNorm = vFace.norm().get()

    if (!isFinite(ADnorm[0]))
        return

    var d = AD.dist()
    var dFaceAbs = abs(vFace.dist())

    // if (dFaceAbs <= 100 && abs(d) <= 50) {
    //     d = 0
    //     // this.state = 2 // start circling
    // }

    // limit speed
    d = clamp(d / 10, -5, 5)

    // rotate to face thing
    this.norm.set(vsum(this.norm, vFaceNorm.qtnt(4)).norm())
    // move box toward target
    this.pos.set(vsum(this.pos, ADnorm.prod(d)))

    AC.free()
    ACnorm.free()
    ACCB.free()
    ACCBnorm.free()
    CBnorm.free()
    D.free()
    vFace.free()
    vFaceNorm.free()
    AD.free()
    ADnorm.free()
}

Actor.prototype.moveOppositeTarget = function () {

}

//                           .    o8o      .    o8o
//                         .o8    `"'    .o8    `"'
//  .ooooo.  ooo. .oo.   .o888oo oooo  .o888oo oooo   .ooooo.   .oooo.o
// d88' `88b `888P"Y88b    888   `888    888   `888  d88' `88b d88(  "8
// 888ooo888  888   888    888    888    888    888  888ooo888 `"Y88b.
// 888    .o  888   888    888 .  888    888 .  888  888    .o o.  )88b
// `Y8bod8P' o888o o888o   "888" o888o   "888" o888o `Y8bod8P' 8""888P'


var ctx = new Layer(900, 500)
document.body.appendChild(ctx.canvas)

var p1 = new Actor(200, 200, 20, 15, PI, 'rgb(192, 57, 43)')
var p2 = new Actor(600, 400, 20, 15, TAU    , 'rgb(39, 174, 96)')
p2.side = -1
var ring = new Circle(ctx.canvas.width/2, ctx.canvas.height/2, 50)

p1.follow = p2.pos
p1.moveTo = ring

p2.follow = p1.pos
p2.moveTo = ring

ring.tracking = 1

ring.tick = function () {
    var pDiff = vdiff(p2.pos, p1.pos).get()
    var pDist = pDiff.dist() / 2

    if (!this.tracking && pDist <= 50)
        this.tracking = 0

    if (this.tracking) {
        this.pos.set(vsum(p1.pos, pDiff.norm().prod(pDist)))
        this.r = pDist
    }


    pDiff.free()
}

//                                                     oooo
//                                                     `888
//  .oooooooo  .oooo.   ooo. .oo.  .oo.    .ooooo.      888   .ooooo.   .ooooo.  oo.ooooo.
// 888' `88b  `P  )88b  `888P"Y88bP"Y88b  d88' `88b     888  d88' `88b d88' `88b  888' `88b
// 888   888   .oP"888   888   888   888  888ooo888     888  888   888 888   888  888   888
// `88bod8P'  d8(  888   888   888   888  888    .o     888  888   888 888   888  888   888
// `8oooooo.  `Y888""8o o888o o888o o888o `Y8bod8P'    o888o `Y8bod8P' `Y8bod8P'  888bod8P'
// d"     YD                                                                      888
// "Y88888P'                                                                     o888o
ring.tracking = 0

function draw () {
    requestAnimationFrame(draw)

    // do dem ticks
    p1.tick()
    p2.tick()
    ring.tick()

    // do dem draws
    ctx.clear()
    ring.draw(ctx)
    p1.draw(ctx)
    p2.draw(ctx)
}

draw()

ctx.canvas.addEventListener('mousedown', function (e) {
    ring.tracking = 0
    ring.r = 30 + (Math.random() * 70) | 0
    ring.pos.set(v(e.offsetX, e.offsetY))

})