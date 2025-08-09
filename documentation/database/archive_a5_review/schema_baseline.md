# 陆家花园主宇宙数据库设计 - v2 (草案)

## 实体关系图 (ERD) - v2

这是根据“主宇宙”关联模型修正后的数据库设计。它旨在建立一个统一的、高维度的概念层，让各子宇宙的内容映射其上，实现真正的跨宇宙融合。

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
        int universe_id FK "FK to a specific universe like 'Zhou & Spring Autumn'"
    }

    Poems {
        int id PK
        string title
        text content
        string summary
        int collection_id FK
        int author_id FK
    }

    %% --- Universal Concepts (Belong to the Main Universe) ---
    Universal_Themes {
        int id PK
        string name
        text description
    }

    Universal_Scenes {
        int id PK
        string name
        text description
    }

    Universal_Terms {
        int id PK
        string name
        text definition
    }
    %% --- End Universal Concepts ---

    Characters {
        int id PK
        string name
        string role
        text description
        int universe_id FK "FK to a specific universe like 'Maoxiaodou'"
    }

    %% --- Zhou & Spring Autumn Specific Tables ---
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
    %% --- End Zhou & Spring Autumn Specific Tables ---

    %% --- Link Tables for Many-to-Many Relationships ---
    Poem_Character_Links {
        int poem_id FK
        int character_id FK
    }

    Poem_Theme_Links {
        int poem_id FK
        int theme_id FK "Links to Universal_Themes"
    }

    Poem_Scene_Links {
        int poem_id FK
        int scene_id FK "Links to Universal_Scenes"
    }

    Poem_Term_Links {
        int poem_id FK
        int term_id FK "Links to Universal_Terms"
    }
    %% --- End Link Tables ---

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
    Universal_Themes }o--o{ Poem_Theme_Links : links

    Poems }o--o{ Poem_Scene_Links : links
    Universal_Scenes }o--o{ Poem_Scene_Links : links

    Poems }o--o{ Poem_Term_Links : links
    Universal_Terms }o--o{ Poem_Term_Links : links
```

## 设计解读 - v2

### 核心变更
1.  **概念中立化**: 移除了原 `Themes`, `Scenes`, `Terms` 表中的 `universe_id` 外键，并将它们重命名为 `Universal_Themes`, `Universal_Scenes`, `Universal_Terms`。这使它们成为了**独立于任何子宇宙的、可被全局共享的核心概念**。
2.  **关联解耦**: 诗歌 (`Poems`) 与这些通用概念的关联，完全通过链接表（如 `Poem_Theme_Links`）实现。这意味着，任何宇宙中的任何一首诗，都可以链接到任何一个通用主题上，从而实现了真正的跨宇宙数据融合。
3.  **保留特有实体**: 像 `Characters` 这样强绑定于某一宇宙的实体，仍然保留其 `universe_id` 外键，维持其特有属性。

### 总结
v2版本的Schema现在完全能够支撑我们设想的“陆家花园主宇宙”的关联模型。它结构清晰、高度可扩展，并为未来的跨宇宙功能奠定了坚实的数据基础。
