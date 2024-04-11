function DCanvas(el){
    ctx = el.getContext("2d");
    el.width = 400;
    el.height = 400;
    let pheromone = [];
    let cities = [];
    const numAnts = 10;
    const numIterations = 100;
    const evaporationRate = 0.1;
    const alpha = 1;
    const beta = 2;
    ctx.fillStyle = "rgb(42, 45, 67)";
    ctx.strokeStyle = 'rgb(255, 132, 232)';
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
        cities.push({x:getMousePos(el, evt).x, y:getMousePos(el, evt).y});
        ctx.fill();
        if (cities.length > 1) {
            for (let i = 0; i < cities.length - 1; i++) {
                for (let j = i + 1; j < cities.length; j++) {
                    ctx.beginPath();
                    ctx.strokeStyle = "violet";
                    // ctx.moveTo(cities[i].x, cities[i].y);
                    // ctx.lineTo(cities[j].x, cities[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    let numCities = cities.length;

    this.driver = function () {
        numCities = cities.length;
        initializePheromoneMatrix();
        runAntColonyOptimization();
    }
    function initializePheromoneMatrix() {

        for (let i = 0; i < numCities; i++) {
            pheromone.push([]);

            for (let j = 0; j < numCities; j++) {
                pheromone[i][j] = 1;
            }
        }
    }

    function calculateDistance(city1, city2) {
        let dx = city1.x - city2.x;
        let dy = city1.y - city2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function calculateProbabilities(ant, currentCity) {
        let probabilities = [];

        for (let i = 0; i < numCities; i++) {
            if (!ant.visited[i]) {
                let pheromoneLevel = pheromone[currentCity][i];
                let distance = calculateDistance(cities[currentCity], cities[i]);
                let probability = Math.pow(pheromoneLevel, alpha) * Math.pow(1 / distance, beta);
                probabilities.push({ cityIndex: i, probability });
            }
        }

        return probabilities;
    }

    function chooseNextCity(ant, currentCity) {
        let probabilities = calculateProbabilities(ant, currentCity);

        const totalProbability = probabilities.reduce((sum, { probability }) => sum + probability, 0);
        let random = Math.random() * totalProbability;

        for (let { cityIndex, probability } of probabilities) {
            random -= probability;
            if (random <= 0) {
                return cityIndex;
            }
        }

        return probabilities[probabilities.length - 1].cityIndex;
    }

    function updatePheromone(trails) {
        for (let i = 0; i < numCities; i++) {
            for (let j = 0; j < numCities; j++) {
                if (i !== j) {
                    pheromone[i][j] *= 1 - evaporationRate;
                }
            }
        }

        for (let trail of trails) {
            let trailDistance = calculateDistanceOfTrail(trail);

            for (let i = 0; i < numCities - 1; i++) {
                let from = trail[i];
                let to = trail[i + 1];
                pheromone[from][to] += 1 / trailDistance;
                pheromone[to][from] += 1 / trailDistance;
            }
        }
    }

    this.clear = function () {
        ctx.fillStyle = "rgb(42, 45, 67)";
        ctx.fillRect(0, 0, el.width, el.height);
        cities = [];
    }
    function calculateDistanceOfTrail(trail) {
        let distance = 0;

        for (let i = 0; i < numCities - 1; i++) {
            let from = trail[i];
            let to = trail[i + 1];
            distance += calculateDistance(cities[from], cities[to]);
        }

        return distance;
    }

    function findBestTrail(trails) {
        let bestTrail = trails[0];
        let bestDistance = calculateDistanceOfTrail(bestTrail);

        for (let i = 1; i < trails.length; i++) {
            let trail = trails[i];
            let distance = calculateDistanceOfTrail(trail);

            if (distance < bestDistance) {
                bestTrail = trail;
                bestDistance = distance;
            }
        }

        return { trail: bestTrail, distance: bestDistance };
    }

    function runAntColonyOptimization() {
        let ants = [];

        for (let i = 0; i < numAnts; i++) {
            ants.push({ trail: [], visited: new Array(numCities).fill(false) });
        }

        let bestTrailOverall = null;

        for (let iteration = 0; iteration < numIterations; iteration++) {
            for (const ant of ants) {
                ant.trail = [];
                ant.visited.fill(false);

                let startCity = 0;
                ant.trail.push(startCity);
                ant.visited[startCity] = true;

                let currentCity = startCity;

                while (ant.trail.length < numCities) {
                    const nextCity = chooseNextCity(ant, currentCity);
                    ant.trail.push(nextCity);
                    ant.visited[nextCity] = true;
                    currentCity = nextCity;
                }

                ant.trail.push(startCity);
            }

            let bestTrailIteration = findBestTrail(ants.map(ant => ant.trail));

            if (!bestTrailOverall || bestTrailIteration.distance < bestTrailOverall.distance) {
                bestTrailOverall = bestTrailIteration;
            }

            updatePheromone(ants.map(ant => ant.trail));
        }

        drawBestTrail(bestTrailOverall.trail);
        console.log(`Best Distance: ${bestTrailOverall.distance}`);
    }

    function drawBestTrail(trail) {

        ctx.strokeStyle = 'rgb(255, 132, 232)';

        ctx.beginPath();
        console.log(trail);
        ctx.moveTo(cities[trail[0]].x, cities[trail[0]].y);

        for (let i = 1; i < trail.length; i++) {
            let city = cities[trail[i]];
            ctx.lineTo(city.x, city.y);
        }

        ctx.lineTo(cities[trail[0]].x, cities[trail[0]].y);
        ctx.strokeStyle = 'cyan';
        ctx.stroke();
    }
}

const a = new DCanvas(document.getElementById("canv"))

