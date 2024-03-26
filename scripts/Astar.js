


const tiles = {emty : 0, wall : -1, snake : 1, end : 42};

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

nowState = tiles.wall;

function switchToWall(){
    nowState = tiles.wall;
    d.changeToWalls();
}

function switchToEmty(){
    nowState = tiles.emty;
    d.changeToEmpty();
}

function switchToPointer(){
    nowState = tiles.end;
    d.changeToPointer();
}

function clear(){
    plane = genPlane();
    d.clear();
}

let endPoints = [];
let avalibleMoves = [{y : 0, x : 1}, {y : 0, x : -1},
                                                {y : 1, x : 0}, {y : -1, x : 0}];

function choose(queue){
    return queue.pop();
}

function isCorrect(position){
    return (position[0] >= 0 && position[0] < dimensions &&
        position[1] >= 0 && position[1] < dimensions &&
        plane[position[0]][position[1]] !== -1);
}

function Astar(startX, startY, endX, endY){
    let queue = [];
    let visited = [];

    start = [startY, startX, 0];

    for (let y = 0; y<dimensions; y++){
        let line = [];
        for (let x = 0; x<dimensions; x++){
            line.push([y, x, Number.MAX_SAFE_INTEGER]);
        }

        visited.push(line);
    }


    queue.push(start);
    visited[startY][startX][2] = 0;

    while (queue.length > 0){
        let nowPos = choose(queue);

        if (nowPos[0] === endY && nowPos[1] === endX){

            console.log("yay");
            console.log(visited);
            let res = [];
            nowWay = nowPos;
            while (nowWay[0] !== startY && nowWay[1] !== startX){
                console.log(nowWay);
                nowWay = visited[nowWay[0]][nowWay[1]];
            }
            break;
        }

        let nowMoves = [];
        for (let move of avalibleMoves){
            let newPos = [nowPos[0] + move.y, nowPos[1] + move.x, nowPos[2] + 1];
            if (isCorrect(newPos)){
                nowMoves.push(newPos);
            }
        }
//TODO: you fool, redo all of this stuf
        for(let posMove of nowMoves){
            if (visited[posMove[0]][posMove[1]][2] === Number.MAX_SAFE_INTEGER){
                queue.push(posMove);
            }
            if(visited[posMove[0]][posMove[1]][2] > posMove[2]){
                visited[posMove[0]][posMove[1]][0] = nowPos[0];
                visited[posMove[0]][posMove[1]][1] = nowPos[1];
                visited[posMove[0]][posMove[1]][2] = posMove[2];
            }
        }
    }
    console.log("wtf");
}

document.getElementById("wall").onclick = switchToWall;
document.getElementById("end").onclick = switchToPointer;
document.getElementById("eraser").onclick = switchToEmty;
document.getElementById("clear").onclick = clear;

function mousDown(e){
    //alert('Fuck');
    isMouseDown = true;
    const cnvBoundingRect = canvas.getBoundingClientRect();
    const x = e.clientX - cnvBoundingRect.left;
    const y = e.clientY - cnvBoundingRect.top;
    plane[Math.floor(y / pixelLen)][Math.floor(x / pixelLen)] = nowState;
    d.drawPixel(x ,y);
}

canvas.addEventListener("mousedown",mousDown);



