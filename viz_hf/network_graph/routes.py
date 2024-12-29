# network_graph/routes.py

from flask import Blueprint, render_template, request, abort, current_app as app
import networkx as nx
import pickle
import os
from pyvis.network import Network
import math
from .utils import load_graph, generate_graph_html

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