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
        "image": require("assets/images/red-monkey.png"),
        "position": Index.bomb.position,
    })
    return views
}
