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