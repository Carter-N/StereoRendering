//Express instance
var express = require("express");
var app = express();

//HTTP server
var http = require("http").Server(app);

//Socket server
var io = require("socket.io")(http);

//Static directories
app.use(express.static("public"));

//Index page
app.get("/", function(req, res){
	res.sendFile("public/index.html", {root : __dirname});
});

//Placer page
app.get("/placer", function(req, res){
	res.sendFile("public/placer.html", {root : __dirname});
});

//User connection established
io.on("connection", function(socket){
	console.log("User connection established");

	//Player position update
	socket.on("position", function(data){
		io.emit("position", data);
	});

	//Bomb was placed
	socket.on("bomb", function(data){
		console.log("Bomb placed!");
		io.emit("bomb", data);
	});	
});

//Start server
http.listen(80, function(){
	console.log("Server listening on *:3000");
});