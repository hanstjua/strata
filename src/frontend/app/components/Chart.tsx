import * as echarts from "echarts";
import { useRef, useState, useEffect } from "react";

export const Chart = () => {
    const ref = useRef(null);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#333'
                }
            },
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
            data: []
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

                option.xAxis = {
                    type: 'category',
                    boundaryGap: false,
                    data: event.detail.index
                };

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