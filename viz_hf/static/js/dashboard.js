// global_dashboard/static/js/dashboard.js

document.addEventListener('DOMContentLoaded', function () {
    // 获取嵌入的数据，使用默认值确保不会出现 Undefined
    const languageInfo = window.dashboardData.languageInfo || {};
    const orgTypeInfo = window.dashboardData.orgTypeInfo || {};
    const taskTypeInfo = window.dashboardData.taskTypeInfo || {};
    const authorInfo = window.dashboardData.authorInfo || {};

    const languageDict = window.dashboardData.languageDict || {};
    const orgTypeDict = window.dashboardData.orgTypeDict || {};
    const taskTypeDict = window.dashboardData.taskTypeDict || {};
    const authorDict = window.dashboardData.authorDict || {};
    const top20Models = window.dashboardData.top20_models || [];

    // 获取CSS变量，如果没有定义，提供默认颜色
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--primary-color').trim() || '#00e6e6';
    const secondaryColor = rootStyles.getPropertyValue('--secondary-color').trim() || '#ff4081';

    // 1. 语言热度排行榜
    const languageHeatTableBody = document.querySelector('#languageHeatTable tbody');
    
    if (!languageHeatTableBody) {
        console.error('找不到 #languageHeatTable tbody 元素！');
    } else {
        // 获取语言按照总影响力排序
        const sortedLanguages = Object.entries(languageInfo)
            .sort((a, b) => parseFloat(b[1].total_influence) - parseFloat(a[1].total_influence));

        console.log('Sorted Languages:', sortedLanguages); // 调试日志

        // 选择前10项并归类“Others”
        const topNLanguages = 7;
        const topLanguages = sortedLanguages.slice(0, topNLanguages);
        const otherLanguages = sortedLanguages.slice(topNLanguages);

        // 提取标签和数据
        const languageHeatLabels = topLanguages.map(entry => entry[0]);
        const languageHeatDataValues = topLanguages.map(entry => parseFloat(entry[1].total_influence) || 0);
        const languageHeatNumModels = topLanguages.map(entry => parseInt(entry[1].num_models) || 0);

        // 计算“Others”类别的总影响力
        const otherTotalInfluence = Array.isArray(otherLanguages) ? otherLanguages.reduce((sum, entry) => {
            const influence = parseFloat(entry[1].total_influence) || 0;
            console.log(`Language: ${entry[0]}, Influence: ${influence}`); // 调试日志
            return sum + influence;
        }, 0) : 0;
        // 计算“Others”类别的模型数量
        const otherTotalNumModels = Array.isArray(otherLanguages) ? otherLanguages.reduce((sum, entry) => {
            const numModels = parseInt(entry[1].num_models) || 0;
            console.log(`Language: ${entry[0]}, NumModels: ${numModels}`); // 调试日志
            return sum + numModels;
        }, 0) : 0;

        console.log(`Total Influence for Others: ${otherTotalInfluence}`); // 调试日志

        if (otherTotalInfluence > 0) {
            languageHeatLabels.push('Others');
            languageHeatDataValues.push(otherTotalInfluence);
            languageHeatNumModels.push(otherTotalNumModels);
        } 

        // 确保标签和数据长度一致
        if (languageHeatLabels.length !== languageHeatDataValues.length) {
            console.error('语言标签和数据的长度不一致！');
        }

        // 动态生成表格内容
        languageHeatLabels.forEach((language, index) => {
            const totalInfluence = languageHeatDataValues[index];
            const totalNumModels = languageHeatNumModels[index];
            const row = document.createElement('tr');
            
            // 创建排名单元格
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);
            
            // 创建语言单元格
            const languageCell = document.createElement('td');
            languageCell.textContent = language;
            languageCell.style.cursor = 'pointer';
            languageCell.style.color = primaryColor;
            languageCell.style.textDecoration = 'underline';
            languageCell.addEventListener('click', () => {
                displayTop10('language', language);
            });
            row.appendChild(languageCell);
            
            // 创建总影响力单元格
            const influenceCell = document.createElement('td');
            influenceCell.textContent = totalInfluence.toFixed(2);
            row.appendChild(influenceCell);

            // 创建模型数量单元格
            const numModelsCell = document.createElement('td');
            numModelsCell.textContent = totalNumModels;
            row.appendChild(numModelsCell);

            languageHeatTableBody.appendChild(row);
        });
    }

    // 2. 公司类型排行榜
    const orgTypeCtx = document.getElementById('orgTypeChart').getContext('2d');

    const orgTypeData = {
        labels: Object.keys(orgTypeInfo),
        datasets: [{
            label: '总影响力',
            data: Object.values(orgTypeInfo).map(info => parseFloat(info.total_influence) || 0),
            backgroundColor: 'rgba(0, 230, 230, 0.6)',
            borderColor: 'rgba(0, 230, 230, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(0, 230, 230, 0.8)',
            hoverBorderColor: 'rgba(0, 230, 230, 1)'
        }]
    };

    const orgTypeChart = new Chart(orgTypeCtx, {
        type: 'bar',
        data: orgTypeData,
        options: {
            responsive: true,
            onClick: (evt, item) => {
                if (item.length > 0) {
                    const index = item[0].index;
                    const orgType = orgTypeChart.data.labels[index];
                    displayTop10('org_type', orgType);
                }
            },
            scales: {
                y: {
                    type: 'logarithmic', // 使用对数刻度
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '总影响力 (对数刻度)'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            return Number(value.toString()); // 移除 "k" 等单位
                        },
                        color: '#ffffff'
                    },
                    grid: {
                        color: '#444'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '公司类型',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: '#444'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: primaryColor,
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            if (label) {
                                return `${label}: ${context.parsed.y}`;
                            }
                            return context.parsed.y;
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });

    // 3. 任务类型排行榜
    const taskTypeCtx = document.getElementById('taskTypeChart').getContext('2d');

    // 获取任务类型按照总影响力排序
    const sortedTaskTypes = Object.entries(taskTypeInfo)
        .sort((a, b) => b[1].total_influence - a[1].total_influence);

    const topN = 6;
    const topTaskTypes = sortedTaskTypes.slice(0, topN);
    const otherTaskTypes = sortedTaskTypes.slice(topN);

    const taskTypeLabels = topTaskTypes.map(entry => entry[0]);
    const taskTypeDataValues = topTaskTypes.map(entry => parseFloat(entry[1].total_influence) || 0);

    // 计算“Others”类别的总影响力
    const otherTotalInfluenceTask = otherTaskTypes.reduce((sum, entry) => sum + (parseFloat(entry[1].total_influence) || 0), 0);
    if (otherTotalInfluenceTask > 0) {
        taskTypeLabels.push('Others');
        taskTypeDataValues.push(otherTotalInfluenceTask);
    }

    // 确保标签和数据长度一致
    if (taskTypeLabels.length !== taskTypeDataValues.length) {
        console.error('标签和数据的长度不一致！');
    }

    const taskTypeData = {
        labels: taskTypeLabels,
        datasets: [{
            label: '总影响力',
            data: taskTypeDataValues,
            backgroundColor: 'rgba(255, 64, 129, 0.6)',
            borderColor: 'rgba(255, 64, 129, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255, 64, 129, 0.8)',
            hoverBorderColor: 'rgba(255, 64, 129, 1)'
        }]
    };

    const taskTypeChart = new Chart(taskTypeCtx, {
        type: 'bar',
        data: taskTypeData,
        options: {
            indexAxis: 'y', // 转换为水平柱状图
            responsive: true,
            onClick: (evt, item) => {
                if (item.length > 0) {
                    const index = item[0].index;
                    const taskType = taskTypeChart.data.labels[index];
                    displayTop10('task_type', taskType);
                }
            },
            scales: {
                x: {
                    type: 'logarithmic', // 使用对数刻度
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '总影响力 (对数刻度)',
                        color: '#ffffff'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            return Number(value.toString()); // 移除 "k" 等单位
                        },
                        color: '#ffffff'
                    },
                    grid: {
                        color: '#444'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '任务类型',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: '#444'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: primaryColor,
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            if (label) {
                                return `${label}: ${context.parsed.x}`;
                            }
                            return context.parsed.x;
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });

    // 4. 作者排行榜
    const authorHeatTableBody = document.querySelector('#authorHeatTable tbody');

    if (!authorHeatTableBody) {
        console.error('找不到 #authorHeatTable tbody 元素！');
    } else {
        // 获取作者按照总影响力排序
        const sortedAuthors = Object.entries(authorInfo)
            .sort((a, b) => parseFloat(b[1].total_influence) - parseFloat(a[1].total_influence));

        console.log('Sorted Authors:', sortedAuthors); // 调试日志

        // 选择前10项并归类“Others”
        const topNAuthors = 7;
        const topAuthors = sortedAuthors.slice(0, topNAuthors);
        const otherAuthors = sortedAuthors.slice(topNAuthors);

        // 提取作者名称和数据
        const authorHeatLabels = topAuthors.map(entry => entry[0]);
        const authorHeatDataValues = topAuthors.map(entry => parseFloat(entry[1].total_influence) || 0);
        const authorHeatNumModels = topAuthors.map(entry => parseInt(entry[1].num_models) || 0);

        // 计算“Others”类别的总影响力和模型数量
        let otherTotalInfluenceAuthors = 0;
        let otherNumModelsAuthors = 0;
        if (otherAuthors.length > 0) {
            otherTotalInfluenceAuthors = otherAuthors.reduce((sum, entry) => sum + (parseFloat(entry[1].total_influence) || 0), 0);
            otherNumModelsAuthors = otherAuthors.reduce((sum, entry) => sum + (parseInt(entry[1].num_models) || 0), 0);
        }

        if (otherTotalInfluenceAuthors > 0) {
            authorHeatLabels.push('Others');
            authorHeatDataValues.push(otherTotalInfluenceAuthors);
            authorHeatNumModels.push(otherNumModelsAuthors);
        }

        // 确保标签和数据长度一致
        if (authorHeatLabels.length !== authorHeatDataValues.length || authorHeatLabels.length !== authorHeatNumModels.length) {
            console.error('作者标签和数据的长度不一致！');
        }

        // 动态生成表格内容
        authorHeatLabels.forEach((author, index) => {
            const totalInfluence = authorHeatDataValues[index];
            const numModels = authorHeatNumModels[index];
            const row = document.createElement('tr');
            
            // 创建排名单元格
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);
            
            // 创建作者单元格
            const authorCell = document.createElement('td');
            authorCell.textContent = author;
            authorCell.style.cursor = 'pointer';
            authorCell.style.color = primaryColor;
            authorCell.style.textDecoration = 'underline';
            authorCell.addEventListener('click', () => {
                displayTop10('author', author);
            });
            row.appendChild(authorCell);
            
            // 创建总影响力单元格
            const influenceCell = document.createElement('td');
            influenceCell.textContent = totalInfluence.toFixed(2);
            row.appendChild(influenceCell);

            // 创建模型数量单元格
            const numModelsCell = document.createElement('td');
            numModelsCell.textContent = numModels;
            row.appendChild(numModelsCell);
            
            authorHeatTableBody.appendChild(row);
        });
    }

    // 5. 预留面板的简单示例
    renderTreemap(top20Models);
    /**
     * 渲染TOP20大模型树图
     * @param {Array} data - 包含前20个模型的信息
     */
    function renderTreemap(data) {
        if (data.length === 0) {
            console.warn('没有TOP20模型数据可供渲染。');
            return;
        }
    
        // 设置尺寸
        const treemapContainer = document.getElementById('treemap');
        const width = treemapContainer.clientWidth;
        const height = treemapContainer.clientHeight || 600;  // 可以根据需要调整高度
    
        // 移除之前的SVG（如果有）
        d3.select("#treemap").select("svg").remove();
    
        // 创建SVG元素
        const svg = d3.select("#treemap")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("font", "12px 'Noto Sans SC', sans-serif");  // 使用支持中文的字体
    
        // 创建层次结构数据
        const root = d3.hierarchy({children: data})
            .sum(d => d.score)  // 使用综合评分作为值
            .sort((a, b) => b.value - a.value);
    
        // 创建树图布局
        d3.treemap()
            .size([width, height])
            .padding(1)
            .round(true)
            (root);
    
        // 创建颜色比例尺
        const color = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.score)])
            .interpolator(d3.interpolateBlues);
    
        // 添加矩形
        const cells = svg.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
        cells.append("rect")
            .attr("id", d => d.data.name)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => color(d.data.score))
            .attr("stroke", "#fff")
            .on("click", function(event, d) {
                displayTop10('model', d.data.name);
            })
            .append("title")
            .text(d => `${d.data.name}\n下载量: ${d.data.downloads}\n点赞量: ${d.data.likes}\n影响力: ${d.data.influence}`);
    
        // 使用 foreignObject 嵌入 HTML 文本
        cells.append("foreignObject")
            .attr("x", 4)
            .attr("y", 4)
            .attr("width", d => d.x1 - d.x0 - 8)
            .attr("height", d => d.y1 - d.y0 - 8)
            .append("xhtml:div")
            .style("width", "100%")
            .style("height", "100%")
            .style("overflow", "hidden")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("text-align", "center")
            .style("color", "#fff")
            .style("font-size", d => {
                const rectWidth = d.x1 - d.x0;
                const rectHeight = d.y1 - d.y0;
                const area = rectWidth * rectHeight;
                // 定义字体大小的最小值和最大值
                const minFont = 10;
                const maxFont = 24;
                // 根据面积计算字体大小，可以调整系数以适应需求
                const fontSize = Math.sqrt(area) / 10;
                return Math.max(minFont, Math.min(maxFont, fontSize)) + "px";
            })
            .html(d => {
                const text = d.data.name;
                // 将文本分割为多行
                const words = text.split(/(?=[A-Z])|(?=[\u4e00-\u9fa5])/);
                let html = "";
                words.forEach(word => {
                    html += `<div>${word}</div>`;
                });
                return html;
            })
            .style("pointer-events", "none");  // 禁止文本接收鼠标事件
    }

    // 获取模态框元素
    const top10Modal = new bootstrap.Modal(document.getElementById('top10Modal'));
    const top10List = document.getElementById('top10List');
    const top10ModalLabel = document.getElementById('top10ModalLabel');

    // 显示Top10模型的函数
    function displayTop10(category, value) {
        let top10 = [];
        let metaData = {};
        if (category === 'language') {
            top10 = languageDict[value] || [];
            metaData = languageInfo[value] || {};
        } else if (category === 'org_type') {
            top10 = orgTypeDict[value] || [];
            metaData = orgTypeInfo[value] || {};
        } else if (category === 'task_type') {
            top10 = taskTypeDict[value] || [];
            metaData = taskTypeInfo[value] || {};
        } else if (category === 'author') {
            top10 = authorDict[value] || [];
            metaData = authorInfo[value] || {};
        } else if (category === 'model') {
            // 假设有对应的model信息，可以自行扩展
            top10 = []; // 根据需求填充
            metaData = {};
        }

        // 更新模态框标题
        top10ModalLabel.textContent = `${category === 'language' ? '语言' : category === 'org_type' ? '机构类型' : category === 'task_type' ? '任务类型' : category === 'author' ? '作者' : '模型'}: ${value}`;

        // 清空之前的列表
        top10List.innerHTML = '';

        // 填充新的Top10模型信息
        if (top10.length === 0) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item text-center';
            listItem.textContent = '暂无数据';
            top10List.appendChild(listItem);
        } else {
            top10.forEach(model => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';

                // 模型信息容器
                const modelInfo = document.createElement('div');
                modelInfo.style.display = 'flex';
                modelInfo.style.alignItems = 'center';
                modelInfo.style.marginBottom = '15px';

                // 模型图片
                const img = document.createElement('img');
                img.src = model.pic;
                img.alt = model.name;
                img.style.width = '60px';
                img.style.height = '60px';
                img.style.borderRadius = '50%';
                img.style.marginRight = '15px';
                img.style.objectFit = 'cover';
                img.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';

                // 模型名称和链接
                const modelName = document.createElement('h2');
                modelName.style.margin = '0';
                modelName.style.fontSize = '1.25rem';
                modelName.style.fontWeight = '700';

                const modelLink = document.createElement('a');
                modelLink.href = `https://huggingface.co/${model.name}`;
                modelLink.target = '_blank';
                modelLink.textContent = model.name;
                modelLink.style.color = 'var(--primary-color)';
                modelLink.style.textDecoration = 'none';
                modelLink.addEventListener('mouseover', () => {
                    modelLink.style.textDecoration = 'underline';
                });
                modelLink.addEventListener('mouseout', () => {
                    modelLink.style.textDecoration = 'none';
                });

                modelName.appendChild(modelLink);

                // 添加图片和名称到容器
                modelInfo.appendChild(img);
                modelInfo.appendChild(modelName);

                // 添加模型信息到列表项
                listItem.appendChild(modelInfo);

                // 其他详细信息
                const details = document.createElement('div');
                details.innerHTML = `
                    <p>任务类型: ${model.task_type}</p>
                    <p>作者: ${model.author_full_name}</p>
                    <p>创建时间: ${model.created_at}</p>
                    <p>下载次数: ${model.downloads}</p>
                    <p>点赞数: ${model.likes}</p>
                    <p>影响力: ${parseFloat(model.influence).toFixed(2)}</p>
                `;
                listItem.appendChild(details);

                top10List.appendChild(listItem);
            });
        }

        // 如果是 "Others" 类别，显示相关信息
        if (value === 'Others') {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item text-center';
            listItem.innerHTML = `
                <strong>其他模型</strong><br>
                详细信息见图表
            `;
            top10List.appendChild(listItem);
        }

        // 显示模态框
        top10Modal.show();
    }
});
