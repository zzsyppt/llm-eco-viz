# network_graph/utils.py

from flask import Flask, render_template, jsonify, request
from pyvis.network import Network
import networkx as nx
import pickle
import math
import os
import re 

TOPK_K = 100  # 用于控制only top models的top数量（100）

def load_graph(pickle_path):
    """
    从 pickle 文件中加载 networkx 图对象。
    
    参数:
    - pickle_path: pickle 文件的路径
    
    返回:
    - graph: networkx 图对象
    """
    with open(pickle_path, 'rb') as f:
        graph = pickle.load(f)
    return graph

# 动态生成背景颜色及文字颜色
def calculate_color(value, max_value, color_start, color_end, text_color_light="#FFFFFF", text_color_dark="#333333"):
    """
    根据值计算背景颜色和文字颜色，确保对比度。
    value: 当前值
    max_value: 最大值，用于归一化
    color_start: 起始颜色 (RGB)
    color_end: 结束颜色 (RGB)
    text_color_light: 背景深色时使用的浅文字颜色
    text_color_dark: 背景浅色时使用的深文字颜色
    """
    # 非线性映射（sqrt）
    normalized_value = min(1.0, max(0.0, (value / max_value) ** 0.5))  # sqrt(x) 映射到 0~1
    r = int(color_start[0] + (color_end[0] - color_start[0]) * normalized_value)
    g = int(color_start[1] + (color_end[1] - color_start[1]) * normalized_value)
    b = int(color_start[2] + (color_end[2] - color_start[2]) * normalized_value)

    # 计算颜色亮度（Perceived Brightness）
    brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    text_color = text_color_light if brightness < 0.5 else text_color_dark  # 根据亮度选择文字颜色

    # 返回背景颜色和文字颜色
    return f"rgba({r}, {g}, {b}, 0.8)", text_color  # 背景颜色使用透明度 0.8

# 定义一个辅助函数，用于添加节点到图中
def add_node_to_net(net, node, node_attrs, eg_graph):
    influence = node_attrs.get("influence", 1.0)
    pic = node_attrs.get("pic", "https://huggingface.co/front/assets/huggingface_logo-noborder.svg")
    downloads = node_attrs.get("downloads", 0)
    likes = node_attrs.get("likes", 0)
    author = node_attrs.get("author", "unknown")
    author_full_name = node_attrs.get("author_full_name", author)
    author_type = node_attrs.get("author_type", "unknown") 
    created_at = node_attrs.get("created_at", "unknown") 

    # 具体化author_type
    if author_type == "usr":
        author_type_on_board = "an individual user"
    elif author_type == "org":
        author_type_on_board = "an organization"
    else:
        author_type_on_board = "unknown"

    # 判断模型的category
    # 查找指向当前节点的前驱节点（即入边）
    predecessors = list(eg_graph.predecessors(node))  # 获取所有指向该节点的前驱节点 
    if predecessors:
        # 如果有前驱节点，使用前驱节点到当前节点的边的type属性作为category
        edge_type = eg_graph[predecessors[0]][node].get("type", "unknown")  # 获取第一条边的type作为示例
        predecessor = predecessors[0]
        predecessor_url = f"https://huggingface.co/{predecessor}"
        # 构建 HTML 内容
        category_html = f"""
        A <span style="font-weight: bold;">{edge_type}</span> version of 
        <a href="{predecessor_url}" target="_blank" style="color: #007bff; text-decoration: none;">{predecessor}</a>
        """
    else:
        # 如果没有前驱节点，默认为 base model
        category_html = "a base model"
 
    author_url = f"https://huggingface.co/{author}"
    model_url = f"https://huggingface.co/{node}"

    
    # Likes 动态背景颜色
    likes_bg_color, likes_text_color = calculate_color(likes, 1000, (251, 233, 231), (217, 83, 79))

    # Downloads 动态背景颜色
    downloads_bg_color, downloads_text_color = calculate_color(downloads, 300000, (233, 247, 239), (40, 167, 69))

    # Influence 动态背景颜色
    influence_bg_color, influence_text_color = calculate_color(influence, 1000, (255, 249, 231), (240, 173, 78))

    # 更新 HTML 中的背景和文字颜色
    node_info_html = f"""
    <div style="font-family: 'Roboto', sans-serif; color: #333; line-height: 1.6; max-width: 400px; margin: 0 auto;">
        <!-- 顶部图片和标题 -->
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="max-width: 70px; max-height: 70px; border-radius: 50%; background: linear-gradient(135deg, #a8edea, #fed6e3); overflow: hidden; display: inline-block; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);">
                <img src="{pic}" alt="{node}" style="width: 100%; height: auto; display: block;">
            </div>

            <h2 style="margin-left: 15px; font-size: 18px; font-weight: bold;">{node}</h2>
        </div>

        <!-- created_at -->
        <div style="background: #f0f0f0; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0; font-size: 14px;"><strong>Created at: </strong>{created_at}</p>
        </div>

        <!-- 作者信息 -->
        <div style="background: #f0f0f0; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0; font-size: 14px;"><strong>Author:</strong> <a href="{author_url}" target="_blank" style="color: #007bff; text-decoration: none;">{author_full_name}</a> <span style="color: #666;">({author_type_on_board})</span></p>
        </div>

        <!-- 模型类别 -->
        <div style="background: #f0f0f0; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0; font-size: 14px;"><strong>Category:</strong> {category_html}</p>
        </div>

        <!-- 数据统计信息 -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="flex: 1; text-align: center; padding: 10px; background: {downloads_bg_color}; color: {downloads_text_color}; border-radius: 5px; margin-right: 10px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
                <p style="margin: 0; font-size: 14px;"><strong>Downloads</strong></p>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">{downloads}</p>
            </div>
            <div style="flex: 1; text-align: center; padding: 10px; background: {likes_bg_color}; color: {likes_text_color}; border-radius: 5px; margin-left: 10px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
                <p style="margin: 0; font-size: 14px;"><strong>Likes</strong></p>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">{likes}</p>
            </div>
        </div>

        <!-- 模型影响力 -->
        <div style="background: {influence_bg_color}; color: {influence_text_color}; padding: 15px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); text-align: center;">
            <p style="margin: 0; font-size: 14px;"><strong>Influence</strong></p>
            <p style="margin: 0; font-size: 20px; font-weight: bold;">{influence:.2f}</p>
        </div>

        <!-- 模型 URL -->
        <div style="background: #e3f2fd; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0; font-size: 14px;"><strong>Model URL:</strong> <a href="{model_url}" target="_blank" style="color: #007bff; text-decoration: none;">{model_url}</a></p>
        </div>
    </div>
    """


    net.add_node(
        node,
        label="",
        size=math.sqrt(influence)*3,
        title=f"{node} \nby {author_full_name}",  # 添加HTML格式的节点信息
        shape="image",
        image=pic,
        things_to_show_on_sidebar=node_info_html , # 添加到侧边栏的数据html代码
        font=dict(size=0)  # 设置字体大小为 0 来确保标签隐藏
    )

def generate_graph_html(eg_graph, base_model , view_type=1):
    """
    可视化指定 base_model 的子图，支持不同的视图类型。
    Args:
        eg_graph: EasyGraph 的 DiGraph 对象。
        base_model: 要可视化的根节点（base_model）。
        output_file: 输出 HTML 文件的路径。
        view_type: 可视化模式，1：完整网络，2：同作者折叠，3：过滤企业，4：按类别展示
    """
    if view_type == 2:
        return generate_graph_html_for2(eg_graph, base_model)
    # 初始化 PyVis 图
    net = Network(height="1000px", width="100%", notebook=False, directed=True, cdn_resources='remote')
    
    # 边的颜色对应衍生类型
    edge_colors = {
        "adapter": "blue",
        "finetune": "green",
        "merge": "red",
        "quantized": "purple",
    }  


    # 深度优先遍历，从 base_model 开始构建子图
    visited = set()  # 用于避免重复访问节点
    stack = [base_model]  # 使用栈模拟深度优先遍历 

    # 获取eg_graph所有结点中
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)

        node_attrs = eg_graph.nodes[node]
        author = node_attrs.get("author", "unknown") 

        # 添加节点到 PyVis 图
        if node not in net.get_nodes():
            ''' unnecessary code: save for future use if my decision is wrong
            if view_type == 3 and node_attrs.get("author_type", "unknown") == "usr" and node != base_model:
                continue '''
            add_node_to_net(net, node, node_attrs, eg_graph)  # 传递 eg_graph 参数

        # 处理view_type == 8的情况
        if view_type == 8:
            # 获取以 base_model 为根节点的子图，并按 influence 排序
            all_successors = list(eg_graph.successors(node))
            successor_attrs = [(node0, eg_graph.nodes[node0]) for node0 in all_successors]

            # 排序子节点，按 influence 从大到小排序
            sorted_successors = sorted(successor_attrs, key=lambda x: x[1].get('influence', 0), reverse=True)
            # 只取前 TOPK_K 个节点
            top_successors = sorted_successors[:TOPK_K]
            # 前五十结点加入图中
            for successor, attrs in top_successors:
                add_node_to_net(net, successor, attrs, eg_graph)
                # 添加边到图中
                edge_data = eg_graph[node][successor]
                edge_type = edge_data.get("type", "unknown")
                edge_color = edge_colors.get(edge_type, "black")
                net.add_edge(node, successor, color=edge_color, title=edge_type)
                if successor not in visited and successor not in stack:
                    stack.append(successor)
            continue

        # 遍历所有子节点（出边）
        for successor in eg_graph.successors(node):
            successor_attrs = eg_graph.nodes[successor]
            

            # 加载边数据
            edge_data = eg_graph[node][successor]
            edge_type = edge_data.get("type", "unknown")
            edge_color = edge_colors.get(edge_type, "black")

            def add_edge_node_and_stack(): 
                if successor not in visited and successor not in stack:
                    if view_type == 3 and successor_attrs.get("author_type", "unknown") == "usr" and successor != base_model:
                        pass
                    else:
                        add_node_to_net(net, successor, successor_attrs, eg_graph)  # 传递 eg_graph 参数
                        net.add_edge(node, successor, color=edge_color, title=edge_type) 
                        stack.append(successor)

            # 确保目标节点添加到图中，且根据view_type过滤节点
            if successor not in net.get_nodes():
                if view_type == 4:
                    if edge_type == "adapter":
                        add_edge_node_and_stack()
                    else:
                        continue
                elif view_type == 5:
                    if edge_type == "finetune":
                        add_edge_node_and_stack()
                    else:
                        continue
                elif view_type == 6:
                    if edge_type == "merge":
                        add_edge_node_and_stack() 
                    else:
                        continue
                elif view_type == 7:
                    if edge_type == "quantized":
                        add_edge_node_and_stack()
                    else:
                        continue
                else:
                    add_edge_node_and_stack()
    # 生成 HTML 字符串
    #return net.generate_html().replace("</body>", menu_html + sidebar_html + "</body>")#.split('<body>')[1].split('</body>')[0]
    # 生成 HTML 字符串
    net.show_buttons(filter_ =["physics"])
    graph_html = net.generate_html()  
    head_html = net.generate_html().split('<head>')[1].split('</head>')[0]
    body_html = net.generate_html().split('<body>')[1].split('</body>')[0]

    # 将 head_content 和 body_content 传递给模板
    return head_html, body_html


















# 定义一个辅助函数，用于添加作者合并的节点到图中
def add_node_to_net_for2(net, base_model, father_node_zip, author_models, eg_graph):
    # 迭代所有作者
    for author, models in author_models.items():
        # father_node_zip的巧妙运用
        edge_data = eg_graph[father_node_zip[0]][models[0]]
        edge_type = edge_data.get("type", "unknown")
        edge_colors = {
            "adapter": "blue",
            "finetune": "green",
            "merge": "red",
            "quantized": "purple",
        }  
        edge_color = edge_colors.get(edge_type, "black")    # 根据边的类型获取颜色
        '''修改tip: 这里可以决定是影响力的均值还是求和？ 作为作者合并结点的影响力'''
        influence_total = sum(eg_graph.nodes[model].get("influence", 1.0) for model in models)
        influence_avg = influence_total  / len(models)
        model0_node_attrs = eg_graph.nodes[models[0]]
        author_type = model0_node_attrs.get("author_type", "unknown")
        # 具体化author_type
        if author_type == "usr":
            author_type_on_board = "an individual user"
        elif author_type == "org":
            author_type_on_board = "an organization"
        else:
            author_type_on_board = "unknown"
        author_full_name = model0_node_attrs.get("author_full_name", author)
        author_pic = model0_node_attrs.get("pic", "https://huggingface.co/front/assets/huggingface_logo-noborder.svg")
        # 得到所有这个作者的模型的信息，用于放进侧边栏
        sidebar_data = {}
        for x in models:
            node_attrs = eg_graph.nodes[x]
            downloads = node_attrs.get("downloads", 0)
            likes = node_attrs.get("likes", 0) 
            influence = node_attrs.get("influence", 1.0) 
            created_at = node_attrs.get("created_at", "unknown")
            model_url = f"https://huggingface.co/{x}"
            # Likes 动态背景颜色
            likes_bg_color, likes_text_color = calculate_color(likes, 1000, (251, 233, 231), (217, 83, 79))
            # Downloads 动态背景颜色
            downloads_bg_color, downloads_text_color = calculate_color(downloads, 300000, (233, 247, 239), (40, 167, 69))
            # Influence 动态背景颜色
            influence_bg_color, influence_text_color = calculate_color(influence, 1000, (255, 249, 231), (240, 173, 78))
            # 模型类型
            edge_type = eg_graph[father_node_zip[0]][x].get("type", "unknown")
            sidebar_data[x] = {
                "created_at": created_at,
                "edge_type": edge_type,
                "downloads": downloads,
                "likes": likes,
                "influence": influence,
                "model_url": model_url,
                "likes_bg_color": likes_bg_color,
                "likes_text_color": likes_text_color,
                "downloads_bg_color": downloads_bg_color,
                "downloads_text_color": downloads_text_color,
                "influence_bg_color": influence_bg_color,
                "influence_text_color": influence_text_color
            }

        # 如果net不包含这个作者结点
        if not any(node['id'] == author for node in net.nodes):  
            # 生成侧边栏的 HTML 代码
            # 已经有 sidebar_data 字典，并且将把这些数据添加到 things_to_show_on_sidebar 中
            things_to_show_on_sidebar = f"""
            <!-- 添加到侧边栏的数据 -->
            <div style="font-family: 'Roboto', sans-serif; color: #333; line-height: 1.6; max-width: 400px; margin: 0 auto;">
                <!-- 顶部图片和标题 -->
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="max-width: 70px; max-height: 70px; border-radius: 50%; background: linear-gradient(135deg, #a8edea, #fed6e3); overflow: hidden; display: inline-block; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);">
                        <img src="{author_pic}" alt="{author_full_name}" style="width: 100%; height: auto; display: block;">
                    </div>
                    <h2 style="margin-left: 15px; font-size: 18px; font-weight: bold;">Models by {author_full_name} ({author_type_on_board})</h2>
                </div>
                <a href="https://huggingface.co/{author}" target="_blank" style="color: #007bff; text-decoration: none;">Author's HuggingFace</a>
                <!--marker1--> <p style="font-size: 14px; margin: 0;">{len(models)} models in total.</p> <!--marker2--> 
                <div style="margin-top: 20px;">
            """

            # 遍历 sidebar_data 中的每个模型，生成对应的信息框
            for model, data in sidebar_data.items():
                created_at, edge_type, downloads, likes, influence, model_url, likes_bg_color, likes_text_color, downloads_bg_color, downloads_text_color, influence_bg_color, influence_text_color = data['created_at'], data['edge_type'], data['downloads'], data['likes'], data['influence'], data['model_url'], data['likes_bg_color'], data['likes_text_color'], data['downloads_bg_color'], data['downloads_text_color'], data['influence_bg_color'], data['influence_text_color']
                # 拼接每个模型的HTML内容
                things_to_show_on_sidebar += f"""
                    <div style="background: #f0f0f0; padding: 15px 20px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
                        <p style="font-size: 14px; margin: 0;"><strong>{model}</strong><br>a <span style="font-weight: bold;">{edge_type}</span> version of <a href="https://www.huggingface.co/{father_node_zip[0]}">{father_node_zip[0]}</a> created at {created_at} </p>
 
                        <p style="font-size: 16px; font-weight: bold; background-color: {likes_bg_color}; color: rgb{likes_text_color}; padding: 5px 10px; border-radius: 5px; margin: 5px 0;">
                            Likes: {likes} 
                        </p>
                        <p style="font-size: 16px; font-weight: bold; background-color: {downloads_bg_color}; color: rgb{downloads_text_color}; padding: 5px 10px; border-radius: 5px; margin: 5px 0;">
                            Downloads: {downloads}
                        </p>
                        <p style="font-size: 16px; font-weight: bold; background-color: {influence_bg_color}; color: rgb{influence_text_color}; padding: 5px 10px; border-radius: 5px; margin: 5px 0;">
                            Influence: {influence}
                        </p>
                        <a href="{model_url}" target="_blank" style="color: #007bff; text-decoration: none;">Model URL</a>
                    </div> 
            """

            # 结束 HTML 部分
            things_to_show_on_sidebar += """
                    <!-- signal -->
                </div>
            </div>
            """ 
        # 图中加入过了这个节点（这是很特殊的情况，以meta-llama/Meta-Llama-3-70B为例比较好说明）
        else: 
            # 找到那个已经加入net的结点
            for node in net.nodes:
                if node['id'] == author:
                    existing_node = node
                    things_to_show_on_sidebar = existing_node['things_to_show_on_sidebar'] 
                    break
            # 在things_to_show_on_sidebar 追加新的模型信息
            for model, data in sidebar_data.items():
                edge_type, downloads, likes, influence, model_url, likes_bg_color, likes_text_color, downloads_bg_color, downloads_text_color, influence_bg_color, influence_text_color = data['edge_type'], data['downloads'], data['likes'], data['influence'], data['model_url'], data['likes_bg_color'], data['likes_text_color'], data['downloads_bg_color'], data['downloads_text_color'], data['influence_bg_color'], data['influence_text_color']
                # 拼接每个模型的HTML内容
                
                def replace_between_markers(text, start_marker, end_marker, replacement):
                    # 构建正则表达式来匹配开始标记、结束标记和它们之间的内容
                    pattern = f"({re.escape(start_marker)})(.*?)(?={re.escape(end_marker)})"
                    # 使用正则表达式替换匹配的部分
                    new_text = re.sub(pattern, r"\1" + replacement , text)
                    return new_text
                # 替换掉<!-- signal -->，然后再加上新的模型信息 
                things_to_show_on_sidebar = things_to_show_on_sidebar.replace("<!-- signal -->", f"""
                    <div style="background: #f0f0f0; padding: 15px 20px; border-radius: 5px; margin-bottom: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">
                        <p style="font-size: 14px; margin: 0;"><strong>{model}</strong><br>a <span style="font-weight: bold;">{edge_type}</span> version of <a href="https://www.huggingface.co/{father_node_zip[0]}">{father_node_zip[0]}</a> created at {created_at} </p>
 
                        <p style="font-size: 16px; font-weight: bold; background-color: {likes_bg_color}; color: rgb{likes_text_color}; padding: 5px 10px; border-radius: 5px; margin: 5px 0;">
                            Likes: {likes} 
                        </p>
                        <p style="font-size: 16px; font-weight: bold; background-color: {downloads_bg_color}; color: rgb{downloads_text_color}; padding: 5px 10px; border-radius: 5px; margin: 5px 0;">
                            Downloads: {downloads}
                        </p>
                        <p style="font-size: 16px; font-weight: bold; background-color: {influence_bg_color}; color: rgb{influence_text_color}; padding: 5px 10px; border-radius: 5px; margin: 5px 0;">
                            Influence: {influence}
                        </p> 
                        <a href="{model_url}" target="_blank" style="color: #007bff; text-decoration: none;">Model URL</a>
                    </div>
                    <!-- signal -->
                """)  
            # 更新图中的节点信息
            # 替换掉旧的模型个数 
            things_to_show_on_sidebar = replace_between_markers(things_to_show_on_sidebar, "<!--marker1-->", "<!--marker2-->", f'''<p style="font-size: 14px; margin: 0;">{len(models)+existing_node['model_num']} models in total.</p>''' )
            existing_node['things_to_show_on_sidebar'] = things_to_show_on_sidebar
            existing_node['size'] = math.sqrt((existing_node['influence_total'] + influence_total) / (existing_node['model_num'] + len(models)))*3
            existing_node['model_num'] += len(models)
            net.add_edge(father_node_zip[0] if father_node_zip[1] == True else eg_graph.nodes[father_node_zip[0]].get("author","错误"), author, color=edge_color, title=edge_type)
            continue
                
        net.add_node(
            author,
            label="",
            influence_total = influence_total,
            model_num = len(models),
            size=math.sqrt(influence_avg)*3,
            title=f"Models by {author_full_name}",  # 添加HTML格式的节点信息
            shape="image",
            image=author_pic,
            things_to_show_on_sidebar=things_to_show_on_sidebar,  # 添加到侧边栏的数据
            font=dict(size=0)  # 设置字体大小为 0 来确保标签隐藏
        )
        net.add_edge(father_node_zip[0] if father_node_zip[1] == True else eg_graph.nodes[father_node_zip[0]].get("author","错误"), author, color=edge_color, title=edge_type)




def generate_graph_html_for2(eg_graph, base_model):
    # 同作者折叠
    # 初始化 PyVis 图
    net = Network(height="1000px", width="100%", notebook=False, directed=True, cdn_resources='in_line')
    

    # 边的颜色对应衍生类型
    edge_colors = {
        "adapter": "blue",
        "finetune": "green",
        "merge": "red",
        "quantized": "purple",
    }   
    # 深度优先遍历，从 base_model 开始构建子图
    visited = set()  # 用于避免重复访问节点
    stack = [base_model]  # 使用栈模拟深度优先遍历

    # 获取eg_graph所有结点中
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)

        node_attrs = eg_graph.nodes[node] 

        # 添加节点到 PyVis 图。若是basemodel -> 采用原来的函数
        if node == base_model:
            add_node_to_net(net, node, node_attrs, eg_graph)
                 
        # 否则 -> 执行作者合并
        author_models = {}  # 存储每个作者的模型，用于折叠    
        # 遍历所有子节点（出边）
        for successor in eg_graph.successors(node):
            successor_attrs = eg_graph.nodes[successor]
            author = successor_attrs.get("author", "unknown") 
            author_models.setdefault(author, []).append(successor)  # 将模型添加到作者的模型列表中
            if successor not in visited and successor not in stack:
                stack.append(successor)  
        add_node_to_net_for2(net, base_model, [node, node == base_model], author_models, eg_graph)  # 传递 eg_graph 参数
    # 生成 HTML 字符串
    #return 
    net.show_buttons(filter_ =["physics"])
    graph_html = net.generate_html()  
    head_html = net.generate_html().split('<head>')[1].split('</head>')[0]
    body_html = net.generate_html().split('<body>')[1].split('</body>')[0]

    # 将 head_content 和 body_content 传递给模板
    return head_html, body_html
