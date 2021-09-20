const LOADER = document.getElementById('js-loader');
const DRAG_NOTICE = document.getElementById('js-drag-notice');
const TRAY = document.getElementById('js-tray-slide');
const BACKGROUND_COLOR = 0x535754;

const canvas = document.querySelector('#c');

var theModel;
const MODEL_PATH = "assets/models/hollow_box.glb";
// Initial material
var current_mtr = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 });

//Customization for model
var depth = 1;
var rowHeight = 1;
var elementWidth = 1;

var height = 1;
var width = 1;
var scale = 1;

var loaded = false;
var activeOption = 'hollow_box';

// Init the scene
var scene = new THREE.Scene();

function setupScene() {
    scene = new THREE.Scene();
    // Set background
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

    // Add lights
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene   
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // Add directional Light to scene    
    scene.add(dirLight);

    // Floor
    var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    var floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x7f8781, // This color is manually dialed in to match the background color
        shininess: 0
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.nameID = 'floor';
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
    scene.add(floor);
}

var mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster();

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

// Add a camera
var cameraFar = 10;
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraFar;
camera.position.x = 0;

// Add controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.2;

//Registering input listeners
var widthInput = document.getElementById('width-input');
widthInput.addEventListener('change', updateWidth);

var heightInput = document.getElementById('height-input');
heightInput.addEventListener('change', updateHeight);

var rowHeightInput = document.getElementById('row-height-input');
rowHeightInput.addEventListener('change', updateRowHeight);

var depthInput = document.getElementById('depth-input');
depthInput.addEventListener('change', updateDepth);

function updateWidth() {
    width = widthInput.value;
    renderGrid(width, height);
}
function updateHeight() {
    height = heightInput.value;
    renderGrid(width, height);
}
function updateRowHeight() {
    if (rowHeightInput.value > 0 && rowHeightInput.value <= 1) {
        rowHeight = rowHeightInput.value;
        renderGrid(width, height);
    }
}
function updateDepth() {
    if (depthInput.value > 0 && depthInput.value <= 1) {
        depth = depthInput.value;
        renderGrid(width, height);
    }
}

const colors = [
    {
        texture: 'assets/images/wood.jpg',
        size: [2, 2, 2],
        shininess: 60
    },
    {
        color: '131417'
    },

    {
        color: '374047'
    },

    {
        color: '5f6e78'
    },

    {
        color: '7f8a93'
    },

    {
        color: '97a1a7'
    },

    {
        color: 'acb4b9'
    },

    {
        color: 'DF9998'
    },

    {
        color: '7C6862'
    },

    {
        color: 'A3AB84'
    },

    {
        color: 'D6CCB1'
    },

    {
        color: 'F8D5C4'
    },

    {
        color: 'A3AE99'
    },

    {
        color: 'EFF2F2'
    },

    {
        color: 'B0C5C1'
    },

    {
        color: '8B8C8C'
    },

    {
        color: '565F59'
    },

    {
        color: 'CB304A'
    },

    {
        color: 'FED7C8'
    },

    {
        color: 'C7BDBD'
    },

    {
        color: '3DCBBE'
    },

    {
        color: '264B4F'
    },

    {
        color: '389389'
    },

    {
        color: '85BEAE'
    },

    {
        color: 'F2DABA'
    },

    {
        color: 'F2A97F'
    },

    {
        color: 'D85F52'
    },

    {
        color: 'D92E37'
    },

    {
        color: 'FC9736'
    },

    {
        color: 'F7BD69'
    },

    {
        color: 'A4D09C'
    },

    {
        color: '4C8A67'
    },

    {
        color: '25608A'
    },

    {
        color: '75C8C6'
    },

    {
        color: 'F5E4B7'
    },

    {
        color: 'E69041'
    },

    {
        color: 'E56013'
    },

    {
        color: '11101D'
    },

    {
        color: '630609'
    },

    {
        color: 'C9240E'
    },

    {
        color: 'EC4B17'
    },

    {
        color: '281A1C'
    },

    {
        color: '4F556F'
    },

    {
        color: '64739B'
    },

    {
        color: 'CDBAC7'
    },

    {
        color: '946F43'
    },

    {
        color: '66533C'
    },

    {
        color: '173A2F'
    },

    {
        color: '153944'
    },

    {
        color: '27548D'
    },

    {
        color: '438AAC'
    }];

// Function - Add the textures to the models
function initColor(parent, name, mtl) {
    parent.traverse(o => {
        if (o.isMesh) {
            if (o.name.includes(activeOption)) {
                o.material = mtl;
                o.nameID = name; // Set a new property to identify this object
            }
        }
    });
}

//Render one element
function renderModel(x, y, index) {
    // Init the object loader
    var loader = new THREE.GLTFLoader();

    loader.load(MODEL_PATH, function (gltf) {
        theModel = gltf.scene;

        theModel.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });

        theModel.cursor = 'pointer';

        // Set the models initial scale   
        theModel.scale.set(depth, rowHeight, elementWidth);

        theModel.rotation.y = Math.PI / 2;

        // Add the model to the scene
        theModel.position.y = y;
        theModel.position.x = x;

        // Set initial textures
        initColor(theModel, `${activeOption}_${index}`, current_mtr);

        scene.add(theModel);

        // Remove the loader
        LOADER.remove();

    }, undefined, function (error) {
        console.error(error);
    });
}

//Rendering of one row of elements
function renderRow(amount, rowIndex) {
    for (let index = 0; index < amount; index++) {
        renderModel(index * (2 * scale), rowIndex * ((2 * scale) * rowHeight));
    }
}

//Rendering of muliple rows of models
function renderGrid(elementsInRow, elementsInColumn) {
    setupScene();
    for (let index = 0; index < elementsInColumn; index++) {
        renderRow(elementsInRow, index);
    }
}

//renderer.domElement.addEventListener('click', onClick, false);
// function onClick(event) {
//     console.log('Got clicked');

//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);

//     var intersects = raycaster.intersectObjects(scene.children, true);
//     var elementWasChanged = false;

//     if (intersects.length > 0) {
//         intersects.forEach(element => {
//             if (element.object.name.includes(activeOption)) {
//                 elementWasChanged = true;
//                 element.object.material = new THREE.MeshPhongMaterial({
//                     color: parseInt('0xffcc9274'),
//                     shininess: 10
//                 });
//             }
//         });
//         console.log('Intersection:', intersects[0]);
//     }

//     if (!elementWasChanged) {
//         renderGrid(width, height);
//     }
// }

function animate() {
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

renderGrid(width, height);
animate();

// Function - New resizing method
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvasPixelWidth = canvas.width / window.devicePixelRatio;
    var canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

// Disable scrolling .. (??)
window.onscroll = function () { window.scrollTo(0, 0); };

// Function - Build Colors
function buildColors(colors) {
    for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');

        if (color.texture) {
            swatch.style.backgroundImage = "url(" + color.texture + ")";
        } else {
            swatch.style.background = "#" + color.color;
        }

        swatch.setAttribute('data-key', i);
        TRAY.append(swatch);
    }
}

buildColors(colors);

// Swatches
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
    swatch.addEventListener('click', selectSwatch);
}

function selectSwatch(e) {
    let color = colors[parseInt(e.target.dataset.key)];

    if (color.texture) {

        let txt = new THREE.TextureLoader().load(color.texture);

        txt.repeat.set(color.size[0], color.size[1], color.size[2]);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;

        current_mtr = new THREE.MeshPhongMaterial({
            map: txt,
            shininess: color.shininess ? color.shininess : 10
        });

    } else {
        current_mtr = new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess ? color.shininess : 10
        });
    }
    scene.children.forEach(element => {
        setMaterial(element, activeOption, current_mtr);
    });
}

function setMaterial(parent, type, mtl) {
    parent.traverse(o => {
        if (o.isMesh && o.name != null && o.name != '') {
            console.log(o.name);
            if (type.includes(o.name)) {
                o.material = mtl;
            }
        }
    });
}

