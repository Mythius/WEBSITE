(function(global){
	const Connect4 = {};
	global.Connect4 = Connect4;
	Connect4.start = function(canv){
		Game.canvas = canv;
		Game.ctx = canv.getContext('2d');
		Game.start();
		let w1 = window.innerWidth - canv.width;
		canv.parentElement.style.gridTemplateColumns = `${w1}px ${canv.width}px`;
		this.board = Game.board;
		this.board.forEach(tile=>{
			tile.draw = tileDraw;
			tile.color = 'white';
		});
		this.board.draw = function(){
			this.forEach(tile=>{
				tile.draw();
			});
		}
		this.board.offsetX = 10;
		this.board.offsetY = 20;
	}
	Tile.prototype.solid = false;
	function tileDraw(){
        let ctx = Grid.game.ctx;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        if(this.y == 0){
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.rect(this.x*this.grid.scale+this.grid.offsetX,this.y*this.grid.scale+this.grid.offsetY,this.grid.scale,this.grid.scale);
            ctx.stroke();
        } else {
            ctx.beginPath();
            let ht = this.grid.scale / 2;
            ctx.fillStyle = this.color;
            ctx.arc(this.x*this.grid.scale+ht+this.grid.offsetX,this.y*this.grid.scale+ht+this.grid.offsetY,ht*.8,0,Math.PI*2);
            ctx.stroke();
            if(this.solid) ctx.fill();
        }
	}
	class Game{
		static canvas = document.querySelector('canvas');
		static ctx = Game.canvas.getContext('2d');
		static fps = 30;
		static board;
		static LOOP;
		static turn = false;
		static next = true;
		static playing = true;
		static last_turn = Math.random()-.5>0;
		static start(){
			// Game.canvas.width = 600;
			// Game.canvas.height = 400;
			if(Game.LOOP) clearInterval(Game.LOOP);
			Game.board = new Grid(7,7,Game.ctx,65);
			Grid.game = Game;
			Game.turn = !Game.last_turn;
			Game.last_turn = !Game.last_turn;
			Game.next = true;
			Game.playing = true;
			keys.start();
			mouse.start(Game.canvas);
			Game.LOOP = setInterval(Game.loop,1000/Game.fps);
		}
		static loop(){
			if(!Game.playing) return;
			Game.ctx.clearRect(-2,-2,Game.canvas.width+2,Game.canvas.height+2);
			let board = Game.board;
			let falling = Game.update();
			board.draw();
			if(!falling){
				let win = Game.checkWin();
				if(win){
					alert(`${win} wins!`);
					Game.playing = false;
				}
			}
			let t = board.getActiveTile();
			if(t && t.y == 0){
				let valid = !board.getTileAt(t.x,1).solid;
				t.solid = true;
				if(mouse.down) t.color = valid?'green':'purple';
				else t.color = Game.turn?'red':'blue';
				t.draw();
				t.color = 'white';
				t.solid = false;
				if(mouse.down && Game.next && valid && !falling){
					t.color = Game.turn?'red':'blue';
					Game.turn = !Game.turn;
					Game.next = false;
					t.solid = true;
				}
			}
			if(!mouse.down) Game.next = true;
		}
		static update(){
			let did_stuff = false;
			Game.board.forEach(tile=>{
				if(!tile.solid) return;
				let below = Game.board.getTileAt(tile.x,tile.y+1);
				if(below && !below.solid){
					let color = tile.color;
					below.solid = true;
					below.color = color;
					tile.solid = false;
					tile.color = 'white';
					did_stuff = true;
					return true;
				}
			});
			return did_stuff;
		}
		static checkWin(){
			let winner = false;
			Game.board.forEach(tile=>{
				let current_color = tile.color;
				if(current_color == 'white') return false;
				for(let dx=-1;dx<=1;dx++){
					for(let dy=-1;dy<=1;dy++){
						if(dx == 0 && dy == 0) continue;
						let c = Game.checkDir(tile,dx,dy,current_color);
						if(c){
							winner = c;
							return true;
						}
					}
				}
			});
			return winner;
		}
		static checkDir(t,dx,dy,c){
			let i=0;
			let stack = [];
			while(true){
				let next_tile = Game.board.getTileAt(t.x+dx*i,t.y+dy*i);
				if(next_tile){
					if(next_tile.color == c) stack.push(next_tile);
					else break;
				} else break;
				i++;
			}
			if(stack.length >= 4){
				return c;
			}
			return false;
		}
	}
})(this);