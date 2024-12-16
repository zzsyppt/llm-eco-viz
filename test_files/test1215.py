from huggingface_hub import HfApi

# 初始化 API
api = HfApi()

# 获取模型信息
model_id = "tencent/HunyuanVideo"  # 替换为你需要的模型ID
model_info = api.model_info(repo_id=model_id)

# 输出模型元信息
print(model_info)
