import "statgrab/do"

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
    // delta.ms /= 8
    if(Loader.isDone) index.update(delta)
    this.view = Preact.render(<View/>, document.body, this.view)
})

////////////
// Frame //
//////////

import frame from "data/frame.js"
import frem from "frem"

frem(frame)
