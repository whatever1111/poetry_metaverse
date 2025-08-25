# 周与春秋AI功能修复 TODO

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
修复周与春秋项目中的AI功能相关问题，确保AI解读、问答系统等功能正常运行。诊断并修复当前AI服务的连接问题、数据格式兼容性问题，以及用户交互体验问题，恢复完整的AI功能生态系统。

## 范围与约束
- **范围**: 周与春秋子项目的所有AI相关功能模块
- **约束**:
  - 保持现有UI/UX设计不变，专注于功能修复
  - 确保与现有数据结构的兼容性
  - 维护API调用的安全性和稳定性
- **核心原则**: 功能恢复优先，用户体验保障，系统稳定性确保

## 任务列表

> **任务编号规范**
> - 建议按阶段组织任务，使用2025-08-24_A、2025-08-24_B等标识阶段  
> - 阶段2025-08-24_A使用前缀"A"：任务A.1、任务A.2 …；步骤使用"A.1.x"的三级编号
> - 注意，上述阶段标识，都是指在当前TODO列表中的阶段，而非其他。

---

### **阶段08-24_A：AI功能诊断与修复**

#### - [x] 任务A.1：AI功能现状调研与问题识别
- **核心思想**: 全面诊断当前周与春秋项目中AI功能的运行状态，识别具体的故障点和问题根源，为后续修复工作建立清晰的问题地图和修复策略
- 交付物：
  - AI功能问题诊断报告
  - 故障点清单和优先级排序
  - 修复策略和技术方案建议
- 验收标准：
  - 完成所有AI功能模块的运行状态检查
  - 识别出具体的API连接、数据格式、界面显示问题
  - 生成包含问题分类、影响程度、修复难度的详细报告
- **风险评估**: 零风险 - 纯调研分析工作，不涉及代码修改
- 预期改动文件（预判）：
  - 仅生成分析报告，无代码文件改动
- 实际改动文件: 
  - **调研分析报告**：AI功能现状深度分析完成
- 完成状态：✅ 已完成
- 执行步骤：
   - [x] 步骤A.1.1：检查AI服务端点连接状态和响应 ✅
   - [x] 步骤A.1.2：分析AI功能相关组件和代码结构 ✅
   - [x] 步骤A.1.3：测试现有AI功能的用户交互流程 ✅
   - [x] 步骤A.1.4：生成问题诊断报告和修复优先级 ✅

- **📋 调研发现详细报告**：

**🎯 核心问题识别**：
1. **参数格式不匹配问题**（高优先级）
   - 前端发送：`{poem: string, title: string}` 
   - server.js期望：`{prompt: string}` (解诗) / `{text: string}` (读诗)
   - 影响：API调用失败，功能完全无法工作
   
2. **路由优先级冲突**（已解决）
   - server.js中的AI路由实际优先执行，public.js的模拟版本被覆盖
   - 发现：Gemini API和Google TTS已经在实际工作，只是参数不匹配
   
3. **架构设计合理性验证**（无问题）
   - server.js处理第三方API代理符合分层架构原则
   - 当前架构设计在技术上是合理的

**✅ 功能完整性检查**：
- **前端实现**：Vue组件、Store管理、API调用逻辑 - 100%完整
- **后端集成**：Gemini 1.5 Flash API、Google Text-to-Speech API - 100%集成
- **UI/UX**：加载状态、错误处理、用户反馈 - 完善设计

**🔧 修复策略建议**：
1. **立即修复**：server.js参数格式适配（预计15分钟）
2. **清理冗余**：移除public.js中的模拟AI路由（预计5分钟）
3. **测试验证**：端到端功能测试（预计10分钟）

**📊 影响评估**：
- **用户影响**：当前AI功能完全不可用，修复后立即恢复
- **技术债务**：无新增技术债务，实际上是清理现有混乱状态
- **维护成本**：修复后维护成本显著降低，架构更清晰

#### - [x] 任务A.2：AI接口连接问题诊断修复
- **核心思想**: 修复A.1调研发现的参数格式不匹配问题，使前端发送的{poem, title}格式能被server.js正确接收和处理，确保Gemini API和Google TTS API调用成功
- 交付物：
  - 修复后的server.js AI接口参数处理逻辑
  - 清理public.js中的冗余AI路由代码
  - 端到端功能验证测试结果
- 验收标准：
  - 解诗功能：前端点击解诗按钮能成功调用Gemini API并显示解读结果
  - 读诗功能：前端点击读诗按钮能成功调用Google TTS API并播放音频
  - 错误处理：API调用失败时显示用户友好的错误信息
  - 参数传递：前端{poem, title}格式被后端正确接收和处理
- **风险评估**: 低风险 - 仅修改参数处理逻辑，不涉及API密钥或核心架构变更
- 预期改动文件（预判）：
  - `lugarden_universal/application/server.js` - 修改/api/interpret和/api/listen的参数处理
  - `lugarden_universal/application/src/routes/public.js` - 移除冗余AI路由
- 实际改动文件:
  - `lugarden_universal/application/server.js`
  - `lugarden_universal/application/src/routes/public.js`
- 完成状态：✅ 已完成
- 执行步骤：
   - [x] 步骤A.2.1：修改server.js中/api/interpret端点，接收{poem, title}并构建prompt ✅
   - [x] 步骤A.2.2：修改server.js中/api/listen端点，接收{poem, title}并提取text内容 ✅
   - [x] 步骤A.2.3：清理public.js中的模拟AI路由，避免路由冲突和混淆 ✅
   - [x] 步骤A.2.4：测试前端解诗功能，验证Gemini API调用成功 ✅
   - [x] 步骤A.2.5：测试前端读诗功能，验证Google TTS API调用成功 ✅
   - [x] 步骤A.2.6：验证错误处理机制，确保API异常时用户体验良好 ✅

#### - [ ] 任务A.3：AI API调用现代化重构 - 集成官方SDK并增强Prompt
- **核心思想**: 彻底重构AI解诗的API调用，以完全符合Google官方最佳实践。这包括：1) 迁移到官方的`@google/generative-ai` SDK；2) 实施明确的`safetySettings`和`generationConfig`以确保调用的可靠性；3) 将用户选择的上下文(`meaning`)融入Prompt，实现体验的质变。
- 交付物：
  - `package.json` 更新，包含`@google/generative-ai`依赖。
  - `server.js` 被重构，使用新的SDK来处理`/api/interpret`请求。
  - 一个全新的、包含用户上下文、安全配置和生成配置的API调用逻辑。
- 验收标准：
  - `/api/interpret`的实现不再直接使用`node-fetch`。
  - 对Gemini的API调用中，明确包含了`safetySettings`和`generationConfig`参数。
  - 后端逻辑能根据前端传递的`combination`参数，正确查询到`meaning`并构建增强型Prompt。
  - AI解诗功能经过端到-端测试，稳定、可靠、可用。
- **风险评估**: **高风险** - 涉及引入新依赖、修改核心API、变更前后端契约，需要极其谨慎的实现和充分的测试。
- 预期改动文件（预判）：
  - `lugarden_universal/application/package.json`
  - `lugarden_universal/application/server.js`
  - `lugarden_universal/frontend_vue/src/services/enhancedApi.ts`
  - `lugarden_universal/frontend_vue/src/stores/zhou.ts`
  - `lugarden_universal/application/.env`
  - `lugarden_universal/application/.env.local`
- 实际改动文件: 
  - `lugarden_universal/application/package.json`
  - `lugarden_universal/application/server.js`
  - `lugarden_universal/frontend_vue/src/services/enhancedApi.ts`
  - `lugarden_universal/frontend_vue/src/stores/zhou.ts`
  - `lugarden_universal/application/.env`
  - `lugarden_universal/application/.env.local`
- 完成状态：✅ 已完成
- 执行步骤：
  - [x] 步骤A.3.1：**依赖集成 (SDK)** - 在`application`目录下，执行`npm install @google/generative-ai`并验证`package.json`更新。 ✅
  - [x] 步骤A.3.2：**前端契约改造** - 识别前端调用AI接口的组件，修改其API调用逻辑，增加传递用户的`combination`字符串。 ✅
  - [x] 步骤A.3.3：**后端接口重构 (SDK)** - 在`server.js`中，引入`@google/generative-ai` SDK，并使用SDK重写`/api/interpret`的基础逻辑。 ✅
  - [x] 步骤A.3.4：**安全与生成配置集成** - 在使用SDK发起请求时，明确配置`safetySettings`和`generationConfig`参数。 ✅
  - [x] 步骤A.3.5：**上下文逻辑实现 (Prompt)** - 在`/api/interpret`的新逻辑中，接收前端传来的`combination`，查询数据库获取`meaning`，并构建最终的增强型Prompt。 ✅
  - [x] 步骤A.3.6：**端到端完整性测试** - 启动前后端服务，完整验证从用户在前端做出选择，到看到包含个性化上下文的AI解读的全过程。 ✅

#### - [ ] 任务A.4：AI诗人“陆家明”灵魂重塑 - 聚焦用户特质的诗意解读
- **核心思想**: 彻底转变AI解诗功能的定位，从标准的诗歌分析转变为“以诗为镜，映照用户灵魂”。AI（陆家明）的核心任务不再是解读诗，而是通过诗来回应和剖析用户的个人特质(`contextText`)，提供更具共鸣和启发性的个性化反馈。
- 交付物：
  - `server.js` 中一个全新的、以用户为中心的增强型Prompt。
  - `server.js` 中一套经过优化的、旨在激发AI创造力和诗意的生成参数（`temperature`, `topP`, `maxOutputTokens`）。
  - 一个输出更凝练、更富诗意、严格遵守格式和长度限制的AI解诗功能。
- 验收标准：
  - AI的解读文本严格聚焦于用户特质，诗歌仅作为解读的媒介和工具。
  - 输出的语言风格凝练、富有象征性，接近诗人而非学者。
  - 输出内容严格为纯文本，不包含任何Markdown格式（如`**`）。
  - 输出长度被有效控制在200字以内，避免冗长。
  - `generationConfig` 中的 `topK` 参数被移除，`topP` 和 `temperature` 被设定在能激发创造力的值。
- **风险评估**: 中风险 - 涉及对AI生成内容的核心逻辑进行重塑，需要通过实际测试来反复调试Prompt和参数，以达到理想的艺术效果。
- 预期改动文件（预判）：
  - `lugarden_universal/application/server.js`
- 实际改动文件: [待记录]
- 完成状态：🔄 进行中
- 执行步骤：
  - [ ] 步骤A.4.1：**重塑Prompt** - 在`server.js`中，根据新的核心思想，实现一个全新的、以用户特质为绝对核心的Prompt。
  - [ ] 步骤A.4.2：**优化参数** - 调整`generationConfig`，移除`topK`，设置合适的`topP`、`temperature`和`maxOutputTokens`，以解放AI的创造力并控制输出。
  - [ ] 步骤A.4.3：**测试与微调** - 反复测试新的Prompt和参数组合，观察“陆家明”的输出，并对其语言风格、内容焦点和格式进行微调，直至满足验收标准。

---

## 测试与验收
- **阶段A**: 
  - AI功能问题全面识别和修复完成
  - 所有AI模块恢复正常运行状态
  - 用户体验达到预期标准
  - 服务稳定性和可靠性得到保障

## 更新日志关联
- **预计更新类型**: [功能修复/问题解决]
- **更新目录**: `documentation/changelog/2025-08-24_周与春秋AI功能修复完成/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [ ] AI服务连接恢复正常
  - [ ] AI解读功能完整可用
  - [ ] AI问答系统交互流畅
  - [ ] 服务稳定性达标

## 注意事项
- 每完成一个任务都要测试功能
- 如果出现问题立即回滚
- 保持Git提交记录清晰（原子提交、提交信息规范、功能分支）
- 确保与现有UI/UX设计的兼容性

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/2025-08-24_周与春秋AI功能修复完成/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 更新 `当前进展.md` 文件
- [ ] 提交所有更改到Git
- [ ] 更新项目状态

## 当前状态
🔄 进行中

**已完成任务**:
- ✅ A.1: AI功能现状调研与问题识别 - 核心问题已识别，修复策略已制定
- ✅ A.2: AI接口连接问题诊断修复 - 正在执行参数格式修复
- ✅ A.3: AI API调用现代化重构 - 集成官方SDK并增强Prompt - 已完成
- 🔄 A.4: AI诗人“陆家明”灵魂重塑 - 聚焦用户特质的诗意解读 - 进行中

**下一步任务**:
- 🔄 A.3: AI API调用现代化重构 - 集成官方SDK并增强Prompt

---
*本TODO基于陆家花园项目Git开发指南创建，专注于AI功能修复和用户体验恢复*