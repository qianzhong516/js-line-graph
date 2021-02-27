window.addEventListener('DOMContentLoaded', ()=>{
    const form = document.querySelector('form')
    const yunit = document.getElementById('yunit')
    const yunit_amount = document.getElementById('yunit-amount')
    const dataset = document.getElementById('dataset')

    form.onsubmit = (e) => {
        e.preventDefault()
        try {
            const values = extractData(dataset.value)
            const data = {values}
            loadGraph('line-graph', {
                yUnit: yunit.value,
                yUnitAmount: yunit_amount.value,
                data
            })
        } catch(e) {
            alert(e)
        }

    }

    const downloadBtn = document.getElementById('make-img') 
    downloadBtn.onclick = () => {
        const canvas = document.getElementById('line-graph')
        downloadBtn.href = canvas.toDataURL('img/jpg')
    }

    function extractData(str) {
        const arr = []
        const datasets = str.split('|')
        // console.log(datasets)
        for(let i=0; i<datasets.length; i++) {
            if(datasets[i]!=="") {
                fields = datasets[i].split(',')
                if(fields[0]!=="" && fields[1]!=="") {
                    fields[0] = fields[0].replaceAll(' ','')
                    fields[1] = fields[1].replaceAll(' ','')
                    const x = fields[0].indexOf('x:') === 0 ? capitalize(fields[0].substr(2)) : null
                    const y = fields[1].indexOf('y:') === 0 ? parseInt(fields[1].substr(2)) : NaN
                    arr.push({x, y})
                }
            }
        }

        // examine arr values
        arr.forEach(item => {
            // console.log(item)
            if(isNaN(item.y) || item.y < 0 || !item.x) {
                throw 'dataset format is wrong'
            }
        })
        return arr
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substr(1)
    }
})

window.onload = () => {
    // initial data
    const data = {
        values: [
            {x: 'Jan', y:100},
            {x: 'Feb', y:200},
            {x: 'Mar', y:150},
            {x: 'Apr', y:400},
            {x: 'May', y:50}
        ]
    }

    loadGraph('line-graph', {
        yUnit: 50, // y axis value measurement unit
        yUnitAmount: 10, // y axis total unit amount
        data: data
    })
}

function loadGraph(selector, options) {
    const canvas = document.getElementById(selector)
    const canvasHeight = canvas.clientHeight
    const canvasWidth = canvas.clientWidth
    const xPadding = 30 // x axis padding of canvas
    const yPadding = 30 // y axis padding of canvas

    const {yUnit, yUnitAmount, data} = options

    if(canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        initAxises(ctx)
        drawLines(ctx)
        drawArcs(ctx)

    }else {
        alert('browser doesn\'t support HTML canvas!')
    }

    function initAxises(ctx) {

        // define styles
        ctx.lineWidth = 2
        ctx.strokeStyle = "#000"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle" // text vertical align middle

        // draw x & y aixses
        ctx.beginPath()
        ctx.moveTo(xPadding, yPadding)
        ctx.lineTo(xPadding, canvasHeight-yPadding)
        ctx.lineTo(canvasWidth-xPadding, canvasHeight-yPadding)
        ctx.stroke()

        // draw labels on x axis
        for(let i=0; i<data.values.length; i++) {
            ctx.fillText(data.values[i].x, getX(i), canvasHeight-yPadding+20)
        }
    
        // draw labels on y axis
        for(let i=0; i<= yUnitAmount; i++) {
            ctx.fillText(yUnit*i, xPadding-xPadding/2, getY(i))
            /* enable this block to check accuracy of pin points */
            /*  ctx.beginPath()
                ctx.arc(xPadding-xPadding/2, getY(i), 3, 0, 2*Math.PI, true)
                ctx.fill() */
        }
    }
    
    function drawLines(ctx) {

        // when there are two or more points
        if(data.values.length > 1) {
            // define styles
            ctx.lineWidth = 2
            ctx.strokeStyle = "red"
            ctx.beginPath()
            ctx.moveTo(getX(0), getYPos(data.values[0].y))

            for(let i=1; i<data.values.length; i++) {
                ctx.lineTo(getX(i), getYPos(data.values[i].y))
            }
            ctx.stroke()
        } 
        
    }

    function drawArcs(ctx) {
        ctx.fillStyle = "#333"

        for(let i=0; i<data.values.length; i++) {
            ctx.beginPath()
            ctx.arc(getX(i), getYPos(data.values[i].y), 4, 0, 2*Math.PI, true)
            ctx.fill()
        }

    }

    function getX(position) {
        // if there is only one point, make interval 1
        const intervals = data.values.length === 1 ? 1 : (data.values.length-1)
        return xPadding + (canvasWidth-2*xPadding)/intervals*position
    }

    function getY(position) {
        const intervals = yUnitAmount
        return (canvasHeight-yPadding) - (canvasHeight-2*yPadding)/intervals*position
    }

    function getYPos(value) {
        const Yintervals = yUnitAmount
        const amountOfIntervals = value/yUnit
        return canvasHeight - (amountOfIntervals*((canvasHeight-2*yPadding)/Yintervals) + yPadding)
    }
}