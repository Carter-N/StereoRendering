//Express application
var express = require("express");
var app = express();

//HTTP server
var http = require("http").Server(app);

//Socket server
var io = require("socket.io")(http);

//Level size
var levelSize = process.argv[2];
console.log("Building level of size: " + levelSize);

//Static directories
app.use(express.static("public"));

//Index page for player
app.get("/", function(req, res){
	res.sendFile("public/index.html", {root : __dirname});
});

//Placer page
app.get("/placer", function(req, res){
	res.sendFile("public/placer.html", {root : __dirname});
});

//Player page
app.get("/player", function(req, res){
	res.sendFile("public/player.html", {root : __dirname});
});

//User connection established
io.on("connection", function(socket){

	//Send initial data to client
	socket.emit("init", {
		levelSize: levelSize
	});

	//Player position update
	socket.on("position", function(data){
		io.emit("position", data);
	});

	//Bomb was placed
	socket.on("bomb", function(data){
		io.emit("bomb", data);
	});	
});

//Start server
http.listen(80, "192.168.1.152", function(){
	console.log("Server listening...");
});