main();

function main() {
    var stats = initStats();
    var controls

    //clock für draw function
    var clock = new THREE.Clock();

    //für Kollisionen
    const blockingObjects = [];

    var keyboard = {};
    var moveSpeed = 10;

    //CREATE CONTEXT
    const canvas = document.querySelector("#c");
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    gl.shadowMap.enabled = true;

    //CREATE CAMERA
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const cameraRadius = 0.5;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    //CREATE SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0.3, 0.5, 0.8);
    const fog = new THREE.Fog("grey", 1,90);
    scene.fog = fog;

    //EVENTLISTENER FÜR KEYBOARD INPUT
    window.addEventListener('keydown', function(event) {
        keyboard[event.code] = true;
    });
    window.addEventListener('keyup', function(event) {
        keyboard[event.code] = false;
    });

    //event listener für mouse input
    canvas.addEventListener('click', function () {
        canvas.requestPointerLock();
    });

    var yaw = 0;
    var pitch = 0;

    window.addEventListener('mousemove', function (event) {
        if (document.pointerLockElement !== canvas) return;

        yaw   -= event.movementX * controls.mouseSensitivity;
        pitch -= event.movementY * controls.mouseSensitivity;

        const maxPitch = Math.PI / 2 - 0.01;
        if (pitch >  maxPitch) pitch =  maxPitch;
        if (pitch < -maxPitch) pitch = -maxPitch;

        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    });
    

    // GEOMETRY
    // Create the upright plane
    const planeWidth = 256;
    const planeHeight =  128;
    const planeGeometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight
    );

    // MATERIALS
    const textureLoader = new THREE.TextureLoader();

    const planeTextureMap = textureLoader.load('textures/pebbles.jpg');
    planeTextureMap.wrapS = THREE.RepeatWrapping;
    planeTextureMap.wrapT = THREE.RepeatWrapping;
    planeTextureMap.repeat.set(16, 16);

    //planeTextureMap.magFilter = THREE.NearestFilter;
    planeTextureMap.minFilter = THREE.NearestFilter;
    planeTextureMap.anisotropy = gl.getMaxAnisotropy();
    const planeNorm = textureLoader.load('textures/pebbles_normal.png');
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide,
        normalMap: planeNorm 
    });

    // MESHES
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    



    //Object Loader für .obj-Dateien
    var loader = new THREE.OBJLoader();
    //load object
    /* loader.load('teapot.obj',
        function(mesh) {
                var material = new THREE.MeshPhongMaterial({map:texture});
        
                mesh.children.forEach(function(child) {
                child.material = material;
                child.castShadow = true;
                });

                mesh.scale.set(0.005, 0.005, 0.005);
                mesh.rotation.set(-Math.PI / 2, 0, 0);

                const box = new THREE.Box3().setFromObject(mesh);   // Bounding Box um die Teekanne
                const size = new THREE.Vector3();
                box.getSize(size);
                var height = size.y;

                //Position soll auf Hälfte der Höhe sein, damit es flach auf dem Boden aufliegt
                mesh.position.set(-15, height/2, 0);
        
            scene.add(mesh);
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
            console.log(error);
            console.log( 'An error happened' );
        }
    ); */


    //UNSICHTBARE WAND BOUNDING BOX
    // Maße des Raums
    const roomWidth  = 100;
    const roomHeight = 15;
    const roomDepth  = 100;
    const wallThickness = 0.5;

    //Material
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 'pink'
    });

    // Vorderwand
    const wallFront = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness),
        wallMaterial
    );
    wallFront.position.set(0, roomHeight / 2, -roomDepth / 2);
    scene.add(wallFront);
    blockingObjects.push(wallFront);

    // Rückwand
    const wallBack = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness),
        wallMaterial
    );
    wallBack.position.set(0, roomHeight / 2, roomDepth / 2);
    scene.add(wallBack);
    blockingObjects.push(wallBack);

    // Linke Wand
    const wallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
        wallMaterial
    );
    wallLeft.position.set(-roomWidth / 2, roomHeight / 2, 0);
    scene.add(wallLeft);
    blockingObjects.push(wallLeft);

    // Rechte Wand
    const wallRight = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
        wallMaterial
    );
    wallRight.position.set(roomWidth / 2, roomHeight / 2, 0);
    scene.add(wallRight);
    blockingObjects.push(wallRight);

    //gltf-loader für .gltf-dateien
    var gltfLoader = new THREE.GLTFLoader();
    //load object
    gltfLoader.load(
        'Assets/JukeBox/scene.gltf',
        function (gltf) {
            const jukebox = gltf.scene;

            jukebox.position.set(15, 0, 0);
            jukebox.scale.set(10, 10, 10);
            jukebox.rotation.set(0, -0.7, 0);

            jukebox.traverse(function (obj) {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
            });

            scene.add(jukebox);
            //als Kollisionsobjekt hinzufügen
            blockingObjects.push(jukebox);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log(error);
            console.log('An error happened');
        }
    );
        
    // BAR laden
    gltfLoader.load(
        'Assets/Bar/scene.gltf',   
        function (gltf) {
            const bar = gltf.scene;

            // Bounding Box berechnen und Modell zentrieren
            bar.updateMatrixWorld(true);
            const box    = new THREE.Box3().setFromObject(bar);
            const center = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());

            bar.position.sub(center);  // Mittelpunkt nach (0,0,0) schieben

            // Skalierung ausprobieren
            const targetWidth = 30;    // z.B. gewünschte Breite im Raum
            const scaleFactor = targetWidth / size.x;
            bar.scale.setScalar(scaleFactor);

            // Position im Raum
            bar.position.y = 0;
            bar.position.x = -25; 

            bar.traverse(obj => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });

            scene.add(bar);
            blockingObjects.push(bar);


            // Bar-Bounding-Box und Maße ermitteln
            const barBox    = new THREE.Box3().setFromObject(bar);
            const barCenter = barBox.getCenter(new THREE.Vector3());
            const barSize   = barBox.getSize(new THREE.Vector3());

            // Grundparameter für die Lampen
            const lampColor     = 0xff8800;   
            const lampIntensity = 2.9;
            const lampDistance  = 12;

            // Y-Höhe der Lampen: etwa auf Höhe der Lampenschirme
            const lampHeight = barCenter.y + barSize.y * 0.10; 

            // Z-Position der Lampen
            const lampZ = barCenter.z - barSize.z * 0.05;

            // Drei Lampen entlang der Barbreite verteilen
            const xOffsets = [-barSize.x * 0.28, 0, barSize.x * 0.28];

            xOffsets.forEach((xOff) => {
                const lamp = new THREE.PointLight(lampColor, lampIntensity, lampDistance);
                lamp.position.set(barCenter.x + xOff, lampHeight, lampZ);
                lamp.castShadow = true;
                scene.add(lamp);

                // Debug-Helper, um Position zu prüfen (später entfernen)
                 //const helper = new THREE.PointLightHelper(lamp, 0.5);
                 //scene.add(helper);
            });


        },
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded (bar)'),
        err => console.error('Error loading new bar:', err)
    );


    let mixer;
    //Charakter laden
    gltfLoader.load(
        "Characters/Michelle.glb",
        (gltf) => {
            const  michelle = gltf.scene;
            scene.add(michelle);

            michelle.position.set(0,0,0);
            michelle.scale.set(7,7,7);
            
            if(gltf.animations && gltf.animations.length){
                mixer = new THREE.AnimationMixer(michelle);

                const dance = mixer.clipAction(gltf.animations[2]);
                dance.play();
                dance.setLoop(THREE.LoopRepeat, Infinity);
                dance.clampWhenFinished = false;
            }
        },

        (error) => {
            console.error("GLB load error:", error);
        }

    );



    // MUTTER KIND BEZIEHUNGEN

    //Pointlight
    const pointlight = new THREE.PointLight(0xff0000, 0.7, 20);
    pointlight.castShadow = true;
    const tripod = new THREE.AxesHelper(1);


    //LIGHTS
    const color = 0x0100ff;
    const intensity = .8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.target = plane;
    light.position.set(0, 30, 30);
    light.castShadow = true;
    scene.add(light);
    scene.add(light.target);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);


    //FÜR GUI CONTROLS
    var controls = new function () {
        this.mouseSensitivity = 0.002;
    };


    //GUI ANLEGEN
    var gui = new dat.GUI();
    gui.add(controls, 'mouseSensitivity', 0.0005, 0.01);

    
    // DRAW / RENDERN
    function draw(time){
        const delta = clock.getDelta();
        stats.update();
        time *= 0.001;

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        //HIER KOMMEN OBJEKTE, DIE BEWEGT ODER ANDERWEITIG VERÄNDERT WERDEN SOLLEN
        //...

        if (mixer) mixer.update(delta);
        
        handleKeyboardInput(delta);

        gl.render(scene, camera);
        requestAnimationFrame(draw);
        
    }

    requestAnimationFrame(draw);

    //FÜR WASD CONTROLS
    function handleKeyboardInput(delta) {
        const dx = (keyboard['KeyD'] ? 1 : 0) - (keyboard['KeyA'] ? 1 : 0);
        const dz = (keyboard['KeyW'] ? 1 : 0) - (keyboard['KeyS'] ? 1 : 0);

        if (dx === 0 && dz === 0) return;

        const forward = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3()
            .crossVectors(forward, camera.up)
            .normalize();

        const move = new THREE.Vector3();
        move.addScaledVector(right, dx * moveSpeed * delta);
        move.addScaledVector(forward, dz * moveSpeed * delta);

        const nextPosition = camera.position.clone().add(move);

        // Raycaster für Kollisionen
        const raycaster = new THREE.Raycaster();
        const rayDirection = move.clone().normalize();

        //Distanz berechnen
        const distance = move.length() + cameraRadius;

        raycaster.set(camera.position, rayDirection);

        const intersects = raycaster.intersectObjects(blockingObjects, true);

        if (intersects.length > 0 && intersects[0].distance <= distance) {
            return;
        }

        camera.position.copy(nextPosition);
    }

}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}

//Objekt zum Kindobjekt machen
function attachChildObject(parent, child, offset = new THREE.Vector3()) {
    var container = new THREE.Group();
    container.position.copy(offset);
    parent.add(container);

    //world matrizen updaten 
    parent.updateMatrixWorld(true);
    container.updateMatrixWorld(true);
    child.updateMatrixWorld(true);

    //child an gewünschte Position setzen
    container.attach(child);

    const tripod = new THREE.AxesHelper(1);
    container.add(tripod);

    return container;
}
