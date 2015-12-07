//Socket connection
var socket = io();

//Screen dimensions
var width = window.innerWidth;
var height = window.innerHeight;

//Camera and scene
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

//Renderer
var renderer = new THREE.WebGLRenderer();
var element = renderer.domElement;
var container = document.getElementById('webglviewer');
container.appendChild(element);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//Stereo rendering effect
var effect = new THREE.StereoEffect(renderer);
effect.eyeSeparation = 1;
effect.setSize(width, height);

//Add lighting
var light = new THREE.AmbientLight(0x404040);
scene.add(light);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 0);
directionalLight.rotation.set(Math.PI / 2, 0, 0);
scene.add(directionalLight);

//Device controls
var device = new THREEx.DeviceOrientationState();

//Texture loader
var loader = new THREE.TextureLoader();

//Textures
var woodTexture;
var metalTexture;

//Fullscreen
container.addEventListener("click", function(){

	if(container.requestFullscreen){
		container.requestFullscreen();
	}else if(container.msRequestFullscreen){
		container.msRequestFullscreen();
	}else if(container.mozRequestFullScreen){
		container.mozRequestFullScreen();
	}else if(container.webkitRequestFullscreen){
		container.webkitRequestFullscreen();
	}
}, false);

//Window resize event
var resize = function(){

	//Screen dimensions
	var width = container.offsetWidth;
    var height = container.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    effect.setSize(width, height);
};

//Load a level
var level = [];
var size = 20;

var loadLevel = function(src){

	//Level image data
	var levelImage = new Image();
	levelImage.src = src;

	levelImage.onload = function(){

		//Add level data
	}
};

//Build the level
var buildLevel = function(data){

	//Add ceiling and ground
	loader.load(
		"metal.jpg",

		//On load callback
		function(texture){

			//Set the texture
			woodTexture = texture;

			//Add the ground
			var ground = new THREE.Mesh(
				new THREE.PlaneGeometry(size, size, size / 2, size / 2),
				new THREE.MeshPhongMaterial({
					map: woodTexture
				})
			);
			ground.rotation.x = -Math.PI / 2;
			ground.position.y = -5;

			scene.add(ground);

			//Add ceiling
			var ceiling = new THREE.Mesh(
				new THREE.PlaneGeometry(size, size, size / 2, size / 2),
				new THREE.MeshPhongMaterial({
					map: woodTexture
				})
			);
			ceiling.rotation.x = Math.PI / 2;
			ceiling.position.y = -1;

			scene.add(ceiling);
		}
	);

	//Load wood texture and add walls
	loader.load(
		"wood.jpg",

		//On load callback
		function(texture){

			//Add map walls
			for(var x = -size / 2; x < size / 2; x += size / (size / 4)){
				for(var y = -size / 2; y < size / 2; y += size / (size / 4)){

					//Add a cube
					var cube = new THREE.Mesh(
						new THREE.BoxGeometry(2, 4, 2),
						new THREE.MeshPhongMaterial({
							map: texture
						})
					);
					cube.position.set(x + 1, -3, y + 1);

					scene.add(cube);
				}
			}
		}
	);
};

//Bomb was placed
socket.on("bomb", function(data){

	//Add the bomb to the scene
	var bomb = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({
			color: 0xff0000
		})
	);

	bomb.position.x = data.x;
	bomb.position.z = data.y;
	bomb.position.y = -4.5;

	scene.add(bomb);

	var destroyBomb = function(){
		scene.remove(bomb);

		//Check player collision
		var dx = camera.position.x - bomb.position.x;
		var dz = camera.position.z - bomb.position.z;
		var distance = Math.abs(Math.sqrt((dx * dx) + (dz * dz)));
		console.log(distance);
		if(distance < 3.5){
			camera.position.y = 10000;
			console.log("dead!");
		}
	};

	//Destroy bomb after 2 seconds
	setTimeout(destroyBomb, 2000);
});

//Move the player forwards
var moving = false;

container.addEventListener("touchstart", function(){
	moving = true;
}, false);
container.addEventListener("touchend", function(){
	moving = false;
}, false);

//Rendering loop
var render = function(){
	requestAnimationFrame(render);
	resize();

	//Update logic
	/*(if(keys[65]){
		camera.rotation.y += 0.05;
	}

	if(keys[68]){
		camera.rotation.y -= 0.05;
	}

	if(keys[87]){
		camera.position.x += -Math.sin(camera.rotation.y) / 15;
		camera.position.z += -Math.cos(camera.rotation.y) / 15;
	}

	if(keys[83]){
		camera.position.x += Math.sin(camera.rotation.y) / 15;
		camera.position.z += Math.cos(camera.rotation.y) / 15;
	}*/

	if(moving){
		camera.position.x += -Math.sin(camera.rotation.y) / 15;
		camera.position.z += -Math.cos(camera.rotation.y) / 15;
	}

	camera.rotation.y = device.angleX();
	//camera.rotation.y = device.angleX();
	//camera.rotation.z = device.angleZ();

	//Send position data
	socket.emit("position", {
		x: camera.position.x,
		y: camera.position.z,
		rot: camera.rotation.y
	});

	effect.render(scene, camera);
};

//Game entry point
camera.position.z = 5;
camera.position.y = -3.5;
buildLevel();
render();
