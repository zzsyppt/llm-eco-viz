// components/GithubTable.js
import React from 'react';

const GithubTable = ({ projectsData }) => {
  if (Object.keys(projectsData).length === 0) {
    return <div>请添加一个项目以显示 GitHub 数据</div>;
  }

  const projects = Object.keys(projectsData);

  const projectMetrics = projects.map(project => {
    const projectData = projectsData[project];
    if (!projectData) return null;

    const getLatestMonthlyValue = (data) => {
      if (!data) return 0;
      const monthlyData = Object.entries(data)
        .filter(([key]) => /^\d{4}-\d{2}$/.test(key))
        .sort(([a], [b]) => b.localeCompare(a));
      return monthlyData.length ? monthlyData[0][1] : 0;
    };

    const metrics = {
      stars: getLatestMonthlyValue(projectData.stars),
      technical_fork: getLatestMonthlyValue(projectData.technical_fork),
      new_contributors: getLatestMonthlyValue(projectData.new_contributors),
      issues_closed: getLatestMonthlyValue(projectData.issues_closed),
      change_requests_accepted: getLatestMonthlyValue(projectData.change_requests_accepted),
    };

    return {
      project: project,
      stars: metrics.stars.toFixed(2),
      technical_fork: metrics.technical_fork.toFixed(2),
      new_contributors: metrics.new_contributors.toFixed(2),
      issues_closed: metrics.issues_closed.toFixed(2),
      change_requests_accepted: metrics.change_requests_accepted.toFixed(2),
    };
  }).filter(item => item !== null);

  return (
    <div className="card">
      <div className="chart-container" id="github-table">
        <table style={{ width: '100%', color: '#7eb6ef', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,168,255,0.1)' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>项目名</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>星标数</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>技术分叉</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>新贡献者</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>已解决问题</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>已接受PR</th>
            </tr>
          </thead>
          <tbody>
            {projectMetrics.map((metric, index) => (
              <tr key={index} style={{ background: index % 2 === 0 ? 'rgba(0,168,255,0.05)' : 'transparent' }}>
                <td style={{ padding: '10px', textAlign: 'left' }}>{metric.project}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{metric.stars}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{metric.technical_fork}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{metric.new_contributors}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{metric.issues_closed}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{metric.change_requests_accepted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GithubTable;
