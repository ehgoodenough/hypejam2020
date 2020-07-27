import "statgrab/do"

import Stats from "stats.js"
const stats = new Stats()
stats.showPanel(0)
stats.dom.style.position = "absolute"
// document.body.appendChild(stats.dom)
document.getElementById("frame").appendChild(stats.dom)

////////////
// Index //
//////////

import Index from "models/Index.js"
const index = new Index()

// By exporting this from the index, we
// can access it by explicitly importing.
export default index

// By attaching this to the window, we
// can access this from the javascript
// developer console. We should probably
// remove this in production, but until
// then, it's useful during development.
if(__STAGE__ === "DEVELOPMENT") {
    window._ = index
}

////////////////
// Main Loop //
//////////////

import * as Preact from "preact"
import Yaafloop from "yaafloop"

import View from "views/Mount.view.js"
import Loader from "views/renderers/Loader.js"

let loop = new Yaafloop(function(delta) {
    // console.log(delta.ms)
    stats.begin()
    // delta.ms /= 8
    // if(Loader.isDone) index.update(delta)
    this.view = Preact.render(<View/>, document.getElementById("subframe"), this.view)
    stats.end()
})

////////////
// Frame //
//////////

import frame from "data/frame.js"
import frem from "frem"

frem(frame)

document.getElementById("frame").style.width = frame.width + "em"
document.getElementById("frame").style.height = frame.height + "em"
