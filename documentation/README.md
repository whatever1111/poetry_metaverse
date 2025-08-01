# 陆家花园 - 诗歌元宇宙 (含后台管理)

这是一个结合了心理测试与诗歌生成的互动网页应用，致力于构建可交互的诗歌元宇宙。用户通过回答一系列问题，最终会得到一首与他们心境相匹配的现代诗。本项目采用多项目架构，支持多个独立的诗歌宇宙项目，并提供了完整的后台管理系统。

## 🎯 项目愿景

陆家花园致力于将诗歌从静态文本转化为可交互、可探索的数字体验。通过数据治理和结构化处理，我们正在构建一个真正的诗歌元宇宙，让用户能够：
- 探索诗歌中的人物关系网络
- 体验交互式的时间线叙事
- 浏览结构化的术语和概念体系
- 参与AI驱动的诗歌解读和创作

## 🏗️ 项目架构

### 多项目架构
```
陆家花园诗歌元宇宙/
├── 主项目 (观我生诗歌在场)
│   ├── 心理测试功能
│   ├── 后台管理系统
│   └── 基础API服务
├── 毛小豆宇宙项目
│   ├── 结构化数据治理 (v2.0)
│   ├── 角色关系网络
│   └── 术语概念体系
└── 周与春秋练习项目
    ├── 诗歌内容管理
    └── 测试单元配置
```

### 技术架构
- **后端**: Node.js + Express
- **前端**: HTML + Tailwind CSS + 原生JavaScript
- **数据存储**: 
  - 诗歌文件: `.txt` 格式存储在项目目录中
  - 结构化数据: JSON格式存储在 `data/` 目录中
  - 配置数据: JSON格式存储

## 🚀 功能特性

### 主项目功能
- **心理测试应用**: 可配置的多问题测试，智能匹配专属诗歌
- **AI集成**: Gemini API支持"解诗"和"读诗"功能
- **后台管理**: 完整的诗歌、问题、映射管理界面
- **多测试单元**: 支持创建多个独立的测试单元

### 毛小豆宇宙项目 (v2.0)
- **数据治理**: 完成《毛小豆故事演绎》的全面数据结构化
- **核心数据文件**: 7个结构化数据文件，支持复杂查询
- **数据原则**: 忠于原文、原子性、一致性、受控冗余
- **未来功能**: 视觉化关系图谱、交互式时间线、术语浏览器

### 后台管理系统
- **诗歌管理**: 增删改查操作，支持目录树视图
- **问题管理**: 动态编辑测试问题和选项
- **映射管理**: 配置问题答案与诗歌的映射关系
- **文件持久化**: 所有数据以文件形式存储，便于备份

## 📁 项目结构

```
.
├── 主项目文件
│   ├── server.js              # Express服务器主文件
│   ├── package.json           # 项目依赖配置
│   └── public/                # 前端静态资源
│       ├── index.html         # 心理测试主页
│       ├── admin.html         # 诗歌管理页面
│       ├── admin-questions.html # 问题管理页面
│       ├── admin-mapping.html  # 映射管理页面
│       └── *.js               # 前端逻辑脚本
├── 子项目目录
│   ├── poeject_maoxiaodou_universe/    # 毛小豆宇宙项目
│   │   ├── data/              # 结构化数据文件
│   │   │   ├── poems.json     # 诗歌数据库
│   │   │   ├── terminology.json # 术语词典
│   │   │   ├── characters.json # 角色数据库
│   │   │   ├── themes.json    # 主题数据库
│   │   │   ├── timeline.json  # 时间线数据库
│   │   │   ├── mappings.json  # ID映射数据库
│   │   │   └── metadata.json  # 元数据文件
│   │   └── poems/             # 诗歌文本文件
│   └── poeject_zhou_spring_autumn/     # 周与春秋练习项目
│       ├── data/              # 配置数据
│       └── poems/             # 诗歌文件
├── 文档管理
│   ├── documentation/         # 项目文档
│   │   ├── git-development-guide.md # Git开发指南
│   │   └── changelog/        # 更新日志目录
│   └── archive/              # 归档文件
└── 部署配置
    ├── Dockerfile            # Docker配置
    ├── docker-compose.yml    # Docker Compose配置
    └── nginx.conf           # Nginx配置
```

## 🛠️ 安装与启动

### 环境要求
- [Node.js](https://nodejs.org/) (建议LTS版本)
- npm (通常随Node.js一同安装)

### 快速开始
1. **克隆项目**:
   ```bash
   git clone https://github.com/whatever1111/poetry_metaverse.git
   cd poetry_metaverse
   ```

2. **安装依赖**:
   ```bash
   npm install
   ```

3. **启动服务器**:
   ```bash
   node server.js
   ```

4. **访问应用**:
   - **心理测试主页**: http://localhost:3000
   - **诗歌管理**: http://localhost:3000/admin.html
   - **问题管理**: http://localhost:3000/admin-questions.html
   - **映射管理**: http://localhost:3000/admin-mapping.html

## 📊 数据治理

### 毛小豆宇宙数据治理 (v2.0)
- **治理原则**: 忠于原文、原子性、数据一致性、结构精简、受控冗余
- **核心成果**: 7个结构化数据文件，支持复杂查询和交互
- **数据生态**: 完整的引用关系和统计信息
- **查询优化**: 基于"受控冗余"原则的性能优化

### 测试单元配置
- 支持多个独立的测试单元
- 每个单元包含一组问题和对应的诗歌集合
- 映射规则: N个问题 → 2^N种答案组合 → 对应诗歌

## 🔧 API 端点

### 主项目API
- `GET /api/poems-all`: 获取所有诗歌数据
- `GET /api/poems-tree`: 获取诗歌目录结构
- `GET /api/questions`: 获取测试问题
- `GET /api/mappings`: 获取映射关系
- `PUT /api/questions`: 更新测试问题
- `PUT /api/mappings`: 更新映射关系

### 毛小豆宇宙API
- `GET /api/maoxiaodou/poems`: 获取毛小豆宇宙诗歌数据
- `GET /api/maoxiaodou/characters`: 获取角色关系数据
- `GET /api/maoxiaodou/terminology`: 获取术语词典数据

## 📈 开发进展

### 已完成
- ✅ 主项目基础架构搭建
- ✅ 后台管理系统开发
- ✅ 毛小豆宇宙数据治理 (v2.0)
- ✅ 多项目架构建立
- ✅ Git开发指南文档

### 进行中
- 🔄 毛小豆宇宙交互功能开发
- 🔄 视觉化关系图谱设计
- 🔄 与主项目功能融合

### 计划中
- 📋 交互式时间线功能
- 📋 术语浏览器实现
- 📋 AI驱动的诗歌解读增强
- 📋 用户个性化推荐系统

## 🤝 贡献指南

项目采用标准化的Git开发流程，详细请参考 `documentation/git-development-guide.md`。

## 📄 许可证

本项目采用开源许可证，具体信息请查看LICENSE文件。

---

*陆家花园诗歌元宇宙项目 - 让诗歌成为可交互的数字体验* 