const readline = require('readline');
const fs = require('fs');
const { throws } = require('assert');
const generateLogData = async ()=>{
    const file = readline.createInterface({
        input: fs.createReadStream('stresstest.log'),
        output: process.stdout,
        terminal: false
    });
    let successCount=0; let errorCount=0; let totalNumberRequests = 0; let totalNumberofError = 0; 
    let erropercentage=0; let successpercentage=0;
    file.on('line', (line) => {
      let resultantOnject = JSON.parse(line);
      if(resultantOnject.level == 'info' && JSON.stringify(resultantOnject.message).includes('200')) successCount++;
      if(resultantOnject.level == 'error' && JSON.stringify(resultantOnject.message).includes('300' || '404' || '500')) errorCount++;
      if(resultantOnject.level == 'error') errorCount++;
      totalNumberRequests++;
    });
    file.on('close', function () {
    erropercentage = (errorCount*100)/totalNumberRequests;
    successpercentage = (successCount*100)/totalNumberRequests;
    let htmlContent = `<!DOCTYPE HTML>
    <html>
    <head>
    <link rel="stylesheet" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap-grid.min.css">
    <script type="text/javascript">
    window.onload = function () {
    
    let chartCoulmn = new CanvasJS.Chart("chartContainer", {
        theme: "light2", // "light2", "dark1", "dark2"
        animationEnabled: false, // change to true		
        title:{
            text: "Coulmn Data Representation",
            fontSize: 16
        },
        data: [
        {
            // Change type to "bar", "area", "spline", "pie",etc.
            type: "column",
            dataPoints: [
                { label: "success",  y: ${successCount},color: "#00693e" },
                { label: "failed", y: ${errorCount},color: "#ff5349"  },
                { label: "total request", y: ${totalNumberRequests},color: "RoyalBlue"  }
            ]
        }
        ]
    });
    let chartPie = new CanvasJS.Chart("chartContainer2", {
        theme: "light2", // "light2", "dark1", "dark2"
        animationEnabled: false, // change to true		
        title:{
            text: "Pie Data Representation",
            fontSize: 16
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: [
                {y: ${successpercentage}, label: "success%",color: "#00693e"},
                {y: ${erropercentage}, label: "failed%",color: "#ff5349"}
            ]
        }]
    });
    chartCoulmn.render();
    chartPie.render();
    
    }
    </script>
    </head>
    <body>
    <div id="Tilte"><h1 style="text-align:center;font-weight: bold;">Stress Test Report</h1></div>
    <div>
    <div style="float:left;width:45%;" >
        <div id="chartContainer" style="height: 370px;"></div>
    </div>
    
    <div style="float:right;width:45%;">
        <div id="chartContainer2" style="height: 370px;"></div>
    </div>
    <div style="clear:both; font-size:1px;"></div>
    </div>
    <script src="https://canvasjs.com/assets/script/canvasjs.min.js"> </script>
    </body>
    </html>`

    fs.writeFile('loadtestData.html', htmlContent, (error) => { throw error});
    
    });
}


module.exports = {generateLogData};
