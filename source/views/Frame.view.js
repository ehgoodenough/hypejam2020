import Index from "index"
import * as Preact from "preact"

import frame from "data/frame.js"

import "views/Frame.view.less"

export default class Frame {
    render() {
        return (
            <div class="Frame" id="frame" style={this.style}>
                {this.props.children}
            </div>
        )
    }
    get style() {
        return {
            "width": frame.width + "em",
            "height": frame.height + "em"
        }
    }
}
