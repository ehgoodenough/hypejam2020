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
        this.position = {"x": 100, "y": 100}
        this.image = require("assets/images/red-monkey.png")

        this.speed = TILE * 8
    }
    update(delta) {
        if(Keyb.isPressed("<left>")) {
            this.position.x -= this.speed * delta.s
        }
        if(Keyb.isPressed("<right>")) {
            this.position.x += this.speed * delta.s
        }
        if(Keyb.isPressed("<up>")) {
            this.position.y -= this.speed * delta.s
        }
        if(Keyb.isPressed("<down>")) {
            this.position.y += this.speed * delta.s
        }

        const position = {}
        position.x = Math.round(this.position.x / TILE) * TILE
        position.y = Math.round(this.position.y / TILE) * TILE
        position.key = Point.toString(position)

        if(Keyb.wasJustPressed("<space>", delta.ms)
        && this.collection.has(position.key) == false) {
            this.collection.add(new Bomb({"position": position, "distance": 3}))
        }
    }
}

class Point {
    // constructor({x, y}) {
    //     this.x = x
    //     this.y = y
    // }
    static toString(point) {
        return point.x + "x" + point.y
    }
}

class Bomb {
    constructor({position, distance}) {
        this.type = "bomb"
        this.position = position
        this.image = require("assets/images/bomb1.png")

        this.key = this.position.key || Point.toString(this.position)

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
                    "key": shortid.generate(),
                    "position": {"x": x * 16, "y": y * 16},
                    "image": require("assets/images/wall.png"),
                }
                if(x % 2 == 0 || y % 2 == 0) {
                    block.image = require("assets/images/crate.png")
                    continue // DEBUG
                }
                this.entities.add(block)
            }
        }

        this.play()
    }
    update(delta) {
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
