import Director from "models/Director.js"

import Directions from "models/utility/Directions.js"
import Point from "models/utility/Point.js"

export default class Bomb {
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

        // const positions = [this.position]
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
                if(collision != undefined) {
                    console.log(collision)
                    if(collision.type == "block") {
                        return
                    }
                    if(collision.type == "boxblock") {
                        this.collection.remove(collision) // REMOVE AS PART OF ANIMATION
                    }
                    if(collision.type == "bomb") {
                        // ALSO EXPLODE THIS BOMB!!
                    }
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
