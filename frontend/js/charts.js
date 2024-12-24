// 图表配置和初始化
function initCharts(projectsData) {
    initPREfficiencyChart(projectsData);
    initOpenRankChart(projectsData);
    initRadarChart(projectsData);
    initAttentionChart(projectsData);
    initDeveloperActivityChart(projectsData);
    initProjectActivityChart(projectsData);
    updateCoreData(projectsData);
    initGithubTable(projectsData);
}

// 通用图表初始化函数
function initializeChart(containerId) {
    const chart = echarts.init(document.getElementById(containerId));
    
    // 设置图表自适应
    const resizeChart = () => {
        const container = document.getElementById(containerId);
        if (container && chart) {
            chart.resize();
        }
    };
    
    // 监听容器大小变化
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => resizeChart());
        resizeObserver.observe(document.getElementById(containerId));
    }
    
    return chart;
}

// PR处理效率图表
function initPREfficiencyChart(data) {
    const chart = initializeChart('pr-efficiency-chart');
    
    // 选择三个项目
    const projects = [
        'AIGC-Audio/AudioGPT',
        'zihangdai/xlnet',
        'microsoft/DeepSpeed'
    ];
    
    // 使用change_requests和change_request_resolution_duration指标
    const series = [];
    const legendData = [];
    let xData = [];
    
    projects.forEach((project, index) => {
        if (!data[project]) return;
        
        const projectData = data[project];
        const requests = projectData.change_requests || {};
        const duration = projectData.change_request_resolution_duration || {};
        
        // 获取所有时间点
        const timePoints = Object.keys(requests).filter(key => key.includes('Q')); // 使用季度数据
        xData = [...new Set([...xData, ...timePoints])].sort();
        
        // PR数量数据
        series.push({
            name: `${project} PR数量`,
            type: 'bar',
            stack: 'PR',
            data: xData.map(time => requests[time] || 0),
            itemStyle: {
                color: `rgba(0, 168, 255, ${0.8 - index * 0.2})`
            }
        });
        
        // PR处理时长数据
        series.push({
            name: `${project} 处理时长`,
            type: 'line',
            yAxisIndex: 1,
            data: xData.map(time => duration[time] || 0),
            itemStyle: {
                color: `rgba(255, 215, 0, ${0.8 - index * 0.2})`
            }
        });
        
        legendData.push(`${project} PR数量`, `${project} 处理时长`);
    });
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: legendData,
            textStyle: {
                color: '#7eb6ef'
            },
            top: '5%'
        },
        grid: {
            top: '15%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xData,
            axisLabel: {
                color: '#7eb6ef',
                rotate: 45
            }
        },
        yAxis: [{
            type: 'value',
            name: 'PR数量',
            axisLabel: {
                color: '#7eb6ef'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(126, 182, 239, 0.2)'
                }
            }
        }, {
            type: 'value',
            name: '处理时长(天)',
            axisLabel: {
                color: '#7eb6ef'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(126, 182, 239, 0.2)'
                }
            }
        }],
        series: series
    };
    
    chart.setOption(option);
}

// OpenRank图表
function initOpenRankChart(data) {
    const chart = initializeChart('openrank-chart');
    
    const projectData = data['AIGC-Audio/AudioGPT'].openrank || {};
    const xData = Object.keys(projectData).filter(key => key.includes('-'));
    const yData = xData.map(key => projectData[key]);
    
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            top: '10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xData,
            axisLabel: {
                color: '#7eb6ef',
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: 'OpenRank',
            axisLabel: {
                color: '#7eb6ef'
            }
        },
        series: [{
            data: yData,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#00ff00',
                width: 2
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(0, 255, 0, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(0, 255, 0, 0.1)'
                }])
            }
        }]
    };
    
    chart.setOption(option);
}

// 雷达图
function initRadarChart(data) {
    const chart = initializeChart('radar-chart');
    
    const projectData = data['AIGC-Audio/AudioGPT'];
    const latestData = {
        openrank: Object.values(projectData.openrank || {}).pop() || 0,
        activity: Object.values(projectData.activity || {}).pop() || 0,
        attention: Object.values(projectData.attention || {}).pop() || 0,
        technical_fork: Object.values(projectData.technical_fork || {}).pop() || 0,
        new_contributors: Object.values(projectData.new_contributors || {}).pop() || 0
    };
    
    const option = {
        radar: {
            indicator: [
                { name: 'OpenRank', max: 600 },
                { name: '活跃度', max: 100 },
                { name: '关注度', max: 100 },
                { name: '技术影响力', max: 100 },
                { name: '新贡献者', max: 50 }
            ],
            axisName: {
                color: '#7eb6ef'
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(0, 168, 255, 0.1)']
                }
            }
        },
        series: [{
            type: 'radar',
            data: [{
                value: [
                    latestData.openrank,
                    latestData.activity,
                    latestData.attention,
                    latestData.technical_fork,
                    latestData.new_contributors
                ],
                name: 'Project Metrics',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(0, 168, 255, 0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(0, 168, 255, 0.1)'
                    }])
                }
            }]
        }]
    };
    
    chart.setOption(option);
}

// 关注度图表
function initAttentionChart(data) {
    const chart = initializeChart('attention-chart');
    // 实现关注度图表的具体逻辑
    // ...
}

// 开发者活跃度图表
function initDeveloperActivityChart(data) {
    const chart = initializeChart('developer-activity-chart');
    // 实现开发者活跃度图表的具体逻辑
    // ...
}

// 项目活跃度图表
function initProjectActivityChart(data) {
    const chart = initializeChart('project-activity-chart');
    
    // 示例：处理活跃度数据
    const projectData = data['AIGC-Audio/AudioGPT'].activity;
    
    const xData = Object.keys(projectData).filter(key => key.includes('-')); // 只取月度数据
    const yData = xData.map(key => projectData[key]);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}'
        },
        grid: {
            top: '10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xData,
            axisLabel: {
                color: '#7eb6ef',
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#7eb6ef'
            }
        },
        series: [{
            data: yData,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#00a8ff',
                width: 2
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(0, 168, 255, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(0, 168, 255, 0.1)'
                }])
            }
        }]
    };
    
    chart.setOption(option);
}

// 更新核心数据
function updateCoreData(data) {
    const projectData = data['AIGC-Audio/AudioGPT'];
    
    // 计算OpenRank平均值
    const openrankValues = Object.values(projectData.openrank || {});
    const openrankAvg = openrankValues.length ? 
        (openrankValues.reduce((a, b) => a + b, 0) / openrankValues.length).toFixed(2) : 
        '0.00';
    
    // 计算活跃度平均值
    const activityValues = Object.values(projectData.activity || {});
    const activityAvg = activityValues.length ? 
        (activityValues.reduce((a, b) => a + b, 0) / activityValues.length).toFixed(2) : 
        '0.00';
    
    // 更新显示
    document.getElementById('openrank-avg').textContent = openrankAvg;
    document.getElementById('github-avg').textContent = activityAvg;
}

// 初始化GitHub数据表
function initGithubTable(data) {
    const tableContainer = document.getElementById('github-table');
    const projectData = data['AIGC-Audio/AudioGPT'];
    
    // 获取最新数据
    const latestData = {
        openrank: Object.values(projectData.openrank || {}).pop() || 0,
        activity: Object.values(projectData.activity || {}).pop() || 0,
        attention: Object.values(projectData.attention || {}).pop() || 0,
        technical_fork: Object.values(projectData.technical_fork || {}).pop() || 0,
        new_contributors: Object.values(projectData.new_contributors || {}).pop() || 0
    };
    
    // 创建表格HTML
    const tableHTML = `
        <table style="width:100%; color:#7eb6ef; border-collapse:collapse;">
            <thead>
                <tr style="background:rgba(0,168,255,0.1);">
                    <th style="padding:10px;">指标</th>
                    <th style="padding:10px;">数值</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:10px;">OpenRank</td>
                    <td style="padding:10px;">${latestData.openrank.toFixed(2)}</td>
                </tr>
                <tr style="background:rgba(0,168,255,0.1);">
                    <td style="padding:10px;">活跃度</td>
                    <td style="padding:10px;">${latestData.activity.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding:10px;">关注度</td>
                    <td style="padding:10px;">${latestData.attention.toFixed(2)}</td>
                </tr>
                <tr style="background:rgba(0,168,255,0.1);">
                    <td style="padding:10px;">技术影响力</td>
                    <td style="padding:10px;">${latestData.technical_fork.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding:10px;">新贡献者</td>
                    <td style="padding:10px;">${latestData.new_contributors.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
} 