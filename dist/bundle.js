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
const svg_preamble = `
<svg viewBox="-210 -210 420 420" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
    <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
        </marker>
    </defs>
    <g id="mesh-layer">`;
const svg_postamble = `
    </g>
    <g id="path-layer">
    </g>    
    <g id="arrow-layer">
    </g>
</svg>`;
function mesh2svg(m) {
    const lines = [svg_preamble];
    let edges = Geom.gather_edges(m);
    edges.forEach((e) => {
        const p1 = e.half.origin.pos;
        const p2 = e.half.target.pos;
        lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="mesh-line"/>');
    });
    lines.push(svg_postamble);
    return lines.join("\n");
}
function random_pos() {
    let x = Math.floor(Math.random() * 800) - 400;
    let y = Math.floor(Math.random() * 800) - 400;
    return { x: x, y: y };
}
function random_mesh(mesh_type) {
    let m = Geom.mesh();
    Geom.triangulate_mesh(m);
    for (var i = 1; i <= 200; i++) {
        Geom.insert_vertex(m, random_pos());
    }
    if (mesh_type == "Delaunay") {
        Geom.delaunafy(m);
    }
    else if (mesh_type == "Convex") {
        Geom.convexify(m);
    }
    else if (mesh_type == "Thin") {
        // Do nothing
    }
    return m;
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
    currMeshType = meshType;
    currMesh = random_mesh(currMeshType);
    let meshDIV = document.getElementById("mesh-div");
    meshDIV.innerHTML = mesh2svg(currMesh);
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
    let sm = meshSVG.getScreenCTM().inverse();
    return { x: Math.round((sm.a * x) + (sm.c * y) + sm.e), y: Math.round((sm.b * x) + (sm.d * y) + sm.f) };
}
let currPathInitFace = null;
let currWalkStats = null;
function updatePath() {
    if (currPathInitFace === null || arrowOrigin === null || arrowTarget === null) {
        return;
    }
    if (currWalkType == "Celestial") {
        currWalkStats = Geom.celestial_walk_stats(currPathInitFace.some, arrowTarget);
    }
    else if (currWalkType == "Straight") {
        currWalkStats = Geom.straight_walk_stats(currPathInitFace.some, arrowOrigin, arrowTarget);
    }
    else if (currWalkType == "Visibility") {
        currWalkStats = Geom.visibility_walk_stats(currPathInitFace.some, arrowTarget);
    }
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
function face2svg(face) {
    const p = face.some.origin.pos;
    const words = ['<path class="path-face" d="M ' + p.x + ' ' + p.y];
    Geom.gather_face_edges(face).forEach((e) => {
        const p = e.target.pos;
        words.push(" L " + p.x + " " + p.y);
    });
    words.push('"/>');
    return words.join("");
}
function drawPath() {
    if (!pathLayer) {
        return;
    }
    let lines = [];
    if (currPathInitFace !== null) {
        lines.push(face2svg(currPathInitFace));
    }
    if (currWalkStats !== null) {
        const currPath = currWalkStats.path;
        currPath.forEach((e) => {
            if (e.left !== currPathInitFace) {
                const p1 = e.origin.pos;
                const p2 = e.target.pos;
                lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>');
                lines.push(face2svg(e.left));
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
function strictly_right_of(l, p) {
    return orient(l.p1, l.p2, p) < 0;
}
exports.strictly_right_of = strictly_right_of;
function right_or_on_top_of(l, p) {
    return orient(l.p1, l.p2, p) <= 0;
}
exports.right_or_on_top_of = right_or_on_top_of;
function on_line(l, p) {
    return orient(l.p1, l.p2, p) == 0;
}
exports.on_line = on_line;
function on_point(p1, p2) {
    return p1.x == p2.x && p1.y == p2.y;
}
exports.on_point = on_point;
function strictly_left_of(l, p) {
    return orient(l.p1, l.p2, p) > 0;
}
exports.strictly_left_of = strictly_left_of;
function left_or_on_top_of(l, p) {
    return orient(l.p1, l.p2, p) >= 0;
}
exports.left_or_on_top_of = left_or_on_top_of;
function line(e) {
    return { p1: e.origin.pos, p2: e.target.pos };
}
exports.line = line;
function line_by_point_and_dir(p, dir) {
    return { p1: p, p2: plus(p, dir) };
}
exports.line_by_point_and_dir = line_by_point_and_dir;
function rotate_left(v) {
    return { x: -v.y, y: v.x };
}
exports.rotate_left = rotate_left;
function rotate_right(v) {
    return { x: v.y, y: -v.x };
}
exports.rotate_right = rotate_right;
function plus(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
exports.plus = plus;
function minus(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
exports.minus = minus;
function approx_bisector_next(e2) {
    let e3 = e2.next;
    return line_by_point_and_dir(e2.target.pos, rotate_right(minus(e3.target.pos, e2.origin.pos)));
}
exports.approx_bisector_next = approx_bisector_next;
function set_obtuseness(e2) {
    let e3 = e2.next;
    e2.obtuse = strictly_right_of(line_by_point_and_dir(e2.target.pos, rotate_left(minus(e2.target.pos, e2.origin.pos))), e3.target.pos);
}
exports.set_obtuseness = set_obtuseness;
function gather_half_edges(m) {
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
exports.gather_half_edges = gather_half_edges;
function gather_edges(m) {
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
exports.gather_edges = gather_edges;
function gather_faces(m) {
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
exports.gather_faces = gather_faces;
function gather_face_edges(f) {
    let edges = [];
    let e = f.some;
    let e2 = e;
    do {
        edges.push(e2);
        e2 = e2.next;
    } while (e2 !== e);
    return edges;
}
exports.gather_face_edges = gather_face_edges;
function triangulate_mesh(m) {
    gather_faces(m).forEach((f) => { triangulate_face(f); });
}
exports.triangulate_mesh = triangulate_mesh;
function delete_edge(e) {
    // e.twin must be defined 
    // e.left must be triangle
    e.prev.left = e.twin.left;
    e.next.left = e.twin.left;
    e.twin.prev.next = e.next;
    e.twin.next.prev = e.prev;
    e.next.prev = e.twin.prev;
    e.prev.next = e.twin.next;
    e.twin.left.some = e.next;
    obtussle(e.prev);
    obtussle(e.twin.prev);
}
exports.delete_edge = delete_edge;
function kink_left_next(e) {
    let e2 = e.next;
    return strictly_left_of(line(e), e2.target.pos);
}
exports.kink_left_next = kink_left_next;
function triangulate_face(f) {
    let e = f.some;
    let e2 = e.next;
    while (e2.next !== e.prev) {
        while (!kink_left_next(e)) {
            e = e.next;
        }
        e = cut_peak(e);
        e2 = e.next;
    }
}
exports.triangulate_face = triangulate_face;
function obtussle(e) {
    set_obtuseness(e);
    set_obtuseness(e.prev);
}
function cut_peak(e) {
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
    obtussle(e3);
    obtussle(e3i);
    return e3i;
}
exports.cut_peak = cut_peak;
function grow_edge(e, p) {
    // p must be in e.left, (e.origin, p) and (e.target, p) must not intersect anything
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
    obtussle(e2);
    obtussle(e3);
    obtussle(e2i);
    obtussle(e3i);
    triangulate_face(e3i.left);
    return v;
}
exports.grow_edge = grow_edge;
function flipable_edge(e) {
    // e.left and e.twin.left must be triangles
    // returns true iff e is the diagonal of a convex quadrilateral with no co-linear sides
    return strictly_left_of(line(e.twin.prev), e.next.target.pos)
        && strictly_left_of(line(e.twin.next), e.next.target.pos);
}
exports.flipable_edge = flipable_edge;
function flip_edge(e) {
    // e must be diagonal of convex quadrilateral with no co-linear sides
    let eprev = e.prev;
    delete_edge(e);
    return cut_peak(eprev);
}
exports.flip_edge = flip_edge;
function insert_vertex(m, p) {
    return insert_vertex_from_edge(m.north, p);
}
exports.insert_vertex = insert_vertex;
function insert_vertex_from_edge(e, p) {
    // pre: m must be triangular
    // post: m will be triangular with vertex at p
    let split_edge = (esplit, estay) => {
        // p must be properly on esplit, estay.next == esplit
        delete_edge(esplit);
        return grow_edge(estay, p);
    };
    let f = walk(e, p);
    let e1 = f.some;
    let e2 = e1.next;
    let e3 = e2.next;
    if (on_point(e1.origin.pos, p)) {
        return e1.origin;
    }
    if (on_point(e2.origin.pos, p)) {
        return e2.origin;
    }
    if (on_point(e3.origin.pos, p)) {
        return e3.origin;
    }
    if (on_line(line(e1), p)) {
        return split_edge(e1, e3);
    }
    if (on_line(line(e2), p)) {
        return split_edge(e2, e1);
    }
    if (on_line(line(e3), p)) {
        return split_edge(e3, e2);
    }
    // split face
    return grow_edge(e1, p);
}
exports.insert_vertex_from_edge = insert_vertex_from_edge;
function walk(einit, p) {
    let e = einit;
    if (strictly_right_of(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds");
        }
        e = e.twin;
    }
    let e2 = e.next;
    while (e !== e2) {
        if (strictly_right_of(line(e2), p)) {
            while (e2.obtuse && left_or_on_top_of(approx_bisector_next(e2), p)) {
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
    let waiting_set = gather_edges(m);
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
            if (flipable_edge(e)) {
                e = flip_edge(e);
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
    let triangles = gather_faces(m);
    let waiting = [];
    let deleted = (e) => {
        if (e.twin
            && left_or_on_top_of(line(e.twin.prev), e.next.target.pos)
            && left_or_on_top_of(line(e.twin.next), e.next.target.pos)) {
            triangles.delete(e.left);
            triangles.delete(e.twin.left);
            delete_edge(e);
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
function celestial_walk_stats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && strictly_right_of(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds");
        }
        e = e.twin;
        path.push(e);
    }
    let e2 = e.next;
    while (e !== e2) {
        if (++tests && strictly_right_of(line(e2), p)) {
            while (e2.obtuse && (++tests && left_or_on_top_of(approx_bisector_next(e2), p))) {
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
exports.celestial_walk_stats = celestial_walk_stats;
function visibility_walk_stats(einit, p) {
    let tests = 0;
    let e = einit;
    let path = [e];
    if (++tests && strictly_right_of(line(e), p)) {
        if (!e.twin) {
            throw Error("out of bounds");
        }
        e = e.twin;
        path.push(e);
    }
    let e2 = e.next;
    while (e !== e2) {
        if (++tests && strictly_right_of(line(e2), p)) {
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
exports.visibility_walk_stats = visibility_walk_stats;
function straight_walk_stats(einit, p1, p2) {
    let tests = 0;
    let e = einit;
    let path = [e];
    let orientMap = new Map();
    let vertexOrient = (v) => {
        if (!orientMap.has(v)) {
            tests++;
            orientMap.set(v, orient(p1, p2, v.pos));
        }
        return orientMap.get(v);
    };
    let vertexLeft = (v) => {
        return vertexOrient(v) >= 0;
    };
    let vertexRight = (v) => {
        return vertexOrient(v) <= 0;
    };
    let e2 = e;
    do {
        if (++tests && strictly_right_of(line(e2), p2)) {
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
exports.straight_walk_stats = straight_walk_stats;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map