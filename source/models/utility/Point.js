const TILE = 16

export default class Point {
    constructor({x, y, tx, ty}) {
        this.x = x
        this.y = y

        if(tx !== undefined) this.tx = tx
        if(ty !== undefined) this.ty = ty
    }
    get tx() {
        return Math.round(this.x / TILE)
    }
    get ty() {
        return Math.round(this.y / TILE)
    }
    set tx(tx) {
        this.x = tx * TILE
    }
    set ty(ty) {
        this.y = ty * TILE
    }
    get key() {
        return this.tx + "x" + this.ty
    }
    toString() {
        return this.key
    }
    static toString(point) {
        return Point.key(point)
    }
    static key(point) {
        return point.x + "x" + point.y
    }
    round() {
        this.tx = this.tx
        this.ty = this.ty
        return this
    }
    static get TILE() {
        return TILE
    }
}
