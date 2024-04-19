function DCanvas(el) {
    const numberOfCluster = document.getElementById("numberOfCluster");
    const clusterNumDemo = document.getElementById("clusterNumDemo");
    let numOfClust;
    numberOfCluster.oninput = function () {
        clusterNumDemo.innerHTML = this.value;
        numOfClust = parseInt(numberOfCluster.value);
    }
    let data = [];
    ctx = el.getContext("2d");

    let pixelColor = "#FF84E8FF";

    function getMousePos(el, evt) {
        let rect = el.getBoundingClientRect();
        return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
    }

    el.addEventListener("mousedown", function (evt) {
        is_mouse_down = true;
        ctx.beginPath();
    })

    el.addEventListener("mousedown", function (evt) {
        if (is_mouse_down) {
            ctx.fillStyle = pixelColor;
            ctx.rect(getMousePos(el, evt).x, getMousePos(el, evt).y, 10, 10);
            data.push([getMousePos(el, evt).x, getMousePos(el, evt).y]);
            ctx.fill();
        }
    })

    this.clear = function () {
        ctx.clearRect(0, 0, el.width, el.height);
        data = [];
    }

    function clearDr() {
        ctx.fillStyle = "rgb(42, 45, 67)";
        ctx.fillRect(0, 0, el.width, el.height);
    }

    function dist(x1, y1, x2, y2) {
        return Math.abs(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomNormal(mu, sigma) {
        return [random(mu[0] - sigma[0], mu[0] + sigma[0]).toFixed(2), random(mu[1] - sigma[1], mu[1] + sigma[1]).toFixed(2)];
    }

    this.claster = function () {
        if(data.length !== 0)
        {
            let centres = Array(numOfClust);
            for (let i = 0; i < numOfClust; i++) {
                centres[i] = Array(numOfClust);
            }
            let res = [];
            let mean = Array(2);
            let disp = Array(2);
            let sumA = 0;
            let sumB = 0;
            for (let i = 0; i < data.length; i++) {
                sumA += data[i][0];
                sumB += data[i][1];
            }
            mean[0] = sumA / data.length;
            mean[1] = sumB / data.length;
            let sumDispA = 0;
            let sumDispB = 0;
            for (let i = 0; i < data.length; i++) {
                sumDispA += Math.abs(data[i][0] - mean[0]);
                sumDispB += Math.abs(data[i][1] - mean[1]);
            }
            disp[0] = sumDispA / data.length;
            disp[1] = sumDispB / data.length;
            for (let i = 0; i < numOfClust; i++) {
                centres[i][0] = randomNormal(mean, disp)[0];
                centres[i][1] = randomNormal(mean, disp)[1];
            }
            for (let z = 0; z < 100; z++) {
                let x = [];
                for (let i = 0; i < numOfClust; i++) {
                    x[i] = new Array();
                }
                for (let i = 0; i < data.length; i++) {
                    let range = [];
                    let min = 9999;
                    let minInd = 0;
                    for (let j = 0; j < numOfClust; j++) {
                        range.push(dist(centres[j][0], centres[j][1], data[i][0], data[i][1]));
                    }
                    for (let j = 0; j < numOfClust; j++) {
                        if (min > range[j]) {
                            min = range[j];
                            minInd = j;
                        }
                    }
                    x[minInd].push(data[i]);
                }
                for (let i = 0; i < numOfClust; i++) {
                    let sumX = 0;
                    let sumY = 0;
                    for (let j = 0; j < x[i].length; j++) {
                        sumX += x[i][j][0];
                        sumY += x[i][j][1];
                    }
                    centres[i][0] = sumX / x[i].length;
                    centres[i][1] = sumY / x[i].length;
                }
                res = x;
                for (let u = 0; u < numOfClust; u++) {
                    if (res[u].length === 0) {
                        centres[u][0] = randomNormal(mean, disp)[0];
                        centres[u][1] = randomNormal(mean, disp)[1];
                        z--;
                    }
                }
            }
            clearDr();
            for (let i = 0; i < res.length; i++) {
                for (let j = 0; j < res[i].length; j++) {
                    if (i === 0) {
                        ctx.fillStyle = "aqua";
                        ctx.strokeStyle = "aqua";
                    }
                    if (i === 1) {
                        ctx.fillStyle = "red";
                        ctx.strokeStyle = "red";
                    }
                    if (i === 2) {
                        ctx.fillStyle = "green";
                        ctx.strokeStyle = "green";
                    }
                    if (i === 3) {
                        ctx.fillStyle = "yellow";
                        ctx.strokeStyle = "yellow";
                    }
                    if (i === 4) {
                        ctx.fillStyle = "white";
                        ctx.strokeStyle = "white";
                    }
                    if (i === 5) {
                        ctx.fillStyle = "black";
                        ctx.strokeStyle = "black";
                    }
                    if (i === 6) {
                        ctx.fillStyle = "orange";
                        ctx.strokeStyle = "orange";
                    }
                    if (i === 7) {
                        ctx.fillStyle = "magenta";
                        ctx.strokeStyle = "magenta";
                    }
                    if (i === 8) {
                        ctx.fillStyle = "DarkSlateGray";
                        ctx.strokeStyle = "DarkSlateGray";
                    }
                    if (i === 9) {
                        ctx.fillStyle = "SaddleBrown";
                        ctx.strokeStyle = "SaddleBrown";
                    }
                    ctx.fillRect(res[i][j][0], res[i][j][1], 10, 10);
                    ctx.beginPath();
                    ctx.moveTo(res[i][j][0], res[i][j][1]);
                    ctx.lineTo(centres[i][0], centres[i][1]);
                    ctx.stroke();
                }
            }
        }
    }
}

const d = new DCanvas(document.getElementById("canvas"));
function updateStats() {
    d.clear();
}