import Point from "models/utility/Point.js"
import {RecordKeyb, ReplayKeyb} from "models/utility/Keyb.js"
import Bomb from "models/Bomb.js"

const TILE = 16

export default class Bomber {
    constructor({position, input}) {
        this.type = "bomber"
        this.velocity = {"x": 0, "y": 0}
        this.position = new Point(position)
        this.startingPosition = new Point(position)
        this.image = require("assets/images/gooball.png")

        this.speed = TILE * 8
        this.deceleration = 0.05

        if(input != undefined) {
            this.input = new ReplayKeyb(input)
        } else {
            this.input = new RecordKeyb()
            window.bomber = this
        }
    }
    update(delta) {
        if(this.input.update instanceof Function) {
            this.input.update(delta)
        }
        if(this.input.isPressed("<left>")) {
            this.velocity.x = -1 * this.speed * delta.s
        }
        if(this.input.isPressed("<right>")) {
            this.velocity.x = this.speed * delta.s
        }
        if(this.input.isPressed("<up>")) {
            this.velocity.y = -1 * this.speed * delta.s
        }
        if(this.input.isPressed("<down>")) {
            this.velocity.y = this.speed * delta.s
        }

        const horizmove = new Point({"x": this.position.x + this.velocity.x, "y": this.position.y}, {"tiled": true})
        if(horizmove.key != this.position.key
        && this.collection.has(horizmove.key)) {
            this.velocity.x = 0
        }

        const verticmove = new Point({"x": this.position.x + this.velocity.x, "y": this.position.y + this.velocity.y}, {"tiled": true})
        if(verticmove.key != this.position.key
        && this.collection.has(verticmove.key)) {
            this.velocity.y = 0
        }

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.x *= this.deceleration
        this.velocity.y *= this.deceleration
        this.velocity.x = this.velocity.x < 0.0001 && this.velocity.x > -0.0001 ? 0 : this.velocity.x
        this.velocity.y = this.velocity.y < 0.0001 && this.velocity.y > -0.0001 ? 0 : this.velocity.y

        const position = new Point(this.position).round()
        if(this.input.wasJustPressed("<space>", delta.ms)
        && this.collection.has(position) == false) {
            this.collection.add(new Bomb({"position": position, "power": 3}))
        }
    }
    copy() {
        window.copy({
            "position": {
                "x": this.startingPosition.x,
                "y": this.startingPosition.y
            },
            "input": {
                "events": this.input.events
            }
        })
    }
}
