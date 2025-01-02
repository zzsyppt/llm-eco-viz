# LLM Ecosystem Visualization

![Data-OpenDigger](img/Data-OpenDigger-2097FF.svg)

本项目致力于构建一个开源AI大模型生态分析与可视化应用。

### 📂File Structure

本项目的结构如下：
```plaintext
LLM-ECO-VIZ
├── 初赛/                   # 初赛相关文件
├── 复赛/                   # 复赛相关文件
├── data_fetching/          # 数据获取相关代码
│   ├── author_metadata/     # 获取模型作者元数据
│   ├── fetching_model_tree/ # 获取模型及其衍生关系树
│   ├── find_basemodel/      # 获取基础模型数据
│   ├── llm_github_data/     # GitHub相关LLM数据（如项目分类）
│   ├── model_metadata/      # 模型元数据获取
│   └── space_metadata/     # Space相关元数据获取
├── data_hf/                # 用于处理Hugging Face数据
│   ├── graph_computing.py   # 图构建及影响力计算
├── frontend/               # 前端文件夹（使用Next.js）
│   ├── pages/               # 页面组件
│   ├── styles/              # 样式文件
│   └── public/              # 静态资源
├── viz_hf/                 # Hugging Face数据可视化
│   ├── global_dashboard/    # 生态全局数据大屏
│   ├── leaderboard/         # LLM Leaderboard
│   ├── network_graph/       # 网络关系图相关代码
│   ├── static/              # 静态资源
│   ├── templates/           # 前端模板（用于Flask）
│   ├── app.py               # Flask主程序入口
│   ├── config.py            # 配置文件
│   ├── graph.pkl            # 预处理后的图数据
│   └── requirements.txt     # 后端依赖文件
├── img/                    # 图片存储文件夹
```
- [`初赛/`](初赛/)：包含初赛设计方案ppt。
- [`复赛/`](复赛/)：包含复赛产品文档。
- [`data_fetching/`](data_fetching/)：存放获取Hugging Face数据及GitHub数据所用的脚本文件。
- [`data_hf`](data_hf/)：将Hugging Face数据处理成图对象。
- [`frontend`]：GitHub数据大屏可视化子模块。
- [`viz_hf`]：Hugging Face排行榜、生态网络图、数据大屏的可视化子模块。
- [`img/`](img/): 本项目用到的图片。
- [`README.md`](README.md): 项目概览与向导。

### 👥Team Roles

本项目的人员分工：

- [@zzsyppt](https://github.com/zzsyppt)：Hugging Face数据获取与处理；大模型生态网络与排行榜制作；Hugging Face大模型数据大屏制作；大模型影响力算法设计等
- [@JettyCoffee](https://github.com/JettyCoffee)：GitHub数据获取与处理；GitHub大模型数据大屏制作；影响力算法设计；网页应用制作等

### 🚀Getting Started

访问[LLM Ecosystem Visualization](https://jettycoffee.cn)来快速体验！
可参考[产品使用文档](复赛/产品使用文档.md)和[产品技术文档](复赛/产品技术文档.md)
**注** 由于图片资源需要从Hugging Face官网进行加载，因此若您的网络环境不能访问Hugging Face，有关Hugging Face平台的部分可能会加载缓慢。

### 📦Dependencies

详见[requirements.txt](viz_hf/requirements.txt)

### 💡Contributing

如果你想对本项目做出贡献，请发起Pull Request。

### 📝License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.