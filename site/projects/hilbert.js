(function(global){
	const Hilbert = {};
	global.Hilbert = Hilbert;

	Hilbert.start = function(canv){
		canvas = canv;
		ctx = canvas.getContext('2d');
		width = canvas.width;
		height = canvas.height;
		order = random(2,6);
		N = 2**order;
		total = N * N;
		count = 0;
		path = [];
		ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
		this.order = order;
		for(let i=0;i<total;i++){
			path[i] = hilbert(i);
			var len = width / N;
			path[i].x *= len;
			path[i].y *= len;
			path[i].x += len/2;
			path[i].y += len/2;
		}
		loop();
	}

	var canvas,ctx,width,height;
	var N,order,total,count,path;

	function hilbert(i){

		// let x = i % N;
		// let y = (i-x) / N;

		// return {x,y};

		const points = [
			{x:0,y:0},
			{x:0,y:1},
			{x:1,y:1},
			{x:1,y:0},
		];

		let index = i & 3;
		let v = points[index];

		for(let j = 1; j < order;j++){
			i = i >>> 2;
			index = i & 3;
			let len = 2 ** j;
			if(index == 0){
				let temp = v.x;
				v.x = v.y;
				v.y = temp;
			} else if(index == 1){
				v.y += len;
			} else if(index == 2){
				v.x += len;
				v.y += len;
			} else if(index == 3){
				let temp = len-1-v.x;
				v.x = len-1-v.y;
				v.y = temp;
				v.x += len;
			}
		}

		

		return v;
	}

	function loop(){

		count+=1;

		if(count >= path.length+1){
			return;
		} else {
			setTimeout(loop,1000/60);
		}


		ctx.clearRect(-2,-2,width+2,height+2);


		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'white';
		ctx.lineWidth = 2;


		for(let i=1;i<count;i++){
			ctx.beginPath();
			ctx.strokeStyle = `hsl(${map(i,0,path.length,0,360)},100%,50%)`;
			ctx.moveTo(path[i-1].x,path[i-1].y);
			ctx.lineTo(path[i].x,path[i].y);
			ctx.stroke();
		}
	}

})(this);