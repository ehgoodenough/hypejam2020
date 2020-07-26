import Bomber from "models/Bomber.js"
import Point from "models/utility/Point.js"
import Collection from "models/utility/Collection.js"
import Director from "models/Director.js"
import Camera from "models/Camera.js"
import Keyset from "models/utility/Keyset.js"

const carvedOut = Keyset.from([
    new Point({"tx": 0, "ty": 0}),
    new Point({"tx": 0, "ty": 1}),
    new Point({"tx": 1, "ty": 0}),
    new Point({"tx": -1, "ty": 0}),
    new Point({"tx": -2, "ty": 0}),
    new Point({"tx": -2, "ty": 1}),
    new Point({"tx": -2, "ty": -1}),
])

export default class Index {
    constructor() {
        this.entities = new Collection()

        this.entities.add(new Camera())

        this.entities.add(new Bomber(require("data/bomber1.json")))
        this.entities.add(new Bomber(require("data/bomber2.json")))
        // this.entities.add(new Bomber(require("data/bomber3.json")))
        // this.entities.add(new Bomber(require("data/bomber4.json")))
        // this.entities.add(new Bomber(require("data/bomber5.json")))
        // this.entities.add(new Bomber(require("data/bomber6.json")))
        // this.entities.add(new Bomber(require("data/bomber7.json")))

        this.entities.add(new Bomber({
            "position": {"tx": -7, "ty": -1},
            "imagename": "bomber",
            "imagecolor": "blue"
        }))

        const height = 5// 20
        const width = 5 // 36
        for(let tx = -width; tx <= width; tx += 1) {
            for(let ty = -height; ty <= height; ty += 1) {
                const block = {
                    "type": "block",
                    "position": new Point({"tx": tx, "ty": ty}),
                    "image": require("assets/images/wall.png"),
                }
                block.key = block.position.key
                if(carvedOut[block.position.key] != undefined) {
                    continue
                }
                if(tx % 2 == 0 || ty % 2 == 0) {
                    block.image = require("assets/images/crate.png")
                    block.type = "boxblock"
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
