# 交互体验现代化 UI增强延续 TODO

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
基于2025-08-24完成的B阶段技术成果，探索和实现新的交互功能。在已建立的现代UX设计原则、UnoCSS架构和统一组件标准基础上，增加探索性的交互功能，提升用户体验的丰富性和现代感。采用敏捷探索方式，实验性地引入新的交互模式和用户体验元素。

## 范围与约束
- **范围**: 基于B阶段建立的技术标准，探索和实现新的交互功能和用户体验元素
- **约束**:
  - 必须基于已完成的UnoCSS架构和B阶段设计原则，确保技术连贯性
  - 遵循已建立的现代UX标准（44px触摸目标、统一布局模式、视觉层次对比）
  - 采用探索性开发方式，实验新的交互模式和功能
  - 保持与B阶段建立的设计风格一致性，同时允许创新性扩展
- **核心原则**: 在稳固的技术基础上探索创新交互功能，提升用户体验的现代感和吸引力

## 任务列表

> **任务编号规范**
> - 建议按阶段组织任务，使用2025-08-24_C、2025-08-24_D、2025-08-24_E等标识阶段
> - 阶段2025-08-24_C使用前缀"C"：任务C.1、任务C.2 …；步骤使用"C.1.x"的三级编号
> - 阶段2025-08-24_D使用前缀"D"：任务D.1、任务D.2 …；步骤使用"D.1.x"
> - 阶段2025-08-24_E使用前缀"E"：任务E.1、任务E.2 …；步骤使用"E.1.x"
> - 注意，上述阶段标识，都是指在当前TODO列表中的阶段，而非其他。

---

### **阶段2025-08-24_C：探索性交互功能实现**

#### 🎯 **C阶段核心目标**
基于阶段2025-08-24_B建立的稳固技术基础（现代UX原则、UnoCSS架构、统一组件标准），探索和实现新的交互功能，提升用户体验的现代感和吸引力。采用实验性开发方式，在保持技术连贯性的基础上引入创新性的交互元素。

#### - [x] 任务C.1：PoemViewer诗歌操作按钮现代化 - 复制/分享/下载按钮UnoCSS化与组件化重构
- **核心思想**: 将阶段2025-08-21_D遗留的传统CSS按钮现代化，使其符合阶段2025-08-24_B建立的UnoCSS优先策略和组件化标准。在保持优秀功能实现的前提下，提升技术实现的现代化程度和可维护性
- **技术背景**: 
  - 阶段2025-08-21_D引入的复制、分享、下载按钮功能现代但实现传统
  - 违反阶段2025-08-24_B.4确立的UnoCSS优先策略，使用传统CSS定义
  - 未采用组件化设计，与阶段2025-08-24_B建立的`btn-primary`等统一按钮标准不一致
- **探索目标**:
  - 探索如何在保持复杂功能逻辑的前提下实现技术栈现代化
  - 实验阶段2025-08-24_B技术标准在功能性按钮上的应用效果
  - 建立可复用的操作按钮组件模式，为后续功能扩展奠定基础
- 交付物：
  - 现代化的PoemViewer组件（UnoCSS化的操作按钮）
  - 新的ActionButtonGroup组件（可复用的操作按钮组）
  - 更新的UnoCSS配置（操作按钮相关shortcuts）
  - 技术实现文档更新
- 验收标准：
  - 操作按钮完全采用UnoCSS实现，移除所有传统CSS定义
  - 按钮视觉效果与阶段2025-08-24_B标准一致（44px触摸目标、统一动画、嵌入vs悬浮阴影）
  - 保持100%功能兼容：复制、分享、下载功能完全不变
  - 创建可复用的ActionButtonGroup组件，支持灵活配置
  - 响应式设计和无障碍访问保持不变
  - 所有动画效果符合阶段2025-08-24_B.3建立的动画标准
- **风险评估**: 中等风险 - 涉及复杂状态管理和多种API兼容性，需谨慎处理功能完整性
- 预期改动文件（预判）：
  - `lugarden_universal/frontend_vue/uno.config.ts` - 新增操作按钮shortcuts
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 按钮UnoCSS化
  - `lugarden_universal/frontend_vue/src/components/ActionButtonGroup.vue` - 新建可复用组件
  - `frontend-terminology-vue-enhanced.md` - 术语映射更新
- 实际改动文件: 
  - `lugarden_universal/frontend_vue/uno.config.ts` - 新增btn-action系列shortcuts
  - `lugarden_universal/frontend_vue/src/components/ActionButtonGroup.vue` - 新建可复用操作按钮组件
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 集成ActionButtonGroup，移除传统CSS
  - `frontend-terminology-vue-enhanced.md` - 新增C.1操作按钮组件化模式术语映射
- 完成状态：✅ 已完成
- 执行步骤：
   - [x] 步骤C.1.1：分析现有按钮实现，识别状态管理和样式定义的分离点
   - [x] 步骤C.1.2：设计UnoCSS shortcuts，确保与B阶段按钮标准兼容
   - [x] 步骤C.1.3：创建ActionButtonGroup组件，抽象可复用的按钮组逻辑
   - [x] 步骤C.1.4：重构PoemViewer，集成新的按钮组件并移除传统CSS
   - [x] 步骤C.1.5：验证功能完整性，确保复制、分享、下载功能正常
   - [x] 步骤C.1.6：更新响应式设计，确保移动端兼容性
   - [x] 步骤C.1.7：完善动画效果，符合B.3建立的动画标准
   - [x] 步骤C.1.8：更新技术文档，记录新的组件化模式

#### - [x] 任务C.2：按钮组件架构统一 - ControlButtons现代化重构与命名规范化
- **核心思想**: 基于主流前端开发实践，统一按钮组件架构和命名规范。将ActionButtons.vue现代化为UnoCSS实现，并按功能特征重命名组件，消除技术债务，建立一致的按钮组件生态系统
- **技术背景**: 
  - ActionButtons.vue使用传统CSS架构，违反阶段2025-08-24_B.4确立的UnoCSS优先策略
  - 当前命名ActionButtons/ActionButtonGroup过于泛化，缺乏功能特征识别
  - 存在两套CSS架构并存的技术债务，维护成本高且决策复杂
- **参考标准**: 
  - 主流UI库命名实践（Ant Design、Element UI的Button.Group、ControlPanel模式）
  - GitHub/GitLab的ContentActions、MediaControls命名规范
  - Vue生态ControlButtons、ContentActions标准模式
- **预期改动文件**: 
  - `lugarden_universal/frontend_vue/src/components/ActionButtons.vue` → `lugarden_universal/frontend_vue/src/components/ControlButtons.vue` -重构+重命名
  - `lugarden_universal/frontend_vue/src/components/ActionButtonGroup.vue` → `lugarden_universal/frontend_vue/src/components/ContentActions.vue` -重命名
  - `lugarden_universal/frontend_vue/uno.config.ts` -新增控制按钮相关UnoCSS shortcuts
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` -import路径更新
  - `lugarden_universal/frontend_vue/src/views/ResultScreen.vue` -import路径更新
  - `frontend-terminology-vue-enhanced.md` -更新组件映射和技术标准文档
- **实际改动文件**:
  -  `lugarden_universal/frontend_vue/src/components/ControlButtons.vue` -新建，147行纯UnoCSS重构实现
  -  `lugarden_universal/frontend_vue/src/components/ContentActions.vue` -从ActionButtonGroup.vue重命名
  -  `lugarden_universal/frontend_vue/uno.config.ts` -新增btn-control-*系列UnoCSS shortcuts
  -  `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` -更新import ActionButtonGroup→ContentActions
  -  `lugarden_universal/frontend_vue/src/views/ResultScreen.vue` -更新import ActionButtons→ControlButtons
  -  `frontend-terminology-vue-enhanced.md` -组件映射全面更新，新增C.2技术标准文档
  -  删除：`lugarden_universal/frontend_vue/src/components/ActionButtons.vue` -339行传统CSS文件已移除
- **执行步骤**:
  - [x] 步骤C.2.1：分析ActionButtons.vue的传统CSS实现和功能边界
  - [x] 步骤C.2.2：设计ControlButtons的UnoCSS shortcuts体系
  - [x] 步骤C.2.3：重构ActionButtons.vue为ControlButtons.vue，采用纯UnoCSS实现
  - [x] 步骤C.2.4：重命名ActionButtonGroup.vue为ContentActions.vue
  - [x] 步骤C.2.5：更新所有组件引用和import路径
  - [x] 步骤C.2.6：验证功能完整性，确保解读、播放、诗人、重启、继续功能正常
  - [x] 步骤C.2.7：更新技术文档，记录新的命名规范和架构标准
  - [x] 步骤C.2.8：完成回归测试，确保不破坏现有功能

#### - [x] 任务C.3：CSS架构债务清理 - 解决UnoCSS与传统CSS重复定义冲突
- **核心问题**: C.1/C.2任务完成后发现严重的CSS架构债务：多个组件的传统CSS定义未完全清理，导致UnoCSS shortcuts与传统CSS存在重复定义和样式优先级冲突，违反UnoCSS优先策略
- **技术症状**: 
  - `components.css`中仍存在`.btn-interpret, .btn-listen, .btn-poet, .btn-restart`传统CSS定义commit
  - `uno.config.ts`中已新增同名UnoCSS shortcuts，形成重复定义
  - `uno.css`的`@layer legacy-components`仍保护这些已迁移的按钮类
  - `ContentActions.vue`中存在完整的传统CSS响应式布局系统（`.action-group`及@media查询）
  - 可能导致样式不一致、构建冲突和维护困难
- **探索目标**:
  - 彻底清理C.1/C.2任务遗留的所有传统CSS定义
  - 完成ContentActions组件的UnoCSS化重构
  - 验证UnoCSS shortcuts的完整性和正确性
  - 确保样式一致性和构建稳定性
  - 建立清晰的CSS架构边界和迁移验证流程
- **预期改动文件**: 
  - `lugarden_universal/frontend_vue/src/assets/styles/components.css` -移除重复的按钮定义
  - `lugarden_universal/frontend_vue/src/assets/styles/uno.css` -更新layer保护配置
  - `lugarden_universal/frontend_vue/src/assets/styles/responsive.css` -清理相关响应式覆盖
  - `lugarden_universal/frontend_vue/src/components/ContentActions.vue` -移除传统CSS，改用UnoCSS布局
  - 验证文件：`lugarden_universal/frontend_vue/src/components/ControlButtons.vue`, `lugarden_universal/frontend_vue/uno.config.ts`
- **实际改动文件**:
  -  `lugarden_universal/frontend_vue/src/assets/styles/components.css` -移除重复的`.btn-interpret, .btn-listen, .btn-poet, .btn-restart`定义
  -  `lugarden_universal/frontend_vue/src/assets/styles/uno.css` -更新layer保护配置，仅保护未迁移的`.btn-continue`
  -  `lugarden_universal/frontend_vue/src/components/ContentActions.vue` -完全移除传统CSS（.action-group及响应式样式），改用纯UnoCSS布局
- **执行步骤**:
  - [x] 步骤C.3.1：审计和确认重复定义的具体范围
  - [x] 步骤C.3.2：从`components.css`中移除已迁移至UnoCSS的按钮定义
  - [x] 步骤C.3.3：更新`uno.css`的layer保护配置
  - [x] 步骤C.3.4：清理`responsive.css`中的相关覆盖样式（无需修改）
  - [x] 步骤C.3.5：完成ContentActions组件UnoCSS化，移除所有传统CSS
  - [x] 步骤C.3.6：构建测试验证样式一致性
  - [x] 步骤C.3.7：浏览器测试确认所有组件渲染正确

#### - [x] 任务C.4：ShareTools组件重构 - 分享工具按钮轻量化与命名规范化
- **核心思想**: 基于btn-primary封版设计为基准，将ContentActions组件重构为ShareTools组件，采用btn-share-tools轻量化设计。统一分享工具的命名规范（复制/分享/下载都是分享类功能），符合主流实践的辅助按钮设计，建立主要操作与分享工具的清晰层次关系
- **技术背景**: 
  - 当前btn-action设计(44px)比btn-primary(36px)还大，违反主流UI/UX视觉层次原则
  - 辅助功能按钮(复制/分享/下载)使用了与主要CTA相同甚至更重的视觉重量
  - 对标GitHub、Medium、CodePen等主流平台，辅助操作按钮普遍采用轻量化设计
- **设计基准**: 
  - **封版标准**: btn-primary(36px, font-semibold, 渐变背景) - 主要CTA操作，不做改动
  - **新目标**: btn-share-tools(28px, font-medium, 透明背景) - 分享工具，符合主流实践
- **命名规范统一**:
  - 组件层面: ContentActions.vue → ShareTools.vue (语义更精确)
  - 样式层面: btn-action → btn-share-tools (功能更明确)
  - 功能统一: 复制/分享/下载都是分享类工具，命名应体现一致性
- **主流实践对标**:
  - GitHub代码复制按钮: 24px高度，轻量图标设计
  - Medium文章分享: 28px高度，ghost样式，图标+文字
  - CodePen操作按钮: 20-24px高度，纯图标+tooltip
- **预期改动文件**:
  - `lugarden_universal/frontend_vue/uno.config.ts` - 新增btn-share-tools系列shortcuts，替换现有btn-action
  - `lugarden_universal/frontend_vue/src/components/ContentActions.vue` → `ShareTools.vue` - 组件重命名与样式更新
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 更新import路径和组件引用
  - `frontend-terminology-vue-enhanced.md` - 更新组件名称和术语映射
- **实际改动文件**:
  - `lugarden_universal/frontend_vue/uno.config.ts` - 新增btn-share-tools系列shortcuts，替换btn-action
  - `lugarden_universal/frontend_vue/src/components/ContentActions.vue` → `ShareTools.vue` - 组件重命名与轻量化重构
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 更新import和组件引用路径
  - `frontend-terminology-vue-enhanced.md` - 新增C.4轻量化设计原则和术语映射更新
- **执行步骤**:
  - [x] 步骤C.4.1：设计btn-share-tools的UnoCSS shortcuts定义(28px高度，透明背景，轻量设计)
  - [x] 步骤C.4.2：重命名ContentActions.vue为ShareTools.vue，统一分享工具命名规范
  - [x] 步骤C.4.3：更新uno.config.ts，新增btn-share-tools系列shortcuts，替换btn-action
  - [x] 步骤C.4.4：重构ShareTools.vue，应用新的轻量化按钮样式
  - [x] 步骤C.4.5：更新PoemViewer.vue中的import路径和组件引用
  - [x] 步骤C.4.6：优化移动端响应式设计(纯图标模式，更紧凑布局)
  - [x] 步骤C.4.7：验证视觉层次: btn-primary(36px) > btn-share-tools(28px)
  - [x] 步骤C.4.8：功能完整性测试，确保复制/分享/下载功能正常
  - [x] 步骤C.4.9：更新技术文档，记录命名规范统一和轻量化设计原则
- **验收标准**:
  - 组件重命名: ContentActions.vue → ShareTools.vue，命名规范统一
  - 样式重构: btn-action → btn-share-tools，语义更明确
  - 视觉层次: 分享工具按钮高度从44px减少到28px，建立正确的主次关系
  - 轻量设计: 采用透明背景+hover效果，符合主流辅助按钮实践
  - 功能兼容: 保持100%功能兼容性，复制/分享/下载功能不变
  - 响应式优化: 移动端图标识别度良好，布局更紧凑
  - 层次清晰: 与btn-primary形成明确的主要操作vs分享工具的视觉关系
- **风险评估**: 低风险 - 仅样式调整，功能逻辑不变

#### - [x] 任务C.5：SVG图标系统引入 - 现代化简约图标升级
- **核心思想**: 用Heroicons替换emoji图标，同时实现纯图标模式，去掉"图标+文字"冗余，建立极简现代化图标系统
- **技术背景**: 
  - 当前ShareTools使用"图标+文字"模式不够简约，需要改为纯图标模式
  - 发现多组件使用emoji: ShareTools(📋🔗💾), QuizScreen(💾), ErrorState(⚠️🔍), InterpretationDisplay(⚠️💭), EmptyState(📝), SubProjectSelection(📝)
  - emoji与项目极简风格不符，SVG图标更现代化专业
  - 纯图标+hover tooltip是主流极简交互模式
- **Heroicons选择理由**: 与UnoCSS同源，维护活跃，Vue3原生支持
- **图标映射方案**: 
  - 📋→DocumentDuplicateIcon, 🔗→ShareIcon, 💾→ArrowDownTrayIcon, ⚠️→ExclamationTriangleIcon, 🔍→MagnifyingGlassIcon, 💭→ChatBubbleLeftEllipsisIcon, 📝→PencilIcon, ✓→CheckIcon
- **预期改动文件**:
  - `lugarden_universal/frontend_vue/package.json` - 新增@heroicons/vue依赖
  - `lugarden_universal/frontend_vue/src/components/ShareTools.vue` - 替换📋🔗💾为SVG，去掉文字变成纯图标+title属性
  - `lugarden_universal/frontend_vue/src/views/QuizScreen.vue` - 替换💾
  - `lugarden_universal/frontend_vue/src/components/ErrorState.vue` - 替换⚠️🔍
  - `lugarden_universal/frontend_vue/src/components/InterpretationDisplay.vue` - 替换⚠️💭
  - `lugarden_universal/frontend_vue/src/components/EmptyState.vue` - 替换📝
  - `lugarden_universal/frontend_vue/src/views/SubProjectSelection.vue` - 替换📝
- **实际改动文件**:
  - `lugarden_universal/frontend_vue/package.json` - 新增@heroicons/vue依赖
  - `lugarden_universal/frontend_vue/uno.config.ts` - 更新btn-share-tools为32px正方形纯图标模式
  - `lugarden_universal/frontend_vue/src/components/ShareTools.vue` - emoji→SVG组件，"图标+文字"→纯图标+title
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 适配新的ShareTools接口
  - `lugarden_universal/frontend_vue/src/views/QuizScreen.vue` - 💾→ArrowDownTrayIcon
  - `lugarden_universal/frontend_vue/src/components/ErrorState.vue` - ⚠️🔍→ExclamationTriangleIcon/MagnifyingGlassIcon
  - `lugarden_universal/frontend_vue/src/components/InterpretationDisplay.vue` - ⚠️💭→ExclamationTriangleIcon/ChatBubbleLeftEllipsisIcon
  - `lugarden_universal/frontend_vue/src/components/EmptyState.vue` - 新增iconComponent支持，默认📝→PencilIcon
  - `lugarden_universal/frontend_vue/src/views/SubProjectSelection.vue` - 使用iconComponent prop传递PencilIcon
- **执行步骤**:
  - [x] 步骤C.5.1：安装@heroicons/vue依赖
  - [x] 步骤C.5.2：重构ShareTools.vue为纯图标模式(去掉文字，emoji→SVG，添加title属性)
  - [x] 步骤C.5.3：更新其他组件emoji→SVG图标替换
  - [x] 步骤C.5.4：统一图标尺寸规范(w-4 h-4适配32px按钮)
  - [x] 步骤C.5.5：验证hover tooltip和无障碍体验
  - [x] 步骤C.5.6：全项目构建验证和视觉一致性检查
- **验收标准**: ShareTools实现纯图标极简模式，全项目emoji完全替换为SVG，建立统一现代图标系统，功能无损

#### - [x] 任务C.6：ShareTools响应式体验完善与兼容性修复
- **核心思想**: 解决移动端ShareTools的视觉层次和功能兼容性问题，实现主流移动UI标准的轻量分享工具体验
- **技术背景**: 
  - 移动端ShareTools当前使用flex-col竖排，视觉占比过大且未居中，违反移动端辅助功能最小化原则
  - 分割线border-t视觉权重过高，产生喧宾夺主效应，干扰用户对内容的关注
  - 分享按钮disabled逻辑错误：当浏览器不支持Web Share API时被误禁用，但实际有完整降级方案
  - 需要对齐Instagram/Twitter等主流应用的移动端分享工具设计标准
- **问题识别**:
  1. 响应式布局问题：`max-sm:flex-col max-sm:gap-1 max-sm:items-stretch`导致移动端垂直排列不合理
  2. 视觉层次问题：`border-t border-primary-100 pt-6`分割线过于突出
  3. 功能兼容性问题：`disabled: isActionLoading.value || !canShare.value`错误逻辑导致降级失效
- **技术方案**:
  - 移动端保持水平布局，采用更紧凑的gap和居中对齐
  - 移除或弱化分割线，避免视觉干扰
  - 修复disabled逻辑，确保降级方案正常工作
- **预期改动文件**:
  - `lugarden_universal/frontend_vue/src/components/ShareTools.vue` - 响应式布局优化和分割线调整
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 修复分享按钮disabled逻辑
  - `lugarden_universal/frontend_vue/uno.config.ts` - 可能需要调整btn-share-tools响应式shortcuts
- **执行步骤**:
  - [x] 步骤C.6.1：分析移动端分享工具主流设计模式，确定最优布局方案
  - [x] 步骤C.6.2：优化ShareTools移动端响应式布局（水平居中，紧凑间距）
  - [x] 步骤C.6.3：处理分割线视觉层次问题（移除或弱化）
  - [x] 步骤C.6.4：修复PoemViewer分享按钮disabled逻辑，确保降级兼容性
  - [x] 步骤C.6.5：移动端真机测试验证（分享功能+视觉效果）
- **验收标准**: 移动端ShareTools视觉轻量化，分享功能全设备兼容，符合主流移动应用分享工具设计标准

#### - [x] **任务C.7**: 中国社交平台分享功能本土化实现 - Web Share API优先策略
- **技术背景**: 
  - 经过深度调研发现：Web Share API在支持的移动浏览器中，**微信/QQ/小红书等中国应用实际会出现在系统分享列表中**
  - 之前的设计错误假设了这些平台不支持Web Share API，导致过度复杂化
  - 系统原生分享面板比自定义UI更美观、更统一，用户体验更佳
  - 应优先使用原生分享，仅在不支持时提供轻量化补充方案
- **核心目标**: 
  - **优先策略**: 点击分享直接调用Web Share API，让用户在原生分享面板中选择微信/QQ/小红书等应用
  - **兜底策略**: 仅在Web Share API不支持时，提供轻量化的中国平台快捷复制功能
  - **界面原则**: 不破坏现有UI美观性，不引入复杂自定义模态框
  - **体验统一**: 保持与系统分享面板一致的用户体验
- **技术方案**:
  - **主流程（推荐）**: 直接调用Web Share API → 系统原生分享面板 → 用户选择微信/QQ/小红书等
  - **兜底流程**: Web Share API不支持时 → 显示轻量快捷复制选项（微信、QQ、微博、小红书）
  - **界面设计**: 兜底界面采用简洁下拉菜单，与ShareTools风格保持一致，避免模态框
  - **内容优化**: 为不同平台提供格式化的分享内容，但优先让用户在原生面板中选择
- **预期改动文件**:
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 优化sharePoem函数，优先Web Share API，添加轻量兜底方案
- **实际改动文件**: 
  - ✅ `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - sharePoem函数重构：优先Web Share API，添加中国平台兜底方案，毛玻璃蒙版UI
  - ✅ `lugarden_universal/frontend_vue/src/components/ShareTools.vue` - 分享按钮z-index修复，确保在毛玻璃蒙版上方显示
- **执行步骤**:
  - [x] 步骤C.7.1：调研验证Web Share API在中国移动端的实际平台支持情况 ✅
  - [x] 步骤C.7.2：优化现有sharePoem函数，优先调用Web Share API ✅
  - [x] 步骤C.7.3：设计轻量化兜底方案，仅在Web Share API不支持时显示 ✅
  - [x] 步骤C.7.4：为兜底方案添加中国平台的格式化分享内容 ✅
  - [x] 步骤C.7.5：移动端真机测试验证Web Share API的平台覆盖效果 ✅
- **验收标准**: 优先展示系统原生分享面板（含微信/QQ/小红书等中国应用），兜底方案界面轻量美观，整体分享体验统一流畅

#### - [x] **任务C.8**: 项目圆角设计统一化 - UnoCSS圆角系统全面迁移
- **核心思想**: 确认项目所有圆角采用UnoCSS统一设计系统，消除CSS变量和内联样式的圆角定义，建立一致性设计token体系
- **技术背景**:
  - 项目当前同时存在UnoCSS圆角类(`rounded-lg`)、CSS变量(`var(--radius-base)`)、内联样式(`border-radius: 8px`)三套圆角定义
  - UnoCSS圆角配置已完善(`rounded-sm/base/lg/xl/full`)且与现有设计token完全对齐(6px/8px/12px/16px/50%)
  - 52个圆角匹配分布在15个文件中，包含legacy样式系统和现代组件混用
- **问题识别**:
  - CSS变量和UnoCSS类重复定义导致样式不一致风险
  - 内联样式破坏设计系统的token统一性
  - Legacy组件圆角定义未迁移至现代UnoCSS系统
- **技术方案**:
  - **全面审计**: 识别所有圆角定义的类型和位置，建立完整迁移映射
  - **标准迁移**: 将CSS变量(`var(--radius-*)`)和直接数值全部替换为UnoCSS类(`rounded-*`)
  - **设计token对齐**: 确保迁移后的圆角值与设计系统完全一致
  - **迁移映射表**:
    ```
    var(--radius-sm)   → rounded-sm    (6px)
    var(--radius-base) → rounded-base  (8px)  
    var(--radius-lg)   → rounded-lg    (12px)
    var(--radius-xl)   → rounded-xl    (16px)
    var(--radius-full) → rounded-full  (50%)
    border-radius: 2px → rounded-sm    (6px 或自定义)
    border-radius: 8px → rounded-base  (8px)
    border-radius: 50% → rounded-full  (50%)
    style="border-radius: var(--radius-base)" → class="rounded-base"
    ```
- **预期改动文件**:
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 毛玻璃内联圆角→rounded-base
  - `lugarden_universal/frontend_vue/src/components/EmptyState.vue` - CSS变量→UnoCSS类
  - `lugarden_universal/frontend_vue/src/components/ErrorState.vue` - CSS变量→UnoCSS类
  - `lugarden_universal/frontend_vue/src/assets/styles/components.css` - Legacy圆角定义迁移
  - `frontend-terminology-vue-enhanced.md` - 更新圆角相关术语定义，反映UnoCSS统一系统
  - 其他10个包含圆角定义的组件文件
- **实际改动文件**: 
  - ✅ `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 毛玻璃backdrop的border-radius迁移至rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/components/EmptyState.vue` - containerClass添加rounded-lg，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/ErrorState.vue` - 所有元素添加UnoCSS圆角类，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/ClassicalEchoDisplay.vue` - unified-content-card添加rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/components/InterpretationDisplay.vue` - 所有卡片添加rounded-base，移除滚动条圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/ProgressBar.vue` - trackClass和fillClass添加rounded-base，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/LoadingSpinner.vue` - 所有圆形元素rounded-full，进度条rounded-sm
  - ✅ `lugarden_universal/frontend_vue/src/views/ClassicalEchoScreen.vue` - 按钮rounded-full
  - ✅ `lugarden_universal/frontend_vue/src/components/BackButton.vue` - 动态UnoCSS圆角类，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/views/SubProjectSelection.vue` - unified-content-card添加rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/views/MainProjectSelection.vue` - unified-content-card添加rounded-base  
  - ✅ `lugarden_universal/frontend_vue/src/components/QuestionCard.vue` - unified-content-card添加rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/assets/styles/components.css` - 移除所有border-radius定义
  - ✅ `lugarden_universal/frontend_vue/src/assets/styles/globals.css` - 移除滚动条border-radius定义
  - ✅ `frontend-terminology-vue-enhanced.md` - 更新"进度条圆角问题"描述，反映UnoCSS迁移完成
- **执行步骤**:
  - [x] 步骤C.8.1：圆角使用情况全面审计，建立详细迁移映射表 ✅
  - [x] 步骤C.8.2：验证UnoCSS圆角配置完整性，补充缺失的圆角值 ✅ 
  - [x] 步骤C.8.3：组件样式逐个迁移(PoemViewer毛玻璃优先) ✅
  - [x] 步骤C.8.4：Legacy样式系统(components.css)圆角定义清理 ✅
  - [x] 步骤C.8.5：全项目视觉验证和构建测试 ✅
- **验收标准**: 项目中无CSS变量圆角、无内联圆角样式，所有圆角使用标准UnoCSS类，视觉效果与迁移前完全一致

### **阶段2025-08-24_D：探索性功能完善与优化（待规划）**

#### 🔄 **敏捷迭代原则**
- **阶段D内容**: 将根据C阶段探索成果动态规划
- **规划方式**: 基于C阶段实现的探索性功能进行完善和优化
- **技术基础**: 延续阶段2025-08-24_B建立的现代UX原则和技术标准

#### 📋 **可能的完善方向**（取决于C阶段探索成果）
- 探索性功能的性能优化和用户体验完善
- 新交互模式的细节打磨和视觉效果提升
- 跨设备兼容性和响应式适配
- 功能稳定性和可维护性优化

---

## 测试与验收
- **阶段C**: 
  - 探索性交互功能成功实现，符合阶段2025-08-24_B技术标准
  - 新功能与现有系统良好集成，无功能回归
  - 用户体验提升明显，交互效果流畅自然
- **后续阶段**: 
  - 验收标准将根据C阶段探索成果动态制定
  - 体现敏捷迭代特点，确保每个功能都有明确的用户价值

## 更新日志关联
- **预计更新类型**: [用户体验优化/交互改进]
- **更新目录**: `documentation/changelog/YYYY-MM-DD_UI_interaction_modernization_continuation/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [ ] C阶段探索性交互功能实现完成
  - [ ] 新功能与阶段2025-08-24_B技术标准兼容性验证
  - [ ] 后续验证点将根据探索成果动态添加

## 注意事项
- 严格基于阶段2025-08-24_B建立的技术标准和设计原则，确保技术连贯性
- 充分利用阶段2025-08-24_B建立的术语映射体系，确保问题描述的准确性
- 每完成一个任务都要测试功能，确保不破坏阶段2025-08-24_B的技术成果
- 采用敏捷迭代方式，避免过度规划，以实际发现驱动后续规划
- 保持与阶段2025-08-24_B设计风格的一致性，延续现代UX设计理念

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/YYYY-MM-DD_UI_interaction_modernization_continuation/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 更新 `当前进展.md` 文件
- [ ] 提交所有更改到Git
- [ ] 更新项目状态

#### - [ ] **任务C.8**: 项目圆角设计统一化 - UnoCSS圆角系统全面迁移
- **核心思想**: 确认项目所有圆角采用UnoCSS统一设计系统，消除CSS变量和内联样式的圆角定义，建立一致性设计token体系
- **技术背景**: 
  - 项目当前同时存在UnoCSS圆角类(`rounded-lg`)、CSS变量(`var(--radius-base)`)、内联样式(`border-radius: 8px`)三套圆角定义
  - UnoCSS圆角配置已完善(`rounded-sm/base/lg/xl/full`)且与现有设计token完全对齐(6px/8px/12px/16px/50%)
  - 52个圆角匹配分布在12个组件文件中，包含legacy样式系统和现代组件混用
  - 需要建立统一的圆角使用标准，提升样式维护性和一致性
- **问题识别**:
  1. **CSS变量依赖**: 大量`border-radius: var(--radius-base)`等使用，与UnoCSS优先策略冲突
  2. **内联样式散布**: 包括我们在毛玻璃中新增的`style="border-radius: var(--radius-base)"`
  3. **特殊值处理**: `border-radius: 2px`等非标准值需要映射到UnoCSS系统
  4. **Legacy兼容**: `components.css`中的传统圆角定义需要迁移路径
- **技术方案**:
  - **统一迁移策略**: CSS变量 → UnoCSS类，内联样式 → class属性，保持视觉效果不变
  - **映射表建立**: `var(--radius-base)` → `rounded-base`，确保1:1对应关系
  - **分步迁移**: 组件级逐个迁移，避免大范围破坏性修改
  - **验证机制**: 每次迁移后视觉对比确认，确保设计一致性
  - **迁移映射表**:
    ```
    var(--radius-sm)   → rounded-sm    (6px)
    var(--radius-base) → rounded-base  (8px)  
    var(--radius-lg)   → rounded-lg    (12px)
    var(--radius-xl)   → rounded-xl    (16px)
    var(--radius-full) → rounded-full  (50%)
    border-radius: 2px → rounded-sm    (6px 或自定义)
    border-radius: 8px → rounded-base  (8px)
    border-radius: 50% → rounded-full  (50%)
    style="border-radius: var(--radius-base)" → class="rounded-base"
    ```
- **预期改动文件**:
  - `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 毛玻璃内联圆角→rounded-base
  - `lugarden_universal/frontend_vue/src/components/EmptyState.vue` - CSS变量→UnoCSS类
  - `lugarden_universal/frontend_vue/src/components/ErrorState.vue` - CSS变量→UnoCSS类
  - `lugarden_universal/frontend_vue/src/assets/styles/components.css` - Legacy圆角定义迁移
  - `frontend-terminology-vue-enhanced.md` - 更新圆角相关术语定义，反映UnoCSS统一系统
  - 其他8个包含圆角定义的组件文件
- **实际改动文件**: 
  - ✅ `lugarden_universal/frontend_vue/src/components/PoemViewer.vue` - 毛玻璃backdrop的border-radius迁移至rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/components/EmptyState.vue` - containerClass添加rounded-lg，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/ErrorState.vue` - 所有元素添加UnoCSS圆角类，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/ClassicalEchoDisplay.vue` - unified-content-card添加rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/components/InterpretationDisplay.vue` - 所有卡片添加rounded-base，移除滚动条圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/ProgressBar.vue` - trackClass和fillClass添加rounded-base，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/components/LoadingSpinner.vue` - 所有圆形元素rounded-full，进度条rounded-sm
  - ✅ `lugarden_universal/frontend_vue/src/views/ClassicalEchoScreen.vue` - 按钮rounded-full
  - ✅ `lugarden_universal/frontend_vue/src/components/BackButton.vue` - 动态UnoCSS圆角类，移除CSS圆角
  - ✅ `lugarden_universal/frontend_vue/src/views/SubProjectSelection.vue` - unified-content-card添加rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/views/MainProjectSelection.vue` - unified-content-card添加rounded-base  
  - ✅ `lugarden_universal/frontend_vue/src/components/QuestionCard.vue` - unified-content-card添加rounded-base
  - ✅ `lugarden_universal/frontend_vue/src/assets/styles/components.css` - 移除所有border-radius定义
  - ✅ `lugarden_universal/frontend_vue/src/assets/styles/globals.css` - 移除滚动条border-radius定义
  - ✅ `frontend-terminology-vue-enhanced.md` - 更新"进度条圆角问题"描述，反映UnoCSS迁移完成
- **执行步骤**:
  - [x] 步骤C.8.1：圆角使用情况全面审计，建立详细迁移映射表 ✅
  - [x] 步骤C.8.2：验证UnoCSS圆角配置完整性，补充缺失的圆角值 ✅ 
  - [x] 步骤C.8.3：组件样式逐个迁移(PoemViewer毛玻璃优先) ✅
  - [x] 步骤C.8.4：Legacy样式系统(components.css)圆角定义清理 ✅
  - [x] 步骤C.8.5：全项目视觉验证和构建测试 ✅
- **验收标准**: 项目中无CSS变量圆角、无内联圆角样式，所有圆角使用标准UnoCSS类，视觉效果与迁移前完全一致

## 当前状态
✅ **阶段C全部完成** - C.1~C.8已完成，圆角系统UnoCSS迁移完成

**基础状况**: 
- 阶段2025-08-24_B技术成果完整：进度条系统现代化、按钮系统UnoCSS化、卡片布局统一、技术文档完善
- 现代UX设计原则已建立：内容优先、视觉层次、交互一致性
- 技术架构稳固：UnoCSS优先策略、44px触摸目标标准、统一布局模式

**完成成果**: 
- ✅ 阶段C圆角设计系统统一化完成
- ✅ 所有UI元素使用一致的UnoCSS设计token
- ✅ 从传统CSS到UnoCSS的全面迁移完成
- ✅ ProgressBar和unified-content-card圆角缺失问题修复
- ✅ 15个文件迁移完成，52个圆角定义统一

---

*本TODO延续阶段2025-08-24_B技术成果，采用敏捷探索方式进行基于实际发现的用户体验精细化优化。遵循已建立的现代UX原则和技术标准，确保技术演进的连贯性和用户价值的最大化。*
