# 陆家花园 第二阶段 子阶段A 统一管理后台开发 TODO（增强版）

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
围绕“统一”的核心目标，交付一个可用的管理后台原型：支持核心数据的增删改查、与统一API可靠对接，并提供数据校验结果的可视化入口。完成后为第二阶段其余子阶段（UI与整合）奠定坚实基础。

## 范围与约束
- 范围：仅限“统一管理后台”的信息架构、静态页面与基础交互、与现有统一API的数据对接、数据校验可视化入口、（可选）简单认证。
- 约束：
  - 保持现有API契约不变（详见 `documentation/backend/api-contracts.md`）
  - 不引入新框架，优先使用原生 HTML/CSS/JavaScript（必要时可使用少量轻量库）
  - 优先保证稳定性与可回滚性（可回滚到当前已稳定版本）

## 任务列表

> 任务编号规范
> - 第一阶段使用前缀“1”：任务1.1、任务1.2 …；步骤使用“1.1.x”的三级编号
> - 注意，此处的“第一阶段”仅指本 TODO 内部的阶段划分（不是项目总Roadmap的阶段编号）。

### 第一阶段：统一管理后台开发（Phase 2 / Sub-Phase A）

- [ ] 任务1.1：功能模块设计与信息架构确定
  - 交付物：模块清单、页面线框图或草图、接口映射表
  - 验收：模块边界清晰；关键页面（内容管理、数据校验、用户反馈）都有入口与导航
  - 预期改动文件（预判）：
    - `documentation/backend/api-contracts.md`（仅做参考对照，不修改契约）
    - `lugarden_universal/public/admin.html`（占位与导航）
  - （可选）执行步骤：
    - 步骤1.1.1：盘点现有统一API与管理需求，列出功能清单与信息架构
    - 步骤1.1.2：输出页面线框图/草图，并标注与API的对应关系

- [ ] 任务1.2：搭建后台页面骨架与静态资源
  - 交付物：基础可访问的后台主页与样式、脚本文件
  - 验收：`admin.html` 可加载样式与脚本，导航可达各功能分区
  - 预期改动文件（预判）：
    - `lugarden_universal/public/admin.html`
    - `lugarden_universal/public/admin-styles.css`
    - `lugarden_universal/public/assets/admin.js`（新建）
  - 执行步骤：
    - 步骤1.2.1：为后台建立基础布局（头部导航、主内容区、侧边栏可选）
    - 步骤1.2.2：初始化 `admin.js`，完成模块化结构与基础事件绑定

- [ ] 任务1.3：与统一API的数据对接（内容管理 CRUD + 列表/详情/筛选）
  - 交付物：最小可用的内容管理列表、详情、简单编辑能力
  - 验收：能通过前端对接现有API完成查询、创建、更新、删除；错误提示与加载态可见
  - 预期改动文件（预判）：
    - `lugarden_universal/application/src/routes/public.js`（如需补充只读接口）
    - `lugarden_universal/application/src/routes/admin.js`（如需补充管理接口）
    - `lugarden_universal/public/assets/admin.js`
    - `lugarden_universal/tests/admin-api.contract.test.js`（必要时补充用例）
  - 执行步骤：
    - 步骤1.3.1：梳理现有接口并封装 `fetch` 调用（统一错误处理与超时）
    - 步骤1.3.2：实现列表、分页/筛选、详情查看；补充基础表单编辑

- [ ] 任务1.4：数据校验与完整性检查可视化入口
  - 交付物：在后台提供“校验面板”，展示关键校验结果与失败明细链接
  - 验收：可触发/查看最近一次校验结果；失败项可定位；不阻塞主流程
  - 预期改动文件（预判）：
    - `lugarden_universal/application/scripts/validation/generate-report.cjs`（仅复用/触发，不改动逻辑）
    - `lugarden_universal/application/src/routes/admin.js`（新增获取校验结果接口/触发任务接口，若需要）
    - `lugarden_universal/public/assets/admin.js`（渲染校验摘要与链接）
    - `lugarden_universal/application/reports/validation-report-*.json|.md`（只读展示）
  - 执行步骤：
    - 步骤1.4.1：确定校验结果获取方式（直接读取最新报告/调用服务生成）
    - 步骤1.4.2：前端实现摘要卡片与失败项列表、下载报告链接

- [ ] 任务1.5：（可选）简单认证机制
  - 交付物：`login.html` 与最小登录/退出流程（基于现有契约优先）
  - 验收：未登录访问管理页会重定向至登录；登录后可访问；登出可用
  - 预期改动文件（预判）：
    - `lugarden_universal/public/login.html`
    - `lugarden_universal/application/src/routes/admin.js`（登录/登出/会话校验端点，如需）
    - `lugarden_universal/tests/admin-auth.contract.test.js`（对齐用例）
  - 执行步骤：
    - 步骤1.5.1：对齐既有鉴权用例与端点；前端接入最小表单登录
    - 步骤1.5.2：在 `admin.js` 增加登录态检查与登出按钮逻辑

- [ ] 任务1.6：基础测试与验收
  - 交付物：通过既有合同测试；新增最小E2E/冒烟测试清单
  - 验收：`npm test` 全绿；核心用户路径（列表-详情-编辑-保存）可复现
  - 预期改动文件（预判）：
    - `lugarden_universal/application/tests/*.test.js`
    - `documentation/changelog/YYYY-MM-DD_统一管理后台开发启动/更新日志.md`

### 任务块模板（复制使用）
#### 任务X.Y：[任务标题]
- 交付物：
  - [列出应产出的文件/接口/脚本/文档]
- 验收：
  - [列出可验证条件：页面可用、接口契约一致、特定用例通过等]
- 预期改动文件（预判）：
  - `path/to/fileA`
  - `path/to/fileB`
- 完成状态：🔄 进行中 / ✅ 已完成 / ❌ 遇到问题
- 独立审计意见（可选）：
  - 质量评级：优秀 / 良好 / 一般 / 待改进
  - 审计结论：[一句话结论]
- （可选）执行步骤：
  - 步骤X.Y.1：[具体步骤]
  - 步骤X.Y.2：[具体步骤]

## 测试与验收
- 管理后台核心页面可用：可进入、可导航、无致命样式错乱
- 与统一API对接正确：列表/详情/编辑/保存流程可闭环；错误与加载态可见
- 校验面板可展示最近一次校验摘要与失败项定位
- （可选）登录流程可用：未登录拦截、登录后可访问、登出正常
- `npm test` 合同测试通过；新增必要的用例与检查

## 更新日志关联
- **预计更新类型**: 功能更新
- **更新目录**: `documentation/changelog/YYYY-MM-DD_统一管理后台开发启动/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [ ] 后台首页可访问（导航与模块入口可见）
  - [ ] 内容管理的查询/详情/保存流程可用
  - [ ] 校验面板能读取并展示最新校验结果
  - [ ] （可选）登录拦截与登出可用

## 注意事项
- 每完成一个任务都要测试功能
- 如果出现问题立即回滚（保持分支与提交粒度可控）
- 保持Git提交记录清晰（原子提交、提交信息规范、功能分支）

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/YYYY-MM-DD_统一管理后台开发启动/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 更新 `public/更新日志.md` 文件（如有）
- [ ] 提交所有更改到Git
- [ ] 更新项目状态与 `ROADMAP.md` 的进度标记

## 当前状态
🔄 进行中

---
*本TODO依据 `ROADMAP.md` 第二阶段 子阶段A 的任务拆解，遵循项目Git开发指南（增强版）*


