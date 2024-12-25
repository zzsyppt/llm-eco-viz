import yaml
import requests
import os
import glob
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_data(name, data_type):
    url = f"https://oss.open-digger.cn/github/{name}/{data_type}.json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.content
    else:
        return None

def save_data(name, data_type, data):
    directory = f"data/{name}"
    if not os.path.exists(directory):
        os.makedirs(directory)
    file_path = f"{directory}/{data_type}.json"
    with open(file_path, 'wb') as file:
        file.write(data)

def load_yaml(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return yaml.safe_load(file)

def process_repo(name, data_type):
    data = fetch_data(name, data_type)
    if data:
        save_data(name, data_type, data)
        print(f"Fetched and saved data for {name} - {data_type}")
    else:
        print(f"Failed to fetch data for {name} - {data_type}")

def main():
    yml_files = glob.glob('E:/llm-eco-viz/dashboard/ai/**/*.yml', recursive=True)
    type_yml = load_yaml('E:/llm-eco-viz/dashboard/type.yml')

    with ThreadPoolExecutor() as executor:
        futures = []
        for yml_file in yml_files:
            data_yml = load_yaml(yml_file)
            for platform in data_yml['data']['platforms']:
                for repo in platform['repos']:
                    name = repo['name']
                    for data_type in type_yml['type']:
                        futures.append(executor.submit(process_repo, name, data_type))
        
        for future in as_completed(futures):
            future.result()

if __name__ == "__main__":
    main()
