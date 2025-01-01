-- 创建项目表
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    org_name TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    full_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建指标数据表
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    metric_type TEXT NOT NULL,
    date TEXT NOT NULL,
    value FLOAT8 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_metrics_project_metric ON metrics(project_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(date);
CREATE INDEX IF NOT EXISTS idx_projects_full_name ON projects(full_name);
CREATE INDEX IF NOT EXISTS idx_projects_org_name ON projects(org_name);
CREATE INDEX IF NOT EXISTS idx_projects_repo_name ON projects(repo_name); 