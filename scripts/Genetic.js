function DCanvas(el) {
    let cities = [];
    ctx = el.getContext("2d");
    el.width = 1000;
    el.height = 1000;
    let mutationPercent = 90;

    function getMousePos(el, evt) {
        var rect = el.getBoundingClientRect();
        return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
    }

    el.addEventListener("mousedown", function (evt) {
        is_mouse_down = true;
        ctx.beginPath();
        if (is_mouse_down) {
            add(evt);
        }
    })

    function add(evt) {
        ctx.fillStyle = "violet";
        ctx.lineWidth = 1;
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

    function clear() {
        ctx.fillStyle = "rgb(42, 45, 67)";
        ctx.fillRect(0, 0, el.width, el.height);
    }

    function create() {
        clear();
        ctx.lineWidth = 1;
        for (let i = 0; i < cities.length; i++) {
            ctx.fillStyle = "violet";
            ctx.fillRect(cities[i][0], cities[i][1], 10, 10);
        }
        ctx.fillStyle = "white";
        ctx.fillRect(cities[0][0], cities[0][1], 10, 10);
        ctx.strokeStyle = "violet";
        for (let i = 0; i < cities.length - 1; i++) {
            for (let j = i + 1; j < cities.length; j++) {
                ctx.beginPath();
                ctx.moveTo(cities[i][0], cities[i][1]);
                ctx.lineTo(cities[j][0], cities[j][1]);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    function drawPath(best, i) {
        for (let j = 0; j < best[i].length - 2; j++) {
            ctx.beginPath();
            ctx.strokeStyle = "cyan";
            ctx.moveTo(best[i][j][0], best[i][j][1]);
            ctx.lineTo(best[i][j + 1][0], best[i][j + 1][1]);
            ctx.stroke();
            ctx.closePath();
        }
    }

    function draw(best) {
        let milsec = 100;
        for (let i = 0; i < best.length; i++) {
            setTimeout(() => {
                create();
            }, milsec);
            // clear();
            // create();
            setTimeout(() => {
                ctx.lineWidth = 5;
            }, milsec);
            setTimeout(() => {
                drawPath(best, i);
            }, milsec);
            milsec += 100;
        }
    }

    this.clearAll = function () {
        ctx.fillStyle = "rgb(42, 45, 67)";
        ctx.fillRect(0, 0, el.width, el.height);
        cities = [];
    }

    function dist(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function merge(x, y) {
        let ind = random(1, cities.length);
        let child1 = Array();
        let child2 = Array();

        for (let i = 0; i < ind; i++) {
            child1.push(x[i]);
            child2.push(y[i]);
        }
        for (let i = ind; i < y.length - 1; i++) {
            let flag1 = 0;
            let flag2 = 0;
            for (let j = 0; j < child1.length; j++) {
                if (y[i][0] === child1[j][0] && y[i][1] === child1[j][1]) {
                    flag2 = 1;
                }
            }
            if (flag2 === 0) {
                child1.push(y[i]);
            }
        }
        for (let i = ind; i < x.length - 1; i++) {
            let flag1 = 0;
            let flag2 = 0;
            for (let j = 0; j < child2.length; j++) {
                if (x[i][0] === child2[j][0] && x[i][1] === child2[j][1]) {
                    flag1 = 1;
                }
            }
            if (flag1 === 0) {
                child2.push(x[i]);
            }
        }
        if(child1.length !== y.length - 2) {
            let flag = 0;
            for (let i = 0; i < y.length - 1; i++) {
                flag = 0;
                for (let j = 0; j < child1.length; j++) {
                    if (y[i] === child1[j]) {
                        flag = 1;
                    }
                }
                if (flag === 0) {
                    child1.push(y[i]);
                }
            }
        }
        if(child2.length !== x.length - 2) {
            let flag = 0;
            for (let i = 0; i < x.length - 1; i++) {
                flag = 0;
                for (let j = 0; j < child2.length; j++) {
                    if (x[i] === child2[j]) {
                        flag = 1;
                    }
                }
                if (flag === 0){
                    child2.push(x[i]);
                }
            }
        }
        console.log(child1,child2);
        let length1 = 0;
        let length2 = 0;
        child1.push(child1[0]);
        child2.push(child2[0]);
        console.log(child1.length, child2.length);
        for (let j = 0; j < child1.length - 1; j++) {
            length1 += dist(child1[j][0], child1[j][1], child1[j + 1][0], child1[j + 1][1]);
            length2 += dist(child2[j][0], child2[j][1], child2[j + 1][0], child2[j + 1][1]);
        }
        child1.push(length1);
        child2.push(length2);
        return [child1, child2];
    }

    function mutation(way) {
        let ind1 = random(1, way.length - 2);
        let ind2 = random(1, way.length - 2);
        let temp = [];
        temp = way[ind1];
        way[ind1] = way[ind2];
        way[ind2] = temp;
        let length = 0;
        for (let i = 0; i < way.length - 2; i++) {
            length += dist(way[i][0], way[i][1], way[i + 1][0], way[i + 1][1]);
        }
        way[way.length - 1] = length;
        return way;
    }

    function shuffle(cities) {
        let curInd = cities.length, randomInd;
        while (curInd > 1) {
            randomInd = random(1, cities.length - 1);
            curInd--;
            [cities[curInd], cities[randomInd]] = [cities[randomInd], cities[curInd]];
        }
        return cities;
    }

    function genPopulation(cities, population) {
        for (let i = 0; i < population.length; i++) {
            shuffle(cities);
            for (let j = 0; j < cities.length; j++) {
                population[i].push(cities[j]);
            }
            population[i].push(population[0][0]);
        }
        return population;
    }

    function pathLen(population) {
        for (let i = 0; i < population.length; i++) {
            let length = 0;
            for (let j = 0; j < population[i].length - 1; j++) {
                length += dist(population[i][j][0], population[i][j][1], population[i][j + 1][0], population[i][j + 1][1]);
            }
            population[i].push(length);
        }
        return population;
    }

    function newPop(population) {
        population.sort(function (a, b) {
            if (a[a.length - 1] > b[b.length - 1]) {
                return 1
            } else
                return -1
        });
        console.log(population);
        let selection = Array();
        if (population.length % 2 !== 0) {
            for (let i = 0; i < population.length / 2 - 2; i += 2) {
                let children = [];
                children.push(merge(population[i], population[i + 1]));
                selection.push(population[i]);
                selection.push(population[i + 1]);
                selection.push(children[0][0]);
                selection.push(children[0][1]);
            }
            selection.push(population[population.length - 1]);
        }
        if (population.length % 2 === 0) {
            for (let i = 0; i < population.length / 2; i += 2) {
                let children = [];
                children.push(merge(population[i], population[i + 1]));
                selection.push(population[i]);
                selection.push(population[i + 1]);
                selection.push(children[0][0]);
                selection.push(children[0][1]);
            }
        }
        return selection;
    }

    this.path = function () {
        let population = Array(cities.length ** 2);
        for (let i = 0; i < population.length; i++) {
            population[i] = [];
        }
        let bestPopulations = [];
        let counter = 0;
        let c = 0;
        let minLen = 99999999;
        let newMinLen = 9999999;
        population = genPopulation(cities, population);
        population = pathLen(population);
        while (counter < 10 && c < 1000) {
            if (minLen > newMinLen) {
                minLen = newMinLen;
            }
            population = newPop(population);
            for (let i = 0; i < population.length; i++) {
                let mutK = random(1, 100);
                if (mutK >= mutationPercent) {
                    population[i] = mutation(population[i]);
                }
            }
            for (let i = 0; i < population.length; i++) {
                newMinLen = Math.min(newMinLen, population[i][population[i].length - 1]);
            }

            for (let i = 0; i < population.length; i++) {
                if (newMinLen === population[i][population[i].length - 1]) {
                    bestPopulations.push(population[i]);
                }
            }
            if (minLen === newMinLen) {
                counter++;
            } else {
                counter = 0;
            }
            c++;
        }
        console.log(bestPopulations);
        draw(bestPopulations);
    }
}

const c = new DCanvas(document.getElementById("canv"));