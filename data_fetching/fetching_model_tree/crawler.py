'''
需要考虑的问题
1.防止网站阻塞：在爬取数据时，可能会遇到网站的反爬虫机制，导致请求失败。为了避免这种情况，可以设置重试机制，当请求失败时，进行重试；以及设置随机等待时间，降低访问频率，减少被封禁的风险。
2.分页：有些网站的数据可能会分页展示，需要翻页才能获取完整的数据。在爬取数据时，需要考虑如何处理分页的情况。
'''
import requests
from bs4 import BeautifulSoup
import json
import os
import time
import random

# 输入 BASE MODEL 文件路径
BASE_MODEL_FILE = "../find_basemodel/output/basemodels_top1000_likes.txt"

# 输出文件路径
OUTPUT_FOLDER = "output"
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "model_tree_raw.json")
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# 衍生版本与对应的网址模板，支持分页参数 p=<页码>
URL_TEMPLATE = {
    "merge": "https://huggingface.co/models?other=base_model:merge:{}&p={}&sort=downloads",
    "adapter": "https://huggingface.co/models?other=base_model:adapter:{}&p={}&sort=downloads",
    "finetune": "https://huggingface.co/models?other=base_model:finetune:{}&p={}&sort=downloads",
    "quantized": "https://huggingface.co/models?other=base_model:quantized:{}&p={}&sort=downloads"
}

# 爬取函数：支持分页+重试
def fetch_models_for_category(base_model, url_template, category):
    result = []
    page = 0  # 从第 0 页开始
    max_retries = 5  # 最大重试次数
    backoff_factor = 2  # 指数退避因子，等待时间会逐渐加倍

    while True:
        url = url_template.format(base_model, page)
        retries = 0  # 当前页的重试次数

        while retries < max_retries:
            print(f"Fetching '{category}' models for '{base_model}', Page: {page} (Retry {retries}/{max_retries}) - {url}")
            try:
                response = requests.get(url, timeout=20)
                response.raise_for_status()  # 如果状态码不是 200，抛出异常
                soup = BeautifulSoup(response.text, "html.parser")

                # 找到模型名称的元素
                models = soup.find_all("h4", class_="text-md truncate font-mono text-black dark:group-hover/repo:text-yellow-500 group-hover/repo:text-indigo-600 text-smd")
                if not models:  # 如果当前页没有数据，结束分页循环
                    print(f"No more '{category}' models found for page {page}.")
                    return result

                # 提取模型名称
                for model in models:
                    model_name = model.text.strip()
                    result.append(model_name)

                print(f"Found {len(models)} '{category}' models on page {page}.")
                break  # 如果请求成功，跳出重试循环

            except (requests.exceptions.RequestException, ConnectionResetError) as e:
                retries += 1
                print(f"Error fetching page {page}: {e}. Retrying in {backoff_factor ** retries} seconds...")
                time.sleep(backoff_factor ** retries)  # 指数退避等待

        else:  # 如果重试达到最大次数仍然失败
            print(f"Failed to fetch page {page} after {max_retries} retries. Moving to next page or model.")
            with open("output/error_fetching_model_tree.txt", "a") as f:
                f.write(f"Error fetching base model: {base_model}, category: {category}, page: {page}\n")
            return result  # 返回当前已获取的结果，跳出循环

        page += 1  # 继续下一页

    return result

# 主程序：边爬取边写入文件
if __name__ == "__main__":
    print(f"Starting crawler for BASE MODELS from '{BASE_MODEL_FILE}'")

    # 读取已有数据（若文件存在）
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            derived_models = json.load(f)
    else:
        derived_models = {}

    # 逐行读取 BASE MODEL 文件
    with open(BASE_MODEL_FILE, "r", encoding="utf-8") as base_file:
        for line in base_file:
            base_model = line.strip()
            if not base_model or base_model in derived_models:
                continue  # 跳过空行或已爬取的模型

            print(f"\nProcessing BASE MODEL: {base_model}")
            derived_models[base_model] = {"merge": [], "adapter": [], "finetune": [], "quantized": []}

            # 爬取每个分类的衍生模型
            for category, url_template in URL_TEMPLATE.items():
                models = fetch_models_for_category(base_model, url_template, category)
                derived_models[base_model][category] = models

            # 实时写入数据到文件
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(derived_models, f, ensure_ascii=False, indent=4)

            print(f"Completed '{base_model}'. Data saved.")

    print(f"\nCrawling complete! Results saved to '{OUTPUT_FILE}'.")
