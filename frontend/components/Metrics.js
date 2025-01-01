// components/Metrics.js
import React from 'react';

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
    </div>
  );
};

export default Metrics;
