/* Author: Matthew Harrison-Jones
*/

// Array Remove - By John Resig (MIT Licensed)
Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

Array.prototype.removeByValue = function(val) {
    for(var i=0; i<this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}

$(document).ready(function() {
 var fps = 0, now, lastUpdate = (new Date)*1 - 1;
 
 // The higher this value, the less the FPS will be affected by quick changes
 // Setting this to 1 will show you the FPS of the last sampled frame only
 var fpsFilter = 50;
 
 var canvas = $("#myCanvas");
 var context = canvas.get(0).getContext("2d");
 var canvasWidth = $(window).get(0).innerWidth;
 var canvasHeight = $(window).get(0).innerHeight;
 var refreshRate = 77;
 if(touchable) refreshRate = 35;
 var playGame = true;
 var score = 0;
 var scoreOut = document.getElementById('score');
 var stars;
 var numstars;
 var enemies;
 var numEnemies;
 
 var powerups;
 var numPowerups;
 var maxNumPowerups;
 var powerupCharge;
 var powerupChargeRate;
 var powerupCharged;
 
 var canX;
 var canY;
 var touchable = 'ontouchstart' in window || 'createTouch' in document;
 var touches = []; // array of touch vectors
 var rightKey = false;
 var leftKey = false;
 var upKey = false;
 var downKey = false;
 var space = false;
 
 var soundShoot = $("#shootSound").get(0);
 var thrustersSound = $("#thrustersSound").get(0);
 var destroySound = $("#destroySound").get(0);
 var powerupSound = $("#powerupSound").get(0);
 var hitSound = $("#hitSound").get(0);
 
 
 var Star = function(x,y){
 	this.x = x,
 	this.y = y,
 	this.brightness = Math.floor(Math.random()*4);
 	this.radius = Math.floor(Math.random()*4);
 }
 var Bullet = function(owner){
 	this.x = owner.x,
 	this.y = owner.y,
 	this.rotation = owner.rotation,
 	this.vx = 0,
 	this.vy = 0,
 	this.speed = 10,
 	this.size = 3,
 	this.lifetime = 800,
 	this.owner = owner
 }
 
 var Powerup = function(x,y){
 	this.x = x,
 	this.y = y,
 	this.size = 8,
 	this.lifetime = 8000,
 	this.type = randomFromTo(1,4);
 }
 var Ship = function(x, y) {
   this.x = x,
   this.y = y,
   this.width = 20,
   this.height = 20,
   this.halfWidth = this.width/2,
   this.halfHeight = this.height/2,
   this.vx = 0,
   this.vy = 0,
   this.speed = 0,
   this.defaultMaxSpeed = 4,
   this.maxSpeed = 4,
   this.energy = 360,
   this.energyRate = 18,
   this.charge = 0,
   this.defaultChargeRate = 10,
   this.chargeRate = 10,
   this.health = 100,
   this.elasticity = 0.5,
   this.rotation = 0,
   this.rotationSpeed = 2,
   this.flying = false,
   this.powerup = false,
   this.resetPowerupTime = 2000,
   this.powerupTime = 2000,
   this.shield = false,
   this.superSpeed = false,
   this.superFire = false
 };
 
 var ShipEnemy = function(x, y) {
   this.x = x,
   this.y = y,
   this.width = 20,
   this.height = 20,
   this.halfWidth = this.width/2,
   this.halfHeight = this.height/2,
   this.vx = 0,
   this.vy = 0,
   this.speed = 0,
   this.defaultMaxSpeed = 2,
   this.maxSpeed = 2,
   this.energy = 360,
   this.energyRate = 18,
   this.charge = 0,
   this.chargeRate = 10,
   this.defaultChargeRate = 10,
   this.health = 10,
   this.reactionTime = 20,
   this.accuracy = 20,
   this.elasticity = 0.5,
   this.rotation = 0,
   this.rotationSpeed = 4,
   this.flying = false
 };
 
 stars = new Array();
 numStars = 40;
 
 for (var i=0;i<numStars; i++){
 	var x = Math.floor(Math.random()*canvasWidth);
 	var y = Math.floor(Math.random()*canvasHeight);
 	stars.push(new Star(x,y))
 }
 while(stars.length < numStars){
 	var x = canvasWidth+20+Math.floor(Math.random()*canvasWidth);
 	var y = Math.floor(Math.random()*canvasHeight);
 	stars.push(new Star(x,y));
 }
 
 enemies = new Array();
 numEnemies = 1;

 for (var i=0;i<numEnemies; i++){
 	var x = canvasWidth+20+Math.floor(Math.random()*canvasWidth);
 	var y = Math.floor(Math.random()*canvasHeight);
 	enemies.push(new ShipEnemy(x,y));
 }
 
 ship = new Ship(150, canvas.height()/2);
 
 bullets = new Array();
 numBullets = 0;
 
 powerups = new Array();
 numPowerups = 1;
 maxNumPowerups = 2;
 powerupCharge = 200;
 powerupChargeRate = 1;
 powerupChargeMax = 1000;
 
 for (var i=0;i<numPowerups; i++){
 	var x = Math.floor(Math.random()*canvasWidth);
 	var y = Math.floor(Math.random()*canvasHeight);
 	powerups.push(new Powerup(x,y));
 }
 
 function innit(){
 
 	var canvasWidth = $(window).get(0).innerWidth;
 	var canvasHeight = $(window).get(0).innerHeight;
 	window.scrollTo(0,0);

 	while(enemies.length < numEnemies){
 		var x = canvasWidth+20+Math.floor(Math.random()*canvasWidth);
 		var y = Math.floor(Math.random()*canvasHeight);
 		enemies.push(new ShipEnemy(x,y));
 	}
 	if(powerupCharge == powerupChargeMax){
 	
 		if(numPowerups < maxNumPowerups){
 			numPowerups++;
 			powerupCharge = 0;
 		}
 	}
 	
 	while(powerups.length < numPowerups){
 		var x = Math.floor(Math.random()*canvasWidth);
 		var y = Math.floor(Math.random()*canvasHeight);
 		powerups.push(new Powerup(x,y));
 		
 	}
 	if(powerupCharge < powerupChargeMax && numPowerups != maxNumPowerups) powerupCharge += powerupChargeRate;
 	 	
	canvas.attr("width", canvasWidth);
	canvas.attr("height", canvasHeight);
	
	context.save();
	context.fillStyle = '#252935';
	context.fillRect(0, 0, canvas.width(), canvas.height());
 	context.restore();
 		  
 	// 1 - apply velocity to position (vx -> x)
 	  //ship.x += ship.vx;
 	  //ship.y += ship.vy;
 	  if (touchable) {
 	  	if(touches.length > 0){
 	  			var touch = touches[0];
 	  			 	if(touch.clientY != ship.y && touch.clientX != ship.x){
 	  			 		ship.rotation = Math.atan2(
 	  			 			touch.clientY - ship.y, 
 	  			 			touch.clientX - ship.x
 	  			 			) * 180 / Math.PI;
 	  			 	}
				if(touches.length >= 2){
 	  			shoot(ship);
 	  	 	}else{
 	  	 		regen(ship);
 	  		}

 	  	} 	  	
 	  }
 	  if (rightKey){
 	  	ship.rotation += ship.rotationSpeed;
 	  }
 	  if (leftKey){
 	  	ship.rotation -= ship.rotationSpeed;
 	  }
 	  if (upKey){
 	  	if(ship.speed < ship.maxSpeed){ 
 	  		ship.speed += 0.5;
				if(!touchable){
 	  			thrustersSound.currentTime = 0;
 	  			thrustersSound.play();
				}
 	  	}
 	  	ship.vy = Math.sin(ship.rotation*Math.PI/180) * ship.speed;
 	  	ship.vx = Math.cos(ship.rotation*Math.PI/180) * ship.speed;
 	  	ship.flying = true;
 	  }else{
 	  	ship.vy = 0;
 	  	ship.vx = 0;
 	  	ship.speed = 1;
 	  }
 	  if(space){
 	  	shoot(ship);
 	  }else{
 	  	regen(ship);
	  }
 	
 	  ship.x += ship.vx;
 	  ship.y += ship.vy;
	  
	if(!touchable){
 		if (ship.rotation > 360) ship.rotation = 0;
 		if (ship.rotation < 0) ship.rotation = 360;
 	}
 	if (ship.y >= canvasHeight - ship.halfHeight ) {
 	  ship.y = canvasHeight - ship.halfHeight;
 	  ship.vy = -Math.abs(ship.vy);
 	  ship.vy *= ship.elasticity;
 	}
 	if (ship.x >= canvasWidth - ship.halfWidth ) {
 	  ship.x = canvasWidth - ship.halfWidth;
 	  ship.vx = -Math.abs(ship.vx);
 	  ship.vx *= ship.elasticity;
 	}
 	if (ship.y <= 0 + ship.halfHeight) {
 	  ship.y = 0 + ship.halfHeight;
 	  ship.vy = +Math.abs(ship.vy);
 	  ship.vy *= ship.elasticity;
 	}
 	if (ship.x <= 0 + ship.halfWidth) {
 	  ship.x = 0 + ship.halfWidth;
 	  ship.vx = +Math.abs(ship.vx);
 	  ship.vx *= ship.elasticity;
 	}
 		 	
 		// Draw ship
 	context.save();
 		context.translate(ship.x, ship.y);
 		context.rotate(ship.rotation * Math.PI/180);
 		context.translate(-ship.x, -ship.y);
 		
 		if(ship.flying){
	 		context.fillStyle = "#f98224";
	 		context.beginPath();
	 		 //context.arc(0, 0, 2, 0, Math.PI * 2, true);
	 		 context.moveTo(ship.x-randomFromTo(ship.halfWidth,ship.width), ship.y); // give the (x,y) coordinates
	 		 context.lineTo(ship.x-(ship.halfWidth -1), ship.y+(ship.halfHeight/2));
	 		 context.lineTo(ship.x-(ship.halfWidth -1), ship.y-(ship.halfHeight/2));
	 		 context.closePath();
	 		context.fill();
	 	}
 		context.fillStyle = "#fff";
 		context.beginPath();
 		 context.moveTo(ship.x+ship.halfWidth, ship.y); // give the (x,y) coordinates
 		 context.lineTo(ship.x-ship.halfWidth, ship.y-ship.halfHeight);
 		 context.lineTo(ship.x-ship.halfWidth, ship.y+ship.halfHeight);
 		 context.closePath();
 		context.fill();
 		
 		//energy
 		context.lineWidth = 10;
 			context.strokeStyle = "rgba(102, 204, 255, 0.4)"; // stroke color
 		context.beginPath();
 			context.arc(ship.x, ship.y, 40, 0, ship.energy*Math.PI/180, false);
 		context.stroke();
 		
 		//health
 		context.lineWidth = 10;
 		if(ship.health > 50) context.strokeStyle = "rgba(102, 204, 119, 0.4)"; // stroke color
 		else if(ship.health <= 50 && ship.health > 25) context.strokeStyle = "rgba(252, 204, 119, 0.4)"; // stroke color
 		else if(ship.health < 25) context.strokeStyle = "rgba(252, 71, 119, 0.4)"; // stroke color
 		context.beginPath();
 		context.arc(ship.x, ship.y, 30, 0, (ship.health*3.6)*Math.PI/180, false);
 		context.stroke();
 		
 		if(ship.powerupTime > 0 && ship.powerup == true) ship.powerupTime--;
 		else resetPowerups(ship);
 		
 		if(ship.shield){
 			var grd = context.createRadialGradient(ship.x, ship.y, 1, ship.x, ship.y, ship.width*(Math.random()+4));
 			grd.addColorStop(0, "rgba(255, 255, 255, 0)"); // light blue
 			grd.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // light blue
 			grd.addColorStop(1, "rgba(255,255,255, 0.4)"); // dark blue
 			context.fillStyle = grd;
 			context.beginPath();
 			context.arc(ship.x, ship.y, ship.width*4, 0, Math.PI * 2, true);
 			context.closePath();
 			context.fill();
 		}
 		
 	context.restore();
 	
 	var enemyLength = enemies.length;
 	for (var i=0;i<enemyLength;i++){
 		var tmpEnemy = enemies[i];
 		context.save();
 		context.translate(tmpEnemy.x, tmpEnemy.y);
 		context.rotate(tmpEnemy.rotation * Math.PI/180);
 		context.translate(-tmpEnemy.x, -tmpEnemy.y);
 		
 		// Draw ship
	 		if(tmpEnemy.flying){
	 			context.fillStyle = "#f98224";
	 			context.beginPath();
	 			 context.moveTo(tmpEnemy.x-randomFromTo(tmpEnemy.halfWidth,tmpEnemy.width), tmpEnemy.y); // give the (x,y) coordinates
	 			 context.lineTo(tmpEnemy.x-(tmpEnemy.halfWidth -1), tmpEnemy.y+(tmpEnemy.halfHeight/2));
	 			 context.lineTo(tmpEnemy.x-(tmpEnemy.halfWidth -1), tmpEnemy.y-(tmpEnemy.halfHeight/2));
	 			 context.closePath();
	 			context.fill();
	 		}
 			context.fillStyle = "rgb(166, 182, 194)";
 			context.beginPath();
 			context.moveTo(tmpEnemy.x+tmpEnemy.halfWidth, tmpEnemy.y); // give the (x,y) coordinates
 			context.lineTo(tmpEnemy.x-tmpEnemy.halfWidth, tmpEnemy.y-tmpEnemy.halfHeight);
 			context.lineTo(tmpEnemy.x-tmpEnemy.halfWidth, tmpEnemy.y+tmpEnemy.halfHeight);
 			context.closePath();
 			context.fill();
 			context.lineWidth = 10;
 				context.strokeStyle = "rgba(102, 204, 255, 0.4)"; // stroke color
 			context.beginPath();
 				context.arc(tmpEnemy.x, tmpEnemy.y, 40, 0, tmpEnemy.energy*Math.PI/180, false);
 			context.stroke();
 			
 			context.translate(tmpEnemy.x+(tmpEnemy.halfWidth/2), tmpEnemy.y+(tmpEnemy.halfHeight/2));
 			context.rotate(90*Math.PI/180);
 			context.translate(-tmpEnemy.x+(tmpEnemy.halfWidth/2), -tmpEnemy.y+(tmpEnemy.halfHeight/2));
 			context.font = "20px 800 Arial";
 			context.fillText("Enemy", tmpEnemy.x+(tmpEnemy.halfWidth/2), tmpEnemy.y+(tmpEnemy.halfHeight/2)); 
 			
 			context.restore();
 		animateEnemy(tmpEnemy);
 	}
 	
 	var starsLength = stars.length;
 	for (var i=0;i<starsLength;i++){
 		var tmpStar = stars[i];
 			//context.translate(tmpStar.x, tmpStar.y);
 			var brightness = 'rgba(255,255,255, 0.'+tmpStar.brightness+')';
 			context.save();
 		 	context.fillStyle = brightness;
 			context.beginPath();
 			context.arc(tmpStar.x, tmpStar.y, tmpStar.radius, 0, Math.PI * 2, true);
 			context.closePath();
 			context.fill();
 			context.restore();
 	}
 	
	var powerupsLength = powerups.length;
	for (var i=0;i<powerupsLength;i++){
		var tmpPowerup = powerups[i];
			//context.translate(tmpStar.x, tmpStar.y);
			var colour;   
			context.save();
			switch (tmpPowerup.type) {
				case 1: 
						colour = "255, 255, 102";
						context.fillStyle = "rgb(166, 182, 194)";
						context.font = "20px 800 Arial";
						context.fillText("Shield", tmpPowerup.x+(tmpPowerup.size*1.5), tmpPowerup.y+(tmpPowerup.size/2)); 
						break;
				case 2:
						colour = "102, 255, 102";
						context.fillStyle = "rgb(166, 182, 194)";
						context.font = "20px 800 Arial";
						context.fillText("Health", tmpPowerup.x+(tmpPowerup.size*1.5), tmpPowerup.y+(tmpPowerup.size/2)); 
						break;
				case 3:
						colour = "102, 255, 255";
						context.fillStyle = "rgb(166, 182, 194)";
						context.font = "20px 800 Arial";
						context.fillText("Increase Fire Rate", tmpPowerup.x+(tmpPowerup.size*1.5), tmpPowerup.y+(tmpPowerup.size/2)); 
						break;
				case 4:
						colour = "255, 102, 255";
						context.fillStyle = "rgb(166, 182, 194)";
						context.font = "20px 800 Arial";
						context.fillText("Speed", tmpPowerup.x+(tmpPowerup.size), tmpPowerup.y+(tmpPowerup.size/2)); 
						break;
				
			}
			var grd = context.createRadialGradient(tmpPowerup.x, tmpPowerup.y, 1, tmpPowerup.x, tmpPowerup.y, tmpPowerup.size*(Math.random()+4));
		    grd.addColorStop(0, "rgba(255, 255, 255, 0)"); // light blue
		    grd.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // light blue
		    grd.addColorStop(1, "rgba("+colour+", 0.4)"); // dark blue
		    context.fillStyle = grd;
			context.beginPath();
			context.arc(tmpPowerup.x, tmpPowerup.y, tmpPowerup.size*4, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			context.fillStyle = "rgb("+colour+")";
			context.beginPath();
			context.arc(tmpPowerup.x, tmpPowerup.y, tmpPowerup.size, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			context.restore();
			animatePowerup(tmpPowerup);
	}
	
 	var bulletsLength = bullets.length;
 	for (var i=0;i<bulletsLength;i++){
 		var tmpBullet = bullets[i];
 			
 			context.save();
 			context.translate(tmpBullet.x, tmpBullet.y);
 			context.rotate((tmpBullet.rotation) * Math.PI/180);
 			context.translate(-tmpBullet.x, -tmpBullet.y);
 		 	context.fillStyle = '#FFF';
 			context.beginPath();
 			context.fillRect(tmpBullet.x,tmpBullet.y,tmpBullet.size*4,tmpBullet.size); 
 			context.closePath();
 			context.fill();
 			context.restore();
 		animateBullet(tmpBullet, i);
 		
 	}
	ship.flying = false;
	
  	var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
  	fps += (thisFrameFPS - fps) / fpsFilter;
  	lastUpdate = now;	  
 }
 
 function resetPlayer(player){
 	player.x = 150;
 	player.y = canvas.height()/2;
 	player.vx = 0;
 	player.vy = 0;
 	player.health = 100;
 	resetPowerups(player);
 }
function resetPowerups(player){
	player.powerup = false;
	player.powerupTime = ship.resetPowerupTime;
	player.shield = 0;
	player.chargeRate = player.defaultChargeRate;
	player.maxSpeed = player.defaultMaxSpeed;
}
function animateEnemy(tmpEnemy) {
    
    //tmpEnemy.rotation += (Math.random()*1)/ 2;

    if (tmpEnemy.y >= canvasHeight - tmpEnemy.halfHeight ) {
      tmpEnemy.y = canvasHeight - tmpEnemy.halfHeight;
      tmpEnemy.rotation += 40;
    }
    if (tmpEnemy.x >= canvasWidth - tmpEnemy.halfWidth ) {
      tmpEnemy.x = canvasWidth - tmpEnemy.halfWidth;
      tmpEnemy.rotation += 40;
    }
    if (tmpEnemy.y <= 0 + tmpEnemy.halfHeight) {
      tmpEnemy.y = 0 + tmpEnemy.halfHeight;
      tmpEnemy.rotation += 40;
    }
    if (tmpEnemy.x <= 0 + tmpEnemy.halfWidth) {
      tmpEnemy.x = 0 + tmpEnemy.halfWidth;
      tmpEnemy.rotation += 40;
    }
    
    var dx = ship.x - tmpEnemy.x;
    var dy = ship.y - tmpEnemy.y;
    var distance = Math.sqrt((dx*dx)+(dy*dy));
    if(distance <= (ship.width * 4) && ship.shield == true){
    	tmpEnemy.x -= tmpEnemy.halfWidth;
    	tmpEnemy.y -= tmpEnemy.halfHeight;
    	tmpEnemy.speed = 0.5;
    	shoot(tmpEnemy);
    	tmpEnemy.flying = false;
    }else
    if(distance < ship.width+tmpEnemy.halfWidth){
    	//playGame = false;
    	tmpEnemy.x += 0;
    	tmpEnemy.y += 0;
    	tmpEnemy.speed = 0;
    	shoot(tmpEnemy);
    	tmpEnemy.flying = false;
    	//playGame = false;
    	if(ship.superSpeed && ship.speed == ship.maxSpeed) destroy(tmpEnemy);
    	
    }else{
    	if(tmpEnemy.speed < tmpEnemy.maxSpeed){ 
    		tmpEnemy.speed += 0.5;
    	}
    	// set distance to 0 for now, so constantly tracking
        if(distance > 0){	
	    	tmpEnemy.rotation = Math.atan2(
	    	randomFromTo(ship.y-tmpEnemy.reactionTime, (ship.y-tmpEnemy.reactionTime) + tmpEnemy.accuracy) - tmpEnemy.y, 
	    	randomFromTo(ship.x-tmpEnemy.reactionTime, (ship.x-tmpEnemy.reactionTime) + tmpEnemy.accuracy) - tmpEnemy.x
	    	) * 180 / Math.PI;
	    	
	    	tmpEnemy.flying = true;
	    	tmpEnemy.vy = Math.sin(tmpEnemy.rotation*Math.PI/180) * tmpEnemy.speed;
	    	tmpEnemy.vx = Math.cos(tmpEnemy.rotation*Math.PI/180) * tmpEnemy.speed;
	    	
	    	if(distance < 200){
	    		shoot(tmpEnemy);
	    	}else{
	    		regen(tmpEnemy);
	    	}
    	}
    	tmpEnemy.x += tmpEnemy.vx;
    	tmpEnemy.y += tmpEnemy.vy;
    }

 }
 function animateBullet(bullet, i){
 	bullet.vy = Math.sin(bullet.rotation*Math.PI/180) * bullet.speed;
 	bullet.vx = Math.cos(bullet.rotation*Math.PI/180) * bullet.speed;
 	
 	bullet.x += bullet.vx;
 	bullet.y += bullet.vy;
 	
 	if(bullet.lifetime > 0) bullet.lifetime = bullet.lifetime - 10;
 	
 	if(bullet.lifetime <= 0){
 		bullets.removeByValue(bullet);
 	}
 	if(bullet.owner == ship){
	 	for(i=0;i<enemies.length;i++){
	 		var tmpEnemy = enemies[i];
	 		
	 		var dx = tmpEnemy.x - bullet.x;
	 		var dy = tmpEnemy.y - bullet.y;
	 		var distance = Math.sqrt((dx*dx)+(dy*dy));
	 		//console.log(distance);
	 		if(distance < tmpEnemy.width){
	 			//playGame = false;
	 			bullets.removeByValue(bullet);
	 			destroy(tmpEnemy);
	 			//console.log("destroyed");
	 			//playGame = false;
	 			
	 		}
	 		
	 	}
	 }else{
	 	var dx = ship.x - bullet.x;
	 	var dy = ship.y - bullet.y;
	 	var distance = Math.sqrt((dx*dx)+(dy*dy));
	 	//console.log(distance);
	 	if(distance <= (ship.width * 4) && ship.shield == true){
	 		bullets.removeByValue(bullet);
	 	}
	 	else if(distance < ship.halfWidth && ship.shield == false){
	 		bullets.removeByValue(bullet);
			if(!touchable){
	 			hitSound.currentTime = 0;
	 			hitSound.play();
			}
	 		destroy(ship);
	 	}
	 
	 
	 }
 	
 }
 function animatePowerup(powerup){
 	
 	if(powerup.lifetime > 0) powerup.lifetime = powerup.lifetime - 10;
 	
 	if(powerup.lifetime <= 0){
 		powerups.removeByValue(powerup);
 		numPowerups--;
 	}
 	 	var dx = ship.x - powerup.x;
 	 	var dy = ship.y - powerup.y;
 	 	var distance = Math.sqrt((dx*dx)+(dy*dy));
 	 	if(distance < ship.width){
 	 		powerups.removeByValue(powerup);
 	 		numPowerups--;
			if(!touchable){
 	 			powerupSound.currentTime = 0;
 	 			powerupSound.play();
			}
 	 		usePowerup(ship, powerup.type);
 	 	}
 	
 }
 function usePowerup(player, type){
 	switch (type) {
 		case 1: 
 				player.powerup = true;
 				player.shield = true;
 				break;
 		case 2:
 				player.health = 100;
 				break;
 		case 3:
 				player.powerup = true;
 				player.superFire = true;
 				player.chargeRate = player.chargeRate*2;
 				break;
 		case 4:
 				player.powerup = true;
 				player.superSpeed = true;
 				player.maxSpeed = player.maxSpeed*2;
 				break;
 		
 	}
}
 
 
 
 function regen(player){
 	if(player.energy < 360){
 		player.energy = player.energy + player.energyRate;
 	}
 	if(player.charge < 200){
 		player.charge = player.charge + player.chargeRate;
 	}
 	//Charge Powerup
 }
 function shoot(player){
 	if(player.energy > 0 && player.charge == 200){
 		player.energy = player.energy - 18;
 		bullets.push(new Bullet(player));
		if(!touchable){
 			shootSound.currentTime = 0;
 			shootSound.play();
		}
 		player.charge = 0;
 	}else if(player.charge < 200){
 		player.charge = player.charge + player.chargeRate;
 	} 	
 }
 function destroy(player){
 	player.health = player.health - 10;
 	//console.log(player.health);
 	if(player.health == 0 && player != ship){
		if(!touchable){
 			destroySound.currentTime = 0;
 			destroySound.play();
		}
 		enemies.removeByValue(player);
 		score++;
 		scoreOut.innerHTML = "Score: "+score;
 	}else if(player.health == 0 && player == ship){
 		resetPlayer(player);
		if(!touchable){
 			destroySound.currentTime = 0;
 			destroySound.play();
		}
 		score--;
 		scoreOut.innerHTML = "Score: "+score;
 	}
 }
 function onKeyDown(evt) {
   if (evt.keyCode == 39) rightKey = true;
   else if (evt.keyCode == 37) leftKey = true;
   if (evt.keyCode == 38) upKey = true;
   else if (evt.keyCode == 40) downKey = true;
   if(evt.keyCode == 32) space = true;
 }
 
 function onKeyUp(evt) {
   if (evt.keyCode == 39) rightKey = false;
   else if (evt.keyCode == 37) leftKey = false;
   if (evt.keyCode == 38) upKey = false;
   else if (evt.keyCode == 40) downKey = false;
   if(evt.keyCode == 32) space = false;
 }

 function onTouchStart(e) {
 	 e.preventDefault();
 	 touches = e.touches;
   upKey = true;
 }
 function onTouchMove(e) {
     e.preventDefault();
     touches = e.touches;
 }
 function onTouchEnd(e) {
 		touches = e.touches;
		upKey = false;
 }
 
 function randomFromTo(from, to){
        return Math.floor(Math.random() * (to - from + 1) + from);
 }
 
 $(document).ready(function() {

   if(touchable) {
   	document.body.addEventListener( 'touchstart', onTouchStart, false );
   	document.body.addEventListener( 'touchmove', onTouchMove, false );
   	document.body.addEventListener( 'touchend', onTouchEnd, false );
   	window.onorientationchange = innit;  
   	window.onresize = innit;
   document.body.addEventListener("touchcancel", onTouchEnd, false);
   }else{
   	$(document).keydown(onKeyDown);
   	$(document).keyup(onKeyUp);
   
   }
 });
 
 $(window).resize(innit);
 
 setInterval(function() {
 	if(playGame){
 		innit();
 	}
 } , 1000 / refreshRate);
 var fpsOut = document.getElementById('fps');
 setInterval(function(){
   fpsOut.innerHTML = fps.toFixed(1) + "fps";
 }, 1000);

 
 
});



