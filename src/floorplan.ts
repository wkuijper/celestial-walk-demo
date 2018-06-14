import * as Geom from './geom';

type CellType = "square"|"oval"|"halfoval"|"quartoval"
type CellOrient = "north"|"east"|"south"|"west"

type Cell = { x: number, y: number, width: number, height: number, inside: boolean }

console.log(randomFloorplan());

export function randomFloorplan(): string {
    const dim = 6
    const size = 30000
    const lines = randomLines(dim, size)
    const bites = 4
    const pattern = randomPattern(dim, bites)
    const cells = makeCells(dim, lines, pattern)
    return cells2html(cells)
}

export function cells2html(cells: Cell[][]): string {
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

export function cells2svg(cells: Cell[][]): string {
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

export function cells2svgSolid(cells: Cell[][]): string {
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

export function makeCells(dim: number, lines: [number[], number[]], pattern: boolean[][]): Cell[][] {
    const [hor, ver] = lines
    const cells: Cell[][] = []
    for (let h = 0; h < dim; h++) {
        const column: Cell[] = []
        cells.push(column)
        for (let v = 0; v < dim; v++) {
            const cell = { 
                x : hor[h], y: ver[v], 
                width: hor[h+1]-hor[h], height: ver[v+1]-ver[v],
                inside: pattern[h][v]
            }
            column.push(cell)
        }
    }
    return cells
}

export function randomPattern(dim: number, bites: number): boolean[][] {
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
        if (Math.random() < .5) {
            // pick a corner
            if (Math.random() < .5) { h = 0 } else { h = dim-1 }
            if (Math.random() < .5) { v = 0 } else { v = dim-1 }
        } else if (Math.random() < .5) {
            // pick a sidepoint
            if (Math.random() < .5) {
                // top or bottom
                if (Math.random() < .5) {
                    // top
                    v = 0; h = 2 + Math.floor(Math.random()*(dim-4))
                } else {
                    // bottom
                    v = dim-1; h = 2 + Math.floor(Math.random()*(dim-4))
                }
            } else {
                // left or right
                if (Math.random() < .5) {
                    // left
                    h = 0; v = 2 + Math.floor(Math.random()*(dim-4))
                } else {
                    // right
                    h = dim-1; v = 2 + Math.floor(Math.random()*(dim-4))
                }
            }
        } else {
            // pick an interior point
            h = 2 + Math.floor(Math.random()*(dim-4))
            v = 2 + Math.floor(Math.random()*(dim-4))
        }
        for (let c = 0; c <= b; c++) {
            if (h < 0 || h > dim-1 || v < 0 || v > dim-1) {
                break
            }
            if (!pattern[h][v]) {
                break
            }
            pattern[h][v] = false
            // step hor or ver
            if (Math.random() < .5) {
                if (Math.random() < .5) { h -= 1 } else { h += 1 }
            } else {
                if (Math.random() < .5) { v -= 1 } else { v += 1 }
            }
        }
    }
    return pattern
}

export function randomLines(dim: number, size: number): [number[], number[]] {
    const halfSize = Math.round(size/2)
    const horWeights: number[] = []
    let totHorWeight = 0
    for (let c = 0; c <= dim; c++) {
        const weight = 40 + Math.floor(Math.random()*160)
        horWeights.push(weight)
        totHorWeight += weight
    }
    const hor: number[] = []
    let x = -halfSize
    for (let c = 0; c <= dim; c++) {
        x += size*(horWeights[c]/totHorWeight)
        hor.push(Math.round(x))
    }
    const verWeights: number[] = []
    let totVerWeight = 0
    for (let c = 0; c <= dim; c++) {
        const weight = horWeights[c] + Math.floor(Math.random()*80)-20
        verWeights.push(weight)
        totVerWeight += weight
    }
    const ver: number[] = []
    let y = -halfSize
    for (let c = 0; c <= dim; c++) {
        y += size*(verWeights[c]/totVerWeight)
        ver.push(Math.round(y))
    }
    return [ hor, ver ]
}
