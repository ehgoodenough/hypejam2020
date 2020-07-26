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

        const explosions = [{"position": this.position, "power": this.power}]
        const superexplosions = []
        while(explosions.length > 0) {
            const explosion = explosions.shift()
            explosion.submark = explosion.submark || 0

            const collision = this.collection.get(explosion.position)
            if(collision != undefined) {
                if(collision.type == "block") {
                    continue
                }
                if(collision.type == "boxblock") {
                    // this.collection.remove(collision)
                    explosion.toDestroy = collision
                    explosion.isSnuffed = true
                }
                if(collision.type == "bomb") {
                    // ALSO EXPLODE THIS BOMB!!
                }
            }

            superexplosions.push(explosion)

            // Recurse!!
            if(explosion.power > 0
            && explosion.isSnuffed != true) {
                Object.values(Directions).forEach((direction) => {
                    explosions.push({
                        "power": explosion.power - 1,
                        "submark": explosion.submark + 1,
                        "position": new Point({
                            "tx": this.position.tx + direction.x,
                            "ty": this.position.ty + direction.y,
                        })
                    })
                })
            }
        }

        Director.add({
            "mark": 0,
            "type": "explosion",
            "explosions": superexplosions
        })

        this.collection.remove(this)
    }
}
