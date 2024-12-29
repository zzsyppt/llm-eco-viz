// leaderboard.js

// 自动提交筛选表单
document.addEventListener('DOMContentLoaded', function() {
    const filterTaskType = document.getElementById('filter_task_type');
    filterTaskType.addEventListener('change', function() {
        document.getElementById('filterForm').submit();
    });
});

// 表头排序逻辑已通过模板中的链接实现，无需额外JS
