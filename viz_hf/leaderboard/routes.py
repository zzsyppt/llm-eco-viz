from flask import Blueprint, render_template, request
from .utils import load_graph, get_pagination_pages, process_nodes

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/', methods=['GET'])
def leaderboard():
    """
    显示排行榜页面，支持排序、筛选和分页功能。
    """
    # 加载图对象
    graph = load_graph()

    # 获取筛选和排序参数
    filter_task_type = request.args.get('filter_task_type', 'all')
    sort_by = request.args.get('sort_by', 'influence')
    sort_order = request.args.get('sort_order', 'desc')
    # 提取所有任务类型（从未过滤的数据中）
    all_task_types = sorted(list(set(
        str(node['task_type']) for node in graph.nodes.values() if node['task_type'] not in [None, 'nan']
    )))
    # 获取分页参数
    page = max(1, int(request.args.get('page', 1)))
    per_page = max(30, int(request.args.get('per_page', 30)))

    # 筛选和排序节点
    nodes_data = process_nodes(graph, filter_task_type, sort_by, sort_order)

    # 获取总项目数和总页数
    total_nodes = len(nodes_data)
    total_pages = (total_nodes + per_page - 1) // per_page

    # 确保当前页码不超过总页数
    if page > total_pages and total_pages != 0:
        page = total_pages

    # 计算起始和结束索引
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page

    # 切片 nodes_data 以获取当前页的数据
    paginated_nodes = nodes_data[start_idx:end_idx]

    # 添加排名列
    for rank, node in enumerate(paginated_nodes, start=start_idx + 1):
        node['rank'] = rank

    # 获取分页信息
    has_prev = page > 1
    has_next = page < total_pages
    pages = get_pagination_pages(page, total_pages)

    return render_template(
        'leaderboard.html',
        nodes=paginated_nodes,
        task_types=all_task_types,
        selected_task_type=filter_task_type,
        selected_sort=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        total_nodes=total_nodes,
        has_prev=has_prev,
        has_next=has_next,
        pages=pages
    )
