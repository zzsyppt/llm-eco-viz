 # global_dashboard/utils.py
import os
import pickle
import heapq
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

""" save for future use.
def generate_json(graph):
    '''
    将eg_graph对象转换为json格式，
    格式如下：
    {
        model1:{
            'name': 'model1',
            'task_type': 'classification',
            'author_full_name': 'Meta-Llama',
            'created_at': '2021-01-01',
            'downloads': 100,
            'likes': 100,
            'influence': 0.9,
            'pic': 'model1.jpg'
        },
        ...
    }
    '''
    nodes_data = {}
    for node_id, attrs in graph.nodes.items():
        task_type = str(attrs.get('task_type', 'nan'))
        created_at = attrs.get('created_at', '0001-01-01') or '0001-01-01'
        downloads = attrs.get('downloads', 0) or 0
        likes = attrs.get('likes', 0) or 0
        influence = attrs.get('influence', 0.0) or 0.0
        pic = attrs.get('pic', '')
        nodes_data[node_id] = {
            'name': attrs.get('name', node_id),
            'task_type': task_type,
            'author_full_name': attrs.get('author_full_name', 'Unknown'),
            'created_at': created_at,
            'downloads': downloads,
            'likes': likes,
            'influence': influence,
            'pic': pic
        }
    return nodes_data
"""

def language_module(graph):
    '''
    读取eg_graph文件，按语言分类模型，并且记录该语言的按influence排名前10的模型全部信息，
    用于制作模型语言热度图
    ''' 
    language_dict = {}
    
    # 按语言分类所有模型
    for node_id, attrs in graph.nodes.items():
        language_lst = attrs.get('language', ['Unknown']) or ['Unknown']
        if isinstance(language_lst, str):
            language_lst = [language_lst]
        influence = attrs.get('influence', 0.0) or 0.0
        model_info = {
            'name': attrs.get('name', node_id),
            'task_type': attrs.get('task_type', 'Unknown'),
            'author_full_name': attrs.get('author_full_name', 'Unknown'),
            'created_at': attrs.get('created_at', '0001-01-01') or '0001-01-01',
            'downloads': attrs.get('downloads', 0) or 0,
            'likes': attrs.get('likes', 0) or 0,
            'influence': influence,
            'pic': attrs.get('pic', '')
        }
        language_mapping = {
            "en": "英语",
            "th": "泰语",
            "zh": "中文",
            "ko": "韩语",
            "pt": "葡萄牙语",
            "ar": "阿拉伯语",
            "es": "西班牙语",
            # ... to be updated
        }
        for language in language_lst: 
            language = language_mapping[language] if language in language_mapping.keys() else language
            if language not in language_dict.keys(): 
                language_dict[language] = []
        if language ==  'Unknown' or language == 'multilingual':
            continue
        language_dict[language].append(model_info)
    
    language_info = {}

    # 计算每种语言的模型数量与总influence
    for language, models in language_dict.items():
        total_influence = sum(model['influence'] for model in models)
        language_info[language] = {
            'num_models': len(models),
            'total_influence': total_influence
        }

    # 对每种语言的模型按influence降序排序，并保留前10名
    for language, models in language_dict.items():
        top10 = heapq.nlargest(10, models, key=lambda x: x['influence'])
        language_dict[language] = top10
    return language_dict, language_info

def org_type_module(graph):
    '''
    读取eg_graph文件，按机构类型分类模型，并且记录该机构类型的按influence排名前10的模型全部信息，
    用于制作模型机构类型热度图
    ''' 
    org_type_dict = {}
    
    # 按机构类型分类所有模型
    for node_id, attrs in graph.nodes.items():
        org_type = attrs.get('org_type', '_unauthorized') or '_unauthorized'
        influence = attrs.get('influence', 0.0) or 0.0
        model_info = {
            'name': node_id,
            'task_type': attrs.get('task_type', 'Unknown'),
            'author_full_name': attrs.get('author_full_name', 'Unknown'),
            'created_at': attrs.get('created_at', '0001-01-01') or '0001-01-01',
            'downloads': attrs.get('downloads', 0) or 0,
            'likes': attrs.get('likes', 0) or 0,
            'influence': influence,
            'pic': attrs.get('pic', '')
        }
        
        if org_type == 'individual':
            continue

        if org_type not in org_type_dict:
            org_type_dict[org_type] = []
        
        org_type_dict[org_type].append(model_info)
    org_type_info={}
    # 计算每种机构类型的模型数量与总influence
    for org_type, models in org_type_dict.items():
        total_influence = sum(model['influence'] for model in models)
        org_type_info[org_type] = {
            'num_models': len(models),
            'total_influence': total_influence
        }

    # 对每种机构类型的模型按influence降序排序，并保留前10名
    for org_type, models in org_type_dict.items():
        top10 = heapq.nlargest(10, models, key=lambda x: x['influence'])
        org_type_dict[org_type] = top10
    
    return org_type_dict, org_type_info

def task_type_module(graph):
    '''
    读取eg_graph文件，按任务类型分类模型，并且记录该任务类型的按influence排名前10的模型全部信息，
    用于制作模型任务类型热度图
    ''' 
    task_type_dict = {}
    
    # 按任务类型分类所有模型
    for node_id, attrs in graph.nodes.items():
        task_type = attrs.get('task_type', 'Unknown') or 'Unknown'
        influence = attrs.get('influence', 0.0) or 0.0
        model_info = {
            'name': node_id,
            'task_type': attrs.get('task_type', 'Unknown'), 
            'author_full_name': attrs.get('author_full_name', 'Unknown'),
            'created_at': attrs.get('created_at', '0001-01-01') or '0001-01-01',
            'downloads': attrs.get('downloads', 0) or 0,
            'likes': attrs.get('likes', 0) or 0,
            'influence': influence,
            'pic': attrs.get('pic', '')
        }
        
        if task_type not in task_type_dict:
            task_type_dict[task_type] = []
        
        task_type_dict[task_type].append(model_info)
    task_type_info={}
    # 计算每种任务类型的模型数量与总influence
    for task_type, models in task_type_dict.items():
        total_influence = sum(model['influence'] for model in models)
        task_type_info[task_type] = {
            'num_models': len(models),
            'total_influence': total_influence
        }

    # 对每种任务类型的模型按influence降序排序，并保留前10名
    for task_type, models in task_type_dict.items():
        top10 = heapq.nlargest(10, models, key=lambda x: x['influence'])
        task_type_dict[task_type] = top10
    
    return task_type_dict, task_type_info

def author_module(graph):
    '''
    读取eg_graph文件，按作者分类模型，并且记录该作者的按influence排名前10的模型全部信息，
    用于制作模型作者热度图
    ''' 
    author_dict = {}
    
    # 按作者分类所有模型
    for node_id, attrs in graph.nodes.items():
        author = attrs.get('author_full_name', 'Unknown') or 'Unknown'
        influence = attrs.get('influence', 0.0) or 0.0
        model_info = {
            'name': node_id,
            'task_type': attrs.get('task_type', 'Unknown'),
            'author_full_name': attrs.get('author_full_name', 'Unknown'),
            'created_at': attrs.get('created_at', '0001-01-01') or '0001-01-01',
            'downloads': attrs.get('downloads', 0) or 0,
            'likes': attrs.get('likes', 0) or 0,
            'influence': influence,
            'pic': attrs.get('pic', ''),
            'org_type': attrs.get('org_type', '_unauthorized') or '_unauthorized'
        }
        
        if author not in author_dict:
            author_dict[author] = []
        
        author_dict[author].append(model_info)
    author_info={}
    # 计算每个作者的模型数量与总influence
    for author, models in author_dict.items():              # 放置恶意刷分的作者
        if author_dict[author][0]['org_type'] == 'individual' or len(models) > 100:
            continue
        total_influence = sum(model['influence'] for model in models)
        author_info[author] = {
            'num_models': len(models),
            'total_influence': total_influence
        }

    # 对每个作者的模型按influence降序排序，并保留前10名
    for author, models in author_dict.items():
        top10 = heapq.nlargest(10, models, key=lambda x: x['influence'])
        author_dict[author] = top10
    return author_dict, author_info

def get_top20_models(graph, alpha=1, beta=1, gamma=1):
    """
    从图数据中提取下载量、点赞量和影响力最高的前20个模型。
    
    Args:
        graph: 网络图对象，节点包含 'downloads', 'likes', 'influence' 属性。
        alpha: 下载量的权重。
        beta: 点赞量的权重。
        gamma: 影响力的权重。
    
    Returns:
        top20_models: 列表，包含前20个模型的信息。
    """
    models = []
    
    for node_id, attrs in graph.nodes.items():
        downloads = attrs.get('downloads', 0) or 0
        likes = attrs.get('likes', 0) or 0
        influence = attrs.get('influence', 0.0) or 0.0
        
        # 计算综合评分
        score = influence
        
        model_info = {
            'name': node_id.split('/')[-1],
            'downloads': downloads,
            'likes': likes,
            'influence': influence,
            'score': score,
            # 可以根据需要添加更多属性
            'task_type': attrs.get('task_type', 'Unknown') or 'Unknown',
            'author_full_name': attrs.get('author_full_name', 'Unknown') or 'Unknown',
            'created_at': attrs.get('created_at', '0001-01-01') or '0001-01-01',
            'pic': attrs.get('pic', '') or ''
        }
        
        models.append(model_info)
    
    # 获取前20个模型
    top20_models = heapq.nlargest(20, models, key=lambda x: x['score'])
    
    return top20_models