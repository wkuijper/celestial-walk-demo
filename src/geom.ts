import * as Random from 'random-js';
import { randomFloorplanMesh } from './floorplan';

const mersenne = Random.engines.mt19937()
mersenne.seed(1111)

export type Vec2 = { x: number, y: number }

export type Line = { p1: Vec2, p2: Vec2 }

export type HalfEdge = {
    origin: Vertex,
    target: Vertex,
    next: HalfEdge,
    prev: HalfEdge,
    left: Face,
    edge: Edge,
    twin?: HalfEdge
    obtuse: boolean
    fill: boolean
}

export type Edge = { half: HalfEdge, constrained: boolean }

export type Mesh = { north: HalfEdge }

export type Vertex = { pos: Vec2, outgoing: HalfEdge }

export type Face = { some: HalfEdge, filled: boolean }

export type MeshType = "Convex" | "Thin" | "Delaunay" | "Symmetric" | "Floorplan"

export type WalkType = "Straight" | "Visibility" | "Celestial"

export function mesh(boundarySplits: number = 0): Mesh {
    let nw = { pos: { x: -65536, y: +65536 } } as Vertex
    let ne = { pos: { x: +65536, y: +65536 } } as Vertex
    let se = { pos: { x: +65536, y: -65536 } } as Vertex
    let sw = { pos: { x: -65536, y: -65536 } } as Vertex
    let n = { obtuse: false, origin: ne, target: nw, fill: false } as HalfEdge
    let e = { obtuse: false, origin: se, target: ne, fill: false } as HalfEdge
    let s = { obtuse: false, origin: sw, target: se, fill: false } as HalfEdge
    let w = { obtuse: false, origin: nw, target: sw, fill: false } as HalfEdge
    let nn = { half: n, constrained: true } as Edge; n.edge = nn
    let ee = { half: e, constrained: true } as Edge; e.edge = ee
    let ss = { half: s, constrained: true } as Edge; s.edge = ss
    let ww = { half: w, constrained: true } as Edge; w.edge = ww
    ne.outgoing = n; nw.outgoing = w; sw.outgoing = s; se.outgoing = e
    e.next = n; s.next = e; w.next = s; n.next = w
    n.prev = e; e.prev = s; s.prev = w; w.prev = n
    let f = { some: n, filled: false } as Face
    n.left = f; e.left = f; s.left = f; w.left = f
    let m = { north: n } as Mesh
    function splitBoundary(boundary: HalfEdge[]) {
        let nextBoundary: HalfEdge[] = []
        boundary.forEach((e) => {
            const sum = plus(e.origin.pos, e.target.pos)
            if ((sum.x % 2) != 0 || (sum.y % 2) != 0) {
                throw { geom: true, message: "splitting boundary produces non-integer coordinate" }
            }
            const p = { x: sum.x >> 1, y: sum.y >> 1 }
            splitBoundaryEdgeInConvexMesh(m, e, p).forEach((e) => { nextBoundary.push(e) })
        })
        return nextBoundary
    }
    let boundary = [n, e, s, w]
    for (let c = 0; c < boundarySplits; c++) {
        boundary = splitBoundary(boundary)
    }
    return m
}

export function orient(p: Vec2, q: Vec2, r: Vec2): number {
    return ((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x))
}

export function incircle(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
    let ad: Vec2 = minus(a, d)
    let bd: Vec2 = minus(b, d)
    let cd: Vec2 = minus(c, d)
    return ((ad.x * ad.x + ad.y * ad.y) * (bd.x * cd.y - cd.x * bd.y) + (bd.x * bd.x + bd.y * bd.y) * (cd.x * ad.y - ad.x * cd.y) + (cd.x * cd.x + cd.y * cd.y) * (ad.x * bd.y - bd.x * ad.y)) > 0;
}

export function strictlyRightOf(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) < 0
}

export function rightOrOnTopOf(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) <= 0
}

export function onLine(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) == 0
}

export function pointsCoincide(p1: Vec2, p2: Vec2) {
    return p1.x == p2.x && p1.y == p2.y
}

export function strictlyLeftOf(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) > 0
}

export function leftOrOnTopOf(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) >= 0
}

export function line(e: HalfEdge): Line {
    return { p1: e.origin.pos, p2: e.target.pos }
}

export function lineByPointAndDir(p: Vec2, dir: Vec2): Line {
    return { p1: p, p2: plus(p, dir) }
}

export function rotateLeft(v: Vec2): Vec2 {
    return { x: -v.y, y: v.x }
}

export function rotateRight(v: Vec2): Vec2 {
    return { x: v.y, y: -v.x }
}

export function plus(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y }
}

export function minus(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y }
}

export function mult(a: Vec2, s: number): Vec2 {
    return { x: a.x * s, y: a.y * s }
}

export function roundVec2(p: Vec2) {
    return { x: Math.round(p.x), y: Math.round(p.y) }
}

export function approxBisectorNext(e2: HalfEdge): Line {
    let e3: HalfEdge = e2.next
    return lineByPointAndDir(e2.target.pos, rotateRight(minus(e3.target.pos, e2.origin.pos)))
}

export function computeObtuseness(e2: HalfEdge) {
    let e3 = e2.next
    return strictlyRightOf(lineByPointAndDir(e2.target.pos, rotateLeft(minus(e2.target.pos, e2.origin.pos))), e3.target.pos)
}
export function precomputeObtuseness(e2: HalfEdge) {
    e2.obtuse = computeObtuseness(e2)
}

export function gatherHalfEdges(m: Mesh): Set<HalfEdge> {
    let visited: Set<HalfEdge> = new Set();
    let waiting: HalfEdge[] = [];
    let queue = (e: HalfEdge) => {
        if (!visited.has(e)) {
            waiting.push(e)
            visited.add(e)
            if (e.twin) {
                waiting.push(e.twin)
                visited.add(e.twin)
            }
        }
    }
    queue(m.north)
    while (waiting.length > 0) {
        let e: HalfEdge = waiting.pop()!;
        queue(e.next)
    }
    return visited
}

export function gatherEdges(m: Mesh): Set<Edge> {
    let visited: Set<Edge> = new Set();
    let waiting: HalfEdge[] = [];
    let queue = (e: HalfEdge) => {
        if (!visited.has(e.edge)) {
            waiting.push(e)
            if (e.twin) {
                waiting.push(e.twin)
            }
            visited.add(e.edge)
        }
    }
    queue(m.north)
    while (waiting.length > 0) {
        let e: HalfEdge = waiting.pop()!;
        queue(e.next)
    }
    return visited
}

export function gatherFaces(m: Mesh): Set<Face> {
    let visited: Set<Face> = new Set();
    let waiting: Face[] = [];
    let queue = (f: Face) => {
        waiting.push(f)
        visited.add(f)
    }
    queue(m.north.left)
    while (waiting.length > 0) {
        let f: Face = waiting.pop()!;
        let e: HalfEdge = f.some;
        let e2 = e
        do {
            if (e2.twin && !visited.has(e2.twin.left)) {
                queue(e2.twin.left)
            }
            e2 = e2.next
        } while (e2 !== e)
    }
    return visited;
}

export function gatherFaceEdges(f: Face) {
    let edges: HalfEdge[] = []
    let e = f.some
    let e2 = e
    do {
        edges.push(e2)
        e2 = e2.next
    } while (e2 !== e)
    return edges
}

export function triangulateMesh(m: Mesh) {
    gatherFaces(m).forEach((f) => { triangulateFace(f) })
}

export function deleteEdge(e: HalfEdge) {
    // e.twin must be defined 
    // e.left must be triangle
    e.origin.outgoing = e.twin!.next
    e.twin!.origin.outgoing = e.next
    e.prev.left = e.twin!.left
    e.next.left = e.twin!.left
    e.twin!.prev.next = e.next
    e.twin!.next.prev = e.prev
    e.next.prev = e.twin!.prev
    e.prev.next = e.twin!.next
    e.twin!.left.some = e.next
    precomputeObtuseness(e.prev)
    precomputeObtuseness(e.twin!.prev)
}

export function triangulateFace(f: Face) {
    let e1: HalfEdge = f.some; let e2: HalfEdge = e1.next; let e3: HalfEdge = e2.next
    while (e3.next != e1) {
        while (!(strictlyLeftOf(line(e1), e2.target.pos) &&
            strictlyRightOf({ p1: e2.target.pos, p2: e1.origin.pos }, e3.target.pos))) {
            e1 = e2; e2 = e3; e3 = e3.next
        }
        e1 = cutPeak(e1); e2 = e1.next; e3 = e2.next
    }
}

function precomputeObtusenessForNewHalfEdge(e: HalfEdge) {
    precomputeObtuseness(e)
    precomputeObtuseness(e.prev)
}

export function cutPeak(e: HalfEdge): HalfEdge {
    // angle(e, e.next) must kink left (e.origin, e.next.target) must not intersect anything
    const e2 = e.next
    const e3: HalfEdge = { origin: e2.target, target: e.origin, prev: e2, next: e, fill: false } as HalfEdge
    const e3i: HalfEdge = { origin: e3.target, target: e3.origin, prev: e.prev, next: e2.next, twin: e3, left: e.left, fill: false } as HalfEdge
    const ee3: Edge = { half: e3, constrained: false }; e3.edge = ee3; e3i.edge = ee3
    e.prev.next = e3i; e2.next.prev = e3i; e3.twin = e3i
    e.prev = e3; e2.next = e3
    const ff = { some: e3, filled: e.left.filled } as Face
    e.left.some = e3i
    e.left = ff; e2.left = ff; e3.left = ff
    precomputeObtusenessForNewHalfEdge(e3)
    precomputeObtusenessForNewHalfEdge(e3i)
    return e3i
}

export function growEdge(e: HalfEdge, p: Vec2): Vertex {
    // pre: p must be properly in e.left, (e.origin, p) and (e.target, p) must not intersect anything
    // post: a vertex at p and the remainder of the face triangulated
    let v: Vertex = { pos: p } as Vertex
    let e2: HalfEdge = { origin: e.target, target: v, prev: e, fill: false } as HalfEdge
    let e3: HalfEdge = { origin: v, target: e.origin, prev: e2, next: e, fill: false } as HalfEdge
    e2.next = e3
    v.outgoing = e3
    let e2i: HalfEdge = { origin: v, target: e.target, next: e.next, left: e.left, twin: e2 } as HalfEdge
    e2.twin = e2i
    let e3i: HalfEdge = { origin: e.origin, target: v, prev: e.prev, next: e2i, left: e.left, twin: e3 } as HalfEdge
    e2i.prev = e3i
    e3.twin = e3i
    e.left.some = e3i
    let ee2: Edge = { half: e2, constrained: false }; e2.edge = ee2; e2i.edge = ee2
    let ee3: Edge = { half: e3, constrained: false }; e3.edge = ee3; e3i.edge = ee3
    e.next.prev = e2i
    e.prev.next = e3i
    e.next = e2; e.prev = e3
    let ff = { some: e, filled: e.left.filled } as Face
    e.left = ff; e2.left = ff; e3.left = ff
    precomputeObtusenessForNewHalfEdge(e2)
    precomputeObtusenessForNewHalfEdge(e2i)
    precomputeObtusenessForNewHalfEdge(e3)
    precomputeObtusenessForNewHalfEdge(e3i)
    triangulateFace(e3i.left) // restore convexity
    return v
}

export function flipableEdge(e: HalfEdge): boolean {
    // e.left and e.twin.left must be triangles
    // returns true iff e is the unconstrained diagonal of a convex quadrilateral with no co-linear sides
    return !e.edge.constrained
        && strictlyLeftOf(line(e.twin!.prev), e.next.target.pos)
        && strictlyLeftOf(line(e.twin!.next), e.next.target.pos)
}

export function flipEdge(e: HalfEdge): HalfEdge {
    // e must be diagonal of convex quadrilateral with no co-linear sides
    let eprev: HalfEdge = e.prev
    deleteEdge(e)
    return cutPeak(eprev)
}

export function insertVertex(m: Mesh, p: Vec2): Vertex {
    return insertVertexFromEdge(m.north, p)
}

export function splitEdgeApproximately(e: HalfEdge, p: Vec2): Vertex {
    // round to nearest integer point
    p = roundVec2(p)
    // check if approximate intersection point is properly contained within left-cone/right-cone intersection
    if (!strictlyLeftOf(line(e.next), p) || !strictlyLeftOf(line(e.prev), p) || !strictlyLeftOf(line(e.twin!.next), p) || !strictlyLeftOf(line(e.twin!.prev), p)) {
        throw { message: "insufficient precision for splitting edge", edge: e, point: p }
    }
    return splitEdge(e, p)
}

export function splitEdge(esplit: HalfEdge, p: Vec2): Vertex {
    // p must be properly in the intersection of cones left and right of esplit
    const estay = esplit.prev
    deleteEdge(esplit)
    const v = growEdge(estay, p)
    if (esplit.edge.constrained) {
        // patch up the constrained attributes of the two newly created undirected edges 
        // and the fill attributes of the four newly created directed edges
        let e = v.outgoing
        do {
            if (e.target == esplit.origin) {
                e.edge.constrained = true
                e.fill = esplit.twin!.fill
                e.twin!.fill = esplit.fill
            } else if (e.target == esplit.target) {
                e.edge.constrained = true
                e.fill = esplit.fill
                e.twin!.fill = esplit.twin!.fill
            }
            e = e.twin!.next
        } while (e != v.outgoing)
    }
    return v
}

export function insertVertexFromEdge(e: HalfEdge, p: Vec2): Vertex {
    // pre: m must be triangular
    // post: m will be triangular with vertex at p
    let f: Face = walk(e, p)
    let e1 = f.some; let e2 = e1.next; let e3 = e2.next
    if (pointsCoincide(e1.origin.pos, p)) {
        return e1.origin
    }
    if (pointsCoincide(e2.origin.pos, p)) {
        return e2.origin
    }
    if (pointsCoincide(e3.origin.pos, p)) {
        return e3.origin
    }
    if (onLine(line(e1), p)) {
        return splitEdge(e1, p)
    }
    if (onLine(line(e2), p)) {
        return splitEdge(e2, p)
    }
    if (onLine(line(e3), p)) {
        return splitEdge(e3, p)
    }
    // split face
    return growEdge(e1, p)
}

export function walkToClosestVertex(einit: HalfEdge, p: Vec2): Vertex {
    const e = walk(einit, p).some
    function squaredDistance(v: Vertex): number {
        const d = minus(v.pos, p)
        return d.x * d.x + d.y * d.y
    }
    let clv = e.origin
    let sqd = squaredDistance(e.origin)
    const sqd2 = squaredDistance(e.target)
    if (sqd2 < sqd) {
        sqd = sqd2
        clv = e.target
    }
    const sqd3 = squaredDistance(e.next.target)
    if (sqd3 < sqd) {
        sqd = sqd2
        clv = e.next.target
    }
    return clv
}

export function walk(einit: HalfEdge, p: Vec2): Face {
    let e: HalfEdge = einit
    if (strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" }
        }
        e = e.twin
    }
    let e2: HalfEdge = e.next
    while (e !== e2) {
        if (strictlyRightOf(line(e2), p)) {
            while (e2.obtuse && leftOrOnTopOf(approxBisectorNext(e2), p)) {
                e2 = e2.next
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" }
            }
            e = e2.twin
            e2 = e.next
        } else {
            e2 = e2.next
        }
    }
    return e.left
}

export function isDelaunayTriangle(f: Face) {
    const e = f.some
    if (e.next.next.next != e) {
        return false // not a triangle
    }
    let ee = e
    do {
        if (!ee.twin || ee.twin.next.next.next != ee.twin) {
            return false // neighbour is not a triangle
        }
        if (incircle(ee.origin.pos, ee.target.pos, ee.next.target.pos, ee.twin.next.target.pos)) {
            return false // neighbour is in circumcircle: not delaunay
        }
        ee = ee.next
    } while (ee != e)
    return true
}

export function delaunafy(m: Mesh) {
    // pre: m must be triangular
    // post: m will be triangular and maximally delaunay
    let waiting_set: Set<Edge> = gatherEdges(m)
    let waiting_list: Edge[] = []
    waiting_set.forEach((ee) => { waiting_list.push(ee) })
    //shuffle(waiting_list)
    let queue = (ee: Edge) => {
        if (!waiting_set.has(ee)) {
            const l = waiting_list.push(ee)
            //if (l > 1) {
            //    const i = Random.integer(0,l-1)(mersenne)
            //    waiting_list[l-1] = waiting_list[i];
            //    waiting_list[i] = ee;
            //}
            waiting_set.add(ee)
        }
    }
    while (waiting_list.length > 0) {
        let ee: Edge = waiting_list.pop()!
        waiting_set.delete(ee)
        let e: HalfEdge = ee.half
        if (!(e.twin)) {
            continue
        }
        if (incircle(e.origin.pos, e.target.pos, e.next.target.pos, e.twin.next.target.pos)
            || incircle(e.twin.origin.pos, e.twin.target.pos, e.twin.next.target.pos, e.next.target.pos)) {
            if (flipableEdge(e)) {
                e = flipEdge(e)
                queue(e.next.edge); queue(e.prev.edge)
                queue(e.twin!.next.edge); queue(e.twin!.prev.edge)
            }
        }
    }
}

export function shuffle(array: any[]) {
    let m = array.length, t, i;
    while (m) {
        m -= 1
        i = Random.integer(0, m)(mersenne);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

export function convexify(m: Mesh, deeply: boolean = false) {
    // pre: m must be triangular
    // post: m will (almost certainly?) no longer be triangular but still convex
    delaunafy(m)
    // shallow convexification: eliminate triangles based on local criterion
    let triangles: Set<Face> = gatherFaces(m)
    let waiting: Face[] = []
    let deleted = (e: HalfEdge): boolean => {
        if (e.twin
            && !e.edge.constrained
            && leftOrOnTopOf(line(e.twin.prev), e.next.target.pos)
            && leftOrOnTopOf(line(e.twin.next), e.next.target.pos)) {
            triangles.delete(e.left)
            triangles.delete(e.twin.left)
            deleteEdge(e)
            return true
        }
        return false
    }
    triangles.forEach((f) => { waiting.push(f) })
    //shuffle(waiting)
    while (waiting.length > 0) {
        let e: HalfEdge = waiting.pop()!.some
        if (!triangles.has(e.left)) {
            continue
        }
        if (deleted(e)) {
            continue
        }
        if (deleted(e.next)) {
            continue
        }
        if (deleted(e.prev)) {
            continue
        }
    }
    // deeper convexification: eliminate edges based on global criterion
    // this operation is potentially very expensive, it is only to be used on sparse meshes
    if (!deeply) {
        return
    }
    function canEliminate(ee: Edge): boolean {
        const estart = ee.half.prev
        let e = estart
        do {
            let enext = e.next
            if (enext.edge == ee) {
                enext = enext.twin!.next
            }
            if (!leftOrOnTopOf(line(e), enext.target.pos)) {
                return false
            }
            e = enext
        } while (e != estart)
        return true
    }
    let edges = gatherEdges(m)
    edges.forEach((ee) => {
        if (!ee.constrained && ee.half.twin && canEliminate(ee)) {
            deleteEdge(ee.half)
        }
    })
}

export type WalkStats = { orient_tests: number, path: HalfEdge[] }

export function celestialWalkStats(einit: HalfEdge, p: Vec2): WalkStats {
    let tests: number = 0
    let e: HalfEdge = einit
    let path: HalfEdge[] = [e]
    if (++tests && strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" }
        }
        e = e.twin
        path.push(e)
    }
    let e2: HalfEdge = e.next
    while (e !== e2) {
        if (++tests && strictlyRightOf(line(e2), p)) {
            while (e2.obtuse && (++tests && leftOrOnTopOf(approxBisectorNext(e2), p))) {
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

export function visibilityWalkStats(einit: HalfEdge, p: Vec2): WalkStats {
    let tests: number = 0
    let e: HalfEdge = einit
    let path: HalfEdge[] = [e]
    if (++tests && strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" }
        }
        e = e.twin
        path.push(e)
    }
    let e2: HalfEdge = e.next
    while (e !== e2) {
        if (++tests && strictlyRightOf(line(e2), p)) {
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

export function straightWalkStats(einit: HalfEdge, p1: Vec2, p2: Vec2): WalkStats {
    let tests: number = 0
    let e: HalfEdge = einit
    let path: HalfEdge[] = [e]
    let vertexOrientCache: Map<Vertex, number> = new Map()
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
    let vertexOrient = (v: Vertex): number => {
        if (!vertexOrientCache.has(v)) {
            tests++
            vertexOrientCache.set(v, orient(p1, p2, v.pos))
        }
        return vertexOrientCache.get(v)!
    }
    let vertexLeft = (v: Vertex): boolean => {
        return vertexOrient(v) >= 0
    }
    let vertexRight = (v: Vertex): boolean => {
        return vertexOrient(v) <= 0
    }
    let e2: HalfEdge = e
    do {
        if (++tests && strictlyRightOf(line(e2), p2)) {
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

export function walkStats(walkType: WalkType, initEdge: HalfEdge, p1: Vec2, p2: Vec2): WalkStats {
    if (walkType == "Celestial") {
        return celestialWalkStats(initEdge, p2)
    } else if (walkType == "Straight") {
        return straightWalkStats(initEdge, p1, p2)
    }
    // (walkType == "Visibility")
    return visibilityWalkStats(initEdge, p2)
}

export function mesh2html(title: string, m: Mesh, delaunayFaces?: boolean, walkStats?: WalkStats, line?: Line, showAll?: boolean): string {
    return `<html>
  <head>
    <title>
      ${title}
    </title>
    <style>
    html, body {
        height: 95%;
    }
    #mesh-div {
        height: 100%;
        min-height: 100%;
	    display: flex;
        flex-direction: column;
        padding: 20pt;
    }
    #mesh-svg {
        display: flex;
		flex-direction: column;
        justify-content: center;
        border:2px;
        border-style: solid;
    }
    </style>
  </head>
  <body>
    <div id="mesh-div">
        ${mesh2svg(m, delaunayFaces, walkStats, line, showAll)}
    </div>
  </body>
</html>`
}

export function face2svg(face: Face, clss: string): string {
    const p: Vec2 = face.some.origin.pos
    const words: string[] = [`<path class="${clss}" d="M ${p.x} ${p.y}`]
    gatherFaceEdges(face).forEach((e: HalfEdge) => {
        const p: Vec2 = e.target.pos
        words.push(` L ${p.x} ${p.y}`)
    })
    words.push('"/>')
    return words.join("")
}

export function mesh2svg(m: Mesh, delaunayFaces?: boolean, walkStats?: WalkStats, line?: Line, showAll?: boolean): string {
    function meshFaceLayer(): string {
        const lines: string[] = []
        const faces = gatherFaces(m)
        faces.forEach((f) => {
            lines.push(face2svg(f, f.filled ? "mesh-filled-face" : "mesh-face"))
        })
        return lines.join('\n')
    }
    function delaunayLayer(): string {
        if (!delaunayFaces) {
            return ""
        }
        const lines: string[] = []
        gatherFaces(m).forEach((f) => {
            if (isDelaunayTriangle(f)) {
                lines.push(face2svg(f, "delaunay-face"))
            }
        })
        return lines.join('\n')
    }
    function meshLineLayer(): string {
        const lines: string[] = []
        const edges = gatherEdges(m)
        edges.forEach((e) => {
            const p1 = e.half.origin.pos
            const p2 = e.half.target.pos
            lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="${e.constrained ? "mesh-constrained-line" : "mesh-line"}"/>`)
        })
        return lines.join('\n')
    }
    function pathLayer(): string {
        if (!walkStats) {
            return ""
        }
        const lines: string[] = []
        const path = walkStats.path
        path.forEach((e) => {
            const p1 = e.origin.pos
            const p2 = e.target.pos
            lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="path-edge"/>`)
            lines.push(face2svg(e.left, "path-face"))
        })
        return lines.join('\n')
    }
    function arrowLayer(): string {
        if (!line) {
            return ""
        }
        const p1 = line.p1
        const p2 = line.p2
        return `<circle cx="${p1.x}" cy="${p1.y}" r="5" id="arrow-origin"/>
            ${p2 ? `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" id="arrow" marker-end="url(#arrow-head)"/>` : ""}`
    }
    return `<svg viewBox="${showAll ? "-80000 -80000 160000 160000" : "-22000 -22000 44000 44000"}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
    <style type="text/css">
    .mesh-line {
        stroke-width:100;
        stroke:rgb(100,100,100);
    }
    .mesh-constrained-line {
        stroke-width:200;
        stroke:rgb(50,50,50);
    }
    #arrow {
        stroke-width:200;
        stroke:rgb(0,0,200);
    }
    #arrow-head {
        fill:rgb(0,0,200);
    }
    #arrow-origin {
        fill:rgb(0,0,200);
    }
    .mesh-face {
        fill:rgb(255,255,255);
    }
    .mesh-filled-face {
        fill:rgb(200, 200, 200);
    }
    .path-face {
        fill:rgba(100, 200, 100,0.5);
    }
    .delaunay-face {
        fill:rgba(200, 200, 100,0.3);
    }
    .path-edge {
        stroke-width:300;
        stroke:rgba(150,0,200,0.5); 
    }
    </style>
    <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
        </marker>
    </defs>
    <g id="mesh-face-layer">
        ${meshFaceLayer()}
    </g>    
    <g id="delaunay-layer">
        ${delaunayLayer()}
    </g>
    <g id="mesh-line-layer">
        ${meshLineLayer()}
    </g>
    <g id="path-layer">
        ${pathLayer()}
    </g>
    <g id="arrow-layer">
        ${arrowLayer()}
    </g>
</svg>`
}

const randomPointDistribution = Random.integer(-64500, 64500)

export function randomPoint(): Vec2 {
    let x: number = randomPointDistribution(mersenne);
    let y: number = randomPointDistribution(mersenne);
    return { x: x, y: y }
}

export function randomPointCloud(n: number): Vec2[] {
    const pointCloud: Vec2[] = []
    for (var i = 0; i < n; i++) {
        pointCloud.push(randomPoint())
    }
    return pointCloud
}

export function randomMesh(meshType: MeshType, boundarySplits: number = -1): Mesh {
    if (meshType == "Floorplan") {
        let m: Mesh|undefined
        while (!m) {
            const random = new Random(Random.engines.nativeMath)
            try {
                m = randomFloorplanMesh(random, true)
            } catch (e) {
                if (!e.geom) {
                    throw e
                }
            }
        }
        return m
    }
    return meshFromPointCloud(meshType, randomPointCloud(200), boundarySplits)
}

export function perturb(m: Mesh) {
    for (let c = 0; c < 1000; c++) {
        const f = walk(m.north, randomPoint())
        if (!f) {
            continue
        }
        if (f.some.twin && flipableEdge(f.some)) {
            flipEdge(f.some)
        } else if (f.some.next.twin && flipableEdge(f.some.next)) {
            flipEdge(f.some.next)
        } else if (f.some.next.next.twin && flipableEdge(f.some.next.next)) {
            flipEdge(f.some.next.next)
        }
    }
}

export function initialMesh(meshType: MeshType, boundarySplits: number = -1): Mesh {
    if (boundarySplits < 0) {
        boundarySplits = 0
        if (meshType == "Symmetric") {
            boundarySplits = 5
        }
    }
    let m = mesh(boundarySplits)
    if (meshType == "Symmetric") {
        insertVertex(m, { x: 0, y: 0 })
        let e = m.north
        let a = 0
        const r = 65536
        do {
            e.origin.pos = { x: Math.sin(a) * r, y: Math.cos(a) * r }
            a = a - Math.PI / 64
            e = e.next.twin!.next
        } while (e != m.north)
        e = m.north
        do {
            precomputeObtuseness(e)
            precomputeObtuseness(e.next)
            precomputeObtuseness(e.next.next)
        } while (e != m.north)
        //delaunafy(m)
    } else {
        triangulateMesh(m)
    }
    return m
}

export function fillMeshFromPointCloud(m: Mesh, meshType: MeshType, pointCloud: Vec2[]) {
    if (meshType == "Symmetric") {
        pointCloud = pointCloud.filter(((p) => Math.sqrt((p.x * p.x) + (p.y * p.y)) < 65536))
    }
    pointCloud.forEach((p: Vec2) => {
        insertVertex(m, p)
    })
    if (meshType == "Thin") {
        // do nothing
    } else if (meshType == "Delaunay" || meshType == "Symmetric") {
        delaunafy(m)
    } else if (meshType == "Convex") {
        delaunafy(m)
        convexify(m)
    }
    return m
}

export function meshFromPointCloud(meshType: MeshType, pointCloud: Vec2[], boundarySplits: number = -1): Mesh {
    const m = initialMesh(meshType, boundarySplits)
    fillMeshFromPointCloud(m, meshType, pointCloud)
    return m
}

export function splitBoundaryEdgeInConvexMesh(m: Mesh, e: HalfEdge, p: Vec2): [HalfEdge, HalfEdge] {
    // pre: m must be convex, p must be on e, t.twin must be undefined (i.e.: e must be a boundary edge)
    // post: m will be convex, e split in two with a vertex at p
    const en = e.next
    const ep = e.prev

    const v: Vertex = { pos: p } as Vertex

    const er: HalfEdge = { origin: e.origin, target: v, prev: ep, left: e.left } as HalfEdge
    const el: HalfEdge = { origin: v, target: e.target, prev: er, next: en, left: e.left } as HalfEdge
    er.next = el; e.left.some = el

    en.prev = el; ep.next = er

    const eel: Edge = e.edge; el.edge = eel; eel.half = el
    const eer: Edge = { half: er, constrained: true }; er.edge = eer

    v.outgoing = el; e.origin.outgoing = er

    precomputeObtusenessForNewHalfEdge(er)
    precomputeObtusenessForNewHalfEdge(el)

    if (m.north == e) {
        m.north = el
    }

    return [el, er]
}

export function splitBoundaryEdgeInTriangularMesh(m: Mesh, e: HalfEdge, p: Vec2): [HalfEdge, HalfEdge] {
    // pre: m must be triangular, p must be on e, t.twin must be undefined (i.e.: e must be a boundary edge)
    // post: m will be triangular, e and e.left split in two with a vertex at p
    const en = e.next
    const ep = e.prev

    const v: Vertex = { pos: p } as Vertex

    const er: HalfEdge = { origin: e.origin, target: v, prev: ep } as HalfEdge
    const el: HalfEdge = { origin: v, target: e.target, next: en } as HalfEdge
    const ern: HalfEdge = { origin: er.target, target: ep.origin, prev: er, next: ep } as HalfEdge
    er.next = ern
    const elp: HalfEdge = { origin: en.target, target: el.origin, prev: en, next: el } as HalfEdge
    el.prev = elp
    elp.twin = ern; ern.twin = elp

    en.prev = el; en.next = elp
    ep.prev = ern; ep.next = er

    const eel: Edge = e.edge; el.edge = eel; eel.half = el
    const eer: Edge = { half: er, constrained: true }; er.edge = eer
    const ee: Edge = { half: ern, constrained: false }; ern.edge = ee; elp.edge = ee

    const fl = e.left; fl.some = el
    const fr = { some: er } as Face
    el.left = fl; en.left = fl; elp.left = fl
    er.left = fr; ern.left = fr; ep.left = fr

    v.outgoing = el; e.origin.outgoing = er

    precomputeObtusenessForNewHalfEdge(er)
    precomputeObtusenessForNewHalfEdge(ern)
    precomputeObtusenessForNewHalfEdge(elp)
    precomputeObtusenessForNewHalfEdge(el)

    if (m.north == e) {
        m.north = el
    }

    return [el, er]
}

export function vec2String(p: Vec2): string {
    return `(${p.x},${p.y})`
}

export function vertexString(v: Vertex): string {
    return `${vec2String(v.pos)}`
}

export function halfEdgeString(e: HalfEdge): string {
    return `${vertexString(e.origin)}->${vertexString(e.target)}`
}

export function halfEdgeDelta(e: HalfEdge): Vec2 {
    return minus(e.target.pos, e.origin.pos)
}

export function halfEdgeLength(e: HalfEdge): number {
    const d = halfEdgeDelta(e)
    return Math.sqrt((d.x * d.x) + (d.y * d.y))
}

export function edgeLength(ee: Edge): number {
    return halfEdgeLength(ee.half)
}

export function connected(a: Vertex, b: Vertex): Edge|null {
    // returns true iff a and b are connected by an edge
    // if at least one vertex is an internal vertex this means there will be two half-edges linking both vertices
    // if both vertices are boundary vertices this means there will be only one half-edge linking both vertices
    let e = a.outgoing
    if (e.target == b) {
        return e.edge
    }
    while (e.twin) {
        e = e.twin.next
        if (e == a.outgoing) {
            e = b.outgoing
            if (e.target == a) {
                return e.edge
            }
            while (e.twin) {
                e = e.twin.next
                if (e == b.outgoing) {
                    return null
                }
                if (e.target == a) {
                    return e.edge
                }
            }
            e = b.outgoing
            while (e.prev.twin) {
                e = e.prev.twin
                if (e.target == a) {
                    return e.edge
                }
            }
            return null
        }
        if (e.target == b) {
            return e.edge
        }
    }
    e = a.outgoing
    while (e.prev.twin) {
        e = e.prev.twin
        if (e.target == b) {
            return e.edge
        }
    }
    e = b.outgoing
    if (e.target == a) {
        return e.edge
    }
    while (e.twin) {
        e = e.twin.next
        if (e == b.outgoing) {
            return null
        }
        if (e.target == a) {
            return e.edge
        }
    }
    e = b.outgoing
    while (e.prev.twin) {
        e = e.prev.twin
        if (e.target == a) {
            return e.edge
        }
    }
    return null
}

export function pivot(vertex: Vertex, goalPos: Vec2): HalfEdge {
    // pre: mesh must be triangular, line from vertex.pos to goal must be properly contained in mesh.
    // post: a hand halfedge such that hand.source == vertex and the goal is on-or-left-of hand and strictly-left-of hand.prev
    let hand = vertex.outgoing
    if (pointsCoincide(vertex.pos, goalPos)) {
        throw { geom: true, message: "can't pivot towards own position" }
    }
    while (!(leftOrOnTopOf(line(hand), goalPos) && strictlyLeftOf(line(hand.prev), goalPos))) {
        if (!hand.twin) {
            if (rightOrOnTopOf(line(hand), goalPos)) {
                throw { geom: true, message: "can't pivot boundary vertex towards out-of-bounds position" }
            }
            while (hand.prev.twin) {
                hand = hand.prev.twin
            }
        } else {
            hand = hand.twin.next
        }
    }
    return hand
}

export function flipToConnectViaIntermediaryVertex(from: Vertex, to: Vertex, fromEdge: HalfEdge) {
    // we're looking for a single intervening vertex such that no other vertex intersects the from-split-to triangle
    let currSplitVertex = fromEdge.target
    let currCutLine = line(fromEdge)
    let currEdge = fromEdge
    while (currEdge.target != to) {
        const s = orient(from.pos, to.pos, currEdge.target.pos)
        if (s == 0) {
            throw { message: "intersecting existing vertex", existingVertex: currEdge.target }
        }
        if (s > 0) {
            // we're on the wrong side of the from-to line: keep going
            currEdge = currEdge.twin!.next
            continue
        }
        if (strictlyLeftOf(currCutLine, currEdge.target.pos)) {
            // the current vertex falls inside the from-split-to triangle so it will replace the current split-vertex
            currSplitVertex = currEdge.target
            currCutLine.p2 = currEdge.target.pos
        }
        currEdge = currEdge.next
    }
    if (!connected(from, currSplitVertex)) {
        flipToConnectVertices(from, currSplitVertex)
    }
    if (!connected(currSplitVertex, to)) {
        flipToConnectVertices(currSplitVertex, to)
    }
}

export function flipToConnectVertices(start: Vertex, finish: Vertex): HalfEdge {
    while (true) {
        const startEdge = pivot(start, finish.pos)
        const finishEdge = pivot(finish, start.pos)
        if (startEdge.target == finish) {
            // we're already done
            return startEdge
        } else if (startEdge.next.target != finishEdge.target) {
            // left-hand-side of start to finish line must be brought to a triangle shape with single intermediary vertex
            flipToConnectViaIntermediaryVertex(finish, start, finishEdge)
        } else if (finishEdge.next.target != startEdge.target) {
            // right-hand-side of start to finish line must be brought to a triangle shape with single intermediary vertex
            flipToConnectViaIntermediaryVertex(start, finish, startEdge)
        } else {
            // two triangle halves make a convex quadrilateral that can be flipped to connect the vertices
            const crossingEdge: HalfEdge = startEdge.next
            if (!flipableEdge(crossingEdge)) {
                throw { message: "intersecting constrained edge", constrainedEdge: crossingEdge.edge }
            }
            const e = flipEdge(crossingEdge)
            return e
        }
    }
}

export function draw(m: Mesh, l: Line, fillLeft: boolean, fillRight: boolean) {
    const v1 = insertVertex(m, l.p1)
    const v2 = insertVertex(m, l.p2)
    drawBetweenVertices(v1, v2, fillLeft, fillRight)
}

export function drawBetweenVertices(v1: Vertex, v2: Vertex, fillLeft: boolean, fillRight: boolean) {
    if (v1 == v2) {
        return
    }
    try {
        const e = flipToConnectVertices(v1, v2)
        e.edge.constrained = true
        e.fill = fillLeft
        e.twin!.fill = fillRight
    } catch (exception) {
        if (exception.constrainedEdge) {
            const constrainedEdge: Edge = exception.constrainedEdge
            const e = constrainedEdge.half
            // approximate intersection point
            let [c1, c2] = [e.origin.pos, e.target.pos]
            let [p1, p2] = [v1.pos, v2.pos]
            if (orient(c1, c2, p1) > 0) {
                [p1, p2] = [p2, p1]
            }
            let p: Vec2
            for (let c = 0; c < 20; c++) {
                p = mult(plus(p1, p2), .5)
                const s = orient(c1, c2, p)
                if (s == 0) {
                    break
                } else if (s > 0) {
                    p2 = p
                } else {
                    p1 = p
                }
            }
            // go ahead: split the edge and recurse
            const v = splitEdgeApproximately(e, p!)
            drawBetweenVertices(v1, v, fillLeft, fillRight)
            drawBetweenVertices(v, v2, fillLeft, fillRight)
        } else if (exception.existingVertex) {
            const v: Vertex = exception.existingVertex
            drawBetweenVertices(v1, v, fillLeft, fillRight)
            drawBetweenVertices(v, v2, fillLeft, fillRight)
        } else {
            throw exception
        }
    }
}

export function floodFill(m: Mesh) {
    const halfEdges = gatherHalfEdges(m)
    const faces = gatherFaces(m)
    faces.forEach((f) => {
        f.filled = false
    })
    const waiting: Face[] = []
    halfEdges.forEach((e) => {
        if (e.fill && !e.left.filled) {
            waiting.push(e.left)
            e.left.filled = true
        }
    })
    while (waiting.length > 0) {
        const f = waiting.pop()!;
        [f.some, f.some.next, f.some.next.next].forEach((e) => {
            if (!e.twin) {
                return
            }
            e = e.twin
            if (!e.edge.constrained && !e.left.filled) {
                waiting.push(e.left)
                e.left.filled = true
            }
        })
    }
    const edges = gatherEdges(m)
    edges.forEach((ee) => {
        if (ee.constrained) {
            const e = ee.half
            if (e.left.filled && e.twin && e.twin.left.filled) {
                ee.constrained = false
            }
        }
    })
}