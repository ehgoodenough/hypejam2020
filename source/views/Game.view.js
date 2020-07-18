import Index from "index"
import * as Preact from "preact"
import Keyset from "models/utility/Keyset.js"

import PixiRenderer from "views/renderers/PixiRenderer.js"

import "views/Game.view.less"

export default class Game {
    render() {
        return (
            <div class="Game">
                <PixiRenderer views={views()}/>
            </div>
        )
    }
}

function views() {
    return [
        Object.values(Index.entities).map((entity) => {
            const view = {}
            view.position = entity.position
            view.scale = entity.scale
            view.whiteout = entity.whiteout
            if(entity.position != undefined
            && entity.nudge != undefined) {
                view.position = {
                    "x": entity.position.x + entity.nudge.x,
                    "y": entity.position.y + entity.nudge.y,
                }
            }
            if(entity.type == "bomb") {
                view.image = require("assets/images/bomb1.png")
                // view.outline = {
                //     "thickness": 1,
                //     "color": 0xfeeae0,
                // }
            }
            return view
        })
    ]
}
