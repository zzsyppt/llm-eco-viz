import json
import os
from huggingface_hub import HfApi
import time

# 输入和输出文件路径
MODEL_METADATA_FILE = "../model_metadata/output/model_metadata.json"  # 包含模型信息的输入 JSON 文件
SPACES_METADATA_FILE = "output/spaces_metadata.json"  # 存储 spaces 元数据信息的输出 JSON 文件
ERROR_FILE = "output/error_getting_space_info.txt"  # 存储出错的 Space 名称

# 确保输出目录存在
OUTPUT_FOLDER = os.path.dirname(SPACES_METADATA_FILE)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# 初始化 Hugging Face API
api = HfApi()

# 实时写入文件的函数
def write_to_json(data, file_path):
    """将数据写入 JSON 文件"""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# 获取错误文件内容
def get_existing_errors(file_path):
    """读取 error 文件中的已有值，避免重复写入"""
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f.readlines())
    return set()

# 写入错误文件的函数，避免重复写入
def write_to_error_file(space_name, error_set, file_path):
    """将新的错误值写入文件，确保没有重复"""
    if space_name not in error_set:
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(f"{space_name}\n")
        error_set.add(space_name)

# 获取 Space 元数据的函数
def fetch_space_metadata(space_name):
    """从 Hugging Face Hub 获取 Space 的元数据"""
    try:
        space_info = api.space_info(space_name)  # 获取空间信息

        # 将 datetime 对象转换为字符串
        created_at = space_info.created_at.strftime("%Y-%m-%d %H:%M:%S") if space_info.created_at else None
        last_modified = space_info.lastModified.strftime("%Y-%m-%d %H:%M:%S") if space_info.lastModified else None

        return {
            "created_at": created_at,  # Space 创建时间
            "last_modified": last_modified,  # Space 最后修改时间
            "likes": space_info.likes,  # Space 收到的点赞数
            "emoji": space_info.card_data.get("emoji"),  # Space 关联的 Emoji
            "short_description": space_info.card_data.get("short_description"),  # Space 简短描述
            "models": space_info.models  # 关联的模型列表
        }
    except Exception as e:
        print(f"获取 Space {space_name} 的元数据时出错：{e}")
        # 写入错误文件
        write_to_error_file(space_name, existing_errors, ERROR_FILE)
        return None

# 主程序
if __name__ == "__main__":
    # 如果输出文件存在，加载已有数据，避免重复写入
    if os.path.exists(SPACES_METADATA_FILE):
        with open(SPACES_METADATA_FILE, "r", encoding="utf-8") as f:
            spaces_metadata = json.load(f)
    else:
        spaces_metadata = {}

    # 读取错误文件的已有内容
    existing_errors = get_existing_errors(ERROR_FILE)

    # 加载模型元数据文件
    with open(MODEL_METADATA_FILE, "r", encoding="utf-8") as f:
        model_metadata = json.load(f)

    # 遍历每个模型及其关联的 Spaces
    for model, metadata in model_metadata.items():
        spaces = metadata.get("spaces", [])  # 获取模型关联的 Spaces 列表
        for space in spaces:
            if space not in spaces_metadata:  # 如果 Space 不在已有元数据中，获取信息
                print(f"正在获取 Space 的元数据：{space}")
                space_metadata = fetch_space_metadata(space)
                if space_metadata:
                    spaces_metadata[space] = space_metadata
                    write_to_json(spaces_metadata, SPACES_METADATA_FILE)  # 实时写入文件

                # 等待 0.5 秒，避免触发 API 的速率限制
                # time.sleep(0.5)
            else:
                print(f"Space {space} 的元数据已存在，跳过...")

    print(f"Spaces 元数据收集完成！数据已保存到 '{SPACES_METADATA_FILE}' 文件中。")
