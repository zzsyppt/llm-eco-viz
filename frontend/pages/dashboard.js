// pages/dashboard.js
import React, { useContext, useEffect } from 'react';
import { ProjectContext } from '../contexts/ProjectContext';
import { useRouter } from 'next/router';
import Dashboard from '../components/Dashboard';
import { CircularProgress, Box } from '@mui/material';

const DashboardPage = () => {
    const { selectedProjects, loading } = useContext(ProjectContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && selectedProjects.length === 0) {
            // 如果没有选择项目，重定向到项目选择页面
            router.push('/');
        }
    }, [selectedProjects, loading, router]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (selectedProjects.length === 0) {
        return null; // 已在 useEffect 中重定向
    }

    return <Dashboard />;
};

export default DashboardPage;
