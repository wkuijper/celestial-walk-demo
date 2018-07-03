/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//1035
exports.MIN_MESH_COORD = -65535;
exports.MAX_MESH_COORD = 65535;
exports.MESH_SIZE = exports.MAX_MESH_COORD - exports.MIN_MESH_COORD;
function mesh() {
    let nw = { pos: { x: exports.MIN_MESH_COORD - 1, y: exports.MAX_MESH_COORD + 1 } };
    let ne = { pos: { x: exports.MAX_MESH_COORD + 1, y: exports.MAX_MESH_COORD + 1 } };
    let se = { pos: { x: exports.MAX_MESH_COORD + 1, y: exports.MIN_MESH_COORD - 1 } };
    let sw = { pos: { x: exports.MIN_MESH_COORD - 1, y: exports.MIN_MESH_COORD - 1 } };
    let n = { obtuse: false, origin: ne, target: nw, fill: false };
    let e = { obtuse: false, origin: se, target: ne, fill: false };
    let s = { obtuse: false, origin: sw, target: se, fill: false };
    let w = { obtuse: false, origin: nw, target: sw, fill: false };
    let nn = { half: n, constrained: true };
    n.edge = nn;
    let ee = { half: e, constrained: true };
    e.edge = ee;
    let ss = { half: s, constrained: true };
    s.edge = ss;
    let ww = { half: w, constrained: true };
    w.edge = ww;
    ne.outgoing = n;
    nw.outgoing = w;
    sw.outgoing = s;
    se.outgoing = e;
    e.next = n;
    s.next = e;
    w.next = s;
    n.next = w;
    n.prev = e;
    e.prev = s;
    s.prev = w;
    w.prev = n;
    let f = { some: n, filled: false };
    n.left = f;
    e.left = f;
    s.left = f;
    w.left = f;
    let m = { north: n };
    return m;
}
exports.mesh = mesh;
function orient(p, q, r) {
    return ((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
}
exports.orient = orient;
function incircle(a, b, c, d) {
    let ad = minus(a, d);
    let bd = minus(b, d);
    let cd = minus(c, d);
    return ((ad.x * ad.x + ad.y * ad.y) * (bd.x * cd.y - cd.x * bd.y) + (bd.x * bd.x + bd.y * bd.y) * (cd.x * ad.y - ad.x * cd.y) + (cd.x * cd.x + cd.y * cd.y) * (ad.x * bd.y - bd.x * ad.y)) > 0;
}
exports.incircle = incircle;
function strictlyRightOf(l, p) {
    return orient(l.p1, l.p2, p) < 0;
}
exports.strictlyRightOf = strictlyRightOf;
function rightOrOnTopOf(l, p) {
    return orient(l.p1, l.p2, p) <= 0;
}
exports.rightOrOnTopOf = rightOrOnTopOf;
function onLine(l, p) {
    return orient(l.p1, l.p2, p) == 0;
}
exports.onLine = onLine;
function pointsCoincide(p1, p2) {
    return p1.x == p2.x && p1.y == p2.y;
}
exports.pointsCoincide = pointsCoincide;
function strictlyLeftOf(l, p) {
    return orient(l.p1, l.p2, p) > 0;
}
exports.strictlyLeftOf = strictlyLeftOf;
function leftOrOnTopOf(l, p) {
    return orient(l.p1, l.p2, p) >= 0;
}
exports.leftOrOnTopOf = leftOrOnTopOf;
function line(e) {
    return { p1: e.origin.pos, p2: e.target.pos };
}
exports.line = line;
function lineByPointAndDir(p, dir) {
    return { p1: p, p2: plus(p, dir) };
}
exports.lineByPointAndDir = lineByPointAndDir;
function rotateLeft(v) {
    return { x: -v.y, y: v.x };
}
exports.rotateLeft = rotateLeft;
function rotateRight(v) {
    return { x: v.y, y: -v.x };
}
exports.rotateRight = rotateRight;
function plus(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
exports.plus = plus;
function minus(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
exports.minus = minus;
function mult(a, s) {
    return { x: a.x * s, y: a.y * s };
}
exports.mult = mult;
function roundVec2(p) {
    return { x: Math.round(p.x), y: Math.round(p.y) };
}
exports.roundVec2 = roundVec2;
function computeObtuseness(e2) {
    let e3 = e2.next;
    return strictlyRightOf(lineByPointAndDir(e2.target.pos, rotateLeft(minus(e2.target.pos, e2.origin.pos))), e3.target.pos);
}
exports.computeObtuseness = computeObtuseness;
function precomputeObtuseness(e2) {
    e2.obtuse = computeObtuseness(e2);
}
exports.precomputeObtuseness = precomputeObtuseness;
function gatherHalfEdges(m) {
    let visited = new Set();
    let waiting = [];
    let queue = (e) => {
        if (!visited.has(e)) {
            waiting.push(e);
            visited.add(e);
            if (e.twin) {
                waiting.push(e.twin);
                visited.add(e.twin);
            }
        }
    };
    queue(m.north);
    while (waiting.length > 0) {
        let e = waiting.pop();
        queue(e.next);
    }
    return visited;
}
exports.gatherHalfEdges = gatherHalfEdges;
function gatherEdges(m) {
    let visited = new Set();
    let waiting = [];
    let queue = (e) => {
        if (!visited.has(e.edge)) {
            waiting.push(e);
            if (e.twin) {
                waiting.push(e.twin);
            }
            visited.add(e.edge);
        }
    };
    queue(m.north);
    while (waiting.length > 0) {
        let e = waiting.pop();
        queue(e.next);
    }
    return visited;
}
exports.gatherEdges = gatherEdges;
function gatherFaces(m) {
    let visited = new Set();
    let waiting = [];
    let queue = (f) => {
        waiting.push(f);
        visited.add(f);
    };
    queue(m.north.left);
    while (waiting.length > 0) {
        let f = waiting.pop();
        let e = f.some;
        let e2 = e;
        do {
            if (e2.twin && !visited.has(e2.twin.left)) {
                queue(e2.twin.left);
            }
            e2 = e2.next;
        } while (e2 !== e);
    }
    return visited;
}
exports.gatherFaces = gatherFaces;
function gatherFaceEdges(f) {
    let edges = [];
    let e = f.some;
    let e2 = e;
    do {
        edges.push(e2);
        e2 = e2.next;
    } while (e2 !== e);
    return edges;
}
exports.gatherFaceEdges = gatherFaceEdges;
function triangulateMesh(m) {
    gatherFaces(m).forEach((f) => { triangulateFace(f); });
}
exports.triangulateMesh = triangulateMesh;
function deleteEdge(e) {
    // e.twin must be defined 
    // e.left must be triangle
    e.origin.outgoing = e.twin.next;
    e.twin.origin.outgoing = e.next;
    e.prev.left = e.twin.left;
    e.next.left = e.twin.left;
    e.twin.prev.next = e.next;
    e.twin.next.prev = e.prev;
    e.next.prev = e.twin.prev;
    e.prev.next = e.twin.next;
    e.twin.left.some = e.next;
    precomputeObtuseness(e.prev);
    precomputeObtuseness(e.twin.prev);
}
exports.deleteEdge = deleteEdge;
function triangulateFace(f) {
    let e1 = f.some;
    let e2 = e1.next;
    let e3 = e2.next;
    while (e3.next != e1) {
        while (!(strictlyLeftOf(line(e1), e2.target.pos) &&
            strictlyRightOf({ p1: e2.target.pos, p2: e1.origin.pos }, e3.target.pos))) {
            e1 = e2;
            e2 = e3;
            e3 = e3.next;
        }
        e1 = cutPeak(e1);
        e2 = e1.next;
        e3 = e2.next;
    }
}
exports.triangulateFace = triangulateFace;
function precomputeObtusenessForNewHalfEdge(e) {
    precomputeObtuseness(e);
    precomputeObtuseness(e.prev);
}
function cutPeak(e) {
    // angle(e, e.next) must kink left (e.origin, e.next.target) must not intersect anything
    const e2 = e.next;
    const e3 = { origin: e2.target, target: e.origin, prev: e2, next: e, fill: false };
    const e3i = { origin: e3.target, target: e3.origin, prev: e.prev, next: e2.next, twin: e3, left: e.left, fill: false };
    const ee3 = { half: e3, constrained: false };
    e3.edge = ee3;
    e3i.edge = ee3;
    e.prev.next = e3i;
    e2.next.prev = e3i;
    e3.twin = e3i;
    e.prev = e3;
    e2.next = e3;
    const ff = { some: e3, filled: e.left.filled };
    e.left.some = e3i;
    e.left = ff;
    e2.left = ff;
    e3.left = ff;
    precomputeObtusenessForNewHalfEdge(e3);
    precomputeObtusenessForNewHalfEdge(e3i);
    return e3i;
}
exports.cutPeak = cutPeak;
function growEdge(e, p) {
    // pre: p must be properly in e.left, (e.origin, p) and (e.target, p) must not intersect anything
    // post: a vertex at p and the remainder of the face triangulated
    let v = { pos: p };
    let e2 = { origin: e.target, target: v, prev: e, fill: false };
    let e3 = { origin: v, target: e.origin, prev: e2, next: e, fill: false };
    e2.next = e3;
    v.outgoing = e3;
    let e2i = { origin: v, target: e.target, next: e.next, left: e.left, twin: e2 };
    e2.twin = e2i;
    let e3i = { origin: e.origin, target: v, prev: e.prev, next: e2i, left: e.left, twin: e3 };
    e2i.prev = e3i;
    e3.twin = e3i;
    e.left.some = e3i;
    let ee2 = { half: e2, constrained: false };
    e2.edge = ee2;
    e2i.edge = ee2;
    let ee3 = { half: e3, constrained: false };
    e3.edge = ee3;
    e3i.edge = ee3;
    e.next.prev = e2i;
    e.prev.next = e3i;
    e.next = e2;
    e.prev = e3;
    let ff = { some: e, filled: e.left.filled };
    e.left = ff;
    e2.left = ff;
    e3.left = ff;
    precomputeObtusenessForNewHalfEdge(e2);
    precomputeObtusenessForNewHalfEdge(e2i);
    precomputeObtusenessForNewHalfEdge(e3);
    precomputeObtusenessForNewHalfEdge(e3i);
    triangulateFace(e3i.left); // restore convexity
    return v;
}
exports.growEdge = growEdge;
function flipableEdge(e) {
    // e.left and e.twin.left must be triangles
    // returns true iff e is the unconstrained diagonal of a convex quadrilateral with no co-linear sides
    return !e.edge.constrained
        && strictlyLeftOf(line(e.twin.prev), e.next.target.pos)
        && strictlyLeftOf(line(e.twin.next), e.next.target.pos);
}
exports.flipableEdge = flipableEdge;
function flipEdge(e) {
    // e must be diagonal of convex quadrilateral with no co-linear sides
    let eprev = e.prev;
    deleteEdge(e);
    return cutPeak(eprev);
}
exports.flipEdge = flipEdge;
function insertVertex(m, p) {
    return insertVertexFromEdge(m.north, p);
}
exports.insertVertex = insertVertex;
function splitEdgeApproximately(e, p) {
    // round to nearest integer point
    p = roundVec2(p);
    // check if approximate intersection point is properly contained within left-cone/right-cone intersection
    if (!strictlyLeftOf(line(e.next), p) || !strictlyLeftOf(line(e.prev), p) || !strictlyLeftOf(line(e.twin.next), p) || !strictlyLeftOf(line(e.twin.prev), p)) {
        throw { message: "insufficient precision for splitting edge", edge: e, point: p };
    }
    return splitEdge(e, p);
}
exports.splitEdgeApproximately = splitEdgeApproximately;
function splitEdge(esplit, p) {
    // p must be properly in the intersection of cones left and right of esplit
    const estay = esplit.prev;
    deleteEdge(esplit);
    const v = growEdge(estay, p);
    if (esplit.edge.constrained) {
        // patch up the constrained attributes of the two newly created undirected edges 
        // and the fill attributes of the four newly created directed edges
        let e = v.outgoing;
        do {
            if (e.target == esplit.origin) {
                e.edge.constrained = true;
                e.fill = esplit.twin.fill;
                e.twin.fill = esplit.fill;
            }
            else if (e.target == esplit.target) {
                e.edge.constrained = true;
                e.fill = esplit.fill;
                e.twin.fill = esplit.twin.fill;
            }
            e = e.twin.next;
        } while (e != v.outgoing);
    }
    return v;
}
exports.splitEdge = splitEdge;
function insertVertexFromEdge(e, p) {
    // pre: m must be triangular
    // post: m will be triangular with vertex at p
    let f = walk(e, p);
    let e1 = f.some;
    let e2 = e1.next;
    let e3 = e2.next;
    if (pointsCoincide(e1.origin.pos, p)) {
        return e1.origin;
    }
    if (pointsCoincide(e2.origin.pos, p)) {
        return e2.origin;
    }
    if (pointsCoincide(e3.origin.pos, p)) {
        return e3.origin;
    }
    if (onLine(line(e1), p)) {
        return splitEdge(e1, p);
    }
    if (onLine(line(e2), p)) {
        return splitEdge(e2, p);
    }
    if (onLine(line(e3), p)) {
        return splitEdge(e3, p);
    }
    // split face
    return growEdge(e1, p);
}
exports.insertVertexFromEdge = insertVertexFromEdge;
function walkToClosestVertex(einit, p) {
    const e = walk(einit, p).some;
    function squaredDistance(v) {
        const d = minus(v.pos, p);
        return d.x * d.x + d.y * d.y;
    }
    let clv = e.origin;
    let sqd = squaredDistance(e.origin);
    const sqd2 = squaredDistance(e.target);
    if (sqd2 < sqd) {
        sqd = sqd2;
        clv = e.target;
    }
    const sqd3 = squaredDistance(e.next.target);
    if (sqd3 < sqd) {
        sqd = sqd2;
        clv = e.next.target;
    }
    return clv;
}
exports.walkToClosestVertex = walkToClosestVertex;
function approxBisectorNext(e2) {
    let e3 = e2.next;
    return lineByPointAndDir(e2.target.pos, rotateRight(minus(e3.target.pos, e2.origin.pos)));
}
exports.approxBisectorNext = approxBisectorNext;
function walk(einit, p) {
    let e = einit;
    if (strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" };
        }
        e = e.twin;
    }
    let e2 = e.next;
    while (e !== e2) {
        if (strictlyRightOf(line(e2), p)) {
            while (e2.obtuse && leftOrOnTopOf(approxBisectorNext(e2), p)) {
                e2 = e2.next;
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" };
            }
            e = e2.twin;
            e2 = e.next;
        }
        else {
            e2 = e2.next;
        }
    }
    return e.left;
}
exports.walk = walk;
function isDelaunayTriangle(f) {
    const e = f.some;
    if (e.next.next.next != e) {
        return false; // not a triangle
    }
    let ee = e;
    do {
        if (!ee.twin || ee.twin.next.next.next != ee.twin) {
            return false; // neighbour is not a triangle
        }
        if (incircle(ee.origin.pos, ee.target.pos, ee.next.target.pos, ee.twin.next.target.pos)) {
            return false; // neighbour is in circumcircle: not delaunay
        }
        ee = ee.next;
    } while (ee != e);
    return true;
}
exports.isDelaunayTriangle = isDelaunayTriangle;
function delaunafy(m) {
    // pre: m must be triangular
    // post: m will be triangular and maximally delaunay
    let waiting_set = gatherEdges(m);
    let waiting_list = [];
    waiting_set.forEach((ee) => { waiting_list.push(ee); });
    //shuffle(waiting_list)
    let queue = (ee) => {
        if (!waiting_set.has(ee)) {
            const l = waiting_list.push(ee);
            //if (l > 1) {
            //    const i = Random.integer(0,l-1)(mersenne)
            //    waiting_list[l-1] = waiting_list[i];
            //    waiting_list[i] = ee;
            //}
            waiting_set.add(ee);
        }
    };
    while (waiting_list.length > 0) {
        let ee = waiting_list.pop();
        waiting_set.delete(ee);
        let e = ee.half;
        if (!(e.twin)) {
            continue;
        }
        if (incircle(e.origin.pos, e.target.pos, e.next.target.pos, e.twin.next.target.pos)
            || incircle(e.twin.origin.pos, e.twin.target.pos, e.twin.next.target.pos, e.next.target.pos)) {
            if (flipableEdge(e)) {
                e = flipEdge(e);
                queue(e.next.edge);
                queue(e.prev.edge);
                queue(e.twin.next.edge);
                queue(e.twin.prev.edge);
            }
        }
    }
}
exports.delaunafy = delaunafy;
function convexify(m, deeply = false) {
    // pre: m must be triangular
    // post: m will (almost certainly?) no longer be triangular but still convex
    delaunafy(m);
    let triangles = gatherFaces(m);
    let waiting = [];
    let deleted = (e) => {
        if (e.twin
            && !e.edge.constrained
            && leftOrOnTopOf(line(e.twin.prev), e.next.target.pos)
            && leftOrOnTopOf(line(e.twin.next), e.next.target.pos)) {
            triangles.delete(e.left);
            triangles.delete(e.twin.left);
            deleteEdge(e);
            return true;
        }
        return false;
    };
    triangles.forEach((f) => { waiting.push(f); });
    while (waiting.length > 0) {
        let e = waiting.pop().some;
        if (!triangles.has(e.left)) {
            continue;
        }
        if (deleted(e)) {
            continue;
        }
        if (deleted(e.next)) {
            continue;
        }
        if (deleted(e.prev)) {
            continue;
        }
    }
}
exports.convexify = convexify;
function vec2String(p) {
    return `(${p.x},${p.y})`;
}
exports.vec2String = vec2String;
function vertexString(v) {
    return `${vec2String(v.pos)}`;
}
exports.vertexString = vertexString;
function halfEdgeString(e) {
    return `${vertexString(e.origin)}->${vertexString(e.target)}`;
}
exports.halfEdgeString = halfEdgeString;
function halfEdgeDelta(e) {
    return minus(e.target.pos, e.origin.pos);
}
exports.halfEdgeDelta = halfEdgeDelta;
function halfEdgeLength(e) {
    const d = halfEdgeDelta(e);
    return Math.sqrt((d.x * d.x) + (d.y * d.y));
}
exports.halfEdgeLength = halfEdgeLength;
function edgeLength(ee) {
    return halfEdgeLength(ee.half);
}
exports.edgeLength = edgeLength;
function connected(a, b) {
    // returns true iff a and b are connected by an edge
    // if at least one vertex is an internal vertex this means there will be two half-edges linking both vertices
    // if both vertices are boundary vertices this means there will be only one half-edge linking both vertices
    let e = a.outgoing;
    if (e.target == b) {
        return e.edge;
    }
    while (e.twin) {
        e = e.twin.next;
        if (e == a.outgoing) {
            e = b.outgoing;
            if (e.target == a) {
                return e.edge;
            }
            while (e.twin) {
                e = e.twin.next;
                if (e == b.outgoing) {
                    return null;
                }
                if (e.target == a) {
                    return e.edge;
                }
            }
            e = b.outgoing;
            while (e.prev.twin) {
                e = e.prev.twin;
                if (e.target == a) {
                    return e.edge;
                }
            }
            return null;
        }
        if (e.target == b) {
            return e.edge;
        }
    }
    e = a.outgoing;
    while (e.prev.twin) {
        e = e.prev.twin;
        if (e.target == b) {
            return e.edge;
        }
    }
    e = b.outgoing;
    if (e.target == a) {
        return e.edge;
    }
    while (e.twin) {
        e = e.twin.next;
        if (e == b.outgoing) {
            return null;
        }
        if (e.target == a) {
            return e.edge;
        }
    }
    e = b.outgoing;
    while (e.prev.twin) {
        e = e.prev.twin;
        if (e.target == a) {
            return e.edge;
        }
    }
    return null;
}
exports.connected = connected;
function pivot(vertex, goalPos) {
    // pre: mesh must be triangular, line from vertex.pos to goal must be properly contained in mesh.
    // post: a hand halfedge such that hand.source == vertex and the goal is on-or-left-of hand and strictly-left-of hand.prev
    let hand = vertex.outgoing;
    if (pointsCoincide(vertex.pos, goalPos)) {
        throw { geom: true, message: "can't pivot towards own position" };
    }
    while (!(leftOrOnTopOf(line(hand), goalPos) && strictlyLeftOf(line(hand.prev), goalPos))) {
        if (!hand.twin) {
            if (rightOrOnTopOf(line(hand), goalPos)) {
                throw { geom: true, message: "can't pivot boundary vertex towards out-of-bounds position" };
            }
            while (hand.prev.twin) {
                hand = hand.prev.twin;
            }
        }
        else {
            hand = hand.twin.next;
        }
    }
    return hand;
}
exports.pivot = pivot;
function flipToConnectViaIntermediaryVertex(from, to, fromEdge) {
    // we're looking for a single intervening vertex such that no other vertex intersects the from-split-to triangle
    let currSplitVertex = fromEdge.target;
    let currCutLine = line(fromEdge);
    let currEdge = fromEdge;
    while (currEdge.target != to) {
        const s = orient(from.pos, to.pos, currEdge.target.pos);
        if (s == 0) {
            throw { message: "intersecting existing vertex", existingVertex: currEdge.target };
        }
        if (s > 0) {
            // we're on the wrong side of the from-to line: keep going
            currEdge = currEdge.twin.next;
            continue;
        }
        if (strictlyLeftOf(currCutLine, currEdge.target.pos)) {
            // the current vertex falls inside the from-split-to triangle so it will replace the current split-vertex
            currSplitVertex = currEdge.target;
            currCutLine.p2 = currEdge.target.pos;
        }
        currEdge = currEdge.next;
    }
    if (!connected(from, currSplitVertex)) {
        flipToConnectVertices(from, currSplitVertex);
    }
    if (!connected(currSplitVertex, to)) {
        flipToConnectVertices(currSplitVertex, to);
    }
}
exports.flipToConnectViaIntermediaryVertex = flipToConnectViaIntermediaryVertex;
function flipToConnectVertices(start, finish) {
    while (true) {
        const startEdge = pivot(start, finish.pos);
        const finishEdge = pivot(finish, start.pos);
        if (startEdge.target == finish) {
            // we're already done
            return startEdge;
        }
        else if (startEdge.next.target != finishEdge.target) {
            // left-hand-side of start to finish line must be brought to a triangle shape with single intermediary vertex
            flipToConnectViaIntermediaryVertex(finish, start, finishEdge);
        }
        else if (finishEdge.next.target != startEdge.target) {
            // right-hand-side of start to finish line must be brought to a triangle shape with single intermediary vertex
            flipToConnectViaIntermediaryVertex(start, finish, startEdge);
        }
        else {
            // two triangle halves make a convex quadrilateral that can be flipped to connect the vertices
            const crossingEdge = startEdge.next;
            if (!flipableEdge(crossingEdge)) {
                throw { message: "intersecting constrained edge", constrainedEdge: crossingEdge.edge };
            }
            const e = flipEdge(crossingEdge);
            return e;
        }
    }
}
exports.flipToConnectVertices = flipToConnectVertices;
function draw(m, l, fillLeft, fillRight) {
    const v1 = insertVertex(m, l.p1);
    const v2 = insertVertex(m, l.p2);
    drawBetweenVertices(v1, v2, fillLeft, fillRight);
}
exports.draw = draw;
function drawBetweenVertices(v1, v2, fillLeft, fillRight) {
    if (v1 == v2) {
        return;
    }
    try {
        const e = flipToConnectVertices(v1, v2);
        e.edge.constrained = true;
        e.fill = fillLeft;
        e.twin.fill = fillRight;
    }
    catch (exception) {
        if (exception.constrainedEdge) {
            const constrainedEdge = exception.constrainedEdge;
            const e = constrainedEdge.half;
            // approximate intersection point
            let [c1, c2] = [e.origin.pos, e.target.pos];
            let [p1, p2] = [v1.pos, v2.pos];
            if (orient(c1, c2, p1) > 0) {
                [p1, p2] = [p2, p1];
            }
            let p;
            for (let c = 0; c < 20; c++) {
                p = mult(plus(p1, p2), .5);
                const s = orient(c1, c2, p);
                if (s == 0) {
                    break;
                }
                else if (s > 0) {
                    p2 = p;
                }
                else {
                    p1 = p;
                }
            }
            // go ahead: split the edge and recurse
            const v = splitEdgeApproximately(e, p);
            drawBetweenVertices(v1, v, fillLeft, fillRight);
            drawBetweenVertices(v, v2, fillLeft, fillRight);
        }
        else if (exception.existingVertex) {
            const v = exception.existingVertex;
            drawBetweenVertices(v1, v, fillLeft, fillRight);
            drawBetweenVertices(v, v2, fillLeft, fillRight);
        }
        else {
            throw exception;
        }
    }
}
exports.drawBetweenVertices = drawBetweenVertices;
function floodFill(m) {
    const halfEdges = gatherHalfEdges(m);
    const faces = gatherFaces(m);
    faces.forEach((f) => {
        f.filled = false;
    });
    const waiting = [];
    halfEdges.forEach((e) => {
        if (e.fill && !e.left.filled) {
            waiting.push(e.left);
            e.left.filled = true;
        }
    });
    while (waiting.length > 0) {
        const f = waiting.pop();
        [f.some, f.some.next, f.some.next.next].forEach((e) => {
            if (!e.twin) {
                return;
            }
            e = e.twin;
            if (!e.edge.constrained && !e.left.filled) {
                waiting.push(e.left);
                e.left.filled = true;
            }
        });
    }
    const edges = gatherEdges(m);
    edges.forEach((ee) => {
        if (ee.constrained) {
            const e = ee.half;
            if (e.left.filled && e.twin && e.twin.left.filled) {
                ee.constrained = false;
            }
        }
    });
}
exports.floodFill = floodFill;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function treatedAll(thing) {
    throw Error(`did not treat: ${thing}`);
}
exports.treatedAll = treatedAll;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(1);
const Geom = __webpack_require__(0);
const Pointcloud = __webpack_require__(3);
const Floorplan = __webpack_require__(4);
const Walk = __webpack_require__(5);
const Render = __webpack_require__(6);
const Random = __webpack_require__(7);
const meshTypes = ["Delaunay Pointcloud", "Thintriangles Pointcloud", "Convex Pointcloud", "Delaunayish Floorplan", "Convex Floorplan", "Subdivided Floorplan", "Visibility Looper"];
const walkTypes = ["Straight", "Visibility", "Celestial", "Balanced Celestial"];
const random = new Random(Random.engines.nativeMath);
function generateVisibilityLooper() {
    const mesh = Geom.mesh();
    function drawCenteredRotatedSquare(width, rotation, fill) {
        const h = width / 2;
        const points = [{ x: -h, y: -h }, { x: h, y: -h }, { x: h, y: h }, { x: -h, y: h }];
        points.forEach((p) => {
            p.x = p.x * Math.cos(rotation) - p.y * Math.sin(rotation);
            p.y = p.x * Math.sin(rotation) + p.y * Math.cos(rotation);
        });
        const vertices = points.map((p) => { return Geom.insertVertex(mesh, p); });
        let v1 = vertices[vertices.length - 1];
        vertices.forEach((v2) => {
            Geom.drawBetweenVertices(v1, v2, fill, false);
            v1 = v2;
        });
        return vertices;
    }
    const vs1 = drawCenteredRotatedSquare(20000, 0, false);
    const vs2 = drawCenteredRotatedSquare(10000, (-5 / 180) * Math.PI, true);
    const lines = [[vs1[0], vs2[0]], [vs1[1], vs2[0]], [vs1[1], vs2[1]], [vs1[2], vs2[1]],
        [vs1[2], vs2[2]], [vs1[3], vs2[2]], [vs1[3], vs2[3]], [vs1[0], vs2[3]], [vs2[1], vs2[3]]];
    lines.forEach((l) => {
        const [a, b] = l;
        Geom.drawBetweenVertices(a, b, false, false);
    });
    Geom.floodFill(mesh);
    return mesh;
}
function generateMesh(meshType) {
    if (meshType == "Delaunay Pointcloud") {
        return Pointcloud.randomMesh(random, "Delaunay");
    }
    else if (meshType == "Thintriangles Pointcloud") {
        return Pointcloud.randomMesh(random, "Thin");
    }
    else if (meshType == "Convex Pointcloud") {
        return Pointcloud.randomMesh(random, "Convex");
    }
    else if (meshType == "Delaunayish Floorplan") {
        return Floorplan.randomMesh(random, false, false);
    }
    else if (meshType == "Convex Floorplan") {
        return Floorplan.randomMesh(random, false, true);
    }
    else if (meshType == "Subdivided Floorplan") {
        return Floorplan.randomMesh(random, true, false);
    }
    else if (meshType == "Visibility Looper") {
        return generateVisibilityLooper();
    }
    return common_1.treatedAll(meshType);
}
let currMesh;
let currMeshType;
function selectMeshHandler(ev) {
    selectMesh(this.value);
}
let meshSVG;
let arrowLayer;
let arrowOrigin = null;
let arrowTarget = null;
let pathLayer;
function selectMesh(meshType) {
    if (currMeshType && meshType == currMeshType) {
        return;
    }
    document.getElementById("status-div").innerHTML = '';
    document.getElementById("select-mesh").classList.remove("warning");
    document.getElementById("select-walk").classList.remove("warning");
    if (currWalkType == "Visibility" && (!meshType.includes("Delaunay"))) {
        document.getElementById("status-div").innerHTML = '<span class="warning">This combination may loop!</span>';
        document.getElementById("select-walk").classList.add("warning");
    }
    currMeshType = meshType;
    currMesh = generateMesh(currMeshType);
    let meshDIV = document.getElementById("mesh-div");
    meshDIV.innerHTML = Render.mesh2svg(currMesh);
    meshSVG = document.getElementById("mesh-svg");
    meshSVG.addEventListener("click", meshClickHandler);
    arrowLayer = document.getElementById("arrow-layer");
    pathLayer = document.getElementById("path-layer");
    arrowOrigin = null;
    arrowTarget = null;
    currPathInitFace = null;
    currWalkStats = null;
}
function meshSVGEventPos(evt) {
    if (!meshSVG) {
        return { x: 0, y: 0 };
    }
    let x = evt.clientX;
    let y = evt.clientY;
    let sm = meshSVG.getScreenCTM().inverse(); // TODO: handle properly the fact that getScreenCTM can return null
    return { x: Math.round((sm.a * x) + (sm.c * y) + sm.e), y: Math.round((sm.b * x) + (sm.d * y) + sm.f) };
}
let currPathInitFace = null;
let currWalkStats = null;
function updatePath() {
    if (currPathInitFace === null || arrowOrigin === null || arrowTarget === null || currWalkType == undefined) {
        return;
    }
    currWalkStats = Walk.stats(currWalkType, currPathInitFace.some, arrowOrigin, arrowTarget);
    drawPath();
}
function meshClickHandler(ev) {
    const mev = ev;
    if (arrowOrigin === null || arrowTarget !== null) {
        arrowOrigin = meshSVGEventPos(mev);
        if (currMesh) {
            currPathInitFace = Geom.walk(currMesh.north, arrowOrigin);
        }
        arrowTarget = null;
        currWalkStats = null;
    }
    else {
        arrowTarget = meshSVGEventPos(mev);
        if (currPathInitFace !== null) {
            updatePath();
        }
    }
    drawArrow();
    drawPath();
}
function drawPath() {
    if (!pathLayer) {
        return;
    }
    let statusLine = "";
    let lines = [];
    if (currPathInitFace !== null) {
        lines.push(Render.face2svg(currPathInitFace, "path-face"));
    }
    if (currWalkStats !== null) {
        const currPath = currWalkStats.path;
        currPath.forEach((e) => {
            if (e.left !== currPathInitFace) {
                const p1 = e.origin.pos;
                const p2 = e.target.pos;
                lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>');
                lines.push(Render.face2svg(e.left, "path-face"));
            }
        });
        statusLine = `Faces:&nbsp;<span class="facecount">${currPath.length}</span>, Orientation Tests:&nbsp;<span class="orientcount">${currWalkStats.orient_tests}</span>`;
    }
    pathLayer.innerHTML = lines.join("\n");
    document.getElementById("status-div").innerHTML = statusLine;
}
function drawArrow() {
    if (!arrowLayer) {
        return;
    }
    let lines = [];
    if (arrowOrigin !== null) {
        lines.push('<circle cx="' + arrowOrigin.x + '" cy="' + arrowOrigin.y + '" r="5" id="arrow-origin"/>');
        if (arrowTarget !== null) {
            lines.push('<line x1="' + arrowOrigin.x + '" y1="' + arrowOrigin.y + '" x2="' + arrowTarget.x + '" y2="' + arrowTarget.y + '" id="arrow" marker-end="url(#arrow-head)"/>');
        }
    }
    arrowLayer.innerHTML = lines.join("\n");
}
let currWalkType;
function selectWalkHandler(ev) {
    selectWalk(this.value);
}
function selectWalk(walkType) {
    if (currWalkType && walkType == currWalkType) {
        return;
    }
    document.getElementById("status-div").innerHTML = '';
    document.getElementById("select-mesh").classList.remove("warning");
    document.getElementById("select-walk").classList.remove("warning");
    if (walkType == "Visibility" && currMeshType && (!currMeshType.includes("Delaunay"))) {
        document.getElementById("status-div").innerHTML = '<span class="warning">This combination may loop!</span>';
        document.getElementById("select-mesh").classList.add("warning");
    }
    currWalkType = walkType;
    updatePath();
}
function optionsHTML(options) {
    const lines = [];
    options.forEach((v) => {
        lines.push(`<option value="${v}">${v}</option>`);
    });
    return lines.join('\n');
}
document.getElementById("select-mesh").innerHTML = optionsHTML(meshTypes);
document.getElementById("select-walk").innerHTML = optionsHTML(walkTypes);
document.getElementById("select-mesh").addEventListener("change", selectMeshHandler);
document.getElementById("select-walk").addEventListener("change", selectWalkHandler);
selectMesh((document.getElementById("select-mesh")).value);
selectWalk((document.getElementById("select-walk")).value);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(1);
const Geom = __webpack_require__(0);
// take some distance from the mesh boundaries
const MARGIN = Math.round(Geom.MESH_SIZE * 0.00789654383154);
const MIN_MESH_COORD = Geom.MIN_MESH_COORD + MARGIN;
const MAX_MESH_COORD = Geom.MAX_MESH_COORD - MARGIN;
function randomPoint(random) {
    let x = random.integer(MIN_MESH_COORD, MAX_MESH_COORD);
    let y = random.integer(MIN_MESH_COORD, MAX_MESH_COORD);
    return { x: x, y: y };
}
exports.randomPoint = randomPoint;
function randomMesh(random, meshType) {
    return meshFromPointCloud(meshType, randomPointCloud(random, 200));
}
exports.randomMesh = randomMesh;
function randomPointCloud(random, n) {
    const pointCloud = [];
    for (var i = 0; i < n; i++) {
        pointCloud.push(randomPoint(random));
    }
    return pointCloud;
}
exports.randomPointCloud = randomPointCloud;
function fillMeshFromPointCloud(m, meshType, pointCloud) {
    pointCloud.forEach((p) => {
        Geom.insertVertex(m, p);
    });
    if (meshType == "Thin") {
        return m;
    }
    else if (meshType == "Delaunay") {
        Geom.delaunafy(m);
        return m;
    }
    else if (meshType == "Convex") {
        Geom.delaunafy(m);
        Geom.convexify(m);
        return m;
    }
    return common_1.treatedAll(meshType);
}
exports.fillMeshFromPointCloud = fillMeshFromPointCloud;
function meshFromPointCloud(meshType, pointCloud) {
    const m = Geom.mesh();
    fillMeshFromPointCloud(m, meshType, pointCloud);
    return m;
}
exports.meshFromPointCloud = meshFromPointCloud;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Geom = __webpack_require__(0);
function randomMesh(random, subdivide, convexify) {
    const floorplan1 = randomFloorplan(random);
    const floorplan2 = randomFloorplan(random);
    const angle2 = random.real((30 / 180) * Math.PI, (60 / 180) * Math.PI);
    rotateFloorplan(floorplan2, angle2);
    const interAxisRadius = random.real(10000, 12000);
    const interAxisAngle = random.pick([(45 / 180) * Math.PI, (135 / 180) * Math.PI, (225 / 180) * Math.PI, (315 / 180) * Math.PI])
        + random.real((-10 / 180) * Math.PI, (10 / 180) * Math.PI);
    const delta1 = { x: Math.cos(interAxisAngle) * interAxisRadius, y: Math.sin(interAxisAngle) * interAxisRadius };
    translateFloorplan(floorplan1, delta1);
    const delta2 = Geom.mult(delta1, -1);
    translateFloorplan(floorplan2, delta2);
    const m = floorplans2mesh([floorplan1, floorplan2]);
    if (!convexify && subdivide) {
        const edges = Geom.gatherEdges(m);
        const waitingList = [];
        edges.forEach((ee) => { waitingList.push(ee); });
        while (waitingList.length > 0) {
            const ee = waitingList.pop();
            const e = ee.half;
            if (ee.constrained && e.twin && Geom.edgeLength(ee) > 3000) {
                const v = Geom.splitEdgeApproximately(e, Geom.mult(Geom.plus(e.origin.pos, e.target.pos), .5));
                waitingList.push(Geom.connected(e.origin, v));
                waitingList.push(Geom.connected(v, e.target));
            }
        }
        Geom.floodFill(m);
        let e = m.north;
        for (let x = -30000; x <= 30000; x += 1500) {
            for (let y = -30000; y <= 30000; y += 1500) {
                const p = { x: x + random.integer(-400, 400), y: y + random.integer(-400, 400) };
                const f = Geom.walk(e, p);
                e = f.some;
                if (f.filled) {
                    Geom.insertVertexFromEdge(e, p);
                }
            }
        }
        Geom.delaunafy(m);
    }
    else if (convexify) {
        Geom.convexify(m);
    }
    return m;
}
exports.randomMesh = randomMesh;
function randomFloorplan(random) {
    const dim = 6;
    const size = 30000;
    const lines = randomLines(random, dim, size);
    const bites = 4;
    const pattern = randomPattern(random, dim, bites);
    const floorplan = makeFloorplan(dim, lines, pattern);
    simplifyFloorplan(floorplan);
    const desiredFillets = 1;
    let createdFillets = 0;
    let tries = 0;
    const maxTries = desiredFillets * 2;
    while (tries < maxTries && createdFillets < desiredFillets) {
        const corners = gatherStraightCorners(floorplan);
        if (corners.length == 0) {
            break;
        }
        random.shuffle(corners);
        const corner = corners[0];
        if (filletStraightCorner(floorplan, corner)) {
            createdFillets++;
        }
        tries++;
    }
    return floorplan;
}
function floorplan2mesh(floorplan) {
    return floorplans2mesh([floorplan]);
}
function floorplans2mesh(floorplans) {
    const m = Geom.mesh();
    floorplans.forEach((floorplan) => {
        floorplan.edges.forEach((e) => {
            Geom.draw(m, { p1: Geom.roundVec2(e.origin.pos), p2: Geom.roundVec2(e.target.pos) }, true, false);
        });
    });
    Geom.delaunafy(m);
    Geom.floodFill(m);
    return m;
}
function rotateFloorplan(floorplan, angle) {
    floorplan.vertices.forEach((vertex) => {
        const p = vertex.pos;
        vertex.pos = {
            x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
            y: p.x * Math.sin(angle) + p.y * Math.cos(angle)
        };
    });
}
function translateFloorplan(floorplan, delta) {
    floorplan.vertices.forEach((vertex) => {
        const p = vertex.pos;
        vertex.pos = Geom.plus(vertex.pos, delta);
    });
}
function cells2svgSolid(cells) {
    const lines = [];
    cells.forEach((column) => {
        column.forEach((cell) => {
            let clss = "floorplan-outside";
            if (cell.inside) {
                clss = "floorplan-inside";
            }
            lines.push(`<rect class="${clss}" width="${cell.width}" height="${cell.height}" x="${cell.x}" y="${cell.y}"/>`);
        });
    });
    return lines.join("\n");
}
function gatherStraightCorners(floorplan) {
    const corners = [];
    floorplan.edges.forEach((ie) => {
        if (ie.target.outgoing.size != 1) {
            return;
        }
        ie.target.outgoing.forEach((oe) => {
            if (ie.origin.pos.x == ie.target.pos.x) {
                if (oe.origin.pos.y == oe.target.pos.y) {
                    if ((ie.origin.pos.y < ie.target.pos.y && oe.origin.pos.x > oe.target.pos.x)
                        || (ie.origin.pos.y > ie.target.pos.y && oe.origin.pos.x < oe.target.pos.x)) {
                        corners.push([ie, oe]);
                    }
                }
            }
            else if (ie.origin.pos.y == ie.target.pos.y) {
                if (oe.origin.pos.x == oe.target.pos.x) {
                    if ((ie.origin.pos.x < ie.target.pos.x && oe.origin.pos.y < oe.target.pos.y)
                        || (ie.origin.pos.x > ie.target.pos.x && oe.origin.pos.y > oe.target.pos.y)) {
                        corners.push([ie, oe]);
                    }
                }
            }
        });
    });
    return corners;
}
function filletStraightCorner(floorplan, corner) {
    const [ie, oe] = corner;
    const m = floorplan2mesh(floorplan);
    const gieorigin = Geom.walkToClosestVertex(m.north, ie.origin.pos);
    if (!Geom.pointsCoincide(gieorigin.pos, ie.origin.pos)) {
        return false;
    }
    let gie = Geom.pivot(gieorigin, ie.target.pos);
    if (!Geom.pointsCoincide(gie.origin.pos, ie.origin.pos) ||
        !Geom.pointsCoincide(gie.target.pos, ie.target.pos)) {
        return false;
    }
    const goeorigin = Geom.walkToClosestVertex(m.north, oe.origin.pos);
    if (!Geom.pointsCoincide(goeorigin.pos, oe.origin.pos)) {
        return false;
    }
    let goe = Geom.pivot(goeorigin, oe.target.pos);
    if (!Geom.pointsCoincide(goe.origin.pos, oe.origin.pos) ||
        !Geom.pointsCoincide(goe.target.pos, oe.target.pos)) {
        return false;
    }
    const giel = Geom.halfEdgeLength(gie);
    const goel = Geom.halfEdgeLength(goe);
    const radius = Math.min(giel, goel);
    let stepAngle = Math.PI / 8;
    for (let c = 0; c < 6; c++) {
        if ((stepAngle * radius) < 2000) {
            break;
        }
        stepAngle = stepAngle / 2;
    }
    const angleEpsilon = stepAngle / 65536;
    let startAngle = stepAngle;
    let endAngle = (Math.PI / 2) - stepAngle;
    let center;
    let needle;
    let coneedle;
    if (giel <= goel) {
        center = Geom.plus(gie.origin.pos, Geom.rotateLeft(Geom.halfEdgeDelta(gie)));
        coneedle = Geom.minus(gie.origin.pos, center);
        needle = Geom.rotateLeft(coneedle);
        if (giel != goel) {
            startAngle -= stepAngle;
            const newoetargetpos = Geom.roundVec2(Geom.plus(center, needle));
            const newoetarget = Geom.insertVertex(m, newoetargetpos);
            if (!Geom.pointsCoincide(newoetarget.pos, newoetargetpos)) {
                return false;
            }
            goe = Geom.pivot(goe.origin, newoetargetpos);
            if (!Geom.pointsCoincide(goe.origin.pos, oe.origin.pos) ||
                !Geom.pointsCoincide(goe.target.pos, newoetargetpos)) {
                return false;
            }
        }
    }
    else {
        center = Geom.plus(goe.target.pos, Geom.rotateLeft(Geom.halfEdgeDelta(goe)));
        endAngle += stepAngle;
        needle = Geom.minus(goe.target.pos, center);
        coneedle = Geom.rotateRight(needle);
        const newieoriginpos = Geom.roundVec2(Geom.plus(center, coneedle));
        const newieorigin = Geom.insertVertex(m, newieoriginpos);
        if (!Geom.pointsCoincide(newieorigin.pos, newieoriginpos)) {
            return false;
        }
        gie = Geom.pivot(newieorigin, ie.target.pos);
        if (!Geom.pointsCoincide(gie.origin.pos, newieoriginpos) ||
            !Geom.pointsCoincide(gie.target.pos, ie.target.pos)) {
            return false;
        }
    }
    if (!gie.edge.constrained || !goe.edge.constrained) {
        return false;
    }
    try {
        Geom.flipToConnectVertices(gie.origin, goe.target);
    }
    catch (e) {
        if (!e.message || (e.message != "intersecting existing vertex" && e.message != "intersecting constrained edge")) {
            throw e;
        }
    }
    Geom.floodFill(m);
    if (!gie.left.filled || !gie.twin || gie.twin.left.filled) {
        return false;
    }
    if (goe.next.next != gie || !goe.twin || goe.twin.left.filled) {
        return false;
    }
    const filletPoints = [];
    for (let angle = startAngle; ((endAngle - angle) > -angleEpsilon); angle += stepAngle) {
        filletPoints.push(Geom.plus(Geom.plus(center, Geom.mult(needle, Math.sin(angle))), Geom.mult(coneedle, Math.cos(angle))));
    }
    // remove the corner (including, possibly, the vertex)
    removeEdge(floorplan, ie);
    removeEdge(floorplan, oe);
    if (ie.target.incoming.size == 0 && ie.target.outgoing.size == 0) {
        floorplan.vertices.delete(ie.target);
    }
    // substitute with the fillet
    let currVertex = ie.origin;
    filletPoints.forEach((p) => {
        const nextVertex = newVertex(floorplan, p);
        if (!Geom.pointsCoincide(currVertex.pos, nextVertex.pos)) {
            newEdge(floorplan, currVertex, nextVertex);
        }
        currVertex = nextVertex;
    });
    if (!Geom.pointsCoincide(currVertex.pos, oe.target.pos)) {
        newEdge(floorplan, currVertex, oe.target);
    }
    return true;
}
function newFloorplan() {
    return { edges: new Set(), vertices: new Set() };
}
function newVertex(floorplan, p) {
    const vertex = { pos: p, incoming: new Set(), outgoing: new Set() };
    floorplan.vertices.add(vertex);
    return vertex;
}
function newEdge(floorplan, origin, target) {
    if (Geom.pointsCoincide(origin.pos, target.pos)) {
        throw "origin and target coincide";
    }
    const edge = { origin: origin, target: target };
    floorplan.edges.add(edge);
    origin.outgoing.add(edge);
    target.incoming.add(edge);
}
function removeEdge(floorplan, e) {
    e.origin.outgoing.delete(e);
    e.target.incoming.delete(e);
    floorplan.edges.delete(e);
}
function simplifyFloorplan(floorplan) {
    const waitingList = [];
    const waitingSet = new Set();
    function scheduleVertex(v) {
        if (!waitingSet.has(v)) {
            waitingList.push(v);
            waitingSet.add(v);
        }
    }
    floorplan.vertices.forEach((v) => { scheduleVertex(v); });
    while (waitingList.length > 0) {
        const vertex = waitingList.pop();
        waitingSet.delete(vertex);
        const colinearPairs = [];
        vertex.incoming.forEach((ie) => {
            vertex.outgoing.forEach((oe) => {
                if (Geom.orient(ie.origin.pos, vertex.pos, oe.target.pos) == 0) {
                    colinearPairs.push([ie, oe]);
                }
            });
        });
        colinearPairs.forEach((pair) => {
            const [ie, oe] = pair;
            removeEdge(floorplan, ie);
            removeEdge(floorplan, oe);
            newEdge(floorplan, ie.origin, oe.target);
            scheduleVertex(ie.origin);
            scheduleVertex(oe.target);
        });
        if (vertex.incoming.size == 0 && vertex.outgoing.size == 0) {
            floorplan.vertices.delete(vertex);
        }
    }
}
function makeFloorplan(dim, lines, pattern) {
    const [hor, ver] = lines;
    const floorplan = newFloorplan();
    const vertexGrid = [];
    for (let h = 0; h <= dim; h++) {
        const column = [];
        vertexGrid.push(column);
        for (let v = 0; v <= dim; v++) {
            const vertex = newVertex(floorplan, { x: hor[h], y: ver[v] });
            column.push(vertex);
        }
    }
    for (let h = 0; h < dim; h++) {
        for (let v = 0; v < dim; v++) {
            if (!pattern[h][v]) {
                continue;
            }
            if (v == 0 || !(pattern[h][v - 1])) {
                newEdge(floorplan, vertexGrid[h][v], vertexGrid[h + 1][v]);
            }
            if (h == dim - 1 || !(pattern[h + 1][v])) {
                newEdge(floorplan, vertexGrid[h + 1][v], vertexGrid[h + 1][v + 1]);
            }
            if (v == dim - 1 || !(pattern[h][v + 1])) {
                newEdge(floorplan, vertexGrid[h + 1][v + 1], vertexGrid[h][v + 1]);
            }
            if (h == 0 || !(pattern[h - 1][v])) {
                newEdge(floorplan, vertexGrid[h][v + 1], vertexGrid[h][v]);
            }
        }
    }
    return floorplan;
}
function randomPattern(random, dim, bites) {
    if (dim < 6) {
        throw Error("dim must be 6 or greater");
    }
    const pattern = [];
    for (let h = 0; h < dim; h++) {
        const column = [];
        pattern.push(column);
        for (let v = 0; v < dim; v++) {
            column.push(true);
        }
    }
    for (let b = 0; b < bites; b++) {
        let h;
        let v;
        if (random.bool()) {
            // pick a corner
            if (random.bool()) {
                h = 0;
            }
            else {
                h = dim - 1;
            }
            if (random.bool()) {
                v = 0;
            }
            else {
                v = dim - 1;
            }
        }
        else if (random.bool()) {
            // pick a sidepoint
            if (random.bool()) {
                // top or bottom
                if (random.bool()) {
                    // top
                    v = 0;
                    h = 2 + random.integer(0, dim - 4);
                }
                else {
                    // bottom
                    v = dim - 1;
                    h = 2 + random.integer(0, dim - 4);
                }
            }
            else {
                // left or right
                if (random.bool()) {
                    // left
                    h = 0;
                    v = 2 + random.integer(0, dim - 4);
                }
                else {
                    // right
                    h = dim - 1;
                    v = 2 + random.integer(0, dim - 4);
                }
            }
        }
        else {
            // pick an interior point
            h = 2 + random.integer(0, dim - 4);
            v = 2 + random.integer(0, dim - 4);
        }
        for (let c = 0; c <= b; c++) {
            if (h < 0 || h > dim - 1 || v < 0 || v > dim - 1) {
                break;
            }
            if (!pattern[h][v]) {
                break;
            }
            pattern[h][v] = false;
            // step hor or ver
            if (random.bool()) {
                if (random.bool()) {
                    h -= 1;
                }
                else {
                    h += 1;
                }
            }
            else {
                if (random.bool()) {
                    v -= 1;
                }
                else {
                    v += 1;
                }
            }
        }
    }
    return pattern;
}
function randomLines(random, dim, size) {
    const halfSize = Math.round(size / 2);
    const horWeights = [];
    let totHorWeight = 0;
    for (let c = 0; c <= dim; c++) {
        const weight = random.integer(40, 200);
        horWeights.push(weight);
        totHorWeight += weight;
    }
    const hor = [];
    let x = -halfSize;
    for (let c = 0; c <= dim; c++) {
        x += size * (horWeights[c] / totHorWeight);
        hor.push(Math.round(x));
    }
    const verWeights = [];
    let totVerWeight = 0;
    for (let c = 0; c <= dim; c++) {
        const weight = horWeights[c] + random.integer(-20, 60);
        verWeights.push(weight);
        totVerWeight += weight;
    }
    const ver = [];
    let y = -halfSize;
    for (let c = 0; c <= dim; c++) {
        y += size * (verWeights[c] / totVerWeight);
        ver.push(Math.round(y));
    }
    return [hor, ver];
}
function makeCells(dim, lines, pattern) {
    const [hor, ver] = lines;
    const cells = [];
    for (let h = 0; h < dim; h++) {
        const column = [];
        cells.push(column);
        for (let v = 0; v < dim; v++) {
            const cell = {
                x: hor[h], y: ver[v],
                width: hor[h + 1] - hor[h], height: ver[v + 1] - ver[v],
                inside: pattern[h][v]
            };
            column.push(cell);
        }
    }
    return cells;
}
function cells2html(cells) {
    return `<html>
    <head>
        <title>Floorplan</title>
    </head>
    <style>
    html, body {
        height: 100%;
    }
    #floorplan-div {
        height: 100%;
        min-height: 100%;
	    display: flex;
	    flex-direction: column;
    }
    #floorplan-svg {
        display: flex;
		flex-direction: column;
        justify-content: center;
    }
    .floorplan-line {
        font-size: 12px;
        stroke-width:1;
        stroke:rgb(0,0,0);
    }
    .floorplan-inside {
        stroke:rgb(0,0,0);
        stroke-width:100;
        fill:rgb(0,0,180);
    }
    .floorplan-outside {
        fill:rgb(255,255,255);
    }    
    </style>
  </head>
  <body>
    <div id="floorplan-div">
      ${cells2svg(cells)}
    </div>
  </body>
</html>`;
}
function cells2svg(cells) {
    return `<svg viewBox="-20000 -20000 40000 40000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="floorplan-svg">
    <defs>
    </defs>
    <g id="walls-layer">
    </g>
    <g id="solid-layer">
        ${cells2svgSolid(cells)}
    </g>
</svg>`;
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(1);
const Geom = __webpack_require__(0);
function approxBisector(e, enext) {
    return Geom.lineByPointAndDir(e.target.pos, Geom.rotateRight(Geom.minus(enext.target.pos, e.origin.pos)));
}
exports.approxBisector = approxBisector;
function balancedCelestialStats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && Geom.strictlyRightOf(Geom.line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" };
        }
        e = e.twin;
        path.push(e);
    }
    let forward = false;
    let e2;
    if (forward) {
        e2 = e.next;
    }
    else {
        e2 = e.prev;
    }
    while (e !== e2) {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p)) {
            if (forward) {
                let e3 = e2.next;
                while (e2.obtuse && (++tests && Geom.leftOrOnTopOf(approxBisector(e2, e3), p))) {
                    e2 = e3;
                    e3 = e3.next;
                }
            }
            else {
                let e3 = e2.prev;
                while (e3.obtuse && (++tests && Geom.rightOrOnTopOf(approxBisector(e3, e2), p))) {
                    e2 = e3;
                    e3 = e3.prev;
                }
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" };
            }
            e = e2.twin;
            path.push(e);
            //forward = !forward
            if (forward) {
                e2 = e.next;
            }
            else {
                e2 = e.prev;
            }
        }
        else {
            if (forward) {
                e2 = e2.next;
            }
            else {
                e2 = e2.prev;
            }
        }
    }
    return { orient_tests: tests, path: path };
}
exports.balancedCelestialStats = balancedCelestialStats;
function celestialStats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && Geom.strictlyRightOf(Geom.line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" };
        }
        e = e.twin;
        path.push(e);
    }
    let e2 = e.next;
    while (e !== e2) {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p)) {
            while (e2.obtuse && (++tests && Geom.leftOrOnTopOf(Geom.approxBisectorNext(e2), p))) {
                e2 = e2.next;
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" };
            }
            e = e2.twin;
            path.push(e);
            e2 = e.next;
        }
        else {
            e2 = e2.next;
        }
    }
    return { orient_tests: tests, path: path };
}
exports.celestialStats = celestialStats;
function visibilityStats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && Geom.strictlyRightOf(Geom.line(e), p)) {
        if (!e.twin) {
            throw { geom: true, message: "out of bounds" };
        }
        e = e.twin;
        path.push(e);
    }
    let e2 = e.next;
    while (e !== e2) {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p)) {
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" };
            }
            e = e2.twin;
            path.push(e);
            e2 = e.next;
        }
        else {
            e2 = e2.next;
        }
    }
    return { orient_tests: tests, path: path };
}
exports.visibilityStats = visibilityStats;
function straightStats(einit, p1, p2) {
    let tests = 0;
    let e = einit;
    let path = [e];
    let vertexOrientCache = new Map();
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
    let vertexOrient = (v) => {
        if (!vertexOrientCache.has(v)) {
            tests++;
            vertexOrientCache.set(v, Geom.orient(p1, p2, v.pos));
        }
        return vertexOrientCache.get(v);
    };
    let vertexLeft = (v) => {
        return vertexOrient(v) >= 0;
    };
    let vertexRight = (v) => {
        return vertexOrient(v) <= 0;
    };
    let e2 = e;
    do {
        if (++tests && Geom.strictlyRightOf(Geom.line(e2), p2)) {
            while (!(vertexRight(e2.origin) && vertexLeft(e2.target))) {
                e2 = e2.next;
            }
            if (!e2.twin) {
                throw { geom: true, message: "out of bounds" };
            }
            e = e2.twin;
            path.push(e);
            e2 = e.next;
        }
        else {
            e2 = e2.next;
        }
    } while (e2 !== e);
    return { orient_tests: tests, path: path };
}
exports.straightStats = straightStats;
function stats(walkType, initEdge, p1, p2) {
    if (walkType == "Celestial") {
        return celestialStats(initEdge, p2);
    }
    else if (walkType == "Balanced Celestial") {
        return balancedCelestialStats(initEdge, p2);
    }
    else if (walkType == "Straight") {
        return straightStats(initEdge, p1, p2);
    }
    else if (walkType == "Visibility") {
        return visibilityStats(initEdge, p2);
    }
    return common_1.treatedAll(walkType);
}
exports.stats = stats;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Geom = __webpack_require__(0);
const tikzScale = 1 / 10000;
function face2tikz(face, clss) {
    const p = face.some.origin.pos;
    const words = [`    \\draw[${clss}] (${p.x * tikzScale}, ${p.y * tikzScale})`];
    Geom.gatherFaceEdges(face).forEach((e) => {
        const p = e.target.pos;
        words.push(` -- (${p.x * tikzScale}, ${p.y * tikzScale})`);
    });
    words.push(" -- cycle;");
    return words.join("");
}
exports.face2tikz = face2tikz;
function mesh2tikz(title, m, delaunayFaces, walkStats, line, showAll) {
    function drawStuff() {
        const lines = [];
        const faces = Geom.gatherFaces(m);
        faces.forEach((f) => {
            lines.push(face2tikz(f, f.filled ? "mesh_filled_face" : "mesh_face"));
        });
        const edges = Geom.gatherEdges(m);
        edges.forEach((ee) => {
            if (ee.constrained) {
                const e = ee.half;
                const p1 = e.origin.pos;
                const p2 = e.target.pos;
                lines.push(`    \\draw [mesh_constrained_edge] (${p1.x * tikzScale},${p1.y * tikzScale}) -- (${p2.x * tikzScale},${p2.y * tikzScale});`);
            }
        });
        if (delaunayFaces) {
            faces.forEach((f) => {
                if (Geom.isDelaunayTriangle(f)) {
                    lines.push(face2tikz(f, "delaunay_face"));
                }
            });
        }
        if (walkStats) {
            walkStats.path.forEach((e) => {
                const p1 = e.origin.pos;
                const p2 = e.target.pos;
                lines.push(`    \\draw [path_edge] (${p1.x * tikzScale},${p1.y * tikzScale}) -- (${p2.x * tikzScale},${p2.y * tikzScale});`);
                lines.push(face2tikz(e.left, "path_face"));
            });
        }
        if (line) {
            lines.push(`    \\draw [arrow] (${line.p1.x * tikzScale},${line.p1.y * tikzScale}) -- (${line.p2.x * tikzScale},${line.p2.y * tikzScale});`);
        }
        return lines.join('\n');
    }
    return `%\\renewcommand{\\autogeneratedfiguretitle}{${title}}
\\begin{tikzpicture}[${showAll ? "scale=.5" : ""}]
  \\tikzstyle{mesh_face}=[fill=white,draw=gray,line width=.25pt]
  \\tikzstyle{mesh_filled_face}=[fill=gray!40,draw=gray,line width=.25pt]
  \\tikzstyle{mesh_constrained_edge}=[draw=black,line width=1pt]
  \\tikzstyle{delaunay_face}=[fill=yellow,fill opacity=0.3]
  \\tikzstyle{path_face}=[fill=green,fill opacity=0.5]
  \\tikzstyle{path_edge}=[draw=magenta,draw opacity=0.5,line width=2pt]
  \\tikzstyle{arrow}=[->,draw=blue,line width=2pt,draw opacity=0.5]
  ${!showAll ? "\\draw[black,line width=1pt] (-3,-3) rectangle (3,3);" : ""}
  \\begin{scope}
    ${!showAll ? "\\clip(-3,-3) rectangle (3,3);" : ""}
    ${drawStuff()}
  \\end{scope} 
\\end{tikzpicture}`;
}
exports.mesh2tikz = mesh2tikz;
function mesh2html(title, m, delaunayFaces, walkStats, line, showAll) {
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
</html>`;
}
exports.mesh2html = mesh2html;
function face2svg(face, clss) {
    const p = face.some.origin.pos;
    const words = [`<path class="${clss}" d="M ${p.x} ${p.y}`];
    Geom.gatherFaceEdges(face).forEach((e) => {
        const p = e.target.pos;
        words.push(` L ${p.x} ${p.y}`);
    });
    words.push('"/>');
    return words.join("");
}
exports.face2svg = face2svg;
function mesh2svg(m, delaunayFaces, walkStats, line, showAll) {
    function meshFaceLayer() {
        const lines = [];
        const faces = Geom.gatherFaces(m);
        faces.forEach((f) => {
            lines.push(face2svg(f, f.filled ? "mesh-filled-face" : "mesh-face"));
        });
        return lines.join('\n');
    }
    function delaunayLayer() {
        if (!delaunayFaces) {
            return "";
        }
        const lines = [];
        Geom.gatherFaces(m).forEach((f) => {
            if (Geom.isDelaunayTriangle(f)) {
                lines.push(face2svg(f, "delaunay-face"));
            }
        });
        return lines.join('\n');
    }
    function meshLineLayer() {
        const lines = [];
        const edges = Geom.gatherEdges(m);
        edges.forEach((e) => {
            const p1 = e.half.origin.pos;
            const p2 = e.half.target.pos;
            lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="${e.constrained ? "mesh-constrained-line" : "mesh-line"}"/>`);
        });
        return lines.join('\n');
    }
    function pathLayer() {
        if (!walkStats) {
            return "";
        }
        const lines = [];
        const path = walkStats.path;
        path.forEach((e) => {
            const p1 = e.origin.pos;
            const p2 = e.target.pos;
            lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="path-edge"/>`);
            lines.push(face2svg(e.left, "path-face"));
        });
        return lines.join('\n');
    }
    function arrowLayer() {
        if (!line) {
            return "";
        }
        const p1 = line.p1;
        const p2 = line.p2;
        return `<circle cx="${p1.x}" cy="${p1.y}" r="5" id="arrow-origin"/>
            ${p2 ? `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" id="arrow" marker-end="url(#arrow-head)"/>` : ""}`;
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
</svg>`;
}
exports.mesh2svg = mesh2svg;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*jshint eqnull:true*/
(function (root) {
  "use strict";

  var GLOBAL_KEY = "Random";

  var imul = (typeof Math.imul !== "function" || Math.imul(0xffffffff, 5) !== -5 ?
    function (a, b) {
      var ah = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value
      return (al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0;
    } :
    Math.imul);

  var stringRepeat = (typeof String.prototype.repeat === "function" && "x".repeat(3) === "xxx" ?
    function (x, y) {
      return x.repeat(y);
    } : function (pattern, count) {
      var result = "";
      while (count > 0) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result;
    });

  function Random(engine) {
    if (!(this instanceof Random)) {
      return new Random(engine);
    }

    if (engine == null) {
      engine = Random.engines.nativeMath;
    } else if (typeof engine !== "function") {
      throw new TypeError("Expected engine to be a function, got " + typeof engine);
    }
    this.engine = engine;
  }
  var proto = Random.prototype;

  Random.engines = {
    nativeMath: function () {
      return (Math.random() * 0x100000000) | 0;
    },
    mt19937: (function (Int32Array) {
      // http://en.wikipedia.org/wiki/Mersenne_twister
      function refreshData(data) {
        var k = 0;
        var tmp = 0;
        for (;
          (k | 0) < 227; k = (k + 1) | 0) {
          tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
          data[k] = data[(k + 397) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
        }

        for (;
          (k | 0) < 623; k = (k + 1) | 0) {
          tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
          data[k] = data[(k - 227) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
        }

        tmp = (data[623] & 0x80000000) | (data[0] & 0x7fffffff);
        data[623] = data[396] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
      }

      function temper(value) {
        value ^= value >>> 11;
        value ^= (value << 7) & 0x9d2c5680;
        value ^= (value << 15) & 0xefc60000;
        return value ^ (value >>> 18);
      }

      function seedWithArray(data, source) {
        var i = 1;
        var j = 0;
        var sourceLength = source.length;
        var k = Math.max(sourceLength, 624) | 0;
        var previous = data[0] | 0;
        for (;
          (k | 0) > 0; --k) {
          data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x0019660d)) + (source[j] | 0) + (j | 0)) | 0;
          i = (i + 1) | 0;
          ++j;
          if ((i | 0) > 623) {
            data[0] = data[623];
            i = 1;
          }
          if (j >= sourceLength) {
            j = 0;
          }
        }
        for (k = 623;
          (k | 0) > 0; --k) {
          data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x5d588b65)) - i) | 0;
          i = (i + 1) | 0;
          if ((i | 0) > 623) {
            data[0] = data[623];
            i = 1;
          }
        }
        data[0] = 0x80000000;
      }

      function mt19937() {
        var data = new Int32Array(624);
        var index = 0;
        var uses = 0;

        function next() {
          if ((index | 0) >= 624) {
            refreshData(data);
            index = 0;
          }

          var value = data[index];
          index = (index + 1) | 0;
          uses += 1;
          return temper(value) | 0;
        }
        next.getUseCount = function() {
          return uses;
        };
        next.discard = function (count) {
          uses += count;
          if ((index | 0) >= 624) {
            refreshData(data);
            index = 0;
          }
          while ((count - index) > 624) {
            count -= 624 - index;
            refreshData(data);
            index = 0;
          }
          index = (index + count) | 0;
          return next;
        };
        next.seed = function (initial) {
          var previous = 0;
          data[0] = previous = initial | 0;

          for (var i = 1; i < 624; i = (i + 1) | 0) {
            data[i] = previous = (imul((previous ^ (previous >>> 30)), 0x6c078965) + i) | 0;
          }
          index = 624;
          uses = 0;
          return next;
        };
        next.seedWithArray = function (source) {
          next.seed(0x012bd6aa);
          seedWithArray(data, source);
          return next;
        };
        next.autoSeed = function () {
          return next.seedWithArray(Random.generateEntropyArray());
        };
        return next;
      }

      return mt19937;
    }(typeof Int32Array === "function" ? Int32Array : Array)),
    browserCrypto: (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" && typeof Int32Array === "function") ? (function () {
      var data = null;
      var index = 128;

      return function () {
        if (index >= 128) {
          if (data === null) {
            data = new Int32Array(128);
          }
          crypto.getRandomValues(data);
          index = 0;
        }

        return data[index++] | 0;
      };
    }()) : null
  };

  Random.generateEntropyArray = function () {
    var array = [];
    var engine = Random.engines.nativeMath;
    for (var i = 0; i < 16; ++i) {
      array[i] = engine() | 0;
    }
    array.push(new Date().getTime() | 0);
    return array;
  };

  function returnValue(value) {
    return function () {
      return value;
    };
  }

  // [-0x80000000, 0x7fffffff]
  Random.int32 = function (engine) {
    return engine() | 0;
  };
  proto.int32 = function () {
    return Random.int32(this.engine);
  };

  // [0, 0xffffffff]
  Random.uint32 = function (engine) {
    return engine() >>> 0;
  };
  proto.uint32 = function () {
    return Random.uint32(this.engine);
  };

  // [0, 0x1fffffffffffff]
  Random.uint53 = function (engine) {
    var high = engine() & 0x1fffff;
    var low = engine() >>> 0;
    return (high * 0x100000000) + low;
  };
  proto.uint53 = function () {
    return Random.uint53(this.engine);
  };

  // [0, 0x20000000000000]
  Random.uint53Full = function (engine) {
    while (true) {
      var high = engine() | 0;
      if (high & 0x200000) {
        if ((high & 0x3fffff) === 0x200000 && (engine() | 0) === 0) {
          return 0x20000000000000;
        }
      } else {
        var low = engine() >>> 0;
        return ((high & 0x1fffff) * 0x100000000) + low;
      }
    }
  };
  proto.uint53Full = function () {
    return Random.uint53Full(this.engine);
  };

  // [-0x20000000000000, 0x1fffffffffffff]
  Random.int53 = function (engine) {
    var high = engine() | 0;
    var low = engine() >>> 0;
    return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
  };
  proto.int53 = function () {
    return Random.int53(this.engine);
  };

  // [-0x20000000000000, 0x20000000000000]
  Random.int53Full = function (engine) {
    while (true) {
      var high = engine() | 0;
      if (high & 0x400000) {
        if ((high & 0x7fffff) === 0x400000 && (engine() | 0) === 0) {
          return 0x20000000000000;
        }
      } else {
        var low = engine() >>> 0;
        return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
      }
    }
  };
  proto.int53Full = function () {
    return Random.int53Full(this.engine);
  };

  function add(generate, addend) {
    if (addend === 0) {
      return generate;
    } else {
      return function (engine) {
        return generate(engine) + addend;
      };
    }
  }

  Random.integer = (function () {
    function isPowerOfTwoMinusOne(value) {
      return ((value + 1) & value) === 0;
    }

    function bitmask(masking) {
      return function (engine) {
        return engine() & masking;
      };
    }

    function downscaleToLoopCheckedRange(range) {
      var extendedRange = range + 1;
      var maximum = extendedRange * Math.floor(0x100000000 / extendedRange);
      return function (engine) {
        var value = 0;
        do {
          value = engine() >>> 0;
        } while (value >= maximum);
        return value % extendedRange;
      };
    }

    function downscaleToRange(range) {
      if (isPowerOfTwoMinusOne(range)) {
        return bitmask(range);
      } else {
        return downscaleToLoopCheckedRange(range);
      }
    }

    function isEvenlyDivisibleByMaxInt32(value) {
      return (value | 0) === 0;
    }

    function upscaleWithHighMasking(masking) {
      return function (engine) {
        var high = engine() & masking;
        var low = engine() >>> 0;
        return (high * 0x100000000) + low;
      };
    }

    function upscaleToLoopCheckedRange(extendedRange) {
      var maximum = extendedRange * Math.floor(0x20000000000000 / extendedRange);
      return function (engine) {
        var ret = 0;
        do {
          var high = engine() & 0x1fffff;
          var low = engine() >>> 0;
          ret = (high * 0x100000000) + low;
        } while (ret >= maximum);
        return ret % extendedRange;
      };
    }

    function upscaleWithinU53(range) {
      var extendedRange = range + 1;
      if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
        var highRange = ((extendedRange / 0x100000000) | 0) - 1;
        if (isPowerOfTwoMinusOne(highRange)) {
          return upscaleWithHighMasking(highRange);
        }
      }
      return upscaleToLoopCheckedRange(extendedRange);
    }

    function upscaleWithinI53AndLoopCheck(min, max) {
      return function (engine) {
        var ret = 0;
        do {
          var high = engine() | 0;
          var low = engine() >>> 0;
          ret = ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
        } while (ret < min || ret > max);
        return ret;
      };
    }

    return function (min, max) {
      min = Math.floor(min);
      max = Math.floor(max);
      if (min < -0x20000000000000 || !isFinite(min)) {
        throw new RangeError("Expected min to be at least " + (-0x20000000000000));
      } else if (max > 0x20000000000000 || !isFinite(max)) {
        throw new RangeError("Expected max to be at most " + 0x20000000000000);
      }

      var range = max - min;
      if (range <= 0 || !isFinite(range)) {
        return returnValue(min);
      } else if (range === 0xffffffff) {
        if (min === 0) {
          return Random.uint32;
        } else {
          return add(Random.int32, min + 0x80000000);
        }
      } else if (range < 0xffffffff) {
        return add(downscaleToRange(range), min);
      } else if (range === 0x1fffffffffffff) {
        return add(Random.uint53, min);
      } else if (range < 0x1fffffffffffff) {
        return add(upscaleWithinU53(range), min);
      } else if (max - 1 - min === 0x1fffffffffffff) {
        return add(Random.uint53Full, min);
      } else if (min === -0x20000000000000 && max === 0x20000000000000) {
        return Random.int53Full;
      } else if (min === -0x20000000000000 && max === 0x1fffffffffffff) {
        return Random.int53;
      } else if (min === -0x1fffffffffffff && max === 0x20000000000000) {
        return add(Random.int53, 1);
      } else if (max === 0x20000000000000) {
        return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
      } else {
        return upscaleWithinI53AndLoopCheck(min, max);
      }
    };
  }());
  proto.integer = function (min, max) {
    return Random.integer(min, max)(this.engine);
  };

  // [0, 1] (floating point)
  Random.realZeroToOneInclusive = function (engine) {
    return Random.uint53Full(engine) / 0x20000000000000;
  };
  proto.realZeroToOneInclusive = function () {
    return Random.realZeroToOneInclusive(this.engine);
  };

  // [0, 1) (floating point)
  Random.realZeroToOneExclusive = function (engine) {
    return Random.uint53(engine) / 0x20000000000000;
  };
  proto.realZeroToOneExclusive = function () {
    return Random.realZeroToOneExclusive(this.engine);
  };

  Random.real = (function () {
    function multiply(generate, multiplier) {
      if (multiplier === 1) {
        return generate;
      } else if (multiplier === 0) {
        return function () {
          return 0;
        };
      } else {
        return function (engine) {
          return generate(engine) * multiplier;
        };
      }
    }

    return function (left, right, inclusive) {
      if (!isFinite(left)) {
        throw new RangeError("Expected left to be a finite number");
      } else if (!isFinite(right)) {
        throw new RangeError("Expected right to be a finite number");
      }
      return add(
        multiply(
          inclusive ? Random.realZeroToOneInclusive : Random.realZeroToOneExclusive,
          right - left),
        left);
    };
  }());
  proto.real = function (min, max, inclusive) {
    return Random.real(min, max, inclusive)(this.engine);
  };

  Random.bool = (function () {
    function isLeastBitTrue(engine) {
      return (engine() & 1) === 1;
    }

    function lessThan(generate, value) {
      return function (engine) {
        return generate(engine) < value;
      };
    }

    function probability(percentage) {
      if (percentage <= 0) {
        return returnValue(false);
      } else if (percentage >= 1) {
        return returnValue(true);
      } else {
        var scaled = percentage * 0x100000000;
        if (scaled % 1 === 0) {
          return lessThan(Random.int32, (scaled - 0x80000000) | 0);
        } else {
          return lessThan(Random.uint53, Math.round(percentage * 0x20000000000000));
        }
      }
    }

    return function (numerator, denominator) {
      if (denominator == null) {
        if (numerator == null) {
          return isLeastBitTrue;
        }
        return probability(numerator);
      } else {
        if (numerator <= 0) {
          return returnValue(false);
        } else if (numerator >= denominator) {
          return returnValue(true);
        }
        return lessThan(Random.integer(0, denominator - 1), numerator);
      }
    };
  }());
  proto.bool = function (numerator, denominator) {
    return Random.bool(numerator, denominator)(this.engine);
  };

  function toInteger(value) {
    var number = +value;
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }

  function convertSliceArgument(value, length) {
    if (value < 0) {
      return Math.max(value + length, 0);
    } else {
      return Math.min(value, length);
    }
  }
  Random.pick = function (engine, array, begin, end) {
    var length = array.length;
    var start = begin == null ? 0 : convertSliceArgument(toInteger(begin), length);
    var finish = end === void 0 ? length : convertSliceArgument(toInteger(end), length);
    if (start >= finish) {
      return void 0;
    }
    var distribution = Random.integer(start, finish - 1);
    return array[distribution(engine)];
  };
  proto.pick = function (array, begin, end) {
    return Random.pick(this.engine, array, begin, end);
  };

  function returnUndefined() {
    return void 0;
  }
  var slice = Array.prototype.slice;
  Random.picker = function (array, begin, end) {
    var clone = slice.call(array, begin, end);
    if (!clone.length) {
      return returnUndefined;
    }
    var distribution = Random.integer(0, clone.length - 1);
    return function (engine) {
      return clone[distribution(engine)];
    };
  };

  Random.shuffle = function (engine, array, downTo) {
    var length = array.length;
    if (length) {
      if (downTo == null) {
        downTo = 0;
      }
      for (var i = (length - 1) >>> 0; i > downTo; --i) {
        var distribution = Random.integer(0, i);
        var j = distribution(engine);
        if (i !== j) {
          var tmp = array[i];
          array[i] = array[j];
          array[j] = tmp;
        }
      }
    }
    return array;
  };
  proto.shuffle = function (array) {
    return Random.shuffle(this.engine, array);
  };

  Random.sample = function (engine, population, sampleSize) {
    if (sampleSize < 0 || sampleSize > population.length || !isFinite(sampleSize)) {
      throw new RangeError("Expected sampleSize to be within 0 and the length of the population");
    }

    if (sampleSize === 0) {
      return [];
    }

    var clone = slice.call(population);
    var length = clone.length;
    if (length === sampleSize) {
      return Random.shuffle(engine, clone, 0);
    }
    var tailLength = length - sampleSize;
    return Random.shuffle(engine, clone, tailLength - 1).slice(tailLength);
  };
  proto.sample = function (population, sampleSize) {
    return Random.sample(this.engine, population, sampleSize);
  };

  Random.die = function (sideCount) {
    return Random.integer(1, sideCount);
  };
  proto.die = function (sideCount) {
    return Random.die(sideCount)(this.engine);
  };

  Random.dice = function (sideCount, dieCount) {
    var distribution = Random.die(sideCount);
    return function (engine) {
      var result = [];
      result.length = dieCount;
      for (var i = 0; i < dieCount; ++i) {
        result[i] = distribution(engine);
      }
      return result;
    };
  };
  proto.dice = function (sideCount, dieCount) {
    return Random.dice(sideCount, dieCount)(this.engine);
  };

  // http://en.wikipedia.org/wiki/Universally_unique_identifier
  Random.uuid4 = (function () {
    function zeroPad(string, zeroCount) {
      return stringRepeat("0", zeroCount - string.length) + string;
    }

    return function (engine) {
      var a = engine() >>> 0;
      var b = engine() | 0;
      var c = engine() | 0;
      var d = engine() >>> 0;

      return (
        zeroPad(a.toString(16), 8) +
        "-" +
        zeroPad((b & 0xffff).toString(16), 4) +
        "-" +
        zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
        "-" +
        zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
        "-" +
        zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
        zeroPad(d.toString(16), 8));
    };
  }());
  proto.uuid4 = function () {
    return Random.uuid4(this.engine);
  };

  Random.string = (function () {
    // has 2**x chars, for faster uniform distribution
    var DEFAULT_STRING_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

    return function (pool) {
      if (pool == null) {
        pool = DEFAULT_STRING_POOL;
      }

      var length = pool.length;
      if (!length) {
        throw new Error("Expected pool not to be an empty string");
      }

      var distribution = Random.integer(0, length - 1);
      return function (engine, length) {
        var result = "";
        for (var i = 0; i < length; ++i) {
          var j = distribution(engine);
          result += pool.charAt(j);
        }
        return result;
      };
    };
  }());
  proto.string = function (length, pool) {
    return Random.string(pool)(this.engine, length);
  };

  Random.hex = (function () {
    var LOWER_HEX_POOL = "0123456789abcdef";
    var lowerHex = Random.string(LOWER_HEX_POOL);
    var upperHex = Random.string(LOWER_HEX_POOL.toUpperCase());

    return function (upper) {
      if (upper) {
        return upperHex;
      } else {
        return lowerHex;
      }
    };
  }());
  proto.hex = function (length, upper) {
    return Random.hex(upper)(this.engine, length);
  };

  Random.date = function (start, end) {
    if (!(start instanceof Date)) {
      throw new TypeError("Expected start to be a Date, got " + typeof start);
    } else if (!(end instanceof Date)) {
      throw new TypeError("Expected end to be a Date, got " + typeof end);
    }
    var distribution = Random.integer(start.getTime(), end.getTime());
    return function (engine) {
      return new Date(distribution(engine));
    };
  };
  proto.date = function (start, end) {
    return Random.date(start, end)(this.engine);
  };

  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return Random;
    }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof module !== "undefined" && typeof require === "function") {
    module.exports = Random;
  } else {
    (function () {
      var oldGlobal = root[GLOBAL_KEY];
      Random.noConflict = function () {
        root[GLOBAL_KEY] = oldGlobal;
        return this;
      };
    }());
    root[GLOBAL_KEY] = Random;
  }
}(this));

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map