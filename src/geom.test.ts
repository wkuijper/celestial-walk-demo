import * as Geom from './geom';
import { expect } from 'chai';
import 'mocha';

import * as fs from 'fs';
import { stat } from 'fs/promises';

describe('orientation', () => {

    it('function', () => {
        const a: Geom.Vec2 = { x: 2, y: 2 }
        const b: Geom.Vec2 = { x: 5, y: 2 }
        const c: Geom.Vec2 = { x: 5, y: 5 }
        const d: Geom.Vec2 = { x: 6, y: 2 }
        expect(Geom.orient(a, b, c)).to.be.greaterThan(0)
        expect(Geom.orient(c, b, a)).to.be.lessThan(0)
        expect(Geom.orient(a, b, d)).to.equal(0)
    })

    it('predicates', () => {
        const a: Geom.Vec2 = { x: 2, y: 2 }
        const b: Geom.Vec2 = { x: 5, y: 2 }
        const c: Geom.Vec2 = { x: 5, y: 5 }
        const d: Geom.Vec2 = { x: 6, y: 2 }
        const ac: Geom.Line = { p1: a, p2: c }
        const ab: Geom.Line = { p1: a, p2: b }
        const ba: Geom.Line = { p1: b, p2: a }
        const ad: Geom.Line = { p1: a, p2: d }
        const cd: Geom.Line = { p1: c, p2: d }
        expect(Geom.strictlyRightOf(ac, b)).to.be.true
        expect(Geom.strictlyRightOf(ab, c)).to.be.false
        expect(Geom.strictlyLeftOf(ab, c)).to.be.true
        expect(Geom.strictlyRightOf(ba, c)).to.be.true
        expect(Geom.strictlyLeftOf(ba, c)).to.be.false
        expect(Geom.rightOrOnTopOf(ad, b)).to.be.true
        expect(Geom.leftOrOnTopOf(ad, b)).to.be.true
        expect(Geom.strictlyLeftOf(ad, b)).to.be.false
        expect(Geom.onLine(cd, b)).to.be.false
        expect(Geom.onLine(ad, b)).to.be.true
        expect(Geom.onLine(ab, d)).to.be.true
    })

    it('incircle', () => {
        const n: Geom.Vec2 = { x: 0, y: 2 }
        const e: Geom.Vec2 = { x: 2, y: 0 }
        const s: Geom.Vec2 = { x: 0, y: -2 }
        const w: Geom.Vec2 = { x: -2, y: 0 }
        const es: Geom.Vec2 = { x: 1, y: 0 }
        const el: Geom.Vec2 = { x: 3, y: 0 }
        expect(Geom.incircle(n, w, s, e)).to.be.false
        expect(Geom.incircle(n, w, s, el)).to.be.false
        expect(Geom.incircle(n, w, s, es)).to.be.true
    })
});

describe('vector', () => {

    it('addition/subtraction/multiplication', () => {
        const a: Geom.Vec2 = { x: 2, y: 3 }
        const b: Geom.Vec2 = { x: -3, y: 2 }
        expect(Geom.plus(a, b)).to.deep.equal({ x: -1, y: 5 })
        expect(Geom.minus(b, a)).to.deep.equal({ x: -5, y: -1 })
        expect(Geom.mult(a, 2)).to.deep.equal({ x: 4, y: 6 })
    })

    it('left/right rotations', () => {
        const a: Geom.Vec2 = { x: 2, y: 3 }
        const b: Geom.Vec2 = { x: -3, y: 2 }
        expect(Geom.rotateLeft(a)).to.deep.equal(b)
        expect(Geom.rotateRight(b)).to.deep.equal(a)
    })

});

describe('mesh', () => {

    it('constructor', () => {
        const m = Geom.mesh();
        let n: Geom.HalfEdge = m.north
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
        const m = Geom.mesh();
        let n: Geom.HalfEdge = m.north
        Geom.triangulateMesh(m)
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
        const m = Geom.mesh();
        let n: Geom.HalfEdge = m.north
        Geom.triangulateMesh(m)
        const p: Geom.Vec2 = { x: -150, y: 150 }
        let f: Geom.Face = Geom.walk(n, p)
        expect(n.left).to.equal(f)
        const pp: Geom.Vec2 = { x: 150, y: -150 }
        let ff: Geom.Face = Geom.walk(n, pp)
        expect(n.prev.twin!.left).to.equal(ff)
    });

    it('connected', () => {
        const m = Geom.mesh();
        let n: Geom.HalfEdge = m.north
        expect(Geom.connected(m.north.origin, m.north.target)).to.equal(m.north.edge)
        expect(Geom.connected(m.north.target, m.north.origin)).to.equal(m.north.edge)
    })

    it('insertion', () => {
        {
            const m = Geom.mesh();
            let n: Geom.HalfEdge = m.north
            Geom.triangulateMesh(m)
            const p: Geom.Vec2 = { x: -150, y: 150 }
            Geom.insertVertex(m, p)
            expect(n.next.target.pos).to.equal(p)
            const p0: Geom.Vec2 = { x: 0, y: 0 }
            Geom.insertVertex(m, p0)
            expect(n.prev.twin!.prev.origin.pos).to.equal(p0)
            expect(Geom.insertVertex(m, p0).pos).to.equal(p0)
        }
        {
            const m = Geom.mesh();
            let n: Geom.HalfEdge = m.north
            Geom.triangulateMesh(m)
            const p: Geom.Vec2 = { x: 150, y: -150 }
            Geom.insertVertex(m, p)
            expect(n.prev.twin!.next.target.pos).to.equal(p)
        }
    });

    it('constraining', () => {
        {
            const m = Geom.mesh();
            Geom.triangulateMesh(m)
            const points: Geom.Vec2[] = [
                { x: -150, y: 150 },
                { x: 150, y: -150 }
            ]
            const vertices: Geom.Vertex[] = []
            points.forEach((p) => {
                vertices.push(Geom.insertVertex(m, p))
            })
            const start = vertices[0]
            const finish = vertices[1]
            const connectingEdge: Geom.HalfEdge = Geom.flipToConnectVertices(start, finish)
            expect(connectingEdge.origin).to.equal(start)
            expect(connectingEdge.target).to.equal(finish)
        }
        {
            const m = Geom.mesh();
            Geom.triangulateMesh(m)
            const points: Geom.Vec2[] = [
                { x: 150, y: 150 },
                { x: -150, y: -150 }
            ]
            const vertices: Geom.Vertex[] = []
            points.forEach((p) => {
                vertices.push(Geom.insertVertex(m, p))
            })
            const start = vertices[0]
            const finish = vertices[1]
            const connectingEdge: Geom.HalfEdge = Geom.flipToConnectVertices(start, finish)
            expect(connectingEdge.origin).to.equal(start)
            expect(connectingEdge.target).to.equal(finish)
        }
        {
            const m = Geom.mesh();
            Geom.triangulateMesh(m)
            const points: Geom.Vec2[] = [
                { x: -15000, y: 15000 },
                { x: 15000, y: -15000 },
                { x: -5000, y: 2500 },
                { x: 5000, y: -2500 }
            ]
            const vertices: Geom.Vertex[] = []
            points.forEach((p) => {
                vertices.push(Geom.insertVertex(m, p))
            })
            const start = vertices[0]
            const finish = vertices[1]
            const connectingEdge: Geom.HalfEdge = Geom.flipToConnectVertices(start, finish)
            expect(connectingEdge.origin).to.equal(start)
            expect(connectingEdge.target).to.equal(finish)
        }
        {
            const m = Geom.mesh();
            Geom.triangulateMesh(m)
            const points: Geom.Vec2[] = [
                { x: -15000, y: 15000 },
                { x: 15000, y: -15000 },
                { x: -5000, y: 2500 },
                { x: 5000, y: -2500 },
                { x: -8754, y: 7898 },
                { x: 3678, y: 2588 },
                { x: -543, y: 6238 },
                { x: 324, y: 376 },
                { x: -8990, y: -3784 },
                { x: 2653, y: 2599 },
                { x: -1230, y: -2178 },
                { x: 2654, y: -7632 },
                { x: 6533, y: -3653 },
                { x: -60, y: 243 },
            ]
            const vertices: Geom.Vertex[] = []
            points.forEach((p) => {
                vertices.push(Geom.insertVertex(m, p))
            })
            const start = vertices[0]
            const finish = vertices[1]
                const connectingEdge: Geom.HalfEdge = Geom.flipToConnectVertices(start, finish)
                expect(connectingEdge.origin).to.equal(start)
                expect(connectingEdge.target).to.equal(finish)
        }
        {
            const m = Geom.mesh();
            Geom.triangulateMesh(m)
            const points: Geom.Vec2[] = [
                { x: -15000, y: 15000 },
                { x: 15000, y: -15000 },
                { x: -5000, y: 2500 },
                { x: 5000, y: -2500 },
                { x: -8754, y: 7898 },
                { x: 3678, y: 2588 },
                { x: -543, y: 6238 },
                { x: 324, y: 376 },
                { x: -8990, y: -3784 },
                { x: 2653, y: 2599 },
                { x: -1230, y: -2178 },
                { x: 2654, y: -7632 },
                { x: 6533, y: -3653 },
                { x: -60, y: 243 },
            ]
            const vertices: Geom.Vertex[] = []
            points.forEach((p) => {
                vertices.push(Geom.insertVertex(m, p))
            })
            Geom.delaunafy(m)
            const start = vertices[0]
            const finish = vertices[1]
                const connectingEdge: Geom.HalfEdge = Geom.flipToConnectVertices(start, finish)
                expect(connectingEdge.origin).to.equal(start)
                expect(connectingEdge.target).to.equal(finish)
        }
    });

    it('drawing', () => {
        {
            const m = Geom.mesh();
            Geom.triangulateMesh(m)
            Geom.draw(m, { p1: { x: -10000, y: -10000 }, p2: { x: -10000, y: 10000}}, false, true)
            Geom.draw(m, { p1: { x: -10000, y: 10000 }, p2: { x: 10000, y: 10000}}, false, true)
            Geom.draw(m, { p1: { x: 10000, y: 10000 }, p2: { x: 10000, y: -10000}}, false, true)
            Geom.draw(m, { p1: { x: 10000, y: -10000 }, p2: { x: -10000, y: -10000}}, false, true)
            Geom.draw(m, { p1: { x: -15000, y: -15000 }, p2: { x: -15000, y: 5000}}, false, true)
            Geom.draw(m, { p1: { x: -15000, y: 5000 }, p2: { x: 5000, y: 5000}}, false, true)
            Geom.draw(m, { p1: { x: 5000, y: 5000 }, p2: { x: 5000, y: -15000}}, false, true)
            Geom.draw(m, { p1: { x: 5000, y: -15000 }, p2: { x: -15000, y: -15000}}, false, true)

            Geom.draw(m, { p1: { x: -15000, y: 5000 }, p2: { x: 5000, y: -15000}}, false, false)
            Geom.draw(m, { p1: { x: -10000, y: 10000 }, p2: { x: 10000, y: -10000}}, false, false)

            for (let h = -20000; h <= 15000; h += 1000) {
                for (let v = -20000; v <= 15000; v += 1000) {
                    Geom.insertVertex(m, {x: h + Math.round(Math.random() * 500), y: v + Math.round(Math.random() * 500)})
                }
            }
            //Geom.delaunafy(m)
            Geom.floodFill(m)
            Geom.convexify(m)
        }
    });

    it('obtuseness', () => {
        const p1 = { x: 44, y: -147 }
        const p2 = { x: 31, y: -43 }
        const p3 = { x: 27, y: -158 }
        const m = Geom.mesh();
        let n: Geom.HalfEdge = m.north
        Geom.triangulateMesh(m)
        Geom.insertVertex(m, p1)
        Geom.insertVertex(m, p2)
        Geom.insertVertex(m, p3)
        let edges = Geom.gatherHalfEdges(m)
        edges.forEach(e => {
            expect(Geom.computeObtuseness(e)).to.equal(e.obtuse)
        })
        const p4 = { x: -54, y: -174 }
        const p5 = { x: -131, y: 44 }
        const p6 = { x: 207, y: 158 }
        Geom.insertVertex(m, p4)
        Geom.insertVertex(m, p5)
        Geom.insertVertex(m, p6)
        edges = Geom.gatherHalfEdges(m)
        edges.forEach(e => {
            expect(Geom.computeObtuseness(e)).to.equal(e.obtuse)
        })
        Geom.delaunafy(m)
        edges = Geom.gatherHalfEdges(m)
        edges.forEach(e => {
            expect(Geom.computeObtuseness(e)).to.equal(e.obtuse)
        })
        Geom.convexify(m)
        edges = Geom.gatherHalfEdges(m)
        edges.forEach(e => {
            expect(Geom.computeObtuseness(e)).to.equal(e.obtuse)
        })
    });

});
