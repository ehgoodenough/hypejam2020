// No values with the same key
// No values of undefined
// When merging, the later arguments will overwrite previous arguments.
// For iterator functions, we pass the value then the index/key.

import shortid from "shortid"

export default class Keyset {
    static merge() {
        const superset = {}
        Array.from(arguments).forEach((set) => {
            if(set instanceof Array) {
                set = Keyset.from(set)
            }
            Object.keys(set).forEach((key) => {
                superset[key] = set[key]
                if(superset[key] == undefined) {
                    delete superset[key]
                }
            })
        })
        return superset
    }
    static map(set, func) {
        set = set || {}
        const superset = {}
        Object.keys(set).forEach((key) => {
            superset[key] = func(set[key], key)
        })
        return superset
    }
    static find(set, func) {
        const keys = Object.keys(set)
        for(let index in keys) {
            const key = keys[index]
            if(func(set[key], key)) {
                return set[key]
            }
        }
    }
    static from(array) {
        const superset = {}
        array.forEach((value) => {
            value.key = value.key || shortid.generate()
            superset[value.key] = value
        })
        return superset
    }
    static forEach(set, func) {
        Object.keys(set).forEach((key) => {
            func(set[key], key)
        })
    }
}
