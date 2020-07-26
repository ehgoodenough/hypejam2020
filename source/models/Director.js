import Index from "index"

import Keyset from "models/utility/Keyset.js"
import Geometry from "models/utility/Geometry.js"
import Directions from "models/utility/Directions.js"
import Timings from "models/utility/Timings.js"

import shortid from "shortid"
import bezier from "bezier-easing"
function tween(alpha, omega, progress) {
    return alpha + ((omega - alpha) * progress)
}
import rgb2hsv from "rgb-hsv"
import hsv2rgb from "hsv-rgb"
function colortween(a, b, progress) {
    const aRGB = [
        a >> 16,
        a >> 8 & 0xff,
        a & 0xff,
    ]
    const bRGB = [
        b >> 16,
        b >> 8 & 0xff,
        b & 0xff,
    ]
    const aHSV = rgb2hsv(...aRGB)
    const bHSV = rgb2hsv(...bRGB)
    const cHSV = [
        tween(aHSV[0], bHSV[0], progress),
        tween(aHSV[1], bHSV[1], progress),
        tween(aHSV[2], bHSV[2], progress),
    ]
    const cRGB = hsv2rgb(...cHSV)
    const c = ((1 << 24) + (cRGB[0] << 16) + (cRGB[1] << 8) + cRGB[2] | 0)
    return c
}

export default new class Director {
    constructor() {
        this.steps = []
    }
    add(steps) {
        if(steps instanceof Array == false) {
            steps = [steps]
        }
        steps = steps.map((step) => {
            if(Steps[step.type] != undefined) {
                console.log("%cSupported Step:", "color:black;", step)
                return new Steps[step.type](step)
            } else {
                console.log("%cUnsupported Step:", "color:red", step)
                // return new GenericStep(step)
                throw new Error()
            }
        })
        this.steps = this.steps.concat(steps)
    }
    update(delta) {
        if(this.steps[0] != undefined) {
            this.steps[0].update(delta)

            if(this.steps[0].hasFinished) {
                this.steps.shift()
            }
        }
    }
    get isPerforming() {
        return this.steps.length > 0
    }
    dump() {
        while(this.steps.length > 0) {
            this.steps.finish()
            this.steps.shift()
        }
    }
}

////////////
// STEPS //
//////////

class Step {
    constructor(that) {
        for(let key in that)  {
            this[key] = that[key]
        }

        this.hasStarted = false
        this.hasFinished = false

        this.time = 0 // in seconds
        this.accumulatedTime = 0 // in seconds

        this.sequence = []

        if(this.alphastage != undefined) {
            this.stage = Stage.copy(this.alphastage)
        }
    }
    update(delta) {
        this.hasStarted = true

        this.time += delta.ms
        this.accumulatedTime += delta.ms

        while(this.sequence.length > 0) {
            // if(this.sequence[0] instanceof Function) {
            //     this.sequence[0].call()
            //     this.sequence.shift()
            //     continue
            // }
            if(this.sequence[0].execute instanceof Function) {
                this.sequence[0].execute(this.time)
            }
            if(this.sequence[0].duration != undefined) {
                if(this.accumulatedTime > this.sequence[0].duration) {
                    this.accumulatedTime -= this.sequence[0].duration
                    this.sequence.shift()
                    continue
                } else {
                    break
                }
            }
            // if(this.sequence[0].condition != undefined) {
            //     if(!!this.sequence[0].condition()) {
            //         this.sequence.shift()
            //         continue
            //     } else {
            //         break
            //     }
            // }
        }

        if(this.sequence.length == 0) {
            this.finish()
        }
    }
    finish() {
        this.hasFinished = true

        if(this.onFinish instanceof Function) {
            this.onFinish()
        }
    }
    static generateAnimatedSequence({animation, stage, events = {}}) {
        const sequence = []

        let maxmark = 0

        animation.timelines = {}
        animation.keyframes.forEach((keyframe) => {
            animation.timelines[keyframe.key] = animation.timelines[keyframe.key] || []
            animation.timelines[keyframe.key].push(keyframe)

            if(maxmark < keyframe.mark) {
                maxmark = keyframe.mark
            }
        })
        // Keyset.forEach(animation.timelines, (timeline) => {
        //     timeline.sort()
        // })

        function setFrame(currentFrame) {
            let entity = Index.entities.get(currentFrame.key)
            if(entity == undefined) {
                entity = {"key": currentFrame.key}
                Index.entities.add(entity)
            }

            if(currentFrame.position != undefined) {
                entity.position = {
                    "x": currentFrame.position.x,
                    "y": currentFrame.position.y,
                    "stack": currentFrame.position.stack,
                }
            }

            if(currentFrame.scale != undefined) {
                entity.scale = {
                    "x": currentFrame.scale.x,
                    "y": currentFrame.scale.y,
                }
            }

            if(currentFrame.nudge != undefined) {
                entity.nudge = {
                    "x": currentFrame.nudge.x,
                    "y": currentFrame.nudge.y,
                }
            }

            if(currentFrame.whiteout != undefined) {
                entity.whiteout = currentFrame.whiteout
            }

            if(currentFrame.image != undefined) {
                entity.image = currentFrame.image
            }

            if(currentFrame.toBeDeleted == true) {
                delete Index.entities.get(currentFrame.key)
            }

            if(currentFrame.zoom != undefined) {
                entity.zoom = currentFrame.zoom
            }

            if(currentFrame.radius != undefined) {
                entity.radius = currentFrame.radius
            }
            if(currentFrame.color != undefined) {
                entity.color = currentFrame.color
            }
            if(currentFrame.flash != undefined) {
                entity.flash = currentFrame.flash
            }
        }

        function calculateFrame(currentFrame, tweenFrame, nextFrame) {
            let entity = Index.entities.get(currentFrame.key)
            if(entity == undefined) {
                entity = {
                    "key": currentFrame.key
                }
                Index.entities.add(entity)
            }

            const progress = Math.max(0, Math.min(1, (tweenFrame.mark - currentFrame.mark) / (nextFrame.mark - currentFrame.mark)))
            const timing = nextFrame.timing || Timings.linear // TODO: Let each attribute set a separate timing function

            if(currentFrame.position != undefined && nextFrame.position != undefined) {
                entity.position = {
                    "x": tween(currentFrame.position.x, nextFrame.position.x, timing(progress)),
                    "y": tween(currentFrame.position.y, nextFrame.position.y, timing(progress)),
                    "stack": tween(currentFrame.position.stack, nextFrame.position.stack, timing(progress)),
                }
            }

            if(currentFrame.scale != undefined && nextFrame.scale != undefined) {
                entity.scale = {
                    "x": tween(currentFrame.scale.x, nextFrame.scale.x, timing(progress)),
                    "y": tween(currentFrame.scale.y, nextFrame.scale.y, timing(progress)),
                }
            }

            if(currentFrame.zoom != undefined && nextFrame.zoom != undefined) {
                entity.zoom = tween(currentFrame.zoom, nextFrame.zoom, timing(progress))
            }

            if(currentFrame.nudge != undefined && nextFrame.nudge != undefined) {
                entity.nudge = {
                    "x": tween(currentFrame.nudge.x, nextFrame.nudge.x, timing(progress)),
                    "y": tween(currentFrame.nudge.y, nextFrame.nudge.y, timing(progress)),
                }
            }

            if(currentFrame.whiteout != undefined && nextFrame.whiteout != undefined) {
                entity.whiteout = tween(currentFrame.whiteout, nextFrame.whiteout, timing(progress))
            }

            if(currentFrame.radius != undefined && nextFrame.radius != undefined) {
                entity.radius = tween(currentFrame.radius, nextFrame.radius, timing(progress))
            }

            if(currentFrame.color != undefined && nextFrame.color != undefined) {
                entity.color = colortween(currentFrame.color, nextFrame.color, timing(progress))
            }
        }

        return [
            {
                "duration": maxmark,
                "execute": function(currentDuration) {
                    const tweenFrame = {"mark": currentDuration}

                    if(animation.timelines != undefined) {
                        Keyset.forEach(animation.timelines, (timeline) => {
                            if(timeline[1] != undefined
                            && timeline[1].mark < tweenFrame.mark) {
                                // setFrame(timeline[0])
                                return timeline.shift()
                            }
                            if(timeline[0] != undefined
                            && timeline[0].mark > tweenFrame.mark) {
                                return
                            }

                            // // TODO: Only trigger these once.
                            // if(events[currentKeyframe.event] instanceof Function) {
                            //     events[currentKeyframe.event]()
                            // }
                            // if(currentKeyframe.audio != undefined) {
                            //     Audiomix.trigger(currentKeyframe.audio))
                            // }

                            const currentFrame = timeline[0]

                            setFrame(currentFrame)

                            const nextFrame = timeline[1]
                            if(nextFrame == undefined) {
                                return
                            }

                            calculateFrame(currentFrame, tweenFrame, nextFrame)
                        })
                    }
                }
            }
        ]
    }
}

const Steps = {}

Steps["trailer"] = class extends Step {
    constructor(step) {
        super(step)

        this.sequence = Step.generateAnimatedSequence({
            "animation": Animations["trailer"](step),
        })
    }
}

// TODO: deprecate steps in favor of animations

Steps["explosion"] = class extends Step {
    constructor(step) {
        super(step)

        this.sequence = Step.generateAnimatedSequence({
            "animation": Animations["explosion"](step),
        })
    }
}

/////////////////
// ANIMATIONS //
///////////////

const Animations = {}

const WAIT = 0.5
const SHAKE_TIME = 0.05
const SHAKE = 8
Animations["explode"] = (step) => {
    return {
        "duration": 10 * 1000, // TODO: DETECT THIS AUTOMATICALLY
        "keyframes": [
            {
                "mark": 0,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 0.5 * 1000,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 0.5 * 1000,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 1 * 1000,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 1 * 1000,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 1.5 * 1000,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 1.5 * 1000,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 2 * 1000,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": (2 + WAIT + (SHAKE_TIME * 1)) * 1000,
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 2),
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 3),
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 4),
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 5),
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 6),
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 7),
                "key": step.key,
                "nudge": {
                    "x": (Math.random() * SHAKE) - (SHAKE / 2),
                    "y": (Math.random() * SHAKE) - (SHAKE / 2),
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 7),
                "key": step.key,
                "nudge": {
                    "x": 0,
                    "y": 0,
                }
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 7) + WAIT,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25}, // TODO: Get this from the model??
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 7) + WAIT + 0.25,
                "key": step.key,
                "scale": {
                    "x": 10,
                    "y": 10,
                }
            },
        ],
    }
}

const SMOKE_COUNT = 3 // per tile
const SMOKE_NUDGE = 4 // in pixels
const SCREEN_SHAKE_COUNT = 8
const SCREEN_SHAKE_TIME = 5
Animations["trailer"] = (step) => {
    let keyframes = []

    step.substeps.forEach((substep) => {
        if(substep.type == "explosion") {
            keyframes = keyframes.concat(Animations["explosion"](substep).keyframes)
        }
    })
    // keyframes.push({
    //     "mark": 0,
    //     "key": "camera",
    //     "zoom": 5,
    // })
    // keyframes.push({
    //     "mark": 9000,
    //     "key": "camera",
    //     "zoom": 1,
    //     // "timing": Timings.easeOut,
    // })

    // keyframes.push({
    //     "mark": 0,
    //     "key": "camera",
    //     "color": "#feeae0",
    // })
    // keyframes.push({
    //     "mark": 10,
    //     "key": "camera",
    //     "color": 0x000000,
    // })

    // for(var i = 0; i < SCREEN_SHAKE_COUNT; i += 1) {
    //     keyframes.push({
    //         "mark": i * SCREEN_SHAKE_COUNT * SCREEN_SHAKE_TIME,
    //         "key": "camera",
    //         "nudge": {
    //             "x": Math.round(Random.range(2, 2)) * Random.sign(),
    //             "y": Math.round(Random.range(2, 2)) * Random.sign(),
    //         }
    //     })
    // }
    // keyframes.push({
    //     "mark": (i + 1) * SCREEN_SHAKE_COUNT * SCREEN_SHAKE_TIME,
    //     "key": "camera",
    //     "nudge": {"x": 0, "y": 0},
    // })
    return {keyframes}
}

Animations["explosion"] = function(step) {
    const keyframes = []
    step.positions.forEach((positions, counter) => {
        positions.forEach((position) => {
            for(let i = 0; i < SMOKE_COUNT; i += 1) {
                const key = "explosion:" + shortid.generate()
                keyframes.push({
                    "key": key,
                    "mark": step.mark + (counter * 100) + (Math.random() * 100),
                    "position": {
                        "x": position.x,
                        "y": position.y,
                        "stack": 2,
                    },
                    "nudge": {
                        "x": Math.round(Random.range(2, 6)) * Random.sign(),
                        "y": Math.round(Random.range(2, 6)) * Random.sign(),
                    },
                    "radius": 12,
                    "color": 0xfeeae0,
                    // "image": require("assets/images/explosion.flash.png"),
                })
                keyframes.push({
                    "key": key,
                    "mark": step.mark + (counter * 100) + 500,
                    "timing": Timings.easeOut,
                    "radius": 0,
                    "color": 0x543935,
                    "toBeDeleted": true,
                })
            }
        })
    })
    return {keyframes}
}

class Random {
    static sign() {
        return Math.random() < 0.5 ? -1 : +1
    }
    static range(min, max) {
        return (Math.random() * (max - min)) + min
    }
}
