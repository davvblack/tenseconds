// shortcuts to Math methods
var pow = Math.pow
var sqrt = Math.sqrt
var PI = Math.PI
var TAU = PI * 2
var abs = Math.abs
var sin = Math.sin
var cos = Math.cos
var atan2 = Math.atan2
var log = Math.log
var rand = Math.random

/*
  clamp a value between a min/max range
*/
var clamp = function (n, min, max) {
    return (n > max) ? max : (n < min) ? min : n
}

/*
  modulo clamp (value 'wraps' in range)
*/
var mclamp = function (n, min, max) {
    max -= min
    n = (n - min) % max
    if (n < 0)
      n += max
    return n + min
}

/*
  lineal interpolation for smoother changes in things like entity speed
 */
function approach (current, goal, delta) {
    if (current === goal)
        return goal

    if (current < goal) {
        current += delta
        current = (current > goal) ? goal : current
    } else if (current > goal) {
        current -= delta
        current = (current < goal) ? goal : current
    }

    return current
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

Array.prototype.random_choice = function (key_too) {
    if (key_too) {
        var i = Math.floor(Math.random() * this.length);
        return [i, this[i]];
    }
    return this[Math.floor(Math.random() * this.length)];
}

function roll (target) {
    return Math.random() < target;
}

function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}



function Pool (ConstructorFunction) {
    this.ConstructorFunction = ConstructorFunction
    this.inactive = []
    this.active = []
}

Pool.prototype.pop = function () {
    if (this.inactive.length)
        return this.inactive.pop()

    var p = new this.ConstructorFunction()
    this.active.push(p)
    return p
}

Pool.prototype.push = function (obj) {
    this.inactive.push(obj)
}

// Pool.prototype.get = function () {
//     var p = this.pop()
//     this.active.push(p)
//     return p
// }

// give a function.  it will be called for all items in the active pool
// if it returns falsey, that item will be returned to the inactive pool
Pool.prototype.tick = function (fnc) {
    var n = 0
    var i = 0
    var l = this.active.length
    while (i < l) {
        if (fnc(this.active[i])) {
            this.active[n] = this.active[i]
            n++
        } else {
            this.push(this.active[i])
        }
        i++
    }
    this.active.length = n
}