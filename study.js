import * as THREE from 'three';
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//引入性能监视器stats.js
import Stats from 'three/addons/libs/stats.module.js';
// 引入dat.gui.js的一个类GUI
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


//创建一个对象，对象属性的值可以被GUI库创建的交互界面改变
const option = {
    object_ratate: true,
    camera_rotate: true,
    x: 30,
    bg_color:0x444444,
};
const scene = new THREE.Scene();

//点光源：两个参数分别表示光源颜色和光照强度
// 参数1：0xffffff是纯白光,表示光源颜色
// 参数2：1.0,表示光照强度，可以根据需要调整
const pointLight = new THREE.PointLight(0xffffff, 1.0);
pointLight.decay = 0.0;//设置光源不随距离衰减

//点光源位置
pointLight.position.set(400, 400, 0);//点光源放在x轴上
scene.add(pointLight); //点光源添加到场景中


//创建一个长方体几何对象Geometry
const geometry = new THREE.BoxGeometry(100, 100, 100); 
// //创建一个材质对象Material
// const material = new THREE.MeshBasicMaterial({
//     color: 0xff0000,//0xff0000设置材质颜色为红色
//     transparent:true,//开启透明
//     opacity:0.5,//设置透明度
// }); 
//MeshLambertMaterial受光照影响
const material = new THREE.MeshPhongMaterial({
    color: "blue",//0xff0000设置材质颜色为红色
    transparent:false,//开启透明
    opacity:0.5,//设置透明度
    side: THREE.DoubleSide, //两面可见
    shininess: 40, //高光部分的亮度，默认30
    specular: 0x444444, //高光部分的颜色
}
); 
//创建一个长方体几何对象Geometry
const sunGeometry = new THREE.SphereGeometry(50, 50, 50); 

const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,//0xff0000设置材质颜色为红色
    transparent:true,//开启透明
    // opacity:0.5,//设置透明度
    // side: THREE.DoubleSide, //两面可见
}); 


// 两个参数分别为几何体geometry、材质material
const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh

const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial)
sunMesh.position.set(400, 400, 0)
//设置网格模型在三维空间中的位置坐标，默认是坐标原点
mesh.position.set(0,0,0);
scene.add(mesh)
scene.add(sunMesh)
// 实例化一个透视投影相机对象
// 75:视场角度, width / height:Canvas画布宽高比, 1:近裁截面, 3000：远裁截面
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );

//相机在Three.js三维坐标系中的位置
// 根据需要设置相机位置具体值
camera.position.set(200, 800, 200); 

//相机观察目标指向Threejs 3D空间中某个位置
camera.lookAt(0, 0, 0); //坐标原点

camera.lookAt(mesh.position);//指向mesh对应的位置

// // 网格模型位置xyz坐标：0,10,0
// mesh.position.set(0,10,0);
// // 相机位置xyz坐标：200, 200, 200
// camera.position.set(200, 200, 200);

// AxesHelper：辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(150);
scene.add(axesHelper);

// 创建渲染器对象
const renderer = new THREE.WebGLRenderer({
    antialias:true,
  });
renderer.setClearColor(option.bg_color, 1); //设置背景颜色
//设置three.js渲染区域的尺寸(像素px)
renderer.setSize( window.innerWidth, window.innerHeight );

renderer.render(scene, camera); //执行渲染操作
// 光源辅助观察
const pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
scene.add(pointLightHelper);
//环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambient);
document.body.appendChild( renderer.domElement );
// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
// 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
controls.addEventListener('change', function () {
    renderer.render(scene, camera); //执行渲染操作
});//监听鼠标、键盘事件

//创建stats对象
const stats = new Stats();
//stats.domElement:web页面上输出计算结果,一个div元素，
document.body.appendChild(stats.domElement);
// renderer.render(scene, camera); //执行渲染操作
document.body.appendChild(renderer.domElement);

// 渲染循环
const clock = new THREE.Clock();
const camera_rotate = {
    angle: undefined
}
function render() {
	//requestAnimationFrame循环调用的函数中调用方法update(),来刷新时间
	stats.update();
    const spt = clock.getDelta()*1000;//毫秒
    // console.log('两帧渲染时间间隔(毫秒)',spt);
    // console.log('帧率FPS',1000/spt);
    renderer.render(scene, camera); //执行渲染操作
    if (option.camera_rotate) {
        // 定义圆心和半径
        const center = new THREE.Vector3(0, 200, 0);
        const radius = 200;
        
        // 定义旋转角度变量（静态变量）
        if (typeof camera_rotate.angle === 'undefined') {
            camera_rotate.angle = 0;
            // 计算初始半径（相机当前位置到圆心的距离）
            camera_rotate.radius = camera.position.distanceTo(center);
        
        }

        // 计算相机新位置
        const x = center.x + camera_rotate.radius * Math.cos(camera_rotate.angle);
        const y = center.y;
        const z = center.z + camera_rotate.radius * Math.sin(camera_rotate.angle);
        // 设置相机位置
        camera.position.set(x, y, z);
        // 让相机始终朝向原点
        camera.lookAt(0, 0, 0);
        // 更新角度 (2*PI/100 表示将圆周分成100份)
        camera_rotate.angle += (Math.PI * 2) / 1000;
    }
    if (option.object_ratate) {
        mesh.rotateY(0.01);//每次绕y轴旋转0.01弧度
        mesh.rotateX(0.01);//每次绕x轴旋转0.01弧度
        mesh.rotateZ(0.01);//每次绕z轴旋转0.01弧度
    }
    requestAnimationFrame(render);//请求再次执行渲染函数render，渲染下一帧
}
render();

// 实例化一个gui对象
const gui = new GUI();
//改变交互界面style属性
gui.domElement.style.right = '0px';
gui.domElement.style.width = '300px';
gui.title("调试面板")

// gui增加交互界面，用来改变obj对应属性
gui.add(axesHelper, 'visible').name("debug模式");
gui.add(pointLight, 'intensity', 0, 2).name("环境光强度").step(0.1);
gui.add(option, 'object_ratate').name("物体旋转");
gui.add(option, 'camera_rotate').name("视角旋转");

// // 当obj的x属性变化的时候，就把此时obj.x的值value赋值给mesh的x坐标
// gui.add(obj, 'x', 0, 180).onChange(function(value){
//     mesh.position.x = value;
// 	// 你可以写任何你想跟着obj.x同步变化的代码
// 	// 比如mesh.position.y = value;
// });
gui.addColor(mesh.material, 'color').name("物体颜色")
gui.addColor(option, 'bg_color').name("背景颜色").onChange(function(value){
    renderer.setClearColor(value, 1); //设置背景颜色\
});