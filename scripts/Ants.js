let wallColor = "#7F49C4FF";
let emptyCell = "#2A2D43FF";

let labSize = 11;

let canvas = document.getElementById("canvas");
let d = new DCanvas(canvas, labSize);
let cellLen = canvas.height / labSize;
let lab = genLab(labSize);

function genLab(dimensions) {

    const tiles = {emty : 0, wall : -1, end : 42};
    function check(pos) {
        return (pos[0] >= 0 && pos[0] < dimensions) && (pos[1] >= 0 && pos[1] < dimensions) && !visited[pos[0]][pos[1]];
    }

    let hallDimension = Math.floor(dimensions / 2) + 1;
    let newPlane = [];

    for (let y = 0; y<dimensions; y++){
        let line = [];

        for (let x = 0; x<dimensions; x++){
            line.push(tiles.emty);
        }
        newPlane.push(line);
    }


    let startPos = [0, 0];
    let queue = [];
    let visited = [];

    for (let y = 1; y < dimensions; y += 2) {
        for (let x = 1; x < dimensions; x += 2) {
            newPlane[y - 1][x] = tiles.wall;
            newPlane[y + 1][x] = tiles.wall;
            newPlane[y][x - 1] = tiles.wall;
            newPlane[y][x + 1] = tiles.wall;
            newPlane[y][x] = tiles.wall;
        }
    }


    for (let y = 0; y < dimensions; y++) {
        let line = [];
        for (let x = 0; x < dimensions; x++) {
            line.push(false);
        }
        visited.push(line);
    }

    queue.push(startPos);
    visited[startPos[0]][startPos[1]] = true;

    let avalibleMove = [[2, 0], [-2, 0], [0, 2], [0, -2]];

    do {
        let nowPos = queue[queue.length - 1];
        let posibleMoves = avalibleMove.map(x => [x[0] + nowPos[0], x[1] + nowPos[1]]);
        posibleMoves = posibleMoves.filter(check);

        //console.log(nowPos, posibleMoves);

        if (posibleMoves.length > 0) {
            let randInd = Math.floor(Math.random() * posibleMoves.length);

            let nextMove = posibleMoves[randInd];

            for (let y = 0; y <= Math.abs(nowPos[0] - nextMove[0]); y++) {
                newPlane[nowPos[0] + y * (nextMove[0] - nowPos[0]) / 2][nowPos[1]] = tiles.emty;
                visited[nowPos[0] + y * (nextMove[0] - nowPos[0]) / 2][nowPos[1]] = true;
            }
            for (let x = 0; x <= Math.abs(nowPos[1] - nextMove[1]); x++) {
                newPlane[nowPos[0]][nowPos[1] + x * (nextMove[1] - nowPos[1]) / 2] = tiles.emty;
                visited[nowPos[0]][nowPos[1] + x * (nextMove[1] - nowPos[1]) / 2] = true;
            }
            //queue.push([nowPos[0] + (nextMove[0] - nowPos[0])/2, nowPos[1] + (nextMove[1] - nowPos[1])/2]);
            queue.push(nextMove);
        } else {
            queue.pop();
        }

    } while (queue.length > 0);

    return newPlane;
}

function renderLab(lab){
    d.clear();
    for (let y = 0; y<labSize; y++){
        for (let x = 0; x<labSize; x++){
            switch (lab[y][x]){
                case (-1) :
                    d.drawPixel(y* cellLen, x* cellLen, wallColor);
                    break;
                default:
                    d.drawPixel(y* cellLen, x* cellLen, emptyCell, false);
                    break;
            }
        }
    }
}

let colonyCount = 10;

let ants = []
function spawnColony(){
    for (let ant = 0; ant<colonyCount; ant++){
        ants.push([0,0]);
    }
}