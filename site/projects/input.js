var FULLSCREEN = false;
document.onfullscreenchange = () => {FULLSCREEN = !FULLSCREEN};
class mouse{
    static pos = { x: 0, y: 0 };
    static down = false;
    static right = false;
    static element;
    static transformPos(e){
        var x,y;
        var element = mouse.element;
        let br = mouse.element.getBoundingClientRect();
        if(FULLSCREEN){
            let ratio = window.innerHeight/element.height;
            let offset = (window.innerWidth-(element.width*ratio))/2;
            x = map(e.clientX-br.left-offset,0,element.width*ratio,0,element.width);
            y = map(e.clientY-br.top,0,element.height*ratio,0,element.height);
        } else {
            x = e.clientX - br.left;
            y = e.clientY - br.top;
        }
        return {x,y};
    }
    static start(element=document.documentElement) {
        mouse.element = element;
        function mousemove(e) {
            if(e.target!=element)return;
            let pos = mouse.transformPos(e);
            mouse.pos.x = pos.x;
            mouse.pos.y = pos.y;
        }
        function mouseup(e) {
            if(e.which == 1){
                mouse.down = false;
            } else if(e.which == 3){
                mouse.right = false;
            }
        }
        function mousedown(e) {
            mousemove(e);
            if(e.which == 1){
                mouse.down = true;
            } else if(e.which == 3){
                mouse.right = true;
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousedown', mousedown);
        document.addEventListener('contextmenu',e=>{e.preventDefault()});
    }
}
class keys{
    static keys = [];
    static start(){
        function keydown(e){
            keys.keys[e.key.toLowerCase()] = true;
        }
        function keyup(e){
            keys.keys[e.key.toLowerCase()] = false;
        }
        document.addEventListener('keydown',keydown);
        document.addEventListener('keyup',keyup);
    }
    static down(key){
        if(key.toLowerCase() in keys.keys){
            return keys.keys[key.toLowerCase()];
        }
        return false;
    }
}
class Touch{
    static all = [];
    static initialized = false;
    static onstart = () => {};
    static onmove = () => {};
    static onend = () => {};
    static onhold = () => {};
    static checkPos(callback){
        for(let t of Touch.all){
            callback(t);
        }
    }
    static init(onstart=Touch.onstart,onmove=Touch.onmove,onend=Touch.onend,onhold=Touch.onhold){
        Touch.onstart = onstart;
        Touch.onmove = onmove;
        Touch.onend = onend;
        if(Touch.initialized) return;
        Touch.initialized = true;
        let el = mouse.element ? mouse.element : document;
        el.addEventListener('touchstart',e=>{
            Touch.start(e,Touch.onstart,Touch.onmove,Touch.onend,Touch.onhold);
        });
        el.addEventListener('touchmove',Touch.move);
        el.addEventListener('touchend',Touch.end);
        el.addEventListener('contextmenu',Touch.hold);
    }
    static start(event,onstart,onmove,onend,onhold){
        for(let touch of event.changedTouches){
            return new Touch(touch,onstart,onmove,onend,onhold);
        }
    }
    static move(e){
        for(let touch of e.changedTouches){
            for(let t of Touch.all){
                if(touch.identifier === t.id){
                    e.clientX = touch.clientX;
                    e.clientY = touch.clientY;
                    t.move(e);
                    break;
                }
            }
        }
    }
    static end(e){
        for(let touch of e.changedTouches){
            for(let t of Touch.all){
                if(touch.identifier === t.id){
                    e.clientX = touch.clientX;
                    e.clientY = touch.clientY;
                    t.end(e);
                    break;
                }
            }
        }
    }
    static hold(e){
        debugger;
        let mp = mouse.transformPos(e);
        Touch.onhold(mp);
    }
    constructor(touch,onstart,onmove,onend,onhold){
        this.id = touch.identifier;
        this.pos = {};
        this.start = {};
        let pos = mouse.transformPos(touch);
        this.start.x = pos.x;
        this.start.y = pos.y;
        this.pos.x = pos.x;
        this.pos.y = pos.y;
        this.onstart = onstart;
        this.onmove = onmove;
        this.onend = onend;
        this.onhold = onhold;
        this.onstart(pos);
        Touch.all.push(this);
    }
    move(e){
        let np = mouse.transformPos(e);
        this.pos.x = np.x;
        this.pos.y = np.y;
        this.onmove(np);
    }
    end(e){
        let np = mouse.transformPos(e);
        this.pos.x = np.x;
        this.pos.y = np.y;
        let ix = Touch.all.indexOf(this);
        if(ix != -1){
            Touch.all.splice(ix,1);
        }
        this.onend(np);
    }
}
