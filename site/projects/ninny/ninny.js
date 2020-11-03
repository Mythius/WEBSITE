(function(global){
	const Ninny = {};
	global.Ninny = Ninny;

	Ninny.start = function(canv){
		stop = true;
		canvas = canv;
		ctx = canvas.getContext('2d');
		loadArrows();
		setTimeout(e=>{
			stop = false;
			loop();
		},100);
		board = new Grid(7,8,ctx,canvas.height/9);
		board.offsetY = 35;
		board.offsetX = canvas.width/10;
		this.board = board;
		let w1 = window.innerWidth - canvas.width;
		canvas.parentElement.style.gridTemplateColumns = `${w1}px ${canvas.width}px`;
		team1 = new Team('','red',0);
		team2 = new Team('','blue',1);
		turn = 0;
		current_piece = null;
		Touch.init(start=>{
			mouse.pos.x = start.x;
			mouse.pos.y = start.y;
			mouse.down = true;
		},move=>{},end=>{
			mouse.down = false;
		});
	}

	var canvas;
	var ctx;

	class Team{
		static clear(){
			board.forEach(tile=>{
				tile.piece = null;
			});
		}
		constructor(name,color,side){
			this.name = name;
			this.color = color;
			this.pieces = [];
			this.side = side;
			let row = side?7:0;
			for(let x=0;x<7;x++){
				let p = new Piece(x,side?6:1,this,'ninny');
				this.pieces.push(p);
			}
			this.pieces.push(new Piece(1,row,this,'numskull'));
			this.pieces.push(new Piece(2,row,this,'numskull'));
			this.pieces.push(new Piece(3,row,this,'brain'));
			this.pieces.push(new Piece(4,row,this,'numskull'));
			this.pieces.push(new Piece(5,row,this,'numskull'));
		}
		draw(){
			for(let piece of this.pieces){
				piece.draw();
			}
		}
	}

	class Piece{
		constructor(x,y,team,type){
			this.team = team;
			this.color = team.color;
			this.type = type;
			this.x = x;
			this.y = y;
			this.alive = true;
		}
		draw(){
			if(!this.alive) return;
			let tile = board.getTileAt(this.x,this.y);
			tile.piece = this;
		}
		canMoveTo(x,y){
			let possible = [];
			let tile = board.getTileAt(this.x,this.y);
			let ctr = 0;
			for(let i=1;i<256;i*=2){
				if((tile.arrows&i)!==0){
					let angle = angles[ctr];
					let dx = Math.round(Math.cos(angle*Math.PI/180));
					let dy = Math.round(Math.sin(angle*Math.PI/180));
					let tc = 1;
					while(true){
						let pt = board.getTileAt(this.x+dx*tc,this.y+dy*tc);
						if(pt){
							if(pt.piece && pt.piece.alive){
								if(pt.piece.color == this.color){
									break;
								} else {
									if(pt.x == x && pt.y == y){
										if(pt.piece.type == 'brain'){
											alert(this.color+' team wins!');
										}
										pt.piece.alive = false;
										return true;
									} else break;
								}
							}
							possible.push(''.concat(pt.x,pt.y));
							tc++;
							if(this.type != 'numskull') break;
						} else break;
					}
				}
				ctr++;
			}
			let sc = ''.concat(x,y);
			return possible.includes(sc);
		}
		moveTo(x,y){
			if(this.canMoveTo(x,y)){
				this.x = x;
				this.y = y;
				return true;
			} else return false;
		}
	}

	var angles = [];
	for(let i=0;i<360;i+=45) angles.push(i);

	var team1,team2;
	var path = 'projects/ninny/';

	let a1 = new Image();
	a1.src = path+'red_ninny.png';
	let a2 = new Image();
	a2.src = path+'red_numskull.png';
	let a3 = new Image();
	a3.src = path+'red_brain.png';
	let a4 = new Image();
	a4.src = path+'blue_ninny.png';
	let a5 = new Image();
	a5.src = path+'blue_numskull.png';
	let a6 = new Image();
	a6.src = path+'blue_brain.png';

	var imgs = {
		red_ninny: a1,
		red_numskull: a2,
		red_brain: a3,
		blue_ninny: a4,
		blue_numskull: a5,
		blue_brain: a6
	}

	const arrow = new Image();

	Tile.prototype.DRAW = function(){
		let scl = this.grid.scale;
		let ox = this.grid.offsetX, oy=this.grid.offsetY;
		let ctr = 0;
		let tx = this.x*scl+ox+scl/2;
		let ty = this.y*scl+oy+scl/2;
		for(let i=1;i<256;i*=2){
			if((this.arrows&i)!==0){
				ctx.save();
				ctx.translate(tx,ty);
				ctx.rotate(angles[ctr]/180*Math.PI);
				ctx.drawImage(arrow,14,-arrow.height/2);
				ctx.restore();
			}
			ctr++;
		}
		if(this.piece){
			let img = imgs[this.piece.color+'_'+this.piece.type]
			ctx.save();
			ctx.beginPath();
			ctx.translate(tx,ty);
			let scl = board.scale + 5;
			ctx.rect(-scl/2,-scl/2,scl,scl);
			ctx.strokeStyle = 'black';
			if(this.piece == current_piece){
				ctx.lineWidth = 5;
				ctx.stroke();
			}
			ctx.drawImage(img,-img.width/2,-img.height/2);
			ctx.restore();
		}
	}

	Grid.prototype.draw = function(){
		this.forEach(tile=>{
			tile.DRAW();
		});
	}

	let board;

	function loadArrows(){
		arrow.src = path+'arrow.png';
		xml(path+'arrow_data.txt',text=>{
			let a = text.split('\n');
			let c = 0;
			board.forEach(tile=>{
				tile.arrows = Number(a[c]);
				tile.scale = 90;
				tile.piece = null;
				tile.color = (tile.x+tile.y)%2==0?'yellow':'orange';
				c++;
			});
			mouse.start(canvas);
			// keys.start();
		});
	}


	var current_piece;
	var turn = 0;

	var stop = false;

	function loop(){
		if(!stop) setTimeout(loop,1000/30);
		ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
		board.draw_boxes();
		Team.clear();
		team1.draw();
		team2.draw();
		board.draw();
		let active = board.getActiveTile();
		let changeback;
		if(mouse.down){
			if(active){
				if(current_piece){
					if(current_piece.team.side == turn){
						let moved = current_piece.moveTo(active.x,active.y);
						if(moved){
							turn = (turn+1)%2;
							current_piece = null;
						} else if(active.piece && active.piece.team.side == turn){
							current_piece = active.piece;
						} else {
							current_piece = null;
						}
					} else current_piece = null;
				} else if(active.piece && active.piece.team.side == turn) {
					current_piece = active.piece;
				}
			}
			mouse.down = false;
		}
	}



})(this);