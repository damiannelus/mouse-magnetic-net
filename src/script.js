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
// const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
// TODO the orthographic camera should be propery set up
const camera = new THREE.OrthographicCamera( 
  window.innerWidth / - 10, 
  window.innerWidth / 10, 
  window.innerHeight / 10, 
  window.innerHeight / - 10, 
  1, 
  1000 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 100 );

// settings
const settings = {
  numberOfNodes: 3,
  connectionLenght: (Math.min(sizes.width, sizes.height) * 0.8) / 100,
  sphereRadius: 1

}

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Axes helper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Raycaster
const raycaster = new THREE.Raycaster()

/**
 * Mouse
 */
 const mouse = new THREE.Vector2()

 window.addEventListener('mousemove', (event) =>
 {
     mouse.x = event.clientX / sizes.width * 2 - 1
     mouse.y = - (event.clientY / sizes.height) * 2 + 1
  })

/**
 * The experiment
 */

const sphereGeometry = new THREE.SphereGeometry(settings.sphereRadius, 32, 16)
const sphereMaterial = new THREE.MeshBasicMaterial({color: 'blue'})
const touchableSphereGeometry = new THREE.SphereGeometry(settings.sphereRadius * 1.75, 32, 16)
const touchableSphereMaterial = new THREE.MeshBasicMaterial({color: 'green'})

const lineMaterial = new THREE.LineBasicMaterial({color: 'red'})
const points = [];
const sphereGroup = new THREE.Group()
sphereGroup.name = "sphereGroup"
const touchableSphereGroup = new THREE.Group()
touchableSphereGroup.name = "touchableSphereGroup"

for (let i = - settings.numberOfNodes/2; i < settings.numberOfNodes/2; i++) {
  for (let j = - settings.numberOfNodes/2; j < settings.numberOfNodes/2; j++) {
    points.push( new THREE.Vector3( i*settings.connectionLenght, j*settings.connectionLenght, 0 ) );
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    const touchableSphere = new THREE.Mesh(touchableSphereGeometry, touchableSphereMaterial)
    // touchableSphere.visible = false
    sphere.position.set(i*settings.connectionLenght, j*settings.connectionLenght, 0)
    touchableSphere.position.set(i*settings.connectionLenght, j*settings.connectionLenght, -1)
    sphereGroup.add(sphere)
    touchableSphereGroup.add(touchableSphere)
  }
}
scene.add(sphereGroup)
scene.add(touchableSphereGroup)

for (let i = 0; i < settings.numberOfNodes; i++) {
  for (let j = 0; j < settings.numberOfNodes; j++) {
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

 let currentIntersect = null

 const tick = () =>
 {
     const elapsedTime = clock.getElapsedTime()

    //  Check interaction
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(touchableSphereGroup.children)

    if(intersects.length)
    {
        if(!currentIntersect)
        {
            // console.log('mouse enter')
        }

        currentIntersect = intersects[0]


        for (let i = 0; i < touchableSphereGroup.children.length; i++) {
          if (touchableSphereGroup.children[i] === currentIntersect.object) {
            console.log('touchableSphereGroup.children[i] :>> ', touchableSphereGroup.children[i]);
            const newPositionVector = new THREE.Vector3(mouse.x, mouse.y, 0)
            const dis = touchableSphereGroup.children[i].position.distanceTo(newPositionVector)
            console.log('dis :>> ', dis);
            newPositionVector.unproject(camera)
            const dir = newPositionVector.sub(camera.position).normalize()
            const distance = - camera.position.z / dir.z
            const newPosition = camera.position.clone().add(dir.multiplyScalar(distance))
            sphereGroup.children[i].position.set(newPosition.x, newPosition.y, 0)
            console.log("brawo");
          }
          
        }
    }
    else
    {
        if(currentIntersect)
        {
            // console.log('mouse leave')
        }
        
        currentIntersect = null
    }
 
     // Update controls
     controls.update()
 
     // Render
     renderer.render(scene, camera)
 
     // Call tick again on the next frame
     window.requestAnimationFrame(tick)
 }
 
 tick()