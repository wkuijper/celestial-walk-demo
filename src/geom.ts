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

//1035
export const MIN_MESH_COORD = -65535
export const MAX_MESH_COORD = 65535
export const MESH_SIZE = MAX_MESH_COORD-MIN_MESH_COORD

export function mesh(): Mesh {
    let nw = { pos: { x: MIN_MESH_COORD-1, y: MAX_MESH_COORD+1 } } as Vertex
    let ne = { pos: { x: MAX_MESH_COORD+1, y: MAX_MESH_COORD+1 } } as Vertex
    let se = { pos: { x: MAX_MESH_COORD+1, y: MIN_MESH_COORD-1 } } as Vertex
    let sw = { pos: { x: MIN_MESH_COORD-1, y: MIN_MESH_COORD-1 } } as Vertex
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

export function approxBisectorNext(e2: HalfEdge): Line {
    let e3: HalfEdge = e2.next
    return lineByPointAndDir(e2.target.pos, rotateRight(minus(e3.target.pos, e2.origin.pos)))
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

export function convexify(m: Mesh, deeply: boolean = false) {
    // pre: m must be triangular
    // post: m will (almost certainly?) no longer be triangular but still convex
    delaunafy(m)
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