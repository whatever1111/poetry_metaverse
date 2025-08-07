# TODO - 诗人解读功能开发

本项目标旨在为“周与春秋练习”项目的前端结果页面增加“听吴任几为你解诗”的功能，充分利用 `poem_archetypes.json` 中已有的 `poet_explanation` 数据。

## 任务清单

### 阶段一：前端界面与样式

- [ ] **任务1: 添加HTML按钮**
  - **文件**: `poeject_zhou_spring_autumn/public/index.html`
  - **描述**: 在 `#result-screen` 部分，紧邻现有“解诗”和“读诗”按钮，添加一个新的HTML按钮。
  - **ID**: `poet-interpret-button`
  - **初始文本**: `听吴任几为你解诗`

- [ ] **任务2: 设计按钮样式**
  - **文件**: `poeject_zhou_spring_autumn/public/index.html` (`<style>` 标签)
  - **描述**: 为 `#poet-interpret-button` 添加独特的CSS样式。颜色应与现有按钮区分，但整体风格保持一致。

### 阶段二：数据集成与逻辑实现

- [ ] **任务3: 获取并缓存诗歌原型数据**
  - **文件**: `poeject_zhou_spring_autumn/public/index.html`
  - **函数**: `initGarden()`
  - **描述**: 修改 `initGarden` 函数，在页面加载时通过 `fetch` 调用 `/api/poem-archetypes` API，并将返回的诗歌原型数据存储在 `state` 对象的新属性 `state.poemArchetypes` 中。

- [ ] **任务4: 实现按钮点击逻辑**
  - **文件**: `poeject_zhou_spring_autumn/public/index.html`
  - **描述**: 为 `#poet-interpret-button` 添加点击事件监听器，当用户点击时，调用一个新的 `handlePoetInterpretation` 函数。

- [ ] **任务5: 开发核心解读函数**
  - **文件**: `poeject_zhou_spring_autumn/public/index.html`
  - **函数**: `handlePoetInterpretation()`
  - **描述**: 创建 `handlePoetInterpretation` 函数。此函数会根据当前显示的诗歌ID（从 `state` 中获取），在 `state.poemArchetypes` 中查找对应的 `poet_explanation` 内容，并将其渲染到 `#interpretation-container` 区域中，同时更新作者署名为“吴任几”。

### 阶段三：用户体验优化

- [ ] **任务6: 处理无解诗内容的情况**
  - **文件**: `poeject_zhou_spring_autumn/public/index.html`
  - **函数**: `showResult()`
  - **描述**: 在显示结果页面的逻辑中，增加一步检查。根据当前诗歌ID，在 `state.poemArchetypes` 中查找 `poet_explanation`。如果该字段不存在或为空字符串，则禁用 `#poet-interpret-button` 按钮，并将其文本更新为“暂无诗人解读”。

