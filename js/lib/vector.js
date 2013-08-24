/*
    some operator functions and class methods to make working with
    vectors a little easier, including vector math and
    automatic pooling of vector objects
    all methods modify the vector sitting on top of the pool stack
    call .get after an operator method to pop that vector off the stack
    to prevent further changes.  call .free on it to return it to the pool
 */

// we are going to just hijack the float32 array type and make it
// a vector, since there is no good way to subclass arrays in js
var Vector = Float32Array

Vector.pool = []

// pops a vector from the pool, or creates a new one
var v = Vector.create = function (x, y) {
    var l = Vector.pool.length
    if (l === 0)
        Vector.increasePool(8)

    var v = Vector.pool[Vector.pool.length - 1]
    v.set(arguments)
    return v
}

// sets a vector and pulls it out of the pool
var vget = function (x, y) {
    return v(x, y).get()
}

// increase the vector pool by a set amount.  all vectors added this
// way will share a single array buffer
Vector.increasePool = function (n) {
    var b = new ArrayBuffer(n * 8) // 8 * 8 = 64
    while (n-- > 0)
        Vector.pool.push(new Vector(b, n * 8, 2))
}

// pulls a vector out of the pool to prevent changes to it
// call .free on it when finished
Vector.prototype.get = function () {
    if (Vector.pool.length)
        return Vector.pool.pop()
    return null
}

// when you are done with a vector
Vector.prototype.free = function () {
    Vector.pool.push(this)
    return this
}

// constant vector used for resetting
var ORIGIN = v(0, 0).get()

// returns a new vector that is the sum of two vectors
var vsum = Vector.sum = function (a, b) {
    // console.log(a + " + " + b)
    return new v(a[0] + b[0], a[1] + b[1])
}

// returns a new vector that is the difference of two vectors
var vdiff = Vector.diff = function (a, b) {
    // console.log(a + " - " + b)
    return new v(a[0] - b[0], a[1] - b[1])
}

// returns a new vector that is the product of two vectors
var vprod = Vector.prod = function (a, b) {
    // console.log(a + " * " + b)
    return new v(a[0] * b[0], a[1] * b[1])
}

// returns a new vector that is the quotient of two vectors
var vqtnt = Vector.qtnt = function (a, b) {
    // console.log(a + " / " + b)
    return new v(a[0] / b[0], a[1] / b[1])
}

// returns a unit vector in the direction between two vectors
var vnorm = Vector.norm = function (a, b) {
    return vdiff(b, a).norm()
}

// returns a vector perpendicular to the difference between two vectors
var vcross = Vector.cross = function (a, b) {
    return v(a[1] - b[1], b[0] - a[0])
}

// returns a vector that is point b mirrored across point a
var vneg = Vector.neg = function (a, b) {
    return vsum(a, vdiff(a, b))
}

// returns the distance between two vectors
var vdist = Vector.dist = function (a, b) {
    return vdiff(b, a).dist()
}

// return the dot product of two vectors
// (1 same direction, 0 perpendicular, -1 opposite direction)
var vdot = Vector.dot = function (a, b) {
    return (a[0] * b[0] + a[1] * b[1])
}

// return a unit vector from the given angle t in radians
var vang = Vector.ang = function (t) {
    return v(cos(t), sin(t))
}

// add a value to both vector coordinates, return as a new vector
Vector.prototype.sum = function (s) {
    return v(this[0] + s, this[1] + s)
}

// remove a value from both vector coordinates, return as a new vector
Vector.prototype.diff = function (s) {
    return v(this[0] - s, this[1] - s)
}

// multiply both coordinates by a value, return as a new vector
Vector.prototype.prod = function (s) {
    return v(this[0] * s, this[1] * s)
}

// divide both coordinates by a value, return as a new vector
Vector.prototype.qtnt = function (s) {
    return v(this[0] / s, this[1] / s)
}

// return a unit vector of the current vector
Vector.prototype.norm = function () {
    return this.qtnt(this.dist())
}

// return a vector that is this point mirrored across the origin
Vector.prototype.neg = function () {
    return v(-this[0], -this[1])
}

// return a copy of this vector
Vector.prototype.clone = function () {
    return v(this[0], this[1])
}

// returns a unit vector perpendicular to this one
Vector.prototype.cross = function () {
    return v(this[1], -this[0])
}

// return the distance of this point from the origin
Vector.prototype.dist = function () {
    return sqrt(this[0] * this[0] + this[1] * this[1])
}

// return the angle in radians of this vector
Vector.prototype.angle = function () {
    return mclamp(atan2(this[1], this[0]), 0, TAU)
}

Vector.prototype.toString = function () {
    return "(" + this[0] + ', ' + this[1] + ")"
}
