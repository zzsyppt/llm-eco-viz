// 获取 URL 中的 view_type 参数
function getViewTypeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('view_type') || '1'; // 默认值为 '1'
}

// 获取 URL 中的 base_model 参数
function getBaseModelFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('base_model') || "meta-llama/Meta-Llama-3-70B"; // 默认 base_model
}

// 更新下拉菜单的选中项
function setSelectedView() {
    const viewType = getViewTypeFromURL(); // 获取当前的 view_type
    const selectElement = document.getElementById('view-selector');
    selectElement.value = viewType; // 设置 select 元素的选中项
}

// 修改视图类型并刷新页面
function changeView(viewType) {
    window.location.href = window.location.pathname + "?base_model=" + getBaseModelFromURL() + "&view_type=" + viewType;
}

// 页面加载完成时设置选中项
window.onload = setSelectedView;

// 监听节点点击事件
network.on("selectNode", function (params) {
    var nodeId = params.nodes[0]; // 获取节点 ID
    var nodeDetails = nodes.get(nodeId); // 获取节点数据
    var customDetails = nodeDetails.things_to_show_on_sidebar; // 获取自定义信息（HTML）
    document.getElementById("node-details").innerHTML = customDetails; // 更新侧边栏内容
});
