//Stat and preformance tracker
var stats = new Stats();
stats.setMode(1);

//Screen dimensions
var width = window.innerWidth;
var height = window.innerHeight;

//Align stat tracker to top left of screen
stats.domElement.style.position = "absolute";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";

//Add stats element to screen
document.body.appendChild(stats.domElement);

//Crosshair
var crosshair = document.getElementById("crosshair");
crosshair.style.left = width / 2;
crosshair.style.top = height / 2; 

//Socket connection
var socket = io();

//Camera and scene
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.y = 50;

//Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//Ambient light
var light = new THREE.AmbientLight(0x404040);
scene.add(light);

//Directional light
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
directionalLight.rotation.set(Math.PI / 2, 0, 0);
scene.add(directionalLight);

//Texture loader
var loader = new THREE.TextureLoader();

//Bomb placing reset
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
			new THREE.BoxGeometry(2.5, 2.5, 2.5),
			new THREE.MeshPhongMaterial({
				color: 0xff0000
			})
		);

		var blast = new THREE.Mesh(
			new THREE.SphereGeometry(15, 15, 30, 30),
			new THREE.MeshPhongMaterial({
				color: 0xff0000,
				transparent: true,
				opacity: 0.5
			})
		);

		//Set position
		var x = e.clientX;
		var y = e.clientY;

		bomb.position.x = camera.position.x;
		bomb.position.z = camera.position.z;
		blast.position.x = bomb.position.x;
		blast.position.z = bomb.position.z;

		scene.add(bomb);
		scene.add(blast);

		//Add bomb to player client
		socket.emit("bomb", {
			x: bomb.position.x,
			y: bomb.position.z
		});

		var destroyBomb = function(){
			scene.remove(bomb);
			scene.remove(blast);
		};

		//Destroy bomb after 2 seconds
		setTimeout(destroyBomb, 2000);
	}
});

//Add the player
var player = new THREE.Mesh(
	new THREE.CubeGeometry(4, 4, 4),
	new THREE.MeshPhongMaterial({
		color: 0xffffff
	})
);

scene.add(player);

//Position data received
socket.on("position", function(data){
	player.position.set(data.x, 0, data.y);
	player.rotation.y = data.rot;
});

var lineGeometry = new THREE.Geometry();
lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
lineGeometry.vertices.push(new THREE.Vector3(5, 5, 5));
var line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
	color: 0xff0000
}));
scene.add(line);

var drawLine = function(p1, p2){
	lineGeometry.vertices[0] = p1;
	lineGeometry.vertices[1] = p2;
	lineGeometry.verticesNeedUpdate = true;
};

//Rendering loop
var render = function(){
	stats.begin();
	requestAnimationFrame(render);
	drawLine(player.position, new THREE.Vector3(0, 0, 0));

	//Update logic
	if(keys[65]){
		camera.position.x -= 0.1;
	}

	if(keys[68]){
		camera.position.x += 0.1;
	}

	if(keys[87]){
		camera.position.z -= 0.1;
	}

	if(keys[83]){
		camera.position.z += 0.1;
	}

	//Camera zoom controls
	if(camera.position.y > 0){
		camera.position.y += wheelDelta / 2;
		wheelDelta = 0;
	}

	renderer.render(scene, camera);
	stats.end();
};

//Game entry point
camera.rotation.x = -Math.PI / 2;
buildLevel(socket);
render();
