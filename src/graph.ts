import { treatedAll } from "./common";

type BoundingBox = { x1: number, y1: number, x2: number, y2: number }

function joinBoundingBoxes(bb1: BoundingBox, bb2: BoundingBox): BoundingBox {
    return { 
        x1: Math.min(bb1.x1, bb2.x1), y1: Math.min(bb1.y1, bb2.y1), 
        x2: Math.max(bb1.x2, bb2.x2), y2: Math.max(bb1.y2, bb2.y2) }
}

abstract class Primitive {
    abstract boundingBox(): BoundingBox
    abstract svg(): string
}

type Point = { x: number, y: number }
class Line extends Primitive { 
    p1: Point
    p2: Point
    style: string 
    constructor (p1: Point, p2: Point, style: string) {
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

type TextOrientAlign= "hor_left"|"hor_center"|"ver_center"
class Text extends Primitive { 
    pos: Point
    text: string
    orientAlign: TextOrientAlign
    style: string
    constructor(pos: Point, text: string, orientAlign: TextOrientAlign, style: string) {
        super()
        this.pos = pos
        this.text = text
        this.orientAlign = orientAlign
        this.style = style
    }
    boundingBox(): BoundingBox {
        const width = Math.max(2, this.text.length) * 11
        const height = 22
        if (this.orientAlign == "hor_left") {
            return { x1: this.pos.x - width, y1: this.pos.y - height, x2: this.pos.x, y2: this.pos.y + height }
        } else if (this.orientAlign == "hor_center") {
            return { x1: this.pos.x - width/2, y1: this.pos.y - height, x2: this.pos.x + width/2, y2: this.pos.y + height }
        } else if (this.orientAlign == "ver_center") {
            return { x1: this.pos.x - height, y1: this.pos.y - width/2, x2: this.pos.x + height, y2: this.pos.y + width/2 }
        }
        return treatedAll(this.orientAlign)
    }
    svg(): string {
        if (this.orientAlign == "hor_left") {
            return `<text x="${this.pos.x}" y="${this.pos.y}" alignment-baseline="middle" text-anchor="end" class="${this.style}">${this.text}</text>`
        } else if (this.orientAlign == "hor_center") {
            return `<text x="${this.pos.x}" y="${this.pos.y}" alignment-baseline="middle" text-anchor="middle" class="${this.style}">${this.text}</text>`
        } else if (this.orientAlign == "ver_center") {
            return `<text x="${this.pos.x}" y="${this.pos.y}" alignment-baseline="middle" writing-mode="tb" text-anchor="middle" class="${this.style}">${this.text}</text>`
        }
        return treatedAll(this.orientAlign)
    }
}

type Axis = { label: string, major: number, minor: number, min: number, max: number }

function drawAxis(axis: Axis, scale: number, out: Primitive[]) {
    // draw vertical line
    out.push(new Line({x: 0, y: scale*axis.min}, {x: 0, y: scale*axis.max}, "graph-frame"))
    // draw axis label
    out.push(new Text({x: -80, y: scale*(axis.min+axis.max)/2}, axis.label, "ver_center", "graph-label"))
    // draw major ticks
    {
        const majorPts = 8
        let y = axis.min
        while (y <= axis.max) {
            out.push(new Line({x: -majorPts, y: y*scale}, {x: 0, y: y*scale}, "graph-frame"))
            out.push(new Text({x: -majorPts-8, y: y*scale}, y.toString(10), "hor_left", "graph-ver-tick-text"))
           y += axis.major
        }
    }
    // draw minor ticks
    {
        const minorPts = 4
        let y = axis.min
        while (y <= axis.max) {
            out.push(new Line({x: -minorPts, y: y*scale}, {x: 0, y: y*scale}, "graph-faint-frame"))
            y += axis.minor
        }
    }
}

function sizedAxis(label: string, datas: Map<string, number[]>): Axis {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    datas.forEach((data, item) => {
        data.forEach((datum) => {
            if (datum < min) {
                min = datum
            }
            if (datum > max) {
                max = datum
            }
        })
    })
    const axis: Axis = { label: label, minor: 1, major: 10, min: 0, max: 20 }
    while (min <= axis.min) {
        axis.min -= axis.minor
        if (((axis.max - axis.min) / axis.major) == 10) {
            axis.major = axis.major * 10
            axis.minor = axis.minor * 10
            axis.min -= axis.major
        }
    }
    while (max >= axis.max) {
        axis.max += axis.minor
        if (((axis.max - axis.min) / axis.major) == 10) {
            axis.major = axis.major * 10
            axis.minor = axis.minor * 10
            axis.max += axis.major
        }
    }
    return axis
}

function calcMeanAndStddev(data: number[]): [number, number] {
    if (data.length < 2) {
        throw Error("too few data")
    }
    let tot = 0
    data.forEach((datum) => { tot += datum })
    const mean = tot / data.length
    let sqd = 0
    data.forEach((datum) => { sqd += (datum-mean)**2})
    const stddev = Math.sqrt(sqd / (data.length-1))
    return [mean, stddev]
}

function drawGraph(title: string, horLbl: string, verLbl: string, datas: Map<string, number[]>, out: Primitive[]) {
    const canvasHeight = 600 // pts
    const axis = sizedAxis(verLbl, datas)
    const scale = -(canvasHeight/(axis.max-axis.min))
    drawAxis(axis, scale, out)
    let x = 0
    const ytop = scale*axis.max
    const ybot = scale*axis.min
    datas.forEach((data, item) => {
        x += 120
        const [label1, label2, label3] = item.split(' ').concat(["", "", ""])
        out.push(new Text({ x: x, y: ybot+40 }, label1, "hor_center", "graph-hor-item-text"))
        out.push(new Text({ x: x, y: ybot+60 }, label2, "hor_center", "graph-hor-item-text"))
        out.push(new Text({ x: x, y: ybot+80 }, label3, "hor_center", "graph-hor-item-text"))
        out.push(new Line({ x: x, y: ytop }, { x: x, y: ybot }, "graph-faint-frame"))
        data.forEach((datum) => {
            const y = scale*datum
            const markerPts = 4
            out.push(new Line({ x: x-markerPts, y: y-markerPts }, { x: x+markerPts, y: y+markerPts }, "graph-marker"))
            out.push(new Line({ x: x+markerPts, y: y-markerPts }, { x: x-markerPts, y: y+markerPts }, "graph-marker"))
        })
        const [mean, stddev] = calcMeanAndStddev(data)
        const ys = [mean+stddev, mean, mean-stddev].map((datum) => scale*datum)
        const boxPts = 8
        ys.forEach((y) => {
            out.push(new Line({ x: x-boxPts, y: y }, { x: x+boxPts, y: y }, "graph-interval"))
        })
        out.push(new Line({ x: x, y: ys[0] }, { x: x, y: ys[2] }, "graph-interval"))
    })
    x += 120
    out.push(new Line({x:0, y:ytop}, {x:x, y:ytop}, "graph-frame"))
    out.push(new Line({x:0, y:ybot}, {x:x, y:ybot}, "graph-frame"))
    out.push(new Line({x:x, y:ytop}, {x:x, y:ybot}, "graph-frame"))
    out.push(new Text({ x: x/2, y: ybot+100}, horLbl, "hor_center", "graph-axis-lbl-text"))
    out.push(new Text({ x: x/2, y: ytop-40}, title, "hor_center", "graph-axis-lbl-text"))
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
    <g id="graph-layer">`]
    primitives.forEach((primitive) => {
        lines.push(primitive.svg())
    })
    lines.push(`</g></svg>`)
    return lines.join("\n")
}

function primitives2html(title: string, primitives: Primitive[]): string {
    return `
    <html><head>
        <title>${title}</title>
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
        .graph-frame, .graph-interval {
            font-size: 12px;
            stroke-width:1;
            stroke:rgb(0,0,0);
        }
        .graph-faint-frame, .graph-marker {
            font-size: 12px;
            stroke-width:1;
            stroke:rgba(0,0,0,0.4);
        }
        .graph-ver-tick-text {
            font-size: 10px;
            color: black;
        }
        .graph-title-text {
            font-size: 24px;
            color: black;
        }
        .graph-axis-lbl-text {
            font-size: 16px;
            color: black;
        }
        .graph-hor-item-text {
            font-size: 12px;
            color: black;
        }
        </style>
      </head>
      <body>
        <div id="graph-div">
            ${primitives2svg(primitives)}
        </div>
      </body>
    </html>`
}

export function html(title: string, horLbl: string, verLbl: string, datas: Map<string, number[]>) {
    const primitives: Primitive[] = []
    drawGraph(title, horLbl, verLbl, datas, primitives)
    return primitives2html(title, primitives)
}

/*
const primitives: Primitive[] = []
const datas: Map<string, number[]> = new Map()
datas.set("set1", [66,75,82,79,68,73])
datas.set("set2", [84,82,89,81,96,75])
datas.set("set3", [42,48,51,47,49,57, 34])
drawGraph("test", "hor", "ver", datas, primitives)
console.log(primitives2html("test", primitives))
*/