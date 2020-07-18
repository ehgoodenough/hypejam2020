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

        this.time += delta.s
        this.accumulatedTime += delta.s

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

        animation.timelines = {}
        animation.keyframes.forEach((keyframe) => {
            animation.timelines[keyframe.key] = animation.timelines[keyframe.key] || []
            animation.timelines[keyframe.key].push(keyframe)
        })
        // Keyset.forEach(animation.timelines, (timeline) => {
        //     timeline.sort()
        // })

        return [
            {
                "duration": animation.duration,
                "execute": function(currentDuration) {
                    const tweenFrame = {"mark": currentDuration}

                    if(animation.timelines != undefined) {
                        Keyset.forEach(animation.timelines, (timeline) => {
                            if(timeline[1] != undefined
                            && timeline[1].mark < tweenFrame.mark) {
                                return timeline.shift()
                            }
                            if(timeline[0] != undefined
                            && timeline[0].mark > tweenFrame.mark) {
                                return
                            }

                            const currentFrame = timeline[0]

                            // // TODO: Only trigger these once.
                            // if(events[currentKeyframe.event] instanceof Function) {
                            //     events[currentKeyframe.event]()
                            // }
                            // if(currentKeyframe.audio != undefined) {
                            //     Audiomix.trigger(currentKeyframe.audio))
                            // }

                            let entity = Index.entities[currentFrame.key]
                            if(entity == undefined) {
                                Index.entities[currentFrame.key] = entity = {
                                    "key": currentFrame.key
                                }
                            }
                            if(currentFrame.position != undefined) {
                                entity.position = {
                                    "x": currentFrame.position.x,
                                    "y": currentFrame.position.y,
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
                                delete Index.entities[currentFrame.key]
                            }

                            // if(currentFrame.rendertype != undefined) {
                            //     entity.rendertype = currentFrame.rendertype
                            // }
                            // if(currentFrame.color != undefined) {
                            //     entity.color = currentFrame.color
                            // }
                            // if(currentFrame.radius != undefined) {
                            //     entity.radius = currentFrame.radius
                            // }

                            if(timeline[1] == undefined) {
                                return
                            }
                            const nextFrame = timeline[1]

                            const progress = Math.max(0, Math.min(1, (tweenFrame.mark - currentFrame.mark) / (nextFrame.mark - currentFrame.mark)))
                            const timing = nextFrame.timing || Timings.linear // TODO: Let each attribute set a separate timing function

                            if(currentFrame.position != undefined && nextFrame.position != undefined) {
                                entity.position = {
                                    "x": tween(currentFrame.position.x, nextFrame.position.x, timing(progress)),
                                    "y": tween(currentFrame.position.y, nextFrame.position.y, timing(progress)),
                                }
                            }

                            if(currentFrame.scale != undefined && nextFrame.scale != undefined) {
                                entity.scale = {
                                    "x": tween(currentFrame.scale.x, nextFrame.scale.x, timing(progress)),
                                    "y": tween(currentFrame.scale.y, nextFrame.scale.y, timing(progress)),
                                }
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
                        })
                    }
                }
            }
        ]
    }
}

const Steps = {}

Steps["explode"] = class extends Step {
    constructor(step) {
        super(step)

        this.sequence = Step.generateAnimatedSequence({
            "animation": Animations["explode"](step),
        })
    }
}

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
        "duration": 10, // TODO: DETECT THIS AUTOMATICALLY
        "keyframes": [
            {
                "mark": 0,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 0.5,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 0.5,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 1,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 1,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 1.5,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 1.5,
                "key": step.key,
                "scale": {"x": 1.5, "y": 0.5},
                "whiteout": 0,
            },
            {
                "mark": 2,
                "key": step.key,
                "scale": {"x": 0.75, "y": 1.25},
                "whiteout": 1,
            },
            {
                "mark": 2 + WAIT + (SHAKE_TIME * 1),
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

Animations["explosion"] = (step) => {
    const keyframes = []
    step.positions.forEach((positions, counter) => {
        positions.forEach((position) => {
            const key = "explosion:" + shortid.generate()
            keyframes.push({
                "mark": counter * 0.1,
                "key": key,
                "position": position,
                "image": require("assets/images/explosion.flash.png"),
            })
            keyframes.push({
                "mark": counter * 0.1 + 0.2,
                "key": key,
                "toBeDeleted": true,
            })
        })
    })
    return {
        "duration": 10, // TODO: DETECT THIS AUTOMATICALLY
        "keyframes": keyframes
    }
}
