import * as Geom from './geom';

const preamble = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" 
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg viewBox="-210 -210 420 420"
     xmlns="http://www.w3.org/2000/svg" version="1.1">`

const postamble = `</svg>`

function mesh2svg(m: Geom.Mesh): [string] {
    const chunks: [string] = [preamble]

    let edges = Geom.gather_edges(m)
    edges.forEach((e) => {
        const p1 = e.half.origin.pos
        const p2 = e.half.target.pos
        chunks.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" style="stroke:rgb(255,0,0);stroke-width:2"/>')
    })

    chunks.push(postamble)

    return chunks
}

function random_pos(): Geom.Vec2 {
    let x: number = Math.floor(Math.random() * 400) - 200;
    let y: number = Math.floor(Math.random() * 400) - 200;
    return { x: x, y: y }
}

let m = Geom.mesh()
Geom.triangulate_mesh(m)

const N = 20;

for (var i = 1; i <= N; i++) {
    let p = random_pos()
    Geom.insert(m.north, p)
}

console.log("<!-- raw mesh -->")
mesh2svg(m).forEach((chunk) => { console.log(chunk) })

Geom.delaunafy(m)

console.log("<!-- Delaunay mesh -->")
mesh2svg(m).forEach((chunk) => { console.log(chunk) })
