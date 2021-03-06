
var Phases = function(){
		this.phase1 = false;
		this.phase2 = false;
		this.phase3 = false;
		this.phase4 = false;
		this.phase5 = false;
		this.phase6 = false;
		this.current = 0;
}

var Turbo = function (versor, tier, hitbox, color){
    this.particles = new ParticleSystem(limit = 60,
                                        spread = 0.3,
                                        duration=10,
                                        speed=10,
                                        color=color,
                                        versor = versor,
                                        position = hitbox.center,
                                        mode = "BURST");
//   functionalVector = function(versor, f, magnitude, rate, limit){
    magnitude = 5 * tier;
    rate = 0.2;
    if (rate > 0.9){
        rate = 0.9
    }
    functionalVector.call(this,versor, linearIncrement, magnitude, -rate);
    this.setTier = function(tier){
        this.tier=tier;
    }
    this.cooldownLimit = 5 - tier;
    this.cooldown = 0;
    this.requested = false;
    this.activate = function(){
        if (this.cooldown == 0){
            this.setStart();
            this.cooldown = this.cooldownLimit;
            this.requested=true;
            this.particles.formParticles();
        }
    }
    // auxHitbox is a list of aux hitboxes
    this.update = function(hitbox, auxHitbox){
        this.particles.update();
        this.apply(hitbox, auxHitbox);
        if (this.requested){
            var that = this;
            this.cooldownCounter= setTimeout(function(){that.cooldown = 0;}, 1000);
            this.requested=false;
        }
    }
}

var TargetSystem = function(){
    this.currentTarget = undefined;
    this.index = 0;
    this.possibleTargets = [];
    this.cursor = new Cursor("#00FF00");
    this.cursor.dash=8;
    this.cursor.spin=1;
    this.color="#00FF00";
    this.distance = 0;
    this.predictedPath = [];
    this.autoAiming=false;
    this.autoFiring=false;
    this.shipVelocity = 0;
    this.refreshRate = 0;
    this.refreshIndex= 0;
    this.updateRefresh = function(){
        this.refreshIndex++;
        this.refreshIndex %= this.refreshRate;
    }
    this.setPossibleTargets = function(targets){
        this.possibleTargets = targets;
    }
    this.analyseTarget= function(myPosition){
        if (this.possibleTargets.length == 0){
            return;
        }
        if (this.currentTarget == undefined || this.currentTarget.dead){
            this.changeTarget();
        }
        this.distance = distance(myPosition, this.currentTarget.hitbox.center);
        this.velocity = Math.round(this.currentTarget.hitbox.velocity);
        this.direction = this.currentTarget.inertiaVector;
    }
    this.aimAssist = function(weapons, shipVelocity){
        if (this.possibleTargets.length == 0){
            return;
        }
        // travel time for bullets to reach target
        this.shipVelocity = shipVelocity;
        this.inRange=false;
        for (var i = 0; i < weapons.length; i++){
            var weaponVelocity = weapons[i].projectileVelocity;
            this.distance = distance(weapons[i].position, 
                                         this.currentTarget.hitbox.center);
            this.distance = Math.round(this.distance);
            this.travelTime = this.distance / (weaponVelocity + shipVelocity);
            if (this.distance < (weapons[i].range + shipVelocity)){
                this.inRange=true;
            }
            predictedPath = new Point(0, 0);
            predictedPath.x = this.currentTarget.hitbox.center.x + this.direction.x * this.travelTime;
            predictedPath.y = this.currentTarget.hitbox.center.y + this.direction.y * this.travelTime;
            this.predictedPath.push(predictedPath);
        }
    }
    this.clearAimAssist = function(){
        this.predictedPath = [];
    }
    this.changeTarget = function(){
        if (this.possibleTargets.length == 0){
            return;
        }
        this.index++;
        this.index %= this.possibleTargets.length;
        this.currentTarget = this.possibleTargets[this.index];
    }
    this.displayInfo = function(){
        if (this.currentTarget == undefined || this.currentTarget.dead){
            return;
        }
        ctx.beginPath();
        ctx.fillStyle=this.color;
        var string = "Target:   " + this.currentTarget.name + (this.index+1);
        ctx.fillText(string, c.width/2 - 50, 40);
        if (!this.inRange){
            ctx.fillStyle="#FF0000"; 
        }
        var string = "Distance: " + this.distance;
        ctx.fillText(string, c.width/2 - 50, 60);
    }
    this.drawAid = function(weapons){
        if (this.currentTarget == undefined || this.currentTarget.dead){
            return;
        }
        this.cursor.setPoint(this.currentTarget.hitbox.center);
        this.cursor.radius=this.currentTarget.hitbox.side + 5;
        this.cursor.draw();
        this.drawPredictedPath(weapons);
    }
    this.drawPredictedPath = function(weapons){
        for (var i = 0; i < this.predictedPath.length; i++){
            if (weapons[i].enabled){
                if (this.inRange){
                    this.cursor.color="#00FF00";
                }
                else{
                    this.cursor.color="#FF0000";
                }
                this.cursor.setPoint(this.predictedPath[i]);
                this.cursor.radius=3;
                this.cursor.draw();
            }
        }
    }
    this.setAutoAim = function(set, weapons){
        this.autoAiming=set;
        if (!set){
            for (var i = 0; i < weapons.length; i++){
                if (weapons[i].turret){
                    weapons[i].setCenter(coord);
                }
            }
        }
    }
    this.autoAim = function(weapons){
        if (!this.autoAiming){
            return;
        }
        if (this.currentTarget == undefined ||
            this.possibleTargets.length == 0){
                for (var i = 0; i < weapons.length; i++){
                    if (weapons[i].turret){
                        weapons[i].setCenter(coord);
                    }
                }
            if (this.autoFiring){
                this.autoFiring=false;
                for (var i = 0; i < weapons.length; i++){
                        weapons[i].firing=false;
                }
            }
        }
        else{ 
            this.autoFiring=true;
            for (var i = 0; i < weapons.length; i++){
                if (weapons[i].turret){
                    weapons[i].setCenter(this.predictedPath[i]);
                }
            }
        }
    }
    this.autoFire = function(weapons){
        if (!this.autoFiring || !this.autoAiming){ 
            return;
        }
        for (var i = 0; i < weapons.length; i++){
            if (weapons[i].turret){
                if (this.distance < weapons[i].range){
                    weapons[i].firing=true;
                }
                else{
                    weapons[i].firing=false;
                }
            }
        }
    }
}

var EnergySource = function(max = 100, rechargeRate = 10, rechargeSpeed=500){ //rechargeSpeed in microseconds; rechargeRate in points per second
	this.max = max;
	this.current = this.max;
	this.rechargeRate = rechargeRate;
	this.rechargeSpeed = rechargeSpeed;
	this.rechargeEvent = undefined;
	this.recharging = true;
    this.getValue = function(){
        var value = this.max * this.rechargeRate;
        value /= 1000;
        value *= 1000 - rechargeSpeed;
        value = Math.round(value);
        return value;
    }
    this.describe = function(){
        var list = [];
        var max = "Max points: " + this.max;
        var rechargeRate = "Recharge Rate: " + this.rechargeRate;
        var rechargeSpeed = "Recharge Speed: " + this.rechargeSpeed/1000 + " seconds";
        var resistance = "Resistance: " + this.resistance;
        list.push(max, rechargeRate, rechargeSpeed);
        return list;
    }
	this.recharge = function(source){
		if (this.recharging){
			if (this.current < this.max){
				this.current += this.rechargeRate;
				if (this.current > this.max){
					this.current = this.max;
				}
				this.recharging = false;
				this.rechargeEvent = undefined;
			}
			if (this.rechargeEvent == undefined){
				this.rechargeEvent = setTimeout(function(){source.recharging = true;}, source.rechargeSpeed);
			}
		}
	}
	this.drain = function(n){
		this.current -= n;
		if (this.current < 0){
			this.current = 0;
		}
	}
}

var Shield = function(max = 100, resistance=0, drainRate=10, rechargeEfficiency = 0.5, drainSpeed = 250){
    this.sound = null;
	this.enabled = false;
	this.max = max;
	this.current = 0;
	this.drainRate = drainRate;
	this.rechargeEfficiency = rechargeEfficiency; // transforms 1 energy point into 'k' shield points
	this.drainSpeed = drainSpeed;
	this.draining = true;
	this.drainEvent = undefined;
	this.powerSupply = new EnergySource(0, 0);
	this.resistance = 0;
	this.resistanceType = 'f'; // defense type can be either 'f' (flat) or 'p' (porcentual)
							// The first case will simply subtract a constant from the received damage; the second will multiply the damage by the constant
	
    this.getValue = function(){
        value = this.max * (this.resistance + 1); //assumes a flat resistance
        value *= this.rechargeEfficiency;
        value *= 1000 - this.drainSpeed;
        value = Math.round(value/100);
        return value;
    }
    this.describe = function(){
        var list = [];
        var max = "Max points: " + this.max;
        var drainRate = "Drain Rate: " + this.drainRate;
        var drainSpeed = "Drain Speed: " + this.drainSpeed/1000 + " seconds";
        var rechargeEfficiency = "Recharge Efficiency: " + this.rechargeEfficiency;
        var resistance = "Resistance: " + this.resistance;
        list.push(max, drainRate, rechargeEfficiency, drainSpeed, resistance);
        return list;
    }
	this.setPowerSupply = function(powerSupply){
		this.powerSupply = powerSupply;
	}
	this.setEnabled = function(enabled){
		this.enabled = enabled;
	}
	this.drainEnergy = function(shield){	// drains energy from power supply to recharge shield points
		if (this.draining && this.enabled){
				this.draining = false;
				this.drainingEvent = undefined;
				if (this.drainingEvent === undefined){
					this.drainingEvent = setTimeout(function(){shield.draining = true;}, shield.drainSpeed);
				}
			if (this.current < this.max){
				
				if (this.powerSupply.current > this.drainRate){
					this.current += this.drainRate * this.rechargeEfficiency;
					this.powerSupply.current -= this.drainRate;
				}
				else{
					this.current += this.powerSupply.current * this.rechargeEfficiency;
					this.powerSupply.current = 0;
				}
				if (this.current > this.max){
					this.current = this.max;
				}
			
			}
			
		}
	}
	this.sufferDamage = function(damage){
		if (this.resistanceType == 'f'){
			var actualDamage = damage - this.resistance;
			if (actualDamage > 0){
					this.current -= actualDamage;
			}
		}
		else{
			var actualDamage = damage * this.resistance;
			if (actualDamage > 0){
					this.current -= actualDamage;
			}			
		}
		if (this.current < 0){
			var exceedingDamage = this.current * -1;
			this.current = 0;
		}
		else{
			exceedingDamage = 0;
		}
        if (this.sound != null){
            soundPool.addSound(this.sound);
        }
		return exceedingDamage;
	}
}
var Hull = function(max = 100, resistance = 0){
    this.sound = null;
	this.max = max;
	this.current = this.max;
	this.resistance = resistance;
	this.resistanceType = 'f'; // same as shield defense type -- 'f' for flat resistance; 'p' for porcentual

    this.getValue = function(){
        value = this.max * (this.resistance + 1); //assumes a flat resistance
        return value;
    }
    this.describe = function(){
        var list = [];
        var max = "Max points: " + this.max;
        var resistance = "Resistance: " + this.resistance;
        list.push(max, resistance);
        return list;
    }
	this.sufferDamage = function(damage){
		if (this.resistanceType == 'f'){
			var actualDamage = damage - resistance;
			if (actualDamage > 0){
					this.current -= actualDamage;
			}
		}
		else{
			var actualDamage = damage * resistance;
			if (actualDamage > 0){
					this.current -= actualDamage;
			}			
		}
        if (this.sound != null){
            soundPool.addSound(this.sound);
            }
	}
	this.recover = function(heal){
		this.current += heal;
		if (this.current > this.max){
			this.current = this.max;
		}
	}
}

var Ship = function(x, y, l1, primaryColor = "#0000FF", secondaryColor = "#00F0FF"){
	this.hitbox = new Triangle(x, y, l1,
						0, 0,			// vx, vy
						0, 0);			// velocity, spin
	
    this.type='s'; //ship-type
	this.primaryColor = primaryColor;
	this.secondaryColor = secondaryColor;	
	this.auxHitbox = new Triangle(x, y - l1, l1, 0, 0, 0, 0);
	this.powerSupply = new EnergySource(100, 10);
	this.hull = new Hull();
	this.shield = new Shield();
	this.immunity = false;
	this.dead = false;
	this.weapons = [];

    this.targetSystem = new TargetSystem();

    this.engineSound = null;
    this.deadSound = null;
	this.currentWeapon = 0;
	this.lock = false;
	this.engineOn = true;
	this.reverseEngine = false;
	this.braking = false;
	this.isTurning = false;
	this.isStrafing = false;
	this.strafingSide = 0; // 0 for left; -1 for right
	this.acceleration = 0.125;
	this.maxSpeed = 4;
	this.turnRate = 3.5;
	this.turning = false;
	this.rotate = 0;
    this.mouseMode = true;
	this.front = new Point(this.hitbox.vertices[2].x,
						   this.hitbox.vertices[2].y);
	this.inertiaVector = new Vector(0, 0);
	this.engineVersor = new Vector(0, 0);
	this.engineVector = new Vector(0, 0);
	this.strafingVector = new Vector(0, 0);

    this.turbo = new Turbo(this.engineVersor, 1, this.hitbox, this.secondaryColor);
    /*
var ParticleSystem = function(limit = 30,
                        spread = 5,
                        duration=10,
                        speed=1,
                        color = "#0000FF",
                        versor = vector, // new Versor(x, y)
                        position = point // new Point(x, y)){
                        mode = "CONTINUOUS")
*/

    this.engineParticles = new ParticleSystem(
                                                    limit = 30,
                                                    spread = 0.5,
                                                    duration=6,
                                                    speed=2,
                                                    color = this.secondaryColor,
                                                    versor = this.engineVersor,
                                                    position = this.hitbox.center,
                                                    mode = "CONTINUOUS"
                                                  );

	this.autoPath = new Point(0, 0);

    this.getEngineValue = function(){
        var value = this.maxSpeed * 10;
        value += this.acceleration * 1000;
        value += this.turnRate * 100;
        return Math.round(value);
    }
    this.describeEngine = function(){
        var list = [];
        var maxSpeed = "Max Speed: " + this.maxSpeed;
        var acceleration = "Acceleration : " + this.acceleration;
        var turnRate = "Turn Rate: " + this.turnRate;
        list.push(maxSpeed, acceleration, turnRate);
        return list;
    }
    this.getValue = function(){
        var value = this.getEngineValue();
        value += this.hull.getValue();
        value += this.shield.getValue();
        value += this.powerSupply.getValue();
        for (var i =0; i < this.weapons.length; i++){
            value += this.weapons[i].getValue();
        }
        return value; 
    }	
	this.updateDirection = function(){

		if (!this.engineOn && !this.reverseEngineOn && this.braking == false){
            if (this.engineSound != null){
                this.engineSound.stopSound();
            }
			return;
		}
		
		this.inertiaVector.x = this.hitbox.versor.x * this.hitbox.velocity;
		this.inertiaVector.y = this.hitbox.versor.y * this.hitbox.velocity;
		
		if (this.engineOn){
			calculateVector(this.front, this.hitbox.center, this.engineVersor);
			unitVector(this.engineVersor, this.engineVersor);
			this.engineVector.x = this.engineVersor.x * this.acceleration;
			this.engineVector.y = this.engineVersor.y * this.acceleration;
            if (this.engineSound != null){
                if (this.engineSound.currentTime > 2){
                    this.engineSound.currentTime=0.1;
                }
                this.engineSound.playSound2();
            }
		}
		else{
			if (this.braking){ //Advanced Braking System
				unitVector(this.inertiaVector, this.engineVersor);
				this.engineVersor.x *= -1;
				this.engineVersor.y *= -1;
				if (this.acceleration > this.hitbox.velocity){
					this.engineVector.x = this.engineVersor.x * this.hitbox.velocity;
					this.engineVector.y = this.engineVersor.y * this.hitbox.velocity;
				}
				else{
					this.engineVector.x = this.engineVersor.x * this.acceleration;
					this.engineVector.y = this.engineVersor.y * this.acceleration;	
				}
			}
			else { // reverseEngine
				calculateVector(this.front, this.hitbox.center, this.engineVersor);
				unitVector(this.engineVersor, this.engineVersor);
				if (this.reverseEngineOn){
					this.engineVersor.x *= -1;
					this.engineVersor.y *= -1;
				this.engineVector.x = this.engineVersor.x * this.acceleration;
				this.engineVector.y = this.engineVersor.y * this.acceleration;
				}
			}
		}

		var aux = new Vector(this.engineVector.x + this.inertiaVector.x,
							 this.engineVector.y + this.inertiaVector.y);
		var calculatedSpeed = norm(aux);
		if (calculatedSpeed <= this.maxSpeed){
			if (calculatedSpeed == 0){
				this.hitbox.velocity = calculatedSpeed;
				this.hitbox.versor.x = 0;
				this.hitbox.versor.y = 0;
				this.auxHitbox.velocity = this.hitbox.velocity;
				this.auxHitbox.versor = this.hitbox.versor;
			}
			else{
				unitVector(aux, aux);
				this.hitbox.velocity = calculatedSpeed;
				this.hitbox.versor.x = aux.x;
				this.hitbox.versor.y = aux.y;
				this.auxHitbox.velocity = this.hitbox.velocity;
				this.auxHitbox.versor = this.hitbox.versor;
			}				
		}
        else{
            unitVector(aux, aux);
            this.hitbox.versor.x = aux.x;
            this.hitbox.versor.y = aux.y;
            this.auxHitbox.velocity = this.hitbox.velocity;
            this.auxHitbox.versor = this.hitbox.versor;
        }
	}
	this.updatePosition = function(){
        this.turbo.update(this.hitbox, [this.auxHitbox]);
		this.hitbox.update(); 
		this.auxHitbox.update();
		this.front.x = this.hitbox.vertices[2].x;
		this.front.y = this.hitbox.vertices[2].y;
	}
	
	this.updateTurn = function(){
		if (this.isTurning){
            this.hitbox.spin = 0;
            this.auxHitbox.spin = 0;
			rotatePolygon(this.hitbox, this.rotate);
			theta = degreesToRadians(this.rotate);
			for (var i = 0; i < this.auxHitbox.vertices.length; i++){

				this.auxHitbox.vertices[i].x -= this.hitbox.center.x;
				this.auxHitbox.vertices[i].y -= this.hitbox.center.y;
				x = this.auxHitbox.vertices[i].x * Math.cos(theta) - this.auxHitbox.vertices[i].y * Math.sin(theta);
				y = this.auxHitbox.vertices[i].x * Math.sin(theta) + this.auxHitbox.vertices[i].y * Math.cos(theta);
				this.auxHitbox.vertices[i].x = x + this.hitbox.center.x;
				this.auxHitbox.vertices[i].y = y + this.hitbox.center.y;
			}
		}
	}
	this.turn = function(side, isTurning){
		this.isTurning = isTurning;
		if (side == 'l'){
			this.rotate = -this.turnRate;
		}
		else{
			this.rotate = this.turnRate;
		}
	}
	this.updateStrafe = function(){
		if (!this.isStrafing){
			return;
		}
		this.inertiaVector.x = this.hitbox.versor.x * this.hitbox.velocity;
		this.inertiaVector.y = this.hitbox.versor.y * this.hitbox.velocity;

		var mid = new midPoint(this.hitbox.vertices[0], this.hitbox.vertices[1]);
		if (this.strafingSide == -1){
			calculateVector(mid, this.hitbox.vertices[0], this.strafingVector);
		}
		else{
			calculateVector(mid, this.hitbox.vertices[1], this.strafingVector);
		}
		
		unitVector(this.strafingVector, this.strafingVector);
		this.strafingVector.x = this.strafingVector.x * this.acceleration;
		this.strafingVector.y = this.strafingVector.y * this.acceleration;

		var aux = new Vector(this.strafingVector.x + this.inertiaVector.x,
							 this.strafingVector.y + this.inertiaVector.y);
		var calculatedSpeed = norm(aux);
		if (calculatedSpeed <= this.maxSpeed){
			if (calculatedSpeed == 0){
				this.hitbox.velocity = calculatedSpeed;
				this.hitbox.versor.x = 0;
				this.hitbox.versor.y = 0;
			}
			else{
				unitVector(aux, aux);
				this.hitbox.velocity = calculatedSpeed;
				this.hitbox.versor.x = aux.x;
				this.hitbox.versor.y = aux.y;
			}				
		}
        else{
            unitVector(aux, aux);
            this.hitbox.versor.x = aux.x;
            this.hitbox.versor.y = aux.y;
        }
		this.auxHitbox.velocity = this.hitbox.velocity;
		this.auxHitbox.versor = this.hitbox.versor;
	}
	this.strafe = function(side, isStrafing){
		this.isStrafing = isStrafing;
		if (side == 'l'){
			this.strafingSide = 1;	// left side
		}
		else{
			this.strafingSide = -1; // right side
		}
	}
	this.throttle = function(pressed){
		this.engineOn = pressed;
	}
	this.brake = function(pressed){
		this.braking = pressed;
	}
	this.reverseThrottle = function(pressed){
		this.reverseEngineOn = pressed;
	}
	this.calculateAngle = function(autoPath){		//autoPath is a given (x,y) point
		pathVector = new Vector(0, 0);
		frontVector = new Vector(0, 0);
		calculateVector(autoPath, this.hitbox.center, pathVector);
        calculateVector(this.front, this.hitbox.center, frontVector);
        unitVector(frontVector, frontVector);
        /*
		if (this.hitbox.velocity == 0){
			calculateVector(this.front, this.hitbox.center, frontVector);
			unitVector(frontVector, frontVector);
			
		}
		else{
			frontVector.x = this.engineVersor.x;
			frontVector.y = this.engineVersor.y;
		}
        */
		translatedPoint = new Point(this.hitbox.center.x - autoPath.x, this.hitbox.center.y - autoPath.y);
		list = [];
		list.push(translatedPoint);
		this.pathAngle = angleVectors(frontVector, pathVector);
		this.pathAngle = radiansToDegrees(this.pathAngle);
		rotatedVector = new Vector(0, 0);
		var theta = degreesToRadians(90);
		rotatedVector.x = frontVector.x * Math.cos(theta) - frontVector.y * Math.sin(theta);
		rotatedVector.y = frontVector.x * Math.sin(theta) + frontVector.y * Math.cos(theta);
		myProjection = projection(list, rotatedVector);
			if (myProjection.min > 0){
				this.pathAngle *= -1;
			}
	}
	this.drawAutoPath = function(){
		if (!this.lock){
			return;
		}
		ctx.setLineDash([4]);
		ctx.strokeStyle=this.primaryColor;
		ctx.beginPath();
		ctx.moveTo(this.hitbox.center.x, this.hitbox.center.y);
		ctx.lineTo(this.autoPath.x, this.autoPath.y);
		ctx.stroke();
		ctx.setLineDash([0]);
	}
    this.updateMouseRotate = function(){
        if (!this.mouseMode){
            return;
        }
        if (coord != undefined){
            this.calculateAngle(coord);
        }
        if (this.pathAngle != 0){
            this.mouseRotate();
        }
    }
	this.mouseRotate = function(){
		if (this.pathAngle > -5 && this.pathAngle < 5){
		    this.turn('l', false);
			return;
		}
		if (this.pathAngle > 0){
			if (this.pathAngle >= this.turnRate){
				this.pathAngle -= this.turnRate;
				this.turn('r', true);
			}
			else{
				this.turn('r', true);
				this.updateTurn();
				this.turn('l', false);
				this.pathAngle = 0;
			}
		}
		else{
			if (this.pathAngle < this.turnRate){
				this.pathAngle += this.turnRate;
				this.turn('l', true);
			}
			else{
				this.turn('l', true);
				this.updateTurn();
				this.turn('l', false);
				this.pathAngle = 0;
			}
		}
	}
	this.autoRotate = function(){
		if (this.pathAngle == 0){
			return;
		}
		if (this.pathAngle > 0){
			if (this.pathAngle >= this.turnRate){
				this.pathAngle -= this.turnRate;
				this.turn('r', true);
			}
			else{
				this.turn('r', true);
				this.updateTurn();
				this.turn('l', false);
				this.pathAngle = 0;
			}
		}
		else{
			if (this.pathAngle < this.turnRate){
				this.pathAngle += this.turnRate;
				this.turn('l', true);
			}
			else{
				this.turn('l', true);
				this.updateTurn();
				this.turn('l', false);
				this.pathAngle = 0;
			}
		}
	}
	this.autoPilot = function(){ 	// auto-pilot function to move to coordinates
		if (!this.lock){
			return;
		}
		if (this.autoStatus.phase1){
			this.calculateAngle(this.autoPath);
			this.autoStatus.phase1 = false;
			this.autoStatus.current++;
			return;
		}


		if (this.autoStatus.phase2){
			this.throttle(false);
			this.brake(true);
			if (this.hitbox.velocity == 0){
				this.autoStatus.phase2 = false;
				this.brake(false);
				this.autoStatus.current++;
			}
			return;

		}
		
		if (this.autoStatus.phase3){
			this.calculateAngle(this.autoPath);
			this.autoStatus.phase3 = false;
			return;

		}
		
		if (this.autoStatus.phase4){
			this.autoRotate();
			if (this.pathAngle == 0){
				this.autoStatus.phase4 = false;
			}
			return;
			
		}
		if (this.autoStatus.phase5){
			var dist = distance(this.hitbox.center, this.autoPath);
			var timeToStop = this.hitbox.velocity / this.acceleration;
			var ETA = dist / this.hitbox.velocity;
			if (ETA > timeToStop){
				this.throttle(true);
			}
			else{
				this.autoStatus.phase5 = false;
				this.throttle(false);
			}
			return;
		}
		
		if (this.autoStatus.phase6){
			this.brake(true);
			if (this.hitbox.velocity == 0){
				this.autoStatus.phase6 = false;
				this.brake(false);
				this.lock = false;
			}
			//console.log("System unlocked!");
			return;
		}
	}
	this.autoStatus = new Phases();
	this.setupAutoPilot = function(coord){
		this.autoPath = new Point(coord.x, coord.y);
		this.autoStatus.phase1 = true;
		this.autoStatus.phase2 = true;		
		this.autoStatus.phase3 = true;
		this.autoStatus.phase4 = true;
		this.autoStatus.phase5 = true;
		this.autoStatus.phase6 = true;
		this.autoStatus.current = 0;
	}
	this.drawStatus = function(color = this.secondaryColor){
        if (camera == undefined){
            canvas = c;
        }
        else{
            canvas = camera;
        }

		ctx.beginPath();
		ctx.font="14px Arial";
		ctx.fillStyle=color;
		string = "Hull: " + this.hull.current;
		ctx.fillText(string, canvas.width - 200, 30);
		string = "Immunity: " + this.immunity;
		ctx.fillText(string, canvas.width - 200, 60);
		string = "Energy: " + this.powerSupply.current;
		ctx.fillText(string, canvas.width - 200, 90);		
		if (this.shield != undefined){
			if (this.shield.enabled){
				string = "Shield enabled: " + this.shield.current;
			}
			else{
				string = "Shield disabled: " + this.shield.current;	
			}
			ctx.fillText(string, canvas.width - 200, 120);					
		}
	}
	this.draw = function(polygon = this.hitbox){
		ctx.save();
		ctx.lineWidth=3;
		ctx.beginPath();
		if (polygon.hit == true && this.shield.current == 0){
			ctx.strokeStyle="#FF0000";
			ctx.fillStyle="#FF0000";
		}
		else{
			ctx.strokeStyle=this.primaryColor;
			ctx.fillStyle=this.primaryColor;
		}
		
		for (var i = 0; i < polygon.vertices.length; i++){
			ctx.beginPath();
			ctx.arc(polygon.vertices[i].x,
			polygon.vertices[i].y,
			3, 0, 2*Math.PI);
			if (i == 2){
				ctx.fillStyle=this.secondaryColor;
			}
			ctx.fill();
		}
		for (var i = 0; i < polygon.vertices.length - 1; i++){
			ctx.beginPath();
			ctx.moveTo(polygon.center.x, polygon.center.y);
			ctx.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
			ctx.stroke();
		}
		for (var i = 0; i < polygon.vertices.length - 1; i++){
			ctx.beginPath();
			ctx.moveTo(polygon.vertices[2].x, polygon.vertices[2].y);
			ctx.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
			ctx.stroke();
		}
			
		if (polygon.center != undefined){
			ctx.fillStyle=this.secondaryColor;
			ctx.beginPath();
			ctx.arc(polygon.center.x,
					polygon.center.y,
					3, 0, 2*Math.PI);
			ctx.fill();
		}
		if (this.immunity == true){
			ctx.strokeStyle=this.secondaryColor;
			ctx.beginPath();
			ctx.arc(polygon.center.x,
					polygon.center.y,
					polygon.side + 2, 0, 2*Math.PI);
			ctx.stroke();
		}
		if (this.shield.enabled && this.shield.current > 0){
			ctx.save();
            if (polygon.hit == true){
			    ctx.strokeStyle=this.primaryColor;
                ctx.beginPath();
                ctx.arc(polygon.center.x,
                        polygon.center.y,
                        polygon.side + 2, 0, 2*Math.PI);
                ctx.stroke();	
                ctx.restore();
            } 
		}
		ctx.restore();
	}
	this.setImmunity = function(seconds){
		this.immunity = true;
		setTimeout(function(	){this.player.immunity = false;}, seconds * 1000);
	}
	this.addWeapon = function(weapon){
		this.weapons.push(weapon);
	}
	this.changeWeapon = function(){
		this.weapons[this.currentWeapon].firing = false;
		this.currentWeapon++;
		this.currentWeapon = this.currentWeapon % this.weapons.length;
		this.weapon = this.weapons[this.currentWeapon];
	}
	this.cycleEnabledWeapons = function(){
		this.currentWeapon++;
		this.currentWeapon = this.currentWeapon % this.weapons.length;
		if (this.weapons[this.currentWeapon].enabled){
			this.weapons[this.currentWeapon].enabled = false;
		}
		else{
			this.weapons[this.currentWeapon].enabled = true;			
		}
	}
	this.sufferDamage = function(damage){
		if (this.immunity == true){
			return;
		}
		if (this.shield != undefined && this.shield.enabled && this.shield.current > 0){
			var exceedingDamage = this.shield.sufferDamage(damage); // subtract shield points
			if (exceedingDamage){
				this.hull.sufferDamage(exceedingDamage);
			}
		}		
		else{
			this.hull.sufferDamage(damage);
		}
	    if (this.hull.current < 0){
		    this.dead=true;
            if (this.deadSound != null){
                soundPool.ignoreQueue(this.deadSound);
            }
	    }
	}
}

function displayValueConsole(ship){
        console.log("engine: " + ship.getEngineValue());
        console.log("hull:" + ship.hull.getValue());
        console.log("shield:" + ship.shield.getValue());
        console.log("power source:" + ship.powerSupply.getValue());
        console.log("Weapons");
        for (var i =0; i < ship.weapons.length; i++){
            console.log(ship.weapons[i].name + ": " + ship.weapons[i].getValue());
        }
        console.log("ship total: " + ship.getValue());
}

function describeShipConsole(ship){
        console.log(ship.name);
        var string = "Shield --"; 
        string += JSON.stringify(ship.shield.describe());
        console.log(string);
        string = "Hull--"; 
        string += JSON.stringify(ship.hull.describe());
        console.log(string);
        string = "Energy Source--"; 
        string += JSON.stringify(ship.powerSupply.describe());
        console.log(string);
        string = "Engine--"; 
        string += JSON.stringify(ship.describeEngine());
        console.log(string);
}

function drawStats(ship, bgColor, textColor){
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle=bgColor;
        var spacing = 20;
        var height = spacing * (6 + ship.weapons.length)
        ctx.fillRect(c.width/3 -20, 20, c.width/1.5, height);
    
        ctx.fillStyle=textColor;

        string = "HULL: "; 
        ctx.font="11px arial";
        string += JSON.stringify(ship.hull.describe());
        for (var i = 0; i < 10; i++){
            string = string.replace('"', '');
            string = string.replace('[', '');
            string = string.replace(']', '');
        }
        ctx.fillText(string, c.width/3, 40);
        ctx.fillStyle="#FFFF00";
        string = "ENGINE: "; 
        string += JSON.stringify(ship.describeEngine());
        for (var i = 0; i < 10; i++){
            string = string.replace('"', '');
            string = string.replace('[', '');
            string = string.replace(']', '');
        }

        ctx.fillText(string, c.width/3, 60);
        ctx.fillStyle="#00FF00";
        string = "ENERGY: "; 
        string += JSON.stringify(ship.powerSupply.describe());
        for (var i = 0; i < 10; i++){
            string = string.replace('"', '');
            string = string.replace('[', '');
            string = string.replace(']', '');
        }
        ctx.fillText(string, c.width/3, 80);
        ctx.font="10px arial";
        ctx.fillStyle="#00F0FF";
        var string = "SHIELD: "; 
        string += JSON.stringify(ship.shield.describe());
        for (var i = 0; i < 10; i++){
            string = string.replace('"', '');
            string = string.replace('[', '');
            string = string.replace(']', '');
        }
        ctx.fillText(string, c.width/3, 100);
        ctx.font="12px arial";
        ctx.fillStyle="#FF0000";
        var string = "WEAPONS"; 
        ctx.font="10px arial";
        ctx.fillText(string, c.width/3, 120);
        var start = 140;
        for (var j = 0; j < ship.weapons.length; j++){
            string = JSON.stringify(ship.weapons[j].describe());
            for (var i = 0; i < 10; i++){
                string = string.replace('"', '');
                string = string.replace('[', '');
                string = string.replace(']', '');
            }
            ctx.fillText(string, c.width/3, start + j * spacing);
        }
        ctx.restore();
}
