
import { treatedAll } from './common'

import * as Geom from './geom'

export type Type = "Straight" | "Visibility" | "Celestial"

export type Stats = { orient_tests: number, path: Geom.HalfEdge[] }

export function celestialStats(einit: Geom.HalfEdge, p: Geom.Vec2): Stats {
    let tests: number = 0
    let e: Geom.HalfEdge = einit
    let path: Geom.HalfEdge[] = [e]
    if (++tests && Geom.strictlyRightOf(Geom.line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" }
        }
        e = e.twin
        path.push(e)
    }
    let e2: Geom.HalfEdge = e.next
    while (e !== e2) {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p)) {
            while (e2.obtuse && (++tests && Geom.leftOrOnTopOf(Geom.approxBisectorNext(e2), p))) {
                e2 = e2.next
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" }
            }
            e = e2.twin
            path.push(e)
            e2 = e.next
        } else {
            e2 = e2.next
        }
    }
    return { orient_tests: tests, path: path }
}

export function visibilityStats(einit: Geom.HalfEdge, p: Geom.Vec2): Stats {
    let tests: number = 0
    let e: Geom.HalfEdge = einit
    let path: Geom.HalfEdge[] = [e]
    if (++tests && Geom.strictlyRightOf(Geom.line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" }
        }
        e = e.twin
        path.push(e)
    }
    let e2: Geom.HalfEdge = e.next
    while (e !== e2) {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p)) {
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" }
            }
            e = e2.twin
            path.push(e)
            e2 = e.next
        } else {
            e2 = e2.next
        }
    }
    return { orient_tests: tests, path: path }
}

export function straightStats(einit: Geom.HalfEdge, p1: Geom.Vec2, p2: Geom.Vec2): Stats {
    let tests: number = 0
    let e: Geom.HalfEdge = einit
    let path: Geom.HalfEdge[] = [e]
    let vertexOrientCache: Map<Geom.Vertex, number> = new Map()
    // NOTE: Dynamic programming is used here to ensure we get
    // the absolutely optimal implementation in terms of the
    // number of orientation tests. In practice one would need
    // to unroll the code significantly in order to eliminate 
    // the dynamic lookups without incurring superfluous 
    // orientation tests. We haven't done so here because that
    // would lead to a lot of implementation complexity, hard
    // to read code, bugs etc.
    // As a result, this code is fair ONLY when comparing
    // based on the number of orientation tests, NOT when 
    // comparing based on wall-clock time.
    let vertexOrient = (v: Geom.Vertex): number => {
        if (!vertexOrientCache.has(v)) {
            tests++
            vertexOrientCache.set(v, Geom.orient(p1, p2, v.pos))
        }
        return vertexOrientCache.get(v)!
    }
    let vertexLeft = (v: Geom.Vertex): boolean => {
        return vertexOrient(v) >= 0
    }
    let vertexRight = (v: Geom.Vertex): boolean => {
        return vertexOrient(v) <= 0
    }
    let e2: Geom.HalfEdge = e
    do {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p2)) {
            while (!(vertexRight(e2.origin) && vertexLeft(e2.target))) {
                e2 = e2.next
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" }
            }
            e = e2.twin
            path.push(e)
            e2 = e.next
        } else {
            e2 = e2.next
        }
    } while (e2 !== e)
    return { orient_tests: tests, path: path }
}

export function stats(walkType: Type, initEdge: Geom.HalfEdge, p1: Geom.Vec2, p2: Geom.Vec2): Stats {
    if (walkType == "Celestial") {
        return celestialStats(initEdge, p2)
    } else if (walkType == "Straight") {
        return straightStats(initEdge, p1, p2)
    } else if (walkType == "Visibility") {
        return visibilityStats(initEdge, p2)
    }
    return treatedAll(walkType)
}
