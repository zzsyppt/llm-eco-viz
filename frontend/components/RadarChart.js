// components/RadarChart.js
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const RadarChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && data) {
      chartInstance.current = echarts.init(chartRef.current);

      const maxValues = {
        stars: Math.max(...data.seriesData.map(item => item.value[0])) * 1.2 || 100,
        technical_fork: Math.max(...data.seriesData.map(item => item.value[1])) * 1.2 || 100,
        new_contributors: Math.max(...data.seriesData.map(item => item.value[2])) * 1.2 || 100,
        issues_closed: Math.max(...data.seriesData.map(item => item.value[3])) * 1.2 || 100,
        change_requests_accepted: Math.max(...data.seriesData.map(item => item.value[4])) * 1.2 || 100
      };

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item'
        },
        radar: {
          center: ['50%', '50%'],
          radius: '65%',
          indicator: [
            { name: '星标数', max: maxValues.stars },
            { name: '技术分叉', max: maxValues.technical_fork },
            { name: '新贡献者', max: maxValues.new_contributors },
            { name: '已解决问题', max: maxValues.issues_closed },
            { name: '已接受PR', max: maxValues.change_requests_accepted }
          ],
          shape: 'circle',
          splitNumber: 5,
          axisName: {
            color: '#7eb6ef'
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(0, 168, 255, 0.02)', 'rgba(0, 168, 255, 0.05)',
                     'rgba(0, 168, 255, 0.08)', 'rgba(0, 168, 255, 0.11)',
                     'rgba(0, 168, 255, 0.14)']
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 168, 255, 0.3)'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 168, 255, 0.2)'
            }
          }
        },
        series: [{
          type: 'radar',
          data: data.seriesData,
          symbol: 'none',
          lineStyle: {
            width: 2
          },
          areaStyle: {
            opacity: 0.2
          },
          emphasis: {
            lineStyle: {
              width: 4
            }
          }
        }]
      };

      chartInstance.current.setOption(option);

      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [data]);

  return <div ref={chartRef} style={{ height: '100%', width: '100%' }}></div>;
};

export default RadarChart;
