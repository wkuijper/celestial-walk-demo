import * as Geom from './geom';

let currMesh: Geom.Mesh|undefined
let currMeshType: Geom.MeshType|undefined

function selectMeshHandler(this: HTMLElement, ev: Event) {
    selectMesh(<Geom.MeshType>(<HTMLSelectElement>this).value)
}

let meshSVG: SVGSVGElement;
let arrowLayer: SVGGElement|undefined;
let arrowOrigin: Geom.Vec2|null = null;
let arrowTarget: Geom.Vec2|null = null;
let pathLayer: SVGGElement|undefined;

function selectMesh(meshType: Geom.MeshType) {
    if (currMeshType && meshType == currMeshType) {
        return
    }

    document.getElementById("warning-span")!.innerHTML = ''
    document.getElementById("select-mesh")!.classList.remove("warning")
    document.getElementById("select-walk")!.classList.remove("warning")
    if (currWalkType == "Visibility" && (meshType != "Delaunay")) {
        document.getElementById("warning-span")!.innerHTML = 'May loop!'
        document.getElementById("select-walk")!.classList.add("warning")
    }

    currMeshType = <Geom.MeshType>meshType
    currMesh = Geom.randomMesh(currMeshType)
    let meshDIV = document.getElementById("mesh-div")!
    meshDIV.innerHTML = Geom.mesh2svg(currMesh)

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
    let sm = meshSVG.getScreenCTM()!.inverse() // TODO: handle properly the fact that getScreenCTM can return null
    return { x: Math.round((sm.a * x)+(sm.c*y)+sm.e), y: Math.round((sm.b*x)+(sm.d*y)+sm.f) }
}

let currPathInitFace: Geom.Face|null = null
let currWalkStats: Geom.WalkStats|null = null

function updatePath() {
    if (currPathInitFace === null || arrowOrigin === null || arrowTarget === null || currWalkType == undefined) {
        return
    }
    currWalkStats = Geom.walkStats(currWalkType, currPathInitFace.some, arrowOrigin, arrowTarget)
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

function drawPath() {
    if (!pathLayer) {
        return
    }
    let lines: string[] = []
    if (currPathInitFace !== null) {
        lines.push(Geom.face2svg(currPathInitFace))
    }
    if (currWalkStats !== null) {
        const currPath = currWalkStats.path
        currPath.forEach((e) => {
            if (e.left !== currPathInitFace) {
                const p1 = e.origin.pos
                const p2 = e.target.pos
                lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>')
                lines.push(Geom.face2svg(e.left))
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

let currWalkType: Geom.WalkType|undefined

function selectWalkHandler(this: HTMLElement, ev: Event) {
    selectWalk(<Geom.WalkType>(<HTMLSelectElement>this).value)
}

function selectWalk(walkType: Geom.WalkType) {
    if (currWalkType && walkType == currWalkType) {
        return
    }
    document.getElementById("warning-span")!.innerHTML = ''
    document.getElementById("select-mesh")!.classList.remove("warning")
    document.getElementById("select-walk")!.classList.remove("warning")
    if (walkType == "Visibility" && (currMeshType != "Delaunay")) {
        document.getElementById("warning-span")!.innerHTML = 'May loop!'
        document.getElementById("select-mesh")!.classList.add("warning")
    }
    currWalkType = <Geom.WalkType>walkType
    updatePath()
}

document.getElementById("select-mesh")!.addEventListener("change", selectMeshHandler);
document.getElementById("select-walk")!.addEventListener("change", selectWalkHandler);

selectMesh(<Geom.MeshType>(<HTMLSelectElement>(document.getElementById("select-mesh")!)).value);
selectWalk(<Geom.WalkType>(<HTMLSelectElement>(document.getElementById("select-walk")!)).value);