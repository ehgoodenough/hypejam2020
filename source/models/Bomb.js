import Director from "models/Director.js"

import Directions from "models/utility/Directions.js"
import Point from "models/utility/Point.js"
import Geometry from "models/utility/Geometry.js"

export default class Bomb {
    constructor({position, power}) {
        this.type = "bomb"
        this.position = position
        this.key = this.position.key
        this.image = require("assets/images/bomb.png")

        this.power = power
        this.time = 0 // in seconds

        // this.fuse = 1.66 // in seconds
        this.fuse = 1 // in seconds
    }
    update(delta) {
        this.time += delta.s

        if(this.time >= this.fuse) {
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
                    const boxblock = collision
                    explosion.collision = boxblock
                    explosion.power = 0
                }
                if(collision.type == "bomb"
                && collision.hasExploded != true) {
                    const bomb = collision
                    explosion.collision = bomb
                    explosion.power = Math.max(explosion.power, bomb.power)
                    explosion.direction = undefined // go in all directions!!
                }
            }
            Object.values(this.collection.values).forEach((entity) => {
                if(entity.type == "bomber"
                && entity.position.key == explosion.position.key) {
                    explosion.collision = entity
                }
            })

            superexplosions.push(explosion)

            // Recurse!!
            if(explosion.power > 0) {
                if(explosion.direction == undefined) {
                    Object.values(Directions).forEach((direction) => {
                        explosions.push({
                            "power": explosion.power - 1,
                            "submark": explosion.submark + 1,
                            "direction": direction,
                            "position": new Point({
                                "tx": explosion.position.tx + direction.x,
                                "ty": explosion.position.ty + direction.y,
                            })
                        })
                    })
                } else {
                    explosions.push({
                        "power": explosion.power - 1,
                        "submark": explosion.submark + 1,
                        "direction": explosion.direction,
                        "position": new Point({
                            "tx": explosion.position.tx + explosion.direction.x,
                            "ty": explosion.position.ty + explosion.direction.y,
                        })
                    })
                }
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
