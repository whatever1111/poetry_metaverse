# 陆家花园诗歌元宇宙项目 - Git开发指南

> 本文档专为陆家花园诗歌元宇宙项目的开发团队编写，特别是为不熟悉Git开发流程的团队成员提供标准化的Git操作指南。

> **📖 阅读建议 (Reading Suggestions)**
> - **新手开发者**：建议按顺序阅读全部章节，从"开始前"到"最佳实践"
> - **熟悉Git的开发者**：可优先阅读[项目概述](#项目概述)、[日常开发流程](#日常开发流程)、[协作开发](#协作开发)等核心章节
> - **AI助手**：⚠️ **TOKEN优化约束** - 执行任务前请先阅读"项目概述"章节了解工作流，然后根据具体任务选择相关章节。**严禁一次性读取整个文档，必须按需加载以避免不必要的token消耗。**

## 📋 目录

- [开始前](#开始前)
- [项目概述](#项目概述)
- [基础概念](#基础概念)
- [项目文档管理](#项目文档管理)
- [分支管理](#分支管理)
- [日常开发流程](#日常开发流程)
- [协作开发](#协作开发)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 🚀 开始前

### 1. Git环境准备

#### 安装Git
```bash
# Windows (推荐使用Git for Windows)
# 下载地址: https://git-scm.com/download/win

# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git
```

#### 验证安装
```bash
git --version
```
**陆家花园项目示例**:
```bash
$ git --version
git version 2.40.0.windows.1
```

### 2. 个人身份设置

#### 设置用户名和邮箱
```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```
**陆家花园项目示例**:
```bash
# 设置西尔的Git身份信息
git config --global user.name "szjetfighter"
git config --global user.email "40232607@qq.com"
```

#### 验证设置
```bash
git config --global user.name
git config --global user.email
```
**陆家花园项目示例**:
```bash
$ git config --global user.name
szjetfighter

$ git config --global user.email
40232607@qq.com
```

### 3. Forking工作流：黄金原则与环境设置
本项目采用标准的Forking工作流。任何开发者在进行本地开发前，都**必须**完成以下配置。

#### 第1步：Fork主仓库
在GitHub上，访问项目主仓库 `https://github.com/whatever1111/poetry_metaverse.git`，点击右上角的 **Fork** 按钮，创建一份属于你自己的仓库副本。你可以自由命名这份Fork。

#### 第2步：Clone你的Fork
将**你自己的复刻仓库**克隆到本地。请将URL中的占位符替换为你的实际信息。
```bash
# 规范指令
git clone https://github.com/[你的用户名]/[你的Fork仓库名].git
cd [你的Fork仓库名]
```
**以`szjetfighter`用户为例**:
```bash
git clone https://github.com/szjetfighter/lu_garden_lab.git
cd lu_garden_lab
```

#### 第3步：配置双远程源 (关键步骤)
为你的本地仓库同时配置`origin`和`upstream`两个远程仓库别名。
- `origin`: 指向你自己的复刻仓库，这是你推送代码的地方。
- `upstream`: 指向项目的主仓库，这是你同步官方更新的地方。
```bash
# 规范指令
git remote add upstream https://github.com/whatever1111/poetry_metaverse.git
```

#### 第4步：验证配置
运行 `git remote -v` 命令，验证你的远程仓库配置是否正确。
**正确配置的通用模式**:
```
origin    https://github.com/[你的用户名]/[你的Fork仓库名].git (fetch)
origin    https://github.com/[你的用户名]/[你的Fork仓库名].git (push)
upstream  https://github.com/whatever1111/poetry_metaverse.git (fetch)
upstream  https://github.com/whatever1111/poetry_metaverse.git (push)
```
**所有后续的开发流程，都将严格围绕 `origin` 和 `upstream` 的不同角色展开。**

---

## 🎯 项目概述

### 工作流核心
本项目严格遵循以 **Pull Request** 为核心的 **Forking工作流**。所有贡献者（包括核心开发者）都在自己的Fork仓库中工作，并通过Pull Request将代码贡献回主仓库。这种模式最大限度地保证了主仓库的稳定和代码质量。

### 项目云端结构与代码流
本项目的工作流围绕两个核心的云端位置展开：主仓库(`upstream`)和你的Fork(`origin`)。你的本地电脑是你执行这些流程的地方。

**1. 云端结构快照 (以`szjetfighter`用户当前状态为例)**

以下树状图是您当前云端仓库状态的**一个完整、真实的快照**。

*   **主仓库 (`upstream`)** - `whatever1111/poetry_metaverse`
    ```
    upstream
    ├── main
    ├── feature/add-project-based-management
    └── feature/maoxiaodou-universe
    ```

*   **你的Fork (`origin`)** - `szjetfighter/lu_garden_lab`
    ```
    origin
    ├── main (与 upstream/main 保持同步)
    ├── feature/add-project-based-management (从 upstream 同步而来)
    ├── feature/maoxiaodou-universe (当前工作分支, 与 upstream 同名分支保持同步)
    └── feature/zhou-spring-autumn (个人实验性分支, 未与 upstream 关联)
    ```

**2. 标准代码流程解读**

*   **初始化 (一次性):**
    1.  从 `upstream` **Fork** 到 `origin`。
    2.  从 `origin` **Clone** 到你的本地电脑。
    3.  在本地添加 `upstream` 远程源。

*   **日常开发循环:**
    1.  **同步**: 从 `upstream` 的对应分支 **Pull** 更新到你的本地分支 (例如, `git pull upstream main` 或 `git pull upstream feature/maoxiaodou-universe`)。
    2.  **编码**: 在你的本地特性分支上进行编码和提交。
    3.  **推送**: 将你的提交 **Push** 到 `origin` 的同名分支上。
    4.  **贡献 (可选)**: 当功能满足[贡献黄金准则](#3-何时发起pull-request贡献的黄金准则)时，从 `origin` 的特性分支向 `upstream` 的 `main` 分支 **发起Pull Request**。

---

## 🔍 基础概念

### 本项目核心概念
- **Repository (仓库)**: 项目的完整历史记录，分为远程和本地。
- **Commit (提交)**: 代码变更的快照，是构成项目历史的基本单元。
- **Branch (分支)**: 用于隔离开发的独立工作线，避免不同功能互相干扰。
- **Remote (远程仓库)**: 托管在服务器（如GitHub）上的代码仓库。本项目中，你将与两个远程仓库交互：
  - **`upstream`**: **项目主仓库**。这是权威的、只读的代码来源，用于同步官方更新。
  - **`origin`**: **你的Fork仓库**。这是你自己的、可自由读写的个人副本，用于暂存你的工作并创建Pull Request。
- **本地分支**: 你电脑上正在工作的分支。
- **远程跟踪分支**: 一个特殊的本地只读指针，代表远程仓库（如 `origin/main` 或 `upstream/main`）的状态。

---

## 📚 项目文档管理

### 0. 文档管理体系概述

#### 体系架构
陆家花园项目建立了完整的文档管理体系，确保项目历史可追溯、开发过程可重现：

```
documentation/
├── changelog/                    # 更新日志目录
│   ├── YYYY-MM-DD_更新内容/     # 按日期组织的更新记录
│   │   ├── TODO.md              # 原始任务清单
│   │   ├── 更新日志.md          # 技术实现文档
│   │   └── README.md            # 目录说明（可选）
│   └── README.md                # 目录结构说明
├── templates/                    # 文档模板
│   ├── TODO_TEMPLATE_ENHANCED.md  # TODO清单模板（增强版，默认）
│   ├── TODO_TEMPLATE.md           # TODO清单模板（兼容保留）
│   ├── 更新日志_TEMPLATE.md     # 更新日志模板
│   └── README.md                # 模板说明
├── ai-collaboration-guide.md    # AI协作指南
├── git-development-guide.md     # Git开发指南
└── docs-management-guide.md     # 文档管理指南
```

#### 核心原则
1. **完整性**：每个重要更新都有完整的TODO清单和更新日志
2. **可追溯性**：通过目录结构建立清晰的历史脉络
3. **标准化**：使用统一模板确保文档格式一致
4. **协作性**：支持AI和人类开发者的无缝协作

#### 工作流程
1. **创建TODO**：使用模板创建任务清单
2. **执行开发**：按阶段完成任务并更新TODO
3. **创建更新目录**：`documentation/changelog/YYYY-MM-DD_更新内容/`
4. **移动TODO**：将完成的TODO移动到更新目录
5. **创建更新日志**：记录技术实现细节
6. **提交到Git**：保持文档与代码同步

### 1. 专用文档管理分支 (docs/shared)

#### 分支作用
`docs/shared` 是项目的专用文档管理分支，作为所有共享文档的权威数据源：

**核心功能**：
- **文档权威源**：包含所有共享文档的最新版本
- **多分支同步**：为所有开发分支提供统一的文档基础
- **自动化管理**：通过同步脚本实现文档的自动更新
- **版本控制**：确保文档变更的可追溯性

**包含内容**：
```
docs/shared分支包含：
├── 当前进展.md                    # 项目整体进展文档
├── readme_forAI.md               # AI协作说明文档
├── documentation/                # 完整文档体系
│   ├── changelog/               # 更新日志目录
│   ├── templates/               # 文档模板
│   ├── ai-collaboration-guide.md
│   ├── git-development-guide.md
│   └── docs-management-guide.md
└── tools/                       # 文档管理工具
    └── sync_docs.sh            # 文档同步脚本
```

#### 文档同步机制

**同步脚本使用**：
```bash
# 从docs/shared分支拉取文档更新到当前分支
./documentation/tools/sync_docs.sh pull

# 推送当前分支的文档更新到docs/shared分支
./documentation/tools/sync_docs.sh push
```

**同步流程**：
1. **开发分支**：在功能分支上开发时，定期从 `docs/shared` 拉取文档更新
2. **文档更新**：在开发过程中更新相关文档
3. **推送更新**：将文档变更推送到 `docs/shared` 分支
4. **其他分支**：其他分支可以从 `docs/shared` 拉取最新文档

**陆家花园项目示例**：
```bash
# 在feature/zhou-spring-autumn分支上开发时
# 1. 拉取最新文档
./documentation/tools/sync_docs.sh pull

# 2. 开发过程中更新文档
# 编辑相关文档...

# 3. 推送文档更新
./documentation/tools/sync_docs.sh push
```

#### 多分支文档管理最佳实践

**开发分支文档管理**：
1. **开始开发前**：从 `docs/shared` 拉取最新文档
2. **开发过程中**：及时更新相关文档
3. **功能完成后**：推送文档更新到 `docs/shared`
4. **定期同步**：定期从 `docs/shared` 拉取其他分支的文档更新

**文档冲突处理**：
```bash
# 如果文档同步时出现冲突
git stash                    # 暂存当前更改
./documentation/tools/sync_docs.sh pull  # 拉取文档更新
git stash pop               # 恢复暂存的更改
# 手动解决冲突后提交
```

**作用**: 确保所有分支的文档保持一致性，避免文档版本混乱
**预防故障**: 防止文档在不同分支间出现版本不一致的问题

### 2. TODO清单使用指南

#### 为什么要使用TODO清单？

**1. 明确开发目标**
- 将模糊的需求转化为具体的可执行任务
- 避免开发过程中偏离原始目标
- 便于团队成员理解项目方向

**2. 提高开发效率**
- 将复杂功能分解为小任务，降低心理负担
- 提供清晰的进度追踪，增强成就感
- 避免重复工作和遗漏重要步骤

**3. 便于协作沟通**
- 团队成员可以清楚了解当前开发状态
- 便于任务分配和进度同步
- 减少沟通成本，提高协作效率

**4. 建立项目历史**
- TODO清单完成后成为项目文档的一部分
- 为后续维护和功能扩展提供参考
- 建立完整的项目演进记录

#### 什么时候使用TODO清单？

**✅ 应该使用TODO清单的情况：**

**1. 功能开发（推荐）**
```bash
# 新功能开发
- 添加诗歌编辑器功能
- 实现用户权限管理
- 创建数据导入导出功能

# 功能重构
- 重构毛小豆宇宙数据结构
- 优化诗歌展示性能
- 重新设计用户界面
```

**2. 架构调整（必须）**
```bash
# 项目结构变更
- 建立多项目架构
- 重新组织文件目录
- 调整数据库设计

# 技术栈升级
- 升级Node.js版本
- 迁移到新的框架
- 重构API接口
```

**3. 复杂问题修复（推荐）**
```bash
# 涉及多个模块的bug修复
- 修复跨模块的数据同步问题
- 解决性能瓶颈问题
- 处理复杂的用户权限问题
```

**4. 项目治理（必须）**
```bash
# 文档体系建立
- 创建开发指南
- 建立代码规范
- 完善部署文档

# 流程优化
- 建立CI/CD流程
- 优化测试流程
- 改进代码审查流程
```

**❌ 不需要TODO清单的情况：**

**1. 简单修改**
```bash
# 文本内容更新
- 修改诗歌内容
- 更新页面标题
- 调整CSS样式

# 配置调整
- 修改端口号
- 更新环境变量
- 调整日志级别
```

**2. 临时调试**
```bash
# 开发过程中的临时修改
- 添加调试日志
- 临时注释代码
- 快速测试某个功能
```

**3. 文档更新**
```bash
# 简单的文档维护
- 更新README中的联系方式
- 修正文档中的错别字
- 添加简单的注释
```

#### 判断标准

**使用TODO清单的判断标准：**

1. **任务数量**：超过3个相关任务
2. **时间跨度**：预计需要超过1天完成
3. **影响范围**：涉及多个文件或模块
4. **复杂度**：需要分阶段完成
5. **协作需求**：需要多人参与或交接

**陆家花园项目示例：**

```bash
# ✅ 需要TODO清单
- 毛小豆宇宙项目功能完善（涉及多个模块，预计3-5天）
- 项目文件结构重构（影响整个项目架构）
- 建立Git开发指南（涉及文档体系建立）

# ❌ 不需要TODO清单
- 修复单个诗歌显示问题（简单bug修复）
- 更新项目版本号（简单配置修改）
- 添加新的诗歌文件（内容更新）
```

**作用**: 避免过度文档化，确保重要变更有完整记录
**预防故障**: 防止小改动过度复杂化，大改动缺乏规划

### 3. 更新日志目录结构规范

#### 目录组织原则
每个重要更新都创建一个独立的子目录，包含该更新的完整信息：

```
documentation/changelog/
├── YYYY-MM-DD_更新内容/
│   ├── TODO.md              # 原始任务清单
│   ├── 更新日志.md          # 技术实现文档
│   └── 相关文件/            # 其他相关文档
└── README.md                # 目录结构说明
```

#### 命名规范
**目录命名**：
- 格式：`YYYY-MM-DD_更新内容`
- 示例：`2025-07-31_项目文件结构重构`
- 原则：日期优先，内容描述简洁明确

**文件命名**：
- `TODO.md`：原始任务清单
- `更新日志.md`：技术实现文档

#### 陆家花园项目示例
```bash
# 创建新的更新目录
mkdir -p "documentation/changelog/2025-01-XX_毛小豆宇宙项目功能完善"

# 移动TODO清单到更新目录
mv TODO_毛小豆宇宙项目开发.md "documentation/changelog/2025-01-XX_毛小豆宇宙项目功能完善/TODO.md"

# 完成更新后创建更新日志
touch "documentation/changelog/2025-01-XX_毛小豆宇宙项目功能完善/更新日志.md"
```

**作用**: 保持项目文档的逻辑关联性和历史追溯性
**预防故障**: 避免文档分散，确保更新信息的完整性

### 4. TODO清单与更新日志关联机制

#### TODO清单模板
**模板位置（默认）**: `documentation/templates/TODO_TEMPLATE_ENHANCED.md`

**使用方法**:
```bash
# 复制模板到项目根目录（默认使用增强版模板）
cp documentation/templates/TODO_TEMPLATE_ENHANCED.md TODO_新功能开发.md

# 编辑TODO清单
# 填写目标、任务列表、更新日志关联等信息
```

**重要说明**：TODO清单应存放在项目根目录中，便于开发过程中的实时更新和团队协作。只有在任务完成后，才将TODO清单移动到对应的changelog目录中，形成历史记录。

**模板内容（简化示例，完整字段以增强版模板为准）**:
```markdown
# [项目名称] [功能描述] TODO（增强版）

## 目标
[明确描述本次开发的目标和意义]

## 范围与约束
（按需填写，详见增强版模板）

## 任务列表
### 第一阶段：[阶段名称]
- [ ] 任务1：[具体任务描述]
- [ ] 任务2：[具体任务描述]

## 测试与验收
- 公开/管理接口契约测试、DB写测试门控、E2E清单（按需）

## 更新日志关联
- **预计更新类型**: [功能更新/架构重构/问题修复/项目治理]
- **更新目录**: `documentation/changelog/YYYY-MM-DD_[更新内容]/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**:
  - [ ] 验证点1
  - [ ] 验证点2

## 完成后的操作
- [ ] 创建更新目录并移动为 `TODO.md`
- [ ] 创建 `更新日志.md`
- [ ] 提交所有更改到Git
```

#### 陆家花园项目示例
```bash
# 开发新功能时
1. 在项目根目录创建基于模板的TODO清单
2. 明确更新日志关联信息
3. 按阶段执行任务，实时更新TODO清单
4. 完成所有任务后创建更新日志目录
5. 将TODO清单移动到changelog目录并重命名为TODO.md
6. 提交到Git
```

**作用**: 确保TODO清单和更新日志的逻辑关联
**预防故障**: 避免任务遗漏，确保文档与代码的一致性

### 5. 更新日志内容规范

#### 更新日志模板
**模板位置**: `documentation/templates/更新日志_TEMPLATE.md`

**使用方法**:
```bash
# 复制模板到对应的changelog目录
cp documentation/templates/更新日志_TEMPLATE.md "documentation/changelog/YYYY-MM-DD_更新内容/更新日志.md"

# 编辑更新日志
# 填写具体的更新内容
```

**模板内容**:
```markdown
# 陆家花园项目[更新类型]更新日志

**更新时间**: YYYY-MM-DD  
**版本**: X.X  
**更新类型**: [功能更新/架构重构/问题修复/项目治理]  
**关联TODO**: [TODO文件名或链接]

## 更新概述
[简要说明本次更新的目的和意义]

## 任务执行情况
### 已完成任务
- [x] 任务1：[具体任务描述]
- [x] 任务2：[具体任务描述]

### 技术实现
[详细描述实现方法，包括：
- 主要技术变更
- 架构调整
- 代码修改
- 配置更新]

## 功能验证
- [x] 验证点1：[验证结果]
- [x] 验证点2：[验证结果]

## 影响范围
- **功能影响**：[影响的功能模块]
- **配置变更**：[需要注意的配置变更]
- **部署要求**：[部署相关的注意事项]

## 后续计划
[说明后续开发计划，包括：
- 待完成的功能
- 优化方向
- 长期规划]

## 总结
[总结本次更新的价值和影响]
```

#### 陆家花园项目示例
```markdown
# 陆家花园项目架构重构更新日志

**更新时间**: 2025-07-31  
**版本**: 2.0  
**更新类型**: 架构重构  
**关联TODO**: TODO_周与春秋练习项目重构.md

## 更新概述
将《周与春秋练习》项目相关文件移动到独立文件夹，为多项目架构做准备。

## 任务执行情况
### 已完成任务
- [x] 备份当前项目状态
- [x] 创建新的目录结构
- [x] 移动所有相关文件
- [x] 修改代码配置
- [x] 测试所有功能

## 技术实现
- 创建 `poeject_zhou_spring_autumn/` 目录
- 移动 data/、poems/ 等文件夹
- 修改 server.js 中的路径配置
- 更新 .gitignore 文件

## 功能验证
- [x] 所有API功能正常
- [x] 前端页面正常显示
- [x] 数据文件完整性验证
- [x] 部署测试通过
```

**作用**: 提供完整的变更记录，便于团队理解和维护
**预防故障**: 避免更新信息不清晰，确保变更可追溯

### 6. 文档管理最佳实践

#### 项目模板使用指南
本项目提供了标准化的文档模板，确保所有文档的一致性和专业性：

**TODO清单模板（默认）**：`documentation/templates/TODO_TEMPLATE_ENHANCED.md`
（兼容保留）`documentation/templates/TODO_TEMPLATE.md`
- 用于创建新的开发任务清单
- 包含AI协作指南引用和完整的任务结构
- 确保所有TODO文件遵循统一格式

**更新日志模板**：`documentation/templates/更新日志_TEMPLATE.md`
- 用于记录项目更新和技术实现
- 包含完整的验证点和影响范围记录
- 确保更新日志的完整性和可追溯性

**使用建议**：
1. 创建新TODO时，复制 `TODO_TEMPLATE_ENHANCED.md` 并重命名
2. 记录更新时，复制 `更新日志_TEMPLATE.md` 并填写具体内容
3. 保持模板的简洁性，避免过度定制
4. 定期审查模板，确保其与项目发展同步

**作用**: 确保项目文档的一致性和专业性
**预防故障**: 避免文档格式混乱，提高团队协作效率

### 7. AI协作
本项目大量使用AI辅助开发，所有协作者（无论是人类还是AI）均需遵守在 [AI协作指南](./ai-collaboration-guide.md) 中定义的协议。

#### 创建新更新流程
1. **创建TODO清单**：使用标准模板
2. **明确关联信息**：指定更新目录和日志文件
3. **执行开发任务**：按阶段完成任务
4. **创建更新目录**：`documentation/changelog/YYYY-MM-DD_[更新内容]/`
5. **移动TODO清单**：重命名为 `TODO.md`
6. **创建更新日志**：使用标准模板
7. **可选README**：添加目录说明
8. **提交到Git**：保持文档与代码同步

#### 查找历史更新流程
1. **按日期查找**：在 `documentation/changelog/` 目录下查找对应日期
2. **查看TODO.md**：了解任务执行过程
3. **查看更新日志.md**：了解技术实现细节

#### 陆家花园项目特殊注意事项
- **多项目架构**：注意不同项目间的文档关联
- **诗歌数据**：大文件更新需要特别注意文档记录
- **分支管理**：文档更新应与代码分支同步
- **团队协作**：确保所有团队成员了解文档规范

**作用**: 建立标准化的文档管理流程
**预防故障**: 避免文档管理混乱，确保项目历史可追溯

---

## 🌿 分支管理

### 1. 项目分支体系

#### 分支架构概述
陆家花园项目采用多分支开发模式，每个分支都有明确的职责：

```
项目分支体系：
├── main                           # 主分支，包含稳定的项目代码
├── docs/shared                    # 专用文档管理分支（权威文档源）
├── feature/add-project-based-management  # 项目管理功能分支
├── feature/maoxiaodou-universe    # 毛小豆宇宙项目分支
└── feature/zhou-spring-autumn     # 周春秋项目分支
```

#### 分支职责分工

**main分支**：
- **作用**：项目的主干分支，包含稳定可用的代码
- **更新方式**：通过Pull Request合并功能分支
- **特点**：只包含经过测试和审查的代码

**docs/shared分支**：
- **作用**：专用文档管理分支，作为所有共享文档的权威数据源
- **包含内容**：项目进展文档、开发指南、模板等共享文档
- **同步机制**：通过 `sync_docs.sh` 脚本实现多分支文档同步
- **特点**：不包含项目代码，只包含文档和工具

**feature分支**：
- **作用**：功能开发分支，用于开发特定功能或项目
- **命名规范**：`feature/功能描述`
- **生命周期**：开发完成后合并到main分支并删除
- **特点**：可以包含代码和文档，但文档应与docs/shared保持同步

#### 查看所有分支（本地+远程）
```bash
git branch -a
```
**陆家花园项目示例**:
```bash
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/add-project-based-management
  remotes/origin/feature/maoxiaodou-universe
  remotes/origin/main
```
**作用**: 全面了解项目所有分支，避免在错误分支上工作
**预防故障**: 防止意外在远程分支上直接修改，确保选择正确的开发分支

#### 查看本地分支
```bash
git branch
```
**陆家花园项目示例**:
```bash
$ git branch
* main
  feature/add-project-based-management
  feature/maoxiaodou-universe
```
**作用**: 快速查看本地分支，确认当前工作分支
**预防故障**: 避免在错误分支上开发，确保在正确的功能分支上工作

#### 查看远程分支
```bash
git branch -r
```
**陆家花园项目示例**:
```bash
$ git branch -r
  origin/HEAD -> origin/main
  origin/feature/add-project-based-management
  origin/feature/maoxiaodou-universe
  origin/main
```
**作用**: 了解远程仓库的分支结构，便于协作
**预防故障**: 避免创建重复的远程分支，确保分支命名规范

#### 查看分支详细信息（推荐）
```bash
git branch -vv
```
**陆家花园项目示例**:
```bash
$ git branch -vv
* feature/maoxiaodou-universe 313bb2b [origin/feature/maoxiaodou-universe] refactor: 项目文件结构重构
  feature/add-project-based-management 7befe78 [origin/feature/add-project-based-management] feat: 数据治理优化
  main                                 eef346e [origin/main] version 0.2
```
**作用**: 查看分支跟踪关系，确保本地分支正确跟踪远程分支
**预防故障**: 避免推送失败，确保分支同步，防止在错误分支上工作

### 2. 切换分支

#### 切换到已存在的本地分支
```bash
git checkout 分支名
# 或使用现代命令
git switch 分支名
```
**陆家花园项目示例**:
```bash
# 切换到主分支
git checkout main

# 切换到毛小豆宇宙分支
git checkout feature/maoxiaodou-universe
```
**作用**: 在不同功能分支间切换，保持工作环境整洁
**预防故障**: 避免在错误分支上开发，确保功能隔离

#### 创建并切换到新分支（基于当前分支）
```bash
git checkout -b 新分支名
# 或使用现代命令
git switch -c 新分支名
```
**陆家花园项目示例**:
```bash
# 基于当前分支创建新功能分支
git checkout -b feature/new-poetry-feature
```
**作用**: 为每个新功能创建独立分支，便于管理和回滚
**预防故障**: 避免功能间相互影响，确保代码隔离

#### 创建并切换到新分支（基于远程分支）
```bash
git checkout -b 本地分支名 origin/远程分支名
# 或使用现代命令
git switch -c 本地分支名 origin/远程分支名
```
**陆家花园项目示例**:
```bash
# 创建本地分支并跟踪远程分支
git checkout -b feature/maoxiaodou-universe origin/feature/maoxiaodou-universe
```
**作用**: 正确设置分支跟踪关系，便于后续推送和拉取
**预防故障**: 避免推送失败，确保分支同步，防止代码丢失

### 3. 删除分支

#### 删除本地分支
```bash
git branch -d 分支名  # 安全删除（如果分支未合并会报错）
git branch -D 分支名  # 强制删除
```
**陆家花园项目示例**:
```bash
# 删除测试分支
git branch -d test-branch
```
**作用**: 清理不需要的分支，保持仓库整洁
**预防故障**: 避免删除重要分支，确保代码安全

#### 删除远程分支
```bash
git push origin --delete 分支名
```
**陆家花园项目示例**:
```bash
# 删除远程测试分支
git push origin --delete feature/test-branch
```
**作用**: 清理远程仓库，保持分支结构清晰
**预防故障**: 避免删除主分支，确保团队协作不受影响

---

## 💻 日常开发流程
本章节描述一个完整的、从开始到结束的单功能开发周期。

### 1. 开始新任务：同步与创建分支

#### 第1步：同步主仓库 (Upstream)
在开始任何新工作前，首先要确保你的本地 `main` 分支与主仓库 `upstream` 完全同步。
```bash
# 1. 切换到本地main分支
git switch main

# 2. 从主仓库upstream拉取最新更新
git pull upstream main
```
**作用**: 确保你的新功能分支是基于最新、最干净的代码创建的。
**预防故障**: 避免基于过时的代码开发，从而在未来引发大量不必要的合并冲突。

#### 第2步：创建功能分支
从你刚刚同步过的 `main` 分支上，创建一个用于开发新功能或修复问题的独立分支。
```bash
# 分支名应简明扼要地描述其功能
git switch -c feature/你的功能描述
```
**陆家花园项目示例**:
```bash
# 为“毛小豆宇宙前端开发”创建一个功能分支
git switch -c feature/maoxiaodou-frontend-dev
```
**作用**: 将你的工作与主干隔离，确保开发过程的安全和独立。
**预防故障**: 避免直接在 `main` 分支上开发，这是Git工作流中最核心的禁忌之一。

#### 第3步：同步文档（重要）
在开始开发前，确保你的功能分支包含最新的共享文档：
```bash
# 从docs/shared分支拉取最新文档
./documentation/tools/sync_docs.sh pull
```
**陆家花园项目示例**:
```bash
# 确保功能分支包含最新的开发指南和文档模板
./documentation/tools/sync_docs.sh pull
```
**作用**: 确保开发过程中使用的文档是最新版本，避免文档版本不一致。
**预防故障**: 防止使用过时的文档模板或指南，确保开发规范的一致性。

### 2. 开发中：提交与推送

#### 第1步：编码与暂存
进行代码编写。完成一个小的、逻辑完整的改动后，将其添加到暂存区。
```bash
# 查看工作区状态
git status

# 添加指定文件到暂存区
git add path/to/your/file.js

# 或者添加所有更改
git add .
```

#### 第2步：提交到本地仓库
将暂存区的改动提交到你的**本地仓库**，并编写一条符合规范的提交信息。
```bash
# 遵循 “类型: 简短描述” 的格式
git commit -m "feat: 添加角色关系网络图基础组件"
```
**作用**: 在本地保存你的工作快照，形成清晰的开发历史。
**预防故障**: 鼓励进行原子化的、小步的提交，而不是将大量无关的改动混在一个巨大的提交里。

#### 第3步：推送到个人仓库 (Origin)
定期将你的本地分支推送到你自己的Fork仓库 `origin`。
```bash
# 第一次推送时，设置上游跟踪关系
git push -u origin feature/你的功能描述

# 后续推送
git push
```
**作用**: 备份你的本地工作到云端，并为后续创建Pull Request做准备。
**预防故障**: 防止因本地电脑故障导致的工作丢失。

#### 第4步：更新文档（如需要）
如果开发过程中涉及文档的更新，应及时推送到 `docs/shared` 分支：
```bash
# 推送文档更新到docs/shared分支
./documentation/tools/sync_docs.sh push
```
**陆家花园项目示例**:
```bash
# 更新了开发指南或项目文档后
./documentation/tools/sync_docs.sh push
```
**作用**: 确保其他分支能够及时获取到最新的文档更新。
**预防故障**: 防止文档更新滞后，确保团队协作的文档一致性。

### 3. 完成任务：准备Pull Request

在你的功能开发完毕，准备发起Pull Request之前，需要再做一次与主仓库的同步，以解决可能存在的冲突。

#### 第1步：再次同步主仓库
```bash
# 1. 从主仓库获取最新数据，但暂时不合并
git fetch upstream

# 2. 将主仓库的main分支上的更新，变基(rebase)到你当前的功能分支上
git rebase upstream/main
```
**说明**: 使用 `rebase` 可以让你的提交历史保持一条直线，更清晰。如果遇到大量冲突，也可以使用 `git merge upstream/main`。
**作用**: 在本地解决与主干的全部冲突。
**预防故障**: 确保你提交的Pull Request是“干净”的，可以被维护者一键合并，极大地提高协作效率。

#### 第2步：强制推送到个人仓库 (如有必要)
因为 `rebase` 会改写提交历史，如果你之前已经 `push` 过，需要使用 `--force-with-lease` 标志来强制更新你的远程分支。
```bash
# 确保你的远程分支与变基后的本地分支一致
git push --force-with-lease origin feature/你的功能描述
```
**安全说明**: `--force-with-lease` 是比 `--force` 更安全的选择，它能防止你覆盖掉别人在你这个分支上的提交（虽然在个人分支上这种情况很少见）。

---

## 🤝 协作开发：通过Pull Request贡献代码
在Forking工作流中，**Pull Request (PR)** 是将你的代码贡献回主项目 `upstream` 的唯一方式。

### 1. 创建Pull Request
1.  **确保你的分支已推送到`origin`**：在 `日常开发流程` 的最后一步，你已经将本地分支推送到你自己的Fork仓库 `origin`。
2.  **访问GitHub**：打开你在GitHub上的Fork仓库页面 (`https://github.com/[你的用户名]/poetry_metaverse`)。
3.  **发起PR**：GitHub通常会自动检测到你新推送的分支，并显示一个绿色的 "Compare & pull request" 按钮。点击它。
4.  **填写PR信息**:
    - **Base repository**: 确保是 `whatever1111/poetry_metaverse`。
    - **Base branch**: 确保是 `main`。
    - **Head repository**: 确保是你自己的Fork仓库。
    - **Compare branch**: 确保是你刚刚完成开发的功能分支。
    - **标题和描述**: 清晰地描述这个PR解决了什么问题，完成了什么功能。
5.  **创建PR**：点击 "Create pull request" 按钮。

**作用**: 正式向主项目提出代码合并请求。
**预防故障**: 确保PR的目标分支和源分支都正确无误，避免将代码提交到错误的地方。

### 2. 代码审查 (Code Review)
- PR创建后，项目维护者或其他协作者会对你的代码进行审查。
- 他们可能会提出修改意见。你只需要在本地的功能分支上继续修改、提交，并 `git push` 到 `origin`，PR中的内容就会自动更新。

**作用**: 保证进入主仓库的代码质量，是项目健康发展的关键环节。

### 3. 何时发起Pull Request：贡献的黄金准则
对主仓库 `upstream` 的每一次Pull Request都应是经过深思熟虑的、有价值的贡献。请严格遵循以下准则：

**✅ 必须发起PR的情况 (Must Have):**
- **完整的、通过测试的功能单元**：你所开发的新功能已经全部完成，并通过了必要的本地测试，可以独立运作。
- **关键性的Bug修复**：修复了一个影响主干分支稳定性的重要缺陷。
- **项目级的架构调整或重构**：对项目结构、技术栈或核心依赖进行了重大的、有计划的调整。

**👍 推荐发起PR的情况 (Good to Have):**
- **一个阶段性的重要里程碑**：对于一个非常庞大的功能，可以将其拆分为几个独立的、可交付的里程碑，并为每个里程碑发起PR。
- **重要的文档更新**：例如，对开发指南、部署文档等核心文档进行了系统的修订或补充。

**❌ 禁止发起PR的情况 (Don't Do It):**
- **未完成的工作 (WIP)**：代码仍在开发中，功能不完整，或者有临时的调试代码。
- **微小的、无实质意义的修改**：例如，修正一个拼写错误、调整一个样式颜色等。这类修改应累积在下一个有意义的功能PR中。
- **未经本地测试的代码**：所有代码在发起PR前都必须在本地完整运行和测试。
- **破坏主干构建的代码**：提交的代码导致了主项目无法正常构建或运行。
- **纯粹的个人实验**：与主项目目标无关的个人探索性代码，应保留在自己的Fork中。

### 4. 合并与清理

#### 第1步：合并PR
一旦你的PR通过审查，项目维护者会将其合并到 `upstream` 的 `main` 分支。

#### 第2步：合并后的清理工作 (非常重要)
在你的PR被合并后，为了保持仓库的整洁，你需要做两项清理工作：

**A. 更新本地 `main` 分支**
你的本地 `main` 分支现在已经落后于 `upstream` 了，需要再次同步。
```bash
# 切换到main分支
git switch main

# 从主仓库拉取最新代码（现在它包含了你刚才的贡献）
git pull upstream main
```

**B. 删除已合并的功能分支**
你的功能分支已经完成了历史使命，应该被删除。
```bash
# 1. 删除本地的功能分支
git branch -d feature/你的功能描述

# 2. 删除远程origin上的功能分支
git push origin --delete feature/你的功能描述
```
**作用**: 保持本地和远程仓库的干净、整洁，避免废弃分支的堆积。
**预防故障**: 及时删除已合并的分支，可以防止未来不小心在旧分支上继续工作。

---

## 🔧 故障排除

### 1. 常见问题

#### 推送失败（没有上游分支）
```bash
git push --set-upstream origin 分支名
# 或简写
git push -u origin 分支名
```
**陆家花园项目示例**:
```bash
# 第一次推送新分支时，需要设置上游跟踪关系
git push -u origin feature/你的新功能
```
**作用**: 设置分支跟踪关系，便于后续推送
**预防故障**: 避免推送失败，确保分支同步

#### 拉取冲突
```bash
git stash              # 暂存当前更改
git pull              # 拉取更新
git stash pop         # 恢复暂存的更改
```
**作用**: 安全地拉取更新，避免丢失本地更改
**预防故障**: 避免代码丢失，确保工作进度不丢失

#### 撤销最后一次提交
```bash
git reset --soft HEAD~1  # 保留更改，撤销提交
git reset --hard HEAD~1  # 完全撤销提交和更改
```
**作用**: 修正错误的提交，保持提交历史整洁
**预防故障**: 避免错误的提交记录，确保代码安全

### 2. 查看历史

#### 查看提交历史
```bash
git log --oneline                    # 简洁显示
git log --oneline --graph --all      # 图形化显示所有分支
```
**陆家花园项目示例**:
```bash
# 该命令会展示所有分支的提交历史，并用线条清晰地表示出它们的分叉与合并关系。
$ git log --oneline --graph --all
*   eef346e (HEAD -> main, origin/main) feat: add user authentication
|\  
| * 7befe78 (origin/feature/new-poem-editor) feat: implement new poem editor
| | 
| * d4d804e feat: add draft saving
|/  
* 313bb2b refactor: restructure project files
```
**作用**: 了解项目历史，便于调试和回滚
**预防故障**: 避免重复开发，确保代码追踪

#### 查看分支差异
```bash
git diff 分支1..分支2
```
**陆家花园项目示例**:
```bash
# 查看某个功能分支与主分支的差异
git diff main..feature/你的功能分支

# 查看两个功能分支之间的差异
git diff feature/功能分支A..feature/功能分支B
```
**作用**: 了解分支间的差异，便于合并决策
**预防故障**: 避免错误的合并，确保代码质量

---

## 📚 最佳实践

### 1. 分支命名规范
- `main` - 主分支
- `feature/功能名` - 功能分支
- `hotfix/问题描述` - 紧急修复分支
- `release/版本号` - 发布分支

### 2. 提交信息规范
- `feat:` - 新功能
- `fix:` - 修复bug
- `refactor:` - 重构代码
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `test:` - 测试相关

#### 详细提交信息规范（推荐）

**基本格式**：
```bash
git commit -m "类型: 简短描述" -m "详细说明"
```

**陆家花园项目示例**：
```bash
# 简单提交（适用于小改动）
git commit -m "fix: 修复诗歌显示格式问题"

# 详细提交（适用于重要功能）
git commit -m "feat: 添加诗歌编辑器增强功能" -m "
- 新增诗歌格式自动检测功能
- 实现实时预览编辑效果
- 添加多种诗歌模板选择
- 优化编辑器响应速度
- 修复已知的格式兼容性问题"
```

**详细提交信息模板**：
```bash
git commit -m "类型: 简短描述" -m "
详细变更说明：

- 变更1：具体做了什么
- 变更2：具体做了什么
- 变更3：具体做了什么

影响范围：
- 影响的功能模块
- 需要注意的配置变更
- 测试建议"
```

**陆家花园项目实际示例**：
```bash
git commit -m "refactor: 项目文件结构重构 - 建立多项目架构、统一命名规范及更新日志规则定义" -m "
- 建立多项目架构，将周与春秋练习项目移动到 poeject_zhou_spring_autumn/ 目录
- 将毛小豆宇宙项目重命名为 poeject_maoxiaodou_universe/ 并规范化结构
- 更新 server.js 中的文件路径配置，支持新的项目目录结构
- 建立统一的 poeject_ 前缀命名规范，提升项目专业性
- 创建 documentation/changelog/ 目录，建立规范的更新日志管理
- 建立更新日志规则定义，规范项目文档管理
- 将旧文档移动到 archive/ 目录进行归档管理"
```

**作用**: 提供完整的变更记录，便于团队理解和维护
**预防故障**: 避免提交信息不清晰，确保变更可追溯

### 3. 提交历史管理（重要）

#### 何时合并提交，何时保持分离

**应该合并提交的情况**：
```bash
# 1. 同一个功能的多个开发步骤
git commit -m "WIP: 创建Git开发指南基础结构"
git commit -m "WIP: 添加分支管理章节"
git commit -m "WIP: 优化文档格式"
# 功能完成后合并为一个提交
git reset --soft HEAD~3
git commit -m "docs: 创建陆家花园项目Git开发指南文档"
```

**应该保持分离的情况**：
```bash
# 1. 不同功能的提交
git commit -m "feat: 添加诗歌编辑器功能"
git commit -m "fix: 修复用户登录问题"
git commit -m "docs: 更新API文档"

# 2. 不同模块的修改
git commit -m "feat: 前端添加诗歌展示组件"
git commit -m "feat: 后端添加诗歌数据API"
git commit -m "test: 添加诗歌功能单元测试"

# 3. 不同时间的重要里程碑
git commit -m "feat: 完成毛小豆宇宙基础架构"
git commit -m "feat: 实现诗歌数据导入功能"
git commit -m "feat: 添加用户交互界面"
```

**陆家花园项目示例**：
```bash
# ✅ 应该合并：同一个功能的多个步骤
git commit -m "WIP: 创建Git开发指南文档"
git commit -m "WIP: 添加分支管理章节"
git commit -m "WIP: 添加提交历史管理规范"
# 合并为：
git commit -m "docs: 创建陆家花园项目Git开发指南文档"

# ✅ 应该分离：不同功能模块
git commit -m "feat: 添加诗歌编辑器功能"
git commit -m "feat: 实现用户权限管理"
git commit -m "docs: 更新部署文档"
```

**判断原则**：
- **合并原则**：同一个功能、同一个模块、同一个开发阶段
- **分离原则**：不同功能、不同模块、不同时间的重要里程碑

**作用**: 保持提交历史的逻辑清晰，便于理解和维护
**预防故障**: 避免功能混乱，确保每个提交都有明确的目的

#### 保持干净的提交历史
```bash
# 开发过程中频繁提交，保存工作进度
git commit -m "WIP: 正在开发诗歌编辑器功能"

# 功能完成后，合并相关提交
git reset --soft HEAD~3  # 撤销最近3个提交，保留更改
git commit -m "feat: 添加诗歌编辑器完整功能"
```

**陆家花园项目示例**:
```bash
# 开发过程中的提交
git commit -m "WIP: 创建Git开发指南基础结构"
git commit -m "WIP: 添加分支管理章节"
git commit -m "WIP: 优化文档格式"

# 功能完成后合并
git reset --soft HEAD~3
git commit -m "docs: 创建陆家花园项目Git开发指南文档" -m "
- 创建完整的Git开发指南文档
- 添加分支管理、日常开发流程等章节
- 包含最佳实践和故障预防说明"
```

**作用**: 保持项目演进历史清晰，便于追溯和维护
**预防故障**: 避免提交历史混乱，确保每个提交都有明确的意义

#### 合并提交的方法

**方法1：使用 `git reset --soft`（推荐用于简单情况）**
```bash
# 撤销最近N个提交，但保留更改
git reset --soft HEAD~N

# 重新提交为一个有意义的提交
git commit -m "feat: 完整功能描述"
```

**方法2：使用 `git rebase -i`（推荐用于复杂情况）**
```bash
# 交互式rebase，可以编辑、合并、删除提交
git rebase -i HEAD~3

# 在编辑器中：
# pick 第一个提交
# squash 第二个提交（合并到第一个）
# squash 第三个提交（合并到第一个）
```

**陆家花园项目示例**:
```bash
# 查看最近的提交
git log --oneline -5
# 输出：
# af34fc0 docs: 创建陆家花园项目Git开发指南文档
# 313bb2b refactor: 项目文件结构重构
# d4d804e feat: 将毛小豆宇宙纳入版本控制

# 合并提交
git reset --soft HEAD~2
git commit -m "docs: 创建陆家花园项目Git开发指南文档"
```

### 4. 开发流程建议
1. **开发阶段**：频繁提交，保存工作进度
2. **功能完成**：合并相关提交，保持历史清晰
3. **合并前**：确保提交历史整洁，便于代码审查
4. **主分支**：只包含有意义的完整功能提交
5. **及时删除**：删除已合并的分支

### 5. 陆家花园项目特殊注意事项
- 毛小豆宇宙分支基于项目管理分支，注意继承关系
- 诗歌数据文件较大，注意提交效率
- 多项目架构，注意分支间的依赖关系
- **提交历史管理**：每个功能分支合并到主分支时，应该只包含一个（或少数几个）逻辑清晰的提交
- **文档同步管理**：定期从 `docs/shared` 分支同步文档，确保所有分支使用统一的文档版本
- **文档更新流程**：涉及文档变更时，应及时推送到 `docs/shared` 分支，保持文档的权威性 

 