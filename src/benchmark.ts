import * as Geom from './geom';
import * as fs from 'fs';
import { stat } from 'fs/promises';


type ArrowType = 0|45|90|135|180|225|270

const arrowTypes: ArrowType[] = [0,45,90,135,180,225,270]

const arrows: Map<ArrowType,Geom.Line> = new Map([])

const arrowLength = 40000

arrowTypes.forEach((arrowType) => {
    const angle = (arrowType/180)*Math.PI
    const radius = arrowLength/2
    const dx = Math.round(Math.sin(angle)*radius)
    const dy = Math.round(Math.cos(angle)*radius)
    arrows.set(arrowType, {p1: { x: dx, y: dy}, p2: {x: -dx, y: -dy}})
})

const meshTypes: Geom.MeshType[] = ["Delaunay", "Thin", "Convex"];
const walkTypes: Geom.WalkType[] = ["Straight", "Visibility", "Celestial"]

if (!fs.existsSync("./benchmarks")) {
    throw new Error('./benchmarks directory does not exist, create it or start this script from another working directory')
}

if (fs.existsSync("./benchmarks/output")) {
    throw new Error('./benchmarks/output directory already exist, delete it or move it out of the way')    
}

if (!fs.existsSync("./benchmarks/input")) {
    fs.mkdirSync("./benchmarks/input")
    for (var n = 0; n < 0x1000; n++) {
        const hex: string = ("00" + n.toString(16)).substr(-3)
        const pointCloud: Geom.Vec2[] = Geom.randomPointCloud(1000)
        const csvLines: string[] = []
        pointCloud.forEach((point: Geom.Vec2) => {
            csvLines.push("" + point.x + "," + point.y)
        })
        const csv = csvLines.join("\n")
        fs.writeFileSync("./benchmarks/input/" + hex + ".csv", csv)
    }
}

fs.mkdirSync("./benchmarks/output")
fs.mkdirSync("./benchmarks/output/meshes")
fs.mkdirSync("./benchmarks/output/paths")
fs.mkdirSync("./benchmarks/output/graphs")

type QuantType = "orient_tests"|"link_dist"|"non_delaunay"
const quantTypes: QuantType[] = ["orient_tests", "link_dist", "non_delaunay"]
const raw: Map<ArrowType,Map<Geom.MeshType,Map<Geom.WalkType, Map<QuantType, number[]>>>> = new Map()

arrowTypes.forEach((arrowType) => {
    const raw2 = raw.set(arrowType, new Map()).get(arrowType)!
    meshTypes.forEach((meshType) => {
        const raw3 = raw2.set(meshType, new Map()).get(meshType)!
        walkTypes.forEach((walkType) => {
            const raw4 = raw3.set(walkType, new Map()).get(walkType)!
            quantTypes.forEach((quantType) => {
                raw4.set(quantType, [])
            })
        })
    })
})

for (var n = 0; n < 0x010; n++) {
    const hex: string = ("00" + n.toString(16)).substr(-3)
    const csv: string = fs.readFileSync("./benchmarks/input/" + hex + ".csv").toString()
    const pointCloud: Geom.Vec2[] = []
    csv.split("\n").forEach((line: string) => {
        let [xs, ys] = line.split(",")
        pointCloud.push({x: parseInt(xs), y: parseInt(ys)})
    });
    arrows.forEach((arrowLine, arrowType) => {
        const raw2 = raw.get(arrowType)!
        const p1 = arrowLine.p1
        const p2 = arrowLine.p2
        meshTypes.forEach((meshType) => {
            const raw3 = raw2.get(meshType)!
            const m = Geom.initialMesh(meshType)
            const name1init = hex + "_init_" + meshType.toLowerCase()
            fs.writeFileSync("./benchmarks/output/meshes/" + name1init + ".html", Geom.mesh2html(name1init, m, meshType == "Delaunay" || meshType == "Symmetric"))
            Geom.fillMeshFromPointCloud(m, meshType, pointCloud)
            const name1 = hex + "_" + meshType.toLowerCase()
            fs.writeFileSync("./benchmarks/output/meshes/" + name1 + ".html", Geom.mesh2html(name1, m, meshType == "Delaunay" || meshType == "Symmetric"))
            const initEdge = Geom.walk(m.north, p1).some
            walkTypes.forEach((walkType) => {
                const raw4 = raw3.get(walkType)!
                const stats = Geom.walkStats(walkType, initEdge, p1, p2)
                const name2 = name1 + "_" + arrowType + "_" + walkType.toLowerCase()
                fs.writeFileSync("./benchmarks/output/paths/" + name2 + ".html", Geom.mesh2html(name2, m, false, stats, arrowLine))
                raw4.get("orient_tests")!.push(stats.orient_tests)
                raw4.get("link_dist")!.push(stats.path.length)
            })
        })
    })
}

type QuantStats = { mean: number, stddev: number, min: number, max: number, raw: number[] }

const digest: Map<ArrowType,Map<Geom.MeshType,Map<Geom.WalkType, Map<QuantType, QuantStats>>>> = new Map()

arrowTypes.forEach((arrowType) => {
    const raw2 = raw.get(arrowType)!
    digest.set(arrowType, new Map())
    const digest2 = digest.get(arrowType)!
    meshTypes.forEach((meshType) => {
        const raw3 = raw2.get(meshType)!
        digest2.set(meshType, new Map())
        const digest3 = digest2.get(meshType)!
        walkTypes.forEach((walkType) => {
            const raw4 = raw3.get(walkType)!
            digest3.set(walkType, new Map())
            const digest4 = digest3.get(walkType)!
            quantTypes.forEach((quantType) => {
                const raw5 = raw4.get(quantType)!
                let tot_quant = 0
                let min_quant = Number.POSITIVE_INFINITY, max_quant = Number.NEGATIVE_INFINITY
                raw5.forEach((quant) => {
                    tot_quant += quant
                    if (quant < min_quant) { min_quant = quant }
                    if (quant > max_quant) { max_quant = quant }
                })
                const mean_quant = tot_quant/raw5.length
                let sqd_quant = 0
                raw5.forEach((quant) => {
                    sqd_quant += (quant - mean_quant) ** 2
                })
                const stddev_quant = Math.sqrt(sqd_quant/(raw5.length-1))
                digest4.set(quantType, { mean: mean_quant, stddev: stddev_quant, min: min_quant, max: max_quant, raw: raw5 })
            })
        })
    })
})

abstract class Primitive {
    abstract boundingBox(): BoundingBox
    abstract svg(): string
}

type Point = { x: number, y: number }
class Line extends Primitive { 
    p1: Point
    p2: Point
    style: string 
    constructor (p1: Point, p2: Point, style="graph-line") {
        super()
        this.p1 = p1
        this.p2 = p2
        this.style = style
    }
    svg(): string {
        return `<line x1="${this.p1.x}" y1="${this.p1.y}" x2="${this.p2.x}" y2="${this.p2.y}" class="${this.style}"/>`
    }
    boundingBox(): BoundingBox {
        return { 
            x1: Math.min(this.p1.x, this.p2.x), y1: Math.min(this.p1.y, this.p2.y), 
            x2: Math.max(this.p1.x, this.p2.x), y2: Math.max(this.p1.y, this.p2.y) }
    }
}

type BoundingBox = { x1: number, y1: number, x2: number, y2: number }

function joinBoundingBoxes(bb1: BoundingBox, bb2: BoundingBox): BoundingBox {
    return { 
        x1: Math.min(bb1.x1, bb2.x1), y1: Math.min(bb1.y1, bb2.y1), 
        x2: Math.max(bb1.x2, bb2.x2), y2: Math.max(bb1.y2, bb2.y2) }
}

type TextHorAlign = "left"|"right"|"center"
type TextVerAlign = "above"|"below"|"center"
type TextOrient = "hor"|"ver"
class Text extends Primitive { 
    pos: Point
    text: string
    horAlign: TextHorAlign
    verAlign: TextVerAlign
    orient: TextOrient
    style: string
    constructor(pos: Point, text: string, horAlign: TextHorAlign = "right", verAlign: TextVerAlign = "center", orient: TextOrient = "hor", style="graph-text") {
        super()
        this.pos = pos
        this.text = text
        this.horAlign = horAlign
        this.verAlign = verAlign
        this.orient = orient
        this.style = style
    }
    boundingBox(): BoundingBox {
        const bound = Math.max(2, this.text.length) * 11
        return { 
            x1: this.pos.x - bound, y1: this.pos.y - bound, 
            x2: this.pos.x + bound, y2: this.pos.y + bound}
    }
    svgAlignmentBaseline(): string {
        if (this.verAlign == "above") {
            return "baseline"
        } else if (this.verAlign == "below") {
            return "hanging"
        } else {
            return "middle"
        }
    }
    svgTextAnchor(): string {
        if (this.horAlign == "left") {
            return "end"
        } else if (this.horAlign == "right") {
            return "start"
        } else {
            return "middle"
        }
    }
    svgTransform(): string {
        if (this.orient == "hor") {
            return ""
        } else {
            return "rotate(90)"
        }
    }
    svg(): string {
        return `<text x="${this.pos.x}" y="${this.pos.y}" alignment-baseline="${this.svgAlignmentBaseline()}" text-anchor="${this.svgTextAnchor()}" transform="${this.svgTransform()}" class="${this.style}">${this.text}</text>`
    }
}

type LeftRight = "left"|"right"
const leftRight: LeftRight[] = ["left", "right"]
type Axis = { side: LeftRight, quantType: QuantType, major: number, minor: number, min: number, max: number, scale: number }

function shiftTo(side: LeftRight, expr: number) {
    if (side == "left") {
        return -expr
    } else {
        return expr
    }
}

function drawAxis(axis: Axis, x: number, out: Primitive[]) {
    const sideColoredStyle = `graph-${axis.side}`
    const side = axis.side
    // draw vertical line
    out.push(new Line({x: x, y: -axis.min*axis.scale}, {x: x, y: -axis.max*axis.scale}, "graph-frame"))
    // draw axis label
    out.push(new Text({x: x + shiftTo(side, 50), y: -((axis.max + axis.min)/2)*axis.scale }, axis.quantType, side, "center", "hor", sideColoredStyle))
    // draw major ticks
    {
        const majorPts = 8
        let y = axis.min
        while (y <= axis.max) {
            out.push(new Line({x: x + shiftTo(side, majorPts), y: -y*axis.scale}, {x: x, y: -y*axis.scale}, "graph-frame"))
            out.push(new Text({x: x + shiftTo(side, majorPts + 8), y: -y*axis.scale}, y.toString(10), side, "center", "hor", "graph-frame"))
           y += axis.major
        }
    }
    // draw minor ticks
    {
        const minorPts = 4
        let y = axis.min
        while (y <= axis.max) {
            out.push(new Line({x: x + shiftTo(side, minorPts), y: -y*axis.scale}, {x: x, y: -y*axis.scale}, "graph-faint-frame"))
            y += axis.minor
        }
    }
}

function drawGraph(data: Array<[string,string,QuantType,QuantStats]>, out: Primitive[]) {
    const axiss: Map<LeftRight,Axis> = new Map()
    data.forEach((tuple) => {
        let setSide: LeftRight|null = null
        const [label1, label2, quantType, quantStats] = tuple
        if (axiss.has("left")) {
            if (axiss.get("left")!.quantType != quantType) {
                if (axiss.has("right")) {
                    if (axiss.get("right")!.quantType != quantType) {
                        throw Error("can't display more than two quant-types in one graph")
                    }
                } else {
                    setSide = "right"
                }
            } 
        } else {
            setSide = "left"
        }
        if (setSide) {
            axiss.set(setSide, { side: setSide, quantType: quantType, minor: .1, major: 1, min: 0, max: 2, scale: 1.0 })
        }
    })
    if (!axiss.has("left")) {
        throw Error("empty data")
    }
    data.forEach((tuple) => {
        const [label1, label2, quantType, quantStats] = tuple
        axiss.forEach((axis, side) => {
            if (axis.quantType == quantType) {
                while (quantStats.min < axis.min) {
                    axis.min -= axis.major
                    if (((axis.max - axis.min) / axis.major) == 10) {
                        axis.major = axis.major * 10
                        axis.minor = axis.minor * 10
                        axis.min -= axis.major
                    }
                }
                while (quantStats.max > axis.max) {
                    axis.max += axis.major
                    if (((axis.max - axis.min) / axis.major) == 10) {
                        axis.major = axis.major * 10
                        axis.minor = axis.minor * 10
                        axis.max += axis.major
                    }
                }
            }
        })
    })
    if (!axiss.has("right")) {
        const a = axiss.get("left")!
        axiss.set("right", { side: "right", quantType: a.quantType, minor: a.minor, major: a.major, min: a.min, max: a.max, scale: a.scale })
    }

    const canvasHeight = 600 // pts
    let ybot = 0, ytop = 0
    axiss.forEach((axis, side) => {
        axis.scale = canvasHeight / (axis.max - axis.min)
        const ymin = (axis.min * axis.scale)
        if (ymin < ybot) {
            ybot = ymin
        }
        const ymax = (axis.max * axis.scale)
        if (ymax > ytop) {
            ytop = ymax
        }
    })
    let x = 0
    drawAxis(axiss.get("left")!, 0, out)
    data.forEach((tuple) => {
        const [label1, label2, quantType, quantStats] = tuple
        let scale = 0
        let sideColoredStyle = ""
        let sideColoredFaintStyle = ""
        axiss.forEach((axis, side) => {
            if (axis.quantType == quantType) {
                scale = axis.scale
                sideColoredStyle = `graph-${axis.side}`
                sideColoredFaintStyle = `graph-faint-${axis.side}`
            }
        })
        if (scale == 0) {
            return
        }
        x += 120
        out.push(new Text({ x: x, y: -ybot + 40 }, quantType, "center", "center", "hor", sideColoredStyle))
        out.push(new Text({ x: x, y: -ybot + 60 }, label2, "center", "center", "hor", "graph-frame"))
        out.push(new Text({ x: x, y: -ybot + 80 }, label1, "center", "center", "hor", "graph-frame"))
        out.push(new Line({ x: x, y: -ytop }, { x: x, y: -ybot }, "graph-faint-frame"))
        quantStats.raw.forEach((q) => {
            const y = q * scale
            const markerPts = 4
            out.push(new Line({ x: x - markerPts, y: -(y - markerPts) }, { x: x + markerPts, y: -(y + markerPts) }, sideColoredFaintStyle))
            out.push(new Line({ x: x + markerPts, y: -(y - markerPts) }, { x: x - markerPts, y: -(y + markerPts) }, sideColoredFaintStyle))
        })
        const boxPts = 8
        const mean = quantStats.mean
        const stddev = quantStats.stddev;
        [mean + stddev, mean, mean - stddev].forEach((y) => {
            out.push(new Line({ x: x - boxPts, y: -(y * scale) }, { x: x + boxPts, y: -(y * scale) }, sideColoredStyle))
        })
        out.push(new Line({ x: x, y: -((mean - stddev) * scale) }, { x: x, y: -((mean + stddev) * scale) }, sideColoredStyle))
    })
    x += 120
    out.push(new Line({x:0, y:-ytop}, {x:x, y:-ytop}, "graph-frame"))
    out.push(new Line({x:0, y:-ybot}, {x:x, y:-ybot}, "graph-frame"))
    const rightAxis = axiss.get("right") 
    if (rightAxis) {
        drawAxis(rightAxis, x, out)
    }
}

function primitivesBoundingBox(primitives: Primitive[]): BoundingBox  {
    let bb = {x1: 0, y1: 0, x2: 0, y2: 0}
    primitives.forEach((primitive) => {
        bb = joinBoundingBoxes(bb, primitive.boundingBox())
    })
    return bb
}

function primitives2svg(primitives: Primitive[]): string {
    const bb = primitivesBoundingBox(primitives)
    const lines: string[] = [`<svg viewBox="${bb.x1} ${bb.y1} ${bb.x2-bb.x1} ${bb.y2-bb.y1}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="graph-svg">
    <g id="graph-layer">`
]
    primitives.forEach((primitive) => {
        lines.push(primitive.svg())
    })
    lines.push(`</g></svg>`)
    return lines.join("\n")
}

const html_preamble = `
<html>
  <head>
    <title>`
const html_2amble = `
    </title>
    <style>
    html, body {
        height: 100%;
    }
    #graph-div {
        height: 100%;
        min-height: 100%;
	    display: flex;
	    flex-direction: column;
    }
    #graph-svg {
        display: flex;
		flex-direction: column;
        justify-content: center;
    }
    .graph-frame {
        font-size: 12px;
        stroke-width:1;
        stroke:rgb(0,0,0);
    }
    .graph-faint-frame {
        font-size: 12px;
        stroke-width:1;
        stroke:rgba(0,0,0,0.4);
    }
    .graph-left {
        font-size: 12px;
        stroke-width:1;
        stroke:rgb(180,80,180);
    }
    .graph-right {
        font-size: 12px;
        stroke-width:1;
        stroke:rgb(80,180,180);
    }    
    .graph-faint-left {
        font-size: 12px;
        stroke-width:1;
        stroke:rgba(180,80,180,0.4);
    }
    .graph-faint-right {
        font-size: 12px;
        stroke-width:1;
        stroke:rgba(80,180,180,0.4);
    }    
    </style>
  </head>
  <body>
    <div id="graph-div">`
const html_postamble = `
    </div>
  </body>
</html>`

export function primitives2html(title: string, primitives: Primitive[]): string {
    const lines: string[] = [html_preamble]
    lines.push(title)
    lines.push(html_2amble)
    lines.push(primitives2svg(primitives))
    lines.push(html_postamble)
    return lines.join("\n")
}

digest.forEach((digest2, arrowType) => {
    const name2 = "" + arrowType
    digest2.forEach((digest3, meshType) => {
        const name3 = name2 + "_" + meshType.toLocaleLowerCase()
        const primitives: Primitive[] = []
        const data: Array<[string, string, QuantType, QuantStats]> = []
        digest3.forEach((digest4, walkType) => {
            digest4.forEach((quantStats, quantType) => {
                if (quantType == "link_dist" || quantType == "orient_tests") {
                    data.push(["", walkType, quantType, quantStats])
                }
            })
        })
        const sortedData = data.sort((a, b) => {
            const [al1, al2, aqt, aqs] = a; const [bl1, bl2, bqt, bqs] = b
            return `${aqt},${al1},${al2}`.localeCompare(`${bqt},${bl1},${bl2}`);
        })
        drawGraph(sortedData, primitives)
        fs.writeFileSync("./benchmarks/output/graphs/" + name3 + ".html", primitives2html(name3, primitives))
    })
});

meshTypes.forEach((meshType) => {
    walkTypes.forEach((walkType) => {
        const data: Array<[string, string, QuantType, QuantStats]> = []
        const primitives: Primitive[] = [] 
        const name3 = meshType.toLowerCase() + "_" + walkType.toLocaleLowerCase() 
        digest.forEach((digest2, arrowType) => {
            const digest4 = digest2.get(meshType)!.get(walkType)!
            digest4.forEach((quantStats, quantType) => {
                if (quantType == "orient_tests") {
                    data.push(["", ""+arrowType, quantType, quantStats])
                }
            })
        })
        const sortedData = data.sort((a, b) => {
            const [al1, al2, aqt, aqs] = a; const [bl1, bl2, bqt, bqs] = b
            return `${al1},${(parseInt(al2)/360).toFixed(4)},${aqt}`.localeCompare(`${bl1},${(parseInt(bl2)/360).toFixed(4)},${bqt}`);
        })
        drawGraph(sortedData, primitives)
        fs.writeFileSync("./benchmarks/output/graphs/" + name3 + ".html", primitives2html(name3, primitives))
    })
})

















