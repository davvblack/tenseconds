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

Array.prototype.random_choice = function () {
    return this[Math.floor(Math.random() * this.length)];
}