const tiles = {emty : 0, wall : -1, end : 42};

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

let dimensions = 10;

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
    spawnSnake();
    d.clear();
}

switchToWall();

let endPoints = [];
let avalibleMoves = [{y : 0, x : 1}, {y : 0, x : -1},
                                                {y : 1, x : 0}, {y : -1, x : 0}];

function distance(nowPos, endPos){
    return Math.abs(nowPos[0] - endPos[0]) + Math.abs(nowPos[1] - endPos[1]);
}

function choose(queue, endY, endX){
    //return queue.shift();
    let best = null;
    for (let el of queue){
        if (best === null || best[2] > distance(el, [endY, endX])){
            best = [el[0], el[1], distance(el, [endY, endX])];
        }
    }

    return [best[0], best[1]];
}

function isCorrect(position){
    return (position[0] >= 0 && position[0] < dimensions &&
        position[1] >= 0 && position[1] < dimensions &&
        plane[position[0]][position[1]] !== -1);
}

function Astar(startX, startY, endX, endY){

    let queue = [];
    let visited = [];

    let maxCost = dimensions * dimensions + 100;

    for (let y = 0; y<dimensions; y++) {
        let line = [];
        for (let x = 0; x<dimensions; x++){
            line.push([-1,-1, maxCost, false]);
        }
        visited.push(line);
    }

    visited[startY][startX][2] = 0;
    visited[startY][startX][3] = true;
    queue.push([startY, startX]);

    let res = [];
    let count = 0;
    while (queue.length > 0){
        let nowPos = choose(queue, endY, endX);

        let nextMoves = avalibleMoves.map(move =>
            [move.y + nowPos[0], move.x + nowPos[1]]);

        let possibleMoves = nextMoves.filter(isCorrect);

        for (let move of possibleMoves){
            if (!visited[move[0]][move[1]][3]){
                queue.push(move);
                sleep(delay * count);
                d.drawPixel(move[1] * pixelLen, move[0] * pixelLen, workPattern);
                visited[move[0]][move[1]][3] = true;
            }
            if(visited[move[0]][move[1]][2] > visited[nowPos[0]][nowPos[1]][2] + 1){
                visited[move[0]][move[1]] = [nowPos[0], nowPos[1], visited[nowPos[0]][nowPos[1]][2] + 1, true];

            }
        }

        if ((nowPos[0] === endY) && (nowPos[1] === endX)){
            let wayBack = nowPos;
            while ((wayBack[0] !== -1) && (wayBack[1] !== -1)){
                res.unshift(wayBack);
                wayBack = [visited[wayBack[0]][wayBack[1]][0], visited[wayBack[0]][wayBack[1]][1]];
            }
            break;
        }
    }
    return res;
}

document.getElementById("wall").onclick = switchToWall;
document.getElementById("end").onclick = switchToPointer;
document.getElementById("eraser").onclick = switchToEmty;
document.getElementById("clear").onclick = clear;

let pointsQueue = [];
const snakeLen = 3;
const delay = 100;

function sleep(ms) {
    const startTime = Date.now();
    let curTime = null;
    do{
        curTime = Date.now();
    }while (curTime - startTime < ms);
}

let nowSnakePos = [0,0];
let snakeRings = [];

let fullPath = [];

function spawnSnake(){
    snakeRings = [];
    for (let y = 0; y<dimensions; y++){
        for(let x = 0; x<dimensions; x++){
            if (plane[y][x] !== tiles.wall){
                nowSnakePos = [y, x];
                snakeRings.push([y, x]);
                drawSnake(snakeRings);
                return 0;
            }
        }
    }
    return -1;
}
function calculate(){
    let nowStartPoint = nowSnakePos;
    if (pointsQueue.length !== 0){
        for (let point of pointsQueue){
                fullPath.push(Astar(nowStartPoint[1], nowStartPoint[0],
                    point[1], point[0]));
                nowStartPoint = [point[1], point[0]];
        }
    }
    snake();
}

function drawSnake(nowSnake){
    for (let snakeRing of snakeRings){
        d.drawPixel(snakeRing[1] * pixelLen, snakeRing[0] * pixelLen, emptyPixel);
    }

    for (let snakeRing of nowSnake){
        d.drawPixel(snakeRing[1] * pixelLen, snakeRing[0] * pixelLen, snakePart);
    }

    if (nowSnake.length > 0){
        snakeRings = nowSnake;
        nowSnakePos = nowSnake[nowSnake.length -1];
    }
    //sleep(delay);
}

function snake(){
    for (let way of fullPath){
        for (let nowHead = 0; nowHead < way.length + snakeLen; nowHead++){
            let snakeToDraw = way.slice(Math.max(0, nowHead - snakeLen), Math.min(nowHead, way.length-1));
            setTimeout( () => {drawSnake(snakeToDraw);}, delay * nowHead);
        }
        pointsQueue.splice(pointsQueue.indexOf(way[way.length - 1]));
        fullPath.splice(fullPath.indexOf(way));
        d.drawPixel(way[way.length - 1][1], way[way.length - 1][0], emptyPixel);
    }
}

function mousDown(e){
    isMouseDown = true;
    const cnvBoundingRect = canvas.getBoundingClientRect();
    const x = e.clientX - cnvBoundingRect.left;
    const y = e.clientY - cnvBoundingRect.top;
    switch (nowState){
        case emptyPixel:
            if (plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] === tiles.end){
                let deletePos = [Math.floor(y / pixelLen), Math.floor(x / pixelLen)];
                if (pointsQueue.indexOf(deletePos > -1)){
                    pointsQueue.splice(pointsQueue.indexOf(deletePos));
                }
                calculate();
            }
            else if (plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] === tiles.wall){
                calculate();
            }

            plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = tiles.emty;
            break;
        case wallPattern:
            plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = tiles.wall;
            break;
        case snakePart:
            plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = tiles.end;
            pointsQueue.push([Math.floor(y / pixelLen), Math.floor(x / pixelLen)]);
            console.log(pointsQueue);
            calculate();
            break;
    }
    d.drawPixel(x ,y, nowState);
}

canvas.addEventListener("mousedown",mousDown);



