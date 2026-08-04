import { createJukeboxUI } from "./jukeboxUI.js";
import { createProximityInteract } from "./interactions.js";
import { createCharacterDanceController } from "./characterDanceController.js";
import { createQuizUI } from "./quizUI.js";


main();

function main() {
    //SONGS FÜR DIE JUKEBOX
    // ACHTUNG: Die vier Jukebox-Songs sind urheberrechtlich geschützt und liegen deshalb
    // NICHT im Repository. Die Dateien müssen lokal unter ./Songs/ mit exakt diesen
    // Dateinamen ergänzt werden, sonst bleibt die Jukebox stumm (Szene und Quiz laufen
    // trotzdem). Details siehe README -> "Hinweis zu den Songs".
    let jukeboxObject = null;
    const songs = [
        { name: "I'm On Fire", era: "1984", url: "./Songs/Bruce Springsteen - I'm On Fire.m4a" },
        { name: "All Night Long", era: "1983", url: "./Songs/Lionel Richie - All Night Long (All Night).mp3" },
        { name: "THRIFT SHOP", era: "2012", url: "./Songs/MACKLEMORE & RYAN LEWIS - THRIFT SHOP FEAT. WANZ.mp3" },
        { name: "Let's Get It Started", era: "2003", url: "./Songs/The Black Eyed Peas - Let's Get It Started.mp3" },
    ]

    const ambient = new Audio("./Songs/groovy-vibe.mp3");
    ambient.loop = true;
    ambient.volume = 0.35;

    function startAmbient() {
        ambient.play().catch(console.warn);
    }

    function stopAmbient() {
        ambient.pause();
        ambient.currentTime = 0;
    }

    //CREATE QUIZ UI
    const quiz = createQuizUI({ songs });

    
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

    //CREATE MAIN CAMERA
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 150;
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
    const fog = new THREE.FogExp2(0x9966ff, 0.01);
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

    //FÜR GUI CONTROLS
    var controls = new function () {
        this.mouseSensitivity = 0.002;
    };

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
    

    function setupTexture(tex, repeatX, repeatY) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        tex.minFilter = THREE.NearestFilter;
        tex.anisotropy = gl.getMaxAnisotropy();
        return tex;
    }

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

    const planeTextureMap = setupTexture(textureLoader.load('textures/floor2/4K/Poliigon_SlateFloorTile_7657_BaseColor.jpg'), 5, 5);
    const planeNorm = setupTexture(textureLoader.load('textures/floor2/4K/Poliigon_SlateFloorTile_7657_Normal.png'), 5, 5);
    const planeRoughness = setupTexture(textureLoader.load('textures/floor2/4K/Poliigon_SlateFloorTile_7657_Roughness.jpg'), 5, 5);
    //const planeMetallic  = setupTexture(textureLoader.load('textures/floor2/4K/Poliigon_SlateFloorTile_7657_Metallic.jpg'), 5, 5);

    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        normalMap: planeNorm,
        roughnessMap: planeRoughness, 
        roughness: 1.0,
        //metalnessMap: planeMetallic,
        //metalness: 1.0,
        side: THREE.DoubleSide,
    });

    // MESHES
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    //Boundingbox/Collider Material (Sichtbar)
    const ColliderMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        });

    //Collider Material (unsichtbar)
    const ColliderMaterial_invisible = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
    });

    //CREATE SPIEGELNDE KUGEL
    // mirror sphere cube-camera 
    //Quelle: view-source:https://threejs.org/examples/webgl_animation_skinning_ik.html
    const rendertargetSize = 512;
    const mirrorSphereCamera = new THREE.CubeCamera( 0.1, 500, rendertargetSize );
    scene.add( mirrorSphereCamera );
    const mirrorSphereMaterial = new THREE.MeshStandardMaterial({
        envMap: mirrorSphereCamera.renderTarget.texture,
        metalness: 1.0,
        roughness: 0.0
    });
    const mirrorSphere = new THREE.Mesh(
        new THREE.SphereGeometry(5, 48, 32),
        mirrorSphereMaterial
    );
    mirrorSphere.position.set(-25, 9.5, 25);
    scene.add(mirrorSphere);

    //als Kollisionsobjekt hinzufügen
    mirrorSphere.updateMatrixWorld(true);

    // Bounding Box in Weltkoordinaten
    const boxMirror = new THREE.Box3().setFromObject(mirrorSphere);
    const sizeMirror = boxMirror.getSize(new THREE.Vector3());
    const centerMirror = boxMirror.getCenter(new THREE.Vector3());

    const colliderGeoMirror = new THREE.BoxGeometry(sizeMirror.x, sizeMirror.y, sizeMirror.z);
    

    const mirrorCollider = new THREE.Mesh(colliderGeoMirror, ColliderMaterial_invisible);
    mirrorCollider.position.copy(centerMirror);

    scene.add(mirrorCollider);
    mirrorCollider.add(mirrorCollider);
    blockingObjects.push(mirrorCollider);


    //CREATE DISKOKUGEL
    let radiusDisko = 2;
    const diskoSphereMaterial = new THREE.MeshStandardMaterial({color: 0xBAA48A});
    const diskoSphere = new THREE.Mesh(new THREE.SphereGeometry(radiusDisko, 16, 12), diskoSphereMaterial);
    scene.add(diskoSphere);

    const cylinderGEO = new THREE.CylinderGeometry( 0.02, 0.02, 3, 10);
    const cylinderMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    const cylinder = new THREE.Mesh( cylinderGEO, cylinderMaterial );
    scene.add(cylinder);

    cylinder.position.y = 23.5;

    diskoSphere.position.set(0,20,0);
    
    const { rig, spotHelpers } = addOutwardSpotlightsDeserno(diskoSphere, scene, {
        approxCount: 10,
        radius: radiusDisko,
        intensity: 2,
        distance: 60,
        angle: Math.PI / 22,
        penumbra: 0.5,
        castShadow: false,
        helpers: false,
        color: 0xffffff,
    });

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


    //CREATE DISCOKUGELN
    //Quellen: https://codepen.io/ksenia-k/pen/ZEjJxWQ und https://threejsdemos.com/demos/lighting/disco
    //TODO
    

    //UNSICHTBARE WAND BOUNDING BOX
    //Maße des Raums
    const roomWidth  = 70;
    const roomHeight = 25;
    const roomDepth  = 80;
    const wallThickness = 0.5;

    //Textur laden
    const wallBase = setupTexture(
        textureLoader.load('textures/wall/RammedEarth018_COL_2K_METALNESS.png')
        , 1, 1
    )
    const wallNormal = setupTexture(
        textureLoader.load('textures/wall/RammedEarth018_NRM_2K_METALNESS.png')
        , 1, 1
    )

    //Material
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallBase,
        normalMap: wallNormal,
        side:THREE.DoubleSide,
    });
    wallMaterial.color.set(0x8c9fff);

    //Vorderwand
    const wallFront = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness),
        wallMaterial
    );
    wallFront.position.set(0, roomHeight / 2, -roomDepth / 2);
    scene.add(wallFront);
    blockingObjects.push(wallFront);

    //Rückwand
    const wallBack = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness),
        wallMaterial
    );
    wallBack.position.set(0, roomHeight / 2, roomDepth / 2);
    scene.add(wallBack);
    blockingObjects.push(wallBack);

    //Linke Wand
    const wallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
        wallMaterial
    );
    wallLeft.position.set(-roomWidth / 2, roomHeight / 2, 0);
    scene.add(wallLeft);
    blockingObjects.push(wallLeft);

    //Rechte Wand
    const wallRight = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
        wallMaterial
    );
    wallRight.position.set(roomWidth / 2, roomHeight / 2, 0);
    scene.add(wallRight);
    blockingObjects.push(wallRight);

    //Decke
    const ceiling = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth),
        wallMaterial
    );
    ceiling.position.set(0, roomHeight, 0)
    scene.add(ceiling);


    //gltf-loader für .gltf-dateien
    var gltfLoader = new THREE.GLTFLoader();
    //load object
    gltfLoader.load(
        'Assets/JukeBox/scene.gltf',
        function (gltf) {
            const jukebox = gltf.scene;
            jukebox.position.set(30, 0, 0);
            jukebox.scale.set(10, 10, 10);
            jukebox.rotation.set(0, -1.5, 0);

            jukebox.traverse(function (obj) {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
            });

            scene.add(jukebox);
            jukeboxObject = jukebox;
            
            //als Kollisionsobjekt hinzufügen
            jukebox.updateMatrixWorld(true);

            // Bounding Box in Weltkoordinaten
            const boxJukebox = new THREE.Box3().setFromObject(jukebox);
            const sizeJukebox = boxJukebox.getSize(new THREE.Vector3());
            const centerJukebox = boxJukebox.getCenter(new THREE.Vector3());

            const colliderGeoJukebox = new THREE.BoxGeometry(sizeJukebox.x, sizeJukebox.y, sizeJukebox.z);
        

            const jukeboxCollider = new THREE.Mesh(colliderGeoJukebox, ColliderMaterial_invisible);
            jukeboxCollider.position.copy(centerJukebox);

            scene.add(jukeboxCollider);
            blockingObjects.push(jukeboxCollider);
        },
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded (bar)'),
        err => console.error('Error loading new bar:', err)
    );
        
    // BAR laden
    gltfLoader.load(
        'Assets/Bar/scene.gltf',   
        function (gltf) {
            const bar = gltf.scene;

            //Bounding Box berechnen
            bar.updateMatrixWorld(true);
            const box0 = new THREE.Box3().setFromObject(bar);
            const center0 = box0.getCenter(new THREE.Vector3());
            const size0 = box0.getSize(new THREE.Vector3());

            //Modell so verschieben, dass es um (0,0,0) zentriert ist
            bar.position.sub(center0);

            //Skalieren auf Zielbreite
            const targetWidth = 30;
            const scaleFactor = targetWidth / size0.x;
            bar.scale.setScalar(scaleFactor);

            //positionieren
            bar.position.y = 0;
            bar.position.x = -15;
            bar.position.z = -51

            bar.traverse(obj => {
                if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
                }
            });

            scene.add(bar);

            //neue Bounding Box für Collider + Lampen
            bar.updateMatrixWorld(true);
            const boxbar = new THREE.Box3().setFromObject(bar);
            const barCenter = boxbar.getCenter(new THREE.Vector3());
            const barSize = boxbar.getSize(new THREE.Vector3());

            //Collider (noch sichtbar)
            const colliderGeoBar = new THREE.BoxGeometry(barSize.x, barSize.y, barSize.z-6);
            const barCollider = new THREE.Mesh(colliderGeoBar, ColliderMaterial_invisible);
            barCollider.position.copy(barCenter);
            scene.add(barCollider);
            blockingObjects.push(barCollider);

            //Lampen (aus barCenter/barSize abgeleitet)
            const lampColor = 0xff8800;
            const lampIntensity = 2.9;
            const lampDistance = 12;

            const lampHeight = barCenter.y + barSize.y * 0.10;
            const lampZ = barCenter.z - barSize.z * 0.05;
            const xOffsets = [-barSize.x * 0.28, 0, barSize.x * 0.28];

            xOffsets.forEach((xOff) => {
                const lamp = new THREE.PointLight(lampColor, lampIntensity, lampDistance);
                lamp.position.set(barCenter.x + xOff, lampHeight, lampZ);

                //PointLights ohne Schatten
                lamp.castShadow = false;

                scene.add(lamp);
            });
            }
,
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded (bar)'),
        err => console.error('Error loading new bar:', err)
    );


    const danceController = createCharacterDanceController({ THREE, fadeDuration: 0.25 });
    let mixer;
    //Charakter laden
    gltfLoader.load(
        "Characters/Michelle2idle.glb",
        (gltf) => {
            const michelle = gltf.scene;
            michelle.traverse((obj) => {
            if (obj.isMesh || obj.isSkinnedMesh) {
                obj.frustumCulled = false;
            }
            });
            
            scene.add(michelle);
            //blockingObjects.push(michelle);

            michelle.position.set(12,0,-10);
            michelle.scale.set(7,7,7);
            
            danceController.attachCharacter({ root: michelle, animations: gltf.animations });
            danceController.onSongChanged("default");

            //um zu gucken, welche Animationen es gibt
            console.log("Animation Clips:");
            gltf.animations.forEach((clip, i) => {
            console.log(i, clip.name, "duration:", clip.duration, "tracks:", clip.tracks.length);
            });

            //als Kollisionsobjekt hinzufügen
            michelle.updateMatrixWorld(true, true);

            //Bounding Box in Weltkoordinaten
            const size = new THREE.Vector3(6, 12, 4);
            
            const boxMichelle = new THREE.Box3().setFromObject(michelle);
            const centerMichelle = boxMichelle.getCenter(new THREE.Vector3());
            
            const colliderGeoMichelle = new THREE.BoxGeometry(1,1,1);

            const michelleCollider = new THREE.Mesh(colliderGeoMichelle, ColliderMaterial_invisible);
          
            michelleCollider.position.copy(centerMichelle);
            michelleCollider.position.y += 6;
            michelleCollider.scale.copy(size);

            scene.add(michelleCollider);
            blockingObjects.push(michelleCollider);
            //michelle.attach(michelleCollider);

        },

        (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% geladen');
        },
        (error) => {
            console.error("Ein GLB Fehler ist aufgetreten:", error);
        }

    );


    //MAPPING FÜR SONGS AUF ANIMATION
    danceController.setSongClipMapping({
        "I'm On Fire": 2,
        "All Night Long": 3,
        "THRIFT SHOP": 3,
        "Let's Get It Started": 4,
        default: 0,
    });


    const jukeboxUI = createJukeboxUI({
        songs,
        onSongChanged: (songName) => danceController.onSongChanged(songName),
        onSongStarted: (song) => {
            if (song) {
                quiz.showQuizForSong(song);
                stopAmbient();
            }
            else {
                quiz.hideQuiz();
                startAmbient();
            }
        }
    });
    

    //LIGHTS
    //Directional Light
    const color = 0x0100ff;
    const intensity = .8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.target = plane;
    light.position.set(0, 20, 0);
    light.castShadow = true;
    //const tripod2 = new THREE.AxesHelper(5);
    //attachChildObject(light, tripod2, new THREE.Vector3(0,0,0));
    //scene.add(light);
    //scene.add(light.target);

    //Ambient Light
    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    //Pointlights
    const pointlightIntensity = 0.2;
    const pointlightDistance = 100
    const pointlight = new THREE.PointLight(0xff0000, pointlightIntensity, pointlightDistance);
    pointlight.castShadow = false;
    pointlight.position.set(-15, 20, 10);
    //const tripod = new THREE.AxesHelper(5);
    //attachChildObject(pointlight, tripod, new THREE.Vector3(0,0,0));
    scene.add(pointlight);

    const pointlightIntensity2 = 0.1;
    const pointlight2 = new THREE.PointLight(0x0100ff, pointlightIntensity, pointlightDistance);
    pointlight2.castShadow = false;
    pointlight2.position.set(20, 20, -20);
    //const tripod3 = new THREE.AxesHelper(5);
    //attachChildObject(pointlight2, tripod3, new THREE.Vector3(0,0,0));
    scene.add(pointlight2);

    //Flackerndes Licht
    //Quelle: https://threejsdemos.com/demos/lighting/torch
    /* const torch = new THREE.PointLight(0xffaa55, 2, 10, 2)
    torch.position.set(0, 1.5, 0)
    scene.add(torch)

    const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffddaa })
    )
    flame.position.copy(torch.position)
    scene.add(flame)
    const rng = prng(1337) */

    //Interaktion für Jukebox
    const interact = createProximityInteract({
        THREE,
        camera,
        getTargetObject: () => jukeboxObject,
        distance: 15,
        isUIOpen: jukeboxUI.isOpen,
        onEnterRange: () => jukeboxUI.showPrompt("Press E"),
        onExitRange: () => {
            jukeboxUI.hidePrompt();
            jukeboxUI.closeUI();
        },
        onInteract: () => {
            document.exitPointerLock();   // Maus freigeben
            jukeboxUI.openUI();
        },
    });

    //GUI ANLEGEN
    var gui = new dat.GUI();
    gui.add(controls, 'mouseSensitivity', 0.0005, 0.01);

    let framecount = 0;
    // DRAW / RENDERN
    function draw(time){
        const delta = clock.getDelta();
        time *= 0.001;
        framecount++;

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        //HIER KOMMEN OBJEKTE, DIE BEWEGT ODER ANDERWEITIG VERÄNDERT WERDEN SOLLEN
        //...

        if (mixer) mixer.update(delta);
        
        handleKeyboardInput(delta);
        interact.update();
        danceController.update(delta);

        diskoSphere.rotation.x += 0.009;
        diskoSphere.rotation.y += 0.01;
        diskoSphere.rotation.z += 0.006;

        //für etwas bessere Performance nicht jedes Frame aktualisieren
        if (framecount % 10 === 0){
             //für Spiegeltextur
            mirrorSphere.visible = false;
            mirrorSphereCamera.position.copy(mirrorSphere.position);
            mirrorSphereCamera.updateCubeMap(gl, scene);
            mirrorSphere.visible = true;

            spotHelpers.forEach(h => h.update());
            
            //für flackerndes Licht
            /* time += delta
            const noise = (rng() - 0.5) * 2
            const n2 = (rng() - 0.5) * 2
            const flickerIntensity = 0.6
            const speed = 6.0
            const base = 1.8
            const flick = base + flickerIntensity * (Math.sin(time * speed) * 0.5 + 0.5 * noise + 0.25 * n2)
            torch.intensity = Math.max(0.2, flick)
            flame.scale.setScalar(0.8 + (torch.intensity - base) * 0.2) */
        }
        
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

    //Starte Ambient Music
    window.addEventListener("pointerdown", () => {
        startAmbient();
    }, { once: true });

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
    container.add(child);

    const tripod = new THREE.AxesHelper(1);
    container.add(tripod);

    return container;
}

function prng (seed) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 0xffffffff
  }
}

//Quelle: https://www.cmu.edu/biolphys/deserno/pdf/sphere_equi.pdf + ChatGPT
function desernoRegularNormals(N) {
  const a = 4 * Math.PI / N;
  const d = Math.sqrt(a);
  const Mtheta = Math.max(1, Math.round(Math.PI / d));
  const dtheta = Math.PI / Mtheta;
  const dphi = a / dtheta;

  const normals = [];

  for (let m = 0; m < Mtheta; m++) {
    const theta = Math.PI * (m + 0.5) / Mtheta;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    const Mphi = Math.max(1, Math.round((2 * Math.PI * sinT) / dphi));

    for (let n = 0; n < Mphi; n++) {
      const phi = (2 * Math.PI * n) / Mphi;
      normals.push(new THREE.Vector3(
        sinT * Math.cos(phi),
        sinT * Math.sin(phi),
        cosT
      ));
    }
  }

  // Wenn zu viele: gleichmäßig ausdünnen, bis genau N übrig bleibt
  if (normals.length > N) {
    const step = normals.length / N;
    const limited = [];
    for (let i = 0; i < N; i++) {
      limited.push(normals[Math.floor(i * step)]);
    }
    return { normals: limited, count: limited.length, originalCount: normals.length };
  }

  return { normals, count: normals.length, originalCount: normals.length };
}

function addOutwardSpotlightsDeserno(sphereMesh, scene, {
  approxCount = 8,
  radius = 5,
  surfaceOffset = 0.05,    //leicht über der Oberfläche
  targetDistance = 2.0,
  color = 0xffffff,
  intensity = 1.2,
  distance = 40,
  angle = Math.PI / 12,
  penumbra = 0.4,
  decay = 2,
  castShadow = false,
  helpers = false,
} = {}) {
  const { normals, count, originalCount } = desernoRegularNormals(approxCount);
  console.log("Deserno points:", originalCount, "-> limited to:", count);

  const rig = new THREE.Group();
  sphereMesh.add(rig);

  const spotHelpers = [];

  for (const normal of normals) {
    const spot = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
    spot.castShadow = castShadow;

    // Lichtposition auf Oberfläche
    spot.position.copy(normal).multiplyScalar(radius + surfaceOffset);

    // Target muss im Scene-Graph hängen
    const tgt = new THREE.Object3D();
    tgt.position.copy(normal).multiplyScalar(radius + surfaceOffset + targetDistance);
    rig.add(tgt);

    spot.target = tgt;
    rig.add(spot);

    if (helpers) {
      const h = new THREE.SpotLightHelper(spot);
      scene.add(h);
      spotHelpers.push(h);
    }
  }

  return { rig, spotHelpers };
}

