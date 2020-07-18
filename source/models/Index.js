import Director from "models/Director.js"
import Geometry from "models/utility/Geometry.js"
import Directions from "models/utility/Directions.js"

export default class Index {
    constructor() {
        this.time = 0
        this.frame = {"width": 16, "height": 9, "resolution": 24}

        this.entities = {
            "bomb:0": {
                "type": "bomb",
                "position": {"x": (16*20)/2, "y": (9*20)/2},
                "image": require("assets/images/bomb1.png"),
                // "scale": {"x": 0.5, "y": 1}
                "opacity": 0,
            }
        }

        // Director.add({
        //     "type": "explode",
        //     "key": "bomb:0",
        // })
        const TILE = this.frame.resolution
        const CENTER_POSITION = {
            "x": (this.frame.width*this.frame.resolution)/2,
            "y": (this.frame.height*this.frame.resolution)/2,
        }
        Director.add({
            "type": "explosion",
            "position": this.entities["bomb:0"].position,
            "distance": 5,
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
            ],
        })
    }
    update(delta) {
        this.time += delta.s

        Director.update(delta)
    }
}
