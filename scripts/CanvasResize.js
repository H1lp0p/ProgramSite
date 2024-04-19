window.addEventListener('resize', () => {
    let canvas = document.getElementById("canvas");

    canvas.height =Math.min(window.innerHeight - 300, window.innerWidth * (2/3));
    canvas.width = canvas.height;

    updateStats();
});


document.getElementById("canvas").height = Math.min(window.innerHeight - 300, window.innerWidth * (2/3));
document.getElementById("canvas").width = document.getElementById("canvas").height;
updateStats();