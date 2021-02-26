let c = require('./iostream.js');
let cp = require('child_process');
let fs = require('fs');

var result = [];

// fs.readFile('5000-words.txt',(error,buffer)=>{
// 	words = buffer.toString().split('\n').map(e=>e.trim().toLowerCase());
// 	console.log('Original Length',words.length);
// 	words = [...new Set(words)].sort();
// 	console.log('New Length',words.length);
// 	recur(10).then(e=>{
// 		console.log(e);
// 		fs.writeFile('5000-wh.txt',result.sort().join('\n'),err=>{
// 			if(err) console.warn(err);
// 		});
// 	});
// });

// var i=0;

// async function recur(amount=10){
// 	let t = i+amount;
// 	for(let j=i;j<t;j++){
// 		if(j>words.length) break;
// 		getHint(words[j]).then(hint=>{

// 		}).catch(err=>{
			
// 		});
// 		i++;
// 	}
// 	if(i < words.length){
// 		return new Promise((res,rej)=>{
// 			setTimeout(()=>{
// 				recur(amount).then(res);
// 			},3000);
// 		})
// 	}
// 	return 'Done';
// }

async function loop(){
	let word = await c.in('');
	getHint(word).then(hint=>{
		console.log(word+' -- '+hint);
		loop();
	}).catch(err=>{
		if(err) console.log(err);
		loop();
	});
}

loop();

async function getHint(word){
	let proc = cp.spawn('curl',['https://www.the-crossword-solver.com/word/'+word]);
	let data = [];
	proc.stdout.on('data',d=>{
		data.push(d.toString());
	});
	function trim(data){
		return data.split('title="')[3].split('"')[0];
	}
	let prom = new Promise((res,rej)=>{
		proc.on('close',()=>{
			if(data.length < 3){
				rej('could not get hint');
				return;
			}
			let hint = trim(data[1]);
			if(hint.split(' ')[0].toLowerCase() == 'crossword'){
				hint = hint.slice(15);
				if(word){
					result.push(word+' -- '+hint);
					res(hint);
				}
			} else {
				rej('could not get hint');
			}
		});
	});
	return await prom;
}
