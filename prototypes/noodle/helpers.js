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