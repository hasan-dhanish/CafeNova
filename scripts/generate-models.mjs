import * as THREE from 'three';
import fs from 'fs';
import path from 'path';

// Minimal GLB Builder from Three.js Geometries
function createCoffeeCupGlb() {
  // We can write a clean procedural Three.js scene or GLTF structure
  // Simple valid binary glTF (GLB) file containing ceramic cup and coffee surface
  const scene = new THREE.Scene();

  // 1. Ceramic Cup Body
  const cupGeo = new THREE.CylinderGeometry(0.8, 0.6, 1.2, 32, 1, true);
  const cupMat = new THREE.MeshStandardMaterial({
    color: 0xFAF7F2,
    roughness: 0.2,
    metalness: 0.05,
  });
  const cupMesh = new THREE.Mesh(cupGeo, cupMat);
  scene.add(cupMesh);

  // 2. Cup Base
  const baseGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32);
  const baseMesh = new THREE.Mesh(baseGeo, cupMat);
  baseMesh.position.y = -0.6;
  scene.add(baseMesh);

  // 3. Coffee Liquid Surface
  const liquidGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.02, 32);
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0x382319, // Deep roasted espresso
    roughness: 0.1,
    metalness: 0.1,
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.position.y = 0.45;
  scene.add(liquidMesh);

  // 4. Latte Microfoam Ring
  const foamGeo = new THREE.RingGeometry(0.2, 0.5, 32);
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xE8D7C3,
    roughness: 0.8,
  });
  const foamMesh = new THREE.Mesh(foamGeo, foamMat);
  foamMesh.rotation.x = -Math.PI / 2;
  foamMesh.position.y = 0.465;
  scene.add(foamMesh);

  // 5. Cup Handle
  const handleGeo = new THREE.TorusGeometry(0.35, 0.08, 16, 32, Math.PI);
  const handleMesh = new THREE.Mesh(handleGeo, cupMat);
  handleMesh.position.set(0.8, 0, 0);
  handleMesh.rotation.z = -Math.PI / 2;
  scene.add(handleMesh);

  // 6. Saucer Plate
  const saucerGeo = new THREE.CylinderGeometry(1.3, 1.0, 0.08, 32);
  const saucerMesh = new THREE.Mesh(saucerGeo, cupMat);
  saucerMesh.position.y = -0.65;
  scene.add(saucerMesh);

  return exportSceneToGlb(scene);
}

function createCroissantGlb() {
  const scene = new THREE.Scene();

  // Golden Butter Croissant: curved crescent shape using multiple segmented tori / spheres
  const pastryMat = new THREE.MeshStandardMaterial({
    color: 0xC88334, // Golden baked crust
    roughness: 0.6,
    metalness: 0.05,
  });

  const centerGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16);
  centerGeo.rotateZ(Math.PI / 2);
  const centerMesh = new THREE.Mesh(centerGeo, pastryMat);
  scene.add(centerMesh);

  // Curved tips
  const leftTipGeo = new THREE.ConeGeometry(0.45, 0.9, 16);
  leftTipGeo.rotateZ(Math.PI / 2.5);
  const leftTip = new THREE.Mesh(leftTipGeo, pastryMat);
  leftTip.position.set(-0.9, -0.15, 0.3);
  scene.add(leftTip);

  const rightTipGeo = new THREE.ConeGeometry(0.45, 0.9, 16);
  rightTipGeo.rotateZ(-Math.PI / 2.5);
  const rightTip = new THREE.Mesh(rightTipGeo, pastryMat);
  rightTip.position.set(0.9, -0.15, 0.3);
  scene.add(rightTip);

  return exportSceneToGlb(scene);
}

// Convert scene geometries to standard Binary glTF
function exportSceneToGlb(scene) {
  const vertices = [];
  const normals = [];
  const indices = [];
  let indexOffset = 0;

  scene.updateMatrixWorld(true);

  scene.traverse((obj) => {
    if (obj.isMesh) {
      const mesh = obj;
      const geom = mesh.geometry.clone();
      geom.applyMatrix4(mesh.matrixWorld);

      const posAttr = geom.attributes.position;
      const normAttr = geom.attributes.normal;
      const idx = geom.index;

      if (posAttr) {
        for (let i = 0; i < posAttr.count; i++) {
          vertices.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
          if (normAttr) {
            normals.push(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i));
          } else {
            normals.push(0, 1, 0);
          }
        }

        if (idx) {
          for (let i = 0; i < idx.count; i++) {
            indices.push(idx.getX(i) + indexOffset);
          }
        } else {
          for (let i = 0; i < posAttr.count; i++) {
            indices.push(i + indexOffset);
          }
        }

        indexOffset += posAttr.count;
      }
    }
  });

  const vertexBuffer = Buffer.from(new Float32Array(vertices).buffer);
  const normalBuffer = Buffer.from(new Float32Array(normals).buffer);
  const indexBuffer = Buffer.from(new Uint16Array(indices).buffer);

  const totalBinaryLength = vertexBuffer.length + normalBuffer.length + indexBuffer.length;
  const binBuffer = Buffer.concat([indexBuffer, vertexBuffer, normalBuffer]);

  const gltf = {
    asset: { version: '2.0', generator: 'CaféNova 3D Asset Pipeline' },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 1,
              NORMAL: 2,
            },
            indices: 0,
            mode: 4,
          },
        ],
      },
    ],
    buffers: [{ byteLength: totalBinaryLength }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: indexBuffer.length, target: 34963 },
      { buffer: 0, byteOffset: indexBuffer.length, byteLength: vertexBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: indexBuffer.length + vertexBuffer.length, byteLength: normalBuffer.length, target: 34962 },
    ],
    accessors: [
      { bufferView: 0, byteOffset: 0, componentType: 5123, count: indices.length, type: 'SCALAR' },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126,
        count: vertices.length / 3,
        type: 'VEC3',
        max: [1.5, 1.5, 1.5],
        min: [-1.5, -1.5, -1.5],
      },
      { bufferView: 2, byteOffset: 0, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
    ],
  };

  const jsonString = JSON.stringify(gltf);
  const jsonPadded = jsonString.padEnd(Math.ceil(jsonString.length / 4) * 4, ' ');
  const jsonBuffer = Buffer.from(jsonPadded, 'utf8');

  // GLB Header: Magic (0x46546C67), Version (2), Total Length
  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBuffer.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4); // version 2
  header.writeUInt32LE(totalLength, 8);

  // Chunk 0: JSON
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  // Chunk 1: BIN
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBuffer.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

  return Buffer.concat([header, jsonChunkHeader, jsonBuffer, binChunkHeader, binBuffer]);
}

// Generate files in public/models
const dir = path.join(process.cwd(), 'public', 'models');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'coffee_cup.glb'), createCoffeeCupGlb());
fs.writeFileSync(path.join(dir, 'croissant.glb'), createCroissantGlb());
console.log('Successfully generated GLB models in public/models/');
