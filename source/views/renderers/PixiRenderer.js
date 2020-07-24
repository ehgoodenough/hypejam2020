import Index from "index"
import * as Pixi from "pixi.js"
import * as Preact from "preact"
import {OutlineFilter} from "@pixi/filter-outline"

import Loader from "views/renderers/Loader.js"

Pixi.utils.skipHello()
Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST
// renderer.roundPixels = true

const frame = {
    "width": 16 * 24*3,
    "height": 9 * 24*3,
}

const app = new Pixi.Application({
    "width": frame.width,
    "height": frame.height,
    // "transparent": true,
    "backgroundColor": 0xf8d870,
})

////////////////
// RENDERING //
//////////////

function createPixi(views) {
    if(Loader.isDone != true) {
        return new Pixi.Container()
    }
    const pixi = new Pixi.Container()
    createPixiComponent(pixi, views)
    // pixi.position.x = view.camera.position.x
    // pixi.position.y = view.camera.position.y
    pixi.sortChildren()
    return pixi
}

function createPixiComponent(pixi, entity) {
    if(entity == undefined) {
        return
    } else if(entity instanceof Array) {
        entity.forEach((_entity) => {
            createPixiComponent(pixi, _entity)
        })
    } else {
        // if(entity.type == "Line") {
        //     // Can we somehow represent this with
        //     // something more efficient like a low
        //     // level mesh??
        //     const graphics = new Pixi.Graphics()
        //     const a = entity.points[0]
        //     const b = entity.points[1]
        //     graphics.lineStyle(20, 0xf0ead6)
        //     graphics.moveTo(a.x, a.y)
        //     graphics.lineTo(b.x, b.y)
        //     graphics.zIndex = 1000000
        //     pixi.addChild(graphics)
        //     return
        // }
        // if(entity.type == "Text") {
        //     const text = new Pixi.Text(entity.text, {"fontFamily": "Arial", "fontSize": 48, "fill": 0x000000})
        //     text.anchor.x = 0.5
        //     text.anchor.y = 0.5
        //     text.position.x = entity.position.x
        //     text.position.y = entity.position.y
        //     text.position.z = entity.position.z
        //     text.zIndex = 1000000
        //     pixi.addChild(text)
        //     return
        // }
        if(entity.type == "camera") {
            return
        }
        let sprite = undefined
        if(entity.radius != undefined) {
            const graphics = new Pixi.Graphics()
            graphics.beginFill(entity.color)
            graphics.lineStyle(0)
            // let x = entity.position.x
            // let y = entity.position.y
            // if(entity.nudge != undefined) {
            //     x += entity.nudge.x || 0
            //     y += entity.nudge.y || 0
            // }
            graphics.drawCircle(0, 0, entity.radius)
            graphics.endFill()
            graphics.zIndex = 1000000
            // pixi.addChild(graphics)
            // return
            sprite = graphics
        } else {
            if(Loader.resources[entity.image] == undefined) {
                console.log("Could not find image resource in loader.")
                return
            }
            sprite = new Pixi.Sprite(Loader.resources[entity.image].texture)
        }

        if(entity.position != undefined) {
            sprite.position.x = entity.position.x
            sprite.position.y = entity.position.y
            sprite.zIndex = entity.position.stack || entity.position.y
        }
        // THIS IS A VERY SPECIFIC ATTRIBUTE
        if(entity.nudge != undefined) {
            sprite.position.x += entity.nudge.x || 0
            sprite.position.y += entity.nudge.y || 0
        }
        if(entity.opacity !== undefined) {
            sprite.alpha = entity.opacity
        }
        // sprite.blendMode = Pixi.BLEND_MODES.MULTIPLY
        sprite.angle = entity.rotation || 0

        if(entity.grayscale != undefined) {
            sprite.filters = sprite.filters || []
            const filter = new Pixi.filters.ColorMatrixFilter()
            filter.alpha = entity.grayscale || 0
            filter.greyscale(0.33, false)
            sprite.filters.push(filter)
        }

        if(entity.whiteout != undefined) {
            sprite.filters = sprite.filters || []
            const filter = new Pixi.filters.ColorMatrixFilter()
            filter.alpha = entity.whiteout || 0
            filter.contrast(10, true)
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
            sprite.filters.push(filter)
        }

        if(entity.scale != undefined) {
            sprite.scale.x = entity.scale.x || 1
            sprite.scale.y = entity.scale.y || 1
        }

        if(entity.outline != undefined) {
            sprite.filters = sprite.filters || []
            sprite.filters.push(new OutlineFilter(entity.outline.thickness, entity.outline.color))
        }
        pixi.addChild(sprite)
    }
}

export default class PixiRenderer {
    render() {
        if(Loader.isDone != true) {
            return [
                <div class="PixiRenderer" id="pixi"/>,
                <div class="Progress">{Math.round(Loader.progress) + "%"}</div>
            ]
        }
        let camerastyle = {}
        app.stage = createPixi(this.props.views)
        if(this.props.camera != undefined) {
            if(this.props.camera.position != undefined) {
                app.stage.position.x = this.props.camera.position.x - (app.renderer.width / 2)
                app.stage.position.y = this.props.camera.position.y - (app.renderer.height / 2)
                if(this.props.camera.nudge != undefined) {
                    app.stage.position.x += this.props.camera.nudge.x || 0
                    app.stage.position.y += this.props.camera.nudge.y || 0
                }
                camerastyle.transform = "scale(" + this.props.camera.zoom + ")"
                app.stage.position.x *= -1
                app.stage.position.y *= -1
            }
        }
        return [
            <div class="PixiRenderer" id="pixi" style={camerastyle}/>,
            // <div class="Flash" style={{"backgroundColor": this.props.camera && this.props.camera.color}}/>
        ]
    }
    componentDidMount() {
        document.getElementById("pixi").appendChild(app.view)
    }
}
