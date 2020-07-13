import Index from "index"
import * as Preact from "preact"

import Frame from "views/Frame.view.js"
import Game from "views/Game.view.js"

import "views/Mount.view.less"

export default class Mount {
    render() {
        return (
            <div class="Mount">
                <title>{Index.title}</title>
                <Frame>
                    <Game/>
                </Frame>
            </div>
        )
    }
}
