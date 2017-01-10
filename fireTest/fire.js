var c = document.getElementById("umCanvas");
var ctx = c.getContext("2d");
var width = 20;
var height = 20;
var red = new Array(height);
var green = new Array(height);
var blue = new Array(height);

for (var i = 0; i < red.length; i++){
	red[i] = new Array(width);
}
for (var i = 0; i < green.length; i++){
	green[i] = new Array(width);
}
for (var i = 0; i < blue.length; i++){
	blue[i] = new Array(width);
}

var x = 200;
var y = 200;



function generateColor(color, intensity = 255, alternate = 6){
	var i = 0;
		for (var j = 0; j < width; j++){
			var random = Math.random();		
			if (random > 0.5){
				color[i][j]=intensity;
			}
			else{
				color[i][j]=0;	
			}
		}
	for (var i = 1; i < height; i++){
		color[i][0] = (color[i-1][0] + color[i-1][1]) / 2;

		if (i% alternate == 0){
			for (var j = 0; j < width; j++){
				var random = Math.random();		
				if (random > 0.5){
					color[i][j]=intensity;
				}
				else{
					color[i][j]=0;	
				}
			}
		}
		else{
			if (i % 2 != 0){
			for (var j = 1; j < width - 1; j++){
				color[i][j] = (color[i-1][j] + color[i-1][j-1] + color[i-1][j+1]) / 3;
			}
		}
		}
	}
}


function drawFire(){
	for (var i = 0; i < height; i++){
		for (var j = 0; j < width; j++){
			ctx.beginPath();
			if (red[j][i] > 0){
				ctx.fillStyle="rgb(" + red[j][i] + ", 0, 0)";
				ctx.fillRect(y + j, i + x, 1, 1);
			}
				if (green[j][i] > 0){
					ctx.fillStyle="rgb(255, 255, 0)";
				//	ctx.fillStyle="rgb(" + green[j][i] + ", " + green[j][i] + ", " + "0)";
					ctx.fillRect(y + j, i + x, 1, 1);
				}
		}
	}
}
/*
function drawColored(){
	for (var i = 0; i < height; i++){
		for (var j = 0; j < width; j++){
			ctx.beginPath();
			if (red[i][j] > 0){
				ctx.fillStyle="rgb(" + red[i][j] + ", " + green[i][j] + ", " + blue[i][j] + ")";
				ctx.fillRect(y + j, i + x, 1, 1);			
			}
			else{
				ctx.fillStyle="rgb(" + red[i][j] + ", " + red[i][j]
			}
		}
	}
}
*/
generateColor(red, 255, 12);
generateColor(green, 255, 12);

function mainLoop(){

	ctx.fillStyle="rgb(0, 0, 0)";
	ctx.fillRect(0,0,c.width,c.height);

	generateColor(red);
	generateColor(green, 127);
	drawFire();


    requestAnimationFrame(mainLoop)
}


mainLoop();