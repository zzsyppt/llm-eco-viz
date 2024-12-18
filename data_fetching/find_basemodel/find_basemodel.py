from huggingface_hub import HfApi

# 初始化 Hugging Face API
api = HfApi()

# 获取 Hugging Face 上的所有模型
models = api.list_models(sort="likes",         # 按点赞量排序
    direction=-1,             # 降序排序
    limit=1000,                # 返回前 1000 个模型
    )

# 提取 Base Model 信息
base_models = set()
error_models = set()

for model in models:
    try:
        # 获取模型详细信息
        model_info = api.model_info(model.modelId)
        #print("get model info for:", model_info.id)
        # 提取 base_model 字段
        if 'base_model' in model_info.card_data:
            base_model = model_info.card_data['base_model']
            if base_model == None:
                base_models.add(model_info.id)
                print("add base_model self:", model_info.id)
            else:
                if(base_model.__class__ == list):
                    base_models.add(base_model[0])
                    print("add base_model dad:", base_model[0])
                else:
                    base_models.add(base_model)
                    print("add base_model dad:", base_model)
            #print("现在找到的base_models数/所有base-model：", len(base_models))       
    except Exception as e:
        # 忽略访问错误的模型
        print(f"Error accessing {model.modelId}: {e}")
        error_models.add(model.modelId)

# 输出所有 Base Models
print("Base Models found on Hugging Face:")
# 打印到文件result.txt
with open("output/base_models_top1000_likes.txt", "w") as file:
    for base_model in base_models:
        file.write(base_model + "\n")

print("Base Models found on Hugging Face:")
with open("output/error_finding_base_models_new_1000.txt", "w") as file:
    for error_model in error_models:
        file.write(error_model + "\n")
