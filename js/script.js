// Author: Matthew Harrison-Jones

$(document).ready(function () {

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel

    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }());

    /* FPS monitoring
     *
     * The higher the 'fpsFilter' value, the less the FPS will be affected by quick changes
     * Setting this to 1 will show you the FPS of the last sampled frame only
     */

    // stats.js r9 - http://github.com/mrdoob/stats.js
    var Stats=function(){var h,a,r=0,s=0,i=Date.now(),u=i,t=i,l=0,n=1E3,o=0,e,j,f,b=[[16,16,48],[0,255,255]],m=0,p=1E3,q=0,d,k,g,c=[[16,48,16],[0,255,0]];h=document.createElement("div");h.style.cursor="pointer";h.style.width="80px";h.style.opacity="0.9";h.style.zIndex="10001";h.addEventListener("mousedown",function(a){a.preventDefault();r=(r+1)%2;0==r?(e.style.display="block",d.style.display="none"):(e.style.display="none",d.style.display="block")},!1);e=document.createElement("div");e.style.textAlign=
        "left";e.style.lineHeight="1.2em";e.style.backgroundColor="rgb("+Math.floor(b[0][0]/2)+","+Math.floor(b[0][1]/2)+","+Math.floor(b[0][2]/2)+")";e.style.padding="0 0 3px 3px";h.appendChild(e);j=document.createElement("div");j.style.fontFamily="Helvetica, Arial, sans-serif";j.style.fontSize="9px";j.style.color="rgb("+b[1][0]+","+b[1][1]+","+b[1][2]+")";j.style.fontWeight="bold";j.innerHTML="FPS";e.appendChild(j);f=document.createElement("div");f.style.position="relative";f.style.width="74px";f.style.height=
        "30px";f.style.backgroundColor="rgb("+b[1][0]+","+b[1][1]+","+b[1][2]+")";for(e.appendChild(f);74>f.children.length;)a=document.createElement("span"),a.style.width="1px",a.style.height="30px",a.style.cssFloat="left",a.style.backgroundColor="rgb("+b[0][0]+","+b[0][1]+","+b[0][2]+")",f.appendChild(a);d=document.createElement("div");d.style.textAlign="left";d.style.lineHeight="1.2em";d.style.backgroundColor="rgb("+Math.floor(c[0][0]/2)+","+Math.floor(c[0][1]/2)+","+Math.floor(c[0][2]/2)+")";d.style.padding=
        "0 0 3px 3px";d.style.display="none";h.appendChild(d);k=document.createElement("div");k.style.fontFamily="Helvetica, Arial, sans-serif";k.style.fontSize="9px";k.style.color="rgb("+c[1][0]+","+c[1][1]+","+c[1][2]+")";k.style.fontWeight="bold";k.innerHTML="MS";d.appendChild(k);g=document.createElement("div");g.style.position="relative";g.style.width="74px";g.style.height="30px";g.style.backgroundColor="rgb("+c[1][0]+","+c[1][1]+","+c[1][2]+")";for(d.appendChild(g);74>g.children.length;)a=document.createElement("span"),
        a.style.width="1px",a.style.height=30*Math.random()+"px",a.style.cssFloat="left",a.style.backgroundColor="rgb("+c[0][0]+","+c[0][1]+","+c[0][2]+")",g.appendChild(a);return{getDomElement:function(){return h},getFps:function(){return l},getFpsMin:function(){return n},getFpsMax:function(){return o},getMs:function(){return m},getMsMin:function(){return p},getMsMax:function(){return q},update:function(){i=Date.now();m=i-u;p=Math.min(p,m);q=Math.max(q,m);k.textContent=m+" MS ("+p+"-"+q+")";var a=Math.min(30,
        30-30*(m/200));g.appendChild(g.firstChild).style.height=a+"px";u=i;s++;if(i>t+1E3)l=Math.round(1E3*s/(i-t)),n=Math.min(n,l),o=Math.max(o,l),j.textContent=l+" FPS ("+n+"-"+o+")",a=Math.min(30,30-30*(l/100)),f.appendChild(f.firstChild).style.height=a+"px",t=i,s=0}}};

    var stats = new Stats();

    // Align top-left
    stats.getDomElement().style.position = 'absolute';
    stats.getDomElement().style.left = '0px';
    stats.getDomElement().style.top = '0px';

    document.body.appendChild(stats.getDomElement());

    setInterval(function () {

        stats.update();

    }, 1000 / 60);


    // Canvas Settings
    var canvas = $("#myCanvas");
    var footerHeight = $("footer").height();
    var context = canvas.get(0).getContext("2d");
    var canvasWidth = $(window).get(0).innerWidth;
    var canvasHeight = $(window).get(0).innerHeight - footerHeight;

    window.scrollTo(0, 0);

    // Game settings
    var playGame = true, muted = false;
    var score = 0, highScore = 0, scoreOut = $("#score"), highScoreOut = $("#highScore");
    var stars, numStars;
    var enemies, numEnemies;
    var powerups, numPowerups;

    // Initialise controls
    var touchable = 'ontouchstart' in window || 'createTouch' in document;
    //if(touchable) refreshRate = 35;
    if (touchable) muted = true;
    var touches = [], rightKey = false, leftKey = false, upKey = false, downKey = false, space = false;

    // Initialise Sounds
    var shootSound = $("#shootSound").get(0), destroySound = $("#destroySound").get(0), powerupSound = $("#powerupSound").get(0), hitSound = $("#hitSound").get(0);
    //var thrustersSound = $("#thrustersSound").get(0);

    // Initilise objects
    var Star, Bullet, Powerup, Ship, ShipEnemy, Collision, Particle;

    Star = function (x, y) {
        this.settings = {
            x:x,
            y:y,
            brightness:Math.floor(Math.random() * 4),
            radius:Math.floor(Math.random() * 4)
        };
        this.draw = function () {
            var brightness = 'rgba(255,255,255, 0.' + this.settings.brightness + ')';
            context.fillStyle = brightness;
            context.beginPath();
            context.arc(this.settings.x, this.settings.y, this.settings.radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        };
    };

    Bullet = function (owner) {
        this.settings = {
            x:owner.x,
            y:owner.y,
            rotation:owner.rotation,
            vx:0,
            vy:0,
            speed:10,
            size:3,
            lifetime:800,
            owner:owner
        };
        this.draw = function () {
            context.translate(this.settings.x, this.settings.y);
            context.rotate((this.settings.rotation) * Math.PI / 180);
            context.translate(-this.settings.x, -this.settings.y);
            context.fillStyle = '#FFF';
            context.beginPath();
            context.fillRect(this.settings.x, this.settings.y, this.settings.size * 4, this.settings.size);
            context.closePath();
            context.fill();
        };
    };

    Powerup = function (x, y) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.lifetime = 8000;
        this.type = randomFromTo(1, 5);
        this.draw = function(){
            var colour;
            switch (this.type) {
                case 1:
                    colour = "255, 255, 102";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Shield", this.x + (this.size * 1.5), this.y + (this.size / 2));
                    break;
                case 2:
                    colour = "102, 255, 102";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Health", this.x + (this.size * 1.5), this.y + (this.size / 2));
                    break;
                case 3:
                    colour = "102, 255, 255";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Increase Fire Rate", this.x + (this.size * 1.5), this.y + (this.size / 2));
                    break;
                case 4:
                    colour = "255, 102, 255";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Speed", this.x + (this.size), this.y + (this.size / 2));
                    break;
                case 5:
                    colour = "255,255,255";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Laser", this.x + (this.size), this.y + (this.size / 2));


            }
            var grd = context.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.size * (Math.random() + 4));
            grd.addColorStop(0, "rgba(255, 255, 255, 0)"); // light blue
            grd.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // light blue
            grd.addColorStop(1, "rgba(" + colour + ", 0.4)"); // dark blue
            context.fillStyle = grd;
            context.beginPath();
            context.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
            context.fillStyle = "rgb(" + colour + ")";
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        };
    };

    Ship = function (x, y) {
        this.settings = {
        x : x,
        y : y,
        width : 20,
        height : 20,
        halfWidth : this.width / 2,
        halfHeight : this.height / 2,
        vx : 0,
        vy : 0,
        speed : 0,
        maxSpeed : 4,
        energy : 360,
        energyRate : 18,
        charge : 0,
        chargeRate : 10,
        health : 100,
        elasticity : 1,
        rotation : 0,
        rotationSpeed : 2,
        flying : false,
        resetPowerupTime: 2000
        };
        this.defualtSettings = {
            defaultMaxSpeed: 4,
            defaultChargeRate: 10
        };
        this.shield = {active:false, powerupTime:2000, element:$(".shield")};
        this.superSpeed = {active:false, powerupTime:2000, element:$(".speed")};
        this.superFire = {active:false, powerupTime:2000, element:$(".fire")};
        this.laser = {active:false, powerupTime:2000, element:$(".laser")};
        this.level = 1;
        this.draw = function(){
            context.translate(this.settings.x, this.settings.y);
            context.rotate(this.settings.rotation * Math.PI / 180);
            context.translate(-this.settings.x, -this.settings.y);

            if (this.settings.flying) {
                context.fillStyle = "#f98224";
                context.beginPath();
                context.moveTo(this.settings.x - randomFromTo(this.settings.halfWidth, this.settings.width), this.settings.y); // give the (x,y) coordinates
                context.lineTo(this.settings.x - (this.settings.halfWidth - 1), this.settings.y + (this.settings.halfHeight / 2));
                context.lineTo(this.settings.x - (this.settings.halfWidth - 1), this.settings.y - (this.settings.halfHeight / 2));
                context.closePath();
                context.fill();
            }
            if (this.laser.active) {
                var laserGradient = context.createLinearGradient(this.settings.settings.x + (this.settings.halfWidth), this.settings.y, this.settings.x + (this.settings.halfWidth - 1) + 400, this.settings.y + 2);
                laserGradient.addColorStop(1, 'rgba(255, 136, 136, 0)');
                laserGradient.addColorStop(0, 'rgba(255, 136, 136, 0.5)');
                context.fillStyle = laserGradient;
                context.fillRect(this.settings.x + (this.settings.halfWidth - 1), this.settings.y, 400, 2);
                context.fill();
            }
            context.fillStyle = "#fff";
            context.beginPath();
            context.moveTo(this.settings.x + this.settings.halfWidth, this.settings.y); // give the (x,y) coordinates
            context.lineTo(this.settings.x - this.settings.halfWidth, this.settings.y - this.settings.halfHeight);
            context.lineTo(this.settings.x - this.settings.halfWidth, this.settings.y + this.settings.halfHeight);
            context.closePath();
            context.fill();

            //energy
            context.lineWidth = 10;
            context.strokeStyle = "rgba(102, 204, 255, 0.4)"; // stroke color
            context.beginPath();
            context.arc(this.settings.x, this.settings.y, 40, 0, this.settings.energy * Math.PI / 180, false);
            context.stroke();

            //health
            context.lineWidth = 10;
            if (this.settings.health > 50) context.strokeStyle = "rgba(102, 204, 119, 0.4)"; // stroke color
            else if (this.settings.health <= 50 && this.settings.health > 25) context.strokeStyle = "rgba(252, 204, 119, 0.4)"; // stroke color
            else if (this.settings.health < 25) context.strokeStyle = "rgba(252, 71, 119, 0.4)"; // stroke color
            context.beginPath();
            context.arc(this.settings.x, this.settings.y, 30, 0, (this.settings.health * 3.6) * Math.PI / 180, false);
            context.stroke();

            if (this.shield.powerupTime > 0 && this.shield.active) this.shield.powerupTime--;
            else if (this.shield.powerupTime <= 0) resetPowerup(this, 1);

            if (this.superSpeed.powerupTime > 0 && this.superSpeed.active) this.superSpeed.powerupTime--;
            else if (this.superSpeed.powerupTime <= 0) resetPowerup(this, 4);

            if (this.superFire.powerupTime > 0 && this.superFire.active) this.superFire.powerupTime--;
            else if (this.superFire.powerupTime <= 0) resetPowerup(this, 3);

            if (this.laser.powerupTime > 0 && this.laser.active) this.laser.powerupTime--;
            else if (this.laser.powerupTime <= 0) resetPowerup(this, 5);
            //else resetPowerups(this);

            if (this.shield.active) {
                var grd = context.createRadialGradient(this.settings.x, this.settings.y, 1, this.settings.x, this.settings.y, this.settings.width * (Math.random() + 4));
                grd.addColorStop(0, "rgba(255, 255, 255, 0)"); // light blue
                grd.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // light blue
                grd.addColorStop(1, "rgba(255,255,255, 0.4)"); // dark blue
                context.fillStyle = grd;
                context.beginPath();
                context.arc(this.settings.x, this.settings.y, this.settings.width * 4, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();
            }

        };
        this.reset = function(){
            this.settings.x = 150;
            this.settings.y = canvas.height() / 2;
            this.settings.vx = 0;
            this.settings.vy = 0;
            this.settings.health = 100;
            resetPowerups(this);
        }
    };

    ShipEnemy = function (x, y) {
        this.settings = {
        x : x,
        y : y,
        width : 20,
        height : 20,
        halfWidth : this.width / 2,
        halfHeight : this.height / 2,
        vx : 0,
        vy : 0,
        speed : 0,
        defaultMaxSpeed : 2,
        maxSpeed : 2,
        energy : 360,
        energyRate : 18,
        charge : 0,
        chargeRate : 10,
        defaultChargeRate : 10,
        health : 10,
        reactionTime : 20,
        accuracy : 20,
        elasticity : 1,
        rotation : 0,
        rotationSpeed : 4,
        flying : false
        };
        this.draw = function(){
            context.translate(this.settings.x, this.settings.y);
            context.rotate(this.settings.rotation * Math.PI / 180);
            context.translate(-this.settings.x, -this.settings.y);

            // Draw ship
            if (this.settings.flying) {
                context.fillStyle = "#f98224";
                context.beginPath();
                context.moveTo(this.settings.x - randomFromTo(this.settings.halfWidth, this.settings.width), this.y); // give the (x,y) coordinates
                context.lineTo(this.x - (this.halfWidth - 1), this.y + (this.halfHeight / 2));
                context.lineTo(this.x - (this.halfWidth - 1), this.y - (this.halfHeight / 2));
                context.closePath();
                context.fill();
            }
            context.fillStyle = "rgb(166, 182, 194)";
            context.beginPath();
            context.moveTo(this.x + this.halfWidth, this.y); // give the (x,y) coordinates
            context.lineTo(this.x - this.halfWidth, this.y - this.halfHeight);
            context.lineTo(this.x - this.halfWidth, this.y + this.halfHeight);
            context.closePath();
            context.fill();
            context.lineWidth = 10;
            context.strokeStyle = "rgba(102, 204, 255, 0.4)"; // stroke color
            context.beginPath();
            context.arc(this.x, this.y, 40, 0, this.energy * Math.PI / 180, false);
            context.stroke();

            context.translate(this.x + (this.halfWidth / 2), this.y + (this.halfHeight / 2));
            context.rotate(90 * Math.PI / 180);
            context.translate(-this.x + (this.halfWidth / 2), -this.y + (this.halfHeight / 2));
            context.font = "20px 800 Arial";
            context.fillText("Enemy", this.x + (this.halfWidth / 2), this.y + (this.halfHeight / 2));
        };
    };

    Collision = function(x,y, direction){
        this.x = x;
        this.y = y;
        this.particleCount = 10;
        this.lifetime = 200;
        this.direction = direction;

    };

    Particle = function (owner) {
        this.x = owner.x;
        this.y = owner.y;
        this.rotation = Math.floor(randomFromTo(owner.direction-20, owner.direction+20));
        this.vx = 0;
        this.vy = 0;
        this.speed = Math.floor(randomFromTo(5, 10));
        this.size = Math.floor(randomFromTo(2, 4));
        this.lifetime = owner.lifetime;
        this.owner = owner;
        this.draw = function(){
            context.translate(this.x, this.y);
            context.rotate((this.rotation) * Math.PI / 180);
            context.translate(-this.x, -this.y);
            context.fillStyle = '#FFF';
            context.beginPath();
            context.fillRect(this.x, this.y, this.size , this.size);
            context.closePath();
            context.fill();
        };
    };

    stars = new Array();
    numStars = 40;

    for (var i = 0; i < numStars; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        stars.push(new Star(x, y))
    }
    while (stars.length < numStars) {
        var x = canvasWidth + 20 + Math.floor(Math.random() * canvasWidth);
        var y;
        y = Math.floor(Math.random() * canvasHeight);
        stars.push(new Star(x, y));
    }

    enemies = new Array();
    numEnemies = 10;

    for (var i = 0; i < numEnemies; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        enemies.push(new ShipEnemy(x, y));
    }

    ship = new Ship(150, canvas.height() / 2);
    updateHighScore();

    bullets = new Array();
    numBullets = 0;

    powerups = new Array();
    numPowerups = 1;
    var maxNumPowerups = 2, powerupCharge = 200, powerupChargeRate = 1, powerupChargeMax = 1000;

    for (var i = 0; i < numPowerups; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        powerups.push(new Powerup(x, y));
    }

    var collisions = new Array();
    var particles = new Array();

    function draw() {

        var canvasWidth = $(window).get(0).innerWidth;
        var canvasHeight = $(window).get(0).innerHeight - footerHeight;

        canvas.attr("width", canvasWidth);
        canvas.attr("height", canvasHeight);

        if (enemies.length < numEnemies) {
            var x = Math.floor(Math.random() * canvasWidth);
            var y = Math.floor(Math.random() * canvasHeight);
            enemies.push(new ShipEnemy(x, y));
        }

        if (powerupCharge == powerupChargeMax) {

            if (numPowerups < maxNumPowerups) {
                numPowerups++;
                powerupCharge = 0;
            }
        }

        if (powerups.length < numPowerups) {
            var x = Math.floor(Math.random() * canvasWidth);
            var y = Math.floor(Math.random() * canvasHeight);
            powerups.push(new Powerup(x, y));

        }
        if (powerupCharge < powerupChargeMax && numPowerups != maxNumPowerups) powerupCharge += powerupChargeRate;

        context.save();
        context.clearRect(0, 0, canvas.width(), canvas.height());
        context.restore();

        if (touchable) {
            if (touches.length > 0) {
                var touch = touches[0];
                if (touch.clientY != ship.settings.y && touch.clientX != ship.settings.x) {
                    ship.settings.rotation = Math.atan2(
                        touch.clientY - ship.settings.y,
                        touch.clientX - ship.settings.x
                    ) * 180 / Math.PI;
                }
                if (touches.length >= 2) {
                    shoot(ship);
                } else {
                    regen(ship);
                }

            }
        }
        if (rightKey) {
            ship.settings.rotation += ship.settings.rotationSpeed;
        }
        if (leftKey) {
            ship.settings.rotation -= ship.settings.rotationSpeed;
        }
        if (upKey) {
            if (ship.settings.speed < ship.settings.maxSpeed) {
                ship.settings.speed += 0.5;
                if (!muted) {
                    // Need better thrusters sound.
                    //thrustersSound.currentTime = 0;
                    //thrustersSound.play();
                }
            }
            ship.settings.vy = Math.sin(ship.settings.rotation * Math.PI / 180) * ship.settings.speed;
            ship.settings.vx = Math.cos(ship.settings.rotation * Math.PI / 180) * ship.settings.speed;
            ship.settings.flying = true;
        } else {
            ship.settings.vy = 0;
            ship.settings.vx = 0;
            ship.settings.speed = 1;
        }
        if (space) {
            shoot(ship);
        } else {
            regen(ship);
        }

        ship.settings.x += ship.settings.vx;
        ship.settings.y += ship.settings.vy;

        if (!muted) {
            if (ship.settings.rotation > 360) ship.settings.rotation = 0;
            if (ship.settings.rotation < 0) ship.settings.rotation = 360;
        }
        if (ship.settings.y >= canvasHeight - ship.settings.halfHeight) {
            ship.settings.y = canvasHeight - ship.settings.halfHeight;
            ship.settings.vy = -Math.abs(ship.settings.vy);
            ship.settings.vy *= ship.settings.elasticity;
        }
        if (ship.settings.x >= canvasWidth - ship.settings.halfWidth) {
            ship.settings.x = canvasWidth - ship.settings.halfWidth;
            ship.settings.vx = -Math.abs(ship.settings.vx);
            ship.settings.vx *= ship.settings.elasticity;
        }
        if (ship.settings.y <= 0 + ship.settings.halfHeight) {
            ship.settings.y = 0 + ship.settings.halfHeight;
            ship.settings.vy = +Math.abs(ship.settings.vy);
            ship.settings.vy *= ship.settings.elasticity;
        }
        if (ship.settings.x <= 0 + ship.settings.halfWidth) {
            ship.settings.x = 0 + ship.settings.halfWidth;
            ship.settings.vx = +Math.abs(ship.settings.vx);
            ship.settings.vx *= ship.settings.elasticity;
        }

        // Draw ship
        context.save();
        ship.draw();
        context.restore();

        var enemyLength = enemies.length;
        for (var i = 0; i < enemyLength; i++) {
            var tmpEnemy = enemies[i];
            if(tmpEnemy) {
                context.save();
                tmpEnemy.draw();
                context.restore();
                animateEnemy(tmpEnemy);
            }
        }
        
        var starsLength = stars.length;
        context.save();
        for (var i = 0; i < starsLength; i++) {
            var tmpStar = stars[i];
            tmpStar.draw();
        }
        context.restore();


        var powerupsLength = powerups.length;
        context.save();
        for (var i = 0; i < powerupsLength; i++) {
            var tmpPowerup = powerups[i];
            //context.translate(tmpStar.x, tmpStar.y);
            tmpPowerup.draw();
            animatePowerup(tmpPowerup);
        }
        context.restore();

        var bulletsLength = bullets.length;
        for (var i = 0; i < bulletsLength; i++) {
            var tmpBullet = bullets[i];
            try {
                if (tmpBullet) {
                    context.save();
                    tmpBullet.draw();
                    context.restore();
                    animateBullet(tmpBullet, i);
                }
            } catch (error) {
                console.log(error);
            }
        }

        var collisionLegnth = collisions.length;
        for (var i = 0; i < collisionLegnth; i++) {
            var tmpCollision = collisions[i];
            if (tmpCollision) {
                if(particles.length < tmpCollision.particleCount) particles.push(new Particle(tmpCollision));
                for(var i = 0; i < particles.length; i++){
                    var tmpParticle = particles[i];
                    context.save();
                    tmpParticle.draw();
                    context.restore();
                    animateParticle(tmpParticle, i);
                }
            }
            animateCollision(tmpCollision);
        }

        ship.settings.flying = false;
    }

    function resetPowerups(player) {
        player.shield.active = false;
        player.shield.powerupTime = ship.settings.resetPowerupTime;
        player.shield.element.removeClass('active');
        player.superSpeed.active = false;
        player.superSpeed.powerupTime = ship.settings.resetPowerupTime;
        player.superSpeed.element.removeClass('active');
        player.superFire.active = false;
        player.superFire.powerupTime = ship.settings.resetPowerupTime;
        player.superFire.element.removeClass('active');
        player.chargeRate = player.defualtSettings.defaultChargeRate;
        player.maxSpeed = player.defualtSettings.defaultMaxSpeed;
        player.laser.active = false;
        player.laser.powerupTime = ship.settings.resetPowerupTime;
        player.laser.element.removeClass('active');
    }

    function resetPowerup(player, powerup) {
        switch (powerup) {
            case 1:
                player.shield.active = false;
                player.shield.powerupTime = ship.settings.resetPowerupTime;
                player.shield.element.removeClass('active');
                break;
            case 2:
                //player.health = 100;
                break;
            case 3:
                player.superFire.active = false;
                player.superFire.powerupTime = ship.settings.resetPowerupTime;
                player.chargeRate = player.defualtSettings.defaultChargeRate;
                player.superFire.element.removeClass('active');
                break;
            case 4:
                player.superSpeed.active = false;
                player.superSpeed.powerupTime = ship.settings.resetPowerupTime;
                player.maxSpeed = player.defualtSettings.defaultMaxSpeed;
                player.superSpeed.element.removeClass('active');
                break;
            case 5:
                player.laser.active = false;
                player.laser.powerupTime = ship.settings.resetPowerupTime;
                player.laser.element.removeClass('active');
                break;

        }
    }

    function animateEnemy(tmpEnemy) {

        //tmpEnemy.settings.rotation += (Math.random()*1)/ 2;

        if (tmpEnemy.settings.y >= canvasHeight - tmpEnemy.settings.halfHeight) {
            tmpEnemy.settings.y = canvasHeight - tmpEnemy.settings.halfHeight;
            tmpEnemy.settings.rotation += 40;
        }
        if (tmpEnemy.settings.x >= canvasWidth - tmpEnemy.settings.halfWidth) {
            tmpEnemy.settings.x = canvasWidth - tmpEnemy.settings.halfWidth;
            tmpEnemy.settings.rotation += 40;
        }
        if (tmpEnemy.settings.y <= 0 + tmpEnemy.settings.halfHeight) {
            tmpEnemy.settings.y = 0 + tmpEnemy.settings.halfHeight;
            tmpEnemy.settings.rotation += 40;
        }
        if (tmpEnemy.settings.x <= 0 + tmpEnemy.settings.halfWidth) {
            tmpEnemy.settings.x = 0 + tmpEnemy.settings.halfWidth;
            tmpEnemy.settings.rotation += 40;
        }

        var dx = ship.settings.x - tmpEnemy.settings.x;
        var dy = ship.settings.y - tmpEnemy.settings.y;
        var distance = Math.sqrt((dx * dx) + (dy * dy));

        if (numEnemies > 1) {
            for (i = 0; i < enemies.length; i++) {
                var dxTwo, dyTwo, distanceTwo;
                var tmpEnemyTwo = enemies[i];
                if (tmpEnemyTwo != tmpEnemy) {
                    dxTwo = tmpEnemy.settings.x - tmpEnemy.settings.x;
                    dyTwo = tmpEnemy.settings.y - tmpEnemy.settings.y;
                    distanceTwo = Math.sqrt((dxTwo * dxTwo) + (dyTwo * dyTwo));
                    var randomOption = Math.floor(Math.random() * 10);
                    if (distanceTwo < tmpEnemy.settings.width) {
                        tmpEnemy.settings.x -= randomOption;
                        tmpEnemy.settings.y -= randomOption;
                    }
                }
            }
        }
        if (distance <= (ship.settings.width * 4) && ship.shield.active) {
            tmpEnemy.settings.x -= tmpEnemy.settings.halfWidth;
            tmpEnemy.settings.y -= tmpEnemy.settings.halfHeight;
            tmpEnemy.settings.speed = 0.5;
            if(tmpEnemy.settings.energy > 0){
                shoot(tmpEnemy);
            }
            else {
                regen(tmpEnemy);
            }

            tmpEnemy.settings.flying = false;
        } else
        if (distance < ship.settings.width + tmpEnemy.settings.halfWidth) {
            //playGame = false;
            tmpEnemy.settings.x += 0;
            tmpEnemy.settings.y += 0;
            tmpEnemy.settings.speed = 0;

            if(tmpEnemy.settings.energy > 0){
                shoot(tmpEnemy);
            }
            else {
                regen(tmpEnemy);
            }

            tmpEnemy.settings.flying = false;
            if (ship.superSpeed.active && ship.settings.speed == ship.settings.maxSpeed) destroy(tmpEnemy, ship);

        } else {
            if (tmpEnemy.settings.speed < tmpEnemy.settings.maxSpeed) {
                tmpEnemy.settings.speed += 0.5;
            }
            // set distance to 0 for now, so constantly tracking
            if (distance > 0) {
                tmpEnemy.settings.rotation = Math.atan2(
                    randomFromTo(ship.settings.y - tmpEnemy.settings.reactionTime, (ship.settings.y - tmpEnemy.settings.reactionTime) + tmpEnemy.settings.accuracy) - tmpEnemy.settings.y,
                    randomFromTo(ship.settings.x - tmpEnemy.settings.reactionTime, (ship.settings.x - tmpEnemy.settings.reactionTime) + tmpEnemy.settings.accuracy) - tmpEnemy.settings.x
                ) * 180 / Math.PI;

                tmpEnemy.settings.flying = true;
                tmpEnemy.settings.vy = Math.sin(tmpEnemy.settings.rotation * Math.PI / 180) * tmpEnemy.settings.speed;
                tmpEnemy.settings.vx = Math.cos(tmpEnemy.settings.rotation * Math.PI / 180) * tmpEnemy.settings.speed;

                if (distance < 200) {
                    shoot(tmpEnemy);
                } else {
                    regen(tmpEnemy);
                }
            }
            tmpEnemy.settings.x += tmpEnemy.settings.vx;
            tmpEnemy.settings.y += tmpEnemy.settings.vy;
        }
        if (numEnemies < enemies.length) removeEnemy(tmpEnemy);

    }

    function animateBullet(bullet, i) {

        if (bullet.settings.lifetime <= 0) {
            bullets.removeByValue(bullet);
        }
        else if (bullet.settings.lifetime > 0) bullet.settings.lifetime = bullet.settings.lifetime - 10;

        if (bullet.settings.y >= canvasHeight - bullet.settings.size) {
            bullets.removeByValue(bullet);
        }
        if (bullet.settings.x >= canvasWidth - bullet.settings.size) {
            bullets.removeByValue(bullet);
        }
        if (bullet.settings.y <= 0 + bullet.settings.size) {
            bullets.removeByValue(bullet);
        }
        if (bullet.settings.x <= 0 + bullet.settings.size) {
            bullets.removeByValue(bullet);
        }

        bullet.settings.vy = Math.sin(bullet.settings.rotation * Math.PI / 180) * bullet.settings.speed;
        bullet.settings.vx = Math.cos(bullet.settings.rotation * Math.PI / 180) * bullet.settings.speed;

        bullet.settings.x += bullet.settings.vx;
        bullet.settings.y += bullet.settings.vy;

        var dx, dy, distance;
        if (bullet.settings.owner == ship) {
            for (i = 0; i < enemies.length; i++) {
                var tmpEnemy = enemies[i];

                dx = tmpEnemy.settings.x - bullet.settings.x;
                dy = tmpEnemy.settings.y - bullet.settings.y;
                distance = Math.sqrt((dx * dx) + (dy * dy));
                //console.log(distance);
                if (distance < tmpEnemy.settings.width) {
                    //playGame = false;
                    destroy(tmpEnemy, bullet);
                    bullets.removeByValue(bullet);

                    //console.log("destroyed");
                    //playGame = false;

                }

            }
        } else {
            dx = ship.settings.x - bullet.settings.x;
            dy = ship.settings.y - bullet.settings.y;
            distance = Math.sqrt((dx * dx) + (dy * dy));
            //console.log(distance);
            if (distance <= (ship.settings.width * 4) && ship.shield.active) {
                bullets.removeByValue(bullet);
            }
            else if (distance < ship.settings.halfWidth && !ship.shield.active) {
                if (!muted) {
                    hitSound.currentTime = 0;
                    hitSound.play();
                }
                destroy(ship, bullet);
                bullets.removeByValue(bullet);
            }


        }

    }

    function animatePowerup(powerup) {

        if (powerup.lifetime > 0) powerup.lifetime = powerup.lifetime - 10;

        if (powerup.lifetime <= 0) {
            powerups.removeByValue(powerup);
            numPowerups--;
        }
        var dx = ship.settings.x - powerup.x;
        var dy = ship.settings.y - powerup.y;
        var distance = Math.sqrt((dx * dx) + (dy * dy));
        if (distance < ship.settings.width) {
            powerups.removeByValue(powerup);
            numPowerups--;
            if (!muted) {
                powerupSound.currentTime = 0;
                powerupSound.play();
            }
            usePowerup(ship, powerup.type);
        }

    }

    function usePowerup(player, type) {
        switch (type) {
            case 1:
                player.shield.active = true;
                player.shield.element.addClass('active');
                break;
            case 2:
                player.health = 100;
                break;
            case 3:
                player.superFire.active = true;
                player.chargeRate = player.defualtSettings.defaultChargeRate * 2;
                player.superFire.element.addClass('active');
                break;
            case 4:
                player.superSpeed.active = true;
                player.maxSpeed = player.defualtSettings.maxSpeed * 2;
                player.superSpeed.element.addClass('active');
                break;
            case 5:
                player.laser.active = true;
                player.laser.element.addClass('active');
                break;

        }
    }

    function animateParticle(particle) {

        if (particle.lifetime <= 0) {
            particles.removeByValue(particle);
        }
        else if (particle.lifetime > 0) particle.lifetime = particle.lifetime - 10;

        if (particle.y >= canvasHeight - particle.size) {
            particles.removeByValue(particle);
        }
        if (particle.x >= canvasWidth - particle.size) {
            particles.removeByValue(particle);
        }
        if (particle.y <= 0 + particle.size) {
            particles.removeByValue(particle);
        }
        if (particle.x <= 0 + particle.size) {
            particles.removeByValue(particle);
        }

        particle.vy = Math.sin(particle.rotation * Math.PI / 180) * particle.speed;
        particle.vx = Math.cos(particle.rotation * Math.PI / 180) * particle.speed;

        particle.x += particle.vx;
        particle.y += particle.vy;

    }
    function animateCollision(collision) {

        if (collision.lifetime <= 0) {
            collisions.removeByValue(collision);
        }
        else if (collision.lifetime > 0) collision.lifetime = collision.lifetime - 10;
        if(collision.particleCount > 0) collision.particleCount--;
    }


    function regen(player) {
        if (player.settings.energy < 360) {
            player.settings.energy = player.settings.energy + player.settings.energyRate;
        }
        if (player.settings.charge < 200) {
            player.settings.charge = player.settings.charge + player.settings.chargeRate;
        }
        //Charge Powerup
    }

    function shoot(player) {
        if (player.settings.energy > 0 && player.settings.charge == 200) {
            player.settings.energy = player.settings.energy - 18;
            bullets.push(new Bullet(player));
            if (!muted) {
                shootSound.currentTime = 0;
                shootSound.play();
            }
            player.settings.charge = 0;
        } else if (player.settings.charge < 200) {
            player.settings.charge = player.settings.charge + player.settings.chargeRate;
        }
    }

    function destroy(player, by) {
        player.settings.health = player.settings.health - 10;
        //console.log(player.health);
        if (player.settings.health == 0 && player != ship) {
            if (!muted) {
                destroySound.currentTime = 0;
                destroySound.play();
            }
            enemies.removeByValue(player);
            collisions.push(new Collision(player.settings.x, player.settings.y, by.settings.rotation));
            score++;
            scoreOut.text(score);
            levelUp();
        } else if (player.settings.health == 0 && player == ship) {
            ship.reset();
            if (!muted) {
                destroySound.currentTime = 0;
                destroySound.play();
            }
            collisions.push(new Collision(player.settings.x, player.settings.y, by.settings.rotation));
            //score--;
            endGame();
        }
    }

    function removeEnemy(enemy) {
        enemies.removeByValue(enemy);
    }

    function levelUp() {

        switch (score) {
            case 20:
                if (ship.level != 2) ship.level++;
                numEnemies++;
                break;
            case 30:
                if (ship.level != 3) ship.level++;
                numEnemies++;
                break;
            case 40:
                if (ship.level != 4) ship.level++;
                numEnemies++;
                break;
            case 50:
                if (ship.level != 5) ship.level++;
                numEnemies++;
                break;
            case 60:
                if (ship.level != 6) ship.level++;
                numEnemies++;
                break;
            case 70:
                if (ship.level != 7) ship.level++;
                numEnemies++;
                break;
            case 80:
                if (ship.level != 8) ship.level++;
                numEnemies++;
                break;
            case 90:
                if (ship.level != 9) ship.level++;
                numEnemies++;
                break;
            case 100:
                if (ship.level != 1) ship.level++;
                numEnemies++;
                break;
        }
    }

    function endGame() {
        saveHighScore();
        updateHighScore();
        numEnemies = 1;
        score = 0;
        scoreOut.text(score);
    }

    function saveHighScore() {
        if (Modernizr.localstorage) {
            if (score > highScore) {
                localStorage.setItem('highScore', score);
            }
        }
    }

    function updateHighScore() {
        if (Modernizr.localstorage && localStorage.getItem('highScore')) {
            highScoreOut.text("High Score: " + localStorage.getItem('highScore'));
            highScore = localStorage.getItem('highScore');
        } else {
            highScoreOut.text("High Score: 0");
        }
    }

    function onKeyDown(evt) {
        evt.preventDefault();
        if (evt.keyCode == 39) rightKey = true;
        else if (evt.keyCode == 37) leftKey = true;
        if (evt.keyCode == 38) upKey = true;
        else if (evt.keyCode == 40) downKey = true;
        if (evt.keyCode == 32) space = true;

    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightKey = false;
        else if (evt.keyCode == 37) leftKey = false;
        if (evt.keyCode == 38) upKey = false;
        else if (evt.keyCode == 40) downKey = false;
        if (evt.keyCode == 32) space = false;
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

    function toggleFullScreen() {
        if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
            (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }

    $('#toggleSound').toggle(function () {
        muted = true;
        $(this).addClass('muted');
    }, function () {
        muted = false;
        $(this).removeClass('muted');
    });

    $('#toggleFullScreen').toggle(function () {
        toggleFullScreen();
        $(this).removeClass('fullscreen_alt');
        $(this).addClass('fullscreen_exit_alt');
    }, function () {
        toggleFullScreen();
        $(this).removeClass('fullscreen_exit_alt');
        $(this).addClass('fullscreen_alt');
    });

    function randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    $(document).ready(function () {

        if (touchable) {
            window.document.addEventListener('touchstart', onTouchStart, false);
            window.document.addEventListener('touchmove', onTouchMove, false);
            window.document.addEventListener('touchend', onTouchEnd, false);
            window.document.addEventListener("orientationChanged", draw);
            window.document.resize(draw);
            window.document.addEventListener("touchcancel", onTouchEnd, false);
        } else {
            $(document).keydown(onKeyDown);
            $(document).keyup(onKeyUp);
        }

    });

    $(window).resize(draw);
    var listElements, step, archHeight, circleCenterX, circleCenterY, radius;
    listElements = $('#hud ul li').get();
    step = (2 * Math.PI) / listElements.length;
    archHeight = 40;
    if (touchable) archHeight = -40;
    circleCenterX = 100;
    circleCenterY = 0;
    radius = 350;
    for (var i = 0; i < listElements.length; i++) {
        var element = listElements[i];
        var angle = Math.PI / (listElements.length - 1),
            y = (1 - Math.sin(angle * i)) * archHeight;
        element.style.top = y + "px";
        angle += step;
    }

    function startGame() {
        requestAnimationFrame(startGame);
        draw();
    }

    startGame();

});



