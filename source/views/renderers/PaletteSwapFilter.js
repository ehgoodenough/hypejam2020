import * as Pixi from "pixi.js"
import Loader from "views/renderers/Loader.js"

// https://www.html5gamedevs.com/topic/29482-palette-cycling-in-pixijs/

//create filter
function PaletteSwapFilter(newpal) {
    if(Loader.resources[newpal] == undefined) {
        console.log("Can't find the palette image!!")
        return
    }
    newpal = Loader.resources[newpal].texture
    newpal.baseTexture.mipmap = false
    Pixi.Filter.call(this,
        //vs
        null,
        //fs
        "varying vec2 vTextureCoord;" +
        "uniform sampler2D uSampler;" +
        "uniform sampler2D Palette;" +
        "void main()" +
        "{" +
        "vec4 color = texture2D(uSampler, vTextureCoord);" +
        "if (color.a == 0.0) discard;" +
        // "color.r = 255.0;" +
        // "color.g = 255.0;" +
        // "color.b = 255.0;" +
        "vec4 indexedColor = texture2D(Palette, color.xy);" +
        "gl_FragColor = indexedColor;" +
        // "gl_FragColor = color;" +
        "}"
        // "varying vec2 vTextureCoord;" +
        // "uniform sampler2D uSampler;" +
        // "uniform sampler2D Palette;" +
        // "void main()" +
        // "{" +
        // "vec4 color = texture2D(uSampler, vTextureCoord);" +
        // "if (color.a == 0.0) discard;" +
        // "float red = (color.r*255.0);" +
        // "float green = (color.g*255.0);" +
        // "float blue = (color.b*255.0);" +
        // "float diag = ceil(blue / 2.0);" +
        // "float divideby = 512.0;" +
        // "float sum = 0.5;" +
        // "vec2 coord = vec2((((red + diag) + sum) / divideby), ((((green + diag)) + sum) / divideby));" +
        // "vec4 indexedColor = texture2D(Palette, coord);" +
        // "gl_FragColor = indexedColor;" +
        // "}"
    )
    this.uniforms.Palette = newpal
}

PaletteSwapFilter.prototype = Object.create(Pixi.Filter.prototype)
PaletteSwapFilter.prototype.constructor = PaletteSwapFilter

export default PaletteSwapFilter
