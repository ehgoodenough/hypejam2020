import Keyb from "keyb"

import Director from "models/Director.js"
import Geometry from "models/utility/Geometry.js"
import Directions from "models/utility/Directions.js"
import frame from "data/frame.js"

const TILE = frame.resolution
const CENTER_POSITION = {
    "x": 0, // (frame.width * frame.resolution) / 2,
    "y": 0, // (frame.height * frame.resolution) / 2,
}
const generateExplosions = () => [
    {"positions": [
        CENTER_POSITION
    ]},
    {"positions": [
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.north, TILE)),
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.south, TILE)),
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.east, TILE)),
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.west, TILE)),
    ]},
    {"positions": [
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.north, TILE * 2)),
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.south, TILE * 2)),
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.east, TILE * 2)),
        Geometry.add(CENTER_POSITION, Geometry.multiply(Directions.west,TILE * 2)),
    ]},
]

export default class Index {
    constructor() {
        this.entities = {
            "bomb:0": {
                "type": "bomb",
                "position": {"x": 0, "y": 0},
                "image": require("assets/images/bomb1.png"),
            },
            "camera": {
                "type": "camera",
                "position": {"x": 0, "y": 0},
                "nudge": {"x": 0, "y": 0},
                "zoom": 1,
            }
        }

        // Director.add({
        //     "type": "explode",
        //     "key": "bomb:0",
        // })
        Director.add({
            "type": "explosion",
            "explosions": generateExplosions(),
        })
    }
    update(delta) {
        if(Keyb.wasJustPressed("<space>", delta.ms)) {
            Director.add({
                "type": "explosion",
                "explosions": generateExplosions(),
            })
        }

        Director.update(delta)
    }
}
