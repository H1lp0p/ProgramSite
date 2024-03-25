let isMouseDown = false;
//TODO: history of coloring
function DCanvas(canvas){

    context = canvas.getContext("2d");
    const dimension = 10;
    const pixelLen = canvas.height / dimension;
    let gridColor = "#7F49C4FF";
    let emptyPixel = "#2A2D43FF";
    let snakePart = "#FF84E8FF"
    const img = new Image();
    img.src = "../images/PixelPattern.png";
    let pattern;

    img.onload = () => {
        pattern = context.createPattern(img, "repeat");
    }

    let usingPattern = pattern;

    canvas.width = dimension * pixelLen;

    this.drawLine = function (x1, y1, x2, y2, color = gridColor){
        context.beginPath();
        context.fillStyle = pattern;
        context.strokeStyle = pattern;
        context.lineJoin = "bevel";
        context.lineWidth = 1;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.closePath();
        context.stroke();

    }

    this.drawGrid = function (){
        for (let x = 0; x<dimension; x+=1){
            this.drawLine(x*pixelLen, 0, x*pixelLen, canvas.height);
        }
        for(let y = 0; y<dimension; y += 1){
            this.drawLine(0, y*pixelLen, canvas.width, y*pixelLen);
        }
    }

    this.drawPixel = function (x, y){
        x = Math.floor(x / pixelLen);
        y = Math.floor(y / pixelLen);
        if(usingPattern != emptyPixel){
            context.beginPath();
            context.fillStyle = usingPattern;
            context.strokeStyle = usingPattern;
            context.lineJoin = "bevel";
            context.lineWidth = 1;
            context.closePath();
            context.fillRect(x * pixelLen, y * pixelLen, pixelLen, pixelLen);
        }
        else{
            context.clearRect(x * pixelLen, y * pixelLen, pixelLen, pixelLen);
            context.strokeStyle = pattern;
            context.rect(x * pixelLen, y * pixelLen, pixelLen, pixelLen);
            context.stroke();
        }

    }

    this.clear = function (){
        context.reset();
    }

    this.changeToWalls = function (){
        usingPattern = pattern;
    }

    this.changeToEmpty = function (){
        usingPattern = emptyPixel;
    }

    this.changeToPointer = function (){
        usingPattern = snakePart;
    }

}

function mousDown(e){
    //alert('Fuck');
    isMouseDown = true;
    const cnvBoundingRect = canvas.getBoundingClientRect();
    const x = e.clientX - cnvBoundingRect.left;
    const y = e.clientY - cnvBoundingRect.top;
    d.drawPixel(x ,y);
}

let canvas = document.getElementById("canvas");
const d = new DCanvas(canvas);

canvas.addEventListener("mousedown",mousDown);