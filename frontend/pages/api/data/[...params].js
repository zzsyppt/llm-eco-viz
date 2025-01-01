// pages/api/data/[...params].js
import { DataService } from '../../../lib/dataService';

export default async function handler(req, res) {
    console.log('API Route called with query:', req.query);
    const { params } = req.query;
    
    // 确保有足够的参数
    if (!params || params.length < 3) {
        console.error('Invalid params length:', params?.length);
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    // 正确处理组织名和仓库名
    const [org, repo, metricType] = params;
    const projectFullName = `${org}/${repo}`;

    console.log('Parsed parameters:', { org, repo, projectFullName, metricType });

    if (!org || !repo || !metricType) {
        console.error('Missing required parameters:', { org, repo, metricType });
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        console.log(`Attempting to fetch ${metricType} data for project: ${projectFullName}`);
        
        if (metricType === 'all') {
            const data = await DataService.getProjectMetrics(projectFullName);
            console.log(`Successfully fetched all metrics for ${projectFullName}:`, Object.keys(data));
            res.status(200).json(data);
        } else {
            const data = await DataService.getProjectMetric(projectFullName, metricType);
            console.log(`Successfully fetched ${metricType} metric for ${projectFullName}:`, data.length);
            res.status(200).json(data);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
