// contexts/ProjectContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [loading, setLoading] = useState(true); // 添加 loading 状态

    // 从 localStorage 加载已选项目（可选）
    useEffect(() => {
        const storedProjects = localStorage.getItem('selectedProjects');
        if (storedProjects) {
            setSelectedProjects(JSON.parse(storedProjects));
        }
        setLoading(false); // 加载完成
    }, []);

    // 当选定项目变化时，保存到 localStorage（可选）
    useEffect(() => {
        if (!loading) { // 避免初始加载时覆盖
            localStorage.setItem('selectedProjects', JSON.stringify(selectedProjects));
        }
    }, [selectedProjects, loading]);

    return (
        <ProjectContext.Provider value={{ selectedProjects, setSelectedProjects, loading }}>
            {children}
        </ProjectContext.Provider>
    );
};
