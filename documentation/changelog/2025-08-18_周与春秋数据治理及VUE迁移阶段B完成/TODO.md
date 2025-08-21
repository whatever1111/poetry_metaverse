# TODO：周与春秋数据治理 & 前端现代化迁移 - 阶段B

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
对已发布的"周与春秋"项目进行前端现代化迁移规划，在完成阶段A数据结构封版的基础上，制定Vue.js技术栈迁移策略并搭建开发环境。

## 范围与约束
- **范围**: 本次任务聚焦于Vue.js迁移策略制定和开发环境搭建，为后续实施阶段奠定基础。
- **约束**:
  - 前端架构必须与已完成的后端API结构适配。
  - 开发环境需支持现代前端工具链（TypeScript、测试、代码质量工具）。
  - 迁移策略需保证用户体验100%一致性。

## 任务列表

> 任务编号规范
> - 第一阶段使用前缀"B"：任务B.1、任务B.2 …；步骤使用"B.1.x"的三级编号

---

### **阶段B：前端现代化迁移规划 (Vue.js Migration Planning)** ✅ 已完成

#### - [x] 任务B.1：制定Vue迁移策略 ✅
- **核心思想**: 规划从现有原生JavaScript代码到Vue.js组件的迁移路径，为后续开发奠定清晰的蓝图。
- **关键文件分析 (现状评估)**:
  - **现有代码规模**: `lugarden_universal/public/zhou.html` (782行) + `lugarden_universal/public/assets/zhou.js` (504行) = 1286行代码
  - **技术栈现状**: 原生HTML + CSS + JavaScript，存在大量内联样式和复杂状态管理
  - **功能复杂度**: 包含5个页面屏幕、多种动画效果、API集成、音频播放等功能
- **交付物**:
  - 一份简要的迁移策略文档或在本任务下的决策记录。
- **验收**:
  - 迁移范围、状态管理方案、组件层级结构已明确。
- **决策记录 (已确认)**:
  - **迁移范围**: 确定采用"完全重写" (`complete rewrite`) 的方案，以建立一个纯粹、现代化的Vue前端应用，取代现有的 `zhou.html`。
    - **决策依据**: 基于现有1286行代码的技术债务分析，包含大量内联CSS、复杂的DOM操作、状态管理耦合等问题
    - **风险评估**: 渐进式迁移难度高，完全重写能建立更清晰的现代化架构，API层已稳定降低风险
  - **状态管理**: 决定使用 `Pinia` 进行全局状态管理，设计了`zhouStore`的核心状态结构：
    - **状态域划分**: universeData（数据层）、appState（应用状态）、navigation（导航状态）、quiz（测验状态）、result（结果状态）、ui（界面状态）
    - **架构优势**: 模块化管理、响应式更新、TypeScript支持、开发工具集成
  - **组件结构**: 设计了初步的组件层级结构，以 `ZhouContainer` 为核心容器：
    - **页面组件**: MainProjectSelection、SubProjectSelection、QuizScreen、ClassicalEchoScreen、ResultScreen
    - **功能组件**: QuestionCard、PoemViewer、ActionButtons、InterpretationDisplay等
    - **通用组件**: ErrorState、EmptyState、LoadingSpinner、AnimationWrapper等
    - **设计原则**: 单一职责、可复用性、组合优于继承、响应式设计
- **实际改动文件**:
  - (无代码改动，仅为规划决策和架构设计)
- **完成状态**: ✅ 已完成
- **执行步骤**:
  - [x] **步骤B.1.1 (迁移范围决策)**: 分析现有代码结构，决策采用完全重写方案
    - **分析过程**: 深入分析`zhou.html`(782行)和`zhou.js`(504行)的代码复杂度
    - **技术债务评估**: 发现大量内联CSS、复杂DOM操作、状态管理耦合等问题
    - **方案对比**: 渐进式迁移 vs 完全重写，评估实施难度和长期收益
    - **最终决策**: 完全重写，创建全新Vue应用替代现有实现
  - [x] **步骤B.1.2 (Pinia状态管理方案)**: 设计全局状态管理架构
    - **状态分析**: 基于`zhou.js`中现有state结构进行分析和重构设计
    - **架构设计**: 划分为6个核心状态域，每个域负责明确的职责范围
    - **方案优势**: 相比原生JavaScript状态管理，提供响应式、类型安全、开发工具支持
    - **接口设计**: 定义getters、actions的完整接口，支持异步操作和计算属性
  - [x] **步骤B.1.3 (组件层级结构设计)**: 完成Vue组件架构设计
    - **功能分解**: 将现有单体页面分解为可复用的组件单元
    - **层级设计**: 建立清晰的组件父子关系和数据流向
    - **复用策略**: 识别可复用组件（ProjectCard、BackButton等）
    - **响应式设计**: 所有组件支持移动端适配，保持原有用户体验

#### - [x] 任务B.2：搭建Vue开发环境 ✅
- **核心思想**: 在项目中集成Vue.js的开发环境，为前端代码的编写、构建和调试提供支持。
- **环境分析 (技术选型)**:
  - **Vue版本**: Vue 3.x (最新稳定版)
  - **构建工具**: Vite (官方推荐，快速热重载)
  - **开发语言**: TypeScript (类型安全，开发体验优化)
  - **状态管理**: Pinia (Vue 3官方推荐状态管理库)
  - **路由管理**: Vue Router (单页面应用导航)
  - **代码质量**: ESLint + Prettier (代码规范和格式化)
  - **测试框架**: Vitest + Playwright (单元测试和端到端测试)
- **架构决策 (已确认)**:
  - **项目位置**: 决定在 `lugarden_universal/` 目录下创建 `frontend_vue` 作为独立的前端工程目录，与后端的 `application/` 目录并列。
  - **决策依据**:
    - **关注点分离**: 严格分离前端（UI/用户交互）与后端（数据/API）的职责。
    - **独立依赖管理**: 前后端拥有各自的 `package.json`，避免依赖臃肿和版本冲突。
    - **构建流程清晰**: 前端（Vite构建）和后端（Node运行）的生命周期完全不同，分离使流程更简单、可靠。
    - **提升可维护性**: 清晰的目录结构使项目更易于理解和长期维护。
- **交付物**:
  - 一个可运行的Vue.js前端开发环境。
- **验收**:
  - Vue开发服务器能正常启动。
  - 开发服务器能通过代理与Express后端API成功通信。
- **实际改动文件**:
  - `lugarden_universal/frontend_vue/` - 新增整个Vue前端工程目录
  - `lugarden_universal/frontend_vue/vite.config.ts` - 配置Vite开发服务器和API代理
  - `lugarden_universal/frontend_vue/package.json` - Vue项目依赖配置
  - `lugarden_universal/frontend_vue/src/` - Vue应用源码目录结构
  - `lugarden_universal/frontend_vue/tsconfig.*.json` - TypeScript配置文件
  - `lugarden_universal/frontend_vue/eslint.config.ts` - ESLint代码规范配置
- **完成状态**: ✅ 已完成
- **执行步骤**:
  - [x] **步骤B.2.1 (Vite项目初始化)**: 使用`npm create vue@latest`创建Vue3项目
    - **交互式配置选择** (用户确认的完整配置):
      - ✅ TypeScript (类型安全)
      - ✅ JSX 支持 (可选，提供React风格组件语法)
      - ✅ Router（单页面应用开发，必需）
      - ✅ Pinia（状态管理，符合B.1架构决策）
      - ✅ Vitest（单元测试）
      - ✅ 端到端测试 + Playwright框架
      - ✅ ESLint（错误预防）
      - ✅ Prettier（代码格式化）
      - ✅ Oxlint（试验阶段特性）
      - ✅ rolldown-vite（试验阶段特性）
      - ✅ 跳过示例代码，创建空白项目
    - **项目结构**: 创建了标准的Vue3项目结构，包含src、public、tests等目录
    - **依赖安装**: 成功安装460个依赖包，无安全漏洞
    - **技术栈**: Vue 3 + TypeScript + Vite + Pinia + Vue Router + 完整测试工具链
  - [x] **步骤B.2.2 (前端工程目录建立)**: 在`lugarden_universal`目录下成功创建`frontend_vue`独立工程
    - **目录结构**: 与后端`application/`目录并列，实现前后端完全分离
    - **依赖管理**: 独立的`package.json`和`node_modules`，避免依赖冲突
    - **构建配置**: 独立的Vite构建配置，与后端Node.js运行环境分离
  - [x] **步骤B.2.3 (Vite代理配置)**: 配置开发服务器API代理实现前后端通信
    - **代理配置**: 将`/api/*`请求转发到`http://localhost:3000`后端服务
    - **开发体验**: 添加详细的代理日志，便于调试API请求
    - **错误处理**: 配置代理错误处理机制，提供调试信息
    - **验证成功**: Vue开发服务器正常启动在`http://localhost:5173`，显示"You did it!"欢迎页面

---

## 测试与验收
- **阶段B**: ✅ 已完成
  - Vue开发环境成功搭建并验证。
  - 开发服务器能通过代理与Express后端API成功通信。
  - 迁移策略、状态管理方案、组件层级结构已明确。
  - 技术栈选型完成，开发工具链配置就绪。

## 更新日志关联
- **更新类型**: [架构重构/功能更新]
- **更新目录**: `documentation/changelog/2025-08-18_周与春秋数据治理及VUE迁移阶段B完成/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**:
  - [x] Vue迁移策略制定完成。
  - [x] Vue开发环境搭建成功。
  - [x] 前后端代理配置验证通过。

## 完成后的操作
- [x] 创建更新目录：`documentation/changelog/2025-08-18_周与春秋数据治理及VUE迁移阶段B完成/`
- [x] 将阶段B内容移动到更新目录并创建 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 提交所有更改到Git

## 当前状态
✅ 阶段B完成，Vue开发环境就绪

---

*本TODO清单基于项目根目录的 `TODO_zhou_data_governance_and_vue_migration.md` 阶段B内容创建。*
