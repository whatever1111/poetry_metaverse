# 陆家花园项目 第一阶段：数据整合与数据库化 TODO

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
执行一次彻底的架构重构，建立一个清晰、专业、可扩展的项目结构。创建一个统一的 `lugarden_universal` 目录来承载所有与应用服务相关的部分（后端逻辑、前端静态文件、启动脚本等）。在此基础上，为新的后端服务配置数据库环境，为后续的数据整合奠定坚实的基础。

## 任务列表

### **子阶段 0：架构重构与环境准备**
> **目标**: 建立一个符合“关注点分离”原则和项目长远规划的目录结构，彻底解决因项目演进而导致的结构混乱问题。

 - [x] **任务 0-1**: 在项目根目录创建 `lugarden_universal` 文件夹，作为未来统一的元宇宙网站公共组件存放地。
 - [x] **任务 0-2**: 在新的 上述 文件夹内，创建 `application` 和 `public` 以及`launch`三个子文件夹。
 - [x] **任务 0-3**: 将 `poeject_zhou_spring_autumn/application/` 内的所有文件和文件夹，迁移到 `lugarden_universal/application/` 目录。
 - [x] **任务 0-4**: 将 `poeject_zhou_spring_autumn/public/` 内的所有文件和文件夹，迁移到 `lugarden_universal/public/` 目录。
 - [x] **任务 0-5**: 更新`poeject_zhou_spring_autumn` 目录下的启动脚本（如 `start.bat`, `stop.bat`），使其正确指向 `lugarden_universal/application/` 目录，并移动到`lugarden_universal/launch/`目录
 - [x] **任务 0-6**: 清理 `poeject_zhou_spring_autumn` 目录中遗留的、现已为空的 `application` 和 `public` 文件夹。
  - [x] **任务 0-7**: 子阶段0收尾：提交并推送目录重构与启动脚本迁移（不包含 Prisma 初始化，保持提交历史干净）。

### **子阶段 A：数据库设计与数据建模**
- [x] **任务 A-1**：分析两个子项目的数据结构和关系
 - **分析结论**:
    - **毛小豆宇宙**: 是一个高度结构化、关系密集的实体-关系网络，核心实体包括诗歌、角色、场景、主题和理论，通过ID引用建立复杂关联。其体验模式是**探索式、分析式**的。
    - **周与春秋**: 是一个以交互为导向、高度抽象的功能驱动模型，核心是通过“问题-编码-映射”的线性流程，为用户提供引导式的、个性化的诗歌阅读体验。
    - **整合策略**: 必须设计一个能同时包容两种模式的统一数据库，既能存储“毛小豆宇宙”的网状实体数据，也要能支持“周与春秋”的线性互动逻辑。
 - [x] **任务 A-2**：设计统一的数据库表结构，体现"陆家花园主宇宙"概念
  - **✅ 完成状态**: 已在A-5阶段实质性完成。最终的`schema.md`设计完全实现了"陆家花园主宇宙"关联模型，包含主宇宙中立实体、桥表机制和16张子宇宙表的完整架构。
  - **🔍 独立审计意见**: 设计质量优秀，从原有的"无法支撑主宇宙关联模型"状态升级为具备跨宇宙数据融合能力的完整架构，完全满足任务要求。
- [x] **任务 A-3**：建立数据关联关系（诗歌-角色-场景-主题的关联）
  - **✅ 完成状态**: 已通过A-5阶段的Schema设计实质性完成。所有必要的关联关系已在数据库表结构中建立。
  - **🔍 独立审计判断依据**:
    - **诗歌↔主题关联**: 通过`ZhouPoem.coreTheme`字段 + `Theme`表 + `UniverseTheme`桥表实现跨宇宙主题关联
    - **诗歌↔角色关联**: 通过`MaoxiaodouPoem`和`MaoxiaodouCharacter`表，以及`MaoxiaodouScene`表建立诗歌-角色-场景三元关联
    - **角色关系网络**: 通过`MaoxiaodouCharacterRelation`表（sourceCharacterId/targetCharacterId）建立角色间关系图谱
    - **跨宇宙映射**: 通过`ZhouMapping.poemTitle`与诗歌标题的映射关系，建立问答系统与诗歌内容的关联
    - **原始数据验证**: 核实了`themes.json`中的`related_characters`/`related_poems`字段、`characters.json`中的关系数据，确认Schema设计完整覆盖现有关联关系
    - **审计结论**: 关联关系设计系统性、完整性良好，无需独立执行A-3步骤。
- [x] **任务 A-4**: **审查并增强数据库 Schema**。根据任务 B-2 中确立的"主宇宙"关联模型，重新审查 `schema.md` 中的设计。**核心是斩断核心概念（如`Themes`）与具体子宇宙的直接绑定**，使其成为真正中立的、可共享的"主宇宙"实体。
  - **✅ 完成状态**: 已完成架构审查和schema定稿
    - ✅ 设计了主宇宙中立实体：Theme、Emotion
    - ✅ 建立了桥表机制：UniverseTheme、UniverseEmotion  
    - ✅ 完成了16张子宇宙表的详细设计
    - ✅ 整合了ZhouPoem表（原型+文本）
    - ✅ 定义了完整的Prisma Schema
    - ✅ 更新了正式的 `schema.md` 文档
    - ✅ 保存了审查历史到 `archive_a5_review/` 文件夹
  - **🔍 独立审计意见 - A-4完成质量评估**:
    - **📋 审计依据**:
      - **架构设计完整性**: 检查了`schema.md`(577行)、`schema_draft.md`(578行)和审查历史文档，确认设计覆盖了两个子宇宙的全部数据结构
      - **中立实体验证**: 验证了Theme、Emotion表的设计确实摆脱了子宇宙绑定，通过桥表实现灵活关联
      - **数据对应性检查**: 核实了Schema与实际JSON数据的对应关系（毛小豆6个主题、周春秋48首诗歌、问答系统等）
      - **Prisma代码质量**: 审查了完整的Prisma模型定义，包含外键约束、唯一键设置和关系定义
    - **🎯 质量评级**: **优秀（A级）**
      - **设计理念突破**: 成功实现了从"子宇宙内聚"向"主宇宙中立+桥接"的范式转移
      - **技术实现完备**: 16张子宇宙表设计覆盖全面，关系设计合理，约束完整
      - **可扩展性良好**: 桥表机制为未来新宇宙接入提供了标准化路径
      - **文档质量高**: 提供了完整的设计文档、审查历史和实施指南
    - **✅ 审计结论**: A-4任务完成质量优秀，完全达到既定要求，具备直接推进到A-5阶段的条件。
- [ ] **任务 A-5**：安装与配置 SQLite + Prisma 环境（工具准备）
  - **🎯 任务定位**: 工欲善其事必先利其器 - 纯粹的开发环境配置，不涉及具体业务开发
  - **🔍 现状检查**: 为确保环境完整性，从零开始重新配置所有Prisma相关环境
  
  ### **第一部分：基础工具环境配置** ✅
  - **🔄 从零开始方针**: 为确保环境配置的完整性和可重现性，所有配置步骤重新执行
  - 步骤：
    - [x] **A5.1.1** 在 `lugarden_universal/application/` 安装依赖：`prisma`（dev）与 `@prisma/client`
    - [x] **A5.1.2** 在 `package.json` 添加脚本：`db:generate`/`db:migrate`/`db:studio`/`db:reset`
    - [x] **A5.1.3** 创建 `lugarden_universal/application/data/` 目录用于 SQLite 文件
    - [x] **A5.1.4** 配置环境变量：确保 `.env.local` 中有 `DATABASE_URL="file:./data/lugarden.db"`（本地开发配置）
    - [x] **A5.1.5** 在`lugarden_universal/application/`目录运行 `prisma init --datasource-provider sqlite` 生成 `prisma/` 目录
    - [x] **A5.1.6** 将生成的`schema.prisma`重命名为`test-schema.prisma`并配置测试表（包含TestConnection表验证环境可用性）
    - [x] **A5.1.7** 配置临时的package.json脚本支持test-schema：
      - 备份原始脚本配置
      - 修改脚本：`"db:generate": "prisma generate --schema=prisma/test-schema.prisma"`等
    - [x] **A5.1.8** 运行 `npx prisma migrate dev --name setup-environment --schema=prisma/test-schema.prisma` 验证迁移流程
    - [x] **A5.1.9** 清理环境配置冲突：
      - 检查.env和.env.local中的重复配置
      - 保留.env.local中的本地配置，移除.env中的重复非必要项
      - 确保.env.local中的DATABASE_URL优先生效
  - 基础环境验证条件：✅
    - [x] `npx prisma generate --schema=prisma/test-schema.prisma` 成功
    - [x] `npx prisma migrate status --schema=prisma/test-schema.prisma` 显示环境配置迁移已应用
    - [x] 数据库文件 `lugarden_universal/application/data/lugarden.db` 存在且可连接
    - [x] `npx prisma studio --schema=prisma/test-schema.prisma` 能正常启动并显示测试表
    - [x] Prisma Client可以正常导入和使用

  ### **第二部分：业务Schema准备（为B阶段铺路）**
  - **📊 陆家花园业务表结构明细（21张表构成说明）**:
    - **🌟 主宇宙核心架构 (5张)**
      - Theme - 主题表 (中立实体)
      - Emotion - 情感表 (中立实体)  
      - Universe - 宇宙表 (子宇宙管理)
      - UniverseTheme - 宇宙-主题桥接表
      - UniverseEmotion - 宇宙-情感桥接表
    - **📚 周与春秋宇宙 (5张)**
      - ZhouProject - 项目表
      - ZhouSubProject - 子项目表
      - ZhouQA - 问答表
      - ZhouMapping - 结果映射表
      - ZhouPoem - 诗歌表
    - **🎭 毛小豆宇宙 (11张)**
      - MaoxiaodouPoem - 诗歌表
      - MaoxiaodouCharacter - 角色表
      - MaoxiaodouCharacterRelation - 角色关系表
      - MaoxiaodouScene - 场景表
      - MaoxiaodouTerminology - 术语表
      - MaoxiaodouTheme - 主题表 (子宇宙级别)
      - MaoxiaodouTimeline - 时间线表
      - MaoxiaodouTheory - 理论框架表
      - MaoxiaodouReadingLayer - 阅读层次表
      - MaoxiaodouMapping - 映射关系表
      - MaoxiaodouMetadata - 元数据表
  - 业务Schema准备步骤：
    - [ ] **A5.2.1** 将A-4完成的`schema.md`中的完整Prisma模型定义保存到 `prisma/lugarden-schema.prisma`
    - [ ] **A5.2.2** 验证业务Schema语法正确性（`npx prisma validate --schema=prisma/lugarden-schema.prisma`）
    - [ ] **A5.2.3** 执行配置切换：
      - 删除`test-schema.prisma`
      - 将`lugarden-schema.prisma`重命名为`schema.prisma`
      - 恢复package.json脚本为标准配置（从A5.1.7备份中恢复）
    - [ ] **A5.2.4** 重置数据库环境：
      - 删除现有数据库文件：`rm lugarden_universal/data/lugarden.db`
      - 基于新schema重新初始化：`npx prisma migrate dev --name init`
    - [ ] **A5.2.5** 重新生成Prisma Client：运行`npx prisma generate`确保类型定义与新schema匹配
  - 业务Schema验证条件：
    - [ ] 存在完整的 `prisma/schema.prisma`（从lugarden-schema.prisma重命名而来，包含所有21张表定义）
    - [ ] 业务Schema通过Prisma语法验证
    - [ ] 测试用的`test-schema.prisma`已清理删除
    - [ ] package.json脚本已恢复为标准配置（无需--schema参数）
    - [ ] 数据库环境已重置，与新schema完全匹配（无旧表结构残留）
    - [ ] Prisma Client已重新生成，类型定义与schema.prisma一致
    - [ ] 完整环境验证：`npx prisma studio`能正常显示21张空表结构
    - [ ] 准备就绪，可在B-1阶段直接基于正式schema.prisma进行数据库操作

### **子阶段 B：数据迁移与整合**
- [ ] **任务 B-1**：编写数据迁移脚本，将JSON数据导入数据库
- [ ] **任务 B-2**：基于"陆家花园主宇宙"的核心概念（如统一主题、情感等），建立各子项目（毛小豆、周与春秋）与主宇宙的数据映射关联。**（依赖任务A-4完成）**
- [ ] **任务 B-3**：实现数据完整性验证和一致性检查
- [ ] **任务 B-4**：创建数据统计和分析功能

### **子阶段 C：统一API网关与数据服务**
- [ ] **任务 C-1**：重构现有API，使用数据库替代JSON文件
- [ ] **任务 C-2**：编写API自动化测试（使用Jest/Supertest），确保重构前后接口行为一致
- [ ] **任务 C-3**：创建统一的API网关，支持跨项目数据访问
- [ ] **任务 C-4**：实现数据查询和关联查询功能
- [ ] **任务 C-5**：添加数据缓存和性能优化机制
- [ ] **任务 C-6**: **端到端功能验证**。在完成API重构后，以用户的身份，手动操作整个前端应用（包括 `index.html` 的完整问答流程和 `admin.html` 的所有管理功能），确保所有页面、按钮、数据交互和显示效果与重构前完全一致。

## 更新日志关联
- **预计更新类型**: 架构重构 / 功能更新
- **更新目录**: `documentation/changelog/YYYY-MM-DD_第一阶段数据整合完成/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [ ] 数据库表结构设计合理，符合主宇宙概念
  - [ ] 数据迁移脚本运行成功，所有数据无损导入
  - [ ] 统一API能够正确地从数据库中读取和关联数据
  - [ ] 后端自动化测试全部通过，接口行为符合预期
  - [ ] **前端端到端测试通过，所有页面和交互功能均与重构前保持一致，无任何功能退化。**

## 注意事项
- 每完成一个关键任务（如数据迁移、API重构）都要进行完整的功能测试。
- 在修改API前，确保自动化测试已覆盖现有功能，以便验证重构的正确性。
- 保持Git提交历史的清晰，每个子任务完成后都应有一次独立的提交。

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/YYYY-MM-DD_第一阶段数据整合完成/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 提交所有更改到Git
- [ ] 更新 `ROADMAP.md` 中第一阶段的状态
- [ ] 更新 `当前进展.md` 文件

## 当前状态
🔄 进行中

---
*本模板基于陆家花园项目Git开发指南创建*
