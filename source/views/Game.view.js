import Index from "index"
import * as Preact from "preact"
import Keyset from "models/utility/Keyset.js"

import PixiRenderer from "views/renderers/PixiRenderer.js"

import "views/Game.view.less"

export default class Game {
    render() {
        return (
            <div class="Game">
                <PixiRenderer
                    views={Index.entities.get()}
                    camera={Index.entities.get("camera")}/>
            </div>
        )
    }
}
