// pages/_app.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { ProjectProvider } from '../contexts/ProjectContext';
import Header from '../components/Header'; // 引入 Header 组件

function MyApp({ Component, pageProps }) {
    return (
        <ProjectProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Header /> {/* 在所有页面上显示 Header */}
                <Component {...pageProps} />
            </ThemeProvider>
        </ProjectProvider>
    );
}
export default MyApp;

