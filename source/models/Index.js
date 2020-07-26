
import shortid from "shortid"

import Director from "models/Director.js"
import Geometry from "models/utility/Geometry.js"
import Directions from "models/utility/Directions.js"
import frame from "data/frame.js"

const TILE = 16
const CENTER_POSITION = {"x": 0., "y": 0}
const OTHER_POSITION = {"x": TILE * 5, "y": TILE * 2}

import vkey from "vkey"
// import Keyb from "keyb"
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

class KeybStandard extends Keyb {
    constructor() {
        super()
        this.registerEventListeners()
    }
}

class KeybRecorder extends Keyb {
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

class KeybReplay extends Keyb {
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

class Player {
    constructor({position, input}) {
        this.type = "player"
        this.velocity = {"x": 0, "y": 0}
        this.position = new Point(position)
        this.startingPosition = new Point(position)
        this.image = require("assets/images/gooball.png")

        this.speed = TILE * 8
        this.deceleration = 0.05

        if(input != undefined) {
            this.input = new KeybReplay(input)
        } else {
            this.input = new KeybRecorder()
            window.player = this
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

class Point {
    constructor({x, y, tx, ty}) {
        this.x = x
        this.y = y

        if(tx !== undefined) this.tx = tx
        if(ty !== undefined) this.ty = ty
    }
    get tx() {
        return Math.round(this.x / TILE)
    }
    get ty() {
        return Math.round(this.y / TILE)
    }
    set tx(tx) {
        this.x = tx * TILE
    }
    set ty(ty) {
        this.y = ty * TILE
    }
    get key() {
        return this.tx + "x" + this.ty
    }
    toString() {
        return this.key
    }
    static toString(point) {
        return Point.key(point)
    }
    static key(point) {
        return point.x + "x" + point.y
    }
    round() {
        this.tx = this.tx
        this.ty = this.ty
        return this
    }
}

class Bomb {
    constructor({position, power}) {
        this.type = "bomb"
        this.position = position
        this.key = this.position.key
        this.image = require("assets/images/bomb.png")

        this.power = power
        this.time = 0 // in seconds
    }
    update(delta) {
        this.time += delta.s

        if(this.time >= 1) {
            this.explode()
        }
    }
    explode() {
        if(this.hasExploded == true) return
        this.hasExploded = true

        const positionset = [
            [this.position]
        ]
        for(let distance = 1; distance < this.power; distance += 1) {
            const positions = []
            Object.values(Directions).forEach((direction) => {
                const position = new Point({
                    "tx": this.position.tx + (direction.x * distance),
                    "ty": this.position.ty + (direction.y * distance),
                })
                const collision = this.collection.get(position)
                if(collision != undefined
                && collision.type == "wall") {
                    return
                }
                if(collision != undefined
                && collision.type == "bomb") {
                    //
                }
                positions.push(position)
            })
            positionset.push(positions)
        }

        Director.add({
            "mark": 0,
            "type": "explosion",
            "positions": positionset
        })

        this.collection.remove(this)
    }
}

class Collection {
    constructor() {
        this.values = {}
    }
    add(value) {
        value.key = value.key || shortid.generate()
        this.values[value.key] = value
        value.collection = this
    }
    has(key) {
        if(key.key != undefined) {
            key = key.key
        }
        return !!this.values[key]
    }
    remove(value) {
        this.values[value.key].collection = undefined
        delete this.values[value.key]
    }
    get(key) {
        if(key == undefined) {
            return Object.values(this.values)
        }
        return this.values[key]
    }
}

export default class Index {
    constructor() {
        this.entities = new Collection()

        this.entities.add({
            "key": "camera",
            "type": "camera",
            "position": {"x": 0, "y": 0},
            "nudge": {"x": 0, "y": 0},
            "zoom": 3,
        })

        this.entities.add(new Player(require("data/player1.json")))
        this.entities.add(new Player(require("data/player2.json")))
        this.entities.add(new Player(require("data/player3.json")))

        // this.entities.add(new Player({"position": {"tx": 1, "ty": 4}}))

        const height = 5// 20
        const width = 5 // 36
        for(let x = -width; x <= width; x += 1) {
            for(let y = -height; y <= height; y += 1) {
                const block = {
                    "type": "block",
                    "position": {"x": x * 16, "y": y * 16},
                    "image": require("assets/images/bad-wall.png"),
                }
                block.key = Point.key({
                    "x": block.position.x / TILE,
                    "y": block.position.y / TILE,
                })
                if(x % 2 == 0 || y % 2 == 0) {
                    block.image = require("assets/images/crate.png")
                    continue // DEBUG
                }
                this.entities.add(block)
            }
        }

        // this.play()
    }
    update(delta) {
        // delta.s /= 8
        // delta.ms /= 8

        this.entities.get().forEach((entity) => {
            if(entity.update instanceof Function) {
                entity.update(delta)
            }
        })

        Director.update(delta)
    }
    play() {
        Director.add({
            "type": "trailer",
            "substeps": [
                {
                    "mark": 1000,
                    "type": "explosion",
                    "positions": [
                        [
                            CENTER_POSITION
                        ],
                        [
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.north, TILE)),
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.south, TILE)),
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.east, TILE)),
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.west, TILE)),
                        ],
                        [
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.north, TILE * 2)),
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.south, TILE * 2)),
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.east, TILE * 2)),
                            Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.west,TILE * 2)),
                        ],
                    ]
                },
                {
                    "mark": 2000,
                    "type": "explosion",
                    "positions": [
                        [
                            OTHER_POSITION
                        ],
                        [
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.north, TILE)),
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.south, TILE)),
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.east, TILE)),
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.west, TILE)),
                        ],
                        [
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.north, TILE * 2)),
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.south, TILE * 2)),
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.east, TILE * 2)),
                            Geometry.add(OTHER_POSITION, Geometry.multiply(Directions.west,TILE * 2)),
                        ],
                    ]
                }
            ],
        })
    }
}
