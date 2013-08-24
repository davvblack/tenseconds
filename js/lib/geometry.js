// box
// pos - x/y coordinate on screen
// norm - unit vector of direction box is facing
// size - basis vector describes box's dimensions.  actual dimenions are 2x these values
var Box = function Box (x, y, w, h, t, color) {
    this.pos = v(x, y).get()
    this.norm = vang(t).get()
    this.size = v(w, h).get()
    this.color = color
}

// draw and fill in the box
Box.prototype.draw = function (ctx) {
    var p = this.pos
    var f = this.norm.prod(this.size[0]).get()
    var r = this.norm.cross().prod(this.size[1]).get()

    ctx.save()
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.moveToVector(vsum(p, vsum(f, r)))
    ctx.lineToVector(vsum(p, vdiff(f, r)))
    ctx.lineToVector(vsum(p, vsum(f, r).neg()))
    ctx.lineToVector(vsum(p, vdiff(r, f)))
    ctx.fill()
    ctx.restore()

    f.free()
    r.free()
}



// circle
// pos - x/y coordinate of the circle
// r - radius
var Circle = function Circle (x, y, r) {
    this.pos = vget(x, y)
    this.r = r
}

// draw and stroke the circle
Circle.prototype.draw = function (ctx) {
    var p = this.pos

    ctx.beginPath()
    ctx.arc(p[0], p[1], this.r, 0, TAU)
    ctx.stroke()
}