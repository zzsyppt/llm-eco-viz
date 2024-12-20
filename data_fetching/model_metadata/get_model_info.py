import json
import os
from huggingface_hub import HfApi
import time

# 输入和输出文件路径
INPUT_FILE = "../fetching_model_tree/output/model_tree_raw.json"  # 输入的 JSON 文件
OUTPUT_FILE = "output/model_metadata.json"  # 输出的 JSON 文件
ERROR_FILE = "output/error_getting_model_info.txt"  # 错误记录文件

# 确保输出目录存在
OUTPUT_FOLDER = os.path.dirname(OUTPUT_FILE)  # 提取目录部分
os.makedirs(OUTPUT_FOLDER, exist_ok=True)  # 创建目录（如果不存在）

# 初始化 Hugging Face API
api = HfApi()

# 实时写入文件的函数
def write_to_json(data, file_path):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")
        log_error(data, ERROR_FILE)  # 写入错误文件

# 写入错误文件的函数
def log_error(model_id, file_path):
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(f"{model_id}\n")

# 获取模型元数据的函数
def fetch_model_metadata(model_id):
    try:
        model_info = api.model_info(model_id)
        
        # 提取最后一个 tag 并命名为 region
        region = model_info.tags[-1] if model_info.tags else None

        # 提取 language 字段
        language = model_info.card_data.get('language', []) if model_info.card_data else []

        return {
            "downloads": model_info.downloads,
            "likes": model_info.likes,
            "spaces": model_info.spaces if model_info.spaces else [],
            "spaces_count": len(model_info.spaces) if model_info.spaces else 0,
            "author": model_info.author,
            "created_at": model_info.created_at.strftime("%Y-%m-%d") if model_info.created_at else None,
            "last_modified": model_info.last_modified.strftime("%Y-%m-%d") if model_info.last_modified else None,
            "region": region,  # tags 最后一个内容
            "language": language,  # card_data 里的 language
            "pipeline_tag": model_info.pipeline_tag if model_info.pipeline_tag else None
        }
    except Exception as e:  # 使用通用异常捕获
        print(f"Error fetching metadata for {model_id}: {e}")
        log_error(model_id, ERROR_FILE)  # 将错误模型记录到文件
        return None

# 主程序
if __name__ == "__main__":
    # 如果输出文件存在，加载已有数据
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    else:
        metadata = {}

    # 读取输入的模型树文件
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        model_tree = json.load(f)

    # 遍历每个模型及其衍生版本
    for base_model, derived_categories in model_tree.items():
        if base_model not in metadata:
            print(f"Fetching metadata for base model: {base_model}")
            base_model_metadata = fetch_model_metadata(base_model)
            if base_model_metadata:
                metadata[base_model] = base_model_metadata
                write_to_json(metadata, OUTPUT_FILE)  # 实时写入文件

        # 处理每个衍生类别
        for category, models in derived_categories.items():
            for model_id in models:
                if model_id not in metadata:
                    print(f"Fetching metadata for model: {model_id}")
                    model_metadata = fetch_model_metadata(model_id)
                    if model_metadata:
                        metadata[model_id] = model_metadata
                        write_to_json(metadata, OUTPUT_FILE)  # 实时写入文件
                else:
                    print(f"Metadata for {model_id} already exists, skipping...")

                # 防止 API 速率限制
                # time.sleep(0.5)  # 短暂等待，防止触发请求限制

    print(f"Metadata collection complete! Data saved to '{OUTPUT_FILE}'.")
    print(f"Errors logged to '{ERROR_FILE}'.")
