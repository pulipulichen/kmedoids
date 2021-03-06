barChartId = 0;
createBarChart = function (_title, _data) {
    var _id = "barChartId" + barChartId;
    barChartId++;
    var canvas = document.getElementById(_id);
    if (canvas === null) {
        canvas = document.createElement("canvas");
        canvas.id = _id;
        document.body.appendChild(canvas);
    }
    var chart = canvas.getContext('2d');
    var chartObject = new Chart(chart, {
        type: 'bar',
        data: _data,
        options: {
            title: {
                display: true,
                text: _title
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false, 
            },
            hover: {mode: null},
            scales: {
                xAxes: [{
                        stacked: true,
                        categoryPercentage: 1.0,
                        barPercentage: 1.0,
                        gridLines: {
                            stacked: true,
                            offsetGridLines: false,
                            display:false,
                        }
                    }],
                yAxes: [{
                        stacked: true,
                    }]
            }
        }
    });
};