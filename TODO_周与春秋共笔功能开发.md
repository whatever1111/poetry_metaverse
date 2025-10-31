# 周与春秋"共笔"功能开发 TODO

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标

在周与春秋宇宙的诗歌展示页增加"共笔"功能，允许用户输入50字以内的感受，然后调用陆家明AI诗人（Dify工作流）为用户创作一首回应诗歌，并通过Vue3响应式特性流畅展示。

**业务价值**：
- 从"被动阅读"升级为"主动共创"，提升用户参与感
- 建立用户与AI诗人的情感连接
- 实现陆家明AI诗人与陆家花园主平台的首次功能整合
- 为后续深度整合（阶段三）奠定技术基础

**技术意义**：
- 验证Dify API在生产环境的调用流程
- 建立前后端完整的AI功能集成范式
- 探索结构化输出的解析和展示方案
- **采用无状态架构**：仅读取数据库，无写入操作，零数据安全风险
- 利用Vue3响应式特性实现流畅的用户体验

## 范围与约束

**范围内**：
- ✅ 在诗歌展示页（/result）增加"共笔"按钮
- ✅ 创建共笔输入界面（50字限制）
- ✅ 后端API调用Dify工作流
- ✅ 响应式展示陆家明生成的诗歌
- ✅ 基础的复制、分享、下载功能

**范围外**：
- ❌ 数据库保存（无用户系统，避免数据库写入风险）
- ❌ 历史记录查看（依赖数据持久化）
- ❌ 多轮对话功能（本次只支持单次共笔）
- ❌ 用户登录系统（后续功能）
- ❌ 评价和收藏功能（后续功能）

**技术约束**：
- Dify API超时时间：30秒（如超时需要友好提示）
- 用户输入字数限制：50字
- 前端技术栈：Vue3 + TypeScript + UnoCSS
- 后端技术栈：Express.js + Prisma ORM（仅读取）
- 数据流转：请求-响应模式，无中间暂存

## 任务列表

> **任务编号规范**
> - 阶段11-01_A：后端API开发
> - 阶段11-01_B：前端功能开发
> - 阶段11-01_C：测试与优化

---

### **阶段11-01_A：后端API开发**

#### - [ ] 任务A.1：实现后端API - /api/zhou/gongbi
- **核心思想**: 建立陆家花园主平台与Dify AI诗人的桥接API，负责数据查询、API调用和结果解析，采用无状态的请求-响应模式
- 交付物：
  - POST `/api/zhou/gongbi` API端点
  - Dify API调用逻辑
  - 诗歌解析函数
  - 错误处理机制
- 验收标准：
  - 成功接收前端请求（chapterKey, answerPattern, poemTitle, userFeeling）
  - 正确从数据库**读取**用户原型和诗歌数据（ZhouMapping + ZhouPoem）
  - 成功调用Dify API并获取响应
  - 正确解析Dify返回的结构化诗歌（基于1031版本的structured_output）
  - 返回标准JSON响应格式：`{ success: true, poem: {...} }`
  - 完整的错误处理（数据库错误、Dify API错误、超时错误）
  - **无数据库写入操作**
- **风险评估**: 低风险
  - 仅读取数据库，无写入风险
  - 主要风险：Dify API不稳定或超时
  - 缓解措施：30秒超时控制 + 友好错误提示
- 预期改动文件（预判）：
  - `lugarden_universal/application/server.js`
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤A.1.1：在server.js中创建POST `/api/zhou/gongbi`路由
   - [ ] 步骤A.1.2：实现数据库**读取**逻辑（ZhouMapping + ZhouPoem）
   - [ ] 步骤A.1.3：实现Dify Prompt构建逻辑（整合用户原型+诗歌+感受）
   - [ ] 步骤A.1.4：实现Dify API调用（含30秒超时控制）
   - [ ] 步骤A.1.5：实现诗歌解析函数（从answer字段提取结构化内容）
   - [ ] 步骤A.1.6：实现完整的错误处理和日志记录
   - [ ] 步骤A.1.7：添加环境变量验证（DIFY_API_KEY）

#### - [ ] 任务A.2：配置环境变量
- **核心思想**: 安全地配置Dify API密钥，避免泄露到版本控制
- 交付物：
  - 更新 `.env.local` 文件（本地开发）
  - 生产环境配置说明文档
- 验收标准：
  - DIFY_API_KEY正确配置
  - 后端能够成功读取环境变量
  - .env.local不被提交到Git
- **风险评估**: 零风险
- 预期改动文件（预判）：
  - `lugarden_universal/application/.env.local` (不提交)
  - `lugarden_universal/application/.env` (仅添加注释)
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤A.2.1：在.env中添加DIFY_API_KEY的注释说明
   - [ ] 步骤A.2.2：在.env.local中配置实际的API密钥
   - [ ] 步骤A.2.3：在server.js启动时验证环境变量存在

---

### **阶段11-01_B：前端功能开发**

#### - [ ] 任务B.1：在诗歌展示页添加"共笔"按钮
- **核心思想**: 为用户提供进入共笔功能的入口，与现有按钮视觉统一
- 交付物：
  - 在ResultView.vue中添加"共笔"按钮
  - 按钮样式与现有按钮保持一致
- 验收标准：
  - 按钮显示在正确位置（与"解诗"、"最好不要点"、"重新开始"同一行）
  - 点击按钮能触发路由跳转到 `/gongbi`
  - 按钮样式符合设计规范（UnoCSS类）
- **风险评估**: 零风险
- 预期改动文件（预判）：
  - `lugarden_universal/frontend_vue/src/modules/zhou/views/ResultView.vue`
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤B.1.1：在ResultView.vue的按钮区添加"共笔"按钮
   - [ ] 步骤B.1.2：绑定点击事件，跳转到/gongbi路由
   - [ ] 步骤B.1.3：调整按钮布局确保视觉协调

#### - [ ] 任务B.2：创建共笔输入界面（GongBiView.vue）
- **核心思想**: 创建用户友好的响应式界面，利用Vue3的reactive特性实现流畅的状态切换和诗歌展示
- 交付物：
  - `modules/zhou/views/GongBiView.vue` 主视图
  - 三个响应式步骤：输入、生成中、结果展示（自动切换）
- 验收标准：
  - 正确显示用户刚读到的诗歌（标题、引文、正文可折叠）
  - 输入框限制50字，实时显示剩余字数
  - "取消"按钮返回上一页
  - "让陆家明为我写诗"按钮状态管理正确（空输入时禁用）
  - 生成中显示加载动画和友好文案
  - **响应式诗歌卡片**：API响应后自动淡入显示，带流畅动画
  - 状态切换流畅，无闪烁
  - "再写一首"按钮可重置状态
- **风险评估**: 低风险（常规Vue组件开发）
- 预期改动文件（预判）：
  - `lugarden_universal/frontend_vue/src/modules/zhou/views/GongBiView.vue` (新建)
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤B.2.1：创建GongBiView.vue文件，定义组件基础结构和响应式状态
   - [ ] 步骤B.2.2：实现"输入步骤"UI（诗歌预览、输入框、字数统计）
   - [ ] 步骤B.2.3：实现"生成中步骤"UI（加载动画、提示文案）
   - [ ] 步骤B.2.4：实现"结果步骤"UI（响应式诗歌卡片、淡入动画）
   - [ ] 步骤B.2.5：实现响应式状态管理和自动切换逻辑（v-if）
   - [ ] 步骤B.2.6：实现"再写一首"功能（重置状态）
   - [ ] 步骤B.2.7：添加响应式样式（移动端适配、毛玻璃效果）

#### - [ ] 任务B.3：创建API服务层（gongBiApi.ts）
- **核心思想**: 封装后端API调用逻辑，提供清晰的类型定义
- 交付物：
  - `modules/zhou/services/gongBiApi.ts` 服务文件
  - TypeScript接口定义
- 验收标准：
  - gongBiApi.create()方法正确发送POST请求
  - 完整的TypeScript类型定义
  - 正确的错误处理
  - 返回标准化的响应格式
- **风险评估**: 零风险
- 预期改动文件（预判）：
  - `lugarden_universal/frontend_vue/src/modules/zhou/services/gongBiApi.ts` (新建)
  - `lugarden_universal/frontend_vue/src/modules/zhou/types/index.ts` (扩展)
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤B.3.1：创建gongBiApi.ts文件
   - [ ] 步骤B.3.2：定义请求和响应的TypeScript接口
   - [ ] 步骤B.3.3：实现create()方法（调用/api/zhou/gongbi）
   - [ ] 步骤B.3.4：实现错误处理和超时提示
   - [ ] 步骤B.3.5：从模块index.ts导出

#### - [ ] 任务B.4：创建诗歌展示组件（GongBiPoemCard.vue）
- **核心思想**: 复用现有的诗歌卡片设计，展示AI生成的诗歌
- 交付物：
  - `modules/zhou/components/GongBiPoemCard.vue` 组件
  - 完整的操作功能（复制、分享、下载）
- 验收标准：
  - 诗歌标题、引文、正文格式正确显示
  - 复制功能正常（使用Clipboard API）
  - 分享功能正常（Web Share API + 降级方案）
  - 下载功能正常（生成TXT文件）
  - 样式与现有诗歌卡片统一
- **风险评估**: 零风险（复用现有模式）
- 预期改动文件（预判）：
  - `lugarden_universal/frontend_vue/src/modules/zhou/components/GongBiPoemCard.vue` (新建)
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤B.4.1：创建GongBiPoemCard.vue组件
   - [ ] 步骤B.4.2：定义Props接口（poem对象）
   - [ ] 步骤B.4.3：实现诗歌内容渲染
   - [ ] 步骤B.4.4：实现复制功能（navigator.clipboard）
   - [ ] 步骤B.4.5：实现分享功能（navigator.share + 降级）
   - [ ] 步骤B.4.6：实现下载功能（Blob + URL.createObjectURL）
   - [ ] 步骤B.4.7：应用统一的毛玻璃卡片样式

#### - [ ] 任务B.5：配置路由
- **核心思想**: 注册/gongbi路由，确保只有完成问答后才能访问
- 交付物：
  - 在router/index.ts中配置路由
  - 路由守卫（可选）
- 验收标准：
  - /gongbi路由正确加载GongBiView组件
  - URL显示正确
  - 路由跳转流畅
- **风险评估**: 零风险
- 预期改动文件（预判）：
  - `lugarden_universal/frontend_vue/src/core/router/index.ts`
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤B.5.1：在router/index.ts中添加/gongbi路由配置
   - [ ] 步骤B.5.2：配置路由meta信息（requiresQuizData: true）
   - [ ] 步骤B.5.3：测试路由跳转

---

### **阶段11-01_C：测试与优化**

#### - [ ] 任务C.1：端到端功能测试
- **核心思想**: 验证完整的用户流程，从问答到共笔到诗歌展示
- 交付物：
  - 测试报告文档
  - Bug修复记录
- 验收标准：
  - 完整流程可用：问答 → 诗歌展示 → 点击共笔 → 输入感受 → 生成诗歌 → 查看/操作
  - 所有边界情况正常处理（空输入、超时、API错误）
  - 移动端和桌面端体验良好
  - 无console错误
- **风险评估**: 低风险
- 预期改动文件（预判）：
  - 可能需要修复的各个文件
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤C.1.1：测试完整流程（观我生、雨木冰、是折枝各一次）
   - [ ] 步骤C.1.2：测试边界情况（空输入、超长输入、特殊字符）
   - [ ] 步骤C.1.3：测试错误情况（网络错误、API错误、超时）
   - [ ] 步骤C.1.4：测试移动端响应式
   - [ ] 步骤C.1.5：测试各个操作按钮（复制、分享、下载）
   - [ ] 步骤C.1.6：修复发现的问题

#### - [ ] 任务C.2：性能优化
- **核心思想**: 优化加载速度和用户体验，特别是Dify API调用的等待体验
- 交付物：
  - 优化后的代码
  - 性能测试记录
- 验收标准：
  - 页面加载时间 < 1秒
  - API调用有清晰的进度提示
  - 无不必要的重复渲染
  - 图片/资源正确加载
- **风险评估**: 零风险
- 预期改动文件（预判）：
  - 可能需要优化的组件和API文件
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤C.2.1：检查组件是否有不必要的重复渲染
   - [ ] 步骤C.2.2：优化API调用的等待体验（进度文案、动画）
   - [ ] 步骤C.2.3：检查TypeScript类型是否完整
   - [ ] 步骤C.2.4：检查是否有memory leak
   - [ ] 步骤C.2.5：测试在慢速网络下的体验

#### - [ ] 任务C.3：代码质量检查
- **核心思想**: 确保代码符合项目规范，易于维护
- 交付物：
  - Lint检查通过
  - TypeScript类型检查通过
  - 代码审查记录
- 验收标准：
  - ESLint检查0错误
  - TypeScript编译0错误
  - 代码符合Vue3 Composition API规范
  - 样式使用UnoCSS工具类
  - 命名符合项目规范
- **风险评估**: 零风险
- 预期改动文件（预判）：
  - 需要调整的代码文件
- 实际改动文件: 
- 完成状态：🔄 待开始
- 执行步骤：
   - [ ] 步骤C.3.1：运行ESLint检查所有新增文件
   - [ ] 步骤C.3.2：运行TypeScript类型检查
   - [ ] 步骤C.3.3：检查是否使用了any类型（应避免）
   - [ ] 步骤C.3.4：检查文件和变量命名是否符合规范
   - [ ] 步骤C.3.5：检查是否有冗余代码或注释
   - [ ] 步骤C.3.6：修复所有发现的问题

---

## 测试与验收

### 功能测试清单
- [ ] **完整流程测试**
  - [ ] 观我生：完成问答 → 看到诗歌 → 点击共笔 → 输入感受 → 生成诗歌 → 查看
  - [ ] 雨，木冰：完整流程
  - [ ] 是折枝：完整流程
  
- [ ] **输入验证测试**
  - [ ] 空输入：按钮禁用
  - [ ] 50字以内：正常提交
  - [ ] 超过50字：无法输入
  - [ ] 特殊字符：正常处理
  
- [ ] **API调用测试**
  - [ ] 正常响应：30秒内返回诗歌
  - [ ] 超时处理：显示友好提示
  - [ ] 网络错误：显示错误信息
  - [ ] Dify API错误：显示错误信息
  - [ ] 数据库读取：正确获取用户原型和诗歌数据
  
- [ ] **响应式诗歌展示测试**
  - [ ] 标题正确显示
  - [ ] 引文正确显示
  - [ ] 正文正确显示（分行）
  - [ ] 样式美观（毛玻璃卡片）
  - [ ] 淡入动画流畅（从loading到结果）
  - [ ] 状态切换无闪烁
  
- [ ] **操作功能测试**
  - [ ] 复制：成功复制完整诗歌
  - [ ] 分享：Web Share API正常
  - [ ] 下载：成功下载TXT文件
  - [ ] 再写一首：重置状态，回到输入界面
  - [ ] 取消：返回上一页
  
- [ ] **响应式布局测试**
  - [ ] 桌面端：1920x1080
  - [ ] 平板端：768x1024
  - [ ] 移动端：375x667
  
- [ ] **用户体验测试**
  - [ ] 刷新页面：数据消失（预期行为）
  - [ ] 返回后再进入：可以重新共笔（无状态残留）
  - [ ] 多次共笔：每次都能正常生成新诗

### 性能验收标准
- 页面初次加载：< 1秒
- 诗歌生成时间：< 30秒
- 数据库查询：< 100ms
- 前端渲染：< 500ms

### 代码质量验收
- ESLint：0 errors, 0 warnings
- TypeScript：0 errors
- 代码覆盖率：核心逻辑100%测试
- 文档完整性：所有公共函数有注释

## 更新日志关联

- **预计更新类型**: 功能更新
- **更新目录**: `documentation/changelog/2025-11-01_周与春秋共笔功能开发/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [ ] 完整用户流程验证（3个篇章各测试1次）
  - [ ] 响应式诗歌展示验证（淡入动画、状态切换）
  - [ ] 边界情况和错误处理验证
  - [ ] 移动端响应式验证
  - [ ] 代码质量验证（Lint + TypeScript）
  - [ ] Dify API集成验证（请求-响应模式）

## 注意事项

- **开发顺序**：严格按照A→B→C顺序执行，后端完成并测试后再开始前端
- **Git提交规范**：
  - 后端API：`feat(api): 实现周与春秋共笔API /api/zhou/gongbi`
  - 前端功能：`feat(zhou): 实现共笔功能完整UI流程`
  - 响应式优化：`feat(zhou): 优化共笔诗歌展示动画效果`
  - Bug修复：`fix(gongbi): 修复XXX问题`
- **环境变量安全**：确保DIFY_API_KEY永远不被提交到Git
- **错误处理**：所有可能失败的操作都要有友好的用户提示
- **数据安全**：
  - ✅ 仅读取数据库，无写入操作
  - ✅ 无状态API设计，服务器重启无影响
  - ✅ 无需处理数据持久化和用户认证
- **Dify API调用**：
  - 使用最新的工作流（陆家明的周与春秋练习-1031.yml）
  - response_mode必须是"blocking"（阻塞式同步响应）
  - 超时时间设置为30秒
  - 失败时记录详细日志便于排查
- **响应式设计**：
  - 利用Vue3的reactive特性实现流畅状态切换
  - 淡入动画使用CSS transitions（0.6s ease-in）
  - v-if条件渲染确保性能
- **测试数据**：使用真实的用户输入测试，避免使用"测试"等无意义输入
- **TypeScript严格模式**：避免使用any类型，所有接口必须完整定义

## 完成后的操作

- [ ] 创建更新目录：`documentation/changelog/2025-11-01_周与春秋共笔功能开发/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 更新 `当前进展.md` 文件，添加共笔功能完成记录
- [ ] 提交所有更改到Git（使用规范的commit message）
- [ ] 在生产环境验证功能正常
- [ ] 更新项目README（如需要）

## 当前状态
🔄 待开始

---

*本文档基于陆家花园项目开发规范创建*  
*创建日期：2025-10-31*  
*最后更新：2025-10-31*

## 技术参考

### Dify API调用示例（Node.js后端）
```javascript
// 阻塞式同步调用
const response = await fetch('https://api.dify.ai/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {},
    query: `用户今天在lugarden.space上，完成了一系列问答，问答呈现了ta是一个${userProfile}的人。
            ta读到了这首诗：
            《${poemTitle}》
            ${poemContent}
            
            ta的感受是：${userFeeling}
            
            请为ta创作一首回应诗。`,
    response_mode: 'blocking',  // 关键：阻塞式
    conversation_id: '',
    user: `gongbi_${Date.now()}`
  }),
  signal: AbortSignal.timeout(30000) // 30秒超时
});

const data = await response.json();
```

### Dify响应格式（1031版本结构化输出）

**answer字段格式**（G1转换后）：
```
标题

引文
——出处

正文
```

**完整响应结构**：
```json
{
  "answer": "寻找海的孤独者\n\n海上生明月，天涯共此时\n——《张九龄·望月怀远》\n\n你说孤独而自由\n就像海面上唯一的帆\n...",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "metadata": {
    "usage": {
      "total_tokens": 1000
    }
  }
}
```

### 前端响应式状态示例（Vue3）
```typescript
// 响应式状态
const loading = ref(false)
const generatedPoem = ref<GeneratedPoem | null>(null)

// API调用后自动触发重新渲染
async function handleSubmit() {
  loading.value = true
  const response = await gongBiApi.create({...})
  generatedPoem.value = response.poem  // ← 赋值后UI自动更新
  loading.value = false
}
```

```vue
<!-- 模板中的条件渲染 -->
<template>
  <div v-if="!loading && !generatedPoem">输入界面</div>
  <div v-if="loading">加载中...</div>
  <GongBiPoemCard v-if="generatedPoem && !loading" :poem="generatedPoem" />
</template>
```

### 诗歌解析函数示例
```javascript
function parseDifyPoem(answer) {
  // answer格式："标题\n\n引文\n——出处\n\n正文"
  const sections = answer.split('\n\n');
  
  return {
    title: sections[0].trim(),
    quote: sections[1].split('\n')[0].trim(),
    quoteSource: sections[1].split('——')[1].trim(),
    content: sections.slice(2).join('\n\n').trim()
  };
}
```

