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
}

export type Edge = { half: HalfEdge }

export type Mesh = { north: HalfEdge }

export type Vertex = { pos: Vec2, outgoing: HalfEdge }

export type Face = { some: HalfEdge }

export function mesh(): Mesh {
    let nw = { pos: { x: -402, y: +402 } } as Vertex
    let ne = { pos: { x: +402, y: +402 } } as Vertex
    let se = { pos: { x: +402, y: -402 } } as Vertex
    let sw = { pos: { x: -402, y: -402 } } as Vertex
    let n = { obtuse: false, origin: ne, target: nw } as HalfEdge
    let e = { obtuse: false, origin: se, target: ne } as HalfEdge
    let s = { obtuse: false, origin: sw, target: se } as HalfEdge
    let w = { obtuse: false, origin: nw, target: sw } as HalfEdge
    let nn = { half: n } as Edge; n.edge = nn
    let ee = { half: e } as Edge; e.edge = ee
    let ss = { half: s } as Edge; s.edge = ss
    let ww = { half: w } as Edge; w.edge = ww
    ne.outgoing = n; nw.outgoing = w; sw.outgoing = s; se.outgoing = e
    e.next = n; s.next = e; w.next = s; n.next = w
    n.prev = e; e.prev = s; s.prev = w; w.prev = n
    let f = { some: n } as Face
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

export function strictly_right_of(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) < 0
}

export function right_or_on_top_of(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) <= 0
}

export function on_line(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) == 0
}

export function on_point(p1: Vec2, p2: Vec2) {
    return p1.x == p2.x && p1.y == p2.y
}

export function strictly_left_of(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) > 0
}

export function left_or_on_top_of(l: Line, p: Vec2): boolean {
    return orient(l.p1, l.p2, p) >= 0
}

export function line(e: HalfEdge): Line {
    return { p1: e.origin.pos, p2: e.target.pos }
}

export function line_by_point_and_dir(p: Vec2, dir: Vec2): Line {
    return { p1: p, p2: plus(p, dir) }
}

export function rotate_left(v: Vec2): Vec2 {
    return { x: -v.y, y: v.x }
}

export function rotate_right(v: Vec2): Vec2 {
    return { x: v.y, y: -v.x }
}

export function plus(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y }
}

export function minus(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y }
}

export function approx_bisector_next(e2: HalfEdge): Line {
    let e3: HalfEdge = e2.next
    return line_by_point_and_dir(e2.target.pos, rotate_right(minus(e3.target.pos, e2.origin.pos)))
}

export function set_obtuseness(e2: HalfEdge) {
    let e3 = e2.next
    e2.obtuse = strictly_right_of(line_by_point_and_dir(e2.target.pos, rotate_left(minus(e2.target.pos, e2.origin.pos))), e3.target.pos)
}

export function gather_half_edges(m: Mesh): Set<HalfEdge> {
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

export function gather_edges(m: Mesh): Set<Edge> {
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

export function gather_faces(m: Mesh): Set<Face> {
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

export function gather_face_edges(f: Face) {
    let edges: HalfEdge[] = []
    let e = f.some
    let e2 = e
    do {
        edges.push(e2)
        e2 = e2.next
    } while (e2 !== e)
    return edges
}

export function triangulate_mesh(m: Mesh) {
    gather_faces(m).forEach((f) => { triangulate_face(f) })
}

export function delete_edge(e: HalfEdge) {
    // e.twin must be defined 
    // e.left must be triangle
    e.prev.left = e.twin!.left
    e.next.left = e.twin!.left
    e.twin!.prev.next = e.next
    e.twin!.next.prev = e.prev
    e.next.prev = e.twin!.prev
    e.prev.next = e.twin!.next
    e.twin!.left.some = e.next
    obtussle(e.prev); obtussle(e.twin!.prev)
}

export function kink_left_next(e: HalfEdge): boolean {
    let e2: HalfEdge = e.next
    return strictly_left_of(line(e), e2.target.pos)
}

export function triangulate_face(f: Face) {
    let e: HalfEdge = f.some
    let e2: HalfEdge = e.next
    while (e2.next !== e.prev) {
        while (!kink_left_next(e)) {
            e = e.next
        }
        e = cut_peak(e)
        e2 = e.next
    }
}

function obtussle(e: HalfEdge) {
    set_obtuseness(e)
    set_obtuseness(e.prev)
}

export function cut_peak(e: HalfEdge): HalfEdge {
    // angle(e, e.next) must kink left
    let e2 = e.next
    let e3: HalfEdge = { origin: e2.target, target: e.origin, prev: e2, next: e } as HalfEdge
    let e3i: HalfEdge = { origin: e3.target, target: e3.origin, prev: e.prev, next: e2.next, twin: e3, left: e.left } as HalfEdge
    let ee3: Edge = { half: e3 }; e3.edge = ee3; e3i.edge = ee3
    e.prev.next = e3i; e2.next.prev = e3i; e3.twin = e3i
    e.prev = e3; e2.next = e3
    let ff = { some: e3 } as Face
    e.left.some = e3i
    e.left = ff; e2.left = ff; e3.left = ff
    obtussle(e3); obtussle(e3i)
    return e3i
}

export function grow_edge(e: HalfEdge, p: Vec2) {
    // p must be in e.left, (e.origin, p) and (e.target, p) must not intersect anything
    let v: Vertex = { pos: p } as Vertex
    let e2: HalfEdge = { origin: e.target, target: v, prev: e } as HalfEdge
    let e3: HalfEdge = { origin: v, target: e.origin, prev: e2, next: e } as HalfEdge
    e2.next = e3
    v.outgoing = e3
    let e2i: HalfEdge = { origin: v, target: e.target, next: e.next, left: e.left, twin: e2 } as HalfEdge
    e2.twin = e2i
    let e3i: HalfEdge = { origin: e.origin, target: v, prev: e.prev, next: e2i, left: e.left, twin: e3 } as HalfEdge
    e2i.prev = e3i
    e3.twin = e3i
    e.left.some = e3i
    let ee2: Edge = { half: e2 }; e2.edge = ee2; e2i.edge = ee2
    let ee3: Edge = { half: e3 }; e3.edge = ee3; e3i.edge = ee3
    e.next.prev = e2i
    e.prev.next = e3i
    e.next = e2; e.prev = e3
    let ff = { some: e } as Face
    e.left = ff; e2.left = ff; e3.left = ff
    obtussle(e2); obtussle(e3); obtussle(e2i); obtussle(e3i)
    triangulate_face(e3i.left)
    return v
}

export function flipable_edge(e: HalfEdge): boolean {
    // e.left and e.twin.left must be triangles
    // returns true iff e is the diagonal of a convex quadrilateral with no co-linear sides
    return strictly_left_of(line(e.twin!.prev), e.next.target.pos)
        && strictly_left_of(line(e.twin!.next), e.next.target.pos)
}

export function flip_edge(e: HalfEdge): HalfEdge {
    // e must be diagonal of convex quadrilateral with no co-linear sides
    let eprev: HalfEdge = e.prev
    delete_edge(e)
    return cut_peak(eprev)
}

export function insert_vertex(m: Mesh, p: Vec2): Vertex {
    return insert_vertex_from_edge(m.north, p)
}

export function insert_vertex_from_edge(e: HalfEdge, p: Vec2): Vertex {
    // pre: m must be triangular
    // post: m will be triangular with vertex at p
    let split_edge = (esplit: HalfEdge, estay: HalfEdge): Vertex => {
        // p must be properly on esplit, estay.next == esplit
        delete_edge(esplit)
        return grow_edge(estay, p)
    }
    let f: Face = walk(e, p)
    let e1 = f.some; let e2 = e1.next; let e3 = e2.next
    if (on_point(e1.origin.pos, p)) {
        return e1.origin
    }
    if (on_point(e2.origin.pos, p)) {
        return e2.origin
    }
    if (on_point(e3.origin.pos, p)) {
        return e3.origin
    }
    if (on_line(line(e1), p)) {
        return split_edge(e1, e3)
    }
    if (on_line(line(e2), p)) {
        return split_edge(e2, e1)
    }
    if (on_line(line(e3), p)) {
        return split_edge(e3, e2)
    }
    // split face
    return grow_edge(e1, p)
}

export function walk(einit: HalfEdge, p: Vec2): Face {
    let e: HalfEdge = einit
    if (strictly_right_of(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds")
        }
        e = e.twin
    }
    let e2: HalfEdge = e.next
    while (e !== e2) {
        if (strictly_right_of(line(e2), p)) {
            while (e2.obtuse && left_or_on_top_of(approx_bisector_next(e2), p)) {
                e2 = e2.next
            }
            if (!e2.twin) {
                throw Error("out of bounds")
            }
            e = e2.twin
            e2 = e.next
        } else {
            e2 = e2.next
        }
    }
    return e.left
}

export function delaunafy(m: Mesh) {
    // pre: m must be triangular
    // post: m will be triangular and maximally delaunay
    let waiting_set: Set<Edge> = gather_edges(m)
    let waiting_list: Edge[] = []
    waiting_set.forEach((ee) => { waiting_list.push(ee) })
    let queue = (ee: Edge) => {
        if (!waiting_set.has(ee)) {
            waiting_list.push(ee)
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
            if (flipable_edge(e)) { // <-- defensive
                e = flip_edge(e)
                queue(e.next.edge); queue(e.prev.edge)
                queue(e.twin!.next.edge); queue(e.twin!.prev.edge)
            }
        }
    }
}

export function convexify(m: Mesh) {
    // pre: m must be triangular
    // post: m will (almost certainly?) no longer be triangular but still convex

    delaunafy(m)

    let triangles: Set<Face> = gather_faces(m)
    let waiting: Face[] = []

    let deleted = (e: HalfEdge): boolean => {
        if (e.twin
            && left_or_on_top_of(line(e.twin.prev), e.next.target.pos)
            && left_or_on_top_of(line(e.twin.next), e.next.target.pos)) {
            triangles.delete(e.left)
            triangles.delete(e.twin.left)
            delete_edge(e)
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

export type WalkStats = { orient_tests: number, path: HalfEdge[] }

export function celestial_walk_stats(einit: HalfEdge, p: Vec2): WalkStats {
    let tests: number = 0
    let e: HalfEdge = einit
    let path: HalfEdge[] = [e]
    if (++tests && strictly_right_of(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds")
        }
        e = e.twin
        path.push(e)
    }
    let e2: HalfEdge = e.next
    while (e !== e2) {
        if (++tests && strictly_right_of(line(e2), p)) {
            while (e2.obtuse && (++tests && left_or_on_top_of(approx_bisector_next(e2), p))) {
                e2 = e2.next
            }
            if (!e2.twin) {
                throw Error("out of bounds")
            }
            e = e2.twin
            path.push(e)
            e2 = e.next
        } else {
            e2 = e2.next
        }
    }
    return {orient_tests: tests, path: path}
}

export function visibility_walk_stats(einit: HalfEdge, p: Vec2): WalkStats {
    let tests: number = 0
    let e: HalfEdge = einit
    let path: HalfEdge[] = [e]
    if (++tests && strictly_right_of(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds")
        }
        e = e.twin
        path.push(e)
    }
    let e2: HalfEdge = e.next
    while (e !== e2) {
        if (++tests && strictly_right_of(line(e2), p)) {
            if (!e2.twin) {
                throw Error("out of bounds")
            }
            e = e2.twin
            path.push(e)
            e2 = e.next
        } else {
            e2 = e2.next
        }
    }
    return {orient_tests: tests, path: path}
}

export function straight_walk_stats(einit: HalfEdge, p1: Vec2, p2: Vec2): WalkStats {
    let tests: number = 0
    let e: HalfEdge = einit
    let path: HalfEdge[] = [e]
    let orientMap: Map<Vertex,number> = new Map()
    let vertexOrient = (v: Vertex): number => {
        if (!orientMap.has(v)) {
            tests++
            orientMap.set(v, orient(p1, p2, v.pos)) 
        }
        return orientMap.get(v)!
    }
    let vertexLeft = (v: Vertex): boolean => {
        return vertexOrient(v) >= 0
    }
    let vertexRight = (v: Vertex): boolean => {
        return vertexOrient(v) <= 0
    }
    let e2: HalfEdge = e
    do {
        if (++tests && strictly_right_of(line(e2), p2)) {
            while (!(vertexRight(e2.origin) && vertexLeft(e2.target))) {
                e2 = e2.next
            }
            if (!e2.twin) {
                throw Error("out of bounds")
            }
            e = e2.twin
            path.push(e)
            e2 = e.next
        } else {
            e2 = e2.next
        }
    } while (e2 !== e)
    return {orient_tests: tests, path: path}
}