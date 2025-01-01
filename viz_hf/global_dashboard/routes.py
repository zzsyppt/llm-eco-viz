# global_dashboard/routes.py

from flask import Blueprint, render_template, jsonify
from .utils import load_graph, language_module, org_type_module, task_type_module, author_module, get_top20_models
import heapq

dashboard_bp = Blueprint('dashboard_bp', __name__, template_folder='templates', static_folder='static')

def recursive_sanitize(obj):
    """
    递归遍历数据结构，将 None 替换为适当的默认值。
    
    Args:
        obj: 任意数据类型（dict, list, etc.）
    
    Returns:
        清洗后的数据结构
    """
    if isinstance(obj, dict):
        return {k: recursive_sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [recursive_sanitize(item) for item in obj]
    elif obj is None:
        return ""  # 根据需求选择默认值，例如空字符串
    else:
        return obj

@dashboard_bp.route('/')
def dashboard():
    """
    渲染大模型开源洞察大屏的主页面。
    """
    try:
        graph = load_graph()
    except FileNotFoundError as e:
        return str(e), 404

    # 获取语言、机构类型、任务类型和作者的数据
    language_dict, language_info = language_module(graph)
    org_type_dict, org_type_info = org_type_module(graph)
    task_type_dict, task_type_info = task_type_module(graph)
    author_dict, author_info = author_module(graph)
    top20_models = get_top20_models(graph)

    # 清洗所有数据，替换 None 为 ""
    language_dict = recursive_sanitize(language_dict)
    language_info = recursive_sanitize(language_info)
    org_type_dict = recursive_sanitize(org_type_dict)
    org_type_info = recursive_sanitize(org_type_info)
    task_type_dict = recursive_sanitize(task_type_dict)
    task_type_info = recursive_sanitize(task_type_info)
    author_dict = recursive_sanitize(author_dict)
    author_info = recursive_sanitize(author_info)
    top20_models = recursive_sanitize(top20_models)

    return render_template(
        'dashboard.html',
        language_dict=language_dict,
        language_info=language_info,
        org_type_dict=org_type_dict,
        org_type_info=org_type_info,
        task_type_dict=task_type_dict,
        task_type_info=task_type_info,
        author_dict=author_dict,
        author_info=author_info,
        top20_models=top20_models
    )

@dashboard_bp.route('/api/data')
def get_dashboard_data():
    """
    提供前端需要的所有数据，以 JSON 格式返回。
    """
    try:
        graph = load_graph()
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404

    # 获取语言、机构类型、任务类型和作者的数据
    language_dict, language_info = language_module(graph)
    org_type_dict, org_type_info = org_type_module(graph)
    task_type_dict, task_type_info = task_type_module(graph)
    author_dict, author_info = author_module(graph)
    top20_models = get_top20_models(graph )  

    # 清洗所有数据，替换 None 为 ""
    language_dict = recursive_sanitize(language_dict)
    language_info = recursive_sanitize(language_info)
    org_type_dict = recursive_sanitize(org_type_dict)
    org_type_info = recursive_sanitize(org_type_info)
    task_type_dict = recursive_sanitize(task_type_dict)
    task_type_info = recursive_sanitize(task_type_info)
    author_dict = recursive_sanitize(author_dict)
    author_info = recursive_sanitize(author_info)
    top20_models = recursive_sanitize(top20_models)
    data = {
        "language_info": language_info,
        "org_type_info": org_type_info,
        "task_type_info": task_type_info,
        "author_info": author_info,
        "language_dict": language_dict,
        "org_type_dict": org_type_dict,
        "task_type_dict": task_type_dict,
        "author_dict": author_dict,
        "top20_models": top20_models
    }

    # 添加调试日志
    print("API Data - Author Info: %s", author_info)

    print("API Data - Author Dict: %s", author_dict)

    return jsonify(data)


@dashboard_bp.route('/api/top20_models')
def get_top20_models_api():
    """
    提供TOP20模型的数据，以 JSON 格式返回。
    """
    try:
        graph = load_graph()
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404

    # 获取TOP20模型数据
    top20_models = get_top20_models(graph, alpha=1, beta=1, gamma=1)  # 调整权重系数
    
    # 清洗数据
    top20_models = recursive_sanitize(top20_models)
    
    # 添加调试日志
    logger.debug("API Top20 Models: %s", top20_models)
    
    return jsonify({"top20_models": top20_models})