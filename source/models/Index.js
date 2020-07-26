import Keyb from "keyb"
import shortid from "shortid"

import Director from "models/Director.js"
import Geometry from "models/utility/Geometry.js"
import Directions from "models/utility/Directions.js"
import frame from "data/frame.js"

const TILE = 16
const CENTER_POSITION = {"x": 0., "y": 0}
const OTHER_POSITION = {"x": TILE * 5, "y": TILE * 2}

class Player {
    constructor() {
        this.type = "player"
        this.velocity = {"x": 0, "y": 0}
        this.position = new Point({"x": 100, "y": 100})
        this.image = require("assets/images/gooball.png")

        this.speed = TILE * 8

        this.deceleration = 0.05
    }
    update(delta) {
        if(Keyb.isPressed("<left>")) {
            this.velocity.x = -1 * this.speed * delta.s
        }
        if(Keyb.isPressed("<right>")) {
            this.velocity.x = this.speed * delta.s
        }
        if(Keyb.isPressed("<up>")) {
            this.velocity.y = -1 * this.speed * delta.s
        }
        if(Keyb.isPressed("<down>")) {
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

        const position = new Point(this.position, {"tiled": true})
        if(Keyb.wasJustPressed("<space>", delta.ms)
        && this.collection.has(position) == false) {
            this.collection.add(new Bomb({"position": position, "distance": 3}))
        }
    }
}

class Point {
    constructor({x, y}, {tiled} = {}) {
        this.x = x
        this.y = y

        if(tiled == true) {
            this.x = this.tx * TILE
            this.y = this.ty * TILE
        }
    }
    get tx() {
        return Math.round(this.x / TILE)
    }
    get ty() {
        return Math.round(this.y / TILE)
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
}

class Bomb {
    constructor({position, distance}) {
        this.type = "bomb"
        this.position = position
        this.key = this.position.key
        this.image = require("assets/images/bomb.png")

        this.time = 0
    }
    update(delta) {
        // console.log(delta)
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

        this.entities.add(new Player())

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
        // if(Keyb.wasJustPressed("<space>", delta.ms)) {
        //     // Director.flush()
        //     this.play()
        // }

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
