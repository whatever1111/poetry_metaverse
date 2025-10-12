# 陆家花园项目 - API 合同 v2025.08.29

> **版本**: v2025.08.29  
> **最后更新**: 2025-08-29  
> **基于**: v2025.08.28 + E.9 API完整性完善与实用性增强  
> **技术栈**: Express.js + TypeScript + Prisma ORM + SQLite  
> **新增特性**: 项目实际使用说明、前端调用场景、用户操作流程  

---

## 版本变更历史

### v2025.08.29 - 实用性增强 (当前版本)
**基于v2025.08.28的实用性完善**：
- [已实现] **Universes API补全**: 添加缺失的GET /api/universes端点
- [已实现] **项目使用说明**: 为每个API域添加实际使用场景和前端调用示例
- [已实现] **用户流程描述**: 详细说明用户操作如何触发各API调用
- [已实现] **开发者友好**: 提供具体的前端模块调用方式和业务价值说明
- [已实现] **实际现状反映**: 基于E.1-E.9实际实现情况更新API状态

### v2025.08.28 - 系统性重设计
**基于E.1审查报告的问题解决**：
- [已实现] **Portal API完全缺失** → 新增完整Portal API规范
- [已实现] **API契约脱节** → 重新设计所有API端点，确保前后端期望一致
- [已实现] **路由设计不规范** → 标准化RESTful路由组织
- [已实现] **错误处理不统一** → 统一错误响应格式和状态码
- [已实现] **缺乏输入验证** → 设计标准化请求验证策略
- [已实现] **前端架构复杂** → 简化API客户端设计方案

**理论标准映射**：
- OpenAPI 3.0 → TypeScript接口 + 详细API文档
- RESTful原则 → 资源导向的Express.js路由组织
- HTTP标准 → 规范的状态码和动词使用

### v2025.08.18 (历史版本)
- 原始版本，存在系统性架构问题
- 备份位置：`api-contracts-v2025.08.18.md`

---

## 统一标准

### 基础URL
- **开发环境**: `http://localhost:3000/api`
- **生产环境**: `https://lugarden.example.com/api`

### 通用请求头
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  # 仅认证接口
```

### 标准化错误响应格式
```typescript
interface ApiErrorResponse {
  error: {
    code: string           // 错误代码 (UPPERCASE_WITH_UNDERSCORES)
    message: string        // 用户友好的错误描述
    details?: any          // 详细错误信息 (可选)
    timestamp: string      // ISO 8601时间戳
    requestId: string      // 请求追踪ID
  }
}
```

**标准HTTP状态码使用**：
- `200` - 成功
- `201` - 创建成功  
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突
- `422` - 数据验证失败
- `500` - 服务器内部错误

### 输入验证策略
所有API端点都应实现：
1. **请求体验证**: 使用TypeScript接口定义的严格类型检查
2. **参数验证**: 路径参数和查询参数的格式和取值范围验证
3. **业务逻辑验证**: 数据完整性和业务规则检查
4. **安全验证**: SQL注入、XSS等安全威胁防护

===============================================
# 第一组：经过完整治理并实现的API
===============================================

## Portal API - 宇宙门户接口

> **新增**: 解决前端Portal模块API期望与后端实现脱节问题

### 基础路径
`/api/portal/*`

### 实现文件
`src/routes/portal.js` (E.5完成，322行)

### 项目中的使用

#### 业务价值
Portal API是用户进入陆家花园项目的第一入口，负责展示所有可用的宇宙，并提供导航和访问统计功能。这是用户体验的关键起点。

#### 用户操作流程
1. **用户访问**: `http://localhost:3000/` → Portal页面自动加载
2. **浏览宇宙**: Portal页面展示宇宙卡片列表 → 调用`GET /api/portal/universes`
3. **查看详情**: 用户点击宇宙卡片 → 调用`GET /api/portal/universes/:id`
4. **进入宇宙**: 用户点击"进入"按钮 → 调用`POST /api/portal/universes/:id/visit` → 跳转到对应宇宙

#### 前端模块调用
- **服务文件**: `src/modules/portal/services/portalApi.ts`
- **核心组件**: `UniversePortal.vue`, `UniverseCard.vue` 
- **状态管理**: `src/modules/portal/stores/portal.ts`
- **API客户端**: 基于`EnhancedApiClient`，支持缓存和错误处理

#### 典型调用示例
```typescript
// Portal页面加载时
const portalService = new PortalApiService(apiClient)
const universes = await portalService.getUniverseList({
  status: ['active'],
  includeAnalytics: true
})

// 用户进入宇宙时
await portalService.recordUniverseVisit('zhou', 'portal')
```

### Portal API规范

#### GET /api/portal/universes
**功能**: 获取Portal页面展示的宇宙列表  
**权限**: 公开  
**实现状态**: [已实现] (E.5完成)  
**查询参数**:
```typescript
interface PortalUniversesQuery {
  status?: UniverseStatus[]   // 过滤状态: active,developing,maintenance
  refresh?: boolean          // 强制刷新缓存
  analytics?: boolean        // 包含访问统计数据
}
```

**成功响应 (200 OK)**:
```typescript
interface PortalUniversesResponse {
  universes: Universe[]
  total: number
  status: 'success'
  message?: string
  metadata?: {
    lastUpdated: string
    cacheExpiry: string
  }
}

interface Universe {
  id: string
  code: string               // 用于路由的唯一标识
  name: string              // 显示名称
  description: string       // 描述文本
  status: UniverseStatus    // active | developing | maintenance | archived
  coverImage?: string       // 封面图片URL
  tags?: string[]          // 标签列表
  stats?: {                // 统计信息 (analytics=true时包含)
    visitCount: number
    lastVisit: string
  }
  createdAt: string        // ISO 8601
  updatedAt: string        // ISO 8601
}

type UniverseStatus = 'active' | 'developing' | 'maintenance' | 'archived'
```

**错误响应**:
- `500` - 服务器错误

#### GET /api/portal/universes/:universeId
**功能**: 获取单个宇宙的详细信息  
**权限**: 公开  
**实现状态**: [已实现] (E.5完成)  
**路径参数**:
- `universeId: string` - 宇宙ID或code

**成功响应 (200 OK)**:
```typescript
interface PortalUniverseDetailResponse {
  universe: UniverseDetail
  status: 'success'
}

interface UniverseDetail extends Universe {
  accessibility: {
    isAccessible: boolean
    accessMessage?: string    // 不可访问时的提示信息
    requiresAuth: boolean
  }
  navigation: {
    entryPath: string        // 进入宇宙的路径
    fallbackPath?: string    // 备用路径
  }
  content?: {               // 预览内容
    featuredItems: any[]
    summary: string
  }
}
```

**错误响应**:
- `404` - 宇宙不存在
- `500` - 服务器错误

#### POST /api/portal/universes/:universeId/visit
**功能**: 记录宇宙访问  
**权限**: 公开  
**实现状态**: [已实现] (E.5完成)  
**路径参数**:
- `universeId: string` - 宇宙ID

**请求体**:
```typescript
interface VisitRecord {
  sessionId?: string       // 会话标识
  referrer?: string       // 来源页面
  userAgent?: string      // 用户代理
}
```

**成功响应 (201 Created)**:
```typescript
interface VisitResponse {
  visitId: string
  timestamp: string
  status: 'success'
}
```

===============================================

## Universes API - 宇宙接口

> **重新设计**: 统一宇宙内容访问规范

### 基础路径
`/api/universes/*`

### 实现文件
`src/routes/universes.js` + `src/services/universeService.js` (E.8+E.9完成)

### 项目中的使用

#### 业务价值
Universes API是项目的核心内容服务，提供宇宙的完整业务数据。这是用户获得实际内容体验的主要数据来源，支撑着周与春秋等宇宙模块的核心功能。

#### 用户操作流程
1. **宇宙选择**: Portal → 点击"周与春秋"宇宙卡片
2. **模块初始化**: 进入Zhou模块 → 自动调用`GET /api/universes/universe_zhou_spring_autumn/content`
3. **内容展示**: 加载项目列表、问答题目、诗歌映射等核心数据
4. **交互体验**: 用户选择项目、答题、获得诗歌 → 所有数据基于此API的内容

#### 前端模块调用
- **主要模块**: Zhou模块 (`src/modules/zhou/`)
- **调用位置**: `zhou.ts` store的`loadUniverseContent()`方法 (第206行)
- **服务层**: `EnhancedApiClient` → `UniverseService` → `getUniverseContent()`
- **数据处理**: 解析projects、questions、mappings、poems、poemArchetypes等结构化数据

#### 典型调用示例
```typescript
// Zhou模块初始化时
const api = initializeApiServices()
const universeService = api.getUniverseService()
const data = await universeService.getUniverseContent('universe_zhou_spring_autumn', refresh)

// 数据处理
universeData.projects = data.content.projects || []
universeData.questions = data.content.questions || {}
universeData.poems = data.content.poems || {}
```

#### 数据结构说明
- **projects**: 主项目和子项目信息，用于项目选择界面
- **questions**: 按章节组织的问答题目，支持用户答题流程  
- **mappings**: 答案组合到诗歌的映射关系，核心算法数据
- **poems**: 诗歌内容，支持结构化格式和legacy格式
- **poemArchetypes**: 诗歌原型数据，包含诗人解读等扩展信息

#### GET /api/universes
**功能**: 获取所有已发布的宇宙列表  
**权限**: 公开  
**实现状态**: [已实现] (E.9完成)
**查询参数**:
```typescript
interface UniversesQuery {
  refresh?: boolean              // 强制刷新缓存
}
```

**成功响应 (200 OK)**:
```typescript
// 直接返回宇宙数组，与实际实现一致
type UniversesResponse = PublicUniverse[]

interface PublicUniverse {
  id: string
  code: string
  name: string
  type: string
  description: string
  status: string           // 固定为 'published'
  createdAt: string
  updatedAt: string
}
```

#### GET /api/universes/:universeCode/content
**功能**: 获取特定宇宙的完整内容  
**权限**: 公开  
**实现状态**: [已实现] (E.8完成)
**路径参数**:
- `universeCode: string` - 宇宙代码 (如: universe_zhou_spring_autumn)

**查询参数**:
```typescript
interface UniverseContentQuery {
  format?: 'standard' | 'legacy'  // 数据格式，默认standard
  refresh?: boolean               // 强制刷新缓存
}
```

**成功响应 (200 OK)**:
```typescript
interface UniverseContentResponse {
  universe: PublicUniverse
  content: UniverseContent
  status: 'success'
}

// content结构根据宇宙type动态变化
interface UniverseContent {
  projects?: Project[]      // POEM_PROJECT类型
  questions?: Question[]    // 问答数据
  mappings?: Mapping[]     // 结果映射
  poems?: Poem[]          // 诗歌内容
  poemArchetypes?: PoemArchetype[]  // 诗歌原型
  // 其他类型的内容...
}
```

===============================================

## AI Services API - AI服务接口

> **保持现有**: 已实现的AI功能接口

### 基础路径
直接挂载到 `/api/*` (由server.js处理)

### 实现文件
`server.js` (集成在主服务文件中，使用Google Generative AI)

### 项目中的使用

#### 业务价值
AI Services API是陆家花园项目的核心增值功能，为用户提供智能化的诗歌解读体验。这是区别于传统问答系统的关键创新点，提供个性化的AI解读服务。

#### 用户操作流程
1. **答题完成**: Zhou模块 → 用户完成问答 → 获得映射诗歌
2. **查看诗歌**: 结果页面显示诗歌内容
3. **AI解读**: 用户点击"AI解诗"按钮 → 调用`POST /api/interpret`
4. **智能分析**: AI结合问答上下文和诗歌内容，生成个性化解读
5. **解读展示**: 用户阅读AI生成的诗歌解读内容

#### 前端模块调用
- **主要模块**: Zhou模块结果页面 (`ResultScreen.vue`)
- **调用位置**: `zhou.ts` store的`getInterpretation()`方法 (第548行)
- **服务层**: `AIService` → `interpretPoem()`方法
- **智能上下文**: 传递poem、title、combination、chapter等上下文信息

#### 典型调用示例
```typescript
// Zhou模块请求AI解读
const api = initializeApiServices()
const aiService = api.getAIService()

// 构建完整上下文
const poemContent = buildFullPoemContent(result.selectedPoem)
const combination = quiz.userAnswers.map(answer => answer.selectedOption === 'A' ? '0' : '1').join('')

// 调用AI解读
const data = await aiService.interpretPoem(
  poemContent,
  result.selectedPoem.title,
  combination,
  navigation.currentChapterName || ''
)
```

#### AI功能特性
- [已实现] 上下文感知: 结合用户答题combination和章节chapter信息
- [已实现] 数据库增强: 查询映射表获取meaning作为解读背景
- [已实现] Google Gemini: 使用Google Generative AI提供高质量解读
- [已实现] 智能缓存: 避免重复解读相同内容
- [已实现] 错误恢复: 完善的错误处理和用户友好提示

#### POST /api/interpret
**功能**: AI诗歌解读  
**权限**: 公开  
**实现状态**: [已实现] (server.js，使用Google Generative AI)

**请求体**:
```typescript
interface InterpretRequest {
  poem: string
  title: string
  combination?: string
  chapter?: string
}
```

**成功响应 (200 OK)**:
```typescript
interface InterpretResponse {
  interpretation: string
  status: 'success'
}
```

===============================================
# 第二组：部分实现或概念设计的API
===============================================

## Admin API - 管理接口

> **部分实现**: 基础管理功能已实现，但不如Portal/Universes API完善

### 基础路径
`/api/admin/*`

### 实现文件
`src/routes/admin.js` (早期实现，593行，功能相对基础)

### 项目中的使用

#### 业务价值
Admin API提供基础的后台管理功能，支持宇宙管理等核心操作。

#### 实现状态
- [已实现] 基础CRUD: 宇宙创建、查询、更新、删除已实现
- [已实现] 认证机制: 基于session的简单认证
- [部分实现] 功能完善度: 相比Portal/Universes API，实现较为基础
- [部分实现] 前端集成: 主要用于传统HTML管理页面，Vue集成有限

#### 基础调用
```javascript
// 管理员界面的基础调用
fetch('/api/admin/universes', { credentials: 'include' })
```

### 认证要求
所有Admin API都需要认证：
```typescript
// 中间件检查
if (!req.session?.isAuthenticated) {
  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: '需要管理员认证',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    }
  })
}
```

### 宇宙管理

#### GET /api/admin/universes
**功能**: 获取所有宇宙(包括草稿)  
**权限**: 需要认证  

**成功响应 (200 OK)**:
```typescript
interface AdminUniversesResponse {
  universes: AdminUniverse[]
  total: number
  status: 'success'
}

interface AdminUniverse {
  id: string
  name: string
  code: string
  type: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}
```

#### POST /api/admin/universes
**功能**: 创建新宇宙  
**权限**: 需要认证  

**请求体验证**:
```typescript
interface CreateUniverseRequest {
  name: string              // 必填, 1-100字符
  code: string              // 必填, 唯一, 字母数字下划线
  type: string              // 必填, 预定义类型
  description?: string      // 可选, 最大1000字符
}
```

**成功响应 (201 Created)**:
```typescript
interface CreateUniverseResponse {
  universe: AdminUniverse
  status: 'success'
  message: '宇宙创建成功'
}
```

**错误响应**:
- `400` - 参数验证失败
- `409` - 代码已存在
- `422` - 数据验证失败

#### PUT /api/admin/universes/:id
**功能**: 更新宇宙信息  
**权限**: 需要认证  

#### DELETE /api/admin/universes/:id  
**功能**: 删除宇宙  
**权限**: 需要认证  

===============================================

## Authentication API - 认证接口

> **集成实现**: 认证功能集成在Admin模块中，无独立API文件

### 基础路径
`/api/auth/*`

### 实现文件
无独立文件 (认证逻辑集成在`admin.js`和`server.js`中)

### 实现状态
- [集成实现] 无独立文件: 没有独立的`auth.js`文件
- [集成实现] 认证逻辑: 集成在`admin.js`和`server.js`中
- [部分实现] 基础功能: 仅有简单的session验证，未实现完整认证API

### 实际使用
认证功能主要通过Admin模块的session机制实现，而非独立的认证API端点。

#### POST /api/auth/login
**功能**: 管理员登录  
**权限**: 公开  

**请求体**:
```typescript
interface LoginRequest {
  password: string          // 必填
  remember?: boolean        // 可选, 记住登录状态
}
```

**成功响应 (200 OK)**:
```typescript
interface LoginResponse {
  status: 'success'
  message: '登录成功'
  session: {
    expiresAt: string
    permissions: string[]
  }
}
```

**错误响应**:
- `400` - 缺少密码
- `401` - 密码错误
- `429` - 登录尝试过多

#### POST /api/auth/logout
**功能**: 退出登录  
**权限**: 需要认证  

**成功响应 (200 OK)**:
```typescript
interface LogoutResponse {
  status: 'success'
  message: '已退出登录'
}
```

#### GET /api/auth/session
**功能**: 检查会话状态  
**权限**: 公开  

**成功响应 (200 OK)**:
```typescript
interface SessionResponse {
  authenticated: boolean
  expiresAt?: string
  permissions?: string[]
  status: 'success'
}
```

===============================================

## Health & Monitoring API - 健康检查接口

> **规划中**: 系统监控概念设计，暂未实现

### 基础路径
`/api/health/*`

### 实现文件
无实现文件 (仅为概念设计)

### 实现状态
- [未实现] 没有`health.js`文件或相关实现
- [概念设计] 仅在API契约中定义，无实际代码
- [未集成] 现有系统暂无健康检查机制

### 实际状况
Health API目前仅为概念设计，是为未来生产环境监控需求预留的API规范。当前系统依赖基础的Express.js运行状态。

### 如需实现
```javascript
// 未来实现时的基础结构
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})
```

#### GET /api/health
**功能**: 基础健康检查  
**权限**: 公开  

**成功响应 (200 OK)**:
```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: 'healthy' | 'unhealthy'
    cache: 'healthy' | 'unhealthy'
    ai: 'healthy' | 'unhealthy'
  }
}
```

#### GET /api/health/metrics
**功能**: 系统指标  
**权限**: 需要认证  

===============================================
# 开发指南与规范
===============================================

## Express.js 路由组织建议

基于RESTful原则的标准化路由结构：

```javascript
// 建议的文件结构
src/routes/
├── index.js              // 路由总入口
├── portal.js             // Portal API (/api/portal/*)
├── universes.js          // Universe Content API (/api/universes/*)  
├── admin/
│   ├── index.js          // Admin路由入口
│   ├── universes.js      // 宇宙管理 (/api/admin/universes/*)
│   └── auth.js           // 认证管理
├── auth.js               // 认证API (/api/auth/*)
├── health.js             // 健康检查 (/api/health/*)
└── middleware/
    ├── auth.js           // 认证中间件
    ├── validation.js     // 输入验证中间件
    └── errorHandler.js   // 错误处理中间件
```

**路由挂载示例**：
```javascript
// server.js
import portalRoutes from './src/routes/portal.js'
import universesRoutes from './src/routes/universes.js'
import adminRoutes from './src/routes/admin/index.js'
import authRoutes from './src/routes/auth.js'
import healthRoutes from './src/routes/health.js'

app.use('/api/portal', portalRoutes)
app.use('/api/universes', universesRoutes)  
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/health', healthRoutes)

// 保留现有的AI接口 (直接挂载)
app.post('/api/interpret', interpretHandler)
```

---

## TypeScript接口定义

### 前端类型定义建议 
`frontend_vue/src/shared/types/api-v2.ts`:

```typescript
// Portal API Types
export interface Universe {
  id: string
  code: string
  name: string
  description: string
  status: UniverseStatus
  coverImage?: string
  tags?: string[]
  stats?: UniverseStats
  createdAt: string
  updatedAt: string
}

export type UniverseStatus = 'active' | 'developing' | 'maintenance' | 'archived'

export interface UniverseStats {
  visitCount: number
  lastVisit: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  status: 'success' | 'error'
  message?: string
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId: string
}

// Portal Service Types
export interface PortalUniversesQuery {
  status?: UniverseStatus[]
  refresh?: boolean
  analytics?: boolean
}

export interface PortalUniversesResponse extends ApiResponse<never> {
  universes: Universe[]
  total: number
  metadata?: {
    lastUpdated: string
    cacheExpiry: string
  }
}
```

---

## E.1问题解决映射

### 高优先级问题解决方案

1. **Portal API缺失** [已解决]
   - 新增 `/api/portal/universes` - 获取Portal宇宙列表
   - 新增 `/api/portal/universes/:id` - 获取宇宙详情  
   - 新增 `/api/portal/universes/:id/visit` - 访问记录

2. **API契约脱节** [已解决]
   - 重新设计所有API端点，确保与前端期望一致
   - 建立TypeScript类型定义同步机制
   - 详细的请求/响应格式规范

3. **路由设计不规范** [已解决]
   - 标准化RESTful路由组织结构
   - 模块化路由文件组织建议
   - 统一的路径命名规范

### 中优先级问题解决方案

4. **错误处理不统一** [已解决]
   - 统一的 `ApiErrorResponse` 格式
   - 标准HTTP状态码使用规范
   - 错误处理中间件设计

5. **前端架构复杂** [设计方案]
   - 简化的TypeScript接口定义
   - 统一的API响应格式
   - 标准化的错误处理机制

6. **缺乏输入验证** [已解决]
   - 全面的输入验证策略
   - TypeScript接口驱动的验证
   - 安全验证要求

---

---

## 后续维护

### 版本管理
- 使用语义化版本控制
- 每次重大变更创建新版本文档
- 保留历史版本以供回溯

### 文档同步  
- API变更时同步更新此文档
- 前端TypeScript类型同步更新
- 实现与文档的一致性验证

### 监控和测试
- 建立API合同测试
- 监控API使用情况和性能
- 定期审查和优化

---

*文档生成时间: 2025-08-29*  
*基于: E.1 API架构全面审查报告 + E.9 实用性完善*  
*符合标准: RESTful + OpenAPI 3.0 + Express.js + TypeScript最佳实践*  
*实现状态: 基于E.1-E.9实际开发进度的准确反映*