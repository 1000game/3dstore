import * as THREE from '../three.module.js';
import { FBXLoader } from '../FBXLoader.js';
import { OrbitControls } from '../OrbitControls.js';

// Override the fetch function to log requests
const originalFetch = fetch;
window.fetch = function() {
  console.log('Fetch request made to:', arguments[0]);
  return originalFetch.apply(this, arguments);
};

class Website3DDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.physicallyCorrectLights = true;
    this._threejs.toneMapping = THREE.ACESFilmicToneMapping;
    this._threejs.outputEncoding = THREE.sRGBEncoding;

    const modelDiv = document.getElementById('model');
    modelDiv.appendChild(this._threejs.domElement);

    this._threejs.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = modelDiv.offsetWidth / modelDiv.offsetHeight;
    const near = 1.0;
    const far = 40000.0; /*end size*/
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(300, 30, 70);
  
    


    this._scene = new THREE.Scene();

    // Add lights
   let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

   light = new THREE.AmbientLight(0xFFFFFF);
    this._scene.add(light);

    this._controls = new OrbitControls(
        this._camera, this._threejs.domElement);
    this._controls.target.set(0, 10, 0);
    this._controls.update();

    // Add Skysphere
    this._AddSkySphere();

    this._AddSkySphere2();

    this._AddSkySphere3();

    // Load the models
    this._LoadAnimatedModelAndPlay(
      './resources/models/', 'all11.fbx',
      'walk.fbx', new THREE.Vector3(0, 0, 0),
      (model) => {
          model.traverse((child) => {
            child.material.transparent = true;
              if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({
                      map: diffuseTexture,
                      normalMap: normalMap,
                      roughnessMap: roughnessMap,
                      roughness: 3.4,
                  });
                  model.scale.set(20, 20, 20);
              }
          });
      }
    );

     // Load the models
     this._LoadAnimatedModelAndPlay(
        './resources/models/', 'monkey7.fbx',
        'walk.fbx', new THREE.Vector3(0, 100, 0),
        (model) => {
            model.traverse((child) => {
              child.material.transparent = true;
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: diffuseTexture,
                        normalMap: normalMap,
                        roughnessMap: roughnessMap,
                        roughness: 3.4,
                    });
                    model.scale.set(20, 20, 20);
                }
            });
        }
      );

    // Initialize mixers and start animation loop
    this._mixers = [];
    this._previousRAF = null;
    this._scrollAmount = 0.0;
    this._RAF();
  }

  _AddSkySphere2() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./savana.jpg', () => {

        const radius = 600; // Example: Change this value to control the size
        const geometry = new THREE.SphereGeometry(radius, 60, 40);
     
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      const skysphere = new THREE.Mesh(geometry, material);
      this._scene.add(skysphere);
    },
    undefined,
    (error) => {
      console.error('Error loading skysphere texture:', error);
    });
  }


  
  _AddSkySphere3() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./sunny.jpg', () => {

        const radius = 30; // Example: Change this value to control the size
        const geometry = new THREE.SphereGeometry(radius, 500, 40);
     
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      const skysphere = new THREE.Mesh(geometry, material);
      this._scene.add(skysphere);
    },
    undefined,
    (error) => {
      console.error('Error loading skysphere texture:', error);
    });
  }


  _AddSkySphere() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./skysphere.jpg', () => {

        const radius = 7000; // Example: Change this value to control the size
        const geometry = new THREE.SphereGeometry(radius, 60, 40);
     
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      const skysphere = new THREE.Mesh(geometry, material);
      this._scene.add(skysphere);
    },
    undefined,
    (error) => {
      console.error('Error loading skysphere texture:', error);
    });
  }





  _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset, onLoadCallback) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      fbx.position.copy(offset);

      if (animFile) {
        const animLoader = new FBXLoader();
        animLoader.setPath(path);
        animLoader.load(animFile, (anim) => {
          const mixer = new THREE.AnimationMixer(fbx);
          this._mixers.push(mixer);
          const action = mixer.clipAction(anim.animations[0]);
          action.play();
        });
      }

      this._scene.add(fbx);
      if (onLoadCallback) onLoadCallback(fbx);
    });
  }

  OnScroll(pos) {
    const a = 15;
    const b = -15;
    const amount = Math.min(pos / 500.0, 1.0);
    this._camera.position.set(a + amount * (b - a), 15, 20);
    this._controls.update();
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Website3DDemo();
});

window.addEventListener('scroll', (e) => {
  _APP.OnScroll(window.scrollY);
});
