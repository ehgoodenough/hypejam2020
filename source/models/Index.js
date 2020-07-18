export default class Index {
    constructor() {
        this.time = 0
        this.frame = {"width": 16, "height": 9, "resolution": 5}

        this.bomb = {"position": {"x": 32, "y": 32}}
    }
    update(delta) {
        this.time += delta.s
    }
}
