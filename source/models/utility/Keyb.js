import vkey from "vkey"

class Keyb {
    constructor() {
        this.data = {}
    }
    registerEventListeners() {
        document.addEventListener("keydown", (event) => this.setPressed(event.keyCode))
        document.addEventListener("keyup", (event) => this.setNotPressed(event.keyCode))
    }
    isPressed(key) {
        return this.data[key] != undefined
    }
    wasJustPressed(key, delta) {
        return window.performance.now() - this.data[key] < (delta || 1000 / 60)
    }
    isNotPressed(key) {
        return this.data[key] == undefined
    }
    setPressed(keycode) {
        const key = vkey[keycode] || keycode
        if(this.isPressed(key) == false) {
            this.data[key] = window.performance.now()
            this.on({"key": key, "pressed": true, "time": window.performance.now()})
        }
    }
    setNotPressed(keycode) {
        const key = vkey[keycode] || keycode
        if(this.isPressed(key) == true) {
            this.on({"key": key, "pressed": false, "time": window.performance.now()})
        }
        delete this.data[key]
    }
    on(event) {}
}

export class StandardKeyb extends Keyb {
    constructor() {
        super()
        this.registerEventListeners()
    }
}

export class RecordKeyb extends Keyb {
    constructor() {
        super()

        this.registerEventListeners()

        this.events = []
        // this.startTime = window.performance.now()
        this.time = 0
    }
    on(event) {
        // event.time -= this.startTime
        event.time = this.time
        this.events.push(event)
    }
    export() {
        window.copy(this.events)
    }
    update(delta) {
        this.time += delta.ms
        // console.log(this.time)
        // console.log(window.performance.now() - this.startTime)
    }
}

export class ReplayKeyb extends Keyb {
    constructor({events}) {
        super()

        this.events = events
        // this.startTime = window.performance.now()
        this.time = 0
    }
    update(delta) {
        // this is going to be slightly out of sync but eh whatever

        // const time = window.performance.now() - this.startTime
        this.time += delta.ms
        const time = this.time

        while(this.events.length > 0
        && this.events[0].time < time) {
            if(this.events[0].pressed == true) {
                this.setPressed(this.events[0].key)
            } else {
                this.setNotPressed(this.events[0].key)
            }
            this.events.shift()
        }
    }
}
