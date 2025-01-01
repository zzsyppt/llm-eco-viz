import { supabase } from './supabase';

export class DataService {
    /**
     * 获取所有项目列表
     */
    static async getAllProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('full_name');

        if (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }

        return data;
    }

    /**
     * 搜索项目
     * @param {string} query - 搜索关键词
     */
    static async searchProjects(query) {
        let queryBuilder = supabase
            .from('projects')
            .select('*')
            .order('full_name')
            .limit(10);

        if (query.trim()) {
            queryBuilder = queryBuilder.or(
                `org_name.ilike.%${query}%,` +
                `repo_name.ilike.%${query}%,` +
                `full_name.ilike.%${query}%`
            );
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error searching projects:', error);
            throw error;
        }

        return data;
    }

    /**
     * 获取项目的所有指标数据
     * @param {string} projectFullName - 项目全名 (org/repo)
     */
    static async getProjectMetrics(projectFullName) {
        try {
            // 获取项目 ID
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('full_name', projectFullName)
                .single();

            if (projectError) throw projectError;

            // 获取所有指标数据
            const { data: metricsData, error: metricsError } = await supabase
                .from('metrics')
                .select('metric_type, date, value')
                .eq('project_id', project.id)
                .order('date');

            if (metricsError) throw metricsError;

            // 将数据按指标类型分组
            const formattedData = {};
            metricsData.forEach(({ metric_type, date, value }) => {
                if (!formattedData[metric_type]) {
                    formattedData[metric_type] = [];
                }
                formattedData[metric_type].push({
                    time: date,
                    value: typeof value === 'number' ? value : parseFloat(value) || 0
                });
            });

            // 确保每个指标的数据按时间排序
            Object.keys(formattedData).forEach(metricType => {
                formattedData[metricType].sort((a, b) => a.time.localeCompare(b.time));
            });

            return formattedData;
        } catch (error) {
            console.error('Error fetching project metrics:', error);
            throw error;
        }
    }

    /**
     * 获取项目的特定指标数据
     * @param {string} projectFullName - 项目全名 (org/repo)
     * @param {string} metricType - 指标类型
     */
    static async getProjectMetric(projectFullName, metricType) {
        try {
            // 获取项目 ID
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('full_name', projectFullName)
                .single();

            if (projectError) throw projectError;

            // 获取指标数据
            const { data: metricsData, error: metricsError } = await supabase
                .from('metrics')
                .select('date, value')
                .eq('project_id', project.id)
                .eq('metric_type', metricType)
                .order('date');

            if (metricsError) throw metricsError;

            // 转换为数组格式
            return metricsData.map(({ date, value }) => ({
                time: date,
                value: typeof value === 'number' ? value : parseFloat(value) || 0
            }));
        } catch (error) {
            console.error('Error fetching project metric:', error);
            throw error;
        }
    }

    /**
     * 获取排行榜数据
     * @param {string} metricType - 指标类型
     * @param {number} limit - 限制返回数量
     */
    static async getLeaderboard(metricType, limit = 10) {
        try {
            // 获取最新的日期
            const { data: latestDate } = await supabase
                .from('metrics')
                .select('date')
                .eq('metric_type', metricType)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            if (!latestDate) return [];

            // 获取该日期的排行榜数据
            const { data: leaderboardData, error } = await supabase
                .from('metrics')
                .select(`
                    value,
                    projects:project_id (
                        full_name,
                        org_name,
                        repo_name
                    )
                `)
                .eq('metric_type', metricType)
                .eq('date', latestDate.date)
                .order('value', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return leaderboardData.map(item => ({
                project: item.projects.full_name,
                value: item.value
            }));
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }
} 