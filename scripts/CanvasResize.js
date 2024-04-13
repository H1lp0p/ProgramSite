window.addEventListener('resize', () => {
    let canvas = document.getElementById('canvas');
    canvas.width = Math.min(1000, window.innerWidth * (2/3));
    canvas.height = canvas.width;

    pixelLen = d.updateCanvSize();
});

document.getElementById('myCanvas').width = Math.min(1000, window.innerWidth * (2/3));
document.getElementById('myCanvas').height = document.getElementById('myCanvas').width;

console.log(window.innerWidth, window.innerHeight);