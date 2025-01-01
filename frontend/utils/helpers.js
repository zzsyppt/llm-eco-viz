// utils/helpers.js

/**
 * 获取最深层级的项目列表
 * @param {Array<string>} projects - 所有项目路径数组
 * @returns {Array<string>} - 最深层级的项目路径数组
 */
export const getDeepestProjects = (projects) => {
    const projectSet = new Set(projects);
    const nonDeepProjects = new Set();

    projects.forEach(project => {
        const parts = project.split('/');
        if (parts.length > 1) {
            for (let i = 1; i < parts.length; i++) {
                const parent = parts.slice(0, i).join('/');
                nonDeepProjects.add(parent);
            }
        }
    });

    return projects.filter(project => !nonDeepProjects.has(project));
};
