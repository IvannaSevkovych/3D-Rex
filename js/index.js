/*
 * Imports
 */
// npm
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
const createInputEvents = require('simple-input-events');
const OrbitControls = require('three-orbit-controls')(THREE);

// shaders
import rexFragment from './shaders/rexFragment.glsl';
import rexVertex from './shaders/rexVertex.glsl';


// import '../index.sass';
import dino from '../models/dino_opt.glb';

/*
 * Declarations
 */
// Constants
const raycaster = new THREE.Raycaster();
const loader = new GLTFLoader();
const mouse = new THREE.Vector2(-1, -1);
const group = new THREE.Group();
const modelData = {
    url: dino
};

// Variables
let camera; let scene; let renderer; let canvasContainer; let material;
let time = 0;


function init() {
    /* Setup THREE boilerplate */
    canvasContainer = document.getElementById('container');

    scene = new THREE.Scene();
    scene.destination = { x: 0, y: 0 };
    scene.add(group);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);

    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        70,
        canvasContainer.offsetWidth / canvasContainer.offsetHeight,
        0.001, 100
    );
    camera.position.set(1.5, 0, 2);

    new OrbitControls(camera, renderer.domElement);

    /* Start custom stuff */
    material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
            time: { type: 'f', value: 0 },
            mousePosition: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
        },
        vertexShader: rexVertex,
        fragmentShader: rexFragment,
    });


    loader.load(
        modelData.url,
        model => {
            model.name = modelData.url;
            const dinoMesh = model.scene.getObjectByName("dino", true);
            console.log(dinoMesh, model);
            
            const mesh = new THREE.Mesh(dinoMesh.geometry, material);
            group.add(mesh);
            group.position.y = - dinoMesh.geometry.boundingBox.max.y / 2;

            // Add plane for raycaster
            const planeGeometry = new THREE.PlaneBufferGeometry(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
            const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.name = "target";
            scene.add(plane);
        },
    );

    resize();
    window.addEventListener('resize', resize);

    const mouseEvent = createInputEvents(canvasContainer);
    mouseEvent.on('move', ({ position, event, inside, dragging }) => {
        mouse.x = position[0] / canvasContainer.offsetWidth * 2 - 1;
        mouse.y = 1 - position[1] / canvasContainer.offsetHeight * 2;
    });

}

function animate() {
    time += 0.05;
    material.uniforms.time.value = time;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(scene.children.filter(child => child.name === "target"));

    if (intersects.length) {
        material.uniforms.mousePosition.value = intersects[0].point;
    }

    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}

/*
 * Helper functions and event listeners
 */
function resize() {
    const w = canvasContainer.offsetWidth;
    const h = canvasContainer.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}


/*
 * Calls
 */
init();
animate();