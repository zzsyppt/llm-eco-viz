// pages/api/data/[...params].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { params } = req.query; // params 是一个数组
  if (params.length < 2) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const dataType = params.pop(); // 最后一个参数是 dataType
  const project = params.join('/'); // 其余的参数组成 project 路径

  const filePath = path.join(process.cwd(), 'public', 'data', project, `${dataType}.json`);
  console.log(`Fetching data for project: ${project}, dataType: ${dataType}`);
  console.log(`File path: ${filePath}`);

  try {
    if (!fs.existsSync(filePath)) {
      console.error('Data file does not exist:', filePath);
      return res.status(404).json({ error: 'Data not found' });
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error loading data for project: ${project}, dataType: ${dataType}`, error);
    res.status(500).json({ error: 'Failed to load data' });
  }
}
