import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// 场景设置
const scene = new THREE.Scene();
// 在渲染器设置中启用后期处理
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
});
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);

// 控制选项
const options = {
    animation: true,
    showOrbit: true,
    backgroundColor: 0x000000,
};

// 天体参数
const celestialBodies = {
    sun: {
        radius: 50,
        texture: './public/textures/sun.jpg',
        rotationSpeed: 0.004
    },
    mercury: {
        radius: 3.8,
        texture: './public/textures/mercury.jpg',
        distance: 80,
        rotationSpeed: 0.004,
        revolutionSpeed: 0.047
    },
    venus: {
        radius: 9.5,
        texture: './public/textures/venus.jpg',
        distance: 120,
        rotationSpeed: 0.002,
        revolutionSpeed: 0.035
    },
    // 可以继续添加其他行星
};
// 添加泛光效果（可选）
function addBloomEffect() {
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,   // 强度
        0.4,   // 半径
        0.85   // 阈值
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    
    return composer;
}
// 创建天体
function createCelestialBody(params) {
    const geometry = new THREE.SphereGeometry(params.radius, 32, 32);
    const texture = new THREE.TextureLoader().load(params.texture);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
}

// 创建轨道
function createOrbit(radius) {
    const geometry = new THREE.RingGeometry(radius, radius + 0.1, 64);
    const material = new THREE.MeshBasicMaterial({
        color: "white",
        side: THREE.DoubleSide,
        opacity: 1,
        transparent: true
    });
    const orbit = new THREE.Mesh(geometry, material);
    // 将轨道旋转90度使其水平
    orbit.rotation.x = Math.PI / 2;
    return orbit;
}

// 创建天体的函数需要分开处理太阳和行星
function createSun(params) {
    // 创建太阳的球体
    const geometry = new THREE.SphereGeometry(params.radius, 32, 32);
    const texture = new THREE.TextureLoader().load(params.texture);
    // 使用 MeshBasicMaterial 使太阳自发光
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        emissive: 0xffff00,  // 发光颜色
    });
    const sun = new THREE.Mesh(geometry, material);

    // 添加太阳光晕
    const spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load('./public/textures/sun_glow.jpg'),  // 需要一个光晕贴图
        // color: 0xffff00,
        // transparent: true,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    const glowScale = 5; // 光晕大小
    sprite.scale.set(params.radius * glowScale, params.radius * glowScale, 1);
    sun.add(sprite);

    return sun;
}

// 创建行星的函数保持不变
function createPlanet(params) {
    const geometry = new THREE.SphereGeometry(params.radius, 32, 32);
    const texture = new THREE.TextureLoader().load(params.texture);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
}


// 修改创建太阳系的函数
function createSolarSystem() {
    // 创建太阳
    const sun = createSun(celestialBodies.sun);
    scene.add(sun);
    celestialBodies.sun.meshObject = sun;

    // 创建水星组
    const mercuryGroup = new THREE.Group();
    scene.add(mercuryGroup);
    
    // 创建水星
    const mercury = createPlanet(celestialBodies.mercury);
    mercury.position.x = celestialBodies.mercury.distance;
    mercuryGroup.add(mercury);
    celestialBodies.mercury.meshObject = mercury;
    
    // 创建金星组
    const venusGroup = new THREE.Group();
    scene.add(venusGroup);
    
    // 创建金星
    const venus = createPlanet(celestialBodies.venus);
    venus.position.x = celestialBodies.venus.distance;
    venusGroup.add(venus);
    celestialBodies.venus.meshObject = venus;

    // 如果开启显示轨道，添加行星轨道
    if (options.showOrbit) {
        const mercuryOrbit = createOrbit(celestialBodies.mercury.distance);
        const venusOrbit = createOrbit(celestialBodies.venus.distance);
        scene.add(mercuryOrbit);
        scene.add(venusOrbit);
    }

    return { mercuryGroup, venusGroup };
}

// 初始化场景
function initScene() {
    // 设置渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(options.backgroundColor);
    // 创建一个纹理图片加载器加载图片
    var textureLoader = new THREE.TextureLoader();
    // 加载背景图片
    var texture = textureLoader.load('./public/textures/space.jpg');
    // 纹理对象Texture赋值给场景对象的背景属性.background
    scene.background = texture

    document.body.appendChild(renderer.domElement);

    // 设置相机
    camera.position.set(0, 200, 300);
    camera.lookAt(0, 0, 0);


    // 创建天体系统
    createSolarSystem();

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 添加太阳的外部光晕效果
    const sunLight = new THREE.PointLight(0xffff00, 1.5, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // 添加性能监视器
    const stats = new Stats();
    document.body.appendChild(stats.domElement);

    return { controls, stats };
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (options.animation) {
               // 太阳自转
               celestialBodies.sun.meshObject.rotation.y += celestialBodies.sun.rotationSpeed;
        
               // 水星自转和公转
               celestialBodies.mercury.meshObject.rotation.y += celestialBodies.mercury.rotationSpeed;
               celestialBodies.mercury.meshObject.parent.rotation.y += celestialBodies.mercury.revolutionSpeed;
               
               // 金星自转和公转
               celestialBodies.venus.meshObject.rotation.y += celestialBodies.venus.rotationSpeed;
               celestialBodies.venus.meshObject.parent.rotation.y += celestialBodies.venus.revolutionSpeed;
           
    }
    
    renderer.render(scene, camera);
    stats.update();
}

// 修改GUI控制面板
function createGUI() {
    const gui = new GUI();
    
    // 动画控制
    const animationFolder = gui.addFolder('动画控制');
    animationFolder.add(options, 'animation').name('运行动画');
    animationFolder.add(options, 'showOrbit').name('显示轨道');
    
    // 速度控制
    const speedFolder = gui.addFolder('速度控制');
    speedFolder.add(celestialBodies.sun, 'rotationSpeed', 0, 0.01).name('太阳自转');
    speedFolder.add(celestialBodies.mercury, 'rotationSpeed', 0, 0.01).name('水星自转');
    speedFolder.add(celestialBodies.mercury, 'revolutionSpeed', 0, 0.1).name('水星公转');
    speedFolder.add(celestialBodies.venus, 'rotationSpeed', 0, 0.01).name('金星自转');
    speedFolder.add(celestialBodies.venus, 'revolutionSpeed', 0, 0.1).name('金星公转');
    
    // 背景控制
    gui.addColor(options, 'backgroundColor').name('背景颜色')
        .onChange(value => renderer.setClearColor(value));
}

// 初始化
const { controls, stats } = initScene();
// createGUI();
animate();