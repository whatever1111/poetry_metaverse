# 统一 API 网关 - 契约样例（冻结）

> 用途：作为 C 阶段迁移的对照标准，确保前端行为不变。错误响应统一采用：
>
> `{ "error": { "code": string, "message": string } }`

## 公开接口（供 index.html）

### GET /api/projects
- 说明：返回“线上项目列表”中的所有项目，数组形式。
- 200 示例：
```json
[
  {
    "id": "a1b2c3",
    "name": "观我生",
    "description": "项目说明",
    "poet": "周春秋",
    "status": "published",
    "subProjects": [
      { "name": "观我生", "description": "章节说明" }
    ]
  }
]
```
- 500 示例：
```json
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "无法加载项目结构" } }
```

### GET /api/questions
- 说明：返回问答数据（按章节名分组）。
- 200 示例：
```json
{
  "观我生": [
    {
      "question": "问题文本",
      "options": { "A": "选项A", "B": "选项B" },
      "meaning": { "A": "含义A", "B": "含义B" }
    }
  ]
}
```
- 500 示例：
```json
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "Failed to read questions" } }
```

### GET /api/mappings
- 说明：返回结果映射。
- 200 示例：
```json
{
  "defaultUnit": "观我生",
  "units": {
    "观我生": { "A-B": "某首诗名" }
  }
}
```
- 500 示例：
```json
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "Failed to read mappings" } }
```

### GET /api/poems-all
- 说明：返回“章节诗歌正文”，键名为去除书名号后的标题。
- 200 示例：
```json
{
  "论不完全只有坏事": "诗歌正文..."
}
```
- 500 示例：
```json
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "Failed to read poems" } }
```

### GET /api/poem-archetypes
- 说明：返回诗歌原型集合。
- 200 示例：
```json
{ "poems": [ { "title": "观我生·其一", "poet_explanation": "诗人解读..." } ] }
```
- 500 示例：
```json
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "Failed to read poem archetypes" } }
```

## 管理接口（供 admin.html）

### 认证失败（通用）
- 401 示例：
```json
{ "error": { "code": "UNAUTHORIZED", "message": "需要认证" } }
```

### GET /api/admin/projects
- 说明：返回草稿区的所有主项目（含 `status`）。
- 200 示例：
```json
[
  {
    "id": "a1b2c3",
    "name": "观我生",
    "description": "项目说明",
    "poet": "周春秋",
    "status": "draft",
    "subProjects": [ { "name": "观我生", "description": "章节说明" } ]
  }
]
```

### GET /api/admin/projects/:projectId/sub/:subProjectName
- 说明：返回指定子项目在草稿区的聚合数据。
- 200 示例：
```json
{
  "name": "观我生",
  "questions": [
    { "question": "问题文本", "options": { "A": "选项A", "B": "选项B" } }
  ],
  "resultMap": { "A-B": "某首诗名" },
  "poems": [ { "id": "某诗", "title": "某诗", "body": "正文..." } ]
}
```
- 404 示例：
```json
{ "error": { "code": "NOT_FOUND", "message": "子项目不存在" } }
```

### POST /api/admin/publish-all（已弃用）
- 说明：自 C-5 起发布由 `status=draft|published` 控制，本接口为 no-op，仅返回提示。
- 200 示例：
```json
{ "message": "发布机制已切换为按项目 status 控制（draft/published）。/api/admin/publish-all 已弃用且不再写入文件。", "next": "请通过 /api/admin/projects/:projectId/status 切换状态，前台 /api/projects 自动反映 published 项目" }
```

> 注：以上示例以现有文件读写实现输出为对照，后续迁移到 DB 时必须保持完全一致的键名与层级。


