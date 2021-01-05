const socket = io();

socket.on('memeurls',data=>{
	let url_array = data.split('\n');
	console.log(url_array);
	for(let url of url_array.reverse()){
		if(url.length < 2) continue;
		let i = new Image;
		i.src = 'memes/'+url;
		document.body.appendChild(i);
		i.onclick = () => {
			i.requestFullscreen();
		}
	}
});

obj('input').on('change',function(){
	saved = [];
	if(this.files){
		for(let f of this.files){
			var reader = new FileReader();
			reader.readAsDataURL(f);
			reader.onload = e => {
				let dataURL = e.target.result;
				let name = f.name;
				socket.emit('addmeme',{name,dataURL});
				console.log({name,dataURL});
			}
		}
	}
});