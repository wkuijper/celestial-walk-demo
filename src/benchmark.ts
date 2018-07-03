import {treatedAll} from './common'

import * as Geom from './geom';
import * as fs from 'fs';

import * as Floorplan from './floorplan'
import * as Pointcloud from './pointcloud'
import * as Walk from './walk'

import * as Render from './render'

import * as Random from 'random-js'

import * as Graph from './graph'

type ArrowType = 0|45|90|135|180|225|270|315
const arrowTypes: ArrowType[] = [0,45,90,135,180,225,270,315]

const arrows: Map<ArrowType,Geom.Line> = new Map([])

const arrowLength = 60000

arrowTypes.forEach((arrowType) => {
    const angle = (arrowType/180)*Math.PI
    const radius = arrowLength/2
    const dx = Math.round(Math.sin(angle)*radius)
    const dy = Math.round(Math.cos(angle)*radius)
    arrows.set(arrowType, {p1: { x: dx, y: dy}, p2: {x: -dx, y: -dy}})
})

type MeshType = "Delaunay Pointcloud"|"Thintriangles Pointcloud"|"Convex Pointcloud"|"Delaunayish Floorplan"|"Convex Floorplan"|"Subdivided Floorplan"
const meshTypes: MeshType[] = ["Delaunay Pointcloud", "Thintriangles Pointcloud", "Convex Pointcloud", "Delaunayish Floorplan", "Convex Floorplan", "Subdivided Floorplan"]

type WalkType = "Straight"|"Visibility"|"Celestial"|"Balanced Celestial"
const walkTypes: WalkType[] = ["Straight", "Visibility", "Celestial", "Balanced Celestial"]

type QuantType = "orient_tests"|"traversed_faces"
const quantTypes: QuantType[] = ["orient_tests", "traversed_faces"]

type RawRsultsType = Map<MeshType,Map<ArrowType,Map<WalkType, Map<QuantType, number[]>>>>

function nameify(name: string): string {
    return name.toLowerCase().replace(' ', '_')
}

if (fs.existsSync("./benchmarks")) {
    throw new Error('./benchmarks directory already exist, delete it or move it out of the way')    
}

fs.mkdirSync("./benchmarks")

function randomMesh(random: Random, meshType: MeshType): Geom.Mesh {
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

const raw: RawRsultsType = new Map()

meshTypes.forEach((meshType) => {
    const raw2 = raw.set(meshType, new Map()).get(meshType)!
    arrowTypes.forEach((arrowType) => {
        const raw3 = raw2.set(arrowType, new Map()).get(arrowType)!
        walkTypes.forEach((walkType) => {
            const raw4 = raw3.set(walkType, new Map()).get(walkType)!
            quantTypes.forEach((quantType) => {
                raw4.set(quantType, [])
            })
        })
    })
})

const seedRandom = Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef])

fs.mkdirSync("./benchmarks/meshes")
fs.mkdirSync("./benchmarks/paths")

for (var n = 0; n < 0x010; n++) {
    const hex: string = ("00" + n.toString(16)).substr(-3)
    const seedArray = [seedRandom(), seedRandom()]
    meshTypes.forEach((meshType) => {
        const raw2 = raw.get(meshType)!
        const name1 = `${hex}_${nameify(meshType)}`
        const random = new Random(Random.engines.mt19937().seedWithArray(seedArray))
        const mesh: Geom.Mesh = randomMesh(random, meshType)
        fs.writeFileSync("./benchmarks/meshes/" + name1 + ".html", Render.mesh2html(name1, mesh, meshType.includes("Delaunay"), undefined, undefined, true))
        fs.writeFileSync("./benchmarks/meshes/" + name1 + ".tikz", Render.mesh2tikz(name1, mesh, meshType.includes("Delaunay"), undefined, undefined, false))
        arrowTypes.forEach((arrowType) => {
            const raw3 = raw2.get(arrowType)!
            const name2 = `${name1}_${arrowType}`
            const arrow = arrows.get(arrowType)!
            const initEdge = Geom.walk(mesh.north, arrow.p1).some
            walkTypes.forEach((walkType) => {
                const raw4 = raw3.get(walkType)!
                const name3 = `${name2}_${nameify(walkType)}`
                const walkStats = Walk.stats(walkType, initEdge, arrow.p1, arrow.p2)
                fs.writeFileSync("./benchmarks/paths/" + name3 + ".html", Render.mesh2html(name1, mesh, false, walkStats, arrow, true))
                fs.writeFileSync("./benchmarks/paths/" + name3 + ".tikz", Render.mesh2tikz(name1, mesh, false, walkStats, arrow, false))
                raw4.get("traversed_faces")!.push(walkStats.path.length)
                raw4.get("orient_tests")!.push(walkStats.orient_tests)
            })
        })
    })
}

/* 

// use the code below to optionally: 
// - serialize the raw results
// - skip the generation and redo only the graphing

function replacer(key: any, value: any) {
    if (value.__proto__ == Map.prototype) {
        return {
            _type: "map",
            map: [...value],
        }
    } else return value;
}

fs.writeFileSync("./benchmarks/results.json", JSON.stringify(raw, replacer))

function reviver(key: any, value: any) {
    if (value._type == "map") return new Map(value.map);
    else return value;
}

const raw: RawRsultsType = JSON.parse(fs.readFileSync("./benchmarks/results.json").toString(), reviver)

if (fs.existsSync("./benchmarks/graphs")) {
    throw new Error('./benchmarks/graphs directory already exist, delete it or move it out of the way')    
}*/

fs.mkdirSync("./benchmarks/graphs")

fs.mkdirSync("./benchmarks/graphs/periodicity_checks")

meshTypes.forEach((meshType) => {
    walkTypes.forEach((walkType) => {
        const datas: Map<string, number[]> = new Map()
        arrowTypes.forEach((arrowType) => {
            const data = raw.get(meshType)!.get(arrowType)!.get(walkType)!.get("orient_tests")!
            datas.set(`${arrowType} degrees`, data)
        })
        fs.writeFileSync(`./benchmarks/graphs/periodicity_checks/${nameify(meshType)}_${nameify(walkType)}.html`, 
            Graph.html(`Periodicity Check on ${meshType} Meshes for the ${walkType} Walk`, "Compass Direction", "Orientation Tests", datas))
        fs.writeFileSync(`./benchmarks/graphs/periodicity_checks/${nameify(meshType)}_${nameify(walkType)}.csv`, 
            Graph.csv(`Periodicity Check on ${meshType} Meshes for the ${walkType} Walk`, "Compass Direction", "Orientation Tests", datas))
        fs.writeFileSync(`./benchmarks/graphs/periodicity_checks/${nameify(meshType)}_${nameify(walkType)}_row.csv`, 
            Graph.rowCSV(`Periodicity Check on ${meshType} Meshes for the ${walkType} Walk`, "Compass Direction", "Orientation Tests", datas))
    })
})

fs.mkdirSync("./benchmarks/graphs/shootouts_per_meshtype")

meshTypes.forEach((meshType) => {
    const datas: Map<string, number[]> = new Map()
    walkTypes.forEach((walkType) => {
        const data: number[] = []
        datas.set(`${walkType} Walk`, data)
        arrowTypes.forEach((arrowType) => {
            data.push(...raw.get(meshType)!.get(arrowType)!.get(walkType)!.get("orient_tests")!)
        })
    })
    fs.writeFileSync(`./benchmarks/graphs/shootouts_per_meshtype/${nameify(meshType)}.html`, 
        Graph.html(`Comparison of the Various Walk on ${meshType} Meshes`, "Walking Algorithm", "Orientation Tests", datas))
    fs.writeFileSync(`./benchmarks/graphs/shootouts_per_meshtype/${nameify(meshType)}.csv`, 
        Graph.csv(`Comparison of the Various Walk on ${meshType} Meshes`, "Walking Algorithm", "Orientation Tests", datas))
    fs.writeFileSync(`./benchmarks/graphs/shootouts_per_meshtype/${nameify(meshType)}_row.csv`, 
        Graph.rowCSV(`Comparison of the Various Walk on ${meshType} Meshes`, "Walking Algorithm", "Orientation Tests", datas))
})

const datas: Map<string, number[]> = new Map()
meshTypes.forEach((meshType) => {
    walkTypes.forEach((walkType) => {
        const data: number[] = []
        datas.set(`${walkType} Walk`, data)
        arrowTypes.forEach((arrowType) => {
            data.push(...raw.get(meshType)!.get(arrowType)!.get(walkType)!.get("orient_tests")!)
        })
    })
})
fs.writeFileSync(`./benchmarks/graphs/shootout.html`, 
    Graph.html(`Comparison of the Various Walk on All Mesh Types`, "Walking Algorithm", "Orientation Tests", datas))
fs.writeFileSync(`./benchmarks/graphs/shootout.csv`, 
    Graph.csv(`Comparison of the Various Walk on All Mesh Types`, "Walking Algorithm", "Orientation Tests", datas))
fs.writeFileSync(`./benchmarks/graphs/shootout_row.csv`, 
    Graph.csv(`Comparison of the Various Walk on All Mesh Types`, "Walking Algorithm", "Orientation Tests", datas))


