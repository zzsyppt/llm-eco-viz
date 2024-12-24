document.addEventListener('DOMContentLoaded', function () {
    // 动态更新日期和时间
    function updateDateTime() {
        const now = new Date();
        const datetime = now.toLocaleString('zh-CN', { hour12: false });
        document.getElementById('datetime').textContent = datetime;
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 初始化图表
    const prEfficiencyChart = echarts.init(document.getElementById('pr-efficiency'));
    const openrankTrendChart = echarts.init(document.getElementById('openrank-trend'));
    const radarChart = echarts.init(document.getElementById('radar-chart'));
    const attentionTrendChart = echarts.init(document.getElementById('attention-trend'));
    const developerActivityChart = echarts.init(document.getElementById('developer-activity'));
    const projectActivityChart = echarts.init(document.getElementById('project-activity'));

    // 示例数据
    const exampleProjects = ['angular/angular', 'ant-design/ant-design', 'apache/airflow'];
    const prData = {
        projects: exampleProjects,
        prCounts: [1200, 800, 1500],
        prTimes: [30, 45, 25]
    };
    const openrankData = {
        projects: exampleProjects,
        openrank: [500, 450, 480]
    };
    const radarData = {
        indicators: ['影响力', '趋势', '活动', '响应度', 'GitHub综合评分'],
        values: [
            [80, 70, 90, 85, 88],
            [75, 80, 85, 80, 82],
            [78, 75, 88, 90, 85]
        ]
    };
    const attentionData = {
        projects: exampleProjects,
        attention: [3000, 2500, 3200]
    };
    const developerActivityData = {
        projects: exampleProjects,
        activity: [100, 90, 110]
    };
    const projectActivityData = {
        projects: exampleProjects,
        activity: [1800, 1600, 2000]
    };

    // PR处理效率图表配置
    prEfficiencyChart.setOption({
        title: { text: 'PR处理效率', textStyle: { color: '#ffffff' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['PR数量', '处理时长'], textStyle: { color: '#ffffff' } },
        xAxis: { type: 'category', data: prData.projects, axisLabel: { color: '#ffffff' } },
        yAxis: [
            { type: 'value', name: 'PR数量', axisLabel: { color: '#ffffff' } },
            { type: 'value', name: '处理时长', axisLabel: { color: '#ffffff' } }
        ],
        series: [
            { name: 'PR数量', type: 'bar', data: prData.prCounts, itemStyle: { color: '#3398DB' } },
            { name: '处理时长', type: 'line', yAxisIndex: 1, data: prData.prTimes, itemStyle: { color: '#FF9F7F' } }
        ]
    });

    // OpenRank趋势图表配置
    openrankTrendChart.setOption({
        title: { text: 'OpenRank趋势', textStyle: { color: '#ffffff' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['OpenRank'], textStyle: { color: '#ffffff' } },
        xAxis: { type: 'category', data: openrankData.projects, axisLabel: { color: '#ffffff' } },
        yAxis: { type: 'value', axisLabel: { color: '#ffffff' } },
        series: [
            { name: 'OpenRank', type: 'line', data: openrankData.openrank, itemStyle: { color: '#FF9F7F' } }
        ]
    });

    // 雷达图配置
    radarChart.setOption({
        title: { text: '开源项目综合对比', textStyle: { color: '#ffffff' } },
        tooltip: {},
        legend: { data: exampleProjects, textStyle: { color: '#ffffff' } },
        radar: {
            indicator: radarData.indicators.map(indicator => ({ name: indicator, max: 100 })),
            shape: 'circle',
            splitNumber: 5,
            axisName: { color: '#ffffff' },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.5)' } },
            splitArea: { areaStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
            axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.5)' } }
        },
        series: [{
            name: '项目对比',
            type: 'radar',
            data: radarData.values.map((value, index) => ({ value, name: exampleProjects[index] })),
            itemStyle: { color: '#FF9F7F' }
        }]
    });

    // 关注度趋势图表配置
    attentionTrendChart.setOption({
        title: { text: '关注度趋势', textStyle: { color: '#ffffff' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['关注度'], textStyle: { color: '#ffffff' } },
        xAxis: { type: 'category', data: attentionData.projects, axisLabel: { color: '#ffffff' } },
        yAxis: { type: 'value', axisLabel: { color: '#ffffff' } },
        series: [
            { name: '关注度', type: 'line', data: attentionData.attention, itemStyle: { color: '#FF9F7F' } }
        ]
    });

    // 开发者活跃度图表配置
    developerActivityChart.setOption({
        title: { text: '开发者活跃度', textStyle: { color: '#ffffff' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['活跃度'], textStyle: { color: '#ffffff' } },
        xAxis: { type: 'category', data: developerActivityData.projects, axisLabel: { color: '#ffffff' } },
        yAxis: { type: 'value', axisLabel: { color: '#ffffff' } },
        series: [
            { name: '活跃度', type: 'line', data: developerActivityData.activity, itemStyle: { color: '#FF9F7F' } }
        ]
    });

    // 项目活跃度图表配置
    projectActivityChart.setOption({
        title: { text: '项目活跃度', textStyle: { color: '#ffffff' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['活跃度'], textStyle: { color: '#ffffff' } },
        xAxis: { type: 'category', data: projectActivityData.projects, axisLabel: { color: '#ffffff' } },
        yAxis: { type: 'value', axisLabel: { color: '#ffffff' } },
        series: [
            { name: '活跃度', type: 'line', data: projectActivityData.activity, itemStyle: { color: '#FF9F7F' } }
        ]
    });
});
