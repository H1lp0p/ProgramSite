function DCanvas(el) {
    ctx = el.getContext("2d");
    const pixel = 20;

    let is_mouse_down = false;

    canv.width = 400;
    canv.height = 400;

    this.drawLine = function (x1, y1, x2, y2, color = "violet") {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineJoin = "miter";
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    this.drawCell = function (x, y, w, h) {
        ctx.fillStyle = "violet";
        ctx.strokeStyle = "violet";
        ctx.lineJoin = "miter";
        ctx.lineWidth = 1;
        ctx.rect(x, y, w, h);
        ctx.fill();
    }
    this.clear = function () {
        ctx.clearRect(0, 0, canv.width, canv.height);
    }
    this.drawGrid = function () {
        const w = canv.width;
        const h = canv.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        for (let x = 0; x < w; x += xStep) {
            this.drawLine(x, 0, x, h);
        }
        for (let y = 0; y < h; y += yStep) {
            this.drawLine(0, y, w, y);
        }
    }

    this.sharp = function (draw = false) {
        const w = canv.width;
        const h = canv.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        let vector = [];
        let __draw = [];

        for (let x = 0; x < w; x += xStep) {
            for (let y = 0; y < h; y += yStep) {
                const data = ctx.getImageData(x, y, xStep, yStep);

                let nonEmptyPixelsCount = 0;
                for (i = 0; i < data.data.length; i += 10) {
                    const isEmpty = data.data[i] === 0;

                    if (!isEmpty) {
                        nonEmptyPixelsCount += 1;
                    }
                }
                if (nonEmptyPixelsCount > 1 && draw) {
                    __draw.push([x, y, xStep, yStep]);
                }
                vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
            }
        }

        if (draw) {
            this.clear();

            for (__d in __draw) {
                this.drawCell(__draw[__d][0], __draw[__d][1], __draw[__d][2], __draw[__d][3])
            }
        }

        function sigmoid(value) {
            return (1 / (1 + Math.exp(value)));
        }

        function rnd(min, max) {
            return (min + Math.random() * (max - min));
        }


        let weightsInHi = [];
        let weightsHiOut = [];
        let hidden = [];
        let output = [];
        for (i = 0; i < 500; i++) {
            hidden.push(0);
        }
        for (i = 0; i < 10; i++) {
            output.push(0);
        }

        for (i = 0; i < 500 * 2500; i++) {
            weightsInHi.push(rnd(-0.5, 0.5));
        }

        for (i = 0; i < 5000; i++) {
            weightsHiOut.push(rnd(-0.5, 0.5));
        }

        for (i = 0; i < 2500; i++) {
            for (j = 0; j < 500; j++) {
                hidden[j] += vector[i] * weightsInHi[i * 500 + j];
            }
        }
        for (i = 0; i < 500; i++) {

            hidden[i] = sigmoid(hidden[i]);
        }

        for (i = 0; i < 500; i++) {
            for (j = 0; j < 10; j++) {
                output[j] += hidden[i] * weightsHiOut[i * 10 + j];
            }
        }

        ans = 0;
        ansInd = 0;
        for (i = 0; i < 10; i++) {
            if (output[i] > ans) {
                ans = output[i];
                ansInd = i;
            }
        }
        alert(ansInd);


        // let z = [];
        // let y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // //y[] = 1;
        // let sum = 0;
        // for (i = 0; i < 10; i++) {
        //     sum += Math.exp(output[i]);
        // }
        //
        //
        // for (i = 0; i < 10; i++) {
        //     z.push(Math.exp(output[i]) / sum);
        //     CrossEntr += y[i] * Math.log(z[i]);
        // }



        return vector;
    }

    el.addEventListener("mousedown", function (e) {
        is_mouse_down = true;
        ctx.beginPath();
    })
    el.addEventListener("mouseup", function (e) {
        is_mouse_down = false;
    })
    el.addEventListener("mousemove", function (e) {
        if (is_mouse_down) {
            ctx.fillStyle = "violet";
            ctx.strokeStyle = "violet";
            ctx.lineWidth = pixel;

            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2)
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
    })
}


const d = new DCanvas(document.getElementById("canv"));
