# 陆家花园 第二阶段 统一后台与用户界面（架构重构） TODO（增强版）

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
基于“多宇宙”核心模型，重构管理后台与用户界面，实现真正的“统一管理、分别呈现”。**此阶段将纠正前期单体式开发的偏差，为项目长期、可扩展的发展奠定正确的架构基础。**

## 范围与约束
- **范围**: 聚焦于后台与公开 API 的架构重构，以及前台的门户化改造。确保后台能以“宇宙”为核心进行管理，前台能清晰索引不同宇宙。
- **约束**:
  - 新架构必须在功能上向后兼容“周与春秋”宇宙的既有管理和用户体验。
  - 优先使用原生 HTML/CSS/JavaScript，不引入新的大型前端框架。
  - 所有 API 变更必须有对应的合同测试和文档更新。
  - 开发工作应在独立的 `feature/phase-2-refactor` 分支进行，待核心功能稳定后再合入主干。

## 任务列表

> 任务编号规范
> - 本 TODO 清单内，任务将按照 ROADMAP 中第二阶段的子阶段进行分组，编号格式为 `A.x`, `B.x`, `C.x`。
> - 步骤使用 `A.x.y` 的三级编号。

### 子阶段 A：统一管理后台重构（以“宇宙”为核心）

- [x] **任务A.0：定义并冻结 Phase 2 API 契约**
  - **核心思想**: 采用“API 优先”设计，先定义和审查接口契约，再进行开发。
  - [x] **步骤 A.0.1**: 重构 `api-contracts.md` 的文档结构，引入版本/阶段和状态标签（如 `[Active]`, `[Deprecated]`），使其能清晰地展示 API 的演进。
    - **预期改动（预判）**:
      - `documentation/backend/api-contracts.md` (调整整体文件结构)
  - [x] **步骤 A.0.2**: 在新结构下，定义 Phase 2 所需的 `Universe` 实体管理 API (`/api/admin/universes`) 的完整契约（GET, POST, PUT, DELETE）。
    - **预期改动（预判）**:
      - `documentation/backend/api-contracts.md` (撰写新接口的请求/响应格式、字段说明和示例)
  - [x] **步骤 A.0.3**: 审查现有的 Phase 1 Admin API (如 `/api/admin/projects`)，在新文档中明确其在 Phase 2 下的新上下文（如：成为“周与春秋”宇宙的专属接口）和 `[Active]` 状态。
    - **预期改动（预判）**:
      - `documentation/backend/api-contracts.md` (整理并注释现有接口，而非直接删除)
  - [x] **步骤 A.0.4**: (团队审查) 冻结所有 Phase 2 Admin API 契约，作为后续开发的“唯一真相来源”。
    - **预期改动（预判）**:
      - (无代码改动，此为流程节点)
  - **完成状态**: ✅ 已完成

- [ ] **任务A.S (策略调整): 创建安全的重构“沙盒”**
  - **核心思想**: 为了在不破坏现有功能的前提下进行重构，我们不直接修改 `admin.html`，而是为其创建一个副本作为新的工作区。旧版 `admin.html` 将作为功能参考。
  - [ ] **步骤 A.S.1**: 复制 `lugarden_universal/public/admin.html` 为 `lugarden_universal/public/admin.v2.html`。
    - **预期改动（预判）**: `lugarden_universal/public/admin.v2.html` (新建)
  - **完成状态**: 待定

- [ ] **任务A.1：实现 `Universe` 实体的基础 CRUD 管理**
  - **核心思想**: 严格按照 `任务 A.0` 中冻结的契约，完成后端接口和前端界面的开发。**注意：所有前端改动将在 `admin.v2.html` 上进行。**
  - [ ] **步骤 A.1.1:** 创建 `GET /api/admin/universes` 接口的后端实现。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/admin.js` (新增 GET /universes 路由)
  - [ ] **步骤 A.1.2:** 创建 `POST /api/admin/universes` 接口的后端实现。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/admin.js` (新增 POST /universes 路由)
  - [ ] **步骤 A.1.3:** 创建 `PUT /api/admin/universes/:id` 接口的后端实现。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/admin.js` (新增 PUT /universes/:id 路由)
  - [ ] **步骤 A.1.4:** 创建 `DELETE /api/admin/universes/:id` 接口的后端实现。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/admin.js` (新增 DELETE /universes/:id 路由)
  - [ ] **步骤 A.1.5:** 将 `admin.v2.html` 的主体部分重构为“宇宙仪表盘”布局。
    - **预期改动（预判）**:
      - `lugarden_universal/public/admin.v2.html` (修改 HTML 结构，为宇宙列表和管理入口做准备)
  - [ ] **步骤 A.1.6:** 在 `admin.v2.html` 的仪表盘前端，调用 `GET` 接口，获取并渲染宇宙列表。
    - **预期改动（预判）**:
      - `lugarden_universal/public/admin.v2.html` (编写 JS 逻辑)
  - [ ] **步骤 A.1.7:** 在 `admin.v2.html` 中创建并集成一个可复用的模态框（Modal）表单，用于“创建新宇宙”和“编辑宇宙”。
    - **预期改动（预判）**:
      - `lugarden_universal/public/admin.v2.html` (新增模态框的 HTML 结构和对应的显示/隐藏 JS 逻辑)
  - [ ] **步骤 A.1.8:** 在 `admin.v2.html` 中，为列表中的每个宇宙条目，绑定“编辑”和“删除”按钮的事件。
    - **预期改动（预判）**:
      - `lugarden_universal/public/admin.v2.html` (为按钮添加事件监听器)
  - [ ] **步骤 A.1.9:** 为所有新 API 端点编写合同测试，严格验证其是否符合 `api-contracts.md` 中的定义。
    - **预期改动（预判）**:
      - `lugarden_universal/application/tests/admin-api.contract.test.js` (新增 describe 块，测试 Universe CRUD)
  - **完成状态**: 🔄 进行中

- [ ] **任务A.2：重构后台为“分模块、动态加载”架构 (在 `admin.v2.html` 上)**
  - **核心思想**: 以 `admin.html` 作为功能参考，在 `admin.v2.html` 上实现新架构。
  - [ ] **步骤 A.2.1:** 创建后台模块加载器的基础 `admin.js`，并将其链接到 `admin.v2.html`。
    - **预期改动（预判）**:
      - `lugarden_universal/public/assets/admin.js` (新建)
      - `lugarden_universal/public/admin.v2.html` (移除所有内联 `<script>` 逻辑，添加 `<script src="assets/admin.js">`)
  - [ ] **步骤 A.2.2:** 实现动态模块加载机制，当在 `admin.v2.html` 的仪表盘点击某个宇宙的“管理”按钮时，能根据其 `type` 加载对应的 JS 模块。
    - **预期改动（预判）**:
      - `lugarden_universal/public/assets/admin.js` (实现动态 `import()` 逻辑)
  - [ ] **步骤 A.2.3:** 以**原版 `admin.html`** 为功能参考，创建“周与春秋”宇宙的管理模块，将原有的管理功能封装进去。
    - **预期改动（预判）**:
      - `lugarden_universal/public/assets/universe-modules/zhou.js` (新建)
      - `lugarden_universal/public/admin.v2.html` (相关的旧HTML将在模块加载时动态生成，因此静态文件本身会移除旧结构)
  - [ ] **步骤 A.2.4:** 创建“毛小豆”宇宙管理模块的占位符文件和界面。
    - **预期改动（预判）**:
      - `lugarden_universal/public/assets/universe-modules/maoxiaodou.js` (新建)
      - `lugarden_universal/public/assets/admin.js` (确保能正确加载占位符)
  - **完成状态**: 🔄 进行中

- [ ] **任务A.3：完成新旧后台切换**
  - **核心思想**: 在新后台 (`admin.v2.html`) 功能完整并通过验证后，执行原子化的切换操作。
  - [ ] **步骤 A.3.1**: (手动验证) 完整测试 `admin.v2.html` 的所有功能，确保其体验与旧版一致或更优。
  - [ ] **步骤 A.3.2**: 备份旧版后台：`mv lugarden_universal/public/admin.html lugarden_universal/public/admin.legacy.html`
  - [ ] **步骤 A.3.3**: 部署新版后台：`mv lugarden_universal/public/admin.v2.html lugarden_universal/public/admin.html`
  - **完成状态**: 待定

### 子阶段 B：统一用户界面 (UI) 与公开 API 重构

- [ ] **任务B.1：重构公开 API 为“以宇宙为中心”的层级结构**
  - [ ] **步骤 B.1.1:** 创建 `GET /api/universes` 接口，返回所有 `status=published` 的宇宙列表。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/public.js` (新增 `/universes` 路由实现)
  - [ ] **步骤 B.1.2:** 创建 `GET /api/universes/:universeCode/content` 接口，作为获取特定宇宙内容的统一入口，并为“周与春秋”实现内容聚合。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/public.js` (新增 `/:universeCode/content` 路由，并实现其 `type='zhou_spring_autumn'` 时的逻辑)
      - `lugarden_universal/application/src/services/mappers.js` (可能需要新的 mapper 函数来聚合数据)
  - [ ] **步骤 B.1.3:** 正式废弃旧的扁平化 API (`/api/projects`, `/api/questions`等)，移除其路由。
    - **预期改动（预判）**:
      - `lugarden_universal/application/src/routes/public.js` (删除旧路由)
  - [ ] **步骤 B.1.4:** 重写 `public-api.contract.test.js` 以测试新的层级化 API。
    - **预期改动（预判）**:
      - `lugarden_universal/application/tests/public-api.contract.test.js` (完全重写测试文件，对齐新接口)
  - **完成状态**: 🔄 进行中

- [ ] **任务B.2：重构用户界面为“宇宙门户”**
  - [ ] **步骤 B.2.1:** 将 `index.html` 重写为“宇宙门户”页面，并创建 `main.js` 脚本调用新 API 动态渲染宇宙入口。
    - **预期改动（预判）**:
      - `lugarden_universal/public/index.html` (重写 HTML 结构为门户，并链接 `main.js`)
      - `lugarden_universal/public/assets/main.js` (新建，包含调用 `GET /api/universes` 并渲染卡片的逻辑)
  - [ ] **步骤 B.2.2:** 创建 `zhou.html` 页面，作为“周与春秋”宇宙的独立体验承载页。
    - **预期改动（预判）**:
      - `lugarden_universal/public/zhou.html` (新建，从旧 `index.html` 迁移相关 HTML 结构和样式)
  - [ ] **步骤 B.2.3:** 创建 `zhou.js` 脚本，在 `zhou.html` 页面加载时调用 `GET /api/universes/zhou/content` 接口，并渲染页面内容。
    - **预期改动（预判）**:
      - `lugarden_universal/public/assets/zhou.js` (新建，从旧 `index.html` 迁移相关 JS 逻辑，并适配新 API)
      - `lugarden_universal/public/zhou.html` (链接 `zhou.js` 脚本)
  - **完成状态**: 🔄 进行中

### 子阶段 C：新架构集成与验证

- [ ] **任务C.1：端到端流程验证与系统稳定性测试**
  - [ ] **步骤 C.1.1:** 编写并执行管理员端到端手动测试用例（登录 -> 仪表盘 -> 创/改/删宇宙 -> 进入周宇宙管理）。
    - **预期改动（预判）**:
      - `documentation/testing/e2e-admin.md` (新建，记录测试用例与结果)
  - [ ] **步骤 C.1.2:** 编写并执行用户端到端手动测试用例（访问门户 -> 浏览宇宙 -> 进入周宇宙体验）。
    - **预期改动（预判）**:
      - `documentation/testing/e2e-user.md` (新建，记录测试用例与结果)
  - [ ] **步骤 C.1.3:** 对动态加载、错误处理、边界条件（如空宇宙、未知宇宙类型）进行手动测试。
    - **预期改动（预判）**:
      - (无代码改动，主要是测试活动，结果记录在上述 e2e 文档中)
  - **完成状态**: 🔄 进行中

- [ ] **任务C.2：完成所有文档的最终同步**
  - [ ] **步骤 C.2.1:** 最终审查 `api-contracts.md`，确保其与所有已实现的 API 完全一致。
    - **预期改动（预判）**:
      - `documentation/backend/api-contracts.md` (进行最终校对和细节修正)
  - [ ] **步骤 C.2.2:** 更新 `readme_forAI.md`，反映新的后台架构和前端模块化思想，指导未来的 AI 协作。
    - **预期改动（预判）**:
      - `readme_forAI.md` (更新相关章节，解释新架构)
  - [ ] **步骤 C.2.3:** （可选）创建一份简单的架构图，描述多宇宙模型和动态加载机制。
    - **预期改动（预判）**:
      - `documentation/architecture/overview.md` (新建，可用 Mermaid.js 绘制)
  - **完成状态**: 🔄 进行中

### 可选增强任务 (Optional Enhancements)

> 此阶段的任务为非阻塞性增强功能，可在核心功能完成后酌情实现。

- [ ] **任务D.1: 创建初始数据种子脚本 (Data Seeding)**
  - **核心思想**: 为了确保新架构部署后能立即包含“周与春秋”宇宙的初始数据，并简化测试流程，创建一个一次性的种子脚本。
  - [ ] **步骤 D.1.1**: 编写一个 Prisma 种子脚本。
  - [ ] **步骤 D.1.2**: 在脚本中，检查“周与春秋”宇宙是否存在，如果不存在，则创建它。
  - [ ] **步骤 D.1.3**: (可选) 将现有的 `Project` 数据与新创建的“周与春秋”宇宙进行关联。
  - **完成状态**: 待定

- [ ] **任务D.2: 强化前端 API 请求的健壮性**
  - **核心思想**: 在所有前端 JavaScript 代码中，对 `fetch` API 调用实现统一的错误处理机制，提升用户体验。
  - [ ] **步骤 D.2.1**: 在 `admin.js` 和 `main.js` 中，为 API 请求添加 `try...catch` 块或 `.catch()` 方法。
  - [ ] **步骤 D.2.2**: 当 API 请求失败时，在界面上向用户显示一个清晰、非阻塞的错误提示（例如，一个临时的 toast 通知或在特定区域显示错误信息），而不是让应用崩溃或无响应。
  - **完成状态**: 待定

## 测试与验收
- **管理员**: 可以通过后台，以宇宙为单位进行创建、编辑、删除和管理操作。
- **用户**: 可以通过门户网站，清晰地导航至并体验不同的宇宙。
- **开发者**: 可以基于新架构，轻松地为新宇宙添加管理模块和前端体验，而无需改动核心框架。
- **系统**: 所有新增和重构的 API 都有自动化测试覆盖，文档同步更新。

## 分支与合并策略
- **开发分支**: 所有第二阶段的开发工作，必须在独立的 `feature/phase-2-refactor` 功能分支上进行。
- **合并时机**: 只有当本 TODO 清单中的所有任务（A, B, C阶段）均完成，并通过了所有验收条件后，功能分支才能被合并回 `main` 主干。
- **合并方式**: 采用非快进式合并，以在主干上保留清晰的里程碑记录。
  ```bash
  # 1. 确保主干是切换的目标
  git checkout main
  # 2. 拉取最新更新（作为好习惯）
  git pull origin main
  # 3. 执行非快进式合并，并提供清晰的提交信息
  git merge --no-ff feature/phase-2-refactor -m "feat: Complete Phase 2 architecture refactor"
  ```

## 更新日志关联
- **预计更新类型**: 架构重构
- **更新目录**: `documentation/changelog/YYYY-MM-DD_Phase2_Architecture_Refactor/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**:
  - [ ] 后台首页变为“宇宙仪表盘”，可管理宇宙。
  - [ ] “周与春秋”宇宙的管理功能在新架构下可正常使用。
  - [ ] 官网首页变为“宇宙门户”。
  - [ ] “周与春秋”宇宙的用户体验在新架构下保持一致。

## 注意事项
- 严格遵循在 `feature/phase-2-refactor` 分支开发的约束。
- 每次提交都应是原子性的，清晰地对应一个小的功能点或修复。
- API 契约一旦确定，前后端需严格遵守。

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/YYYY-MM-DD_Phase2_Architecture_Refactor/`
- [ ] 将本 TODO 文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 提交所有更改到 Git 并准备合并功能分支。
- [ ] 更新 `ROADMAP.md` 的进度标记。

## 当前状态
🔄 进行中

---
*本 TODO 依据 `ROADMAP.md` 第二阶段重构目标制定，遵循项目 Git 开发指南（增强版）*
