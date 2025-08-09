# 差异概览摘要（为审查而加）

- 核心范式转移：从宇宙内聚的表结构（Authors/Collections/Poems/Questions 等）转为“主宇宙中立实体 + 子宇宙桥表”的模型。
  - 中立实体：Theme/Archetype/Emotion（不绑定具体子宇宙）
  - 桥接关系：UniverseTheme / UniverseArchetype / UniverseEmotion（以 Universe 作用域解耦）
- 子宇宙内表：
  - 毛小豆：MaoxiaodouPoem（title/body/metadata + universeId）
  - 周与春秋：ZhouQA（问答项）、ZhouMapping（结果→诗歌标题）
- 统一诗歌库取舍：
  - 方案A：主宇宙 Poem（跨宇宙统一存储）
  - 方案B：各宇宙自持诗库 + 通过视图/物化映射统一（当前草案偏向B）
- 约束与策略：
  - 稳定字符串ID、去重合并中立实体、桥表复合唯一键、Universe 禁止级联删除中立实体、允许受控冗余
- 迁移步骤（概览）：
  1) 初始化 Universe（毛小豆/周与春秋）
  2) 导入 Theme/Archetype/Emotion（去重）
  3) 生成桥表（Universe*）
  4) 导入 MaoxiaodouPoem
  5) 导入 ZhouQA / ZhouMapping
  6) 统一 poemTitle 引用（视图/物化表）
  7) 计数/唯一性/FK/典型联结校验

## 待决策清单
- 是否采用主宇宙 Poem 表（A）或视图统一（B）
- Emotion 极性/强度字段取值域（enum/范围）
- Concept（术语/理论/场景标签）是否纳入 v2
- Universe 命名与ID规范（如 `universe_maoxiaodou`）
- 桥表是否保留 confidence/weight 字段
- baseline 中 Authors/Collections 的落位：子宇宙内保留 vs 融合为主宇宙 Poem/Universe 元信息

## 验收标准（A-5）
- 中立实体与桥表结构定稿（字段/唯一键/删除策略）
- 至少 3 个跨宇宙典型查询通过（Theme→Poem、Chapter→Archetypes、Universe→Emotion 分布）
- 迁移演练（dry run）完成并出具校验报告

## 建议下一步
- 在 `schema_draft.md` 用 [DECISION] 标注上述决策并给出选项取舍
- 列出 3 个“典型查询”目标与期望结果结构（SQL/Prisma 伪代码均可）

--- documentation/database/review/schema_baseline.md	2025-08-09 13:05:50.840177600 +0800
+++ documentation/database/review/schema_draft.md	2025-08-09 22:49:13.021387600 +0800
@@ -1,140 +1,132 @@
-# 陆家花园主宇宙数据库设计 - v2 (草案)
-
-## 实体关系图 (ERD) - v2
-
-这是根据“主宇宙”关联模型修正后的数据库设计。它旨在建立一个统一的、高维度的概念层，让各子宇宙的内容映射其上，实现真正的跨宇宙融合。
-
-```mermaid
-erDiagram
-    Universes {
-        int id PK
-        string name
-        string description
-    }
-
-    Authors {
-        int id PK
-        string name
-        string biography
-    }
-
-    Collections {
-        int id PK
-        string name
-        string description
-        int universe_id FK "FK to a specific universe like 'Zhou & Spring Autumn'"
-    }
-
-    Poems {
-        int id PK
-        string title
-        text content
-        string summary
-        int collection_id FK
-        int author_id FK
-    }
-
-    %% --- Universal Concepts (Belong to the Main Universe) ---
-    Universal_Themes {
-        int id PK
-        string name
-        text description
-    }
-
-    Universal_Scenes {
-        int id PK
-        string name
-        text description
-    }
-
-    Universal_Terms {
-        int id PK
-        string name
-        text definition
-    }
-    %% --- End Universal Concepts ---
-
-    Characters {
-        int id PK
-        string name
-        string role
-        text description
-        int universe_id FK "FK to a specific universe like 'Maoxiaodou'"
-    }
-
-    %% --- Zhou & Spring Autumn Specific Tables ---
-    Questions {
-        int id PK
-        text question_text
-        int collection_id FK
-    }
-
-    AnswerOptions {
-        int id PK
-        int question_id FK
-        string option_char
-        text option_text
-        string meaning_code
-    }
-
-    PoemMappings {
-        int id PK
-        int collection_id FK
-        string answer_combo
-        int poem_id FK
-    }
-    %% --- End Zhou & Spring Autumn Specific Tables ---
-
-    %% --- Link Tables for Many-to-Many Relationships ---
-    Poem_Character_Links {
-        int poem_id FK
-        int character_id FK
-    }
-
-    Poem_Theme_Links {
-        int poem_id FK
-        int theme_id FK "Links to Universal_Themes"
-    }
-
-    Poem_Scene_Links {
-        int poem_id FK
-        int scene_id FK "Links to Universal_Scenes"
-    }
-
-    Poem_Term_Links {
-        int poem_id FK
-        int term_id FK "Links to Universal_Terms"
-    }
-    %% --- End Link Tables ---
-
-    Universes ||--o{ Collections : contains
-    Authors ||--o{ Poems : "authors"
-    Collections ||--o{ Poems : contains
-    Collections ||--o{ Questions : contains
-
-    Questions ||--o{ AnswerOptions : contains
-    AnswerOptions }o..o{ PoemMappings : "forms"
-    PoemMappings }o..o{ Poems : "points to"
-
-    Poems }o--o{ Poem_Character_Links : links
-    Characters }o--o{ Poem_Character_Links : links
-
-    Poems }o--o{ Poem_Theme_Links : links
-    Universal_Themes }o--o{ Poem_Theme_Links : links
-
-    Poems }o--o{ Poem_Scene_Links : links
-    Universal_Scenes }o--o{ Poem_Scene_Links : links
-
-    Poems }o--o{ Poem_Term_Links : links
-    Universal_Terms }o--o{ Poem_Term_Links : links
-```
-
-## 设计解读 - v2
-
-### 核心变更
-1.  **概念中立化**: 移除了原 `Themes`, `Scenes`, `Terms` 表中的 `universe_id` 外键，并将它们重命名为 `Universal_Themes`, `Universal_Scenes`, `Universal_Terms`。这使它们成为了**独立于任何子宇宙的、可被全局共享的核心概念**。
-2.  **关联解耦**: 诗歌 (`Poems`) 与这些通用概念的关联，完全通过链接表（如 `Poem_Theme_Links`）实现。这意味着，任何宇宙中的任何一首诗，都可以链接到任何一个通用主题上，从而实现了真正的跨宇宙数据融合。
-3.  **保留特有实体**: 像 `Characters` 这样强绑定于某一宇宙的实体，仍然保留其 `universe_id` 外键，维持其特有属性。
-
-### 总结
-v2版本的Schema现在完全能够支撑我们设想的“陆家花园主宇宙”的关联模型。它结构清晰、高度可扩展，并为未来的跨宇宙功能奠定了坚实的数据基础。
+# schema_draft.md（草案）
+
+本草案仅用于 A-5 架构审查阶段，描述“主宇宙中立实体 + 子宇宙桥接”的目标模型。暂不落库、不生成 Prisma 代码。
+
+## 设计原则
+- 中立：核心概念（Themes/Archetypes/Emotions）不绑定任何具体子宇宙。
+- 解耦：子宇宙（毛小豆、周与春秋）通过桥表与中立实体建立关联。
+- 受控冗余：允许在子宇宙保留必要的本地字段，但跨宇宙共享走中立实体。
+- 稳定 ID：所有表使用稳定且可迁移的字符串 ID（如 `lugarden_*` 前缀）。
+
+## 核心中立实体（主宇宙）
+1) Theme（主题）
+   - id (PK)
+   - name (unique)
+   - description
+
+2) Archetype（原型）
+   - id (PK)
+   - name (unique)
+   - description
+   - themeId (FK → Theme.id)
+
+3) Emotion（情感）
+   - id (PK)
+   - name (unique)
+   - polarity (enum: positive/neutral/negative)
+   - intensity (int, 1-5)
+
+（可选）4) Concept（概念库，用于扩展）
+   - id (PK)
+   - name (unique)
+   - kind (enum: term/theory/scene-tag/...)
+   - description
+
+## 子宇宙与桥表
+1) Universe（子宇宙）
+   - id (PK) （如：`universe_maoxiaodou`、`universe_zhou_spring_autumn`）
+   - code (unique)
+   - name
+   - description
+   - type (enum: maoxiaodou/zhou_spring_autumn/other)
+
+2) UniverseTheme（桥：子宇宙 ↔ 主题）
+   - id (PK)
+   - universeId (FK → Universe.id)
+   - themeId (FK → Theme.id)
+   - confidence (0..1)
+   - note
+   - unique(universeId, themeId)
+
+3) UniverseArchetype（桥：子宇宙 ↔ 原型）
+   - id (PK)
+   - universeId (FK → Universe.id)
+   - archetypeId (FK → Archetype.id)
+   - confidence (0..1)
+   - note
+   - unique(universeId, archetypeId)
+
+4) UniverseEmotion（桥：子宇宙 ↔ 情感）
+   - id (PK)
+   - universeId (FK → Universe.id)
+   - emotionId (FK → Emotion.id)
+   - weight (0..1)
+   - unique(universeId, emotionId)
+
+## 子宇宙内实体（示意）
+1) MaoxiaodouPoem（毛小豆：诗歌文本库）
+   - id (PK)
+   - title (unique within universe)
+   - body
+   - metadata (json)
+   - universeId (FK → Universe.id)
+
+2) ZhouQA（周与春秋：问答条目）
+   - id (PK)
+   - chapter (e.g. 观我生/雨，木冰/是折枝)
+   - index (int) 题序
+   - question
+   - optionA
+   - optionB
+   - meaningA
+   - meaningB
+   - universeId (FK → Universe.id)
+
+3) ZhouMapping（周与春秋：结果映射 → 诗歌标题）
+   - id (PK)
+   - chapter
+   - combination (e.g. 1100)
+   - poemTitle (string，与 MaoxiaodouPoem.title 对齐或走统一诗歌库)
+   - universeId (FK → Universe.id)
+   - unique(universeId, chapter, combination)
+
+（可选统一诗歌表）Poem（主宇宙诗歌库，用于跨宇宙复用）
+   - id (PK)
+   - title (unique)
+   - body
+   - sourceUniverseId (nullable FK)
+
+## 关系草案（卡片）
+- Theme 1..* Archetype
+- Archetype 1..* (via bridge) Universe
+- Emotion *..* Universe（UniverseEmotion）
+- MaoxiaodouPoem → Universe (N:1)
+- ZhouQA/ZhouMapping → Universe (N:1)
+- ZhouMapping.poemTitle ↔ Poem.title 或 ↔ MaoxiaodouPoem.title（通过视图/物化表统一）
+
+## 约束与策略
+- 删除策略：Universe 禁止级联删除核心中立实体；桥表随 Universe 删除。
+- 命名唯一性：Theme/Archetype/Emotion 在主宇宙内唯一；子宇宙内允许同名但通过 Universe 作用域约束。
+- 校验：迁移后对照 JSON 源进行计数与引用完整性校验；关键桥表建立 `unique` 复合键。
+
+## 迁移步骤（自 JSON → DB）
+1) 初始化 Universe（两条记录：毛小豆、周与春秋）。
+2) 导入 Theme/Archetype/Emotion（去重合并）。
+3) 根据 JSON 统计/映射，生成 UniverseTheme/UniverseArchetype/UniverseEmotion。
+4) 导入 MaoxiaodouPoem（从 `poems.json`/文本目录），保留原标题与正文。
+5) 导入 ZhouQA/ZhouMapping（从 `questions.json` / `mappings.json`）。
+6) 对 `poemTitle` 建立到统一 `Poem` 或 `MaoxiaodouPoem` 的引用关系（可通过视图或物化映射表）。
+7) 全量校验：计数、唯一性、FK 完整性、典型查询联结可用性。
+
+## Prisma 草案片段（供 A-4 参考，不立即使用）
+```prisma
+model Theme { id String @id @db.VarChar(64) name String @unique description String? archetypes Archetype[] }
+model Archetype { id String @id @db.VarChar(64) name String @unique description String? themeId String theme Theme @relation(fields: [themeId], references: [id]) bridges UniverseArchetype[] }
+model Emotion { id String @id @db.VarChar(64) name String @unique polarity String intensity Int bridges UniverseEmotion[] }
+model Universe { id String @id @db.VarChar(64) code String @unique name String type String description String? themes UniverseTheme[] archetypes UniverseArchetype[] emotions UniverseEmotion[] }
+model UniverseTheme { id String @id @db.VarChar(64) universeId String themeId String confidence Float? note String? universe Universe @relation(fields: [universeId], references: [id]) theme Theme @relation(fields: [themeId], references: [id]) @@unique([universeId, themeId]) }
+model UniverseArchetype { id String @id @db.VarChar(64) universeId String archetypeId String confidence Float? note String? universe Universe @relation(fields: [universeId], references: [id]) archetype Archetype @relation(fields: [archetypeId], references: [id]) @@unique([universeId, archetypeId]) }
+model UniverseEmotion { id String @id @db.VarChar(64) universeId String emotionId String weight Float? universe Universe @relation(fields: [universeId], references: [id]) emotion Emotion @relation(fields: [emotionId], references: [id]) @@unique([universeId, emotionId]) }
+```
+
+> 说明：上段仅为 A-4 的实现草图，真实字段/索引会在 A-5 审查完成后再定稿并落库。
