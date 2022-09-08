import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
 const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>
{
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
* Camera
*/
// Base camera
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

// settings
const settings = {
  numberOfNodes: 16,
  connectionLenght: (Math.min(sizes.width, sizes.height) * 0.8) / 100,
}

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Axes helper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

/**
 * The experiment
 */

const sphereGeometry = new THREE.SphereGeometry(1, 32, 16)
const sphereMaterial = new THREE.MeshBasicMaterial({color: 'blue'})

const lineMaterial = new THREE.LineBasicMaterial({color: 'red'})
const points = [];

for (let i = - settings.numberOfNodes/2; i < settings.numberOfNodes/2; i++) {
  for (let j = - settings.numberOfNodes/2; j < settings.numberOfNodes/2; j++) {
    points.push( new THREE.Vector3( i*settings.connectionLenght, j*settings.connectionLenght, 0 ) );
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(i*settings.connectionLenght, j*settings.connectionLenght, 0)
    scene.add(sphere)
  }
}
for (let i = 0; i < settings.numberOfNodes; i++) {
  for (let j = 0; j < settings.numberOfNodes; j++) {
    console.log(`i: ${i}, j: ${j}`);
    const linesToAdd = []
    if (j%settings.numberOfNodes != settings.numberOfNodes-1) {
      const horizontalLineGeometry = new THREE.BufferGeometry().setFromPoints([
        points[i*settings.numberOfNodes + j],
        points[i*settings.numberOfNodes + j+1]
      ]);
      const horizontalLine = new THREE.Line(horizontalLineGeometry, lineMaterial)
      linesToAdd.push(horizontalLine)
    }
    if (i%settings.numberOfNodes != settings.numberOfNodes-1) {
      const verticalLineGeometry = new THREE.BufferGeometry().setFromPoints([
        points[i*settings.numberOfNodes + j],
        points[(i+1)*settings.numberOfNodes + j]
      ]);
      const verticalLine = new THREE.Line(verticalLineGeometry, lineMaterial)
      linesToAdd.push(verticalLine)
    }
    if (linesToAdd.length > 0) {
      scene.add(...linesToAdd)
    }
  }
}

// console.log('scene :>> ', scene);

console.log('points :>> ', points);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
 const clock = new THREE.Clock()

 const tick = () =>
 {
     const elapsedTime = clock.getElapsedTime()
 
     // Update controls
     controls.update()
 
     // Render
     renderer.render(scene, camera)
 
     // Call tick again on the next frame
     window.requestAnimationFrame(tick)
 }
 
 tick()