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
        const response = await fetch(`/data/${projectPath}/${dataType}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${dataType} data for ${projectPath}:`, error);
        return null;
    }
}

// 获取所有项目数据
async function getAllProjectsData() {
    // 这里需要实现获取项目列表的逻辑
    const projects = ['AIGC-Audio/AudioGPT']; // 示例项目
    const dataTypes = [
        'openrank', 'activity', 'stars', 'technical_fork', 'attention',
        'bus_factor', 'new_contributors'
    ];
    
    const projectsData = {};
    
    for (const project of projects) {
        projectsData[project] = {};
        for (const dataType of dataTypes) {
            projectsData[project][dataType] = await loadProjectData(project, dataType);
        }
    }
    
    return projectsData;
}

// 初始化函数
async function init() {
    // 更新时间
    updateTime();
    setInterval(updateTime, 1000);
    
    // 初始化背景
    initParticles();
    
    // 加载数据
    const projectsData = await getAllProjectsData();
    
    // 初始化图表
    initCharts(projectsData);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 