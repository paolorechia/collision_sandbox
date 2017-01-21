var j = 0;
var maxSize = c.width/10;
var minSize = c.width/100;
var maxSpeed = 0;
var maxSpin = 0;
var numberRectangles = 1;
var numberTriangles = 0;
var numberCircles= 0;
var objects = [];

for (i = 0; i < numberRectangles; i++){
	objects.push(new randomRect(maxSize, minSize, maxSpeed, maxSpin));

}
for (i = 0; i < numberTriangles; i++){
	objects.push(new randomTriangle(maxSize, minSize, maxSpeed, maxSpin));
}
for (i = 0; i < numberCircles; i++){
	objects.push(new randomCircle(maxSize, minSize, 0, maxSpin));
}
var axis_length = 20;
var lastDate = new Date();
var fps = new Fps();
var maxFPS = 1000;
var interval = 1000/maxFPS;

function mainLoop(){
	newDate = new Date();
	elapsedTime = newDate - lastDate;
	lastDate = new Date();
	fps.add(elapsedTime);
    objects[0].moveTo(coord);
	ctx.fillStyle="#FFFF00";
	ctx.fillRect(0,0,c.width,c.height);

	for (i = 0; i < objects.length; i++){
		objects[i].update();
		checkBorder(objects[i]);
	}
	for (j = 0; j < objects.length; j++){
		rotatePolygon(objects[j], objects[j].spin);
		calculateAxes(objects[j]);
		drawAxes(objects[j], axis_length);

	}
	checkElasticCollisionsNaive(objects);
	for (k = 0; k < objects.length; k++){
            if (objects[k].sides == 1){
                drawCircle(objects[k], "#0000FF", "#FF0000", true, "#00F0FF");
            }
            else{
    			drawPolygon(objects[k]);
            }
	}

	fps.calculateMean();
	drawFPS(fps.mean);
	setTimeout(function(){
		requestAnimationFrame(mainLoop)
	}, interval);
}

mainLoop();
