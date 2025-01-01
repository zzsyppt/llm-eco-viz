import { DataService } from '../../../lib/dataService';

export default async function handler(req, res) {
    const { q = '' } = req.query;

    try {
        const data = await DataService.searchProjects(q);
        res.status(200).json(data);
    } catch (error) {
        console.error('Project search API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 