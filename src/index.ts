import {treatedAll} from './common'
import * as Geom from './geom'
import * as Pointcloud from './pointcloud'
import * as Floorplan from './floorplan'
import * as Walk from './walk'
import * as Render from './render'
import * as Random from 'random-js'

type MeshType = "Delaunay Pointcloud"|"Thintriangles Pointcloud"|"Convex Pointcloud"|"Delaunayish Floorplan"|"Convex Floorplan"|"Subdivided Floorplan"
const meshTypes: MeshType[] = ["Delaunay Pointcloud", "Thintriangles Pointcloud", "Convex Pointcloud", "Delaunayish Floorplan", "Convex Floorplan", "Subdivided Floorplan"]

type WalkType = "Straight"|"Visibility"|"Celestial"
const walkTypes: WalkType[] = ["Straight", "Visibility", "Celestial"]

const random = new Random(Random.engines.nativeMath)

function randomMesh(meshType: MeshType): Geom.Mesh {
    if (meshType == "Delaunay Pointcloud") {
        return Pointcloud.randomMesh(random, "Delaunay")
    } else if (meshType == "Thintriangles Pointcloud") {
        return Pointcloud.randomMesh(random, "Thin")
    } else if (meshType == "Convex Pointcloud") {
        return Pointcloud.randomMesh(random, "Convex")
    } else if (meshType == "Delaunayish Floorplan") {
        return Floorplan.randomMesh(random, false, false)
    } else if (meshType == "Convex Floorplan") {
        return Floorplan.randomMesh(random, false, true)
    } else if (meshType == "Subdivided Floorplan") {
        return Floorplan.randomMesh(random, true, false)
    }
    return treatedAll(meshType)
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

    document.getElementById("status-div")!.innerHTML = ''
    document.getElementById("select-mesh")!.classList.remove("warning")
    document.getElementById("select-walk")!.classList.remove("warning")
    if (currWalkType == "Visibility" && (!meshType.includes("Delaunay"))) {
        document.getElementById("status-div")!.innerHTML = '<span class="warning">This combination may loop!</span>'
        document.getElementById("select-walk")!.classList.add("warning")
    }

    currMeshType = <MeshType>meshType
    currMesh = randomMesh(currMeshType)
    let meshDIV = document.getElementById("mesh-div")!
    meshDIV.innerHTML = Render.mesh2svg(currMesh)

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
let currWalkStats: Walk.Stats|null = null

function updatePath() {
    if (currPathInitFace === null || arrowOrigin === null || arrowTarget === null || currWalkType == undefined) {
        return
    }
    currWalkStats = Walk.stats(currWalkType, currPathInitFace.some, arrowOrigin, arrowTarget)
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
    let statusLine = ""
    let lines: string[] = []
    if (currPathInitFace !== null) {
        lines.push(Render.face2svg(currPathInitFace, "path-face"))
    }
    if (currWalkStats !== null) {
        const currPath = currWalkStats.path
        currPath.forEach((e) => {
            if (e.left !== currPathInitFace) {
                const p1 = e.origin.pos
                const p2 = e.target.pos
                lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" class="path-edge"/>')
                lines.push(Render.face2svg(e.left, "path-face"))
            }
        })
        statusLine = `Faces:&nbsp;<span class="facecount">${currPath.length}</span>, Orientation Tests:&nbsp;<span class="orientcount">${currWalkStats.orient_tests}</span>`
    }
    pathLayer.innerHTML = lines.join("\n")
    document.getElementById("status-div")!.innerHTML = statusLine
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
    document.getElementById("status-div")!.innerHTML = ''
    document.getElementById("select-mesh")!.classList.remove("warning")
    document.getElementById("select-walk")!.classList.remove("warning")
    if (walkType == "Visibility" && currMeshType && (!currMeshType.includes("Delaunay"))) {
        document.getElementById("status-div")!.innerHTML = '<span class="warning">This combination may loop!</span>'
        document.getElementById("select-mesh")!.classList.add("warning")
    }
    currWalkType = <WalkType>walkType
    updatePath()
}

function optionsHTML(options: string[]): string {
    const lines: string[] = []
    options.forEach((v) => {
        lines.push(`<option value="${v}">${v}</option>`)
    })
    return lines.join('\n')
}

document.getElementById("select-mesh")!.innerHTML = optionsHTML(meshTypes)
document.getElementById("select-walk")!.innerHTML = optionsHTML(walkTypes)

document.getElementById("select-mesh")!.addEventListener("change", selectMeshHandler);
document.getElementById("select-walk")!.addEventListener("change", selectWalkHandler);

selectMesh(<MeshType>(<HTMLSelectElement>(document.getElementById("select-mesh")!)).value);
selectWalk(<Walk.Type>(<HTMLSelectElement>(document.getElementById("select-walk")!)).value);