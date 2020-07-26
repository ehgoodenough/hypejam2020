import shortid from "shortid"

export default class Collection {
    constructor() {
        this.values = {}
    }
    add(value) {
        value.key = value.key || shortid.generate()
        this.values[value.key] = value
        value.collection = this
    }
    has(key) {
        if(key.key != undefined) {
            key = key.key
        }
        return !!this.values[key]
    }
    remove(value) {
        this.values[value.key].collection = undefined
        delete this.values[value.key]
    }
    get(key) {
        if(key == undefined) {
            return Object.values(this.values)
        }
        return this.values[key]
    }
}
