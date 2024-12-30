import requests
import json
import os
from datetime import datetime, timedelta

# GitHub API 和认证设置
GITHUB_API_URL = "https://api.github.com"
REPO_URL = "https://github.com/babalae/better-genshin-impact"  # 这里输入目标仓库的网址
ACCESS_TOKEN = "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"  # 替换为你的GitHub访问令牌

# 从 URL 中解析仓库拥有者和仓库名称
def get_repo_info_from_url(url):
    parsed_url = urlparse(url)
    path_parts = parsed_url.path.strip("/").split("/")
    if len(path_parts) == 2:
        return path_parts[0], path_parts[1]
    else:
        raise ValueError(f"Invalid GitHub repository URL: {url}")

# GitHub API 请求函数，获取分页数据
def get_paginated_data(url, headers):
    data = []
    while url:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data.extend(response.json())
            url = response.links.get('next', {}).get('url')
        else:
            raise Exception(f"Error fetching data from {url}: {response.status_code}")
    return data

# 获取过去六个月的日期
def get_six_months_ago():
    six_months_ago = datetime.now() - timedelta(days=30 * 6)
    return six_months_ago.isoformat()

# 获取仓库的活动指标数据
def get_repo_activity(REPO_OWNER, REPO_NAME, headers):
    commits_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    commits = get_paginated_data(commits_url, headers)
    activity_data = defaultdict(int)
    six_months_ago = get_six_months_ago()
    
    for commit in commits:
        commit_date = commit['commit']['author']['date']
        if commit_date >= six_months_ago:
            commit_month = datetime.fromisoformat(commit_date[:-1]).strftime('%Y-%m')
            activity_data[commit_month] += 1
    
    return activity_data

# 获取仓库的Star数量
def get_repo_stars(REPO_OWNER, REPO_NAME, headers):
    repo_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}"
    response = requests.get(repo_url, headers=headers)
    if response.status_code == 200:
        repo_data = response.json()
        return {datetime.now().strftime('%Y-%m'): repo_data['stargazers_count']}
    else:
        raise Exception("Error fetching repo stars")

# 获取仓库的fork数量
def get_repo_forks(REPO_OWNER, REPO_NAME, headers):
    repo_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}"
    response = requests.get(repo_url, headers=headers)
    if response.status_code == 200:
        repo_data = response.json()
        return {datetime.now().strftime('%Y-%m'): repo_data['forks_count']}
    else:
        raise Exception("Error fetching repo forks")

# 获取问题状态
def get_issues_status(REPO_OWNER, REPO_NAME, headers):
    issues_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/issues?state=all"
    issues = get_paginated_data(issues_url, headers)
    issues_data = defaultdict(lambda: {'open': 0, 'closed': 0})
    six_months_ago = get_six_months_ago()
    
    for issue in issues:
        issue_date = issue['created_at']
        if issue_date >= six_months_ago:
            issue_month = datetime.fromisoformat(issue_date[:-1]).strftime('%Y-%m')
            if issue['state'] == 'open':
                issues_data[issue_month]['open'] += 1
            elif issue['state'] == 'closed':
                issues_data[issue_month]['closed'] += 1
    
    return issues_data

# 获取Pull Request状态
def get_pull_requests_status(REPO_OWNER, REPO_NAME, headers):
    pulls_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/pulls?state=all"
    pulls = get_paginated_data(pulls_url, headers)
    pull_data = defaultdict(lambda: {'open': 0, 'closed': 0})
    six_months_ago = get_six_months_ago()
    
    for pr in pulls:
        pr_date = pr['created_at']
        if pr_date >= six_months_ago:
            pr_month = datetime.fromisoformat(pr_date[:-1]).strftime('%Y-%m')
            if pr['state'] == 'open':
                pull_data[pr_month]['open'] += 1
            elif pr['state'] == 'closed':
                pull_data[pr_month]['closed'] += 1
    
    return pull_data

# 获取Issues评论
def get_issue_comments(REPO_OWNER, REPO_NAME, headers):
    issues_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/issues/comments"
    comments = get_paginated_data(issues_url, headers)
    comment_data = defaultdict(int)
    six_months_ago = get_six_months_ago()
    
    for comment in comments:
        comment_date = comment['created_at']
        if comment_date >= six_months_ago:
            comment_month = datetime.fromisoformat(comment_date[:-1]).strftime('%Y-%m')
            comment_data[comment_month] += 1
    
    return comment_data

# 保存数据为JSON文件
def save_data_to_json(data, filename):
    if not os.path.exists("output"):
        os.makedirs("output")
    with open(f"output/{filename}", "w") as f:
        json.dump(data, f, indent=4)

# 主程序
def main():
    # 从 URL 中获取仓库信息
    try:
        REPO_OWNER, REPO_NAME = get_repo_info_from_url(REPO_URL)
    except ValueError as e:
        print(e)
        return

    # 定义请求头，包含GitHub访问令牌
    HEADERS = {
        "Authorization": f"token {ACCESS_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    # 获取各项指标数据
    print("Fetching repository activity...")
    activity_data = get_repo_activity(REPO_OWNER, REPO_NAME, HEADERS)
    save_data_to_json(activity_data, 'activity.json')

    print("Fetching stars...")
    stars_data = get_repo_stars(REPO_OWNER, REPO_NAME, HEADERS)
    save_data_to_json(stars_data, 'stars.json')

    print("Fetching forks...")
    forks_data = get_repo_forks(REPO_OWNER, REPO_NAME, HEADERS)
    save_data_to_json(forks_data, 'forks.json')

    print("Fetching issues status...")
    issues_data = get_issues_status(REPO_OWNER, REPO_NAME, HEADERS)
    save_data_to_json(issues_data, 'issues_status.json')

    print("Fetching pull requests status...")
    pulls_data = get_pull_requests_status(REPO_OWNER, REPO_NAME, HEADERS)
    save_data_to_json(pulls_data, 'pull_requests_status.json')

    print("Fetching issue comments...")
    comments_data = get_issue_comments(REPO_OWNER, REPO_NAME, HEADERS)
    save_data_to_json(comments_data, 'issue_comments.json')

    print("Data fetching and saving completed.")

if __name__ == "__main__":
    main()
