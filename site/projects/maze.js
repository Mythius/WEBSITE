(function(global) {
    var Maze = {};
    global.Maze = Maze;
    const width = 800,height = 800;
    const w = 40;
    const cols = Math.floor(width / w);
    const rows = Math.floor(height / w);
    var cells = [];
    var current;
    var stack = [];
    function outofBounds(x, y) {
        return x < 0 || y < 0 || x > cols - 1 || y > rows - 1;
    }
    function getIndex(x, y) {
        if (outofBounds(x, y)) return -1;
        return x + y * cols;
    }
    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }
    function Cell(tx, ty) {
        var x = tx;
        var y = ty;
        // top , right, bottom, left
        var walls = [true, true, true, true];
        function show(color) {
            let xp = x * w;
            let yp = y * w;
            ctx.fillStyle = this.visited ? '#42a7f5' : 'gray';
            if (color) ctx.fillStyle = color;
            ctx.fillRect(xp, yp, w, w);
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            if (walls[0]) line(xp, yp, xp + w, yp); // Top
            if (walls[1]) line(xp, yp, xp, yp + w); // Left
            if (walls[2]) line(xp + w, yp + w, xp, yp + w); // Bottom
            if (walls[3]) line(xp + w, yp + w, xp + w, yp); // Right
            ctx.stroke();
        }
        function checkNeighbors() {
            var neighbors = [];
            let top = cells[getIndex(x, y - 1)];
            let bottom = cells[getIndex(x, y + 1)];
            let left = cells[getIndex(x - 1, y)];
            let right = cells[getIndex(x + 1, y)];
            if (top && !top.visited) {
                neighbors.push(top);
            }
            if (bottom && !bottom.visited) {
                neighbors.push(bottom);
            }
            if (left && !left.visited) {
                neighbors.push(left);
            }
            if (right && !right.visited) {
                neighbors.push(right);
            }
            let r = random(0, neighbors.length - 1);
            if (!neighbors[r]) return;
            let pos = neighbors[r].getPos();
            if (pos.x == x) {
                if (pos.y > y) {
                    neighbors[r].setWall(0, false);
                    setWall(2, false);
                } else {
                    neighbors[r].setWall(2, false);
                    setWall(0, false);
                }
            } else {
                if (pos.x > x) {
                    neighbors[r].setWall(1, false);
                    setWall(3, false);
                } else {
                    neighbors[r].setWall(3, false);
                    setWall(1, false);
                }
            }
            return neighbors[r];
        }
        function line(x1, y1, x2, y2) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }

        function setWall(index, value) {
            walls[index] = value;
        }
        this.show = show;
        this.visited = false;
        this.checkNeighbors = checkNeighbors;
        this.setWall = setWall;
        this.getWall = function(index) {
            return !walls[index];
        }
        this.getPos = function() {
            return { x, y };
        }
        this.getIndex = getIndex;
    }
    function Grid() {
        setup();
        function setup() {
            for (let y = 0; y < cols; y++) {
                for (let x = 0; x < rows; x++) {
                    let c = new Cell(x, y);
                    cells.push(c);
                }
            }
            current = cells[0];
        }
        function show() {
            clear();
            for (let c of cells) c.show();
            if (!current.visited) stack.push(current);
            current.visited = true;
            current.show('gold');
            var next = current.checkNeighbors();
            if (next) {
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                clearInterval(LOOP);
                initPlayer();
                return true;
            }
            return false;
        }
        function getCell(x, y) {
            let ix = getIndex(x, y);
            if (ix == -1) return;
            return cells[getIndex(x, y)];
        }
        this.show = show;
        this.getCell = getCell;
    }

    Maze.start = function(can){
    	canvas = can;
    	ctx = canvas.getContext('2d');
    	g = new Grid;
	    canvas.width = width;
	    canvas.height = height;
	    LOOP = setInterval(loop, 1000 / fps);
	    player = new Player;
    }
    var player;
    var canvas;
    var ctx;
    var fps = 60;
    var g;
    var LOOP;

    function loop() {
        g.show();
    }
    document.addEventListener('keydown', e => {
        if (e.key == 'Escape') clearInterval(LOOP);
    });

    function clear() {
        ctx.clearRect(-2, -2, width + 2, height + 2);
    }

    function Player() {
        var x = rows - 1;
        var y = cols - 1;
        var tempx = 0,
            tempy = 0;

        function step() {
            let tx = x + tempx;
            let ty = y + tempy;
            // top right bottom left
            let ok = false;
            if (!outofBounds(tx, ty) && (tempx || tempy)) {
                let c1 = g.getCell(x, y);
                if (c1) {
                    if (tempy) {
                        if (tempy > 0) {
                            console.log('down');
                            ok = c1.getWall(2);
                        } else {
                            console.log('up');
                            ok = c1.getWall(0);
                        }
                    } else if (tempx) {
                        if (tempx > 0) {
                            ok = c1.getWall(3);
                            console.log('right');
                        } else {
                            ok = c1.getWall(1);
                            console.log('left');
                        }
                    }
                }
            }
            if (ok) {
                x = tx;
                y = ty;
            }
            draw();
        }

        function addControls() {
            document.addEventListener('keydown', e => {
                if (e.key.toLowerCase() == 'w') {
                    tempy = -1;
                    tempx = 0;
                }
                if (e.key.toLowerCase() == 'a') {
                    tempx = -1;
                    tempy = 0;
                }
                if (e.key.toLowerCase() == 's') {
                    tempy = 1;
                    tempx = 0;
                }
                if (e.key.toLowerCase() == 'd') {
                    tempx = 1;
                    tempy = 0;
                }
            });
            document.addEventListener('keyup', e => {
                if (e.key.toLowerCase() == 'w') {
                    tempy = 0;
                }
                if (e.key.toLowerCase() == 'a') {
                    tempx = 0;
                }
                if (e.key.toLowerCase() == 's') {
                    tempy = 0;
                }
                if (e.key.toLowerCase() == 'd') {
                    tempx = 0;
                }
            });
        }
        addControls();
        function draw() {
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.arc(x * w + w / 2, y * w + w / 2, Math.max(w / 2 - 5, 3), 0, Math.PI * 2);
            ctx.fill();
        }

        function hasWon() {
            return x == 0 && y == 0;
        }
        this.step = step;
        this.draw = draw;
        this.hasWon = hasWon;
    }
    function initPlayer() {
        LOOP = setInterval(playerLoop, 1000 / 10);
    }
    function playerLoop() {
        clear();
        g.show();
        player.step();
        if (player.hasWon()) {
            clearInterval(LOOP);
            alert('have best day of your life :) also you won');
        }
    }

    function dontwait() {
        while (true) {
            if (g.show()) break;
        }
    }
})(this)