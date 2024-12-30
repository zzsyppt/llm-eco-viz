// leaderboard.js

// 自动提交筛选表单
document.addEventListener('DOMContentLoaded', function() {
    const filterTaskType = document.getElementById('filter_task_type');
    if (filterTaskType) {
        filterTaskType.addEventListener('change', function() {
            document.getElementById('filterForm').submit();
        });
    }
});

// 处理复选框和按钮的事件
document.addEventListener('DOMContentLoaded', function () {
    // 选择排行榜表格
    const table = document.querySelector('table');
    if (!table) {
        console.error('未找到排行榜表格');
        return;
    }

    const tbody = table.querySelector('tbody');

    // 监听全选选择框的变化
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const rowCheckboxes = tbody.querySelectorAll('.rowCheckbox');
            rowCheckboxes.forEach(function (checkbox) {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // 获取“多模型网络展示”按钮和“TOP 模型展示”按钮及其输入框
    const multiNetworkButton = document.getElementById('multiNetworkButton');
    const topKButton = document.getElementById('topKButton');
    const topKInput = document.getElementById('topKInput');

    // 监听“多模型网络展示”按钮点击事件
    if (multiNetworkButton) {
        multiNetworkButton.addEventListener('click', function () {
            const selectedCheckboxes = tbody.querySelectorAll('.rowCheckbox:checked');
            const selectedModels = [];

            selectedCheckboxes.forEach(function (checkbox) {
                const row = checkbox.closest('tr');
                if (row) {
                    // 假设 node.name 在第四列 (索引3)
                    const nameCell = row.querySelectorAll('td')[3];
                    const modelName = nameCell.textContent.trim();
                    if (modelName) {
                        selectedModels.push(encodeURIComponent(modelName));
                    }
                }
            });

            if (selectedModels.length === 0) {
                alert('请至少选择一个模型进行展示。');
                return;
            }

            const baseModelsParam = selectedModels.join(',');
            const url = `/network/specific_large_graph/?base_model_to_show=${baseModelsParam}`;
            window.open(url, '_blank'); // 在新标签页中打开
        });
    }

    // 监听“TOP 模型展示”按钮点击事件
    if (topKButton && topKInput) {
        topKButton.addEventListener('click', function () {
            const topKValue = topKInput.value.trim();

            if (topKValue === '' || isNaN(topKValue) || parseInt(topKValue) < 1) {
                alert('请输入一个有效的正整数作为 TOP K 值。');
                return;
            }

            const topK = parseInt(topKValue);
            const url = `/network/large_graph/?top_k=${topK}`;
            window.open(url, '_blank'); // 在新标签页中打开
        });
    }

    // 为每一行的选择框添加点击事件，取消全选选择框的选中状态
    const rowCheckboxes = tbody.querySelectorAll('.rowCheckbox');
    rowCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            if (!checkbox.checked && selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            } else if (selectAllCheckbox) {
                const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            }
        });
    });
});
