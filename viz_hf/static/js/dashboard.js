// static/js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // 获取模态窗口元素
    var modal = document.getElementById('detailsModal');
    var span = document.getElementsByClassName('close')[0];
    var detailsContent = document.getElementById('detailsContent');

    // 点击关闭按钮关闭模态窗口
    span.onclick = function() {
        modal.style.display = 'none';
    }

    // 点击窗口外部关闭模态窗口
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // 函数：显示详细信息
    window.showDetails = function(title, content) {
        detailsContent.innerHTML = `<span class="close">&times;</span><h2>${title}</h2>${content}`;
        modal.style.display = 'block';

        // 重新绑定关闭事件，因为内容被替换
        var newSpan = detailsContent.querySelector('.close');
        newSpan.onclick = function() {
            modal.style.display = 'none';
        }
    }
});
