import Index from "index"
import * as Preact from "preact"

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
    const views = []
    views.push({
        "image": require("assets/images/bomb1.png"),
        "position": Index.bomb.position,
        "test": true,
        // "scale": {
        //     "x": 1,
        //     "y": 0.5,
        // },
        // "outline": {
        //     "thickness": 1,
        //     "color": 0xfeeae0,
        // }
    })
    return views
}
