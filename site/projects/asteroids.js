(function(global){

	const Asteroids = {};
	global.Asteroids = Asteroids;

	Asteroids.start = function(canv){
		canvas = canv;
		ctx = canvas.getContext('2d');
		canvas.onresize = resize;


		document.on('keydown',e=>{
			if(e.key in key){
				key[e.key] = true;
				e.preventDefault();
			}
		});

		document.on('keyup',e=>{
			if(e.key in key){
				key[e.key] = false;
			}
		});

		let ne = canvas.cloneNode(true);
		canvas.parentNode.replaceChild(ne,canvas);

		stop = false;

		setup();

		draw();

		this.ship = ship;

		// canvas.requestFullscreen();
		resize();

	}

	var width,height;
	var canvas,ctx;
	const fps = 60;

	class Vector{
		constructor(x,y){
			this.x=x;
			this.y=y;
		}
	}

	function radians(deg){
		return deg*Math.PI/180;
	}

	function pointIn(dist,dir,ox=0,oy=0){
		let x = ox + dist * Math.cos(radians(dir));
		let y = oy + dist * Math.sin(radians(dir));
		return new Vector(x,y);
	}

	function Ship(){
		var dir=-90,vel=0,acc=0,pos=new Vector(width/2,height/2);
		var size = 20;

		function draw(){
			ctx.beginPath();
			ctx.lineWidth=2;
			ctx.strokeStyle = 'white';
			moveTo(pointIn(size,dir,pos.x,pos.y));
			lineTo(pointIn(size,dir+140,pos.x,pos.y));
			lineTo(pointIn(size*.3,dir+180,pos.x,pos.y));
			lineTo(pointIn(size,dir-140,pos.x,pos.y));
			lineTo(pointIn(size,dir,pos.x,pos.y));
			ctx.stroke();
		}

		function moveTo(vector){
			ctx.moveTo(vector.x,vector.y);
		}

		function lineTo(vector){
			ctx.lineTo(vector.x,vector.y);
		}

		function move(){

			vel += acc;

			if(acc < 0){
				acc += .05;
			} else if(acc > 0) {
				acc -= .05;
			}

			vel -= .05;

			acc = Math.round(acc*100)/100;

			acc = Math.min(acc,3);

			vel = Math.max(.5,Math.min(vel,5));

			let pt = pointIn(vel,dir,pos.x,pos.y);

			pos.x = (pt.x + width) % width;
			pos.y = (pt.y + height) % height;
		}

		function turn(deg){
			dir += deg;
		}

		function fly(pix){
			acc += pix;
		}

		function update(){
			move();
			draw();
		}
		this.update = update;
		this.turn = turn;
		this.move = fly;

		this.getData = function(){
			let ob = {dir,vel,acc,pos,size};
			return ob;
		}
	}

	function Bullet(ox,oy,dir,speed=6){
		var x = ox;
		var y = oy;
		function update(){
			let next_pos = pointIn(speed,dir,x,y);
			x = next_pos.x;
			y = next_pos.y;
			draw();
			if(Math.abs(x) > 10000 || Math.abs(y) > 10000){
				die();
			}
		}
		function draw(){
			ctx.fillStyle = 'white';
			ctx.fillRect(x-2,y-2,4,4);
		}
		function die(){
			BULLETS.splice(BULLETS.indexOf(this),1);
			delete this;
		}
		BULLETS.push(this);
		this.die = die;
		this.update = update;
		this.getData = function(){
			return {x,y};
		}
	}

	function Asteroid(sx,sy,size=40){
		var x = sx;
		var y = sy;
		var THIS = this;
		var dir = random(0,360),speed = 1;
		var shape = [];
		let points = random(13,18);
		class Pair{
			constructor(dis,dir){
				this.dir = dir;
				this.dis = dis;
			}
		}
		for(let i=0;i<points;i++){
			let ratio = size / 5;
			let dist = random(size-ratio,size+ratio);
			let p = new Pair(dist,random(0,360));
			shape.push(p);
		}
		shape.sort((a,b)=>b.dir-a.dir);
		function draw(){
			ctx.beginPath();
			let lastPoint = shape[shape.length-1];
			let xy = pointIn(lastPoint.dis,lastPoint.dir,x,y);
			ctx.moveTo(xy.x,xy.y);
			for(let sh of shape){
				let xy = pointIn(sh.dis,sh.dir,x,y);
				ctx.lineTo(xy.x,xy.y);
			}
			ctx.stroke();
		}
		function update(){
			let newpos = pointIn(speed,dir,x,y);
			x = (newpos.x + width) % width;
			y = (newpos.y + height) % height;
			draw();
		}
		function die(){
			let index = ASTEROIDS.indexOf(THIS);
			ASTEROIDS.splice(index,1);
			delete THIS;
		}
		function split(){
			let amount = random(2,4);
			let newsize = size / amount;
			if(newsize < 10){
				die();
				return;
			}
			for(let i=0;i<amount;i++){
				let na = new Asteroid(x,y,newsize);
				ASTEROIDS.push(na);
			}
			die();
		}
		this.split = split;
		this.update = update;
		this.getData = function(){
			return {x,y,size}
		}
	}


	function resize(){
		if(!canvas) return;
		width = canvas.getBoundingClientRect().width;
		height = canvas.getBoundingClientRect().height;
		canvas.width = width;
		canvas.height = height;
	}

	var key = {ArrowUp:false,ArrowDown:false,ArrowLeft:false,ArrowRight:false," ":false,Escape:false};

	// Global Values 

	var ship;
	var BULLETS;
	var reload;
	var ASTEROIDS;
	var asteroid_count;
	var stop = false;
	// Setup (runs once);
	function setup(){
		ship = new Ship();
		BULLETS = [];
		ASTEROIDS = [];
		asteroid_count = 15;
		reload = 0;
		for(let i=0;i<asteroid_count;i++){
			let x = random(0,width);
			let y = random(0,height);
			let asteroid = new Asteroid(x,y,random(20,80));
			ASTEROIDS.push(asteroid)
		}
	}

	// Loop (runs continualy)
	function draw(){
		if(!stop) setTimeout(draw,1000/fps);
		ctx.clearRect(-1,-1,width+1,height+1);
		ctx.fillStyle = 'black';
		ctx.fillRect(-1,-1,width+1,height+1);
		ctx.fill();
		handleControls();


		ship.update();
		for(let b of BULLETS) b.update();

		for(let a of ASTEROIDS) a.update();

		for(let b of BULLETS){
			let pos = b.getData();
			let x = pos.x;
			let y = pos.y;
			for(let a of ASTEROIDS){
				let ap = a.getData();
				let ax = ap.x;
				let ay = ap.y;
				let dist = distance(x,y,ax,ay);
				if(dist < (ap.size - 2)){
					b.die();
					a.split();
					checkWin();
				}
			}
		}

		let sp = ship.getData().pos;

		for(let a of ASTEROIDS){
			let d = a.getData();
			let dist = distance(sp.x,sp.y,d.x,d.y);
			if(dist < (d.size + 12)){
				stop = true;
				alert('You Died');
				return;
			}
		}

		if(reload > 0) reload--;

	}

	function handleControls(){
		if(key.Escape) clearInterval(loop);

		let rs = 3, ms = .1;

		if(key.ArrowLeft){
			ship.turn(-rs);
		}
		if(key.ArrowRight){
			ship.turn(rs);
		}
		if(key.ArrowUp){
			ship.move(ms);
		}

		if(key[' ']){
			if(reload) return;
			reload = 15;
			let data = ship.getData();
			new Bullet(data.pos.x,data.pos.y,data.dir);
		}
	}

	function checkWin(){
		if(ASTEROIDS.length == 0){
			alert('YOU WIN');
		}
	}


	setup();

})(this);