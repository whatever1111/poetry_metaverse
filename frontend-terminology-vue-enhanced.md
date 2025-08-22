# 前端术语清单 - UnoCSS集成版

> **📋 术语清单说明**
> 
> 本术语清单建立业务术语与Vue+UnoCSS技术实现的精确映射关系，确保沟通效率和开发定位的准确性。采用技术栈演进适应性的内部架构，支持CSS混合架构和未来技术栈扩展。服务于UI增强项目和后续开发工作。

## 🎯 业务页面与Vue组件映射

### 1. 核心页面术语映射 (Page-Component Mapping)

#### 宇宙门户页 (Universe Portal)
- **业务描述**: 用户进入不同诗歌宇宙的主入口页面
- **Vue实现**: `MainProjectSelection.vue`
- **主要功能区域**:
  - **宇宙卡片列表** → 模板中的宇宙卡片渲染区域
  - **页面头部** → `<header>` 区域和标题显示
  - **加载状态** → `LoadingSpinner` 组件
- **常见问题术语**:
  - "宇宙卡片间距问题" = MainProjectSelection.vue中的卡片布局CSS
  - "宇宙卡片悬停效果" = 卡片组件的hover样式

#### 章节选择页 (Chapter Selection)
- **业务描述**: 用户选择具体诗歌章节的页面
- **Vue实现**: `SubProjectSelection.vue`  
- **主要功能区域**:
  - **返回按钮** → `BackButton` 组件
  - **章节标题** → 页面主标题显示区域
  - **章节列表** → 章节选项的渲染区域
- **常见问题术语**:
  - "章节选择按钮太小" = SubProjectSelection.vue中的选择按钮样式
  - "返回按钮位置" = BackButton组件的定位

#### 问答页面 (Quiz Page)
- **业务描述**: 用户进行诗歌问答的交互页面
- **Vue实现**: `QuizScreen.vue`
- **主要功能区域**:
  - **问题展示** → `QuestionCard` 组件
  - **选项按钮** → 问答选项的按钮区域
  - **进度显示** → 页面底部的进度提示
  - **状态恢复提示** → 恢复问答进度的提示区域
- **常见问题术语**:
  - "问答选项按钮过小" = QuizScreen.vue中的选项按钮样式
  - "问题文字显示问题" = QuestionCard组件的文本样式
  - "进度提示不明显" = 页面底部进度区域样式

#### 古典回响页 (Classical Echo)
- **业务描述**: 显示古典智慧回响内容的过渡页面  
- **Vue实现**: `ClassicalEchoScreen.vue`
- **主要功能区域**:
  - **古典内容展示** → 主要内容显示区域
  - **诗歌预览** → `PoemViewer` 组件（无下载功能）
  - **继续按钮** → 进入结果页的操作按钮
- **常见问题术语**:
  - "古典内容格式问题" = ClassicalEchoScreen.vue中的内容样式
  - "继续按钮样式" = 页面底部的继续操作按钮

#### 诗歌展示页 (Poetry Display / Result Page)
- **业务描述**: 显示问答结果诗歌和各种功能的最终页面
- **Vue实现**: `ResultScreen.vue` 
- **主要功能区域**:
  - **诗歌内容展示** → `PoemViewer` 组件
  - **功能操作按钮** → `ActionButtons` 组件
  - **解读内容展示** → `InterpretationDisplay` 组件
  - **诗歌操作功能** → 复制、分享、下载功能
- **常见问题术语**:
  - "诗歌展示页的按钮不好" = ActionButtons组件的样式和布局
  - "诗歌内容格式问题" = PoemViewer组件的文本渲染
  - "解读内容显示异常" = InterpretationDisplay组件的内容区域
  - "诗人解读按钮文本" = ActionButtons中的诗人解读按钮状态

### 2. 功能组件术语映射 (Component-Function Mapping)

#### 诗歌展示组件 (PoemViewer)
- **功能描述**: 负责诗歌内容的格式化显示和基本操作
- **Vue实现**: `PoemViewer.vue`
- **使用页面**: ResultScreen.vue、ClassicalEchoScreen.vue
- **主要功能**:
  - **诗歌标题显示** → `cleanTitle()` 处理的标题
  - **诗歌内容格式化** → `enhanceTextFormatting()` 处理的正文
  - **复制分享下载** → 复制、分享、下载操作按钮
- **常见问题术语**:
  - "诗歌格式显示问题" = PoemViewer组件的文本处理逻辑
  - "诗歌操作按钮" = PoemViewer中的action按钮区域

#### 功能操作按钮组件 (ActionButtons)  
- **功能描述**: 诗歌展示页的主要功能操作按钮集合
- **Vue实现**: `ActionButtons.vue`
- **使用页面**: ResultScreen.vue
- **主要功能**:
  - **解诗按钮** → AI解诗功能触发
  - **读诗按钮** → 音频播放功能触发  
  - **诗人解读按钮** → 吴任几解读功能（多级状态文本）
  - **重新开始按钮** → 返回章节选择功能
- **常见问题术语**:
  - "诗人解读按钮文本变化" = ActionButtons中的getPoetButtonText逻辑
  - "功能按钮布局问题" = ActionButtons的grid布局样式
  - "按钮点击没反应" = ActionButtons的事件emit问题

#### 解读展示组件 (InterpretationDisplay)
- **功能描述**: 显示AI解读和诗人解读内容的组件
- **Vue实现**: `InterpretationDisplay.vue` 
- **使用页面**: ResultScreen.vue
- **主要功能**:
  - **AI解读内容** → AI解诗结果的展示区域
  - **诗人解读内容** → 吴任几解读内容展示
  - **错误状态显示** → AI解读失败时的错误提示
  - **重试操作** → 解读失败后的重试按钮
- **常见问题术语**:
  - "解读内容不显示" = InterpretationDisplay的数据绑定问题
  - "AI解读错误提示" = 组件中的错误状态处理
  - "解读内容样式" = 组件内的内容展示CSS

#### 问题卡片组件 (QuestionCard)
- **功能描述**: 问答页面中问题和选项的展示组件
- **Vue实现**: `QuestionCard.vue`
- **使用页面**: QuizScreen.vue
- **主要功能**:
  - **问题文本展示** → 问题内容的渲染
  - **选项按钮** → A/B选项的选择按钮
  - **选择状态反馈** → 选择后的视觉反馈
- **常见问题术语**:
  - "问题文字太小" = QuestionCard中的问题文本样式
  - "选项按钮点击区域小" = 选项按钮的触摸目标大小

### 3. 状态管理术语映射 (State Management Mapping)

#### 周春秋状态管理 (ZhouStore)
- **技术实现**: `src/stores/zhou.ts` (Pinia Store)
- **核心功能**: 管理整个周与春秋宇宙的所有状态和业务逻辑
- **状态域划分**:
  - **universeData** → 宇宙数据（projects、poems、poemArchetypes等）
  - **appState** → 应用状态（loading、error等）
  - **navigation** → 导航状态（当前章节、路由信息）
  - **quiz** → 问答状态（题目、答案、进度）
  - **result** → 结果状态（选中诗歌、解读内容、音频等）
  - **ui** → 界面状态（加载屏幕、错误信息）

#### 关键状态术语
- **"问答进度丢失"** = quiz状态域的saveQuizState/restoreQuizState问题
- **"诗歌内容不显示"** = result.selectedPoem状态问题
- **"解读内容不显示"** = result.interpretationContent或result.poetExplanation状态问题
- **"音频播放问题"** = result.audioElement、result.audioPlaying状态问题
- **"页面加载状态"** = ui.showLoadingScreen状态控制问题

#### 状态操作术语
- **"章节选择"** = `selectChapter()` action
- **"问答提交"** = `answerQuestion()` action  
- **"获取解读"** = `getInterpretation()` action
- **"播放音频"** = `playPoem()` action
- **"显示诗人解读"** = `showPoetExplanation()` action

### 4. 样式系统术语映射 (CSS Style System Mapping)

> **🏗️ 混合架构说明**  
> 项目采用UnoCSS + 传统CSS的混合架构。基础样式使用UnoCSS utility类，复杂动画和特殊效果保留传统CSS。

#### 4.1 UnoCSS术语映射 (UnoCSS Utility Mapping)

##### 布局和间距问题
- **"元素间距过大/过小"** → HTML class属性中的UnoCSS utility类
  - 外边距: `m-4` (1rem), `mx-6` (1.5rem), `my-2` (0.5rem)
  - 内边距: `p-4` (1rem), `px-6` (1.5rem), `py-2` (0.5rem)
  - 间隙: `gap-4` (1rem), `gap-x-6`, `gap-y-2`
  - 检查方法: 在浏览器开发者工具中查看元素的class属性

- **"卡片布局问题"** → UnoCSS布局utility类
  - 网格布局: `grid`, `grid-cols-2`, `grid-cols-md-3`
  - 弹性布局: `flex`, `items-center`, `justify-between`
  - 最大宽度: `max-w-sm`, `max-w-md`, `max-w-3xl`
  - 居中对齐: `mx-auto`, `text-center`

##### 响应式适配问题
- **"移动端布局异常"** → UnoCSS响应式utility类
  - 断点前缀: `sm:`, `md:`, `lg:`, `xl:`
  - 移动优先: `gap-2 sm:gap-4 md:gap-6`
  - 隐藏显示: `hidden md:block`, `block md:hidden`
  - 响应式网格: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

- **"桌面端卡片过宽"** → UnoCSS宽度utility类
  - 最大宽度: `max-w-sm`, `max-w-md`, `max-w-3xl`
  - 响应式宽度: `w-full md:w-1/2 lg:w-1/3`
  - 容器居中: `container mx-auto`

##### 颜色和视觉效果问题
- **"按钮颜色不对"** → UnoCSS颜色utility类
  - 背景色: `bg-blue-500`, `bg-gray-100`, `bg-primary`
  - 文字色: `text-white`, `text-gray-800`, `text-primary`
  - 边框色: `border-gray-300`, `border-blue-400`
  - 悬停状态: `hover:bg-blue-600`, `hover:text-white`

- **"阴影效果问题"** → UnoCSS阴影utility类
  - 卡片阴影: `shadow-sm`, `shadow-md`, `shadow-lg`
  - 悬停阴影: `hover:shadow-xl`, `hover:shadow-2xl`
  - 无阴影: `shadow-none`

##### 字体和文本问题
- **"字体大小不合适"** → UnoCSS文字utility类
  - 字体大小: `text-sm`, `text-base`, `text-lg`, `text-xl`
  - 响应式字体: `text-sm md:text-base lg:text-lg`
  - 字体粗细: `font-normal`, `font-medium`, `font-bold`
  - 行高: `leading-relaxed`, `leading-loose`

#### 4.2 传统CSS术语映射 (Traditional CSS Mapping)

> **🎯 适用范围**: 复杂动画、特殊交互效果、高度定制化的视觉效果

##### 样式文件架构
- **全局样式基础** → `src/assets/styles/globals.css`
  - CSS变量定义 (`--color-*`, `--font-*`, `--spacing-*`)
  - 基础样式重置和全局设置
  - 响应式断点和媒体查询基础

- **组件样式类库** → `src/assets/styles/components.css`
  - 复杂按钮样式 (`.btn-interpret`, `.btn-listen`, `.btn-poet`)
  - 特殊卡片样式 (`.card-question` 的复杂状态)
  - 特殊状态样式 (`.loading-*`, `.error-*` 的动画)

- **动画效果库** → `src/assets/styles/animations.css`
  - 页面过渡动画 (`@keyframes fadeIn`, `@keyframes fadeInUp`)
  - 交互动画 (`@keyframes pulse`, `@keyframes spin`)
  - 文本变化动画 (`@keyframes textChangeScale`)

##### CSS变量系统
- **"CSS变量覆盖问题"** → `globals.css` → CSS变量定义
  - 颜色变量: `--color-primary-*`, `--bg-*`
  - 间距变量: `--spacing-*`
  - 字体变量: `--font-size-*`
  - 动画变量: `--duration-*`, `--ease-*`

##### 复杂动画和交互
- **"页面切换动画不流畅"** → `animations.css` → 页面过渡动画
  - 淡入动画: `@keyframes fadeIn`, `animation: fadeIn 0.5s`
  - 上滑动画: `@keyframes fadeInUp`, `animation: fadeInUp 0.4s`
  - 缓动函数: `cubic-bezier(0.4, 0, 0.2, 1)`

- **"诗人解读按钮文本变化"** → `animations.css` → `.text-change-animation`
  - 多状态文本切换动画
  - 缩放动画: `@keyframes textChangeScale`
  - 动画时长: `animation: textChangeScale 0.4s`

#### 4.3 样式问题分流指导 (Style Issue Triage Guide)

> **🔧 问题定位决策树**: 根据问题类型选择正确的技术栈进行调试

##### 问题类型判断
```
样式问题 → 问题分类：
│
├── 基础布局问题 (间距、对齐、大小)
│   └── → 检查UnoCSS utility类 (HTML class属性)
│
├── 响应式适配问题 (移动端、桌面端)  
│   ├── 简单响应式 → UnoCSS响应式utility类
│   └── 复杂响应式 → 传统CSS媒体查询
│
├── 颜色和视觉效果问题
│   ├── 基础颜色 → UnoCSS颜色utility类
│   └── 复杂渐变/特效 → 传统CSS
│
├── 动画和交互问题
│   ├── 简单悬停效果 → UnoCSS hover:前缀
│   └── 复杂动画序列 → 传统CSS @keyframes
│
└── 字体和文本问题
    ├── 基础字体样式 → UnoCSS文字utility类
    └── 复杂文本效果 → 传统CSS
```

##### 调试策略
- **第一步**: 在浏览器开发者工具中检查元素的class属性
- **第二步**: 如果是UnoCSS问题，修改HTML中的utility类
- **第三步**: 如果是传统CSS问题，检查对应的CSS文件
- **第四步**: 混合问题需要同时检查utility类和CSS文件

##### 常见混合场景
- **卡片组件**: 基础布局用UnoCSS，悬停动画用传统CSS
- **按钮组件**: 基础样式用UnoCSS，复杂交互用传统CSS  
- **响应式布局**: 基础响应式用UnoCSS，复杂适配用传统CSS
- **页面过渡**: 布局变化用UnoCSS，动画效果用传统CSS

### 5. Vue技术术语补充 (Vue Technical Terms)

#### 路由相关 (Vue Router)
- **"页面跳转不工作"** = router.push()调用或路由配置问题
- **"返回按钮无效"** = router.back()或BackButton组件问题  
- **"页面刷新后状态丢失"** = 路由状态持久化问题

#### 组件通信相关
- **"数据没传下去"** = Props传递问题 (`:prop-name="value"`)
- **"按钮点击没反应"** = Events传递问题 (`@event-name="handler"`)
- **"组件不更新"** = 响应式数据问题 (ref/reactive)

#### 类型相关 (TypeScript)
- **"类型错误"** = TypeScript编译报错，通常在defineProps或interface定义
- **"Props类型不匹配"** = 组件Props接口定义与实际使用不符
- **"方法类型错误"** = Emits事件类型定义问题

### 6. 项目专用业务术语 (Business Terms - 保持原有定义)

#### 宇宙系统术语
- **宇宙门户 (Universe Portal)** 
  - Vue实现: MainProjectSelection.vue
  - 原定义保持不变，用户进入不同诗歌宇宙的主入口页面

- **宇宙卡片 (Universe Card)**
  - Vue实现: MainProjectSelection.vue中的卡片项目
  - 原定义保持不变，展示各个诗歌宇宙信息的卡片组件

- **宇宙切换 (Universe Transition)**  
  - Vue实现: Vue Router页面跳转 + 可能的页面过渡动画
  - 原定义保持不变，用户在不同诗歌宇宙间跳转的交互过程

#### 周春秋系统术语  
- **诗歌朗读 (Poetry Reading)**
  - Vue实现: ActionButtons.vue的读诗按钮 + zhouStore.playPoem()
  - 原定义保持不变，"听陆家明读诗"功能

- **诗歌解读 (Poetry Interpretation)**
  - Vue实现: ActionButtons.vue的解诗按钮 + zhouStore.getInterpretation()
  - 原定义保持不变，"听陆家明解诗"功能

- **诗人解读 (Poet Interpretation)**
  - Vue实现: ActionButtons.vue的诗人解读按钮 + zhouStore.showPoetExplanation()
  - 增强定义: "最好不要点"按钮，5级状态文本变化，吴任几解读内容展示

- **问答流程 (Q&A Flow)**  
  - Vue实现: QuizScreen.vue + QuestionCard.vue + zhouStore.quiz状态域
  - 原定义保持不变，用户参与诗歌问答的完整交互过程

### 7. 开发调试术语映射 (Development & Debugging)

#### 常见开发问题术语  
- **"页面白屏"** = Vue组件渲染错误，检查浏览器Console和Vue DevTools
- **"数据不显示"** = Store状态问题或组件Props绑定问题
- **"点击无响应"** = 事件处理函数未绑定或组件emits配置错误
- **"样式不生效"** = CSS作用域问题或Tailwind类名错误
- **"热更新不工作"** = Vite HMR问题，需要重启开发服务器

#### 质量检查术语
- **"类型检查失败"** = `npm run type-check` 报错，需要修复TypeScript类型问题
- **"代码规范检查失败"** = `npm run lint` 报错，需要修复ESLint规则违规
- **"构建失败"** = `npm run build` 失败，通常是类型错误或导入问题

#### 性能问题术语
- **"页面加载慢"** = 组件懒加载、代码分割或资源优化问题
- **"动画卡顿"** = CSS动画性能问题或JavaScript计算过重
- **"内存泄漏"** = 组件卸载时未清理事件监听器或定时器

## 🔧 D/E阶段问题描述模板

### 业务问题描述模板
```
问题页面: [业务术语，如"诗歌展示页"]  
对应文件: [Vue文件，如"ResultScreen.vue"]
问题区域: [具体功能区域，如"功能操作按钮"]
对应组件: [Vue组件，如"ActionButtons"]
相关样式: [CSS文件和类名，如"components.css → .btn-interpret"]
问题描述: [具体现象，使用业务术语] 
影响程度: [高/中/低优先级]
```

### 示例问题描述

#### 功能问题示例
```
问题页面: 诗歌展示页
对应文件: ResultScreen.vue  
问题区域: 诗人解读按钮
对应组件: ActionButtons.vue
相关样式: N/A (逻辑问题)
问题描述: 按钮文本不会根据点击次数变化
影响程度: 中优先级
```

#### 样式问题示例
```
问题页面: 诗歌展示页
对应文件: ResultScreen.vue
问题区域: 功能操作按钮
对应组件: ActionButtons.vue
相关样式: components.css → .btn-interpret, .btn-listen, .btn-poet, .btn-restart
问题描述: 按钮缺少文本阴影和立体盒子阴影效果，与原始zhou.html不一致
影响程度: 中优先级
```

## 🎯 快速查找指南

### 按业务功能查找
- **宇宙选择相关** → MainProjectSelection.vue  
- **章节选择相关** → SubProjectSelection.vue
- **问答功能相关** → QuizScreen.vue + QuestionCard.vue
- **诗歌展示相关** → ResultScreen.vue + PoemViewer.vue
- **功能按钮相关** → ActionButtons.vue
- **解读内容相关** → InterpretationDisplay.vue

### 按问题类型查找

#### 功能逻辑问题
- **交互功能问题** → ActionButtons.vue或相关事件处理
- **数据显示问题** → zhouStore状态管理或组件Props
- **页面跳转问题** → Vue Router配置或导航逻辑
- **状态管理问题** → src/stores/zhou.ts

#### 样式视觉问题
- **按钮样式问题** → components.css → .btn-* 类族
- **卡片布局问题** → components.css → .card-* 类族
- **文字显示问题** → components.css → .question-text, .poem-*, .content-*
- **颜色配色问题** → globals.css → --color-* 变量
- **间距布局问题** → globals.css → --spacing-* 变量
- **动画效果问题** → animations.css → @keyframes 动画
- **响应式适配问题** → 各CSS文件的媒体查询部分

### 按样式文件查找
- **全局设置和变量** → `src/assets/styles/globals.css`
- **组件样式类** → `src/assets/styles/components.css`  
- **动画效果** → `src/assets/styles/animations.css`

### 按CSS类名查找
- **按钮相关**: `.btn-base`, `.btn-primary`, `.btn-option`, `.btn-interpret`, `.btn-listen`, `.btn-poet`, `.btn-restart`
- **卡片相关**: `.card-base`, `.card-project`, `.card-question`
- **状态相关**: `.loading-*`, `.error-*`, `.empty-*`
- **文本相关**: `.content-title`, `.question-text`, `.poem-title`, `.poem-body`

## 🔄 术语清单维护(D/E阶段)

### 实践验证原则
- **边用边完善**: 在实际问题解决中验证术语映射准确性
- **高频优化**: 记录最常用的术语，确保映射关系清晰
- **实用优先**: 保持业务术语的自然使用，技术映射作为补充

## 📋 文档使用指南

### 🎯 快速定位问题的方法
1. **确定问题类型**：样式问题 vs 功能问题 vs 业务问题
2. **选择对应章节**：
   - 样式问题 → 第4章 样式系统术语映射
   - 功能问题 → 第1-3章 和第5章
   - 业务问题 → 第6章 项目专用业务术语
3. **使用分流指导**：样式问题优先查看4.3节的决策树
4. **查找具体术语**：使用快速查找指南定位到具体文件

### 🔧 样式问题调试建议
- **优先检查UnoCSS**：大部分基础样式问题都在HTML的class属性中
- **复杂效果查传统CSS**：动画、特殊交互效果在CSS文件中
- **混合架构理解**：一个组件可能同时使用两种技术栈

### 版本记录
- **v3.0-unocss-integration**: UnoCSS集成版本，技术栈演进适应性架构
- **更新日期**: 2025-08-22
- **服务阶段**: UI增强项目 - 交互体验现代化
- **v3.0核心改进**: 
  - **架构重构**: 采用技术栈演进适应性的内部章节结构
  - **新增UnoCSS术语映射** - 完整的utility类术语体系和使用指导
  - **混合架构支持** - UnoCSS与传统CSS并存的术语映射和分流指导
  - **样式问题分流指导** - 问题定位决策树，快速确定使用哪种技术栈调试
  - **扩展性设计** - 支持未来技术栈通过新增子章节方式扩展
- **v2.1核心改进**: 新增CSS样式系统术语映射，完善样式问题定位能力
- **v2.0核心改进**: 建立了业务术语与Vue实现的精确映射关系

---

*本术语清单采用技术栈演进适应性架构，支持UnoCSS+传统CSS混合架构，为UI增强项目和未来技术栈演进提供准确的术语映射基础*
