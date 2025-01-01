// components/Metrics.js
import React from 'react';
import RadarChart from './RadarChart';

const Metrics = ({ projectsData }) => {
  if (Object.keys(projectsData).length === 0) {
    return <div>请添加一个项目以显示指标</div>;
  }

  // 计算 OpenRank 平均值和 GitHub 活跃度平均值
  let openrankSum = 0;
  let openrankCount = 0;
  let activitySum = 0;
  let activityCount = 0;

  const projects = Object.keys(projectsData);

  projects.forEach(project => {
    const projectData = projectsData[project];
    if (projectData) {
      const openrankData = projectData.openrank || {};
      const activityData = projectData.activity || {};

      // 获取所有月度 OpenRank 值
      const openrankValues = Object.values(openrankData).filter(value => typeof value === 'number');
      if (openrankValues.length > 0) {
        openrankSum += openrankValues.reduce((a, b) => a + b, 0);
        openrankCount += openrankValues.length;
      }

      // 获取所有月度活动值
      const activityValues = Object.values(activityData).filter(value => typeof value === 'number');
      if (activityValues.length > 0) {
        activitySum += activityValues.reduce((a, b) => a + b, 0);
        activityCount += activityValues.length;
      }
    }
  });

  const openrankAvg = openrankCount ? (openrankSum / openrankCount).toFixed(2) : '0.00';
  const activityAvg = activityCount ? (activitySum / activityCount).toFixed(2) : '0.00';

  // 准备雷达图数据
  const radarData = {
    seriesData: projects.map(project => {
      const projectData = projectsData[project];
      if (!projectData) return null;

      const calculateMedian = (arr) => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
          return (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return sorted[mid];
      };

      const stars = calculateMedian(Object.values(projectData.stars || {}));
      const technical_fork = calculateMedian(Object.values(projectData.technical_fork || {}));
      const new_contributors = calculateMedian(Object.values(projectData.new_contributors || {}));
      const issues_closed = calculateMedian(Object.values(projectData.issues_closed || {}));
      const change_requests_accepted = calculateMedian(Object.values(projectData.change_requests_accepted || {}));

      return {
        name: project,
        value: [stars, technical_fork, new_contributors, issues_closed, change_requests_accepted]
      };
    }).filter(item => item !== null)
  };

  return (
    <div className="metrics-container">
      {/* 核心指标 */}
      <div className="core-metrics">
        <div className="metric-item">
          <div className="core-data-value" id="openrank-avg">{openrankAvg}</div>
          <div className="core-data-label">OpenRank平均值</div>
        </div>
        <div className="metric-item">
          <div className="core-data-value" id="github-avg">{activityAvg}</div>
          <div className="core-data-label">GitHub平均值</div>
        </div>
      </div>
      {/* 雷达图 */}
      <div className="radar-container" style={{ height: '400px', width: '100%' }}>
        <RadarChart data={radarData} />
        <div className="radar-circle"></div>
      </div>
    </div>
  );
};

export default Metrics;
