# 统一 API 网关 - 契约样例（冻结草案）

> 用途：作为 C 阶段迁移的对照标准，确保前端行为不变。

## 公开接口（供 index.html）

### GET /api/projects
示例响应：
```json
[]
```

### GET /api/questions
示例响应：
```json
{}
```

### GET /api/mappings
示例响应：
```json
{ "defaultUnit": "观我生", "units": {}}
```

### GET /api/poems-all
示例响应：
```json
{}
```

### GET /api/poem-archetypes
示例响应：
```json
{ "poems": [] }
```

## 管理接口（供 admin.html）

### GET /api/admin/projects
示例响应：
```json
[]
```

### GET /api/admin/projects/:projectId/sub/:subProjectName
示例响应：
```json
{ "name": "观我生", "questions": [], "resultMap": {}, "poems": [] }
```

> 注：后续根据现网文件快照补充完整样例。


