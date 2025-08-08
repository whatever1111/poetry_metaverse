# 陆家花园主宇宙数据库设计 - v1

## 实体关系图 (ERD)

这是项目第一阶段设计的统一数据库模型。它旨在整合“毛小豆宇宙”和“周与春秋”两个子项目的数据。

```mermaid
erDiagram
    Universes {
        int id PK
        string name
        string description
    }

    Authors {
        int id PK
        string name
        string biography
    }

    Collections {
        int id PK
        string name
        string description
        int universe_id FK
    }

    Poems {
        int id PK
        string title
        text content
        string summary
        int collection_id FK
        int author_id FK
    }

    Characters {
        int id PK
        string name
        string role
        text description
        int universe_id FK
    }

    Themes {
        int id PK
        string name
        text description
        int universe_id FK
    }

    Scenes {
        int id PK
        string name
        text description
        int universe_id FK
    }

    Terms {
        int id PK
        string name
        text definition
        int universe_id FK
    }

    Questions {
        int id PK
        text question_text
        int collection_id FK
    }

    AnswerOptions {
        int id PK
        int question_id FK
        string option_char
        text option_text
        string meaning_code
    }

    PoemMappings {
        int id PK
        int collection_id FK
        string answer_combo
        int poem_id FK
    }

    Poem_Character_Links {
        int poem_id FK
        int character_id FK
    }

    Poem_Theme_Links {
        int poem_id FK
        int theme_id FK
    }

    Poem_Scene_Links {
        int poem_id FK
        int scene_id FK
    }

    Poem_Term_Links {
        int poem_id FK
        int term_id FK
    }

    Universes ||--o{ Collections : contains
    Authors ||--o{ Poems : "authors"
    Collections ||--o{ Poems : contains
    Collections ||--o{ Questions : contains

    Questions ||--o{ AnswerOptions : contains
    AnswerOptions }o..o{ PoemMappings : "forms"
    PoemMappings }o..o{ Poems : "points to"

    Poems }o--o{ Poem_Character_Links : links
    Characters }o--o{ Poem_Character_Links : links

    Poems }o--o{ Poem_Theme_Links : links
    Themes }o--o{ Poem_Theme_Links : links

    Poems }o--o{ Poem_Scene_Links : links
    Scenes }o--o{ Poem_Scene_Links : links

    Poems }o--o{ Poem_Term_Links : links
    Terms }o--o{ Poem_Term_Links : links
```

## 设计解读

### 设计核心
1.  **核心实体表**: `Universes`, `Authors`, `Collections`, `Poems` 构成了内容的基本框架。`Characters`, `Themes`, `Scenes`, `Terms` 用于存储“毛小豆宇宙”的元数据。
2.  **交互逻辑表**: `Questions`, `AnswerOptions`, `PoemMappings` 复刻了“周与春秋”的引导式交互流程。
3.  **关系连接表**: 如 `Poem_Character_Links`，用于解决实体间“多对多”的复杂关系。

### 总结
该结构具备统一性、兼容性和可扩展性，能为两个子项目提供一个稳固且统一的数据基础。

