// An experiment with Unicode and blending modes.

// This file is pretty weak code.


var startChar = 48;
//var startChar = 0x30A0; // Katakana

document.body.onload = function () {

draw();

}

function draw() {
  var c=document.getElementById("game");
var ctx=c.getContext("2d");
ctx.clearRect(0, 0, c.width, c.height);
var squareSize = 600;
var size = 45;

var gridSize = squareSize / size;

ctx.font= size + 'px Courier';
ctx.fillStyle = 'white';
ctx.textBaseline = 'top';

//for (var y = 0 ; y < gridSize; y ++)
//  for (var x = 0; x < gridSize; x++)
//    ctx.fillText(String.fromCharCode(startChar++),size * x, size * y);

ctx.font = '100px Courier'
ctx.globalCompositeOperation = 'lighter';

var xpos = 50;
var ypos = 50;
var xinc = 100;
var yinc = 100;

for (var gridx = 0; gridx < 5 ; gridx++) {
  var x = xpos + gridx * xinc;
  for (var gridy = 0; gridy < 5 ; gridy++) {
    var y = ypos + gridy * yinc;
    ctx.fillStyle = '#a00';
    ctx.fillText(String.fromCharCode(startChar * (gridy+1)), x, y);
    ctx.fillStyle = '#0a0';
    ctx.fillText(String.fromCharCode(startChar * (gridy+1)+1*(gridx+1)), x, y);
    ctx.fillStyle = '#00a';
    ctx.fillText(String.fromCharCode(startChar * (gridy+1)+2*(gridx+1)), x, y);
  }
}

startChar++;
setTimeout(draw, 50);
}