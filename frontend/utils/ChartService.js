// utils/ChartService.js
import * as echarts from 'echarts';
import { getDeepestProjects } from './helpers'; // 导入辅助函数（如有需要）

export class ChartService {
    static charts = {}; // 存储所有初始化的图表实例
    static chartOptions = {}; // 存储所有图表的配置选项

    /**
     * 初始化单个图表
     * @param {string} containerId - 图表容器的 ID
     * @returns {Object|null} - ECharts 实例或 null
     */
    static initializeChart(containerId) {
        try {
            if (typeof window === 'undefined') return null;

            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container not found: ${containerId}`);
                return null;
            }

            // 如果图表实例已存在，先销毁它
            if (this.charts[containerId]) {
                this.charts[containerId].dispose();
            }

            const chart = echarts.init(container);
            this.charts[containerId] = chart;

            // 设置图表自适应
            const resizeChart = () => {
                if (container && chart) {
                    chart.resize();
                }
            };

            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => resizeChart());
                resizeObserver.observe(container);
            }

            window.addEventListener('resize', resizeChart);

            return chart;
        } catch (error) {
            console.error(`Error initializing chart ${containerId}:`, error);
            return null;
        }
    }

    /**
     * 初始化所有图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} projectsData - 包含所有项目数据的对象
     */
    static initCharts(projects, projectsData) {
        if (typeof window === 'undefined') return; // 确保在客户端运行

        if (!projects || !Array.isArray(projects)) {
            console.error('Invalid projects list');
            return;
        }

        console.log('ChartService - Projects:', projects);
        console.log('ChartService - Raw project data:', projectsData);

        try {
            this.initProjectAttentionChart(projects, projectsData);
            this.initOpenRankChart(projects, projectsData);
            this.initCodeChangeBehaviorChart(projects, projectsData);
            this.initPRSituationChart(projects, projectsData);
            this.initIssueChangesChart(projects, projectsData);
            this.initProjectActivityChart(projects, projectsData);
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    /**
     * 获取所有图表的配置选项
     * @returns {Object} - 包含所有图表配置的对象
     */
    static getChartOptions() {
        return this.chartOptions;
    }

    /**
     * 获取项目的显示名称（路径的最后一部分）
     * @param {string} project - 项目路径
     * @returns {string} - 项目显示名称
     */
    static getDisplayName(project) {
        if (!project) return '';
        const parts = project.split('/');
        return parts[parts.length - 1];
    }

    /**
     * 获取最新的数据值
     * @param {Array} dataArray - 数据数组
     * @returns {number} - 最新的数据值
     */
    static getLatestValue(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return 0;
        return dataArray[dataArray.length - 1].value || 0;
    }

    /**
     * 获取数据的最大值
     * @param {Array} dataArray - 数据数组
     * @returns {number} - 数据的最大值
     */
    static getMaxValue(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return 0;
        return Math.max(...dataArray.map(item => item.value || 0));
    }

    /**
     * 初始化项目关注度图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initProjectAttentionChart(projects, data) {
        console.log('Initializing project attention chart');
        console.log('Projects:', projects);
        console.log('Data:', data);

        const chart = this.initializeChart('project-attention-chart');
        if (!chart) {
            console.error('Failed to initialize chart container');
            return;
        }

        const metrics = [
            'stars',
            'technical_fork',
            'attention',
            'bus_factor',
            'new_contributors'
        ];

        const legendData = [
            'Stars',
            'Technical Fork',
            'Attention',
            'Bus Factor',
            'New Contributors'
        ];

        const timeAxisSet = new Set();

        // 收集所有时间点
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData) {
                metrics.forEach(metric => {
                    if (Array.isArray(projectData[metric])) {
                        projectData[metric].forEach(item => timeAxisSet.add(item.time));
                    }
                });
            }
        });

        const timeAxis = Array.from(timeAxisSet).sort();

        // 初始化数据数组
        const metricsData = {};
        metrics.forEach(metric => {
            metricsData[metric] = Array(timeAxis.length).fill(0);
        });

        // 累加每个项目的数据
        projects.forEach(project => {
            const projectData = data[project];
            if (!projectData) return;

            metrics.forEach(metric => {
                if (Array.isArray(projectData[metric])) {
                    projectData[metric].forEach(item => {
                        const timeIndex = timeAxis.indexOf(item.time);
                        if (timeIndex !== -1) {
                            metricsData[metric][timeIndex] += item.value || 0;
                        }
                    });
                }
            });
        });

        // Material Design 颜色
        const colors = {
            stars: '#4285F4',      // Google Blue
            technical_fork: '#DB4437',  // Google Red
            attention: '#F4B400',   // Google Yellow
            bus_factor: '#0F9D58',  // Google Green
            new_contributors: '#AB47BC'  // Purple 400
        };

        const option = {
            title: {
                text: '项目关注度',
                textStyle: {
                    color: '#7eb6ef',
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#202124'
                    }
                },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#E0E0E0',
                borderWidth: 1,
                textStyle: {
                    color: '#202124'
                },
                formatter: function(params) {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        const marker = `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>`;
                        result += `${marker}${param.seriesName}: ${param.value.toFixed(0)}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: legendData,
                top: 30,
                textStyle: {
                    color: '#7eb6ef'
                },
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
                boundaryGap: false,
                data: timeAxis,
                axisLine: {
                    lineStyle: {
                        color: '#7eb6ef'
                    }
                },
                axisLabel: {
                    color: '#7eb6ef',
                    rotate: 45
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                name: '数量',
                nameTextStyle: {
                    color: '#7eb6ef',
                    fontSize: 12,
                    padding: [0, 0, 8, 0]
                },
                axisLabel: {
                    color: '#7eb6ef',
                    fontSize: 12
                },
                splitLine: {
                    lineStyle: {
                        color: '#7eb6ef',
                        type: 'dashed'
                    }
                }
            },
            series: metrics.map((metric, index) => ({
                name: legendData[index],
                type: 'line',
                data: metricsData[metric],
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                sampling: 'average',
                itemStyle: {
                    color: colors[metric],
                    borderWidth: 2
                },
                lineStyle: {
                    width: 2,
                    color: colors[metric]
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: `${colors[metric]}50`  // 50 是透明度
                        },
                        {
                            offset: 1,
                            color: `${colors[metric]}10`  // 10 是透明度
                        }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 3
                    }
                }
            })),
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };

        chart.setOption(option);
        this.chartOptions.projectAttentionOptions = option;
    }

    /**
     * 初始化项目 OpenRank 图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initOpenRankChart(projects, data) {
        const chart = this.initializeChart('openrank-chart');
        if (!chart) return;

        const legendData = projects.map(project => this.getDisplayName(project));
        const timeAxisSet = new Set();

        // 收集所有时间点
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData && Array.isArray(projectData.openrank)) {
                projectData.openrank.forEach(item => timeAxisSet.add(item.time));
            }
        });

        const timeAxis = Array.from(timeAxisSet).sort();

        // 为每个项目准备数据系列
        const series = projects.map((project, index) => {
            const projectData = data[project];
            const openrankValues = Array(timeAxis.length).fill(0);

            if (projectData && Array.isArray(projectData.openrank)) {
                projectData.openrank.forEach(item => {
                    const timeIndex = timeAxis.indexOf(item.time);
                    if (timeIndex !== -1) {
                        openrankValues[timeIndex] = item.value || 0;
                    }
                });
            }

            // 计算最大值用于颜色渐变
            const maxValue = Math.max(...openrankValues);
            const colorIntensity = maxValue > 0 ? 0.8 : 0.3;

            return {
                name: this.getDisplayName(project),
                type: 'bar',
                data: openrankValues,
                barMaxWidth: 30,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 110) % 255}, ${colorIntensity})`
                        },
                        {
                            offset: 1,
                            color: `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 110) % 255}, 0.3)`
                        }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 110) % 255}, 1)`
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#7eb6ef',
                    formatter: function(params) {
                        return params.value.toFixed(1);
                    }
                }
            };
        });

        const option = {
            title: {
                text: '项目 OpenRank',
                textStyle: {
                    color: '#7eb6ef'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: legendData,
                top: 30,
                textStyle: {
                    color: '#7eb6ef'
                }
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
                data: timeAxis,
                axisLabel: {
                    color: '#7eb6ef',
                    rotate: 45
                },
                axisLine: {
                    lineStyle: {
                        color: '#7eb6ef'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'OpenRank',
                nameTextStyle: {
                    color: '#7eb6ef'
                },
                axisLabel: {
                    color: '#7eb6ef'
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(126, 182, 239, 0.2)'
                    }
                }
            },
            series: series,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };

        chart.setOption(option);
        this.chartOptions.openRankOptions = option;
    }

    /**
     * 初始化代码变更行为图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initCodeChangeBehaviorChart(projects, data) {
        const chart = this.initializeChart('code-change-behavior-chart');
        if (!chart) return;

        const metrics = [
            'change_requests_accepted',
            'change_requests',
            'change_requests_reviews',
            'change_request_response_time',
            'change_request_resolution_duration'
        ];

        const legendData = [
            'PR接受数',
            'PR总数',
            'PR评审数',
            '响应时间',
            '解决时长'
        ];

        const timeAxisSet = new Set();

        // 收集所有时间点
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData) {
                metrics.forEach(metric => {
                    if (Array.isArray(projectData[metric])) {
                        projectData[metric].forEach(item => timeAxisSet.add(item.time));
                    }
                });
            }
        });

        const timeAxis = Array.from(timeAxisSet).sort();

        // 初始化数据数组
        const metricsData = {};
        metrics.forEach(metric => {
            metricsData[metric] = Array(timeAxis.length).fill(0);
        });

        // 累加每个项目的数据
        projects.forEach(project => {
            const projectData = data[project];
            if (!projectData) return;

            metrics.forEach(metric => {
                if (Array.isArray(projectData[metric])) {
                    projectData[metric].forEach(item => {
                        const timeIndex = timeAxis.indexOf(item.time);
                        if (timeIndex !== -1) {
                            metricsData[metric][timeIndex] += item.value || 0;
                        }
                    });
                }
            });
        });

        const option = {
            title: {
                text: '代码变更行为',
                textStyle: {
                    color: '#7eb6ef'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: legendData,
                top: 30,
                textStyle: {
                    color: '#7eb6ef'
                }
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
                data: timeAxis,
                axisLabel: {
                    color: '#7eb6ef',
                    rotate: 45
                },
                axisLine: {
                    lineStyle: {
                        color: '#7eb6ef'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '数量',
                    position: 'left',
                    nameTextStyle: {
                        color: '#7eb6ef'
                    },
                    axisLabel: {
                        color: '#7eb6ef'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(126, 182, 239, 0.2)'
                        }
                    }
                },
                {
                    type: 'value',
                    name: '时间 (分钟)',
                    position: 'right',
                    nameTextStyle: {
                        color: '#7eb6ef'
                    },
                    axisLabel: {
                        color: '#7eb6ef',
                        formatter: '{value} min'
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: legendData[0],
                    type: 'bar',
                    data: metricsData.change_requests_accepted,
                    stack: 'PR',
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(126, 231, 135, 0.8)' },
                            { offset: 1, color: 'rgba(126, 231, 135, 0.3)' }
                        ])
                    }
                },
                {
                    name: legendData[1],
                    type: 'bar',
                    data: metricsData.change_requests,
                    stack: 'PR',
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(121, 192, 255, 0.8)' },
                            { offset: 1, color: 'rgba(121, 192, 255, 0.3)' }
                        ])
                    }
                },
                {
                    name: legendData[2],
                    type: 'bar',
                    data: metricsData.change_requests_reviews,
                    stack: 'PR',
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 123, 114, 0.8)' },
                            { offset: 1, color: 'rgba(255, 123, 114, 0.3)' }
                        ])
                    }
                },
                {
                    name: legendData[3],
                    type: 'line',
                    yAxisIndex: 1,
                    data: metricsData.change_request_response_time,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { width: 3, color: '#d2a8ff' },
                    itemStyle: { color: '#d2a8ff' }
                },
                {
                    name: legendData[4],
                    type: 'line',
                    yAxisIndex: 1,
                    data: metricsData.change_request_resolution_duration,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { width: 3, color: '#ffa657' },
                    itemStyle: { color: '#ffa657' }
                }
            ]
        };

        chart.setOption(option);
        this.chartOptions.codeChangeBehaviorOptions = option;
    }

    /**
     * 初始化项目 PR 情况图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initPRSituationChart(projects, data) {
        const chart = this.initializeChart('pr-situation-chart');
        if (!chart) return;

        const legendData = ['PRs Removed', 'PRs Added'];
        const timeAxisSet = new Set();

        // 收集所有时间点
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData && projectData.code_change_lines_remove) {
                projectData.code_change_lines_remove.forEach(item => timeAxisSet.add(item.time));
            }
        });

        const timeAxis = Array.from(timeAxisSet).sort();

        // 初始化各指标的数据数组
        const prsRemoved = Array(timeAxis.length).fill(0);
        const prsAdded = Array(timeAxis.length).fill(0);

        // 累加每个项目的数据
        projects.forEach(project => {
            const projectData = data[project];
            if (!projectData) return;

            // PRs Removed
            if (projectData.code_change_lines_remove) {
                projectData.code_change_lines_remove.forEach(item => {
                    const timeIndex = timeAxis.indexOf(item.time);
                    if (timeIndex !== -1) {
                        prsRemoved[timeIndex] += item.value || 0;
                    }
                });
            }

            // PRs Added
            if (projectData.code_change_lines_add) {
                projectData.code_change_lines_add.forEach(item => {
                    const timeIndex = timeAxis.indexOf(item.time);
                    if (timeIndex !== -1) {
                        prsAdded[timeIndex] += item.value || 0;
                    }
                });
            }
        });

        const option = {
            title: {
                text: '项目 PR 情况',
                textStyle: {
                    color: '#7eb6ef'
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: legendData,
                top: 30,
                textStyle: {
                    color: '#7eb6ef',
                },
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
                data: timeAxis,
                axisLabel: {
                    color: '#7eb6ef',
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: '数量',
                position: 'left',
                nameTextStyle: {
                    color: '#7eb6ef'
                },
                axisLabel: {
                    color: '#7eb6ef'
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(126, 182, 239, 0.2)'
                    }
                }
            },
            series: [
                {
                    name: 'PRs Removed',
                    type: 'bar',
                    data: prsRemoved,
                    itemStyle: { color: 'rgba(255, 0, 0, 0.8)' },
                    animationDuration: 1000,
                },
                {
                    name: 'PRs Added',
                    type: 'bar',
                    data: prsAdded,
                    itemStyle: { color: 'rgba(0, 168, 255, 0.8)' },
                    animationDuration: 1000,
                },
            ],
            animation: true,
            animationEasing: 'cubicOut',
        };

        // 设置图表配置
        chart.setOption(option);

        // 保存图表配置
        this.chartOptions.prSituationOptions = option;
    }

    /**
     * 初始化 Issue 变化图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initIssueChangesChart(projects, data) {
        const chart = this.initializeChart('issue-changes-chart');
        if (!chart) return;

        const metrics = [
            'issues_closed',
            'issue_comments',
            'issues_new',
            'issue_response_time',
            'issue_resolution_duration'
        ];

        const legendData = [
            '已关闭 Issue',
            'Issue 评论',
            '新建 Issue',
            '响应时间',
            '解决时长'
        ];

        const timeAxisSet = new Set();

        // 收集所有时间点
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData) {
                metrics.forEach(metric => {
                    if (Array.isArray(projectData[metric])) {
                        projectData[metric].forEach(item => timeAxisSet.add(item.time));
                    }
                });
            }
        });

        const timeAxis = Array.from(timeAxisSet).sort();

        // 初始化数据数组
        const metricsData = {};
        metrics.forEach(metric => {
            metricsData[metric] = Array(timeAxis.length).fill(0);
        });

        // 累加每个项目的数据
        projects.forEach(project => {
            const projectData = data[project];
            if (!projectData) return;

            metrics.forEach(metric => {
                if (Array.isArray(projectData[metric])) {
                    projectData[metric].forEach(item => {
                        const timeIndex = timeAxis.indexOf(item.time);
                        if (timeIndex !== -1) {
                            metricsData[metric][timeIndex] += item.value || 0;
                        }
                    });
                }
            });
        });

        const option = {
            title: {
                text: 'Issue 变化',
                textStyle: {
                    color: '#7eb6ef'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: legendData,
                top: 30,
                textStyle: {
                    color: '#7eb6ef'
                }
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
                data: timeAxis,
                axisLabel: {
                    color: '#7eb6ef',
                    rotate: 45
                },
                axisLine: {
                    lineStyle: {
                        color: '#7eb6ef'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '数量',
                    position: 'left',
                    nameTextStyle: {
                        color: '#7eb6ef'
                    },
                    axisLabel: {
                        color: '#7eb6ef'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(126, 182, 239, 0.2)'
                        }
                    }
                },
                {
                    type: 'value',
                    name: '时间 (分钟)',
                    position: 'right',
                    nameTextStyle: {
                        color: '#7eb6ef'
                    },
                    axisLabel: {
                        color: '#7eb6ef',
                        formatter: '{value} min'
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: legendData[0],
                    type: 'bar',
                    data: metricsData.issues_closed,
                    stack: 'Issue',
                    itemStyle: { color: '#7ee787' }
                },
                {
                    name: legendData[1],
                    type: 'bar',
                    data: metricsData.issue_comments,
                    stack: 'Issue',
                    itemStyle: { color: '#79c0ff' }
                },
                {
                    name: legendData[2],
                    type: 'bar',
                    data: metricsData.issues_new,
                    stack: 'Issue',
                    itemStyle: { color: '#ff7b72' }
                },
                {
                    name: legendData[3],
                    type: 'line',
                    yAxisIndex: 1,
                    data: metricsData.issue_response_time,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { width: 3, color: '#d2a8ff' },
                    itemStyle: { color: '#d2a8ff' }
                },
                {
                    name: legendData[4],
                    type: 'line',
                    yAxisIndex: 1,
                    data: metricsData.issue_resolution_duration,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { width: 3, color: '#ffa657' },
                    itemStyle: { color: '#ffa657' }
                }
            ]
        };

        chart.setOption(option);
        this.chartOptions.issueChangesOptions = option;
    }

    /**
     * 初始化项目活跃度图表
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initProjectActivityChart(projects, data) {
        const chart = this.initializeChart('project-activity-chart');
        if (!chart) return;

        const timeAxisSet = new Set();
        const projectsData = {};

        // 收集所有时间点并初始化项目数据
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData && projectData.activity) {
                projectData.activity.forEach(item => timeAxisSet.add(item.time));
                projectsData[project] = Array(timeAxisSet.size).fill(0);
            }
        });

        const timeAxis = Array.from(timeAxisSet).sort();

        // 填充每个项目的活跃度数据
        projects.forEach(project => {
            const projectData = data[project];
            if (projectData && projectData.activity) {
                projectData.activity.forEach(item => {
                    const timeIndex = timeAxis.indexOf(item.time);
                    if (timeIndex !== -1) {
                        projectsData[project][timeIndex] = item.value || 0;
                    }
                });
            }
        });

        // 计算总活跃度
        const totalActivity = Array(timeAxis.length).fill(0);
        Object.values(projectsData).forEach(projectActivity => {
            projectActivity.forEach((value, index) => {
                totalActivity[index] += value;
            });
        });

        // 准备图表系列数据
        const series = [
            {
                name: '总活跃度',
                type: 'line',
                data: totalActivity,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { width: 3 },
                itemStyle: { color: '#7ee787' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(126, 231, 135, 0.5)' },
                        { offset: 1, color: 'rgba(126, 231, 135, 0.1)' }
                    ])
                }
            },
            ...projects.map((project, index) => ({
                name: this.getDisplayName(project),
                type: 'line',
                data: projectsData[project],
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: {
                    color: `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 110) % 255}, 0.8)`
                }
            }))
        ];

        const option = {
            title: {
                text: '项目活跃度',
                textStyle: {
                    color: '#7eb6ef'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function(params) {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['总活跃度', ...projects.map(project => this.getDisplayName(project))],
                top: 30,
                textStyle: {
                    color: '#7eb6ef'
                }
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
                boundaryGap: false,
                data: timeAxis,
                axisLabel: {
                    color: '#7eb6ef',
                    rotate: 45
                },
                axisLine: {
                    lineStyle: {
                        color: '#7eb6ef'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '活跃指数',
                nameTextStyle: {
                    color: '#7eb6ef'
                },
                axisLabel: {
                    color: '#7eb6ef'
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(126, 182, 239, 0.2)'
                    }
                }
            },
            series: series,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };

        chart.setOption(option);
        this.chartOptions.projectActivityOptions = option;
    }



    /**
     * 更新核心数据指标
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static updateCoreData(projects, data) {
        // 计算平均 OpenRank
        let openrankSum = 0;
        let openrankCount = 0;

        // 计算平均活跃度
        let activitySum = 0;
        let activityCount = 0;

        projects.forEach(project => {
            const projectData = data[project];
            if (projectData) {
                // 获取 OpenRank 的最新数据
                const openrankData = projectData.openrank || [];
                if (openrankData.length > 0) {
                    openrankSum += openrankData[openrankData.length - 1].value;
                    openrankCount++;
                }

                // 获取 Activity 的最新数据
                const activityData = projectData.activity || [];
                if (activityData.length > 0) {
                    activitySum += activityData[activityData.length - 1].value;
                    activityCount++;
                }
            }
        });

        // 计算平均值
        const openrankAvg = openrankCount ? (openrankSum / openrankCount).toFixed(2) : '0.00';
        const activityAvg = activityCount ? (activitySum / activityCount).toFixed(2) : '0.00';

        // 更新显示
        const openrankElement = document.getElementById('openrank-avg');
        const activityElement = document.getElementById('activity-avg');

        if (openrankElement) openrankElement.textContent = openrankAvg;
        if (activityElement) activityElement.textContent = activityAvg;
    }

    /**
     * 初始化 GitHub 表格
     * @param {Array<string>} projects - 项目路径数组
     * @param {Object} data - 所有项目数据
     */
    static initGithubTable(projects, data) {
        const tableContainer = document.getElementById('github-table');
        if (!tableContainer) return;

        // 计算每个项目的指标
        const projectMetrics = projects.map(project => {
            const projectData = data[project];
            if (!projectData) return null;

            // 获取最新月度数据
            const getLatestMonthlyValue = (dataType) => {
                const dataObj = projectData[dataType] || [];
                if (Array.isArray(dataObj) && dataObj.length > 0) {
                    return dataObj[dataObj.length - 1].value;
                }
                return 0;
            };

            // 使用与雷达图相同的五个维度指标
            const metrics = {
                stars: getLatestMonthlyValue('stars'),
                technical_fork: getLatestMonthlyValue('technical_fork'),
                new_contributors: getLatestMonthlyValue('new_contributors'),
                issues_closed: getLatestMonthlyValue('issues_closed'),
                change_requests_accepted: getLatestMonthlyValue('change_requests_accepted')
            };

            return {
                project: this.getDisplayName(project),
                stars: metrics.stars.toFixed(2),
                technical_fork: metrics.technical_fork.toFixed(2),
                new_contributors: metrics.new_contributors.toFixed(2),
                issues_closed: metrics.issues_closed.toFixed(2),
                change_requests_accepted: metrics.change_requests_accepted.toFixed(2)
            };
        }).filter(item => item !== null);

        // 创建表格 HTML
        const tableHTML = `
            <table style="width:100%; color:#7eb6ef; border-collapse:collapse;">
                <thead>
                    <tr style="background:rgba(0,168,255,0.1);">
                        <th style="padding:10px; text-align:left;">项目名</th>
                        <th style="padding:10px; text-align:center;">星标数</th>
                        <th style="padding:10px; text-align:center;">技术分叉</th>
                        <th style="padding:10px; text-align:center;">新贡献者</th>
                        <th style="padding:10px; text-align:center;">已解决问题</th>
                        <th style="padding:10px; text-align:center;">已接受PR</th>
                    </tr>
                </thead>
                <tbody>
                    ${projectMetrics.map((metric, index) => `
                        <tr style="background:${index % 2 === 0 ? 'rgba(0,168,255,0.05)' : 'transparent'}">
                            <td style="padding:10px; text-align:left;">${metric.project}</td>
                            <td style="padding:10px; text-align:center;">${metric.stars}</td>
                            <td style="padding:10px; text-align:center;">${metric.technical_fork}</td>
                            <td style="padding:10px; text-align:center;">${metric.new_contributors}</td>
                            <td style="padding:10px; text-align:center;">${metric.issues_closed}</td>
                            <td style="padding:10px; text-align:center;">${metric.change_requests_accepted}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        tableContainer.innerHTML = tableHTML;
    }
}
