const tiles = {emty : 0, wall : -1, end : 42};
const delay = 50;

let emptyPixel = "#2A2D43FF";
let snakePart = "#FF84E8FF";

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

let dimensions = 21;

let canvas = document.getElementById("canvas");
let d = new DCanvas(canvas, dimensions);

let log = document.getElementById("log");

let pixelLen = canvas.height / dimensions;

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
function genLab(){

    function check(pos){
        return (pos[0] >= 0 && pos[0]<dimensions) && (pos[1] >= 0 && pos[1]<dimensions) && !visited[pos[0]][pos[1]];
    }

    let hallDimension = Math.floor(dimensions/2) + 1;
    let newPlane = genPlane();
    let startPos = [0,0];
    let queue = [];
    let visited = [];

    for (let y = 1; y<dimensions; y+=2){
        for (let x = 1; x<dimensions; x+=2){
            newPlane[y-1][x] = tiles.wall;
            newPlane[y+1][x] = tiles.wall;
            newPlane[y][x-1] = tiles.wall;
            newPlane[y][x+1] = tiles.wall;
            newPlane[y][x] = tiles.wall;
        }
    }


    for (let y = 0; y<dimensions; y++) {
        let line = [];
        for (let x = 0; x < dimensions; x++) {
            line.push(false);
        }
        visited.push(line);
    }

    queue.push(startPos);
    visited[startPos[0]][startPos[1]] = true;

    let avalibleMove = [[2, 0], [-2, 0], [0, 2], [0, -2]];

    do{
      let nowPos = queue[queue.length-1];
      let posibleMoves = avalibleMove.map(x => [x[0] + nowPos[0], x[1] + nowPos[1]]);
      posibleMoves = posibleMoves.filter(check);

      //console.log(nowPos, posibleMoves);

      if (posibleMoves.length > 0){
          let randInd = Math.floor(Math.random()*posibleMoves.length);

          let nextMove = posibleMoves[randInd];

          for (let y = 0; y<=Math.abs(nowPos[0] - nextMove[0]); y++){
              newPlane[nowPos[0] + y*(nextMove[0] - nowPos[0])/2][nowPos[1]] = tiles.emty;
              visited[nowPos[0] + y*(nextMove[0] - nowPos[0])/2][nowPos[1]] = true;
          }
          for (let x = 0; x<=Math.abs(nowPos[1] - nextMove[1]); x++){
              newPlane[nowPos[0]][nowPos[1] + x*(nextMove[1] - nowPos[1])/2] = tiles.emty;
              visited[nowPos[0]][nowPos[1] + x*(nextMove[1] - nowPos[1])/2] = true;
          }
          //queue.push([nowPos[0] + (nextMove[0] - nowPos[0])/2, nowPos[1] + (nextMove[1] - nowPos[1])/2]);
          queue.push(nextMove);
      }
      else {
          queue.pop();
      }

    }while(queue.length > 0);

    return newPlane;

}

function showPlane(plane){
    d.drawGrid();
    //console.log(plane);
    for (let y = 0; y<dimensions;y++){
        for(let x = 0; x<dimensions; x++){
            pixel(y,x, emptyPixel);
            switch (plane[y][x]){
                case tiles.wall:
                    pixel(y, x, wallPattern);
                    break;
                case tiles.end:
                    pixel(y, x, snakePart);
                    break;
                default:
                    break;
            }
        }
    }
}

let plane = [];
plane = genPlane();
let nowState;

function pixel(y, x, state){
    d.drawPixel(x * pixelLen, y * pixelLen, state);
}

let avalibleMoves = [{y : 0, x : 1}, {y : 0, x : -1},
    {y : 1, x : 0}, {y : -1, x : 0}];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function Astar(startY, startX, endY, endX){

    function distance(nowPos, endPos){
        return Math.abs(nowPos[0] - endPos[0]) + Math.abs(nowPos[1] - endPos[1]);
        //return Math.sqrt((nowPos[0] - endPos[0]) ** 2 + (nowPos[1] - endPos[1]) ** 2);
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

        //pixel(nowPos[0], nowPos[1], emptyPixel);

        let moves = avalibleMoves.map(move =>
        [move.y + nowPos[0], move.x + nowPos[1]]);

        moves = moves.filter(isCorrect);
        for (let nowMove of moves){
            if (!visited[nowMove[0]][nowMove[1]][3]){
                queue.push(nowMove);
                visited[nowMove[0]][nowMove[1]][3] = true;
                pixel(nowMove[0], nowMove[1], workPattern);
                await sleep(delay);
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

function switchToWall(){
    nowState = wallPattern;
}

function switchToEmty(){
    nowState = emptyPixel;
}

function switchToPointer(){
    nowState = snakePart;
}

function grid(){
    d.drawGrid();
}

function clear(){
    endPoints = [];
    logPoints(endPoints);
    plane = genPlane();
    showPlane(plane);
}

function labirint(){
    endPoints = [];
    plane = genLab();
    showPlane(plane);
}
async function path(){
    if (endPoints.length >= 2){
        let begin = endPoints[0];
        let nowEnd = 1;
        while(nowEnd < endPoints.length){
            let end = endPoints[nowEnd];
            let way = await Astar(begin[0], begin[1], end[0], end[1]);
            if (way.length === 0){
                logStr(`No path from ${begin} to ${end}`);
                await sleep(2000);
            }
            else{
                for (let nowPix of way){
                    pixel(nowPix[0], nowPix[1], snakePart);
                    console.log(nowPix);
                    await  sleep(delay);
                }
                begin = endPoints[nowEnd];
            }
            nowEnd +=1;
        }
        logStr("Complete!\n");
    }
    else{
        logStr("Set target points ([Target point] button)");
    }
}

document.getElementById("lab").onclick = labirint;
document.getElementById("wall").onclick = switchToWall;
document.getElementById("end").onclick = switchToPointer;
document.getElementById("eraser").onclick = switchToEmty;
document.getElementById("clear").onclick = clear;
document.getElementById("start").onclick = path;

function logPoints(points){
    let str = "";
    for (let point of points){
        str += "-> Target point: [" + point[0] + ", " + point[1]+"]\n";
    }
    log.innerText = str;
}

function logStr(str){
    log.innerText = str;
}

let endPoints = [];
function pointController(y, x){
    if (plane[y][x] === tiles.end){
        plane[y][x] = tiles.emty;
        endPoints.splice(endPoints.indexOf([y,x]));
        logPoints(endPoints);
        pixel(y, x, emptyPixel);
    }
    else if (plane[y][x] === tiles.emty){
        plane[y][x] = tiles.end;
        endPoints.push([y,x]);
        pixel(y ,x, nowState);
        logPoints(endPoints);
    }
    else{
        logStr("Error...\n");
    }
}

function wallController(y, x){
    if (plane[y][x] === tiles.emty){
        plane[y][x] = tiles.wall;
        pixel(y, x, wallPattern);
    }
    else if (plane[y][x] === tiles.wall){
        plane[y][x] = tiles.emty;
        pixel(y, x, emptyPixel);
    }
    else {
        logStr("->You can't place wall here.\n");
    }
}

function emtpyPixelController(y, x){
    if (plane[y, x] === tiles.end){
        pointController(y,x);
    }
    else{
        plane[y][x] = tiles.emty;
        pixel(y, x, emptyPixel);
    }
}

function updateStats(){
    pixelLen = parseInt(canvas.height / dimensions);
    canvas.height = pixelLen * dimensions;
    canvas.width = pixelLen * dimensions;
    clear();
    d.updateCanvSize();
}

function mousDown(e){
    isMouseDown = true;
    const cnvBoundingRect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - cnvBoundingRect.left) / pixelLen);
    const y = Math.floor((e.clientY - cnvBoundingRect.top) / pixelLen);
    switch (nowState){
        case emptyPixel:
            emtpyPixelController(y,x);
            break;
        case wallPattern:
            wallController(y, x);
            break;
        case snakePart:
            pointController(y,x);
            break;
    }
}

updateStats();
canvas.addEventListener("mousedown",mousDown);