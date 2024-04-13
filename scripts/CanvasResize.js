window.addEventListener('resize', () => {
    let canvas = document.getElementById("canvas");

    canvas.height =Math.min(window.innerHeight - 300, window.innerWidth * (2/3));
    canvas.width = canvas.height;

    pixelLen = d.updateCanvSize();
});

document.getElementById("canvas").height = Math.min(window.innerHeight - 300, window.innerWidth * (2/3));