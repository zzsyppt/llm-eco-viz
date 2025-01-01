// utils/DataService.js
export const DataService = {
  /**
   * 获取所有项目的数据
   * @param {Array} projects - 项目名称列表（如 ['project1', 'project2', ...]）
   * @returns {Object} - 包含所有项目数据的对象
   */
  getAllProjectsData: async (projects) => {
    const dataTypes = [
      'pr_efficiency', 
      'openrank', 
      'attention',
      'activity', 
      'project_activity',
      'issue_resolution_duration' // 添加您需要的数据类型
    ];
    
    const projectsData = {};
    
    for (const project of projects) {
      projectsData[project] = {};
      // 加载所有类型的数据
      for (const dataType of dataTypes) {
        try {
          // 从 API 路由获取数据
          const response = await fetch(`/api/data/${project}/${dataType}`);
          if (response.ok) {
            const data = await response.json();
            projectsData[project][dataType] = data;
          } else {
            console.error(`Failed to load ${dataType} data for ${project}: ${response.status}`);
            projectsData[project][dataType] = null;
          }
        } catch (error) {
          console.error(`Error loading ${dataType} data for ${project}:`, error);
          projectsData[project][dataType] = null;
        }
      }
    }
    
    return projectsData;
  },
};
