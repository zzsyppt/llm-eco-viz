import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../lib/supabase.js';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const METRIC_TYPES = [
    'activity',
    'openrank',
    'stars',
    'technical_fork',
    'attention',
    'bus_factor',
    'new_contributors',
    'issues_closed',
    'issue_comments',
    'issues_new',
    'issue_response_time',
    'issue_resolution_duration',
    'change_requests_accepted',
    'change_requests',
    'change_requests_reviews',
    'change_request_response_time',
    'change_request_resolution_duration',
    'code_change_lines_remove',
    'code_change_lines_add'
];

async function migrateData() {
    try {
        // 读取所有项目目录
        const organizations = await fs.readdir(DATA_DIR);
        
        for (const org of organizations) {
            const orgPath = path.join(DATA_DIR, org);
            const repos = await fs.readdir(orgPath);
            
            for (const repo of repos) {
                const repoPath = path.join(orgPath, repo);
                console.log(`Processing ${org}/${repo}...`);

                // 插入项目记录
                const { data: project, error: projectError } = await supabase
                    .from('projects')
                    .upsert({
                        full_name: `${org}/${repo}`,
                        organization: org,
                        name: repo
                    })
                    .select()
                    .single();

                if (projectError) {
                    console.error(`Error inserting project ${org}/${repo}:`, projectError);
                    continue;
                }

                // 处理每种指标
                for (const metricType of METRIC_TYPES) {
                    const metricPath = path.join(repoPath, `${metricType}.json`);
                    
                    try {
                        const fileContent = await fs.readFile(metricPath, 'utf-8');
                        const metricData = JSON.parse(fileContent);

                        // 将对象格式转换为时间序列数组
                        const timeSeriesData = Object.entries(metricData)
                            .filter(([key]) => /^\d{4}(-\d{2})?$/.test(key))
                            .map(([time, value]) => ({
                                project_id: project.id,
                                metric_type: metricType,
                                time: time.length === 4 ? `${time}-01` : time,
                                value: typeof value === 'number' ? value : parseFloat(value) || 0
                            }));

                        if (timeSeriesData.length > 0) {
                            const { error: insertError } = await supabase
                                .from('time_series')
                                .upsert(timeSeriesData);

                            if (insertError) {
                                console.error(`Error inserting time series data for ${org}/${repo} ${metricType}:`, insertError);
                            }
                        }
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.error(`Error processing ${metricType} for ${org}/${repo}:`, err);
                        }
                    }
                }
            }
        }
        
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateData(); 