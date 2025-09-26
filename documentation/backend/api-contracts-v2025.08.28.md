# 陆家花园项目 - API 合同 v2025.08.28

> **版本**: v2025.08.28  
> **最后更新**: 2025-08-28  
> **基于**: E.1 API架构全面审查报告的系统性重设计  
> **技术栈**: Express.js + TypeScript + Prisma ORM + SQLite  

---

## 📋 版本变更历史

### v2025.08.28 - 系统性重设计 (当前版本)
**基于E.1审查报告的问题解决**：
- ✅ **Portal API完全缺失** → 新增完整Portal API规范
- ✅ **API契约脱节** → 重新设计所有API端点，确保前后端期望一致
- ✅ **路由设计不规范** → 标准化RESTful路由组织
- ✅ **错误处理不统一** → 统一错误响应格式和状态码
- ✅ **缺乏输入验证** → 设计标准化请求验证策略
- ✅ **前端架构复杂** → 简化API客户端设计方案

**理论标准映射**：
- OpenAPI 3.0 → TypeScript接口 + 详细API文档
- RESTful原则 → 资源导向的Express.js路由组织
- HTTP标准 → 规范的状态码和动词使用

### v2025.08.18 (历史版本)
- 原始版本，存在系统性架构问题
- 备份位置：`api-contracts-v2025.08.18.md`

---

## 🌐 统一标准

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

---

## 🎯 Portal API - 宇宙门户接口

> **新增**: 解决前端Portal模块API期望与后端实现脱节问题

### 基础路径
`/api/portal/*`

### Portal API规范

#### GET /api/portal/universes
**功能**: 获取Portal页面展示的宇宙列表  
**权限**: 公开  
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

---

## 🌌 Universe Content API - 宇宙内容接口

> **重新设计**: 统一宇宙内容访问规范

### 基础路径
`/api/universes/*`

#### GET /api/universes
**功能**: 获取所有已发布的宇宙列表  
**权限**: 公开  
**查询参数**:
```typescript
interface UniversesQuery {
  status?: 'published' | 'draft'  // 默认: published
  type?: string                   // 宇宙类型过滤
  refresh?: boolean              // 强制刷新
}
```

**成功响应 (200 OK)**:
```typescript
interface UniversesResponse {
  universes: PublicUniverse[]
  total: number
  status: 'success'
}

interface PublicUniverse {
  id: string
  code: string
  name: string
  type: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}
```

#### GET /api/universes/:universeCode/content
**功能**: 获取特定宇宙的完整内容  
**权限**: 公开  
**路径参数**:
- `universeCode: string` - 宇宙代码 (如: zhou_spring_autumn)

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

---

## 🔐 Admin API - 管理接口

> **标准化**: 统一管理接口规范和认证机制

### 基础路径
`/api/admin/*`

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

---

## 🔑 Authentication API - 认证接口

> **标准化**: 统一认证流程和会话管理

### 基础路径
`/api/auth/*`

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

---

## 🤖 AI Services API - AI服务接口

> **保持现有**: 已实现的AI功能接口

### 基础路径
直接挂载到 `/api/*` (由server.js处理)

#### POST /api/interpret
**功能**: AI诗歌解读  
**权限**: 公开  
**实现**: 已在server.js中实现，使用Google Generative AI

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

---

## 📊 Health & Monitoring API - 健康检查接口

> **新增**: 系统监控和健康状态检查

### 基础路径
`/api/health/*`

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

---

## 🔧 Express.js 路由组织建议

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

## 🎨 TypeScript接口定义

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

## ✅ E.1问题解决映射

### 高优先级问题解决方案

1. **Portal API缺失** ✅ 已解决
   - 新增 `/api/portal/universes` - 获取Portal宇宙列表
   - 新增 `/api/portal/universes/:id` - 获取宇宙详情  
   - 新增 `/api/portal/universes/:id/visit` - 访问记录

2. **API契约脱节** ✅ 已解决
   - 重新设计所有API端点，确保与前端期望一致
   - 建立TypeScript类型定义同步机制
   - 详细的请求/响应格式规范

3. **路由设计不规范** ✅ 已解决
   - 标准化RESTful路由组织结构
   - 模块化路由文件组织建议
   - 统一的路径命名规范

### 中优先级问题解决方案

4. **错误处理不统一** ✅ 已解决
   - 统一的 `ApiErrorResponse` 格式
   - 标准HTTP状态码使用规范
   - 错误处理中间件设计

5. **前端架构复杂** ✅ 设计方案
   - 简化的TypeScript接口定义
   - 统一的API响应格式
   - 标准化的错误处理机制

6. **缺乏输入验证** ✅ 已解决
   - 全面的输入验证策略
   - TypeScript接口驱动的验证
   - 安全验证要求

---

## 🚀 实施建议

### 第一阶段：Portal API实现 (高优先级)
1. 创建 `src/routes/portal.js` - 实现Portal API端点
2. 更新前端 `PortalApiService` - 调用新的API端点  
3. 移除前端硬编码数据依赖

### 第二阶段：错误处理统一 (中优先级)
1. 创建 `src/middleware/errorHandler.js` - 统一错误处理
2. 更新所有路由 - 使用标准错误格式
3. 前端更新错误处理逻辑

### 第三阶段：输入验证 (中优先级)  
1. 创建 `src/middleware/validation.js` - 请求验证
2. 为所有API端点添加验证规则
3. 安全防护机制实施

### 第四阶段：路由重构 (长期)
1. 重构现有路由组织结构
2. 迁移server.js中的路由到模块化文件
3. 建立标准化的开发流程

---

## 📝 后续维护

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

*文档生成时间: 2025-08-28*  
*基于: E.1 API架构全面审查报告*  
*符合标准: RESTful + OpenAPI 3.0 + Express.js + TypeScript最佳实践*
