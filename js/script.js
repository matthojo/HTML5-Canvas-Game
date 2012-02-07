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
    var Star, Bullet, Powerup, Ship, ShipEnemy;

    Star = function (x, y) {
        this.x = x;
        this.y = y;
        this.brightness = Math.floor(Math.random() * 4);
        this.radius = Math.floor(Math.random() * 4);
    };
    Bullet = function (owner) {
        this.x = owner.x;
        this.y = owner.y;
        this.rotation = owner.rotation;
        this.vx = 0;
        this.vy = 0;
        this.speed = 10;
        this.size = 3;
        this.lifetime = 800;
        this.owner = owner;
    };

    Powerup = function (x, y) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.lifetime = 8000;
        this.type = randomFromTo(1, 5);
    };
    Ship = function (x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0;
        this.defaultMaxSpeed = 4;
        this.maxSpeed = 4;
        this.energy = 360;
        this.energyRate = 18;
        this.charge = 0;
        this.defaultChargeRate = 10;
        this.chargeRate = 10;
        this.health = 100;
        this.elasticity = 1;
        this.rotation = 0;
        this.rotationSpeed = 2;
        this.flying = false;
        this.resetPowerupTime = 2000;
        this.shield = {active:false, powerupTime:2000, element:$(".shield")};
        this.superSpeed = {active:false, powerupTime:2000, element:$(".speed")};
        this.superFire = {active:false, powerupTime:2000, element:$(".fire")};
        this.laser = {active:false, powerupTime:2000, element:$(".laser")};
        this.level = 1;
    };

    ShipEnemy = function (x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0;
        this.defaultMaxSpeed = 2;
        this.maxSpeed = 2;
        this.energy = 360;
        this.energyRate = 18;
        this.charge = 0;
        this.chargeRate = 10;
        this.defaultChargeRate = 10;
        this.health = 10;
        this.reactionTime = 20;
        this.accuracy = 20;
        this.elasticity = 1;
        this.rotation = 0;
        this.rotationSpeed = 4;
        this.flying = false
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
    numEnemies = 1;

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

    function draw() {

        var canvasWidth = $(window).get(0).innerWidth;
        var canvasHeight = $(window).get(0).innerHeight - footerHeight;

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

        canvas.attr("width", canvasWidth);
        canvas.attr("height", canvasHeight);

        context.save();
        //context.fillStyle = '#12141A';
        context.clearRect(0, 0, canvas.width(), canvas.height());
        context.restore();

        // 1 - apply velocity to position (vx -> x)
        //ship.x += ship.vx;
        //ship.y += ship.vy;
        if (touchable) {
            if (touches.length > 0) {
                var touch = touches[0];
                if (touch.clientY != ship.y && touch.clientX != ship.x) {
                    ship.rotation = Math.atan2(
                        touch.clientY - ship.y,
                        touch.clientX - ship.x
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
            ship.rotation += ship.rotationSpeed;
        }
        if (leftKey) {
            ship.rotation -= ship.rotationSpeed;
        }
        if (upKey) {
            if (ship.speed < ship.maxSpeed) {
                ship.speed += 0.5;
                if (!muted) {
                    // Need better thrusters sound.
                    //thrustersSound.currentTime = 0;
                    //thrustersSound.play();
                }
            }
            ship.vy = Math.sin(ship.rotation * Math.PI / 180) * ship.speed;
            ship.vx = Math.cos(ship.rotation * Math.PI / 180) * ship.speed;
            ship.flying = true;
        } else {
            ship.vy = 0;
            ship.vx = 0;
            ship.speed = 1;
        }
        if (space) {
            shoot(ship);
        } else {
            regen(ship);
        }

        ship.x += ship.vx;
        ship.y += ship.vy;

        if (!muted) {
            if (ship.rotation > 360) ship.rotation = 0;
            if (ship.rotation < 0) ship.rotation = 360;
        }
        if (ship.y >= canvasHeight - ship.halfHeight) {
            ship.y = canvasHeight - ship.halfHeight;
            ship.vy = -Math.abs(ship.vy);
            ship.vy *= ship.elasticity;
        }
        if (ship.x >= canvasWidth - ship.halfWidth) {
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
        context.rotate(ship.rotation * Math.PI / 180);
        context.translate(-ship.x, -ship.y);

        if (ship.flying) {
            context.fillStyle = "#f98224";
            context.beginPath();
            //context.arc(0, 0, 2, 0, Math.PI * 2, true);
            context.moveTo(ship.x - randomFromTo(ship.halfWidth, ship.width), ship.y); // give the (x,y) coordinates
            context.lineTo(ship.x - (ship.halfWidth - 1), ship.y + (ship.halfHeight / 2));
            context.lineTo(ship.x - (ship.halfWidth - 1), ship.y - (ship.halfHeight / 2));
            context.closePath();
            context.fill();
        }
        if (ship.laser.active) {
            var laserGradient = context.createLinearGradient(ship.x + (ship.halfWidth), ship.y, ship.x + (ship.halfWidth - 1) + 400, ship.y + 2);
            laserGradient.addColorStop(1, 'rgba(255, 136, 136, 0)');
            laserGradient.addColorStop(0, 'rgba(255, 136, 136, 0.5)');
            context.fillStyle = laserGradient;
            context.fillRect(ship.x + (ship.halfWidth - 1), ship.y, 400, 2);
            context.fill();
        }
        context.fillStyle = "#fff";
        context.beginPath();
        context.moveTo(ship.x + ship.halfWidth, ship.y); // give the (x,y) coordinates
        context.lineTo(ship.x - ship.halfWidth, ship.y - ship.halfHeight);
        context.lineTo(ship.x - ship.halfWidth, ship.y + ship.halfHeight);
        context.closePath();
        context.fill();

        //energy
        context.lineWidth = 10;
        context.strokeStyle = "rgba(102, 204, 255, 0.4)"; // stroke color
        context.beginPath();
        context.arc(ship.x, ship.y, 40, 0, ship.energy * Math.PI / 180, false);
        context.stroke();

        //health
        context.lineWidth = 10;
        if (ship.health > 50) context.strokeStyle = "rgba(102, 204, 119, 0.4)"; // stroke color
        else if (ship.health <= 50 && ship.health > 25) context.strokeStyle = "rgba(252, 204, 119, 0.4)"; // stroke color
        else if (ship.health < 25) context.strokeStyle = "rgba(252, 71, 119, 0.4)"; // stroke color
        context.beginPath();
        context.arc(ship.x, ship.y, 30, 0, (ship.health * 3.6) * Math.PI / 180, false);
        context.stroke();

        if (ship.shield.powerupTime > 0 && ship.shield.active) ship.shield.powerupTime--;
        else if (ship.shield.powerupTime <= 0) resetPowerup(ship, 1);

        if (ship.superSpeed.powerupTime > 0 && ship.superSpeed.active) ship.superSpeed.powerupTime--;
        else if (ship.superSpeed.powerupTime <= 0) resetPowerup(ship, 4);

        if (ship.superFire.powerupTime > 0 && ship.superFire.active) ship.superFire.powerupTime--;
        else if (ship.superFire.powerupTime <= 0) resetPowerup(ship, 3);

        if (ship.laser.powerupTime > 0 && ship.laser.active) ship.laser.powerupTime--;
        else if (ship.laser.powerupTime <= 0) resetPowerup(ship, 5);
        //else resetPowerups(ship);

        if (ship.shield.active) {
            var grd = context.createRadialGradient(ship.x, ship.y, 1, ship.x, ship.y, ship.width * (Math.random() + 4));
            grd.addColorStop(0, "rgba(255, 255, 255, 0)"); // light blue
            grd.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // light blue
            grd.addColorStop(1, "rgba(255,255,255, 0.4)"); // dark blue
            context.fillStyle = grd;
            context.beginPath();
            context.arc(ship.x, ship.y, ship.width * 4, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }

        context.restore();

        var enemyLength = enemies.length;
        for (var i = 0; i < enemyLength; i++) {
            var tmpEnemy = enemies[i];
            context.save();
            context.translate(tmpEnemy.x, tmpEnemy.y);
            context.rotate(tmpEnemy.rotation * Math.PI / 180);
            context.translate(-tmpEnemy.x, -tmpEnemy.y);

            // Draw ship
            if (tmpEnemy.flying) {
                context.fillStyle = "#f98224";
                context.beginPath();
                context.moveTo(tmpEnemy.x - randomFromTo(tmpEnemy.halfWidth, tmpEnemy.width), tmpEnemy.y); // give the (x,y) coordinates
                context.lineTo(tmpEnemy.x - (tmpEnemy.halfWidth - 1), tmpEnemy.y + (tmpEnemy.halfHeight / 2));
                context.lineTo(tmpEnemy.x - (tmpEnemy.halfWidth - 1), tmpEnemy.y - (tmpEnemy.halfHeight / 2));
                context.closePath();
                context.fill();
            }
            context.fillStyle = "rgb(166, 182, 194)";
            context.beginPath();
            context.moveTo(tmpEnemy.x + tmpEnemy.halfWidth, tmpEnemy.y); // give the (x,y) coordinates
            context.lineTo(tmpEnemy.x - tmpEnemy.halfWidth, tmpEnemy.y - tmpEnemy.halfHeight);
            context.lineTo(tmpEnemy.x - tmpEnemy.halfWidth, tmpEnemy.y + tmpEnemy.halfHeight);
            context.closePath();
            context.fill();
            context.lineWidth = 10;
            context.strokeStyle = "rgba(102, 204, 255, 0.4)"; // stroke color
            context.beginPath();
            context.arc(tmpEnemy.x, tmpEnemy.y, 40, 0, tmpEnemy.energy * Math.PI / 180, false);
            context.stroke();

            context.translate(tmpEnemy.x + (tmpEnemy.halfWidth / 2), tmpEnemy.y + (tmpEnemy.halfHeight / 2));
            context.rotate(90 * Math.PI / 180);
            context.translate(-tmpEnemy.x + (tmpEnemy.halfWidth / 2), -tmpEnemy.y + (tmpEnemy.halfHeight / 2));
            context.font = "20px 800 Arial";
            context.fillText("Enemy", tmpEnemy.x + (tmpEnemy.halfWidth / 2), tmpEnemy.y + (tmpEnemy.halfHeight / 2));

            context.restore();
            animateEnemy(tmpEnemy);
        }

        var starsLength = stars.length;
        context.save();
        for (var i = 0; i < starsLength; i++) {
            var tmpStar = stars[i];
            //context.translate(tmpStar.x, tmpStar.y);
            var brightness = 'rgba(255,255,255, 0.' + tmpStar.brightness + ')';
            context.fillStyle = brightness;
            context.beginPath();
            context.arc(tmpStar.x, tmpStar.y, tmpStar.radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
        context.restore();


        var powerupsLength = powerups.length;
        context.save();
        for (var i = 0; i < powerupsLength; i++) {
            var tmpPowerup = powerups[i];
            //context.translate(tmpStar.x, tmpStar.y);
            var colour;
            switch (tmpPowerup.type) {
                case 1:
                    colour = "255, 255, 102";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Shield", tmpPowerup.x + (tmpPowerup.size * 1.5), tmpPowerup.y + (tmpPowerup.size / 2));
                    break;
                case 2:
                    colour = "102, 255, 102";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Health", tmpPowerup.x + (tmpPowerup.size * 1.5), tmpPowerup.y + (tmpPowerup.size / 2));
                    break;
                case 3:
                    colour = "102, 255, 255";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Increase Fire Rate", tmpPowerup.x + (tmpPowerup.size * 1.5), tmpPowerup.y + (tmpPowerup.size / 2));
                    break;
                case 4:
                    colour = "255, 102, 255";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Speed", tmpPowerup.x + (tmpPowerup.size), tmpPowerup.y + (tmpPowerup.size / 2));
                    break;
                case 5:
                    colour = "255,255,255";
                    context.fillStyle = "rgb(166, 182, 194)";
                    context.font = "20px 800 Arial";
                    context.fillText("Laser", tmpPowerup.x + (tmpPowerup.size), tmpPowerup.y + (tmpPowerup.size / 2));


            }
            var grd = context.createRadialGradient(tmpPowerup.x, tmpPowerup.y, 1, tmpPowerup.x, tmpPowerup.y, tmpPowerup.size * (Math.random() + 4));
            grd.addColorStop(0, "rgba(255, 255, 255, 0)"); // light blue
            grd.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // light blue
            grd.addColorStop(1, "rgba(" + colour + ", 0.4)"); // dark blue
            context.fillStyle = grd;
            context.beginPath();
            context.arc(tmpPowerup.x, tmpPowerup.y, tmpPowerup.size * 4, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
            context.fillStyle = "rgb(" + colour + ")";
            context.beginPath();
            context.arc(tmpPowerup.x, tmpPowerup.y, tmpPowerup.size, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
            animatePowerup(tmpPowerup);
        }
        context.restore();

        var bulletsLength = bullets.length;
        for (var i = 0; i < bulletsLength; i++) {
            var tmpBullet = bullets[i];
            try {
                if (tmpBullet) {
                    context.save();
                    context.translate(tmpBullet.x, tmpBullet.y);
                    context.rotate((tmpBullet.rotation) * Math.PI / 180);
                    context.translate(-tmpBullet.x, -tmpBullet.y);
                    context.fillStyle = '#FFF';
                    context.beginPath();
                    context.fillRect(tmpBullet.x, tmpBullet.y, tmpBullet.size * 4, tmpBullet.size);
                    context.closePath();
                    context.fill();
                    context.restore();
                    animateBullet(tmpBullet, i);
                }
            } catch (error) {
                console.log(error);
            }
        }
        ship.flying = false;
    }

    function resetPlayer(player) {
        player.x = 150;
        player.y = canvas.height() / 2;
        player.vx = 0;
        player.vy = 0;
        player.health = 100;
        resetPowerups(player);
    }

    function resetPowerups(player) {
        player.shield.active = false;
        player.shield.powerupTime = ship.resetPowerupTime;
        player.shield.element.removeClass('active');
        player.superSpeed.active = false;
        player.superSpeed.powerupTime = ship.resetPowerupTime;
        player.superSpeed.element.removeClass('active');
        player.superFire.active = false;
        player.superFire.powerupTime = ship.resetPowerupTime;
        player.superFire.element.removeClass('active');
        player.chargeRate = player.defaultChargeRate;
        player.maxSpeed = player.defaultMaxSpeed;
        player.laser.active = false;
        player.laser.powerupTime = ship.resetPowerupTime;
        player.laser.element.removeClass('active');
    }

    function resetPowerup(player, powerup) {
        switch (powerup) {
            case 1:
                player.shield.active = false;
                player.shield.powerupTime = ship.resetPowerupTime;
                player.shield.element.removeClass('active');
                break;
            case 2:
                //player.health = 100;
                break;
            case 3:
                player.superFire.active = false;
                player.superFire.powerupTime = ship.resetPowerupTime;
                player.chargeRate = player.defaultChargeRate;
                player.superFire.element.removeClass('active');
                break;
            case 4:
                player.superSpeed.active = false;
                player.superSpeed.powerupTime = ship.resetPowerupTime;
                player.maxSpeed = player.defaultMaxSpeed;
                player.superSpeed.element.removeClass('active');
                break;
            case 5:
                player.laser.active = false;
                player.laser.powerupTime = ship.resetPowerupTime;
                player.laser.element.removeClass('active');
                break;

        }
    }

    function animateEnemy(tmpEnemy) {

        //tmpEnemy.rotation += (Math.random()*1)/ 2;

        if (tmpEnemy.y >= canvasHeight - tmpEnemy.halfHeight) {
            tmpEnemy.y = canvasHeight - tmpEnemy.halfHeight;
            tmpEnemy.rotation += 40;
        }
        if (tmpEnemy.x >= canvasWidth - tmpEnemy.halfWidth) {
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
        var distance = Math.sqrt((dx * dx) + (dy * dy));

        if (numEnemies > 1) {
            for (i = 0; i < enemies.length; i++) {
                var dxTwo, dyTwo, distanceTwo;
                var tmpEnemyTwo = enemies[i];
                if (tmpEnemyTwo != tmpEnemy) {
                    dxTwo = tmpEnemyTwo.x - tmpEnemy.x;
                    dyTwo = tmpEnemyTwo.y - tmpEnemy.y;
                    distanceTwo = Math.sqrt((dxTwo * dxTwo) + (dyTwo * dyTwo));
                    var randomOption = Math.floor(Math.random() * 10);
                    if (distanceTwo < tmpEnemyTwo.width) {
                        tmpEnemy.x -= randomOption;
                        tmpEnemy.y -= randomOption;
                    }
                }
            }
        }
        if (distance <= (ship.width * 4) && ship.shield.active) {
            tmpEnemy.x -= tmpEnemy.halfWidth;
            tmpEnemy.y -= tmpEnemy.halfHeight;
            tmpEnemy.speed = 0.5;
            if(tmpEnemy.energy > 0){
                shoot(tmpEnemy);
            }
            else {
                regen(tmpEnemy);
            }

            tmpEnemy.flying = false;
        } else
        if (distance < ship.width + tmpEnemy.halfWidth) {
            //playGame = false;
            tmpEnemy.x += 0;
            tmpEnemy.y += 0;
            tmpEnemy.speed = 0;

            if(tmpEnemy.energy > 0){
                shoot(tmpEnemy);
            }
            else {
                regen(tmpEnemy);
            }

            tmpEnemy.flying = false;
            if (ship.superSpeed.active && ship.speed == ship.maxSpeed) destroy(tmpEnemy);

        } else {
            if (tmpEnemy.speed < tmpEnemy.maxSpeed) {
                tmpEnemy.speed += 0.5;
            }
            // set distance to 0 for now, so constantly tracking
            if (distance > 0) {
                tmpEnemy.rotation = Math.atan2(
                    randomFromTo(ship.y - tmpEnemy.reactionTime, (ship.y - tmpEnemy.reactionTime) + tmpEnemy.accuracy) - tmpEnemy.y,
                    randomFromTo(ship.x - tmpEnemy.reactionTime, (ship.x - tmpEnemy.reactionTime) + tmpEnemy.accuracy) - tmpEnemy.x
                ) * 180 / Math.PI;

                tmpEnemy.flying = true;
                tmpEnemy.vy = Math.sin(tmpEnemy.rotation * Math.PI / 180) * tmpEnemy.speed;
                tmpEnemy.vx = Math.cos(tmpEnemy.rotation * Math.PI / 180) * tmpEnemy.speed;

                if (distance < 200) {
                    shoot(tmpEnemy);
                } else {
                    regen(tmpEnemy);
                }
            }
            tmpEnemy.x += tmpEnemy.vx;
            tmpEnemy.y += tmpEnemy.vy;
        }
        if (numEnemies < enemies.length) removeEnemy(tmpEnemy);

    }

    function animateBullet(bullet, i) {

        if (bullet.lifetime <= 0) {
            bullets.removeByValue(bullet);
        }
        else if (bullet.lifetime > 0) bullet.lifetime = bullet.lifetime - 10;

        if (bullets.y >= canvasHeight - bullets.size) {
            bullets.removeByValue(bullet);
        }
        if (bullets.x >= canvasWidth - bullets.size) {
            bullets.removeByValue(bullet);
        }
        if (bullets.y <= 0 + bullets.size) {
            bullets.removeByValue(bullet);
        }
        if (bullets.x <= 0 + bullets.size) {
            bullets.removeByValue(bullet);
        }

        bullet.vy = Math.sin(bullet.rotation * Math.PI / 180) * bullet.speed;
        bullet.vx = Math.cos(bullet.rotation * Math.PI / 180) * bullet.speed;

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        var dx, dy, distance;
        if (bullet.owner == ship) {
            for (i = 0; i < enemies.length; i++) {
                var tmpEnemy = enemies[i];

                dx = tmpEnemy.x - bullet.x;
                dy = tmpEnemy.y - bullet.y;
                distance = Math.sqrt((dx * dx) + (dy * dy));
                //console.log(distance);
                if (distance < tmpEnemy.width) {
                    //playGame = false;
                    bullets.removeByValue(bullet);
                    destroy(tmpEnemy);
                    //console.log("destroyed");
                    //playGame = false;

                }

            }
        } else {
            dx = ship.x - bullet.x;
            dy = ship.y - bullet.y;
            distance = Math.sqrt((dx * dx) + (dy * dy));
            //console.log(distance);
            if (distance <= (ship.width * 4) && ship.shield.active) {
                bullets.removeByValue(bullet);
            }
            else if (distance < ship.halfWidth && !ship.shield.active) {
                bullets.removeByValue(bullet);
                if (!muted) {
                    hitSound.currentTime = 0;
                    hitSound.play();
                }
                destroy(ship);
            }


        }

    }

    function animatePowerup(powerup) {

        if (powerup.lifetime > 0) powerup.lifetime = powerup.lifetime - 10;

        if (powerup.lifetime <= 0) {
            powerups.removeByValue(powerup);
            numPowerups--;
        }
        var dx = ship.x - powerup.x;
        var dy = ship.y - powerup.y;
        var distance = Math.sqrt((dx * dx) + (dy * dy));
        if (distance < ship.width) {
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
                player.chargeRate = player.defaultChargeRate * 2;
                player.superFire.element.addClass('active');
                break;
            case 4:
                player.superSpeed.active = true;
                player.maxSpeed = player.maxSpeed * 2;
                player.superSpeed.element.addClass('active');
                break;
            case 5:
                player.laser.active = true;
                player.laser.element.addClass('active');
                break;

        }
    }


    function regen(player) {
        if (player.energy < 360) {
            player.energy = player.energy + player.energyRate;
        }
        if (player.charge < 200) {
            player.charge = player.charge + player.chargeRate;
        }
        //Charge Powerup
    }

    function shoot(player) {
        if (player.energy > 0 && player.charge == 200) {
            player.energy = player.energy - 18;
            bullets.push(new Bullet(player));
            if (!muted) {
                shootSound.currentTime = 0;
                shootSound.play();
            }
            player.charge = 0;
        } else if (player.charge < 200) {
            player.charge = player.charge + player.chargeRate;
        }
    }

    function destroy(player) {
        player.health = player.health - 10;
        //console.log(player.health);
        if (player.health == 0 && player != ship) {
            if (!muted) {
                destroySound.currentTime = 0;
                destroySound.play();
            }
            enemies.removeByValue(player);
            score++;
            scoreOut.text(score);
            levelUp();
        } else if (player.health == 0 && player == ship) {
            resetPlayer(player);
            if (!muted) {
                destroySound.currentTime = 0;
                destroySound.play();
            }
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



