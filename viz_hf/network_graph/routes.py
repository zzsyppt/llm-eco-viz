# network_graph/routes.py

from flask import Blueprint, render_template, request, abort, current_app as app
import networkx as nx
import pickle
import os
from pyvis.network import Network
import math
from .utils import load_graph, generate_graph_html, generate_large_graph_html, generate_specific_large_graph_html

network_bp = Blueprint('network', __name__)

@network_bp.route('/', methods=['GET'])
def network_view():
    """
    显示网络图页面，根据查询参数生成图形。
    
    URL 示例: /network/?view_type=1&base_model=meta-llama/Meta-Llama-3-70B
    """
    # 获取查询参数
    view_type = int(request.args.get('view_type', 1))
    base_model = request.args.get('base_model', 'meta-llama/Meta-Llama-3-70B')  # 设置默认的base_model 
    
    # 加载图对象
    graph = load_graph(app.config['GRAPH_PICKLE_PATH'])
    
    # 生成 head_html 和 body_html
    head_html, body_html = generate_graph_html(graph, base_model, view_type)
    
    # 渲染模板并传递变量
    return render_template('network.html', head_html=head_html, body_html=body_html)


@network_bp.route('/large_graph/', methods=['GET'])
def network_large_graph():
    """
    显示大型网络图页面，根据查询参数生成图形。
    
    URL 示例: /network/large_graph/?top_k=100
    """
    # 获取查询参数
    top_k = int(request.args.get('top_k', 100))

    # 加载图对象
    graph = load_graph(app.config['GRAPH_PICKLE_PATH'])
    
    # 生成 head_html 和 body_html
    head_html, body_html = generate_large_graph_html(graph, top_k)
    
    # 渲染模板并传递变量
    return render_template('network_large.html', head_html=head_html, body_html=body_html)

@network_bp.route('/specific_large_graph/', methods=['GET'])
def network_specific_large_graph():
    """
    显示大型网络图页面，根据查询参数生成图形。
    
    URL 示例: /network/specific_large_graph/?base_model_to_show=b1,b2,bk
    """ 
    # 加载图对象
    eg_graph = load_graph(app.config['GRAPH_PICKLE_PATH'])

    # 获取 'base_model_to_show' 参数的字符串值，默认为空字符串
    base_models_str = request.args.get('base_model_to_show', '')
    
    # 将字符串按逗号分隔并去除多余的空格，生成列表
    base_models = [model.strip() for model in base_models_str.split(',')] if base_models_str else []
    
    #  base_models 是一个包含所有指定 base_model 的列表 
    head_html, body_html = generate_specific_large_graph_html(eg_graph, base_models)
    
    return render_template('network_large.html', head_html=head_html, body_html=body_html)
