//Texture loader
var loader = new THREE.TextureLoader();

//Level variables
var size;
var pillars = [];

//Build the level
var buildLevel = function(socket){

	//Wait for initial server data to arrive before building level
	socket.on("init", function(data){

		/* 
			TODO: Fix the level meshes acting up when setting size variable to data received over socket
		*/
		//Level size
		size = 160;

		//Add ceiling and ground to scene
		loader.load("stone.jpg", function(texture){

			//Set texture reapeat stats
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(10, 10);

			//Create the mesh
			var ground = new THREE.Mesh(
				new THREE.BoxGeometry(size + 8, 16, size + 8),
				new THREE.MeshPhongMaterial({
					map: texture,
					side: THREE.BackSide
				})
			);

			//Offset ground so it lines up with pillar array
			ground.position.set(-8, 0, -8);

			//Add mesh to the scene
			scene.add(ground);
		});

		//Add pillars to the scene
		loader.load("wood.jpg", function(texture){

			//Set texture repeat
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(2, 4);

			//Pillar geometry and material
			pillarGeometry = new THREE.BoxGeometry(4, 20, 4);
			pillarMaterial = new THREE.MeshPhongMaterial({
				map: texture
			});

			//Add pillars
			for(var x = -size / 2; x < size / 2; x += size / (size / 16)){
				for(var y = -size / 2; y < size / 2; y += size / (size / 16)){

					//Create the pillar mesh
					var pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
					pillar.position.set(x, 0, y);

					//Add position to pillar data
					pillars.push(pillar.position);

					//Add the mesh to the scene
					scene.add(pillar);
				}
			}
		});
	});
};