import * as Pixi from "pixi.js"


const TOP_LEFT_ANCHOR = {"x": 0, "y": 0}
const CENTER_ANCHOR = {"x": 0.5, "y": 0.5}
const CENTER_BOTTOMISH_ANCHOR = {"x": 0.5, "y": 0.75}
const CENTER_BOTTOM_ANCHOR = {"x": 0.5, "y": 0}

const resources = [
    {"file": require("assets/images/red-monkey.png"), "defaultAnchor": CENTER_ANCHOR},
    {"file": require("assets/images/bomb1.png"), "defaultAnchor": CENTER_ANCHOR},
    {"file": require("assets/images/wall.png"), "defaultAnchor": CENTER_ANCHOR},
    {"file": require("assets/images/crate.png"), "defaultAnchor": CENTER_ANCHOR},
    {"file": require("assets/images/explosion.flash.png"), "defaultAnchor": CENTER_ANCHOR},
    {"file": require("assets/images/explosion.smoke.png"), "defaultAnchor": CENTER_ANCHOR},
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

export default loader
