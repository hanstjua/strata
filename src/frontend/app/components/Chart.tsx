import * as echarts from "echarts";
import { useRef, useState, useEffect } from "react";

let base = +new Date(1968, 9, 3);
let oneDay = 24 * 3600 * 1000;
let date = [];
let data = [Math.random() * 300];
for (let i = 1; i < 20000; i++) {
  var now = new Date((base += oneDay));
  date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
  data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
}

export const Chart = () => {
    const ref = useRef(null);
    const option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
            return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: 'OUTPUT'
        },
        toolbox: {
            feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [...Array(1000).keys()]
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            min: 'dataMin',
            max: 'dataMax'
        },
        dataZoom: [
            {
            type: 'inside',
            start: 0,
            end: 100
            },
            {
            start: 0,
            end: 100
            }
        ],
        series: [{}]
    };

    const [ hasSetup, setHasSetup ] = useState(false);

    useEffect(() => {
        if (!hasSetup && !window.chart) {
            const myChart = echarts.init(ref.current);
            const resize = function() {
                myChart.resize();
            };
            window.addEventListener('resize', resize);
    
            const updateChart = (event: CustomEventInit) => {
                option.series = Object.entries(event.detail.data).map(([k, v]) => ({
                    name: k,
                    type: "line",
                    symbol: "none",
                    sampling: "lttb",
                    data: v
                }))
                console.log(option.series)
    
                myChart.setOption(option);
            };
            window.addEventListener('updateChart', updateChart);
    
            myChart.setOption(option);
            window.chart = myChart;
            setHasSetup(true);
        }
    }, [hasSetup, ref, option])

    return (<div className="py-3 pe-3 d-flex flex-column flex-grow-1">
        <div className="bg-light flex-grow-1" style={{ borderRadius: "10px" }}>
            <div id="main bg-light" style={{ height: "100%" }} ref={ref} />
        </div>
    </div>)
}