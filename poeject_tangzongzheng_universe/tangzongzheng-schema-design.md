# 唐宗正宇宙JSON数据格式设计 - 实验阶段

> **设计哲学**  
> 参考周与春秋项目的`poem_archetypes.json`格式，保持简洁实用的JSON结构。  
> 确保能轻松集成到未来的生产数据库，但避免在实验阶段的过度工程化。

---

## 设计原则

### 1. 简洁优先
- **干净的JSON结构**：仅包含必要的基础字段
- **避免过度设计**：不预留AI字段、不设计桥接关系
- **数据完整性**：保持李尤台诗歌的原始语言质感

### 2. 未来兼容性
- **可扩展ID规范**：使用`tangzongzheng_poem_*`格式
- **标准化字段**：与现有宇宙字段名保持一致
- **数据库友好**：字段类型便于后续Prisma集成

### 3. 李尤台诗学特色保持
- **双集合区分**：《偶记集》vs《爱人》的创作模式差异
- **观念碎片记录**：通过body字段保持原始语言质感
- **时间维度**：精确的创作日期（YYYY-MM格式）

---

## JSON数据格式设计

### 单个诗歌对象格式

参考周与春秋项目的`poem_archetypes.json`，设计简洁的诗歌对象：

```json
{
  "id": "tangzongzheng_poem_001",
  "title": "偶记",
  "author": "李尤台",
  "collection": "偶记集",
  "section": "阳光雨露",
  "sectionNumber": 1,
  "sequence": 1,
  "date": "2023-05",
  "body": "我喜爱夏天饱满的光照\n那饱满的光照有时\n仿佛把我留在了\n众人俱已夺门而出后\n模糊的一点荡漾里。..."
}
```

### 字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | string | 唯一标识符，格式：`tangzongzheng_poem_XXX` | `tangzongzheng_poem_001` |
| `title` | string | 诗歌标题（来自YAML Front Matter） | `"偶记"` |
| `author` | string | 作者，固定为"李尤台" | `"李尤台"` |
| `collection` | string | 诗集名称："偶记集"或"爱人" | `"偶记集"` |
| `section` | string | 辑名（如"阳光雨露"、"急就诗"等） | `"阳光雨露"` |
| `sectionNumber` | number | 辑序号（1-5） | `1` |
| `sequence` | number | 在辑内的序号 | `1` |
| `date` | string | 创作日期，YYYY-MM格式 | `"2023-05"` |
| `body` | string | 诗歌正文内容（保持换行符） | `"诗歌内容..."` |

### 完整JSON文件格式

`tangzongzheng-poems.json`整体结构：

```json
{
  "metadata": {
    "universe_id": "universe_tangzongzheng",
    "universe_name": "唐宗正宇宙",
    "version": "1.0.0",
    "generated_at": "2025-09-15T...",
    "data_source": "99个标准化李尤台诗歌.md文件",
    "total_poems": 99,
    "collections": {
      "偶记集": 56,
      "爱人": 43
    },
    "sections": {
      "阳光雨露": 14,
      "异性阑珊": 14,
      "感时孕": 14,
      "伪士嚎": 14,
      "急就诗": 17,
      "改良派": 8,
      "学朽": 7,
      "歪门邪道": 6,
      "儒家": 5
    }
  },
  "poems": [
    {
      "id": "tangzongzheng_poem_001",
      "title": "偶记",
      "author": "李尤台",
      "collection": "偶记集",
      "section": "阳光雨露",
      "sectionNumber": 1,
      "sequence": 1,
      "date": "2023-05",
      "body": "我喜爱夏天饱满的光照..."
    }
    // ... 继续99首诗歌
  ]
}
```

---

## 未来数据库集成路径

当需要集成到生产数据库时，这个简洁的JSON结构可以轻松转换：

### 数据库表映射
```sql
-- 基础诗歌表（对应JSON中的poems数组每个对象）
CREATE TABLE TangzongzhengPoem (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  collection TEXT NOT NULL,
  section TEXT NOT NULL,
  sectionNumber INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  date TEXT NOT NULL,
  body TEXT NOT NULL,
  universeId TEXT DEFAULT 'universe_tangzongzheng',
  FOREIGN KEY (universeId) REFERENCES Universe(id)
);
```

### 集成优势
- ✅ **字段完全对应**：JSON字段可直接映射为数据库列
- ✅ **ID规范一致**：使用`tangzongzheng_poem_*`格式
- ✅ **类型兼容**：所有字段类型都数据库友好
- ✅ **扩展灵活**：未来可加入Theme/Emotion桥接表

---

## 总结

这个设计遵循了"简洁优先、未来兼容"的原则：

1. **当前阶段**：干净的JSON格式，便于AI处理和人类阅读
2. **未来集成**：标准化字段设计，无缝对接生产数据库
3. **避免过度工程化**：不预设复杂架构，专注核心数据完整性

**✨ 关键创新**：这个设计将复杂的诗学特征分析和AI集成预留工作放在应用层处理，保持数据层的纯净性，符合现代软件架构的分层理念。