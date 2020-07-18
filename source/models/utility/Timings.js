// // http://greweb.me/bezier-easing-editor/example/
// import bezier from "bezier-easing"
// bezier(0, 0, 1, 1)

// https://gist.github.com/gre/1650294
export default {
    "linear": t => t, // no easing, no acceleration
    "easeInQuad": t => t*t, // accelerating from zero velocity
    "easeOutQuad": t => t*(2-t), // decelerating to zero velocity
    "easeInOutQuad": t => t<.5 ? 2*t*t : -1+(4-2*t)*t, // acceleration until halfway, then deceleration
    // "easeInOutQuadRemix": t => t < 0.5 ? t*(2-t) : t, // deceleration until halfway, then acceleration
    "easeInCubic": t => t*t*t, // accelerating from zero velocity
    "easeOutCubic": t => (--t)*t*t+1, // decelerating to zero velocity
    "easeInOutCubic": t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1, // acceleration until halfway, then deceleration
    "easeInQuart": t => t*t*t*t, // accelerating from zero velocity
    "easeOutQuart": t => 1-(--t)*t*t*t, // decelerating to zero velocity
    "easeInOutQuart": t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t, // acceleration until halfway, then deceleration
    "easeInQuint": t => t*t*t*t*t, // accelerating from zero velocity
    "easeOutQuint": t => 1+(--t)*t*t*t*t, // decelerating to zero velocity
    "easeInOutQuint": t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t // acceleration until halfway, then deceleration
}
