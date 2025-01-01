import easygraph as eg
import json
import math
from datetime import datetime

def days_since(date_str):
    """计算从给定日期到今天的天数，支持日期和时间格式"""
    today = datetime.now()
    try:
        # 尝试解析日期和时间格式
        created_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        # 如果失败，尝试仅解析日期格式
        created_date = datetime.strptime(date_str, "%Y-%m-%d")
    return (today - created_date).days


def build_graph(base_models, model_metadata_file, space_metadata_file, model_tree_raw_file, author_metadata_file):
    """
    构建图网络，基于 base_models.txt, model_metadata.json, space_metadata.json 和 model_tree_raw.json.
    Args:
        base_models (list): 包含所有 base 模型名字的列表。
        model_metadata_file (str): model_metadata.json 文件路径。
        space_metadata_file (str): space_metadata.json 文件路径。
        model_tree_raw_file (str): model_tree_raw.json 文件路径。
    Returns:
        graph: easygraph 的 DiGraph 表示模型网络。
    """
    # 读取文件数据
    with open(model_metadata_file, 'r', encoding='utf-8') as f:
        model_metadata = json.load(f)
    with open(space_metadata_file, 'r', encoding='utf-8') as f:
        space_metadata = json.load(f)
    with open(model_tree_raw_file, 'r', encoding='utf-8') as f:
        model_tree_raw = json.load(f)
    with open(author_metadata_file, 'r', encoding='utf-8') as f:
        author_metadata = json.load(f)
        
    # 初始化图
    G = eg.DiGraph()

    # 添加节点：遍历 model_metadata，提取相关信息
    for model_name, metadata in model_metadata.items():
        downloads = metadata.get("downloads", 0)
        likes = metadata.get("likes", 0)
        author = metadata.get("author", "unknown")
        created_at = metadata.get("created_at", "1970-01-01")
        days_since_created = days_since(created_at)
        language = metadata.get("language", [])
        spaces = metadata.get("spaces", [])
        author = metadata.get("author", "unknown")
        task_type = metadata.get("pipeline_tag", "unknown")
        for author_name, author_data in author_metadata.items():
            if author_name == author:
                pic = author_data.get("photo", "unknown")
                author_type = author_data.get("type", "unknown")
                author_full_name = author_data.get("full_name", author_name)
                if author_type == 'org':
                    org_type = author_data.get("nature", "anonymous")
                else:
                    org_type = "individual"

        
        # 添加节点到图中
        G.add_node(
            model_name,
            downloads=downloads,
            likes=likes,
            author=author,
            org_type=org_type,
            author_full_name=author_full_name,
            created_at=created_at,
            days_since_created=days_since_created,
            language=language,
            spaces=spaces,
            pic=pic,
            author_type=author_type,
            task_type=task_type,
            influence=0.0  # 初始影响力设为 0
        )

    # 添加边：基于 model_tree_raw 提取衍生关系
    for base_model, derived_info in model_tree_raw.items():
        for derivation_type, derived_models in derived_info.items():
            for derived_model in derived_models:
                if derived_model in model_metadata:  # 确保衍生模型存在于元数据中
                    
                    G.add_edge(
                        base_model,
                        derived_model,
                        type=derivation_type,
                        influence_weight=1.0  # 初始影响力权重设为 1
                    )
    return G

# 示例文件路径
base_models_file = "basemodels_top1000_likes.txt"
model_metadata_file = "model_metadata.json"
space_metadata_file = "spaces_metadata.json"
model_tree_raw_file = "model_tree_raw.json"
author_metadata_file = "author_metadata.json"

# 读取 base_models.txt
with open(base_models_file, 'r', encoding='utf-8') as f:
    base_models = [line.strip() for line in f]

# 构建图
graph = build_graph(base_models, model_metadata_file, space_metadata_file, model_tree_raw_file, author_metadata_file)


import os


# 权重参数
ALPHA_1 = 0.6  # 自身影响力权重
ALPHA_2 = 0.3  # 子模型影响力权重
ALPHA_3 = 0.1  # 父模型影响力权重
W1, W2, W3, W4 = 0.2, 0.4, 0.2, 0.2  # 自身影响力的分项权重
LAMBDA = 1  # 时间衰减速率

def compute_time_factor(days_since_created):
    """计算时间因子"""
    return math.exp(-LAMBDA * days_since_created)


def compute_space_influence(spaces, spaces_metadata):
    """计算节点关联的所有 Spaces 的总影响力""" 
    lambda_ = 0.001  # 时间衰减因子

    total_space_influence = 0.0

    for space in spaces:
        if space in spaces_metadata:
            space_data = spaces_metadata[space]
            likes = space_data.get("likes", 0)
            created_at = space_data.get("created_at", "1970-01-01")
            
            # 计算从创建到今天的天数
            days_since_created = days_since(created_at)
            time_factor = math.exp(-lambda_ * days_since_created)

            # 单个 Space 的影响力
            space_influence = likes * time_factor
            total_space_influence += space_influence

    return total_space_influence

def compute_self_influence(node_attrs, spaces_metadata):
    """计算节点的自身影响力，包含 Space 的影响力"""
    downloads = node_attrs.get("downloads", 0)
    likes = node_attrs.get("likes", 0)
    spaces = node_attrs.get("spaces", [])
    days_since_created = node_attrs.get("days_since_created", 1)

    # 时间因子
    time_factor = compute_time_factor(days_since_created)

    # 计算 Spaces 的总影响力
    space_influence = compute_space_influence(spaces, spaces_metadata)

    # 自身影响力公式
    return W1 * math.log(max(downloads, 1)) + W2 * likes + W3 * space_influence + W4 * time_factor


def compute_influence(graph, spaces_metadata, max_iter=100, tol=1e-6, output_dir="output"):
    """
    计算图中每个节点的影响力值
    Args:
        graph: easygraph 的 DiGraph，包含节点和边的属性。
        spaces_metadata: spaces 元数据，用于计算 space 影响力。
        max_iter: 最大迭代次数。
        tol: 收敛误差阈值。
        output_dir: 输出迭代结果的文件夹路径。
    Returns:
        influences: 每个节点的最终影响力字典。
    """
    # 检查并创建输出目录
    os.makedirs(output_dir, exist_ok=True)

    # 初始化影响力为自身影响力
    influences = {node: compute_self_influence(graph.nodes[node], spaces_metadata) for node in graph.nodes}

    for iteration in range(max_iter):
        new_influences = {}
        for node in graph.nodes:
            # 自身影响力
            self_influence = compute_self_influence(graph.nodes[node], spaces_metadata)

            # 子模型传播的影响力
            child_influence = sum(
                graph[node][child].get("influence_weight", 1.0) * influences[child]
                for child in graph.successors(node)
            )
            child_influence /= max(1, len(list(graph.successors(node))))  # 归一化

            # 父模型传播的影响力
            parent_influence = sum(
                graph[parent][node].get("influence_weight", 1.0) * influences[parent]
                for parent in graph.predecessors(node)
            )
            parent_influence /= max(1, len(list(graph.predecessors(node))))  # 归一化

            # 计算总影响力
            new_influences[node] = (
                ALPHA_1 * self_influence +
                ALPHA_2 * child_influence +
                ALPHA_3 * parent_influence
            )

        # 计算误差
        diff = sum(abs(new_influences[node] - influences[node]) for node in graph.nodes)
        print(f"Iteration {iteration}: Total Difference = {diff}")

        # 写入每次迭代的结果到文件
        output_file = os.path.join(output_dir, f"iteration_{iteration + 1}.txt")
        with open(output_file, "w", encoding="utf-8") as f:
            sorted_results = sorted(new_influences.items(), key=lambda x: x[1], reverse=True)
            for model, influence in sorted_results:
                f.write(f"{model}: {influence}\n")

        # 更新影响力值
        influences = new_influences

        # 如果误差小于阈值，认为收敛
        if diff < tol:
            print("Convergence achieved.")
            break
    # 更新图中每个节点的 `influence` 属性
    for node, influence in influences.items():
        graph.nodes[node]['influence'] = influence

    return influences




# 读取 spaces_metadata.json
with open("spaces_metadata.json", "r", encoding="utf-8") as f:
    spaces_metadata = json.load(f)

# 计算图中每个节点的最终影响力
influence_results = compute_influence(graph, spaces_metadata, max_iter=100, tol=1e-6, output_dir="output")








import pickle

def save_graph_as_pickle(graph, file_path):
    """将 EasyGraph 图保存为 Pickle 文件"""
    with open(file_path, "wb") as f:
        pickle.dump(graph, f)

# 示例：保存图为 Pickle 文件
save_graph_as_pickle(graph, "graph.pkl")
