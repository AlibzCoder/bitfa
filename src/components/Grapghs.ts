import { IsDomElement } from "~/utils";
import { StoreInterface } from "~/utils/interfaces"




function roundUpToMultiplesOf(n : number, m : number){
    if(n > 0)
        return Math.ceil(n/m) * m;
    else if( n < 0)
        return Math.floor(n/m) * m;
    else
        return 3;
}

function formatMoney(amount : number) {
    if (amount >= 1e9) {
        return (amount / 1e9).toFixed(1) + 'B';
    } else if (amount >= 1e6) {
        return (amount / 1e6).toFixed(1) + 'M'; 
    } else if (amount >= 1e5) {
        return (amount / 1e6).toFixed(1) + 'M';
    } else if (amount >= 1e3) {
        return (amount / 1e3).toFixed(1) + 'K';
    } else if (amount >= 1e2) {
        return (amount / 1e3).toFixed(1) + 'K';
    } else {
        return amount.toString();
    }
}
function drawRoundedTopRect(
    ctx : CanvasRenderingContext2D,
    x : number, y : number,
    w : number, h : number,
    cH : number, padding : number,
    radius : number) {
    if(ctx){
        var y = (cH) - h;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.arcTo(x + w, y, x + w, y + radius, radius);
        ctx.lineTo(x + w, (cH + (padding)));
        ctx.lineTo(x, (cH + (padding)));
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

export interface GraphData {
    totalBuySellTimes: {
        month : object,
        week : object,
        year : object,
    },
    totalBuyAmounts: {
        month : object,
        week : object,
        year : object,
    },
    totalSellAmounts: {
        month : object,
        week : object,
        year : object,
    },
}

export default (store : StoreInterface) => {
    
    const graphContainer = document.getElementById('graph')
    let PADDING = (window.innerWidth * 0.8333) / 100;
    if(graphContainer && IsDomElement(graphContainer)){
        graphContainer.innerHTML = ''
        const graphCanvas = document.createElement('canvas');
        const graphInfo = document.createElement('div');
        const graphContainerBoundingRect = graphContainer.getBoundingClientRect();
        const ctx = graphCanvas.getContext("2d");
        graphContainer.appendChild(graphCanvas);
        graphContainer.appendChild(graphInfo);
        graphCanvas.width = graphContainerBoundingRect.width;
        graphCanvas.height = graphContainerBoundingRect.height;
        let width = graphCanvas.width - (PADDING * 2);
        let height = graphCanvas.height - (PADDING * 2);
        let currentData : object | any = null;


        function OnResize(){
            if(graphContainer){
                const graphContainerBoundingRect = graphContainer.getBoundingClientRect();
                graphCanvas.width = graphContainerBoundingRect.width;
                graphCanvas.height = graphContainerBoundingRect.height;
                PADDING = (window.innerWidth * 0.8333) / 100;
                width = graphCanvas.width - (PADDING * 2);
                height = graphCanvas.height - (PADDING * 2);
                if(currentData) render()
            }
        }
        
        var resizeTimeout : number | any;
        window.addEventListener('resize', function(){
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(OnResize, 100);
        })

        function sortObj(obj : object){
            return Object.keys(obj)
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                .map(key => obj[key as keyof typeof obj]);
        }

        function render(){
            if(ctx) ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
            const totalTimes = sortObj(currentData.totalBuySellTimes.month)
            const totalBuy =  sortObj(currentData.totalBuyAmounts.month);
            const totalSell =  sortObj(currentData.totalSellAmounts.month);
            
            const totalTimesMax = Math.max.apply(null, totalTimes);
            const totalYRoundNum = Math.round(totalTimesMax / 5) * 5;
            const yMax = roundUpToMultiplesOf(totalTimesMax, totalYRoundNum);
            const yPoints = Array.from({length: (yMax / totalYRoundNum) + 1}, (_, a) => a * totalYRoundNum)

            const totalBuySellVolume : object | any = totalBuy.map((v, i) => {
                let volume = totalBuy[i] - totalSell[i];
                return {
                    buy : totalBuy[i],
                    sell : totalSell[i],
                    volume : Math.abs(volume),
                    gain : volume > 0
                }
            })
            const maxVolume = Math.max.apply(null, totalBuySellVolume.map((o : object | any) => o.volume))
            const volumeLabels = yPoints.reverse().map((v) => v ? formatMoney(Math.round((maxVolume / v) * v)) : 0)
            
            function DrawTotalBuySellTimes (){
                if(ctx){
                    ctx.beginPath();
                    totalTimes.forEach((y, i) => {
                        const yPointValPercent = 100 - (totalTimes[i] / totalTimesMax) * 100
                        const xPoint = (((width - (PADDING * 2)) / totalTimes.length) * i) + (PADDING * 5)
                        const yPoint = (((height - PADDING) * yPointValPercent) / 100) + PADDING

                        ctx[i === 0 ? 'moveTo' : 'lineTo'](xPoint, yPoint)
                        if(i === totalTimes.length -1){
                            ctx.lineWidth = 2;
                            ctx.strokeStyle = '#ff9800'
                            ctx.stroke();
                        }
                    });
                }
            }
            function DrawVolumeRods(){
                if(ctx){
                    const RodsCount = totalBuySellVolume.length;
                    const rodWidth = ((width - (PADDING * 2)) / RodsCount) - PADDING
                    const space = ((width - (PADDING * 2)) - (RodsCount * rodWidth)) / RodsCount;
                    
                    totalBuySellVolume.forEach((item : object | any, i : number)=>{
                        const volumePercentage = (item.volume * 100) / maxVolume;
                        const xPoint = (i * (rodWidth + space)) + (PADDING * 2.125)
                        const rodHeight = ((height - PADDING) * volumePercentage) / 100;
                        const yPoint = height - rodHeight;

                        ctx.fillStyle = item.gain ? '#089f47' : '#c5212e'; 
                        ctx.strokeStyle = item.gain ? '#089f47' : '#c5212e';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.lineWidth = 1;
                        console.log(rodWidth)
                        drawRoundedTopRect(ctx, xPoint, yPoint, rodWidth, rodHeight, height, PADDING,  (rodWidth * 0.25))
                        ctx.fillText(formatMoney(Math.round(item.volume)), xPoint + (rodWidth / 2.75), yPoint - (PADDING / 2));
                    })
                }
            }
            function DrawAxis (){
                if(ctx){
                    const arr = [...yPoints].reverse();
                    arr.forEach((y, i : number) => {
                        ctx.beginPath();
                        ctx.font = '12px sans-serif';
                        ctx.fillStyle = 'rgb(255 255 255 / 35%)';

                        const yPoint = ((height / yMax) * y) + PADDING

                        ctx.moveTo((PADDING * 2), yPoint)
                        ctx.lineTo(graphCanvas.width - (PADDING * 2), yPoint)
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'rgb(255 255 255 / 35%)'
                        ctx.stroke();
                        

                        ctx.fillText(yPoints[i] + '', width + (PADDING / 2), yPoint + (PADDING / 4));
                        ctx.fillText(volumeLabels[i] + '', 0 , yPoint + (PADDING / 4));
                        
                    })
                }   
            }
            function DrawGraphInfo(){
                graphInfo.classList.add('d-flex')
                graphInfo.style.justifyContent = 'flex-end'
                graphInfo.innerHTML = `
                    <div class="d-flex flex-center" style="color: #089f47">
                        <hr style="width:10px; margin: 0.5em; border: 1px solid currentColor;" />
                        Gain
                    </div>
                    <div class="d-flex flex-center" style="color: #c5212e">
                        <hr style="width:10px; margin: 0.5em; border: 1px solid currentColor;" />
                        Loss
                    </div>
                    <div class="d-flex flex-center" style="color: #ff9800">
                        <hr style="width:10px; margin: 0.5em; border: 1px solid currentColor;" />
                        Times
                    </div>
                `
            }
            DrawVolumeRods()
            DrawTotalBuySellTimes()
            DrawAxis()
            DrawGraphInfo()
        }

        return { 
            render : (data : GraphData) => {
                currentData = data;
                OnResize()
            },
            reset : () => {
                if(ctx) ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
            }
        }
    }
}