import * as Geom from './geom';

type MeshType = "Convex"|"Triangular"|"Delaunay"
type WalkType = "Straight"|"Triangular"|"Delaunay"

const svg_preamble = `
<svg viewBox="-210 -210 420 420" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
    <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
        </marker>
    </defs>`
const svg_postamble = `
    <g id="arrow-layer">
    </g>
</svg>`

function mesh2svg(m: Geom.Mesh): [string] {
    const chunks: [string] = [svg_preamble]

    let edges = Geom.gather_edges(m)
    edges.forEach((e) => {
        const p1 = e.half.origin.pos
        const p2 = e.half.target.pos
        chunks.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="mesh-line"/>')
    })

    chunks.push(svg_postamble)

    return chunks
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
    } else if (mesh_type == "Triangular") {
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

function selectMesh(meshType: MeshType) {
    if (currMeshType && meshType == currMeshType) {
        return
    }
    currMeshType = <MeshType>meshType
    currMesh = random_mesh(currMeshType)
    let meshDIV = document.getElementById("mesh-div")!
    meshDIV.innerHTML = mesh2svg(currMesh).join()

    meshSVG = document.getElementById("mesh-svg")! as any as SVGSVGElement

    //meshSVG.addEventListener("mousedown", meshDownHandler)
    //meshSVG.addEventListener("mouseup", meshUpHandler)
    //meshSVG.addEventListener("mousemove", meshMoveHandler)
    meshSVG.addEventListener("click", meshClickHandler)
    
    arrowLayer = document.getElementById("arrow-layer")! as any as SVGGElement
}

function meshSVGEventPos(evt: MouseEvent): Geom.Vec2 {
    if (!meshSVG) {
        return { x: 0, y: 0 }
    }
    let x = evt.clientX
    let y = evt.clientY
    let sm = meshSVG.getScreenCTM().inverse()
    return { x: (sm.a * x)+(sm.c*y)+sm.e, y: (sm.b*x)+(sm.d*y)+sm.f }
}

function meshClickHandler(this: HTMLElement, ev: Event) {
    const mev = <MouseEvent>ev
    console.log("mouseClick: " + mev.clientX + ", " + mev.clientY)
    if (arrowOrigin === null || arrowTarget !== null) {
        arrowOrigin = meshSVGEventPos(mev)
        arrowTarget = null
    } else {
        arrowTarget = meshSVGEventPos(mev)
    }
    drawArrow()
}

/*
function meshDownHandler(this: HTMLElement, ev: Event) {
    const mev = <MouseEvent>ev
    console.log("mouseDown: " + mev.clientX + ", " + mev.clientY)
    arrowOrigin = meshSVGEventPos(mev)
    arrowTarget = arrowOrigin
    drawArrow()
}

function meshUpHandler(this: HTMLElement, ev: Event) {
    const mev = <MouseEvent>ev
    console.log("mouseUp: " + mev.clientX + ", " + mev.clientY)
    arrowOrigin = null
    arrowTarget = null
    drawArrow()
}

function meshMoveHandler(this: HTMLElement, ev: Event) {
    const mev = <MouseEvent>ev
    console.log("mouseMove!")
    if (arrowOrigin === null) {
        return
    }
    arrowTarget = meshSVGEventPos(mev)
    drawArrow()
}
*/

function drawArrow() {
    if (!arrowLayer) {
        return
    }
    if (arrowOrigin === null) {
        arrowLayer.innerHTML = ''
        return
    }
    if (arrowTarget === null) {
        arrowLayer.innerHTML = '<circle cx="' + arrowOrigin.x + '" cy="' + arrowOrigin.y + '" r="5" id="arrow-origin"/>'
        return
    }
    arrowLayer.innerHTML = 
      '<circle cx="' + arrowOrigin.x + '" cy="' + arrowOrigin.y + '" r="5" id="arrow-origin"/>' +
      '<line x1="' + arrowOrigin.x + '" y1="' + arrowOrigin.y + '" x2="' + arrowTarget.x + '" y2="' + arrowTarget.y + '" id="arrow" marker-end="url(#arrow-head)"/>'
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
}

document.getElementById("select-mesh")!.addEventListener("change", selectMeshHandler);
document.getElementById("select-walk")!.addEventListener("change", selectWalkHandler);

selectMesh(<MeshType>(<HTMLSelectElement>(document.getElementById("select-mesh")!)).value);