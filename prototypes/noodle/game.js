// 2d rendering context to draw to
var ctx = new Layer(900, 500)
document.body.appendChild(ctx.canvas)

// vector to hold mouse position
var mousePos = v(100, 100).get()
var box = new Box(100, 100, 10, 7, PI/4)
var circle = new Circle(50, 50, 200)

// box.follow is a vector holding the position the box is moving to
// this way, when the mouse moves 'out of range', the box can continue to move
// toward its last known position rather than abruptly stopping
box.follow = vget(0, 0)
// box.target is the actual vector that box is tracking, so we know if it is
// tracking the mousePos vector or the circle's position
box.target = mousePos

circle.reset = function () {
    this.r = 2
    box.target = this.pos
    box.follow.set(this.pos)
}
circle.tick = function () {
    this.r *= 1.1
    if (this.r > 200) {
        box.target = mousePos
    }
}

function draw () {
    requestAnimationFrame(draw)

    // the do {} while (0) lets us execute an arbitrary block of code once, and
    // lets us break out of it with a break statement at any time.  neat.
    do {
        // get vector and unit vector between box and mouse
        var boxToMouse = vdiff(box.follow, box.pos).get()
        var boxToMouseNorm = boxToMouse.norm().get()

        // happens if box and mouse have same position
        if (!isFinite(boxToMouseNorm[0]))
            break

        // get a vector 50 px away from the actual vector we are following
        // don't want to follow *too* close
        var target = vsum(box.follow, boxToMouseNorm.neg().prod(50)).get()
        // get distance between box and this new target vector
        var d = vdiff(target, box.pos).dist()

        // if tracking mouse and it is withing range, update the follow vector
        // to match the mouse position.  if out of range, box will keep moving
        // toward last known position of mouse
        if (box.target == mousePos && abs(vdist(box.pos, mousePos)) < 300) {
            box.follow.set(mousePos)
        }

        // if box is *too* close, move away
        var d2 = abs(boxToMouse.dist())
        if (d2 < 50)
            d = -d
        // limit movement speed
        d = clamp(d / 10, -10, 10)

        // rotate the box's direction towards the cursor
        box.norm.set(vsum(box.norm, boxToMouseNorm.qtnt(4)).norm())
        // move box toward target
        box.pos.set(vsum(box.pos, box.norm.prod(d)))

        // morph box a little based on speed, for squishiness
        box.size.free()
        d = clamp(log(d), 0, 10)
        if (d2 < 50)
            d = -1
        box.size = v(10 + d, 7 - d).get()

        // dump temporary vectors back into the vector pool for reuse
        boxToMouse.free()
        boxToMouseNorm.free()
        target.free()
    } while (0)

    ctx.clear()
    box.draw(ctx)

    if (circle.r < 200) {
        circle.tick()
        circle.draw(ctx)
    }

}

draw()

ctx.canvas.addEventListener('mousemove', function (e) {
    mousePos.set(v(e.offsetX, e.offsetY))
})

ctx.canvas.addEventListener('mousedown', function (e) {
    circle.pos.set(v(e.offsetX, e.offsetY))
    circle.reset()
})

