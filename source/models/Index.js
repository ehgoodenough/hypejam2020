export default class Index {
    constructor() {
        this.time = 0
        this.frame = {"width": 16, "height": 9}
    }
    update(delta) {
        this.time += delta.s
    }
}
