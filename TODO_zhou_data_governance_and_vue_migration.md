# TODO：周与春秋数据治理 & 前端现代化迁移

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
对已发布的"周与春秋"项目进行数据结构治理，实现一次"数据结构封版"。这旨在为后续引入Vue.js框架、提升项目可维护性奠定坚实、稳定的数据基础。

## 范围与约束
- **范围**: 本次任务聚焦于"周与春秋"子项目的数据模型重构、API适配以及前端至Vue.js的技术栈升级规划。
- **约束**:
  - 所有数据库`schema`变更必须通过Prisma迁移工具执行，确保版本可追溯。
  - 数据迁移脚本需经过"演习"验证，确保数据安全无虞。
  - API服务的改动需保持对现有功能的向后兼容。

## 任务列表

> 任务编号规范
> - 第一阶段使用前缀"A"：任务A.1、任务A.2 …；步骤使用"A.1.x"的三级编号
> - 第二阶段使用前缀"B"：任务B.1、任务B.2 …；步骤使用"B.1.x"
> - 第三阶段使用前缀"C"：任务C.1、任务C.2 …；步骤使用"C.1.x"
> - 注意，上述第X阶段，都是指在当前TODOlist中的阶段，而非其他。

---

### **阶段A：数据结构封版 (Data Governance)**

#### - [x] 任务A.1：数据提取与解析（Dry Run） ✅
- **核心思想**: 在schema变更前，安全地从现有数据库中提取和解析数据，生成可供人工审核的中间文件。
- **关键文件路径 (消除歧义)**:
  - **数据库文件**: `C:/Users/C2/Desktop/三号线诗聚/lu_garden_lab/lugarden_universal/application/data/lugarden.db`
  - **源JSON文件**: `C:/Users/C2/Desktop/三号线诗聚/lu_garden_lab/poeject_zhou_spring_autumn/data/content_draft/questions.json`
- **交付物**:
  - 数据**提取**脚本。
  - 包含`meaning`数据的中间文件（`meaning_report.json`）。
  - 包含结构化`body`数据的中间文件（`body_parsing_report.json`）。
- **验收**:
  - 成功从现有数据库中提取所有相关数据。
  - 生成准确的解析报告，无数据丢失。
- **实际改动文件**:
  - `lugarden_universal/application/scripts/migration/extract-meaning-data.cjs` - 提取meaning数据脚本
  - `lugarden_universal/application/scripts/migration/parse-body-data.cjs` - 解析body数据脚本
  - `lugarden_universal/application/scripts/migration/generate-validation-report.cjs` - 生成验证报告脚本
  - `lugarden_universal/application/scripts/migration/temp/meaning_report.json` - meaning数据报告
  - `lugarden_universal/application/scripts/migration/temp/body_parsing_report.json` - body解析报告
  - `lugarden_universal/application/scripts/migration/temp/validation_report.json` - 综合验证报告
- **完成状态**: ✅ 已完成
- **执行步骤**:
  - [x] **步骤 A.1.1 (提取meaning数据)**: 从`questions.json`中提取48条meaning记录
  - [x] **步骤 A.1.2 (解析body数据)**: 从48首诗歌中解析出结构化数据，包含quote_text、quote_citation、main_text
  - [x] **步骤 A.1.3 (生成验证报告)**: 生成综合验证报告，确认数据提取和解析成功

#### - [x] 任务A.2：人工审核与数据验证 ✅
- **核心思想**: 对提取的数据进行人工审核，确保数据质量和准确性。
- **交付物**:
  - 经过审核和修正的`meaning_report.json`。
  - 经过审核和修正的`body_parsing_report.json`。
- **验收**:
  - 所有数据内容准确无误。
  - 解析结果符合预期。
- **实际改动文件**:
  - 审核确认了`meaning_report.json`中的48条meaning记录
  - 审核确认了`body_parsing_report.json`中的48首诗歌解析结果
  - 修正了quote_citation中的破折号和\r字符问题
- **完成状态**: ✅ 已完成
- **执行步骤**:
  - [x] **步骤 A.2.1 (数据审核)**: 人工审核了meaning数据和body解析结果
  - [x] **步骤 A.2.2 (数据确认)**: 确认审核后的数据文件为最终版本，修正了格式问题

#### - [x] 任务A.3：数据库Schema变更设计 ✅
- **核心思想**: 基于已完成的数据提取和审核，设计`schema.prisma`的具体变更，以支持"用户原型"解读和结构化诗歌内容。
- **交付物**:
  - `schema.prisma`文件的更新草案。
- **验收**:
  - `ZhouMapping`表中已添加`meaning: String?`字段。
  - `ZhouPoem`表中的`body`字段类型已从`String`变更为`Json`。
- **实际改动文件**:
  - `lugarden_universal/application/prisma/schema.prisma` - 添加meaning字段，body字段JSON化
- **完成状态**: ✅ 已完成

#### - [x] 任务A.4：执行数据库迁移 ✅
- **核心思想**: 应用`schema.prisma`的变更到数据库，确保数据安全。
- **交付物**:
  - 一次成功的Prisma迁移记录。
  - 数据库备份文件。
- **验收**:
  - 新的数据库结构生效，现有数据兼容，没有数据丢失。
  - Prisma Client已成功重新生成。
- **实际改动文件**:
  - `lugarden_universal/application/data/lugarden.db.backup.20250818_165419` - 数据库备份
  - `lugarden_universal/application/prisma/migrations/20250818085432_feature_zhou_data_governance/migration.sql` - 迁移文件
- **完成状态**: ✅ 已完成
- **执行步骤**:
   - [x] 步骤A.4.1：备份当前数据库`lugarden.db`。
   - [x] 步骤A.4.2：在`schema.prisma`中应用任务A.3的变更。
   - [x] 步骤A.4.3：执行`npx prisma migrate dev --name "feature-zhou-data-governance"`生成并应用迁移。
   - [x] 步骤A.4.4：执行`npx prisma generate`重新生成Prisma Client。

#### - [x] 任务A.5：数据写入与验证 ✅
- **核心思想**: 将审核过的数据安全地写入到新的数据库结构中。
- **交付物**:
  - 数据**写入**脚本。
  - 写入验证报告。
- **验收**:
  - 数据库中的数据与审核后的中间文件完全一致。
  - 所有字段正确填充。
- **实际改动文件**:
  - `lugarden_universal/application/scripts/migration/write-meaning-data.cjs` - 写入meaning数据脚本
  - `lugarden_universal/application/scripts/migration/write-body-data.cjs` - 写入body数据脚本
  - `lugarden_universal/application/scripts/migration/verify-data-write.cjs` - 数据验证脚本
  - `lugarden_universal/application/scripts/migration/temp/meaning_write_report.json` - meaning写入报告
  - `lugarden_universal/application/scripts/migration/temp/body_write_report.json` - body写入报告
  - `lugarden_universal/application/scripts/migration/temp/data_verification_report.json` - 数据验证报告
- **完成状态**: ✅ 已完成
- **执行步骤**:
  - [x] **步骤 A.5.1 (写入meaning数据)**: 成功写入48条meaning记录到ZhouMapping表
  - [x] **步骤 A.5.2 (写入body数据)**: 成功写入48首诗歌的结构化body数据到ZhouPoem表
  - [x] **步骤 A.5.3 (数据验证)**: 验证所有数据100%完整写入，无数据丢失

#### - [x] 任务A.6：API服务层适配 ✅
- **核心思想**: 更新后端的API路由和服务，以支持新的数据结构，确保前端能够访问到新增和变更的字段。
- **交付物**:
  - 更新后的API服务代码。
  - 更新后的API契约文档。
  - 更新后的字段映射文档。
  - API验证脚本和报告。
- **验收**:
  - `GET`请求能够正确返回`meaning`字段和结构化的`body`字段。
  - 所有受影响的API端点功能正常。
  - 向后兼容性得到保证。
- **实际改动文件**:
  - `lugarden_universal/application/src/routes/public.js` - 更新映射函数调用
  - `lugarden_universal/application/src/routes/admin.js` - 支持新的JSON格式和meaning字段
  - `lugarden_universal/application/src/services/mappers.js` - 更新映射逻辑支持新数据结构
  - `documentation/backend/api-contracts.md` - 更新API契约文档
  - `documentation/backend/field-mapping.md` - 更新字段映射文档
  - `lugarden_universal/application/tests/admin-universes.crud.test.js` - 修复测试
  - `lugarden_universal/application/scripts/migration/verify-api-changes.cjs` - 新增API验证脚本
- **完成状态**: ✅ 已完成
- **执行步骤**:
  - [x] **步骤 A.6.1 (更新映射函数)**: 修改`mappers.js`支持新的meaning字段和JSON格式body字段
  - [x] **步骤 A.6.2 (更新API路由)**: 修改`public.js`和`admin.js`支持新的数据结构
  - [x] **步骤 A.6.3 (更新文档)**: 同步更新API契约和字段映射文档
  - [x] **步骤 A.6.4 (修复测试)**: 更新测试文件以支持新的API要求
  - [x] **步骤 A.6.5 (验证API)**: 创建验证脚本确认API修改正确

---

### **阶段B：前端现代化迁移规划 (Vue.js Migration Planning)**

#### - [ ] 任务B.1：制定Vue迁移策略
- **核心思想**: 规划从现有原生JavaScript代码到Vue.js组件的迁移路径，为后续开发奠定清晰的蓝图。
- **交付物**:
  - 一份简要的迁移策略文档或在本任务下的决策记录。
- **验收**:
  - 迁移范围、状态管理方案、组件层级结构已明确。
- **预期改动文件（预判）**:
  - (无代码改动，仅为规划决策)
- **完成状态**: 🔄 待开始
- **执行步骤**:
  - - [ ] 步骤B.1.1：决策迁移范围：是完全重写`zhou.html`，还是采用渐进式迁移。
  - - [ ] 步骤B.1.2：确定引入Pinia进行全局状态管理的具体方案。
  - - [ ] 步骤B.1.3：设计初步的组件层级结构（例如，`QuestionCard`, `ResultDisplay`, `PoemViewer`等）。

#### - [ ] 任务B.2：搭建Vue开发环境
- **核心思想**: 在项目中集成Vue.js的开发环境，为前端代码的编写、构建和调试提供支持。
- **交付物**:
  - 一个可运行的Vue.js前端开发环境。
- **验收**:
  - Vue开发服务器能正常启动。
  - 开发服务器能通过代理与Express后端API成功通信。
- **预期改动文件（预判）**:
  - `lugarden_universal/` (新增`frontend_vue`等前端工程目录)
- **完成状态**: 🔄 待开始
- **执行步骤**:
  - - [ ] 步骤B.2.1：使用Vite初始化Vue.js项目。
  - - [ ] 步骤B.2.2：在`lugarden_universal`目录下建立新的前端工程目录（如`frontend_vue`）。
  - - [ ] 步骤B.2.3：配置Vite代理，使其能与Express后端API通信。

---

### **阶段C：前端现代化迁移实施 (Execution)**

#### - [ ] 任务C.1：实施前端迁移
- **核心思想**: 根据B.1的策略，逐步将`zhou.html`的功能用Vue组件实现。
- **交付物**:
  - Vue组件代码。
  - 重构后的`zhou`页面。
- **验收**:
  - 新的Vue版本`zhou`页面在功能上完全对齐旧版本。
  - 新版本具备更好的可维护性和扩展性。
- **预期改动文件（预判）**:
  - `lugarden_universal/frontend_vue/src/` (新增Vue组件)
- **完成状态**: 🔄 待开始
- **执行步骤 (里程碑)**:
  - - [ ] 步骤C.1.1：完成第一个核心组件的迁移（如问答卡片）。
  - - [ ] 步骤C.1.2：完成与后端API的数据对接和状态管理。
  - - [ ] 步骤C.1.3：完成整个页面的Vue化重构。

---

## 测试与验收
- **阶段A**:
  - 数据库结构变更正确无误，无数据丢失。
  - API返回数据符合新模型的要求。
- **阶段B/C**:
  - Vue版本前端功能与原版完全一致。
  - 在常见浏览器上表现正常。

## 更新日志关联
- **预计更新类型**: [架构重构/功能更新]
- **更新目录**: `documentation/changelog/YYYY-MM-DD_zhou_data_governance_and_vue_migration/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**:
  - [ ] 数据库迁移成功。
  - [ ] `meaning`字段和结构化`body`在API中可访问。
  - [ ] Vue版本前端功能完整。

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/YYYY-MM-DD_zhou_data_governance_and_vue_migration/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 提交所有更改到Git

## 当前状态
🔄 待开始

---

*本TODO清单基于项目根目录的`DRAFT_TODO_data_governance_and_vue_migration.md`创建。*
