let isMouseDown = false;

//TODO: drawing func (for UDOUNO & H1p0 variants)
function DCanvas(canvas, dims){

    context = canvas.getContext("2d");
    const dimension = dims;
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

    this.drawGrid = function (color = gridColor){
        for (let x = 0; x<dimension; x+=1){
            this.drawLine(x*pixelLen, 0, x*pixelLen, canvas.height, color);
        }
        for(let y = 0; y<dimension; y += 1){
            this.drawLine(0, y*pixelLen, canvas.width, y*pixelLen, color);
        }
    }

    this.drawPixel = function (x, y, pat = usingPattern){
        x = Math.floor(x / pixelLen);
        y = Math.floor(y / pixelLen);
        if(pat !== emptyPixel){
            context.beginPath();
            context.fillStyle = pat;
            context.strokeStyle = pat;
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

}

