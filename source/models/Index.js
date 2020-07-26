import Bomber from "models/Bomber.js"
import Point from "models/utility/Point.js"
import Collection from "models/utility/Collection.js"
import Director from "models/Director.js"
import Camera from "models/Camera.js"

export default class Index {
    constructor() {
        this.entities = new Collection()

        this.entities.add(new Camera())

        // this.entities.add(new Bomber(require("data/bomber1.json")))
        // this.entities.add(new Bomber(require("data/bomber2.json")))
        // this.entities.add(new Bomber(require("data/bomber3.json")))
        // this.entities.add(new Bomber(require("data/bomber4.json")))
        // this.entities.add(new Bomber(require("data/bomber5.json")))
        // this.entities.add(new Bomber(require("data/bomber6.json")))
        // this.entities.add(new Bomber(require("data/bomber7.json")))

        this.entities.add(new Bomber({
            "position": {"tx": 0, "ty": 0},
            "imagename": "bomber",
            "imagecolor": "yellow"
        }))

        const height = 5// 20
        const width = 5 // 36
        for(let x = -width; x <= width; x += 1) {
            for(let y = -height; y <= height; y += 1) {
                const block = {
                    "type": "block",
                    "position": {"x": x * 16, "y": y * 16},
                    "image": require("assets/images/wall.png"),
                }
                block.key = Point.key({
                    "x": block.position.x / Point.TILE,
                    "y": block.position.y / Point.TILE,
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
