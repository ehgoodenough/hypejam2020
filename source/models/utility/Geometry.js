const Geometry = {}

Geometry.getDirection = function(a, b) {
    a = Geometry.default(a)
    b = Geometry.default(b)
    return {
        "x": a.x - b.x,
        "y": a.y - b.y,
        "z": a.z - b.z,
    }
}

Geometry.getOrthodistance = function(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

Geometry.add = function(a, b) {
    a = Geometry.default(a)
    b = Geometry.default(b)
    return {
        "x": (a.x || 0) + (b.x || 0),
        "y": (a.y || 0) + (b.y || 0),
        "z": (a.z || 0) + (b.z || 0),
    }
}

Geometry.multiply = function(a, b) {
    a = Geometry.default(a)
    b = Geometry.default(b)
    return {
        "x": a.x * b.x,
        "y": a.y * b.y,
        "z": a.z * b.z,
    }
}

Geometry.default = function(p) {
    if(isNaN(p) == false) {
        return {
            "x": p,
            "y": p,
            "z": p,
        }
    }
    return {
        "x": p.x || 0,
        "y": p.y || 0,
        "z": p.z || 0,
    }
}

export default Geometry
