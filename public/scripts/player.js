//Socket server connection
var socket = io();

//Screen dimensions
var width = window.innerWidth;
var height = window.innerHeight;

//Camera and scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

//Offset player so they dont start inside a pillar
camera.position.set(10, -3.5, 10);

//Renderer and DOM element
var renderer = new THREE.WebGLRenderer();
var element = renderer.domElement;
var container = document.getElementById('webglviewer');
container.appendChild(element);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

//Stereo rendering effect
var effect = new THREE.StereoEffect(renderer);
effect.setSize(width, height);

//Add ambient lighting
var light = new THREE.AmbientLight(0x404040);
scene.add(light);

//Add directional lighting
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 0);
directionalLight.rotation.set(Math.PI / 2, 0, 0);
scene.add(directionalLight);

//Device orientation controls
controls = new THREE.DeviceOrientationControls(camera);

//Request fullscreen
container.addEventListener("click", function(){
	if(container.requestFullscreen){container.requestFullscreen();
	}else if(container.msRequestFullscreen){container.msRequestFullscreen();
	}else if(container.mozRequestFullScreen){container.mozRequestFullScreen();
	}else if(container.webkitRequestFullscreen){container.webkitRequestFullscreen();}
}, false);

//Bomb collision
var playerRadius = 1;
var blastRadius = 15;

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

//Bomb geometry and material
var bombGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
var bombMaterial = new THREE.MeshPhongMaterial({
	color: 0xff0000
});

//Bomb blast geometry and material
var blastGeomtery = new THREE.SphereGeometry(blastRadius, blastRadius, 30, 30);
var blastMaterial = new THREE.MeshPhongMaterial({
	color: 0xff0000,
	transparent: true,
	opacity: 0.5
});

//Bomb was placed by placer
socket.on("bomb", function(data){

	/*
		TODO: Change data names to reflect the plane where the bombs position is arbitrary
	*/

	//Add the bomb to the scene
	var bomb = new THREE.Mesh(bombGeometry, bombMaterial);
	bomb.position.set(data.x, -5, data.y);
	scene.add(bomb);

	//Add the blast to the scene
	var blast = new THREE.Mesh(blastGeomtery, blastMaterial);
	blast.position.set(data.x, -5, data.y);
	scene.add(blast);

	//Set a timeout to detonate the bomb
	var destroyBomb = function(){

		//Remove the meshes from the scene
		scene.remove(bomb);
		scene.remove(blast);

		//Calculate distance between the player and the bomb
		var dx = camera.position.x - bomb.position.x;
		var dz = camera.position.z - bomb.position.z;
		var distance = Math.sqrt((dx * dx) + (dz * dz));
		if(distance < playerRadius + blastRadius){
			socket.emit("dead", {});
		}
	};

	//Destroy bomb after two seconds
	setTimeout(destroyBomb, 2000);
});

//Move the camera forwards
var moving = touch;

//Window resize event
window.addEventListener("resize", resize);

//Rendering loop
var render = function(){
	requestAnimationFrame(render);

	/*
		TODO: See docs on this function, might not need per frame calls
	*/

	//Update controls
	controls.update();

	//Move the camera
	if(moving){
		var x = -Math.sin(camera.rotation.y) / 10;
		var z = -Math.cos(camera.rotation.y) / 10;
		camera.position.x += x;
		camera.position.z += z;
	}

	/*
		TODO: Data naming issues
	*/

	//Send updated position data to server 
	socket.emit("position", {
		x: camera.position.x,
		y: camera.position.z,
		rot: camera.rotation.y
	});

	//Stereoscopic renderer
	effect.render(scene, camera);
};

//Game entry point
buildLevel(socket);
render();
