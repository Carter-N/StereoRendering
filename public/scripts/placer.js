//Socket connection
var socket = io();

//Screen dimensions
var width = window.innerWidth;
var height = window.innerHeight;

//Camera and scene
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);
var camera = new THREE.OrthographicCamera(width / -100, width / 100, height / 100, height / -100, -500, 1000);
camera.position.y = 100;

//Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//Add lighting
var light = new THREE.AmbientLight(0x404040);
scene.add(light);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
directionalLight.rotation.set(Math.PI / 2, 0, 0);
scene.add(directionalLight);

//Texture loader
var loader = new THREE.TextureLoader();

//Textures
var woodTexture;
var metalTexture;

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

//Crosshair model
var crosshair;

//Add crosshair to screen
loader.load(
	"crosshair.jpg",
	function(texture){

		//When texture loads add model to screen
		crosshair = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1, 1, 1),
			new THREE.MeshBasicMaterial({
				map: texture
			})
		);
		crosshair.position.y = -3;
		scene.add(crosshair);
	}
);

//Can place bomb
var canPlace = false;
setInterval(function(){
	canPlace = true;
}, 1500);

//Click events
window.addEventListener("mousedown", function(e){

	if(canPlace){

		//Restrict placer from spamming
		canPlace = false; 

		//Add the bomb to the scene
		var bomb = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 0.5),
			new THREE.MeshPhongMaterial({
				color: 0xff0000
			})
		);

		//Set position
		var x = e.clientX;
		var y = e.clientY;

		bomb.position.x = camera.position.x;
		bomb.position.z = camera.position.z;

		scene.add(bomb);

		//Add bomb to player client
		socket.emit("bomb", {
			x: bomb.position.x,
			y: bomb.position.z
		});

		var destroyBomb = function(){
			scene.remove(bomb);
		};

		//Destroy bomb after 2 seconds
		setTimeout(destroyBomb, 2000);
	}
});

//Add the player
var player = new THREE.Mesh(
	new THREE.CubeGeometry(1, 1, 1),
	new THREE.MeshPhongMaterial({
		color: 0xffffff
	})
);
player.position.y = -3;

scene.add(player);

//Position data received
socket.on("position", function(data){
	player.position.set(data.x, -3, data.y);
	player.rotation.y = data.rot;
});

//Rendering loop
var render = function(){
	requestAnimationFrame(render);

	//Update crosshair
	if(crosshair !== undefined){
		crosshair.position.x = camera.position.x;
		crosshair.position.z = camera.position.z;
	}

	//Update logic
	if(keys[65]){
		camera.position.x -= 0.05;
	}

	if(keys[68]){
		camera.position.x += 0.05;
	}

	if(keys[87]){
		camera.position.z -= 0.05;
	}

	if(keys[83]){
		camera.position.z += 0.05;
	}

	renderer.render(scene, camera);
};

//Game entry point
camera.position.y = 0.001;
camera.rotation.x = -Math.PI / 2;
buildLevel();
render();
