import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import * as echarts from 'echarts';

const NetworkGraph = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                const response = await fetch('/api/network');
                if (!response.ok) throw new Error('Failed to fetch network data');
                const data = await response.json();
                
                if (chartRef.current) {
                    if (chartInstance.current) {
                        chartInstance.current.dispose();
                    }

                    const chart = echarts.init(chartRef.current);
                    chartInstance.current = chart;

                    const option = {
                        title: {
                            text: 'LLM 生态系统网络',
                            left: 'center',
                            top: 20
                        },
                        tooltip: {
                            formatter: function(params) {
                                if (params.dataType === 'node') {
                                    return `${params.data.name}<br/>影响力: ${params.data.value.toFixed(2)}`;
                                }
                                return params.data.source + ' → ' + params.data.target;
                            }
                        },
                        legend: {
                            data: ['项目节点', '关联关系'],
                            top: 'bottom'
                        },
                        series: [{
                            name: 'LLM生态网络',
                            type: 'graph',
                            layout: 'force',
                            data: data.nodes.map(node => ({
                                ...node,
                                symbolSize: Math.sqrt(node.value) * 10,
                                itemStyle: {
                                    color: node.category === 0 ? '#2196F3' : '#21CBF3'
                                }
                            })),
                            links: data.links,
                            categories: [
                                { name: '核心项目' },
                                { name: '相关项目' }
                            ],
                            roam: true,
                            label: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            },
                            force: {
                                repulsion: 100,
                                gravity: 0.1,
                                edgeLength: 100,
                                layoutAnimation: true
                            },
                            emphasis: {
                                focus: 'adjacency',
                                lineStyle: {
                                    width: 4
                                }
                            },
                            lineStyle: {
                                color: 'source',
                                curveness: 0.3
                            }
                        }]
                    };

                    chart.setOption(option);
                    
                    // 响应窗口大小变化
                    const handleResize = () => {
                        chart.resize();
                    };
                    window.addEventListener('resize', handleResize);

                    return () => {
                        window.removeEventListener('resize', handleResize);
                    };
                }
            } catch (error) {
                console.error('Error fetching network data:', error);
            }
        };

        fetchNetworkData();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
            }
        };
    }, []);

    return (
        <Box 
            ref={chartRef} 
            sx={{ 
                width: '100%', 
                height: '600px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {!chartInstance.current && (
                <CircularProgress />
            )}
        </Box>
    );
};

export default NetworkGraph; 