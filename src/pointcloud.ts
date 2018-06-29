import {treatedAll} from './common'

import * as Geom from './geom';
import * as Random from 'random-js';

export type Type = "Convex" | "Thin" | "Delaunay"

// take some distance from the mesh boundaries
const MARGIN = Math.round(Geom.MESH_SIZE*0.00789654383154)

const MIN_MESH_COORD = Geom.MIN_MESH_COORD+MARGIN
const MAX_MESH_COORD = Geom.MAX_MESH_COORD-MARGIN

export function randomPoint(random: Random): Geom.Vec2 {
    let x: number = random.integer(MIN_MESH_COORD, MAX_MESH_COORD)
    let y: number = random.integer(MIN_MESH_COORD, MAX_MESH_COORD)
    return { x: x, y: y }
}

export function randomMesh(random: Random, meshType: Type): Geom.Mesh {
    return meshFromPointCloud(meshType, randomPointCloud(random, 200))
}

export function randomPointCloud(random: Random, n: number): Geom.Vec2[] {
    const pointCloud: Geom.Vec2[] = []
    for (var i = 0; i < n; i++) {
        pointCloud.push(randomPoint(random))
    }
    return pointCloud
}

export function fillMeshFromPointCloud(m: Geom.Mesh, meshType: Type, pointCloud: Geom.Vec2[]): Geom.Mesh {
    pointCloud.forEach((p: Geom.Vec2) => {
        Geom.insertVertex(m, p)
    })
    if (meshType == "Thin") {
        return m
    } else if (meshType == "Delaunay") {
        Geom.delaunafy(m)
        return m
    } else if (meshType == "Convex") {
        Geom.delaunafy(m)
        Geom.convexify(m)
        return m
    }
    return treatedAll(meshType)
}

export function meshFromPointCloud(meshType: Type, pointCloud: Geom.Vec2[]): Geom.Mesh {
    const m = Geom.mesh()
    fillMeshFromPointCloud(m, meshType, pointCloud)
    return m
}
