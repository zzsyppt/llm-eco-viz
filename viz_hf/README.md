## **目录结构**

```
viz_hf/                    # Hugging Face 数据可视化
├── global_dashboard/      # 生态全局数据大屏
├── leaderboard/           # LLM Leaderboard
├── network_graph/         # 网络关系图相关代码
├── static/                # 静态资源
├── templates/             # 前端模板（用于 Flask）
├── app.py                 # Flask 主程序入口
├── config.py              # 配置文件
├── graph.pkl              # 预处理后的图数据
├── README.md              # 项目说明文件
└── requirements.txt       # 后端依赖文件
```

---

## **功能描述**

### 1. `global_dashboard/`
- 构建 Hugging Face 生态的全局数据大屏，用于展示生态系统的整体情况。

---

### 2. `leaderboard/`
- 展示 Hugging Face 上 LLM 的排行榜 (Leaderboard)。

---

### 3. `network_graph/`
- 分析和展示 Hugging Face 模型之间的网络关系图。

---

### 4. `static/`
- 存储静态资源文件（CSS、JavaScript、图片等），用于前端页面的渲染和交互。

---

### 5. `templates/`
- 存储 Flask 使用的 HTML 模板文件，用于动态生成前端页面。

---

### 6. `app.py`
- Flask 主程序入口，定义了所有的后端路由和业务逻辑。

---

### 7. `config.py`
- 配置文件，用于存储应用程序的配置信息，例如数据库连接、API 密钥等。

---

### 8. `graph.pkl`
- 预处理后的图数据文件，用于加速网络关系图的生成与渲染。

---

### 9. `requirements.txt`
- **功能：**  
  列出了项目的所有 Python 依赖库。
- **安装依赖：**
  ```bash
  pip install -r requirements.txt
  ```

---

## **安装与运行**

### 1. 克隆仓库
```bash
git clone https://github.com/your-repo/viz_hf.git
cd viz_hf
```

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 运行应用
```bash
python app.py
```

应用将运行在 `http://127.0.0.1:5000`。

---

## **技术栈**

- **后端：** Flask
- **前端：** HTML + CSS + JavaScript (Jinja2 模板)
- **数据处理：** Pandas, Easy Graph
- **可视化：** D3.js, PyVis



---

## **联系方式**

如有任何问题或建议，请联系开发者：

- 邮箱：zzsyppt@outlook.com
- GitHub Issues: [点击这里](https://github.com/zzsyppt/llm-eco-viz/issues)

