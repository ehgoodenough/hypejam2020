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
        this.collection = new Collection()

        this.collection.add(new Camera())
        // this.collection.values.camera.zoom = 4

        // this.collection.add(new Bomber(require("data/bomber1.json")))
        // this.collection.add(new Bomber(require("data/bomber2.json")))
        // this.collection.add(new Bomber(require("data/bomber3.json")))
        // this.collection.add(new Bomber(require("data/bomber4.json")))
        // this.collection.add(new Bomber(require("data/bomber5.json")))
        // this.collection.add(new Bomber(require("data/bomber6.json")))
        // this.collection.add(new Bomber(require("data/bomber7.json")))

        this.collection.add(new Bomber({
            "position": {"tx": 0, "ty": 0},
            "imagename": "bomber",
            "imagecolor": "blue"
        }))

        // this.collection.add({
        //     "image": require("assets/images/logo.png"),
        //     "position": {"x": 0, "y": -200},
        //     "stack": 10000000,
        //     "type": "logo",
        //     "key": "logo",
        // })

        const height = 20
        const width = 36
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
                this.collection.add(block)
            }
        }

        // Director.add({
        //     "type": "trailer",
        // })
    }
    update(delta) {
        // delta.s /= 8
        // delta.ms /= 8

        // return // DEBUG

        this.collection.get().forEach((entity) => {
            if(entity.update instanceof Function) {
                entity.update(delta)
            }
        })

        Director.update(delta)
    }
}
