import * as Geom from './geom'
import * as Walk from './walk'

const tikzScale = 1/10000

export function face2tikz(face: Geom.Face, clss: string): string {
    const p: Geom.Vec2 = face.some.origin.pos
    const words: string[] = [`    \\draw[${clss}] (${p.x*tikzScale}, ${p.y*tikzScale})`]
    Geom.gatherFaceEdges(face).forEach((e: Geom.HalfEdge) => {
        const p: Geom.Vec2 = e.target.pos
        words.push(` -- (${p.x*tikzScale}, ${p.y*tikzScale})`)
    })
    words.push(" -- cycle;")
    return words.join("")
}

export function mesh2tikz(title: string, m: Geom.Mesh, delaunayFaces?: boolean, walkStats?: Walk.Stats, line?: Geom.Line, showAll?: boolean): string {
    function drawStuff(): string {
        const lines: string[] = []
        const faces = Geom.gatherFaces(m)
        faces.forEach((f) => {
            lines.push(face2tikz(f, f.filled ? "mesh_filled_face" : "mesh_face"))
        })
        const edges = Geom.gatherEdges(m)
        edges.forEach((ee) => {
            if (ee.constrained) {
                const e = ee.half
                const p1 = e.origin.pos
                const p2 = e.target.pos
                lines.push(`    \\draw [mesh_constrained_edge] (${p1.x*tikzScale},${p1.y*tikzScale}) -- (${p2.x*tikzScale},${p2.y*tikzScale});`)
            }
        })
        if (delaunayFaces) {
            faces.forEach((f) => {
                if (Geom.isDelaunayTriangle(f)) {
                    lines.push(face2tikz(f, "delaunay_face"))
                }
            })  
        }
        if (walkStats) {
            walkStats.path.forEach((e) => {
                const p1 = e.origin.pos
                const p2 = e.target.pos
                lines.push(`    \\draw [path_edge] (${p1.x*tikzScale},${p1.y*tikzScale}) -- (${p2.x*tikzScale},${p2.y*tikzScale});`)
                lines.push(face2tikz(e.left, "path_face"))
            })
        }
        if (line) {
            lines.push(`    \\draw [arrow] (${line.p1.x*tikzScale},${line.p1.y*tikzScale}) -- (${line.p2.x*tikzScale},${line.p2.y*tikzScale});`)
        }
        return lines.join('\n')
    }
    return `% ${title}
\\begin{tikzpicture}[${showAll ? "scale=.5" : ""}]
  \\tikzstyle{mesh_face}=[fill=white,draw=gray,line width=.25pt]
  \\tikzstyle{mesh_filled_face}=[fill=gray!40,draw=gray,line width=.25pt]
  \\tikzstyle{mesh_constrained_edge}=[draw=black,line width=1pt]
  \\tikzstyle{delaunay_face}=[fill=yellow,fill opacity=0.3]
  \\tikzstyle{path_face}=[fill=green,fill opacity=0.5]
  \\tikzstyle{path_edge}=[draw=magenta,draw opacity=0.5,line width=2pt]
  \\tikzstyle{arrow}=[->,draw=blue,line width=2pt,draw opacity=0.5]
  ${!showAll ? "\\draw[black,line width=1pt] (-3,-3) rectangle (3,3);" : ""}
  \\begin{scope}
    ${!showAll ? "\\clip(-3,-3) rectangle (3,3);" : ""}
    ${drawStuff()}
  \\end{scope} 
\\end{tikzpicture}`
}


export function mesh2html(title: string, m: Geom.Mesh, delaunayFaces?: boolean, walkStats?: Walk.Stats, line?: Geom.Line, showAll?: boolean): string {
    return `<html>
  <head>
    <title>
      ${title}
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
    </style>
  </head>
  <body>
    <div id="mesh-div">
        ${mesh2svg(m, delaunayFaces, walkStats, line, showAll)}
    </div>
  </body>
</html>`
}

export function face2svg(face: Geom.Face, clss: string): string {
    const p: Geom.Vec2 = face.some.origin.pos
    const words: string[] = [`<path class="${clss}" d="M ${p.x} ${p.y}`]
    Geom.gatherFaceEdges(face).forEach((e: Geom.HalfEdge) => {
        const p: Geom.Vec2 = e.target.pos
        words.push(` L ${p.x} ${p.y}`)
    })
    words.push('"/>')
    return words.join("")
}

export function mesh2svg(m: Geom.Mesh, delaunayFaces?: boolean, walkStats?: Walk.Stats, line?: Geom.Line, showAll?: boolean): string {
    function meshFaceLayer(): string {
        const lines: string[] = []
        const faces = Geom.gatherFaces(m)
        faces.forEach((f) => {
            lines.push(face2svg(f, f.filled ? "mesh-filled-face" : "mesh-face"))
        })
        return lines.join('\n')
    }
    function delaunayLayer(): string {
        if (!delaunayFaces) {
            return ""
        }
        const lines: string[] = []
        Geom.gatherFaces(m).forEach((f) => {
            if (Geom.isDelaunayTriangle(f)) {
                lines.push(face2svg(f, "delaunay-face"))
            }
        })
        return lines.join('\n')
    }
    function meshLineLayer(): string {
        const lines: string[] = []
        const edges = Geom.gatherEdges(m)
        edges.forEach((e) => {
            const p1 = e.half.origin.pos
            const p2 = e.half.target.pos
            lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="${e.constrained ? "mesh-constrained-line" : "mesh-line"}"/>`)
        })
        return lines.join('\n')
    }
    function pathLayer(): string {
        if (!walkStats) {
            return ""
        }
        const lines: string[] = []
        const path = walkStats.path
        path.forEach((e) => {
            const p1 = e.origin.pos
            const p2 = e.target.pos
            lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="path-edge"/>`)
            lines.push(face2svg(e.left, "path-face"))
        })
        return lines.join('\n')
    }
    function arrowLayer(): string {
        if (!line) {
            return ""
        }
        const p1 = line.p1
        const p2 = line.p2
        return `<circle cx="${p1.x}" cy="${p1.y}" r="5" id="arrow-origin"/>
            ${p2 ? `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" id="arrow" marker-end="url(#arrow-head)"/>` : ""}`
    }
    return `<svg viewBox="${showAll ? "-80000 -80000 160000 160000" : "-22000 -22000 44000 44000"}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
    <style type="text/css">
    .mesh-line {
        stroke-width:100;
        stroke:rgb(100,100,100);
    }
    .mesh-constrained-line {
        stroke-width:200;
        stroke:rgb(50,50,50);
    }
    #arrow {
        stroke-width:200;
        stroke:rgb(0,0,200);
    }
    #arrow-head {
        fill:rgb(0,0,200);
    }
    #arrow-origin {
        fill:rgb(0,0,200);
    }
    .mesh-face {
        fill:rgb(255,255,255);
    }
    .mesh-filled-face {
        fill:rgb(200, 200, 200);
    }
    .path-face {
        fill:rgba(100, 200, 100,0.5);
    }
    .delaunay-face {
        fill:rgba(200, 200, 100,0.3);
    }
    .path-edge {
        stroke-width:300;
        stroke:rgba(150,0,200,0.5); 
    }
    </style>
    <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
        </marker>
    </defs>
    <g id="mesh-face-layer">
        ${meshFaceLayer()}
    </g>
    <g id="delaunay-layer">
        ${delaunayLayer()}
    </g>
    <g id="mesh-line-layer">
        ${meshLineLayer()}
    </g>
    <g id="path-layer">
        ${pathLayer()}
    </g>
    <g id="arrow-layer">
        ${arrowLayer()}
    </g>
</svg>`
}
