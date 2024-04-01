function DCanvas(el) {
    let cities = [];
    ctx = el.getContext("2d");
    el.width = 1000;
    el.height = 1000;

    function getMousePos(el, evt) {
        var rect = el.getBoundingClientRect();
        return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
    }

    el.addEventListener("mousedown", function (evt) {
        is_mouse_down = true;
        ctx.beginPath();
    })

    el.addEventListener("mousedown", function (evt) {
        if (is_mouse_down) {
            ctx.fillStyle = "violet";
            ctx.rect(getMousePos(el, evt).x, getMousePos(el, evt).y, 10, 10);
            cities.push([getMousePos(el, evt).x, getMousePos(el, evt).y]);
            ctx.fill();
            if (cities.length > 1) {
                for (let i = 0; i < cities.length - 1; i++) {
                    for (let j = i + 1; j < cities.length; j++) {
                        ctx.beginPath();
                        ctx.strokeStyle = "violet";
                        ctx.moveTo(cities[i][0], cities[i][1]);
                        ctx.lineTo(cities[j][0], cities[j][1]);
                        ctx.stroke();
                    }
                }
            }
        }
    })

    this.clear = function () {
        ctx.clearRect(0, 0, el.width, el.height);
        cities = [];
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

    function genPopulation(cities, population) {
        for (let i = 0; i < population.length; i++) {
            let temp = Array();
            for (let i = 0; i < cities.length; i++) {
                temp.push(cities[i]);
            }
            population[i][0] = cities[0];
            population[i][population.length - 1] = cities[0];
            while (temp.length > 1) {
                let index = random(1, temp.length);
                population[i].push(temp[index]);
                temp.slice(index, 1);
            }
        }
        return population;
    }

    function pathLen(pathLength, population) {
        for (let i = 0; i < population.length; i++) {
            let length = 0;
            for (let j = 0; j < population.length - 1; j++) {
                length += dist(population[i][j][0], population[i][j][1], population[i][j + 1][0], population[i][j + 1][1]);
            }
            pathLength.push(length);
        }
        return pathLength;
    }

    this.path = function () {
        let population = Array(cities.length ** 2);
        for (let i = 0; i < population.length; i++) {
            population[i] = [];
        }
        population = genPopulation(cities, population);
        let pathLength = Array(population.length);
        pathLength = pathLen(pathLength, population);

    }
}

const c = new DCanvas(document.getElementById("canv"));