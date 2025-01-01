// pages/api/projects/index.js
import fs from 'fs';
import path from 'path';

/**
 * 递归读取目录，列出所有子项目路径
 * @param {string} dir - 当前目录路径
 * @param {string} baseDir - 基础目录路径，用于计算相对路径
 * @returns {Array} - 项目路径数组
 */
const getAllProjects = (dir, baseDir) => {
  let projects = [];
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      projects.push(relativePath.split(path.sep).join('/')); // 使用 '/' 作为路径分隔符
      // 递归读取子目录
      projects = projects.concat(getAllProjects(fullPath, baseDir));
    }
  });
  
  return projects;
};

export default function handler(req, res) {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  console.log('Data directory path:', dataDir); // 添加日志

  try {
    if (!fs.existsSync(dataDir)) {
      console.error('Data directory does not exist:', dataDir);
      return res.status(404).json({ error: 'Data directory not found' });
    }

    const projects = getAllProjects(dataDir, dataDir);
    console.log('Found projects:', projects); // 添加日志

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error reading projects:', error);
    res.status(500).json({ error: 'Failed to load projects' });
  }
}
