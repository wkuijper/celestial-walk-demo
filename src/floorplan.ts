import * as Geom from './geom';
import * as Random from 'random-js';

type Cell = { x: number, y: number, width: number, height: number, inside: boolean }

type Edge = { origin: Vertex, target: Vertex }
type Vertex = { pos: Geom.Vec2, incoming: Set<Edge>, outgoing: Set<Edge> }
type Floorplan = { edges: Set<Edge>, vertices: Set<Vertex> }

const seedRandom = Random.engines.nativeMath

// we like: [ 327293021, 1315541527 ]
// problematic fillets: [ -1818373956, 310693458 ]

/*
const loopingSeeds: { [key: string]: boolean} = {}
const failingSeeds: { [key: string]: boolean} = {}

let n = 0
while (true) {
    n++
    let seedArray: [number, number]
    do {
        seedArray = [seedRandom(), seedRandom()]
    } while (failingSeeds[`${seedArray}`]||loopingSeeds[`${seedArray}`])
    const random = new Random(Random.engines.mt19937().seedWithArray(seedArray));
    try {
        console.log(`iteration ${n}: generating with seed: ${seedArray}`)
        randomFloorplan(random);
    } catch (e) {
        console.log(`exception for seed: ${seedArray}`)
        throw e
    }
}
*/
/*
for (let seedArrayString in failingSeeds) {
    const seedArray: number[] = seedArrayString.split(",").map(parseInt)
    const random = new Random(Random.engines.mt19937().seedWithArray(seedArray))
    randomFloorplan(random)
}*/

//const seedArray = [seedRandom(), seedRandom()]
//console.log(seedArray)
//const random = new Random(Random.engines.mt19937().seedWithArray(seedArray))

export function randomFloorplanMesh(random: Random, sprinkle: boolean): Geom.Mesh {
    const floorplan1 = randomFloorplan(random)
    const floorplan2 = randomFloorplan(random)
    const angle2 = random.real((30/180)*Math.PI, (60/180)*Math.PI)
    rotateFloorplan(floorplan2, angle2)
    const interAxisRadius = random.real(10000, 12000)
    const interAxisAngle = 
        random.pick([(45/180)*Math.PI, (135/180)*Math.PI, (225/180)*Math.PI, (315/180)*Math.PI]) 
        + random.real((-10/180)*Math.PI, (10/180)*Math.PI)
    const delta1 = { x: Math.cos(interAxisAngle) * interAxisRadius, y: Math.sin(interAxisAngle) * interAxisRadius}
    translateFloorplan(floorplan1, delta1)
    const delta2 = Geom.mult(delta1, -1)
    translateFloorplan(floorplan2, delta2)
    const m = floorplans2mesh([floorplan1, floorplan2])
    if (sprinkle) {
        const edges = Geom.gatherEdges(m)
        const waitingList: Geom.Edge[] = []
        edges.forEach((ee) => {waitingList.push(ee)})
        while (waitingList.length > 0) {
            const ee = waitingList.pop()!
            const e = ee.half
            if (ee.constrained && e.twin && Geom.edgeLength(ee) > 3000) {
                const v = Geom.splitEdgeApproximately(e, Geom.mult(Geom.plus(e.origin.pos, e.target.pos), .5))
                waitingList.push(Geom.connected(e.origin, v)!)
                waitingList.push(Geom.connected(v, e.target)!)
            }
        }
        Geom.floodFill(m)
        let e = m.north
        for (let x = -30000; x <= 30000; x += 1500) {
            for (let y = -30000; y <= 30000; y += 1500) {
                const p = { x: x + random.integer(-400,400), y: y + random.integer(-400,400) }
                const f = Geom.walk(e, p)
                e = f.some
                if (f.filled) {
                    Geom.insertVertexFromEdge(e, p)
                }
            }
        }
    }
    Geom.delaunafy(m)
    return m
}

function randomFloorplan(random: Random): Floorplan {
    const dim = 6
    const size = 30000
    const lines = randomLines(random, dim, size)
    const bites = 4
    const pattern = randomPattern(random, dim, bites)
    const floorplan = makeFloorplan(dim, lines, pattern)
    simplifyFloorplan(floorplan)
    const desiredFillets = 1
    let createdFillets = 0
    let tries = 0
    const maxTries = desiredFillets * 2
    while (tries < maxTries && createdFillets < desiredFillets) {
        const corners = gatherStraightCorners(floorplan)
        if (corners.length == 0) {
            break
        }
        random.shuffle(corners)
        const corner = corners[0]
        if (filletStraightCorner(floorplan, corner)) {
            createdFillets++
        }
        tries++
    }
    return floorplan
}

function floorplan2mesh(floorplan: Floorplan): Geom.Mesh {
    return floorplans2mesh([floorplan])
}

function floorplans2mesh(floorplans: Floorplan[]): Geom.Mesh {
    const m: Geom.Mesh = Geom.mesh()
    floorplans.forEach((floorplan) => {
        floorplan.edges.forEach((e) => {
            Geom.draw(m, { p1: Geom.roundVec2(e.origin.pos), p2: Geom.roundVec2(e.target.pos) }, true, false)
        })
    })
    Geom.delaunafy(m)
    Geom.floodFill(m)
    return m
}

function cells2html(cells: Cell[][]): string {
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
</html>`
}

function cells2svg(cells: Cell[][]): string {
    return `<svg viewBox="-20000 -20000 40000 40000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="floorplan-svg">
    <defs>
    </defs>
    <g id="walls-layer">
    </g>
    <g id="solid-layer">
        ${cells2svgSolid(cells)}
    </g>
</svg>`
}

function rotateFloorplan(floorplan: Floorplan, angle: number) {
    floorplan.vertices.forEach((vertex) => {
        const p = vertex.pos
        vertex.pos = {
            x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
            y: p.x * Math.sin(angle) + p.y * Math.cos(angle)
        }
    })
}

function translateFloorplan(floorplan: Floorplan, delta: Geom.Vec2) {
    floorplan.vertices.forEach((vertex) => {
        const p = vertex.pos
        vertex.pos = Geom.plus(vertex.pos, delta)
    })
}

function cells2svgSolid(cells: Cell[][]): string {
    const lines: string[] = []
    cells.forEach((column: Cell[]) => {
        column.forEach((cell: Cell) => {
            let clss = "floorplan-outside"
            if (cell.inside) {
                clss = "floorplan-inside"
            }
            lines.push(`<rect class="${clss}" width="${cell.width}" height="${cell.height}" x="${cell.x}" y="${cell.y}"/>`)
        })
    })
    return lines.join("\n")
}

function gatherStraightCorners(floorplan: Floorplan): [Edge, Edge][] {
    const corners: [Edge, Edge][] = []
    floorplan.edges.forEach((ie) => {
        if (ie.target.outgoing.size != 1) {
            return
        }
        ie.target.outgoing.forEach((oe) => {
            if (ie.origin.pos.x == ie.target.pos.x) {
                if (oe.origin.pos.y == oe.target.pos.y) {
                    if ((ie.origin.pos.y < ie.target.pos.y && oe.origin.pos.x > oe.target.pos.x)
                        || (ie.origin.pos.y > ie.target.pos.y && oe.origin.pos.x < oe.target.pos.x)) {
                        corners.push([ie, oe])
                    }
                }
            } else if (ie.origin.pos.y == ie.target.pos.y) {
                if (oe.origin.pos.x == oe.target.pos.x) {
                    if ((ie.origin.pos.x < ie.target.pos.x && oe.origin.pos.y < oe.target.pos.y)
                        || (ie.origin.pos.x > ie.target.pos.x && oe.origin.pos.y > oe.target.pos.y)) {
                        corners.push([ie, oe])
                    }
                }
            }
        })
    })
    return corners
}

function filletStraightCorner(floorplan: Floorplan, corner: [Edge, Edge]): boolean {
    const [ie, oe] = corner
    const m = floorplan2mesh(floorplan)
    const gieorigin = Geom.walkToClosestVertex(m.north, ie.origin.pos)
    if (!Geom.pointsCoincide(gieorigin.pos, ie.origin.pos)) {
        return false
    }
    let gie = Geom.pivot(gieorigin, ie.target.pos)
    if (!Geom.pointsCoincide(gie.origin.pos, ie.origin.pos) ||
        !Geom.pointsCoincide(gie.target.pos, ie.target.pos)) {
        return false
    }
    const goeorigin = Geom.walkToClosestVertex(m.north, oe.origin.pos)
    if (!Geom.pointsCoincide(goeorigin.pos, oe.origin.pos)) {
        return false
    }
    let goe = Geom.pivot(goeorigin, oe.target.pos)
    if (!Geom.pointsCoincide(goe.origin.pos, oe.origin.pos) ||
        !Geom.pointsCoincide(goe.target.pos, oe.target.pos)) {
        return false
    }
    const giel = Geom.halfEdgeLength(gie)
    const goel = Geom.halfEdgeLength(goe)
    const radius = Math.min(giel, goel)
    let stepAngle = Math.PI / 8
    for (let c = 0; c < 6; c++) {
        if ((stepAngle * radius) < 2000) {
            break
        }
        stepAngle = stepAngle / 2
    }
    const angleEpsilon = stepAngle / 65536
    let startAngle = stepAngle
    let endAngle = (Math.PI / 2) - stepAngle
    let center: Geom.Vec2
    let needle: Geom.Vec2
    let coneedle: Geom.Vec2

    if (giel <= goel) {
        center = Geom.plus(gie.origin.pos, Geom.rotateLeft(Geom.halfEdgeDelta(gie)))
        coneedle = Geom.minus(gie.origin.pos, center)
        needle = Geom.rotateLeft(coneedle)
        if (giel != goel) {
            startAngle -= stepAngle
            const newoetargetpos = Geom.roundVec2(Geom.plus(center, needle))
            const newoetarget = Geom.insertVertex(m, newoetargetpos)
            if (!Geom.pointsCoincide(newoetarget.pos, newoetargetpos)) {
                return false
            }
            goe = Geom.pivot(goe.origin, newoetargetpos)
            if (!Geom.pointsCoincide(goe.origin.pos, oe.origin.pos) ||
                !Geom.pointsCoincide(goe.target.pos, newoetargetpos)) {
                return false
            }
        }
    } else {
        center = Geom.plus(goe.target.pos, Geom.rotateLeft(Geom.halfEdgeDelta(goe)))
        endAngle += stepAngle
        needle = Geom.minus(goe.target.pos, center)
        coneedle = Geom.rotateRight(needle)
        const newieoriginpos = Geom.roundVec2(Geom.plus(center, coneedle))
        const newieorigin = Geom.insertVertex(m, newieoriginpos)
        if (!Geom.pointsCoincide(newieorigin.pos, newieoriginpos)) {
            return false
        }
        gie = Geom.pivot(newieorigin, ie.target.pos)
        if (!Geom.pointsCoincide(gie.origin.pos, newieoriginpos) ||
            !Geom.pointsCoincide(gie.target.pos, ie.target.pos)) {
            return false
        }
    }
    if (!gie.edge.constrained || !goe.edge.constrained) {
        return false
    }
    try {
        Geom.flipToConnectVertices(gie.origin, goe.target)
    }
    catch (e) {
        if (!e.message || (e.message != "intersecting existing vertex" && e.message != "intersecting constrained edge")) {
            throw e
        }
    }
    Geom.floodFill(m)
    if (!gie.left.filled || !gie.twin || gie.twin.left.filled) {
        return false
    }
    if (goe.next.next != gie || !goe.twin || goe.twin.left.filled) {
        return false
    }
    const filletPoints: Geom.Vec2[] = []
    for (let angle = startAngle; ((endAngle - angle) > -angleEpsilon); angle += stepAngle) {
        filletPoints.push(Geom.plus(Geom.plus(center, Geom.mult(needle, Math.sin(angle))), Geom.mult(coneedle, Math.cos(angle))))
    }
    // remove the corner (including, possibly, the vertex)
    removeEdge(floorplan, ie)
    removeEdge(floorplan, oe)
    if (ie.target.incoming.size == 0 && ie.target.outgoing.size == 0) {
        floorplan.vertices.delete(ie.target)
    }
    // substitute with the fillet
    let currVertex = ie.origin
    filletPoints.forEach((p) => {
        const nextVertex = newVertex(floorplan, p)
        if (!Geom.pointsCoincide(currVertex.pos, nextVertex.pos)) {
            newEdge(floorplan, currVertex, nextVertex)
        }
        currVertex = nextVertex
    })
    if (!Geom.pointsCoincide(currVertex.pos, oe.target.pos)) {
        newEdge(floorplan, currVertex, oe.target)
    }
    return true
}

function newFloorplan(): Floorplan {
    return { edges: new Set(), vertices: new Set() }
}

function newVertex(floorplan: Floorplan, p: Geom.Vec2): Vertex {
    const vertex: Vertex = { pos: p, incoming: new Set(), outgoing: new Set() }
    floorplan.vertices.add(vertex)
    return vertex
}

function newEdge(floorplan: Floorplan, origin: Vertex, target: Vertex) {
    if (Geom.pointsCoincide(origin.pos, target.pos)) {
        throw "origin and target coincide"
    }
    const edge = { origin: origin, target: target }
    floorplan.edges.add(edge)
    origin.outgoing.add(edge)
    target.incoming.add(edge)
}

function removeEdge(floorplan: Floorplan, e: Edge) {
    e.origin.outgoing.delete(e)
    e.target.incoming.delete(e)
    floorplan.edges.delete(e)
}

function simplifyFloorplan(floorplan: Floorplan) {
    const waitingList: Vertex[] = []
    const waitingSet: Set<Vertex> = new Set()
    function scheduleVertex(v: Vertex) {
        if (!waitingSet.has(v)) {
            waitingList.push(v); waitingSet.add(v)
        }
    }
    floorplan.vertices.forEach((v) => { scheduleVertex(v) })
    while (waitingList.length > 0) {
        const vertex = waitingList.pop()!
        waitingSet.delete(vertex)
        const colinearPairs: [Edge, Edge][] = []
        vertex.incoming.forEach((ie) => {
            vertex.outgoing.forEach((oe) => {
                if (Geom.orient(ie.origin.pos, vertex.pos, oe.target.pos) == 0) {
                    colinearPairs.push([ie, oe])
                }
            })
        })
        colinearPairs.forEach((pair) => {
            const [ie, oe] = pair
            removeEdge(floorplan, ie)
            removeEdge(floorplan, oe)
            newEdge(floorplan, ie.origin, oe.target)
            scheduleVertex(ie.origin)
            scheduleVertex(oe.target)
        })
        if (vertex.incoming.size == 0 && vertex.outgoing.size == 0) {
            floorplan.vertices.delete(vertex)
        }
    }

}

function makeFloorplan(dim: number, lines: [number[], number[]], pattern: boolean[][]): Floorplan {
    const [hor, ver] = lines
    const floorplan = newFloorplan()
    const vertexGrid: Vertex[][] = []
    for (let h = 0; h <= dim; h++) {
        const column: Vertex[] = []
        vertexGrid.push(column)
        for (let v = 0; v <= dim; v++) {
            const vertex = newVertex(floorplan, { x: hor[h], y: ver[v] })
            column.push(vertex)
        }
    }
    for (let h = 0; h < dim; h++) {
        for (let v = 0; v < dim; v++) {
            if (!pattern[h][v]) {
                continue
            }
            if (v == 0 || !(pattern[h][v - 1])) {
                newEdge(floorplan, vertexGrid[h][v], vertexGrid[h + 1][v])
            }
            if (h == dim - 1 || !(pattern[h + 1][v])) {
                newEdge(floorplan, vertexGrid[h + 1][v], vertexGrid[h + 1][v + 1])
            }
            if (v == dim - 1 || !(pattern[h][v + 1])) {
                newEdge(floorplan, vertexGrid[h + 1][v + 1], vertexGrid[h][v + 1])
            }
            if (h == 0 || !(pattern[h - 1][v])) {
                newEdge(floorplan, vertexGrid[h][v + 1], vertexGrid[h][v])
            }
        }
    }
    return floorplan
}

function makeCells(dim: number, lines: [number[], number[]], pattern: boolean[][]): Cell[][] {
    const [hor, ver] = lines
    const cells: Cell[][] = []
    for (let h = 0; h < dim; h++) {
        const column: Cell[] = []
        cells.push(column)
        for (let v = 0; v < dim; v++) {
            const cell = {
                x: hor[h], y: ver[v],
                width: hor[h + 1] - hor[h], height: ver[v + 1] - ver[v],
                inside: pattern[h][v]
            }
            column.push(cell)
        }
    }
    return cells
}

function randomPattern(random: Random, dim: number, bites: number): boolean[][] {
    if (dim < 6) {
        throw Error("dim must be 6 or greater")
    }
    const pattern: boolean[][] = []
    for (let h = 0; h < dim; h++) {
        const column: boolean[] = []
        pattern.push(column)
        for (let v = 0; v < dim; v++) {
            column.push(true)
        }
    }
    for (let b = 0; b < bites; b++) {
        let h: number
        let v: number
        if (random.bool()) {
            // pick a corner
            if (random.bool()) { h = 0 } else { h = dim - 1 }
            if (random.bool()) { v = 0 } else { v = dim - 1 }
        } else if (random.bool()) {
            // pick a sidepoint
            if (random.bool()) {
                // top or bottom
                if (random.bool()) {
                    // top
                    v = 0; h = 2 + random.integer(0, dim - 4)
                } else {
                    // bottom
                    v = dim - 1; h = 2 + random.integer(0, dim - 4)
                }
            } else {
                // left or right
                if (random.bool()) {
                    // left
                    h = 0; v = 2 + random.integer(0, dim - 4)
                } else {
                    // right
                    h = dim - 1; v = 2 + random.integer(0, dim - 4)
                }
            }
        } else {
            // pick an interior point
            h = 2 + random.integer(0, dim - 4)
            v = 2 + random.integer(0, dim - 4)
        }
        for (let c = 0; c <= b; c++) {
            if (h < 0 || h > dim - 1 || v < 0 || v > dim - 1) {
                break
            }
            if (!pattern[h][v]) {
                break
            }
            pattern[h][v] = false
            // step hor or ver
            if (random.bool()) {
                if (random.bool()) { h -= 1 } else { h += 1 }
            } else {
                if (random.bool()) { v -= 1 } else { v += 1 }
            }
        }
    }
    return pattern
}

function randomLines(random: Random, dim: number, size: number): [number[], number[]] {
    const halfSize = Math.round(size / 2)
    const horWeights: number[] = []
    let totHorWeight = 0
    for (let c = 0; c <= dim; c++) {
        const weight = random.integer(40, 200)
        horWeights.push(weight)
        totHorWeight += weight
    }
    const hor: number[] = []
    let x = -halfSize
    for (let c = 0; c <= dim; c++) {
        x += size * (horWeights[c] / totHorWeight)
        hor.push(Math.round(x))
    }
    const verWeights: number[] = []
    let totVerWeight = 0
    for (let c = 0; c <= dim; c++) {
        const weight = horWeights[c] + random.integer(-20, 60)
        verWeights.push(weight)
        totVerWeight += weight
    }
    const ver: number[] = []
    let y = -halfSize
    for (let c = 0; c <= dim; c++) {
        y += size * (verWeights[c] / totVerWeight)
        ver.push(Math.round(y))
    }
    return [hor, ver]
}
