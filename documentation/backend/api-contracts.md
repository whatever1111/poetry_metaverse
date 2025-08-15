# 陆家花园项目 - API 合同

> **最后更新**: YYYY-MM-DD
> **通用错误响应**: `{ "error": { "code": "ERROR_CODE", "message": "Error description" } }`

---

## Phase 2: 多宇宙架构 (Multi-Universe Architecture)

### 管理接口 (Admin API)

#### 宇宙管理 (Universe Management)

##### `[Phase 2 - New]` GET /api/admin/universes
- **说明**: 获取所有已创建的宇宙 (`Universe`) 列表。
- **权限**: 需要认证。
- **成功响应 (200 OK)**:
  ```json
  [
    {
      "id": "clxqlb51d000008l4acc6fpw7",
      "name": "周与春秋",
      "code": "zhou_spring_autumn",
      "type": "POEM_PROJECT",
      "description": "“观我生”系列诗歌宇宙",
      "status": "published",
      "createdAt": "2025-08-15T10:00:00.000Z",
      "updatedAt": "2025-08-15T10:00:00.000Z"
    }
  ]
  ```

##### `[Phase 2 - New]` POST /api/admin/universes
- **说明**: 创建一个新的宇宙 (`Universe`)。
- **权限**: 需要认证。
- **请求体**:
  ```json
  {
    "name": "毛小豆宇宙",
    "code": "mao_xiao_dou",
    "type": "STORY_CHARACTER",
    "description": "毛小豆的故事与冒险"
  }
  ```
- **成功响应 (201 Created)**: 返回新创建的宇宙对象。
- **错误响应 (400 Bad Request)**: 如果 `code` 字段已存在或无效。

##### `[Phase 2 - New]` PUT /api/admin/universes/:id
- **说明**: 更新指定 ID 的宇宙信息。
- **权限**: 需要认证。
- **请求体**: 包含一个或多个要更新的字段（如 `name`, `description`, `status`）。
- **成功响应 (200 OK)**: 返回更新后的宇宙对象。
- **错误响应 (404 Not Found)**: 如果指定的 ID 不存在。

##### `[Phase 2 - New]` DELETE /api/admin/universes/:id
- **说明**: 删除指定 ID 的宇宙。
- **权限**: 需要认证。
- **成功响应 (204 No Content)**:
- **错误响应 (404 Not Found)**: 如果指定的 ID 不存在。

---

### 公开接口 (Public API)

##### `[Phase 2 - New]` GET /api/universes
- **说明**: 获取所有状态为 `published` 的宇宙列表，供门户页面展示。
- **成功响应 (200 OK)**:
  ```json
  [
    {
      "name": "周与春秋",
      "code": "zhou_spring_autumn",
      "description": "“观我生”系列诗歌宇宙",
      "coverImage": "/assets/covers/zhou.png" 
    }
  ]
  ```

##### `[Phase 2 - New]` GET /api/universes/:universeCode/content
- **说明**: 获取特定宇宙的核心内容。响应内容的结构由该宇宙的 `type` 决定。
- **成功响应 (200 OK)**:
  - **示例 (当 `universeCode` = `zhou_spring_autumn`)**:
    ```json
    {
      "projects": [
        {
          "id": "a1b2c3",
          "name": "观我生",
          "description": "项目说明",
          "poet": "周春秋",
          "subProjects": [ { "name": "观我生", "description": "章节说明" } ]
        }
      ],
      "questions": { /* ... */ },
      "mappings": { /* ... */ },
      "poems": { /* ... */ }
    }
    ```
- **错误响应 (404 Not Found)**: 如果 `universeCode` 无效或宇宙未发布。

---

## Phase 1: 单体架构 (Monolithic Architecture) - 已归档

> **说明**: 以下 API 是第一阶段的产物。在第二阶段中，它们部分被废弃，部分其功能被新的、以宇宙为中心的 API 所取代。

### 公开接口 (Public API)

##### `[Deprecated]` GET /api/projects
- **状态**: 已废弃。请使用 `GET /api/universes/:universeCode/content`。

##### `[Deprecated]` GET /api/questions
- **状态**: 已废弃。请使用 `GET /api/universes/:universeCode/content`。

##### `[Deprecated]` GET /api/mappings
- **状态**: 已废弃。请使用 `GET /api/universes/:universeCode/content`。

##### `[Deprecated]` GET /api/poems-all
- **状态**: 已废弃。请使用 `GET /api/universes/:universeCode/content`。

##### `[Phase 3 - Enhanced]` GET /api/poem-archetypes
- **状态**: Phase 3 重新设计，返回完整的诗歌原型数据。
- **说明**: 获取诗歌原型数据，包含古典回响、核心主题、人生困境等深度分析字段。
- **成功响应 (200 OK)**:
  ```json
  {
    "poems": [
      {
        "title": "论发生奇怪事情时",
        "poet_explanation": "这些场景都挺古怪的...",
        "classicalEcho": "《易经》云：观我生，进退...",
        "coreTheme": "面对人生中的奇怪现象",
        "problemSolved": "如何处理生活中突如其来的奇怪事件",
        "spiritualConsolation": "通过观察和思考获得内心的平静",
        "chapter": "观我生",
        "body": "诗歌正文内容..."
      }
    ]
  }
  ```
- **字段说明**:
  - `title`: 诗歌标题
  - `poet_explanation`: 诗人解读
  - `classicalEcho`: 古典智慧回响
  - `coreTheme`: 核心主题
  - `problemSolved`: 解决的人生困境
  - `spiritualConsolation`: 精神慰藉
  - `chapter`: 所属章节
  - `body`: 诗歌正文


### 管理接口 (Admin API)

##### `[Context-Changed]` GET /api/admin/projects
- **状态**: 上下文变更。此接口在 Phase 2 中将作为“周与春秋”宇宙的专属管理接口，通过动态路由在后台加载。其功能保持不变。

##### `[Context-Changed]` GET /api/admin/projects/:projectId/sub/:subProjectName
- **状态**: 上下文变更。同上，作为“周与春秋”宇宙的专属管理接口。

##### `[Deprecated]` POST /api/admin/publish-all
- **状态**: 已废弃。发布状态由 `Universe` 模型的 `status` 字段控制。

---
> 注：所有 Phase 1 的接口实现细节，请参考 Git History 中 Phase 1 完成时的版本。


