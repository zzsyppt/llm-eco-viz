import { DataService } from '../../lib/dataService';

export default async function handler(req, res) {
    const { metric = 'openrank', limit = 10 } = req.query;

    try {
        const data = await DataService.getLeaderboard(metric, parseInt(limit));
        res.status(200).json(data);
    } catch (error) {
        console.error('Leaderboard API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 