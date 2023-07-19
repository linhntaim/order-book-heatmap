export class Timer
{
    constructor() {
        this.timeouts = {}
        this.intervals = {}
        this.animations = {}
    }

    registerTimeout(handler, timeout = null, ...args) {
        const id = window.setTimeout(handler, timeout, ...args)
        this.timeouts[id] = true
        return id
    }

    offTimeout(id = 0) {
        if (id) {
            if (id in this.timeouts) {
                window.clearTimeout(id)
                delete this.timeouts[id]
            }
            return this
        }
        return this.offAllTimeouts()
    }

    offAllTimeouts() {
        Object.keys(this.timeouts).forEach(id => {
            window.clearTimeout(Number(id))
            delete this.timeouts[id]
        })
        return this
    }

    registerInterval(handler, timeout = null, ...args) {
        const id = window.setInterval(handler, timeout, ...args)
        this.intervals[id] = true
        return id
    }

    offInterval(id = 0) {
        if (id) {
            if (id in this.intervals) {
                window.clearInterval(id)
                delete this.intervals[id]
            }
            return this
        }
        return this.offAllIntervals()
    }

    offAllIntervals() {
        Object.keys(this.intervals).forEach(id => {
            window.clearInterval(Number(id))
            delete this.intervals[id]
        })
        return this
    }

    registerAnimation(handler) {
        const id = window.requestAnimationFrame(handler)
        this.animations[id] = true
        return id
    }

    offAnimation(id = 0) {
        if (id) {
            if (id in this.animations) {
                window.cancelAnimationFrame(id)
                delete this.animations[id]
            }
            return this
        }
        return this.offAllTimeouts()
    }

    offAllAnimations() {
        Object.keys(this.animations).forEach(id => {
            window.cancelAnimationFrame(Number(id))
            delete this.animations[id]
        })
        return this
    }

    offAll() {
        return this.offAllTimeouts()
            .offAllIntervals()
            .offAllAnimations()
    }
}