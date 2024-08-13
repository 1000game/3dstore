import * as THREE from './three.module.js';
import { FBXLoader } from './FBXLoader.js';
import { OrbitControls } from './OrbitControls.js';


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

    this._threejs.setSize(window.innerWidth,window.innerHeight); //(modelDiv.offsetWidth, modelDiv.offsetHeight);//

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);


/*texture load*/



    const fov = 60;
    const aspect = modelDiv.offsetWidth / modelDiv.offsetHeight;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(3, 13, 8);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
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


    const textureLoader = new THREE.TextureLoader();
    const diffuseTexture = textureLoader.load('./resources/zombie/tshirt_diffuse_1111.png');
    const normalMap = textureLoader.load('./resources/zombie/tshirt_normal_1001.png');
    const roughnessMap = textureLoader.load('./resources/zombie/tshirt_roughness_1001.png');
    



// Load the model
this._LoadAnimatedModelAndPlay(
  './resources/models/', 'both3.fbx',
  'b16.fbx', new THREE.Vector3(0, 0, 0),
  (model) => {
      model.traverse((child) => {
        child.material.transparent = true;
          if (child.isMesh) {
              // Create the material with the texture and normal map
              child.material = new THREE.MeshStandardMaterial({
                  map: diffuseTexture,
                  normalMap: normalMap,
                  roughnessMap: roughnessMap,  // Use roughnessMap if available
                  roughness: 3.4, 
                  
                  

              });

              model.scale.set(20, 20, 20);
          }
      });
  }
);

       // Load the model
this._LoadAnimatedModelAndPlay(
  './resources/zombie/', 'SkyPano_Milkyway.fbx',
  '', new THREE.Vector3(10, 0, 0)),
 
                  
                  

            
           

       /* this._LoadAnimatedModelAndPlay(
          './resources/zombie/', 'mremireh_o_desbiens.fbx',
          'dance.fbx', new THREE.Vector3(0, 0, 0));*/
          this._LoadAnimatedModelAndPlay(
            './resources/zombie/', 'skysph.fbx',
            'ma.fbx', new THREE.Vector3(0, 8, 0));

            this._LoadAnimatedModelAndPlay(
              './resources/zombie/', 'uploads_files_4720062_skybox1.fbx',
              '', new THREE.Vector3(0, 0, 0));
   

        this._LoadAnimatedModelAndPlay(
          './resources/zombie/', 'ground2.fbx',
          '', new THREE.Vector3(1.52, 0, 0));
  

    this._LoadAnimatedModelAndPlay(
        './resources/zombie/', 'tsancfbx',
        'tsan.fbx', new THREE.Vector3(0, 0, 0));
  
    this._mixers = [];
    this._previousRAF = null;

    this._scrollAmount = 0.0;

    this._RAF();

    this._AddSkybox();

   
  }

  

  _AddSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      './textures/textures2/posx.jpg', // Positive X
      './textures/textures2/negx.jpg', // Negative X
      './textures/textures2/posy.jpg', // Positive Y
      './textures/textures2/negy.jpg', // Negative Y
      './textures/textures2/posz.jpg', // Positive Z
      './textures/textures2/negz.jpg'  // Negative Z
    ]);
    this._scene.background = texture;
  


}


  



  _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      fbx.position.copy(offset);

      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
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
