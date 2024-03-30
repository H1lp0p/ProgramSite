const tiles = {emty : 0, wall : -1, end : 42};
const delay = 100;

let emptyPixel = "#2A2D43FF";
let snakePart = "#FF84E8FF"

const  wallImg = new Image();
wallImg.src = "../images/PixelPattern.png";
let wallPattern;
wallImg.onload = () => {
    wallPattern = context.createPattern(wallImg, "repeat");
}

const workImg = new Image();
workImg.src = "../images/WorkingPattern.png"
let workPattern;
workImg.onload = () => {
    workPattern = context.createPattern(workImg, "repeat");
}

let dimensions = 11;

let canvas = document.getElementById("canvas");
let d = new DCanvas(canvas, dimensions);

const pixelLen = canvas.height / dimensions;

function genPlane(){
    let res = []
    for (let y = 0; y<dimensions; y++){
        let line = [];

        for (let x = 0; x<dimensions; x++){
            line.push(tiles.emty);
        }
        res.push(line);
    }

    return res;
}

//TODO: genLab
function genLab(){
    let hallDimension = Math.floor(dimensions/2) + 1;


}

let plane = [];
plane = genPlane();
let nowState;



function switchToWall(){
    nowState = wallPattern;
}

function switchToEmty(){
    nowState = emptyPixel;
}

function switchToPointer(){
    nowState = snakePart;
}

function clear(){
    plane = genPlane();
    d.clear();
}

function pixel(y, x, state){
    d.drawPixel(x * pixelLen, y * pixelLen, state);
}

let endPoints = [];
let avalibleMoves = [{y : 0, x : 1}, {y : 0, x : -1},
    {y : 1, x : 0}, {y : -1, x : 0}];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function Astar(startY, startX, endY, endX){

    function distance(nowPos, endPos){
        return Math.abs(nowPos[0] - endPos[0]) + Math.abs(nowPos[1] - endPos[1]);
    }
    function choose(queue, endY, endX){
        let best = queue[0];
        for (let el of queue){
            if (distance(best, [endY, endX]) >= distance(el, [endY, endX])){
                best = el;
            }
        }
        return best;
    }

    function isCorrect(position){
        return (position[0] >= 0 && position[0] < dimensions &&
            position[1] >= 0 && position[1] < dimensions &&
            plane[position[0]][position[1]] !== -1);
    }

    let res = [];
    let queue = [];
    let visited = [];

    for (let y = 0; y<dimensions; y++){
        let line = [];
        for (let x = 0; x<dimensions; x++){
            line.push([-1, -1, dimensions * dimensions + 100, false]);
        }
        visited.push(line);
    }

    queue.push([startY, startX]);
    visited[startY][startX] = [0, 0, 0, true];
    let wave = 0;
    while(queue.length > 0){
        let nowPos = choose(queue, endY, endX);
        queue.splice(queue.indexOf(nowPos),1);
        visited[nowPos[0]][nowPos[1]][3] = true;



        pixel(nowPos[0], nowPos[1], emptyPixel);

        let moves = avalibleMoves.map(move =>
        [move.y + nowPos[0], move.x + nowPos[1]]);

        moves = moves.filter(isCorrect);
        for (let nowMove of moves){
            if (!visited[nowMove[0]][nowMove[1]][3]){
                queue.push(nowMove);
                visited[nowMove[0]][nowMove[1]][3] = true;
                pixel(nowMove[0], nowMove[1], workPattern);

                await sleep(100);
            }
            if (visited[nowMove[0]][nowMove[1]][2] > visited[nowPos[0]][nowPos[1]][2] + 1){
                visited[nowMove[0]][nowMove[1]] = [nowPos[0], nowPos[1], visited[nowPos[0]][nowPos[1]][2] + 1, visited[nowMove[0]][nowMove[1]][3]];
            }
        }

        if (nowPos[0] === endY && nowPos[1] === endX){
            let wayBack = nowPos;
            while (wayBack[0] !== startY || wayBack[1] !== startX){
                res.unshift(wayBack);
                wayBack = [visited[wayBack[0]][wayBack[1]][0], visited[wayBack[0]][wayBack[1]][1]];
            }
            res.unshift(wayBack);
            break;
        }

        console.log(nowPos[0], nowPos[1]);
        for (let el of queue){
            console.log(el);
            console.log(visited[el[0]][el[1]]);
        }
        console.log("--------------");

    }
    return res;

}

function drawSnake(way, nowHead, len){
    let beginSnake = Math.max(0, nowHead - len);
    let  endSnake = Math.min(way.length-1, nowHead);


    let nowSnake = way.slice(Math.max(0, nowHead - len), Math.min(way.length-1, nowHead));
    for (let nowRing of nowSnake){
        pixel(nowRing[0], nowRing[1], snakePart);
    }

    if(nowHead <= way.length + len && nowHead >= - len){
        setTimeout( () => {nowSnake( way, nowHead + 1, len)}, Math.max(0, nowHead) * 100);
    }
}

async function ShowPath(startY, startX, endY, endX){
    let way = await Astar(startY, startX, endY, endX);
    console.log(way);
    let wave = 0;
    for (let nowPix of way){
        setTimeout(() => {pixel(nowPix[0], nowPix[1], snakePart)}, 100*wave);
        wave += 1;
    }
}

document.getElementById("wall").onclick = switchToWall;
document.getElementById("end").onclick = switchToPointer;
document.getElementById("eraser").onclick = switchToEmty;
document.getElementById("clear").onclick = clear;

function mousDown(e){
    isMouseDown = true;
    const cnvBoundingRect = canvas.getBoundingClientRect();
    const x = e.clientX - cnvBoundingRect.left;
    const y = e.clientY - cnvBoundingRect.top;
    switch (nowState){
        case emptyPixel:
            plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = tiles.emty;
            break;
        case wallPattern:
            plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = tiles.wall;
            break;
        case snakePart:
            plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = tiles.end;
            break;
    }
    d.drawPixel(x ,y, nowState);
}

canvas.addEventListener("mousedown",mousDown);