import Index from "index"
import * as Pixi from "pixi.js"
import {OutlineFilter} from "@pixi/filter-outline"
import Keyset from "models/utility/Keyset.js"
import Point from "models/utility/Point.js"
import PaletteSwapFilter from "views/renderers/PaletteSwapFilter.js"

import Loader from "views/renderers/Loader.js"

Pixi.utils.skipHello()
Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST
Pixi.SCALE_MODES.DEFAULT = Pixi.SCALE_MODES.NEAREST
// renderer.roundPixels = true

// TODO: Merge this with data/frame.js
const frame = {
    "width": 16 * 24*3,
    "height": 9 * 24*3,
}

const app = new Pixi.Application({
    "width": frame.width,
    "height": frame.height,
    // "transparent": true,
    "backgroundColor": 0xf7c881, // true color
    // "backgroundColor": 0xEEEEEE,
})
app.stage.sprites = {} // key set!
document.getElementById("frame").appendChild(app.view)
window.app = app

const PALETTE_IMAGES = {
    "blue": require("assets/images/blue.palette.png"),
    "yellow": require("assets/images/yellow.palette.png"),
    "red": require("assets/images/red.palette.png"),
    "green": require("assets/images/green.palette.png"),
}

function update({viewmodels, camera}) {
    if(Loader.isDone != true) {
        console.log(Math.round(Loader.progress) + "%")
        return
    }

    updatePixi(viewmodels)

    if(camera != undefined
    && camera.position != undefined) {
        app.stage.position.x = camera.position.x - (app.renderer.width / 2)
        app.stage.position.y = camera.position.y - (app.renderer.height / 2)
        if(camera.nudge != undefined) {
            app.stage.position.x += camera.nudge.x || 0
            app.stage.position.y += camera.nudge.y || 0
        }
        app.stage.position.x *= -1
        app.stage.position.y *= -1

        app.view.style.transform = "scale(" + camera.zoom + ")"
    }
}


function updatePixi(viewmodels) {
    if(Loader.isDone != true) {
        return
    }

    app.stage.children.forEach((sprite) => {
        if(viewmodels[sprite.key] == undefined) {
            app.stage.removeChild(sprite)
            delete app.stage.sprites[sprite.key]
        }
    })

    Keyset.forEach(viewmodels, (viewmodel) => {
        let sprite = app.stage.sprites[viewmodel.key]

        if(sprite == undefined) {
            sprite = createPixiSprite(viewmodel)
            app.stage.addChild(sprite)
            app.stage.sprites[sprite.key] = sprite
        }

        updatePixiSprite(viewmodel, sprite)
    })

    app.stage.sortChildren()
}

function createPixiSprite(viewmodel) {
    let sprite = undefined
    // TODO: Combine this with the updatePixiSprite so it can JIT create it.
    // TODO: is radius really the trigger for generic graphics?
    if(viewmodel.radius != undefined) {
        sprite = new Pixi.Graphics()
    } else {
        sprite = new Pixi.Sprite()
    }

    sprite.key = viewmodel.key
    return sprite
}

function updatePixiSprite(viewmodel, sprite) {
    if(viewmodel == undefined
    || sprite == undefined) {
        return
    }
    // if(viewmodel instanceof Array) {
    //     return viewmodel.map((_viewmodel) => {
    //         updatePixiSprite(pixi, _viewmodel)
    //     })
    // }
    // if(viewmodel.type == "Line") {
    //     // Can we somehow represent this with
    //     // something more efficient like a low
    //     // level mesh??
    //     const graphics = new Pixi.Graphics()
    //     const a = viewmodel.points[0]
    //     const b = viewmodel.points[1]
    //     graphics.lineStyle(20, 0xf0ead6)
    //     graphics.moveTo(a.x, a.y)
    //     graphics.lineTo(b.x, b.y)
    //     graphics.zIndex = 1000000
    //     pixi.addChild(graphics)
    //     return
    // }
    // if(viewmodel.type == "Text") {
    //     const text = new Pixi.Text(viewmodel.text, {"fontFamily": "Arial", "fontSize": 48, "fill": 0x000000})
    //     text.anchor.x = 0.5
    //     text.anchor.y = 0.5
    //     text.position.x = viewmodel.position.x
    //     text.position.y = viewmodel.position.y
    //     text.position.z = viewmodel.position.z
    //     text.zIndex = 1000000
    //     pixi.addChild(text)
    //     return
    // }
    if(viewmodel.type == "camera") {
        return
    }
    if(sprite instanceof Pixi.Graphics) {
        if(viewmodel.radius != undefined) {
            sprite.clear()
            // const graphics2 = new Pixi.Graphics()
            sprite.beginFill(viewmodel.color)
            // graphics2.beginFill(viewmodel.color)
            sprite.lineStyle(0)
            // graphics2.lineStyle(1, 0x543935)
            // graphics2.lineStyle(1, 0xfeeae0)
            sprite.drawCircle(0, 0, viewmodel.radius)
            sprite.endFill()
        }
    }

    if(sprite instanceof Pixi.Sprite) {
        if(viewmodel.image != undefined) {
            if(Loader.resources[viewmodel.image] == undefined) {
                console.log("Could not find image resource in loader.")
                return
            }
            sprite.texture = Loader.resources[viewmodel.image].texture
            sprite.anchor = sprite.texture.defaultAnchor
        }
    }

    if(viewmodel.position != undefined) {
        sprite.position.x = viewmodel.position.x
        sprite.position.y = viewmodel.position.y
        sprite.zIndex = (viewmodel.position.y * 10)
        // if(sprite.position.stack != undefined) {
        //     sprite.zIndex += sprite.position.stack
        // }
        if(sprite instanceof Pixi.Graphics) {
            sprite.position.y -= Point.TILE / 2
        }
    }
    if(viewmodel.nudge != undefined) {
        // why isn't this in a view model...
        sprite.position.x += viewmodel.nudge.x || 0
        sprite.position.y += viewmodel.nudge.y || 0
    }
    sprite.angle = viewmodel.rotation || 0
    sprite.scale.x = (viewmodel.scale ? viewmodel.scale.x || 1 : 1) * (viewmodel.direction == "left" ? -1 : +1)
    sprite.scale.y = (viewmodel.scale ? viewmodel.scale.y || 1 : 1)
    // sprite.position.x = Math.round(sprite.position.x)
    // sprite.position.y = Math.round(sprite.position.y)
    if(viewmodel.opacity !== undefined) {
        sprite.alpha = viewmodel.opacity
        // // sprite.blendMode = Pixi.BLEND_MODES.MULTIPLY
    }
    if(viewmodel.grayscale != undefined) {
        sprite.filters = sprite.filters || []
        const filter = new Pixi.filters.ColorMatrixFilter()
        filter.alpha = viewmodel.grayscale || 0
        filter.greyscale(0.33, false)
        sprite.filters.push(filter)
    }
    if(viewmodel.imagecolor != undefined
    && PALETTE_IMAGES[viewmodel.imagecolor] != undefined) {
        sprite.filters = sprite.filters || []
        sprite.filtering = sprite.filtering || {}
        if(sprite.filtering.imagecolor == undefined) {
            sprite.filtering.imagecolor = new PaletteSwapFilter(PALETTE_IMAGES[viewmodel.imagecolor])
            sprite.filters.push(sprite.filtering.imagecolor)
        }
    }
    if(viewmodel.whiteout != undefined) {
        sprite.filters = sprite.filters || []
        sprite.filtering = sprite.filtering || {}
        if(sprite.filtering.colormatrix == undefined) {
            sprite.filtering.colormatrix = new Pixi.filters.ColorMatrixFilter()
            sprite.filters.push(sprite.filtering.colormatrix)
            // filter.blackAndWhite(false)
            // filter.browni(true)
            // filter.brightness(1, true)
            // filter.desaturate()
            // filter.hue(90, true)
            // filter.kodachrome(true)
            // filter.lsd(true)
            // filter.polaroid(true)
            // filter.technicolor(true)
            // filter.vintage(true)
        }
        sprite.filtering.colormatrix.alpha = viewmodel.whiteout || 0
        sprite.filtering.colormatrix.contrast(10, true)
    }
    if(viewmodel.outline != undefined) {
        sprite.filters = sprite.filters || []
        sprite.filtering = sprite.filtering || {}
        if(sprite.filtering.outline == undefined) {
            sprite.filtering.outline = new OutlineFilter(viewmodel.outline.thickness, viewmodel.outline.color)
            sprite.filters.push(sprite.filtering.outline)
        }
        sprite.filtering.outline.thickness = viewmodel.outline.thickness
        sprite.filtering.outline.color = viewmodel.outline.color
    }
    return sprite
}

export default {update}
