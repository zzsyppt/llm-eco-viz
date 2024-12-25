// 时间更新函数
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('current-time').textContent = timeStr;
}

// 初始化粒子背景
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#ffffff'
            },
            opacity: {
                value: 0.5,
                random: false
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#00a8ff',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        }
    });
}

// 数据加载函数
async function loadProjectData(projectPath, dataType) {
    try {
        const response = await fetch(`http://localhost:8080/frontend/data/${projectPath}/${dataType}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${dataType} data for ${projectPath}:`, error);
        return null;
    }
}

// 获取所有项目数据
async function getAllProjectsData() {
    // 实际的项目列表
    const projects = [
        'martiansideofthemoon/ai-detection-paraphrases',
        'mayooear/gpt4-pdf-chatbot-langchain'
    ];
    
    // 从data_type.yml中获取的数据类型
    const dataTypes = {
        type: [
            'openrank', 'activity', 'stars', 'technical_fork', 'attention',
            'bus_factor', 'new_contributors'
        ],
        issue: [
            'issues_closed', 'issue_comments', 'issues_new',
            'issue_response_time', 'issue_resolution_duration'
        ],
        change_requests: [
            'change_requests_accepted', 'change_requests', 'change_requests_reviews',
            'change_request_response_time', 'change_request_resolution_duration'
        ],
        code_change_lines: [
            'code_change_lines_remove', 'code_change_lines_add'
        ]
    };
    
    const projectsData = {};
    
    for (const project of projects) {
        projectsData[project] = {};
        // 加载所有类型的数据
        for (const category in dataTypes) {
            for (const dataType of dataTypes[category]) {
                try {
                    const response = await fetch(`http://localhost:8080/frontend/data/${project}/${dataType}.json`);
                    if (response.ok) {
                        const data = await response.json();
                        projectsData[project][dataType] = data;
                    } else {
                        console.error(`Failed to load ${dataType} data for ${project}: ${response.status}`);
                    }
                } catch (error) {
                    console.error(`Error loading ${dataType} data for ${project}:`, error);
                    projectsData[project][dataType] = null;
                }
            }
        }
    }
    
    return projectsData;
}

// 处理时间序列数据的辅助函数
function processTimeSeriesData(projectsData, dataType) {
    // 收集所有时间点
    const timePoints = new Set();
    Object.values(projectsData).forEach(project => {
        if (project[dataType]) {
            // 直接使用对象的键作为时间点
            Object.keys(project[dataType]).forEach(time => timePoints.add(time));
        }
    });
    
    // 转换为数组并排序
    const sortedTimePoints = Array.from(timePoints).sort();
    
    // 为每个项目准备数据
    const seriesData = {};
    Object.keys(projectsData).forEach(projectName => {
        const projectData = projectsData[projectName][dataType];
        if (projectData) {
            seriesData[projectName] = sortedTimePoints.map(time => ({
                time: time,
                // 直接从数据对象中获取值
                value: projectData[time] || 0
            }));
        }
    });
    
    return {
        timePoints: sortedTimePoints,
        seriesData: seriesData
    };
}

// 初始化函数
async function init() {
    try {
        // 更新时间
        updateTime();
        setInterval(updateTime, 1000);
        
        // 初始化背景
        initParticles();
        
        // 加载数据
        const projectsData = await getAllProjectsData(); // 恢复异步加载
        console.log('Loaded project data:', projectsData);
        
        // 初始化图表
        if (projectsData) {
            initCharts(projectsData);
        } else {
            console.error('Failed to load project data');
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);