//Keys currently pressed
var keys = new Array(400);

//Keydown event
window.addEventListener("keydown", function(e){
	keys[e.keyCode] = true;
});

//Keyup event
window.addEventListener("keyup", function(e){
	keys[e.keyCode] = false;
});