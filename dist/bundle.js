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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Geom = __webpack_require__(1);
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
    document.getElementById("warning-span").innerHTML = '';
    document.getElementById("select-mesh").classList.remove("warning");
    document.getElementById("select-walk").classList.remove("warning");
    if (currWalkType == "Visibility" && (meshType == "Thin" || meshType == "Convex")) {
        document.getElementById("warning-span").innerHTML = 'May loop!';
        document.getElementById("select-walk").classList.add("warning");
    }
    currMeshType = meshType;
    currMesh = Geom.randomMesh(currMeshType);
    let meshDIV = document.getElementById("mesh-div");
    meshDIV.innerHTML = Geom.mesh2svg(currMesh);
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
    currWalkStats = Geom.walkStats(currWalkType, currPathInitFace.some, arrowOrigin, arrowTarget);
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
    let lines = [];
    if (currPathInitFace !== null) {
        lines.push(Geom.face2svg(currPathInitFace));
    }
    if (currWalkStats !== null) {
        const currPath = currWalkStats.path;
        currPath.forEach((e) => {
            if (e.left !== currPathInitFace) {
                const p1 = e.origin.pos;
                const p2 = e.target.pos;
                lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>');
                lines.push(Geom.face2svg(e.left));
            }
        });
        const currOrientTests = currWalkStats.orient_tests;
        lines.push('<text x="-180" y="-180" class="path-stats-text">faces: ' + currPath.length + ', orientation tests: ' + currOrientTests + "</text>");
    }
    pathLayer.innerHTML = lines.join("\n");
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
    document.getElementById("warning-span").innerHTML = '';
    document.getElementById("select-mesh").classList.remove("warning");
    document.getElementById("select-walk").classList.remove("warning");
    if (walkType == "Visibility" && (currMeshType == "Thin" || currMeshType == "Convex")) {
        document.getElementById("warning-span").innerHTML = 'May loop!';
        document.getElementById("select-mesh").classList.add("warning");
    }
    currWalkType = walkType;
    updatePath();
}
document.getElementById("select-mesh").addEventListener("change", selectMeshHandler);
document.getElementById("select-walk").addEventListener("change", selectWalkHandler);
selectMesh((document.getElementById("select-mesh")).value);
selectWalk((document.getElementById("select-walk")).value);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function mesh() {
    let nw = { pos: { x: -402, y: +402 } };
    let ne = { pos: { x: +402, y: +402 } };
    let se = { pos: { x: +402, y: -402 } };
    let sw = { pos: { x: -402, y: -402 } };
    let n = { obtuse: false, origin: ne, target: nw };
    let e = { obtuse: false, origin: se, target: ne };
    let s = { obtuse: false, origin: sw, target: se };
    let w = { obtuse: false, origin: nw, target: sw };
    let nn = { half: n };
    n.edge = nn;
    let ee = { half: e };
    e.edge = ee;
    let ss = { half: s };
    s.edge = ss;
    let ww = { half: w };
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
    let f = { some: n };
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
function approxBisectorNext(e2) {
    let e3 = e2.next;
    return lineByPointAndDir(e2.target.pos, rotateRight(minus(e3.target.pos, e2.origin.pos)));
}
exports.approxBisectorNext = approxBisectorNext;
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
function kinkLeftNext(e) {
    let e2 = e.next;
    return strictlyLeftOf(line(e), e2.target.pos);
}
exports.kinkLeftNext = kinkLeftNext;
function triangulateFace(f) {
    let e = f.some;
    let e2 = e.next;
    while (e2.next !== e.prev) {
        while (!kinkLeftNext(e)) {
            e = e.next;
        }
        e = cutPeak(e);
        e2 = e.next;
    }
}
exports.triangulateFace = triangulateFace;
function precomputeObtusenessForNewHalfEdge(e) {
    precomputeObtuseness(e);
    precomputeObtuseness(e.prev);
}
function cutPeak(e) {
    // angle(e, e.next) must kink left
    let e2 = e.next;
    let e3 = { origin: e2.target, target: e.origin, prev: e2, next: e };
    let e3i = { origin: e3.target, target: e3.origin, prev: e.prev, next: e2.next, twin: e3, left: e.left };
    let ee3 = { half: e3 };
    e3.edge = ee3;
    e3i.edge = ee3;
    e.prev.next = e3i;
    e2.next.prev = e3i;
    e3.twin = e3i;
    e.prev = e3;
    e2.next = e3;
    let ff = { some: e3 };
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
    let e2 = { origin: e.target, target: v, prev: e };
    let e3 = { origin: v, target: e.origin, prev: e2, next: e };
    e2.next = e3;
    v.outgoing = e3;
    let e2i = { origin: v, target: e.target, next: e.next, left: e.left, twin: e2 };
    e2.twin = e2i;
    let e3i = { origin: e.origin, target: v, prev: e.prev, next: e2i, left: e.left, twin: e3 };
    e2i.prev = e3i;
    e3.twin = e3i;
    e.left.some = e3i;
    let ee2 = { half: e2 };
    e2.edge = ee2;
    e2i.edge = ee2;
    let ee3 = { half: e3 };
    e3.edge = ee3;
    e3i.edge = ee3;
    e.next.prev = e2i;
    e.prev.next = e3i;
    e.next = e2;
    e.prev = e3;
    let ff = { some: e };
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
    // returns true iff e is the diagonal of a convex quadrilateral with no co-linear sides
    return strictlyLeftOf(line(e.twin.prev), e.next.target.pos)
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
function insertVertexFromEdge(e, p) {
    // pre: m must be triangular
    // post: m will be triangular with vertex at p
    let split_edge = (esplit, estay) => {
        // p must be properly on esplit, estay.next == esplit
        deleteEdge(esplit);
        return growEdge(estay, p);
    };
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
        return split_edge(e1, e3);
    }
    if (onLine(line(e2), p)) {
        return split_edge(e2, e1);
    }
    if (onLine(line(e3), p)) {
        return split_edge(e3, e2);
    }
    // split face
    return growEdge(e1, p);
}
exports.insertVertexFromEdge = insertVertexFromEdge;
function walk(einit, p) {
    let e = einit;
    if (strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds");
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
                throw Error("out of bounds");
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
function delaunafy(m) {
    // pre: m must be triangular
    // post: m will be triangular and maximally delaunay
    let waiting_set = gatherEdges(m);
    let waiting_list = [];
    waiting_set.forEach((ee) => { waiting_list.push(ee); });
    let queue = (ee) => {
        if (!waiting_set.has(ee)) {
            waiting_list.push(ee);
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
            if (flipableEdge(e)) { // <-- defensive
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
function convexify(m) {
    // pre: m must be triangular
    // post: m will (almost certainly?) no longer be triangular but still convex
    delaunafy(m);
    let triangles = gatherFaces(m);
    let waiting = [];
    let deleted = (e) => {
        if (e.twin
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
function celestialWalkStats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds");
        }
        e = e.twin;
        path.push(e);
    }
    let e2 = e.next;
    while (e !== e2) {
        if (++tests && strictlyRightOf(line(e2), p)) {
            while (e2.obtuse && (++tests && leftOrOnTopOf(approxBisectorNext(e2), p))) {
                e2 = e2.next;
            }
            if (!e2.twin) {
                throw Error("out of bounds");
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
exports.celestialWalkStats = celestialWalkStats;
function visibilityWalkStats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && strictlyRightOf(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds");
        }
        e = e.twin;
        path.push(e);
    }
    let e2 = e.next;
    while (e !== e2) {
        if (++tests && strictlyRightOf(line(e2), p)) {
            if (!e2.twin) {
                throw Error("out of bounds");
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
exports.visibilityWalkStats = visibilityWalkStats;
function straightWalkStats(einit, p1, p2) {
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
            vertexOrientCache.set(v, orient(p1, p2, v.pos));
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
        if (++tests && strictlyRightOf(line(e2), p2)) {
            while (!(vertexRight(e2.origin) && vertexLeft(e2.target))) {
                e2 = e2.next;
            }
            if (!e2.twin) {
                throw Error("out of bounds");
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
exports.straightWalkStats = straightWalkStats;
function walkStats(walkType, initEdge, p1, p2) {
    if (walkType == "Celestial") {
        return celestialWalkStats(initEdge, p2);
    }
    else if (walkType == "Straight") {
        return straightWalkStats(initEdge, p1, p2);
    }
    // (walkType == "Visibility")
    return visibilityWalkStats(initEdge, p2);
}
exports.walkStats = walkStats;
const html_preamble = `
<html>
  <head>
    <title>`;
const html_2amble = `
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
    .mesh-line {
        stroke-width:1;
        stroke:rgb(200,200,200);
    }
    #arrow {
        stroke-width:2;
        stroke:rgb(0,0,200);
    }
    #arrow-head {
        fill:rgb(0,0,200);
    }
    #arrow-origin {
        fill:rgb(0,0,200);
    }
    .path-face {
        fill:rgba(100, 200, 100,0.5);
    }
    .path-edge {
        stroke-width:3;
        stroke:rgba(150,0,200,0.5); 
    }
    </style>
  </head>
  <body>
    <div id="mesh-div">`;
const html_postamble = `
    </div>
  </body>
</html>`;
function mesh2html(title, m, walkStats, line) {
    const lines = [html_preamble];
    lines.push(title);
    lines.push(html_2amble);
    lines.push(mesh2svg(m, walkStats, line));
    lines.push(html_postamble);
    return lines.join("\n");
}
exports.mesh2html = mesh2html;
const svg_preamble = `
<svg viewBox="-210 -210 420 420" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
    <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
        </marker>
    </defs>
    <g id="mesh-layer">`;
const svg_2amble = `
    </g>
    <g id="path-layer">`;
const svg_3amble = `
    </g>
    <g id="arrow-layer">`;
const svg_postamble = `
    </g>
</svg>`;
function mesh2svg(m, walkStats, line) {
    const lines = [svg_preamble];
    let edges = gatherEdges(m);
    edges.forEach((e) => {
        const p1 = e.half.origin.pos;
        const p2 = e.half.target.pos;
        lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="mesh-line"/>');
    });
    lines.push(svg_2amble);
    if (walkStats) {
        const path = walkStats.path;
        path.forEach((e) => {
            const p1 = e.origin.pos;
            const p2 = e.target.pos;
            lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>');
            lines.push(face2svg(e.left));
        });
    }
    lines.push(svg_3amble);
    if (line) {
        const p1 = line.p1;
        const p2 = line.p2;
        lines.push('<circle cx="' + p1.x + '" cy="' + p1.y + '" r="5" id="arrow-origin"/>');
        if (p2 !== undefined) {
            lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" id="arrow" marker-end="url(#arrow-head)"/>');
        }
    }
    lines.push(svg_postamble);
    return lines.join("\n");
}
exports.mesh2svg = mesh2svg;
function face2svg(face) {
    const p = face.some.origin.pos;
    const words = ['<path class="path-face" d="M ' + p.x + ' ' + p.y];
    gatherFaceEdges(face).forEach((e) => {
        const p = e.target.pos;
        words.push(" L " + p.x + " " + p.y);
    });
    words.push('"/>');
    return words.join("");
}
exports.face2svg = face2svg;
function randomPoint() {
    let x = Math.floor(Math.random() * 800) - 400;
    let y = Math.floor(Math.random() * 800) - 400;
    return { x: x, y: y };
}
exports.randomPoint = randomPoint;
function randomPointCloud(n) {
    const pointCloud = [];
    for (var i = 0; i < n; i++) {
        pointCloud.push(randomPoint());
    }
    return pointCloud;
}
exports.randomPointCloud = randomPointCloud;
function randomMesh(meshType) {
    return meshFromPointCloud(meshType, randomPointCloud(200));
}
exports.randomMesh = randomMesh;
function meshFromPointCloud(meshType, pointCloud) {
    let m = mesh();
    triangulateMesh(m);
    pointCloud.forEach((p) => {
        insertVertex(m, p);
    });
    if (meshType == "Delaunay") {
        delaunafy(m);
    }
    else if (meshType == "Convex") {
        convexify(m);
    }
    else if (meshType == "Thin") {
        // Do nothing
    }
    return m;
}
exports.meshFromPointCloud = meshFromPointCloud;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map