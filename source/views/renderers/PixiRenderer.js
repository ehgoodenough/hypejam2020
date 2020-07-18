import Index from "index"
import * as Pixi from "pixi.js"
import * as Preact from "preact"
import {OutlineFilter} from "@pixi/filter-outline"

Pixi.utils.skipHello()
Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST
// renderer.roundPixels = true

const frame = {"width": 16, "height": 9, "resolution": 20}

const app = new Pixi.Application({
    "width": frame.width * frame.resolution,
    "height": frame.height * frame.resolution,
    "transparent": true,
})

////////////////
// RESOURCES //
//////////////

const TOP_LEFT_ANCHOR = {"x": 0, "y": 0}
const CENTER_ANCHOR = {"x": 0.5, "y": 0.5}

const resources = [
    {"file": require("assets/images/red-monkey.png"), "defaultAnchor": CENTER_ANCHOR},
    {"file": require("assets/images/bomb1.png"), "defaultAnchor": CENTER_ANCHOR},
]

const loader = new Pixi.Loader()
loader.add(resources.map((resource) => resource.file)).load(function() {
    resources.forEach((resource) => {
        if(resource.defaultAnchor != undefined
        && loader.resources[resource.file] != undefined
        && loader.resources[resource.file].texture != undefined) {
            loader.resources[resource.file].texture.defaultAnchor.x = resource.defaultAnchor.x
            loader.resources[resource.file].texture.defaultAnchor.y = resource.defaultAnchor.y
        }
    })
    loader.isDone = true
})

////////////////
// RENDERING //
//////////////

function createPixi(views) {
    if(loader.isDone != true) {
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
        if(entity.type == "Line") {
            // Can we somehow represent this with
            // something more efficient like a low
            // level mesh??
            const graphics = new Pixi.Graphics()
            const a = entity.points[0]
            const b = entity.points[1]
            graphics.lineStyle(20, 0xf0ead6)
            graphics.moveTo(a.x, a.y)
            graphics.lineTo(b.x, b.y)
            graphics.zIndex = 1000000
            pixi.addChild(graphics)
            return
        }
        if(entity.type == "Text") {
            const text = new Pixi.Text(entity.text, {"fontFamily": "Arial", "fontSize": 48, "fill": 0x000000})
            text.anchor.x = 0.5
            text.anchor.y = 0.5
            text.position.x = entity.position.x
            text.position.y = entity.position.y
            text.position.z = entity.position.z
            text.zIndex = 1000000
            pixi.addChild(text)
            return
        }
        // console.log(entity.position)
        if(loader.resources[entity.image] == undefined) {
            // console.warn("Could not find image resource in the loader:", entity.image)
            console.log("Could not find image resource in loader.")
            return
        }
        const sprite = new Pixi.Sprite(loader.resources[entity.image].texture)

        sprite.position.x = entity.position.x
        sprite.position.y = entity.position.y
        sprite.zIndex = entity.position.stack
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
        if(loader.isDone != true) {
            return (
                <div class="PixiRenderer" id="pixi">
                    <div class="Progress">
                        {Math.round(loader.progress) + "%"}
                    </div>
                </div>
            )
        }
        app.stage = createPixi(this.props.views)
        return (
            <div class="PixiRenderer" id="pixi"/>
        )
    }
    componentDidMount() {
        document.getElementById("pixi").appendChild(app.view)
    }
}
