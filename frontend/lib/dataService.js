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

        console.log('Available projects:', data.map(p => p.full_name));
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

        console.log('Search results for query:', query, data?.map(p => p.full_name));
        return data;
    }

    /**
     * 获取项目的所有指标数据
     * @param {string} projectFullName - 项目全名 (org/repo)
     */
    static async getProjectMetrics(projectFullName) {
        try {
            console.log('Fetching metrics for project:', projectFullName);
            
            // 获取项目 ID
            const { data: projects, error: projectError } = await supabase
                .from('projects')
                .select('*')  // 选择所有字段以便调试
                .eq('full_name', projectFullName);

            if (projectError) {
                console.error('Project query error:', projectError);
                throw projectError;
            }

            console.log('Project query result:', projects);

            if (!projects || projects.length === 0) {
                console.warn(`Project not found: ${projectFullName}`);
                // 获取所有项目列表以便调试
                const { data: allProjects } = await supabase
                    .from('projects')
                    .select('full_name')
                    .order('full_name');
                console.log('Available projects:', allProjects?.map(p => p.full_name));
                return {};
            }

            const project = projects[0];
            console.log('Found project:', project);

            // 获取所有指标数据
            const { data: metricsData, error: metricsError } = await supabase
                .from('metrics')
                .select('metric_type, date, value')
                .eq('project_id', project.id)
                .order('date');

            if (metricsError) {
                console.error('Metrics query error:', metricsError);
                throw metricsError;
            }

            console.log('Metrics data count:', metricsData?.length);

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

            console.log('Available metric types:', Object.keys(formattedData));
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
            const { data: projects, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('full_name', projectFullName);

            if (projectError) throw projectError;
            if (!projects || projects.length === 0) {
                console.warn(`Project not found: ${projectFullName}`);
                return [];
            }

            const project = projects[0];

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
            const { data: dates, error: dateError } = await supabase
                .from('metrics')
                .select('date')
                .eq('metric_type', metricType)
                .order('date', { ascending: false })
                .limit(1);

            if (dateError) throw dateError;
            if (!dates || dates.length === 0) return [];

            const latestDate = dates[0];

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