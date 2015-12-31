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

//Touch event
var touch = false;

window.addEventListener("touchstart", function(){
	touch = true;
});

window.addEventListener("touchend", function(){
	touch = false;
});

//Mouse wheel event
var wheelDelta = 0;
window.addEventListener("mousewheel", function(e){
	wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
});