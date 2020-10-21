const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startbtn');
const mineoutput = document.getElementById('mineoutput');
const cellflagmarkedoutput = document.getElementById('cellflagmarkedoutput');
const covercelloutput = document.getElementById('covercelloutput');
const opencelloutput = document.getElementById('opencelloutput');

let score = 0;

// rules ans close event handlers
rulesBtn.addEventListener('click', ()=> {
    rules.classList.add('show');
});

closeBtn.addEventListener('click', ()=> {
    rules.classList.remove('show');
});

startBtn.addEventListener('click', ()=> {
    console.log('ciao a sto cazzo !!');
    initGame();
})

// object for the game --------------------------------------------------------
let gameGride = null;

const game = {
    column : 20,
    row : 15,
    w : 40,
    mines : 100,
    flag : 0,
    cover: 0,
    open: 0
}

class Cell {
    constructor(){
        this.cover = true;
        this.mine = false;
        this.number = 0;
        this.marked = false;
    }
}

const positions = [[-1, -1], [0, -1], [1, -1], 
                    [-1, 0], [1, 0],
                    [-1, 1], [0, 1], [1, 1]];
// general function -----------------------------------------------------------

// create a gride with empty cell base
function createGride (row , col){
    arr = [];
    for (let y = 0;  y < row;  y++){
        arr.push([]);
        for (let x=0; x<col; x++){
            arr[y].push(new Cell());
        }
    }
    return arr;
}

function drawGride(ctx, gameGride){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    for (let x=0; x<gameGride.length; x++){
        for (let y=0; y<gameGride[x].length; y++){
            // draw the grid
            ctx.beginPath();
            ctx.rect(y*game.w, x*game.w, game.w, game.w);
            ctx.closePath();
            ctx.stroke();
            // draw background where there are bombs
            // only for debug purpose
            // drawing black bomb
            //if (gameGride[x][y].mine == true){
            //    ctx.fillStyle = "black";
            //    ctx.fillRect(y*game.w, x*game.w, game.w, game.w);
            //}

            if (gameGride[x][y].cover == false) {
                // drawing cell background
                ctx.fillStyle = "#d0c4e7";
                ctx.fillRect(y*game.w+1, x*game.w+1, game.w-2, game.w-2);
            }

            if (gameGride[x][y].number > 0){
                // drawing cell background
                ctx.fillStyle = "#d0c4e7";
                ctx.fillRect(y*game.w+1, x*game.w+1, game.w-2, game.w-2);
                // drawing cell text
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText(gameGride[x][y].number,y*game.w+game.w/2,x*game.w+game.w/2+5);
            }

            if (gameGride[x][y].marked == true){
                // drawing cell background for flag cell
                ctx.fillStyle = "green";
                ctx.fillRect(y*game.w+1, x*game.w+1, game.w-2, game.w-2);
            }

        }
    }
}

function placeBomb(arr, bombs){
    for (let x=0; x<bombs; x++){
        while (true){
            let j = Math.floor(Math.random()*game.column);
            let z = Math.floor(Math.random()*game.row);
            if (arr[z][j].mine == false){
                arr[z][j].mine = true;
                break;
            }
        }

    }
}

// detect if the cell in position delta position is inside
// delta position respect the given position 'cellClicked'
function isInside(cellClicked, dp){  // dp = delta position
    if ((cellClicked.x + dp[0] >=0 & cellClicked.x + dp[0] < gameGride[0].length) &
        (cellClicked.y + dp[1] >=0 & cellClicked.y + dp[1] < gameGride.length)){
        return true;
    }
    return false;
}

function countBomb(cellClicked, gride){
    let bombNumber = 0;

    for (let x of positions){
        if (isInside(cellClicked, x)){
            let cell = gride[cellClicked.y + x[1]][cellClicked.x + x[0]];
            if (cell.mine){
                bombNumber ++;
            }
        }
    }

    return bombNumber;
}

function getMousePos(cv, evt) {
    let rect = cv.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// @param x y position of the given cell
// function for serch free cell niear the given one
//
function serchFreeCell(x, y){
    // check if the given point is inside the grid
    if (x < 0 || x >= gameGride[0].length || y < 0 || y >= gameGride.length) {
        return;
    }


    // check if the given point have an alredy open cell
    if (gameGride[y][x].cover == false){
        return;
    }

    gameGride[y][x].cover = false;
    game.cover--;
    game.open++;
    updateOutput();

    let countedMine = countBomb({x, y}, gameGride)
    if (countedMine > 0) {
        gameGride[y][x].number = countedMine;
        gameGride[y][x].cover = false;
        updateOutput();
        return;
    }

    for (let delta = 0; delta < positions.length; delta++) {
        serchFreeCell(x+positions[delta][0], y+positions[delta][1]);
    }

}

function drawHallBombs(){

    for (let x=0; x<gameGride.length; x++){
        for (let y=0; y<gameGride[x].length; y++){
            if (gameGride[x][y].mine == true){
                ctx.fillStyle = "red";
                ctx.fillRect(y*game.w, x*game.w, game.w, game.w);
            }
        }
    }
}

// evet handler
canvas.addEventListener('click', (e)=>{
    let mousePos = getMousePos(canvas, e);
    let cellClicked = {x:0, y:0};
    cellClicked.x = Math.floor(mousePos.x / game.w);
    cellClicked.y = Math.floor(mousePos.y / game.w);
    console.log("mouse x: " + cellClicked.x + " mouse y: " + cellClicked.y);
    console.log("bomb: " + countBomb(cellClicked, gameGride));

    // check if clicked cell have a bomb you lose
    if (gameGride[cellClicked.y][cellClicked.x].mine == true){
        console.log("te ghe perso mona!!");
        drawHallBombs();
        return;
    } else {
        // check if near cell have a bomb and add the number in clicker cell
        if (countBomb(cellClicked, gameGride) > 0){
            gameGride[cellClicked.y][cellClicked.x].number = countBomb(cellClicked, gameGride);
            gameGride[cellClicked.y][cellClicked.x].cover = false; 
            updateOutput();
        }
    }
    //start recursion serch
    if (gameGride[cellClicked.y][cellClicked.x].cover == true){
        console.log('prima chiamata funzione serch');
        serchFreeCell(cellClicked.x, cellClicked.y);
    }
    // redraw the grid after click chenging
    drawGride(ctx, gameGride);
})

canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let pointRClick = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    let cellClicked = {x:0, y:0};
    cellClicked.x = Math.floor(pointRClick.x / game.w);
    cellClicked.y = Math.floor(pointRClick.y / game.w);
    console.log(cellClicked);
    gameGride[cellClicked.y][cellClicked.x].marked = !gameGride[cellClicked.y][cellClicked.x].marked;
    drawGride(ctx, gameGride);
    updateOutput();
})

//
// interface function ---------------------------------------------------------
//

function updateOutput (){
    let flag = 0;
    let coverCell = 0;
    let openCell = 0;
    
    gameGride.forEach(row => {
        row.forEach(element =>{
            if (element.marked == true){
                flag ++ ;
            }
            if (element.cover == true){
                coverCell ++ ;
            }
        })
    })

    coverCell = coverCell - game.mines;
    openCell = game.row * game.column - coverCell - game.mines;
    game.flag = flag;
    game.cover = coverCell;
    game.open = openCell;


    mineoutput.innerHTML = "mines: " + game.mines.toString();
    cellflagmarkedoutput.innerHTML = "flag: " + game.flag.toString();
    covercelloutput.innerHTML = "cover cells: " + game.cover.toString();
    opencelloutput.innerHTML = "open cells: " + game.open.toString();
}

//
// game start here ------------------------------------------------------------
//
function initGame(){
    gameGride = createGride(game.row, game.column);
    placeBomb(gameGride, game.mines);
    drawGride(ctx, gameGride);
    updateOutput();
}

initGame();
