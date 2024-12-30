// components/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from '../contexts/ProjectContext';
import Footer from './Footer';
import ChartCard from './ChartCard';
import { ChartService } from '../utils/ChartService';
import {
    Container,
    Grid,
    Typography,
    Paper,
    Box,
    CircularProgress
} from '@mui/material';
import ProjectInfo from './ProjectInfo';
import Header from './Header';

const Dashboard = () => {
    const { selectedProjects } = useContext(ProjectContext);
    const [projectsData, setProjectsData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    /**
     * 获取所有项目的数据
     */
    useEffect(() => {
        const fetchAllProjectsData = async () => {
            const dataTypes = [
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

            const allProjectsData = {};

            for (const projectName of selectedProjects) {
                const projectData = {};

                for (const dataType of dataTypes) {
                    try {
                        const response = await fetch(`/api/data/${encodeURIComponent(projectName)}/${dataType}`);
                        if (response.ok) {
                            const data = await response.json();
                            // 将数据转换为时间序列格式
                            const timeSeriesData = Object.entries(data)
                                .filter(([key]) => {
                                    // 只保留年月格式的数据 (YYYY-MM)
                                    return /^\d{4}-\d{2}$/.test(key);
                                })
                                .map(([time, value]) => ({
                                    time: time,
                                    value: typeof value === 'number' ? value : parseFloat(value) || 0
                                }))
                                .sort((a, b) => a.time.localeCompare(b.time));

                            projectData[dataType] = timeSeriesData;
                            console.log(`Loaded ${dataType} data for ${projectName}:`, timeSeriesData);
                        } else {
                            console.error(`Failed to load ${dataType} data for ${projectName}: ${response.status}`);
                            projectData[dataType] = [];
                        }
                    } catch (error) {
                        console.error(`Error loading ${dataType} data for ${projectName}:`, error);
                        projectData[dataType] = [];
                    }
                }

                allProjectsData[projectName] = projectData;
            }

            console.log('All projects data:', allProjectsData);
            setProjectsData(allProjectsData);
            setLoadingData(false);
        };

        if (selectedProjects.length > 0) {
            setLoadingData(true);
            fetchAllProjectsData();
        }
    }, [selectedProjects]);

    /**
     * 初始化图表
     */
    useEffect(() => {
        if (selectedProjects.length > 0 && Object.keys(projectsData).length > 0) {
            try {
                // 初始化图表配置
                ChartService.initCharts(selectedProjects, projectsData);
                // 获取生成的图表配置
                const options = ChartService.getChartOptions();
                console.log('Chart options:', options);
                setChartOptions(options);
            } catch (error) {
                console.error('Error initializing charts:', error);
            }
        }
    }, [selectedProjects, projectsData]);

    if (loadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="dashboard-container">
            <Header />
            <Box sx={{ mt: '64px' }}>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {/* 项目信息栏 */}
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {selectedProjects.map((project) => (
                                <ProjectInfo key={project} project={project} />
                            ))}
                        </Box>
                    </Paper>

                    {/* 图表区域 */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {/* 项目关注度图表 */}
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <ChartCard chartId="project-attention-chart" chartOptions={chartOptions.projectAttentionOptions} />
                        </Box>

                        {/* OpenRank 图表 */}
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <ChartCard chartId="openrank-chart" chartOptions={chartOptions.openRankOptions} />
                        </Box>

                        {/* 代码变更行为图表 */}
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <ChartCard chartId="code-change-behavior-chart" chartOptions={chartOptions.codeChangeBehaviorOptions} />
                        </Box>

                        {/* PR 情况图表 */}
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <ChartCard chartId="pr-situation-chart" chartOptions={chartOptions.prSituationOptions} />
                        </Box>

                        {/* Issue 变化图表 */}
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <ChartCard chartId="issue-changes-chart" chartOptions={chartOptions.issueChangesOptions} />
                        </Box>

                        {/* 项目活跃度图表 */}
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <ChartCard chartId="project-activity-chart" chartOptions={chartOptions.projectActivityOptions} />
                        </Box>
                    </Box>
                </Container>
            </Box>
            <Footer />

            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    background-color: #ffffff;
                }
                .dashboard-container {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
