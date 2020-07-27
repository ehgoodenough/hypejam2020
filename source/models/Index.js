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

    new Point({"tx": -32, "ty": -7}),
    new Point({"tx": -32, "ty": -8}),
    new Point({"tx": -32, "ty": -9}),
    new Point({"tx": -33, "ty": -8}),
    new Point({"tx": -34, "ty": -8}),
    new Point({"tx": -34, "ty": -9}),

    new Point({"tx": -24, "ty": 11}),
    new Point({"tx": -24, "ty": 12}),
    new Point({"tx": -23, "ty": 12}),
    new Point({"tx": -22, "ty": 12}),
    new Point({"tx": -21, "ty": 12}),
    new Point({"tx": -22, "ty": 13}),
    new Point({"tx": -24, "ty": 13}),

    new Point({"tx": -12, "ty": 15}),
    new Point({"tx": -12, "ty": 16}),
    new Point({"tx": -11, "ty": 16}),
    new Point({"tx": -10, "ty": 16}),
    new Point({"tx": -10, "ty": 17}),
    new Point({"tx": -9, "ty": 16}),

    new Point({"tx": -16, "ty": 3}),
    new Point({"tx": -16, "ty": 4}),
    new Point({"tx": -16, "ty": 5}),
    new Point({"tx": -17, "ty": 4}),
    new Point({"tx": -15, "ty": 4}),
    new Point({"tx": -14, "ty": 4}),

    new Point({"tx": 18, "ty": 7}),
    new Point({"tx": 18, "ty": 8}),
    new Point({"tx": 17, "ty": 8}),
    new Point({"tx": 16, "ty": 8}),
    new Point({"tx": 16, "ty": 9}),
    new Point({"tx": 19, "ty": 8}),

    new Point({"tx": 30, "ty": -4}),
    new Point({"tx": 30, "ty": -3}),
    new Point({"tx": 30, "ty": -5}),
    new Point({"tx": 29, "ty": -4}),
    new Point({"tx": 28, "ty": -4}),
    new Point({"tx": 27, "ty": -4}),

    new Point({"tx": 6, "ty": -16}),
    new Point({"tx": 7, "ty": -16}),
    new Point({"tx": 8, "ty": -16}),
    new Point({"tx": 8, "ty": -15}),
    new Point({"tx": 8, "ty": -14}),
    new Point({"tx": 7, "ty": -14}),

    new Point({"tx": 12, "ty": -10}),
    new Point({"tx": 13, "ty": -10}),
    new Point({"tx": 14, "ty": -10}),
    new Point({"tx": 14, "ty": -11}),
    new Point({"tx": 15, "ty": -10}),

    new Point({"tx": 35, "ty": 16}),
    new Point({"tx": 34, "ty": 16}),
    new Point({"tx": 34, "ty": 17}),
    new Point({"tx": 34, "ty": 18}),
    new Point({"tx": 35, "ty": 18}),
    new Point({"tx": 33, "ty": 18}),
    new Point({"tx": 32, "ty": 18}),
    new Point({"tx": 34, "ty": 19}),
    new Point({"tx": 34, "ty": 20}),
    new Point({"tx": 35, "ty": 20}),
])

export default class Index {
    constructor() {
        this.collection = new Collection()

        this.collection.add(new Camera())
        // this.collection.values.camera.zoom = 3

        this.collection.add(new Bomber(require("data/bomber1.json")))
        this.collection.add(new Bomber(require("data/bomber2.json")))
        this.collection.add(new Bomber(require("data/bomber3.json")))
        this.collection.add(new Bomber(require("data/bomber4.json")))
        this.collection.add(new Bomber(require("data/bomber5.json")))
        this.collection.add(new Bomber(require("data/bomber6.json")))
        this.collection.add(new Bomber(require("data/bomber7.json")))
        this.collection.add(new Bomber(require("data/bomber8.json")))
        this.collection.add(new Bomber(require("data/bomber9.json")))
        this.collection.add(new Bomber(require("data/bomber10.json")))
        this.collection.add(new Bomber(require("data/bomber11.json")))
        this.collection.add(new Bomber(require("data/bomber12.json")))

        // this.collection.add(new Bomber({
        //     "position": {"tx": 35, "ty": 16},
        //     "imagename": "bomber",
        //     "imagecolor": "red"
        // }))

        this.collection.add({
            "image": require("assets/images/logo.png"),
            "position": {"x": 0, "y": -200},
            "stack": 10000000,
            "type": "logo",
            "key": "logo",
        })

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

        Director.add({
            "type": "trailer",
        })
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
