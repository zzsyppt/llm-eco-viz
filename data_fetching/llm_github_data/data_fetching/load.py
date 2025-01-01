import os
import json

# 获取当前目录下所有文件夹的目录结构
def get_folders_structure(root_dir):
    folder_list = []
    
    # 遍历目录树
    for root, dirs, files in os.walk(root_dir):
        for dir_name in dirs:
            # 将每个子文件夹的相对路径加入列表
            relative_path = os.path.relpath(os.path.join(root, dir_name), start=root_dir)
            folder_list.append(relative_path.replace(os.sep, '/'))  # 转换路径分隔符为 '/'
    
    return folder_list

# 将目录结构保存到 JSON 文件
def save_structure_to_json(root_dir, output_file):
    folder_list = get_folders_structure(root_dir)
    
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(folder_list, json_file, indent=4, ensure_ascii=False)
    print(f"目录结构已保存到 {output_file}")

# 使用当前目录和指定的输出文件名
current_directory = os.getcwd()
output_json_file = 'folder_structure.json'

save_structure_to_json(current_directory, output_json_file)
