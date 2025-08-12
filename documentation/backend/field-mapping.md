# 字段映射（DB → 前端契约）

> 目标：保持前端零改动，后端通过映射产出既有结构。

- ZhouProject → projects[]
  - id → id
  - name → name
  - description → description
  - poet → poet
  - status → status
  - subProjects[].name → subProjects[].name
  - subProjects[].description → subProjects[].description

- ZhouQA → questions
  - chapter → 键名（章节名）
  - question, optionA, optionB, meaningA, meaningB → {question, options:{A,B}, meaning:{A,B}}

- ZhouMapping → mappings
  - chapter + combination + poemTitle → units[chapter][combination] = poemTitle
  - defaultUnit 由配置或项目首选章生成

- ZhouPoem → poems-all
  - title（去书名号）→ 键名
  - body → 值

- ZhouPoem.poetExplanation → poem-archetypes
  - { poems: [{ title, poet_explanation }] }

> 注：后续根据现网数据快照补充细节。

---

## 详细映射说明（补充）

- projects（公开接口）
  - 仅返回 `status = "published"` 的项目。
  - 顺序保持文件版一致（按写入顺序或名称稳定排序）。

- questions
  - 若 DB 中为分表结构，按章节名聚合成键名。
  - 每题输出结构固定为：
    - `question: string`
    - `options: { A: string, B: string }`
    - `meaning: { A?: string, B?: string }`（可选字段，允许缺省）

- mappings
  - `defaultUnit` 的来源：若 DB 未显式设置，则取 `units` 的第一个章节名。
  - 对于不存在的章节，返回空对象，不省略键名。

- poems-all
  - 键名需移除标题中的中文书名号 `《》`。
  - 如正文缺失，键名可存在但值为空字符串或省略，保持与现网一致；推荐省略缺失项。

- poem-archetypes
  - 输出统一为 `{ poems: [{ title, poet_explanation }] }`。
  - 若 DB 字段为 `poetExplanation`，需在映射层改名为 `poet_explanation`。

## 错误响应映射（统一）

所有错误输出采用：
```json
{ "error": { "code": "SOME_CODE", "message": "描述" } }
```

建议错误码：
- `UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`CONFLICT`、`INTERNAL_SERVER_ERROR`


