// pages/api/data/[...params].js
import { DataService } from '../../../lib/dataService';

export default async function handler(req, res) {
    const { params } = req.query;
    const [projectFullName, metricType] = params;

    if (!projectFullName || !metricType) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        if (metricType === 'all') {
            const data = await DataService.getProjectMetrics(projectFullName);
            res.status(200).json(data);
        } else {
            const data = await DataService.getProjectMetric(projectFullName, metricType);
            res.status(200).json(data);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
