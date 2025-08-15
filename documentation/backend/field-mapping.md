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

- ZhouPoem → poem-archetypes (Phase 3 完整映射)
  - title → title
  - poetExplanation → poet_explanation
  - classicalEcho → classicalEcho
  - coreTheme → coreTheme
  - problemSolved → problemSolved
  - spiritualConsolation → spiritualConsolation
  - chapter → chapter
  - body → body
  - 输出格式: { poems: [{ title, poet_explanation, classicalEcho, coreTheme, problemSolved, spiritualConsolation, chapter, body }] }
  - 字段说明:
    - classicalEcho: 古典智慧回响，连接现代诗歌与古典文献
    - coreTheme: 诗歌核心主题，用于AI解读和内容推荐
    - problemSolved: 诗歌解决的人生困境，增强用户共鸣
    - spiritualConsolation: 精神慰藉内容，提供情感支持
    - chapter: 所属章节，用于内容组织和导航
    - body: 诗歌正文，完整文本内容

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
  - 输出统一为 `{ poems: [{ title, poet_explanation, classicalEcho, coreTheme, problemSolved, spiritualConsolation, chapter, body }] }`。
  - 若 DB 字段为 `poetExplanation`，需在映射层改名为 `poet_explanation`。
  - Phase 3 新增字段：classicalEcho、coreTheme、problemSolved、spiritualConsolation、chapter、body

## 错误响应映射（统一）

所有错误输出采用：
```json
{ "error": { "code": "SOME_CODE", "message": "描述" } }
```

建议错误码：
- `UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`CONFLICT`、`INTERNAL_SERVER_ERROR`

---

## 多宇宙架构扩展说明

### 当前支持的宇宙
- **周与春秋宇宙** (`zhou_spring_autumn`): 诗歌问答宇宙，包含观我生系列诗歌
- **毛小豆宇宙** (`mao_xiao_dou`): 故事角色宇宙，包含毛小豆的故事内容

### 字段映射的通用性
- 上述映射规则主要基于周与春秋宇宙的 `ZhouPoem` 模型
- 其他宇宙可根据其特定需求定义相应的字段映射
- 建议保持映射结构的一致性，便于前端统一处理

### 未来扩展
- 每个宇宙可定义自己的数据模型和映射规则
- 保持API接口的统一性，通过宇宙代码区分不同内容
- 建立通用的映射模式，支持新宇宙的快速集成


