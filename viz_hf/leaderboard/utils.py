import pickle
import os
from datetime import datetime
from flask import current_app as app

def load_graph():
    """
    从 pickle 文件中加载 EasyGraph 对象。
    """
    pickle_path = app.config['GRAPH_PICKLE_PATH']
    if not os.path.exists(pickle_path):
        raise FileNotFoundError(f"Pickle 文件未找到，路径: {pickle_path}")

    with open(pickle_path, 'rb') as f:
        graph = pickle.load(f)
    return graph


def get_pagination_pages(current_page, total_pages):
    """
    生成分页页码列表，包含折叠的省略号。
    """
    pages = []
    if total_pages <= 7:
        pages = list(range(1, total_pages + 1))
    else:
        if current_page <= 4:
            pages = [1, 2, 3, 4, 5, '...', total_pages]
        elif current_page >= total_pages - 3:
            pages = [1, '...', total_pages - 4, total_pages - 3, total_pages - 2, total_pages - 1, total_pages]
        else:
            pages = [1, '...', current_page - 1, current_page, current_page + 1, '...', total_pages]
    return pages


def parse_date(date_str):
    """
    将日期字符串解析为 datetime 对象。
    """
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except:
        return datetime.min

def process_nodes_v2(graph, filter_task_type, sort_by, sort_order, search_query):
    nodes_data = []
    for index, (node_id, attrs) in enumerate(graph.nodes.items()):
        if search_query and search_query.lower() not in node_id.lower():
            continue
        task_type = str(attrs.get('task_type', 'nan'))
        created_at = attrs.get('created_at', '0001-01-01') or '0001-01-01'
        downloads = attrs.get('downloads', 0) or 0
        likes = attrs.get('likes', 0) or 0
        influence = attrs.get('influence', 0.0) or 0.0
        pic = attrs.get('pic', '')
        nodes_data.append({
            'original_index': index,
            'id': node_id,
            'name': attrs.get('name', node_id),
            'created_at': created_at,
            'downloads': downloads,
            'likes': likes,
            'task_type': task_type,
            'influence': influence, 
            'pic': pic
        })
    # 筛选
    if filter_task_type != 'all':
        nodes_data = [node for node in nodes_data if node['task_type'] == filter_task_type]

    # 排序
    if sort_by and sort_order in ['desc', 'asc', 'none']:
        if sort_order == 'none':
            nodes_data.sort(key=lambda x: x.get('original_index', 0))
        else:
            reverse = sort_order == 'desc'
            if sort_by == 'created_at':
                nodes_data.sort(key=lambda x: parse_date(x.get(sort_by, '0001-01-01')), reverse=reverse)
            else:
                nodes_data.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

    return nodes_data

def process_nodes(graph, filter_task_type, sort_by, sort_order):
    """
    筛选、排序节点数据并生成节点列表。
    """
    # 获取所有节点的属性
    nodes_data = []
    for index, (node_id, attrs) in enumerate(graph.nodes.items()):
        task_type = str(attrs.get('task_type', 'nan'))
        created_at = attrs.get('created_at', '0001-01-01') or '0001-01-01'
        downloads = attrs.get('downloads', 0) or 0
        likes = attrs.get('likes', 0) or 0
        influence = attrs.get('influence', 0.0) or 0.0
        pic = attrs.get('pic', '')
        nodes_data.append({
            'original_index': index,
            'id': node_id,
            'name': attrs.get('name', node_id),
            'created_at': created_at,
            'downloads': downloads,
            'likes': likes,
            'task_type': task_type,
            'influence': influence, 
            'pic': pic
        })

    # 筛选
    if filter_task_type != 'all':
        nodes_data = [node for node in nodes_data if node['task_type'] == filter_task_type]

    # 排序
    if sort_by and sort_order in ['desc', 'asc', 'none']:
        if sort_order == 'none':
            nodes_data.sort(key=lambda x: x.get('original_index', 0))
        else:
            reverse = sort_order == 'desc'
            if sort_by == 'created_at':
                nodes_data.sort(key=lambda x: parse_date(x.get(sort_by, '0001-01-01')), reverse=reverse)
            else:
                nodes_data.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

    return nodes_data
