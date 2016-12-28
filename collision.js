var c = document.getElementById("umCanvas");
var ctx = c.getContext("2d");

Versor = function(x, y){
	this.x=x;
	this.y=y;
}

Point = function(x, y){
	this.x=x;
	this.y=y;
}

Vector = function(x, y){
	this.x=x;
	this.y=y;
}

Projection = function(min, max){
	this.min = min;
	this.max = max;
}

function distance(pointA, pointB){
	var x =  pointA.x - pointB.x;
	x = x * x;
	var y = pointA.y - pointB.y;
	y = y * y;
	return Math.sqrt(x - y);
}

function calculateVector(pointA, pointB, vector){
	vector.x = pointA.x - pointB.x;
	vector.y = pointA.y - pointB.y;
}

function norm(vector){
	var x1 = vector.x * vector.x;
	var y1 = vector.y * vector.y;
	return Math.sqrt(x1 + y1);
}

function normalVector1(pointA, pointB, vector){
	x = pointA.x - pointB.x;
	y = pointA.y - pointB.y;
	vector.x = -y
	vector.y =  x;
}
function normalVector2(pointA, pointB, vector){
	x = pointA.x - pointB.x;
	y = pointA.y - pointB.y;
	vector.x =  y
	vector.y = -x;
}

function unitVector(vector, unit){;
	var denom = norm(vector);
	unit.x = vector.x / denom;
	unit.y = vector.y / denom;
}

function dotProduct(vectorA, vectorB){
	return vectorA.x*vectorB.x + vectorA.y*vectorB.y;
}

function calculateProjections(polygon){
	for (var i = 0; i < polygon.axes.length; i++){
			polygon.projections[i] = projection(vertices, polygon.axes[i]);
	}
}

function projection(vertices, axis){
	min = 99999;
	max = -99999; 
	var product;
	for (var i = 0; i < vertices.length; i++){
		product = dotProduct(vertices[i], axis);
		if (product > max){
			max = product;
		}
		if (product < min){
			min = product;
		}
	}
	var projection = new Projection(min, max);
	return projection;
}


function overlap(objA, objB){

}

// theta should be in degrees
function rotatePolygon(polygon, theta){
		theta *= theta * Math.PI / 180;
		for (i = 0; i < polygon.vertices.length; i++){
			polygon.vertices[i].x -= polygon.center.x;
			polygon.vertices[i].y -= polygon.center.y;
			x = polygon.vertices[i].x * Math.cos(theta) - polygon.vertices[i].y * Math.sin(theta);
			y = polygon.vertices[i].x * Math.sin(theta) + polygon.vertices[i].y * Math.cos(theta);
			polygon.vertices[i].x = x + polygon.center.x;
			polygon.vertices[i].y = y + polygon.center.y;
		}
}

var angle = 1 * Math.PI / 180;
var cos = Math.cos(angle);
var sin = Math.sin(angle);
function simpleRotate(polygon){
		for (i = 0; i < polygon.vertices.length; i++){
			polygon.vertices[i].x -= polygon.center.x;
			polygon.vertices[i].y -= polygon.center.y;
			x = polygon.vertices[i].x * cos - polygon.vertices[i].y * sin;
			y = polygon.vertices[i].x * sin + polygon.vertices[i].y * cos;
			polygon.vertices[i].x = x + polygon.center.x;
			polygon.vertices[i].y = y + polygon.center.y;
		}
}

function listToVertices(list){
	vertices = [];
	if (list.length % 2 != 0){
		console.log("Error: list is not a valid set of coordinates.");
	}
	for (var i = 0; i < list.length; i+=2){
		this.vertices[i/2]= new Point(list[i], list[i+1]);
	}
	return vertices;
}

function times2(a){
	return a * 2;
}

function drawPolygon(polygon){
	ctx.beginPath();
	ctx.strokeStyle="#000000";
	ctx.moveTo(polygon.vertices[0].x,
			   polygon.vertices[0].y);

	for (var i =0; i < polygon.vertices.length; i++){
		ctx.lineTo(polygon.vertices[i].x,
				   polygon.vertices[i].y);		
	}
	ctx.lineTo(polygon.vertices[0].x,
			   polygon.vertices[0].y);
			   
	ctx.stroke();
	ctx.fillStyle="#0000FF";
	for (var i = 0; i < polygon.vertices.length; i++){
		ctx.beginPath();
		ctx.arc(polygon.vertices[i].x,
		polygon.vertices[i].y,
		3, 0, 2*Math.PI);
		ctx.fill();
	}
	if (polygon.center != undefined){
		ctx.fillStyle="#00F0FF";
		ctx.beginPath();
		ctx.arc(polygon.center.x,
				polygon.center.y,
				3, 0, 2*Math.PI);
		ctx.fill();
	}
}

midPoint = function(pointA, pointB){
	vector = new Vector(0, 0);
	calculateVector(pointA, pointB, vector);
	vector.x = vector.x * 0.5;
	vector.y = vector.y * 0.5;
	this.x = pointA.x - vector.x;
	this.y = pointA.y - vector.y;
}	

function drawVector(origin, vector){
	ctx.beginPath();
	ctx.strokeStyle="#00FF00"
	ctx.moveTo(origin.x, origin.y);
	ctx.lineTo(origin.x + vector.x, origin.y + vector.y);
	ctx.stroke();
}

function calculateAxes(polygon){
	for (var i = 0; i < polygon.vertices.length-1; i++){
		normalVector1(polygon.vertices[i], polygon.vertices[i+1], polygon.axes[i]);
		unitVector(polygon.axes[i], polygon.axes[i]);
		
	}
	normalVector1(polygon.vertices[i], polygon.vertices[0], polygon.axes[i]);
	unitVector(polygon.axes[i], polygon.axes[i]);
}
function drawAxes(polygon, length){
	
	var axis = new Vector(0, 0);
	for (var i = 0; i < polygon.vertices.length-1; i++){
		var midpoint = new midPoint(polygon.vertices[i], polygon.vertices[i+1]);
		axis.x = polygon.axes[i].x * length;
		axis.y = polygon.axes[i].y * length;
		drawVector(midpoint, axis);
	}
	var midpoint = new midPoint(polygon.vertices[i], polygon.vertices[0]);
		axis = polygon.axes[i];
		axis.x *= length;
		axis.y *= length;
		drawVector(midpoint, axis); 
}



Rect = function(x, y, width, height, vx, vy, velocity, spin){
	var list = [];
	// ponto1
	list.push(x);
	list.push(y);
	
	//ponto2
	list.push(x + width);
	list.push(y);
	
	//ponto3
	list.push(x + width);
	list.push(y + height);
	
	//ponto4
	list.push(x);
	list.push(y + height);

	this.vertices = listToVertices(list);
	this.position = new Point(x, y);
	this.width = width;
	this.height = height;
	this.center = new Point(x + width/2, y + height/2);
	this.hit=false;
	this.versor = new Versor(vx, vy);
	this.velocity = velocity;
	this.spin = spin;
	this.sides = 4;
	this.axes = [];
	this.projections = [];
	for (var i = 0; i < this.sides; i ++){
		this.axes[i] = new Vector(0, 0);
		this.projections[i] = new Projection(0, 0);
	}
}

function incrementVertices(vertices, xIncrement, yIncrement){
		for (var i = 0; i < vertices.length; i++){
			vertices[i].x += xIncrement;
			vertices[i].y += yIncrement;
		}
}
function updateRect(rect){
	xIncrement = rect.versor.x * rect.velocity;
	yIncrement = rect.versor.y * rect.velocity;

	incrementVertices(rect.vertices, xIncrement, yIncrement);
	rect.position.x += xIncrement
	rect.position.y += yIncrement;
	rect.center.x = rect.position.x + rect.width * 0.5;
	rect.center.y = rect.position.y + rect.height * 0.5;
	checkBorder(rect);
}
function checkBorder(rect){
	for (var i = 0; i < rect.vertices.length; i++){
		if (rect.vertices[i].x < 0 || rect.vertices[i].x >= c.width){
					rect.versor.x *= -1;
					break;
		}
		if (rect.vertices[i].y < 0 || rect.vertices[i].y >= c.height){
					rect.versor.y *= -1;
					break;
		}
	}
}

function checkColisionsNaive(array){
	var i, j;
	for (i = 0; i < array.length; i++){
		for (j=i+1; j < array.length; j++){
			if (overlap(array[i], array[j])){
				array[i].hit=true;
				array[j].hit=true;
			}
		}
	}
}

function smallest(width, height){
	if (width <= height){
		return width;
	}
	return height;	
}

function testSTA(objA, objB){

}

function randomRect(maxSize, minSize, maxSpeed, maxSpin){

	var xpos = Math.ceil(Math.random() * c.width/2) + maxSize;
	var ypos = Math.ceil(Math.random() * c.height/2) + maxSize;
	var width = Math.ceil(Math.random() * maxSize) + minSize;
	var height = Math.ceil(Math.random() * maxSize) + minSize;
	var direction = Math.round(Math.random() + 1);
	direction = Math.pow(-1, direction);
	var spin = Math.ceil(Math.random() * maxSpin * direction);
	rect = new Rect(xpos, ypos, 	// x, y
			width, height,	
			Math.random(), Math.random(),	// vx, vy 
			maxSpeed, spin);

	return rect;
}

var tuple = [100,200,100,300,50,300, 50, 200];
var tuple2 = [30, 80, 40, 40, 50, 60];
console.log(tuple);

var j = 0;
var maxSize = c.width/10;
var minSize = c.width/100;
var maxSpeed = 2;
var maxSpin = 2;
var numberObjects = 2;
var objects = [];

for (i = 0; i < numberObjects; i++){
	objects.push(new randomRect(maxSize, minSize, maxSpeed, maxSpin));
	
}
objects[0].spin=0;
objects[1].spin=1;

vector = new Vector(0, 0);
normal = new Vector(0, 0);
unit = new Vector(0, 0);
var axis_length = 20;
function mainLoop(){

	ctx.fillStyle="#FFFF00";
	ctx.fillRect(0,0,c.width,c.height);

	for (i = 0; i < objects.length; i++){
		updateRect(objects[i]);
		drawPolygon(objects[i]);

	}


	for (j = 0; j < objects.length; j++){
		rotatePolygon(objects[j], objects[j].spin);
//		simpleRotate(objects[j]);
		calculateAxes(objects[j]);
		drawAxes(objects[j], axis_length);
	}
	calculateVector(objects[0].vertices[0], objects[0].vertices[1], vector);
	normalVector1(objects[0].vertices[0], objects[0].vertices[1], normal);
	normalVector2(objects[0].vertices[0], objects[0].vertices[1], normal);
	unitVector(normal, unit);
	calculateProjections(objects[0]);
//	console.log(objects[0].projections[2]);
//	console.log(objects[0].axes[0]);
	requestAnimationFrame(mainLoop);
}

mainLoop();