// components/ChartCard.js
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Paper, Box } from '@mui/material';

const ChartCard = ({ chartId, chartOptions }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        let chart = null;
        if (chartRef.current && chartOptions) {
            try {
                chart = echarts.init(chartRef.current);
                chart.setOption(chartOptions);

                const handleResize = () => {
                    if (chart) {
                        chart.resize();
                    }
                };

                window.addEventListener('resize', handleResize);

                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(() => {
                        if (chart) {
                            chart.resize();
                        }
                    });
                    resizeObserver.observe(chartRef.current);
                }

                return () => {
                    window.removeEventListener('resize', handleResize);
                    if (chart) {
                        chart.dispose();
                    }
                };
            } catch (error) {
                console.error('Error initializing chart:', error);
            }
        }
    }, [chartOptions]);

    return (
        <Paper 
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1)',
                '&:hover': {
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
                }
            }}
        >
            <Box 
                p={3} 
                sx={{ 
                    height: 0,
                    paddingTop: '75%', // 4:3 比例
                    position: 'relative'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 24,
                        left: 24,
                        right: 24,
                        bottom: 24,
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                >
                    <div 
                        id={chartId} 
                        ref={chartRef} 
                        style={{ 
                            width: '100%',
                            height: '100%'
                        }}
                    />
                </Box>
            </Box>
        </Paper>
    );
};

export default ChartCard;
