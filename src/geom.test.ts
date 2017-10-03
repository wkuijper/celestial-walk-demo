import * as Its from './geom';
import { expect } from 'chai';
import 'mocha';

describe('orientation', () => {

    it('function', () => {
        const a: Its.Vec2 = { x: 2, y: 2 }
        const b: Its.Vec2 = { x: 5, y: 2 }
        const c: Its.Vec2 = { x: 5, y: 5 }
        const d: Its.Vec2 = { x: 6, y: 2 }
        expect(Its.orient(a, b, c)).to.be.greaterThan(0)
        expect(Its.orient(c, b, a)).to.be.lessThan(0)
        expect(Its.orient(a, b, d)).to.equal(0)
    })

    it('predicates', () => {
        const a: Its.Vec2 = { x: 2, y: 2 }
        const b: Its.Vec2 = { x: 5, y: 2 }
        const c: Its.Vec2 = { x: 5, y: 5 }
        const d: Its.Vec2 = { x: 6, y: 2 }
        const ac: Its.Line = { p1: a, p2: c}
        const ab: Its.Line = { p1: a, p2: b}
        const ba: Its.Line = { p1: b, p2: a}
        const ad: Its.Line = { p1: a, p2: d}
        const cd: Its.Line = { p1: c, p2: d}
        expect(Its.strictly_right_of(ac, b)).to.be.true
        expect(Its.strictly_right_of(ab, c)).to.be.false
        expect(Its.strictly_left_of(ab, c)).to.be.true
        expect(Its.strictly_right_of(ba, c)).to.be.true
        expect(Its.strictly_left_of(ba, c)).to.be.false
        expect(Its.right_or_on_top_of(ad, b)).to.be.true
        expect(Its.left_or_on_top_of(ad, b)).to.be.true
        expect(Its.strictly_left_of(ad, b)).to.be.false
        expect(Its.on_line(cd, b)).to.be.false
        expect(Its.on_line(ad, b)).to.be.true
        expect(Its.on_line(ab, d)).to.be.true
    })

    it ('incircle', () => {
        const n: Its.Vec2 = { x: 0, y: 2 }
        const e: Its.Vec2 = { x: 2, y: 0 }
        const s: Its.Vec2 = { x: 0, y: -2 }
        const w: Its.Vec2 = { x: -2, y: 0 }
        const es: Its.Vec2 = { x: 1, y: 0 }
        const el: Its.Vec2 = { x: 3, y: 0 }
        expect(Its.incircle(n, w, s, e)).to.be.false
        expect(Its.incircle(n, w, s, el)).to.be.false
        expect(Its.incircle(n, w, s, es)).to.be.true
    })
});

describe('vector', () => {
    
    it('addition/subtraction', () => {
        const a: Its.Vec2 = { x: 2, y: 3 }
        const b: Its.Vec2 = { x: -3, y: 2 }
        expect(Its.plus(a, b)).to.deep.equal({ x: -1, y: 5})
        expect(Its.minus(b, a)).to.deep.equal({ x: -5, y: -1})
    })

    it('left/right rotations', () => {
        const a: Its.Vec2 = { x: 2, y: 3 }
        const b: Its.Vec2 = { x: -3, y: 2 }
        expect(Its.rotate_left(a)).to.deep.equal(b)
        expect(Its.rotate_right(b)).to.deep.equal(a)
    })

});

describe('mesh', () => {

  it('constructor', () => {
    const m = Its.mesh();
    let n: Its.HalfEdge = m.north
    expect(n.next.next.next.next).to.equal(n)
    expect(n.next.left).to.equal(n.left)
    expect(n.next.next.left).to.equal(n.left)
    expect(n.next.next.next.left).to.equal(n.left)
    expect(n.prev.prev.prev.prev).to.equal(n)
    expect(n.edge.half.edge).to.equal(n.edge)
    expect(n.next.edge.half.edge).to.equal(n.next.edge)
    expect(n.next.next.edge.half.edge).to.equal(n.next.next.edge)
    expect(n.next.next.next.edge.half.edge).to.equal(n.next.next.next.edge)
    expect(n.edge).to.not.equal(n.next.edge)
    expect(n.twin!).to.be.undefined
    expect(n.next.twin!).to.be.undefined
    expect(n.next.next.twin!).to.be.undefined
    expect(n.next.next.next.twin!).to.be.undefined
    expect(n.target).to.equal(n.next.origin)
    expect(n.next.target).to.equal(n.next.next.origin)
    expect(n.next.next.target).to.equal(n.next.next.next.origin)
    expect(n.next.next.next.target).to.equal(n.origin)
  });

  it('triangulation', () => {
    const m = Its.mesh();
    let n: Its.HalfEdge = m.north
    Its.triangulate_mesh(m)
    expect(n.next.next.next).to.equal(n)
    expect(n.next.left).to.equal(n.left)
    expect(n.next.next.left).to.equal(n.left)
    expect(n.next.next.next.left).to.equal(n.left)
    expect(n.prev.prev.prev).to.equal(n)
    expect(n.edge.half.edge).to.equal(n.edge)
    expect(n.next.edge.half.edge).to.equal(n.next.edge)
    expect(n.next.next.edge.half.edge).to.equal(n.next.next.edge)
    expect(n.edge).to.not.equal(n.next.edge)
    expect(n.twin!).to.be.undefined
    expect(n.prev.twin!).to.not.be.undefined
    expect(n.prev.twin!.twin!).to.equal(n.prev)
    expect(n.prev.twin!.next.next.next).to.equal(n.prev.twin!)
    expect(n.prev.twin!.left).to.not.equal(n.left)
    expect(n.prev.twin!.next.left).to.equal(n.prev.twin!.left)
    expect(n.prev.twin!.next.next.left).to.equal(n.prev.twin!.left)
    expect(n.prev.twin!.next).to.equal(n.prev.twin!.prev.prev)
  });

  it('walking', () => {
    const m = Its.mesh();
    let n: Its.HalfEdge = m.north
    Its.triangulate_mesh(m)
    const p: Its.Vec2 = {x: -150, y: 150}
    let f: Its.Face = Its.walk(n, p)
    expect(n.left).to.equal(f)
    const pp: Its.Vec2 = {x: 150, y: -150}
    let ff: Its.Face = Its.walk(n, pp)
    expect(n.prev.twin!.left).to.equal(ff)
  });

  it('insertion', () => {
    {
          const m = Its.mesh();
          let n: Its.HalfEdge = m.north
          Its.triangulate_mesh(m)
          const p: Its.Vec2 = { x: -150, y: 150 }
          Its.insert_vertex(m, p)
          expect(n.next.target.pos).to.equal(p)
          const p0: Its.Vec2 = { x: 0, y: 0 }
          Its.insert_vertex(m, p0)
          expect(n.prev.twin!.prev.origin.pos).to.equal(p0)
          expect(Its.insert_vertex(m, p0).pos).to.equal(p0)
    }
    {
        const m = Its.mesh();
        let n: Its.HalfEdge = m.north
        Its.triangulate_mesh(m)
        const p: Its.Vec2 = { x: 150, y: -150 }
        Its.insert_vertex(m, p)
        expect(n.prev.twin!.next.target.pos).to.equal(p)
    }
    {
        const p1 = { x: 44, y: -147}
        const p2 = { x: 31, y: -43}
        const p3 = { x: 27, y: -158}
        const m = Its.mesh();
        let n: Its.HalfEdge = m.north
        Its.triangulate_mesh(m)
        Its.insert_vertex(m, p1)
        Its.insert_vertex(m, p2)
        Its.insert_vertex(m, p3)
        //expect(n.prev.twin!.next.target.pos).to.equal(p)
    }
  });

});