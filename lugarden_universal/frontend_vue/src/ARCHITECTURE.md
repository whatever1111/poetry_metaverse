# 陆家花园前端架构规范

## 架构类型
**Modular Monolith** - 基于模块化的单体应用架构

## 目录结构规范

### 1. 模块层（modules/）
业务边界隔离的宇宙模块，每个宇宙独立管理自己的组件、状态和服务。

```
modules/
├── portal/           # 宇宙门户模块
├── zhou/            # 周与春秋模块  
└── maoxiaodou/      # 毛小豆宇宙模块
```

**模块内部结构标准**：
```
<module-name>/
├── components/      # 模块专用组件
├── views/          # 模块页面组件
├── stores/         # 模块状态管理
├── services/       # 模块API服务
├── types/          # 模块类型定义（可选）
└── index.ts        # 模块统一导出文件
```

### 2. 共享层（shared/）
跨模块复用的通用基础设施，提供标准化的UI组件和服务。

```
shared/
├── components/     # 通用UI组件库
├── services/       # 通用服务层
├── utils/          # 通用工具函数
└── types/          # 通用类型定义
```

### 3. 核心层（core/）
应用级基础设施，管理全局配置和框架集成。

```
core/
├── router/         # 路由配置
├── plugins/        # Vue插件配置
└── config/         # 全局配置
```

## 命名约定

### 文件命名
- **Vue组件**: PascalCase (如 `UniverseCard.vue`)
- **TypeScript文件**: camelCase (如 `portalStore.ts`)
- **工具函数**: camelCase (如 `formatDate.ts`)
- **配置文件**: kebab-case (如 `api-client.ts`)

### 模块导出规范
每个模块必须有`index.ts`统一导出文件：

```typescript
// modules/portal/index.ts
export { default as UniverseCard } from './components/UniverseCard.vue'
export { default as UniversePortal } from './views/UniversePortal.vue'
export { usePortalStore } from './stores/portalStore'
export * from './types'
```

### Import路径规范
使用路径别名进行导入：

```typescript
// ✅ 正确：使用路径别名
import { UniverseCard } from '@/modules/portal'
import { LoadingSpinner } from '@/shared/components'
import { apiClient } from '@/shared/services'

// ❌ 错误：相对路径
import UniverseCard from '../../../modules/portal/components/UniverseCard.vue'
```

## 依赖关系规则

### 1. 模块间依赖
- ✅ **modules** → **shared** (允许)
- ✅ **modules** → **core** (允许)
- ❌ **modules** → **modules** (禁止，避免循环依赖)

### 2. 层级依赖
- ✅ **shared** → **core** (允许)
- ❌ **shared** → **modules** (禁止)
- ❌ **core** → **modules** (禁止)
- ❌ **core** → **shared** (禁止)

### 3. 组件分类标准
**模块专用组件判定**：
- 导入模块特定类型
- 包含业务逻辑耦合
- 硬编码业务相关文案
- 与模块特定API交互

**通用组件判定**：
- 纯UI渲染，无业务逻辑
- 通过Props接收数据
- 跨宇宙有复用价值
- 无特定类型依赖

## 开发工作流

### 1. 新功能开发
1. 确定功能归属模块
2. 在对应模块目录下开发
3. 遵循模块内部结构标准
4. 使用路径别名导入依赖
5. 在模块`index.ts`中导出

### 2. 共享组件开发
1. 确认跨模块复用价值
2. 在`shared/components`开发
3. 保持API稳定性
4. 提供完整TypeScript类型
5. 在`shared/index.ts`中导出

### 3. 新模块创建
1. 在`modules/`下创建模块目录
2. 按标准结构创建子目录
3. 创建`index.ts`导出文件
4. 配置路径别名
5. 在路由中注册模块

## 质量标准

### 1. TypeScript
- 所有组件必须有完整类型定义
- 禁用`any`类型，使用具体类型
- Props和Events必须有接口定义

### 2. 组件规范
- 使用`<script setup>`语法
- 遵循Vue 3 Composition API
- 保持组件单一职责
- 提供合理的默认Props

### 3. 状态管理
- 每个模块独立Pinia store
- 使用Composition API风格
- 避免跨模块store直接访问

### 4. 样式规范
- 优先使用UnoCSS utility类
- 避免深层嵌套样式
- 保持响应式设计兼容
- 遵循设计系统标准

---

*此规范随项目演进持续更新，确保架构一致性和可维护性。*
