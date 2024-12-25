import os
import json
import requests
from bs4 import BeautifulSoup


def fetch_user_data(user_or_org_name):
    url = f"https://huggingface.co/{user_or_org_name}"
    headers = {"User-Agent": "Mozilla/5.0"}

    # 发起请求
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # 如果请求失败，抛出异常
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {user_or_org_name}: {e}")
        return None

    soup = BeautifulSoup(response.content, "html.parser")
    data = {}

    # 判断是 usr 还是 org
    body_class = soup.body.get("class", [])
    if "OrgPage" in body_class:
        # Org 类型页面
        data["type"] = "org"
        data["full_name"] = soup.find("h1", class_="mb-2 mr-3 text-2xl font-bold md:mb-0").text.strip()
        photo_tag = soup.find("img", class_="h-full w-full rounded-lg object-cover")
        data["photo"] = photo_tag["src"] if photo_tag else None
        type_tag = soup.find("span", class_="capitalize")
        data["nature"] = type_tag.text.strip() if type_tag else None
        website_tag = soup.find("a", rel="nofollow", href=True)
        data["website"] = website_tag["href"] if website_tag else None
        github_tag = soup.find("a", href=lambda href: href and "github.com" in href)
        data["github"] = github_tag["href"] if github_tag else None
        followers_tag = soup.find("span", title=lambda title: title and "followers" in title.lower())
        data["followers"] = followers_tag.text.strip() if followers_tag else "0"
        model_count_tag = soup.find("span", class_="ml-3 w-7 font-normal text-gray-400")
        data["models"] = model_count_tag.text.strip() if model_count_tag else "0"

    elif "UserPage" in body_class:
        # Usr 类型页面
        data["type"] = "usr"
        full_name_tag = soup.find("span", class_="mr-3 leading-6")
        data["full_name"] = full_name_tag.text.strip() if full_name_tag else None
        profile_picture_tag = soup.find("img", class_="h-32 w-32 overflow-hidden rounded-full shadow-inner lg:h-48 lg:w-48")
        data["profile_picture"] = profile_picture_tag["src"] if profile_picture_tag else None
        github_tag = soup.find("a", href=lambda href: href and "github.com" in href)
        data["github"] = github_tag["href"] if github_tag else None

        # 获取用户参与的组织信息
        org_tags = soup.select("div.mt-3.flex.flex-wrap a.mb-1.mr-1.inline-block")
        data["organizations"] = [
            {"name": org.get("href", "").strip("/"), "logo": org.find("img")["src"]} for org in org_tags
        ]

        followers_tag = soup.find("button", string=lambda s: s and "following" in s.lower())
        data["followers"] = followers_tag.text.strip() if followers_tag else "0"

        models_count_tag = soup.find("div", id="models")
        if models_count_tag:
            models_header = models_count_tag.find("h3")
            model_count_span = models_header.find("span", class_="ml-3 w-7 font-normal text-gray-400")
            data["models"] = model_count_span.text.strip() if model_count_span else "0"

    else:
        print(f"Unknown page type for {user_or_org_name}.")
        return None

    return {user_or_org_name: data}


def main():
    input_file = "../model_metadata/output/model_metadata.json"
    output_dir = "output"
    org_output_file = os.path.join(output_dir, "org_data.json")
    usr_output_file = os.path.join(output_dir, "usr_data.json")
    error_file = os.path.join(output_dir, "error_getting_author_info.txt")
    os.makedirs(output_dir, exist_ok=True)

    # 读取输入的 model_metadata.json
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            model_metadata = json.load(f)
    except FileNotFoundError:
        print(f"Input file {input_file} not found.")
        return
    except json.JSONDecodeError as e:
        print(f"Error reading JSON file {input_file}: {e}")
        return

    # 获取所有键作为 user_or_org_list
    user_or_org_list = [key.split("/")[0] for key in model_metadata.keys()]
    user_or_org_list = list(set(user_or_org_list))  # 去重

    # 读取已存在的 org 和 usr 数据
    if os.path.exists(org_output_file):
        with open(org_output_file, "r", encoding="utf-8") as f:
            org_data = json.load(f)
    else:
        org_data = {}

    if os.path.exists(usr_output_file):
        with open(usr_output_file, "r", encoding="utf-8") as f:
            usr_data = json.load(f)
    else:
        usr_data = {}

    for name in user_or_org_list:
        # 跳过已存在的数据
        if name in org_data or name in usr_data:
            print(f"{name} already exists. Skipping...")
            continue

        print(f"Fetching data for {name}...")
        result = fetch_user_data(name)
        if result:
            # 根据类型写入对应的文件
            if result[name]["type"] == "org":
                org_data.update(result)
                with open(org_output_file, "w", encoding="utf-8") as f:
                    json.dump(org_data, f, ensure_ascii=False, indent=4)
            elif result[name]["type"] == "usr":
                usr_data.update(result)
                with open(usr_output_file, "w", encoding="utf-8") as f:
                    json.dump(usr_data, f, ensure_ascii=False, indent=4)
        else:
            # 写入错误日志
            with open(error_file, "a", encoding="utf-8") as ef:
                ef.write(f"{name}\n")
            print(f"Failed to fetch data for {name}. Logged in {error_file}.")

    print(f"Org data successfully saved to {org_output_file}")
    print(f"Usr data successfully saved to {usr_output_file}")
    print(f"Errors (if any) logged in {error_file}")


if __name__ == "__main__":
    main()
