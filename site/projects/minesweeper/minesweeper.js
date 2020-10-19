(function(global){
	const Minesweeper = {};
	global.Minesweeper = Minesweeper;
	Minesweeper.start = function(canv){
		canvas = canv;
		ctx = canvas.getContext('2d');
		setup();
	}

	var canvas,ctx;

	var stop,grid;
	const path = 'projects/minesweeper/';
	const bombs = 50;

	var nums = [];
	for(let i=0;i<9;i++) nums.push(createImage(`imgs/${i}.png`));
	const BOMB = createImage('imgs/bomb.png');
	const COVER = createImage('imgs/covered.png');
	const FLAG = createImage('imgs/flagged.png');

	function tiledraw(){
		let ct = this.getCenter();
		let sc = this.grid.scale / 2;
		ctx.save();
		ctx.translate(ct.x,ct.y);
		let img = null;
		if(this.flagged){
			img = FLAG;
		} else if(this.covered){
			img = COVER;
		} else if(this.type == 'bomb'){
			img = BOMB;
		} else {
			img = nums[+this.type];
		}
		if(img){
			ctx.drawImage(img,-sc,-sc,sc*2,sc*2);
		} else console.warn('Image not drawn');
		ctx.restore();
	}

	function createImage(src){
		let i = new Image;
		i.src = path+src;
		return i;
	}

	function addBombs(count){
		for(let i=0;i<count;i++) addBomb();
		function addBomb(){
			let x = random(0,grid.width-1);
			let y = random(0,grid.height-1);
			let t = grid.getTileAt(x,y);
			if(t.type != 'bomb'){
				t.type = 'bomb';
			} else addBomb();
		}
	}

	function addNumbers(){
		grid.forEach(tile=>{
			if(tile.type != 'bomb'){
				let number = 0;
				for(let x=-1;x<=1;x++){
					for(let y=-1;y<=1;y++){
						let touching = grid.getTileAt(tile.x+x,tile.y+y);
						if(touching && touching.type == 'bomb') number++;
					}
				}
				tile.type = ''+number;
			}
		});
	}

	function setup(){
		stop = false;
		grid = new Grid(15,15,ctx,canvas.width/15);
		mouse.start(canvas);
		grid.forEach(tile=>{
			tile.type = '0';
			tile.covered = true;
			tile.flagged = false;
			tile.draw = tiledraw;
		});
		grid.draw = function(){
			let covered = 0;
			this.forEach(tile=>{
				tile.draw();
				if(tile.covered) covered++;
			});
			return covered;
		}
		addBombs(bombs);
		addNumbers();
		loop();
	}

	function clickTile(t){
		if(t.flagged) return;
		if(!t.covered) return;
		if(t.type === 'bomb'){
			stop = true;
			grid.forEach(tile=>{
				if(tile.type == 'bomb' && !t.flagged) tile.covered = false;
			});
			alert('You Lose');
			return;
		} else if(t.type === '0'){
			t.covered = false;
			for(let x=-1;x<=1;x++){
				for(let y=-1;y<=1;y++){
					let touching = grid.getTileAt(t.x+x,t.y+y);
					if(touching) clickTile(touching);
				}
			}
		} else {
			t.covered = false;
		}
	}

	function loop(){
		if(stop) {
			return;
		} else {
			setTimeout(loop,1000/30);
		}
		ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
		if(mouse.down){
			let ac = grid.getActiveTile();
			if(ac) clickTile(ac);
		} else if(mouse.right){
			let ac = grid.getActiveTile();
			if(ac){
				if(ac.covered){
					ac.flagged = !ac.flagged;
				} else {
					let flagged = 0;
					for(let x=-1;x<=1;x++){
						for(let y=-1;y<=1;y++){
							let tile = grid.getTileAt(ac.x+x,ac.y+y);
							if(tile && tile.flagged) flagged++;
						}
					}
					if(flagged == Number(ac.type)){
						for(let x=-1;x<=1;x++){
							for(let y=-1;y<=1;y++){
								let tile = grid.getTileAt(ac.x+x,ac.y+y);
								if(tile && !tile.flagged){
									clickTile(tile);
								}
							}
						}
					}
				}
			}
			mouse.right = false;
		}
		let win = grid.draw();
		if(win == bombs){
			stop = true;
			alert('You Win');
			return;
		}
	}
})(this);