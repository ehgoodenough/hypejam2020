import Director from "models/Director.js"

export default class Index {
    constructor() {
        this.time = 0
        this.frame = {"width": 16, "height": 9, "resolution": 20}

        this.entities = {
            "bomb:0": {
                "type": "bomb",
                "position": {"x": (16*20)/2, "y": (9*20)/2},
                // "scale": {"x": 0.5, "y": 1}
            }
        }

        Director.add({
            "type": "explode",
            "key": "bomb:0",
        })
    }
    update(delta) {
        this.time += delta.s

        Director.update(delta)
    }
}
