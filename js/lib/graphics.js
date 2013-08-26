// creates a canvas of the given size and returns it's 2d rendering context
// canvas element still available as property of context
var L_ = Layer = function Layer (w, h) {
    var c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c.getContext('2d')
}

// extend 2d rendering context with clear method to erase entire canvas
CanvasRenderingContext2D.prototype.clear = function () {
    var c = this.canvas
    this.clearRect(0, 0, c.width, c.height)
    return this
}

// create a new layer and clone this layer's contents to it
CanvasRenderingContext2D.prototype.clone = function () {
    var c = this.canvas
    var w = c.width
    var h = c.height
    var l = L_(w, h)
    l.drawImage(c, 0, 0, w, h)
    return l
}

// calls moveTo with a vector's coordinates
CanvasRenderingContext2D.prototype.moveToVector = function (v) {
    this.moveTo(v[0], v[1])
    // console.log("move to "+v)
    return this
}

// calls lineTo with a vector's coordinates
CanvasRenderingContext2D.prototype.lineToVector = function (v) {
    this.lineTo(v[0], v[1])
    // console.log("line to "+v)
    return this
}

Sprite = function Sprite (w, h, u, v, src) {
    this.w = w;
    this.h = h;

}



Particle = function (pos, norm, size, velocity, color) {
    this.pos = pos
    this.norm = norm
    this.size = size
    this.life = 100
    this.velocity = velocity
    this.color = color
}

Particle.prototype.tick = function ()  {
    this.pos.set(vsum(this.pos, this.norm.prod(this.velocity)))
    this.size.set(this.size.prod(1.01))
    this.velocity = this.velocity * 0.99
    this.life--

    if (this.life)
        return 1

    return this.destroy()
}

Particle.prototype.draw = function (ctx) {
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
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    f.free()
    r.free()
}

Particle.prototype.destroy = function () {
    this.pos.free()
    this.norm.free()
    this.size.free()
    return 0
}

