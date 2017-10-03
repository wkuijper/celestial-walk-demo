import * as Geom from './geom';

type MeshType = "Convex"|"Thin"|"Delaunay"
type WalkType = "Straight"|"Visibility"|"Celestial"

const svg_preamble = `
<svg viewBox="-210 -210 420 420" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
    <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
        </marker>
    </defs>
    <g id="mesh-layer">`
const svg_postamble = `
    </g>
    <g id="path-layer">
    </g>    
    <g id="arrow-layer">
    </g>
</svg>`

function mesh2svg(m: Geom.Mesh): string {
    const lines: [string] = [svg_preamble]

    let edges = Geom.gather_edges(m)
    edges.forEach((e) => {
        const p1 = e.half.origin.pos
        const p2 = e.half.target.pos
        lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="mesh-line"/>')
    })

    lines.push(svg_postamble)

    return lines.join("\n")
}

function random_pos(): Geom.Vec2 {
    let x: number = Math.floor(Math.random() * 800) - 400;
    let y: number = Math.floor(Math.random() * 800) - 400;
    return { x: x, y: y }
}

function random_mesh(mesh_type: MeshType): Geom.Mesh {
    let m = Geom.mesh()

    Geom.triangulate_mesh(m)

    for (var i = 1; i <= 200; i++) {
        Geom.insert_vertex(m, random_pos())
    }

    
    if (mesh_type == "Delaunay") {
        Geom.delaunafy(m)
    } else if (mesh_type == "Convex") {
        Geom.convexify(m)
    } else if (mesh_type == "Thin") {
        // Do nothing
    }

    return m
}

let currMesh: Geom.Mesh|undefined
let currMeshType: MeshType|undefined

function selectMeshHandler(this: HTMLElement, ev: Event) {
    selectMesh(<MeshType>(<HTMLSelectElement>this).value)
}

let meshSVG: SVGSVGElement;
let arrowLayer: SVGGElement|undefined;
let arrowOrigin: Geom.Vec2|null = null;
let arrowTarget: Geom.Vec2|null = null;
let pathLayer: SVGGElement|undefined;

function selectMesh(meshType: MeshType) {
    if (currMeshType && meshType == currMeshType) {
        return
    }
    currMeshType = <MeshType>meshType
    currMesh = random_mesh(currMeshType)
    let meshDIV = document.getElementById("mesh-div")!
    meshDIV.innerHTML = mesh2svg(currMesh)

    meshSVG = document.getElementById("mesh-svg")! as any as SVGSVGElement

    meshSVG.addEventListener("click", meshClickHandler)

    arrowLayer = document.getElementById("arrow-layer")! as any as SVGGElement
    pathLayer = document.getElementById("path-layer")! as any as SVGGElement

    arrowOrigin = null
    arrowTarget = null
    currPathInitFace = null
    currWalkStats = null
}

function meshSVGEventPos(evt: MouseEvent): Geom.Vec2 {
    if (!meshSVG) {
        return { x: 0, y: 0 }
    }
    let x = evt.clientX
    let y = evt.clientY
    let sm = meshSVG.getScreenCTM().inverse()
    return { x: Math.round((sm.a * x)+(sm.c*y)+sm.e), y: Math.round((sm.b*x)+(sm.d*y)+sm.f) }
}

let currPathInitFace: Geom.Face|null = null
let currWalkStats: Geom.WalkStats|null = null

function updatePath() {
    if (currPathInitFace === null || arrowOrigin === null || arrowTarget === null) {
        return
    }
    if (currWalkType == "Celestial") {
        currWalkStats = Geom.celestial_walk_stats(currPathInitFace.some, arrowTarget)
    } else if (currWalkType == "Straight") {
        currWalkStats = Geom.straight_walk_stats(currPathInitFace.some, arrowOrigin, arrowTarget)
    } else if (currWalkType == "Visibility") {
        currWalkStats = Geom.visibility_walk_stats(currPathInitFace.some, arrowTarget)
    }
    drawPath()
}

function meshClickHandler(this: HTMLElement, ev: Event) {
    const mev = <MouseEvent>ev
    if (arrowOrigin === null || arrowTarget !== null) {
        arrowOrigin = meshSVGEventPos(mev)
        if (currMesh) {
            currPathInitFace = Geom.walk(currMesh.north, arrowOrigin)
        }
        arrowTarget = null
        currWalkStats = null
    } else {
        arrowTarget = meshSVGEventPos(mev)
        if (currPathInitFace !== null) {
            updatePath()
        }
    }
    drawArrow()
    drawPath()
}

function face2svg(face: Geom.Face): string {
    const p: Geom.Vec2 = face.some.origin.pos
    const words: [string] = ['<path class="path-face" d="M ' + p.x + ' ' + p.y]
    Geom.gather_face_edges(face).forEach((e: Geom.HalfEdge) => {
        const p: Geom.Vec2 = e.target.pos
        words.push(" L " + p.x + " " + p.y)
    })
    words.push('"/>')
    return words.join("")
}

function drawPath() {
    if (!pathLayer) {
        return
    }
    let lines: string[] = []
    if (currPathInitFace !== null) {
        lines.push(face2svg(currPathInitFace))
    }
    if (currWalkStats !== null) {
        const currPath = currWalkStats.path
        currPath.forEach((e) => {
            if (e.left !== currPathInitFace) {
                const p1 = e.origin.pos
                const p2 = e.target.pos
                lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>')
                lines.push(face2svg(e.left))
            }
        })
        const currOrientTests = currWalkStats.orient_tests
        lines.push('<text x="-180" y="-180" class="path-stats-text">faces: ' + currPath.length + ', orientation tests: ' + currOrientTests + "</text>")
    }
    pathLayer.innerHTML = lines.join("\n")
}

function drawArrow() {
    if (!arrowLayer) {
        return
    }
    let lines: string[] = []
    if (arrowOrigin !== null) {
        lines.push('<circle cx="' + arrowOrigin.x + '" cy="' + arrowOrigin.y + '" r="5" id="arrow-origin"/>')
        if (arrowTarget !== null) {
            lines.push('<line x1="' + arrowOrigin.x + '" y1="' + arrowOrigin.y + '" x2="' + arrowTarget.x + '" y2="' + arrowTarget.y + '" id="arrow" marker-end="url(#arrow-head)"/>')
        }
    }
    arrowLayer.innerHTML = lines.join("\n")
}

let currWalkType: WalkType|undefined

function selectWalkHandler(this: HTMLElement, ev: Event) {
    selectWalk(<WalkType>(<HTMLSelectElement>this).value)
}

function selectWalk(walkType: WalkType) {
    if (currWalkType && walkType == currWalkType) {
        return
    }
    currWalkType = <WalkType>walkType
    updatePath()
}

document.getElementById("select-mesh")!.addEventListener("change", selectMeshHandler);
document.getElementById("select-walk")!.addEventListener("change", selectWalkHandler);

selectMesh(<MeshType>(<HTMLSelectElement>(document.getElementById("select-mesh")!)).value);
selectWalk(<WalkType>(<HTMLSelectElement>(document.getElementById("select-walk")!)).value);