# 毛小豆宇宙 数据结构重构V2 TODO

## 目标
基于《毛小豆故事演绎》诗集原文，参考《叙事结构梳理》文档的分析方法，引入"场景"(Scene)作为一级实体，将微观情境（如酒局、牌局）模型化，使其成为可独立查询和分析的数据实体，提升数据结构的精度、可扩展性和可维护性。

## 任务列表

### 第一阶段：场景实体创建与数据填充
- [x] **创建scenes.json文件**: 在 `poeject_maoxiaodou_universe/data/` 目录下创建新的数据文件
- [x] **设计数据结构**: 实现包含 `id`, `type` (枚举: "商务酒局", "兄弟会牌局", "家庭派对"), `description`, `poem_id`, `characters` (角色ID数组，引用characters.json), `terminology` (术语ID数组，引用terminology.json) 等字段的schema
- [x] **填充场景数据**: 基于《毛小豆故事演绎》诗集原文，参考《梳理》中的情境解剖方法，为poems.json中已定义的十四首诗歌填充场景数据作为原型

### 第一阶段补充：场景分类优化与受控冗余实现
- [x] **场景类型重构**: 将场景类型从3种扩展为7种：商务社交、兄弟会社交、办公室社交、个人社交、封闭空间、运动环境、消费空间
- [x] **受控冗余实现**: 添加`scenario`字段，提供中文场景名称，实现数据治理的受控冗余原则
- [x] **验证脚本更新**: 更新`validate_scenes.cjs`以支持新的场景类型枚举和`scenario`字段验证
- [x] **统计报告增强**: 更新`scene_statistics_report.cjs`以显示`scenario`字段信息

### 第二阶段：数据引用关系更新
- [x] **修改poems.json的locations字段**: 将 `poems.json` 中的 `locations` 字段从字符串数组改为场景ID数组，引用 `scenes.json` 中的场景
- [x] **验证引用一致性**: 确保所有引用的场景ID都存在于scenes.json中

### 第三阶段：验证器开发与集成
- [x] **编写validate_scenes.cjs**: 创建新的验证脚本，验证 `scenes.json` 内部数据一致性
- [x] **实现引用验证**: 验证scenes.json中的characters和terminology引用是否存在于对应的JSON文件中
- [x] **实现反向验证**: 验证poems.json中的场景引用是否与scenes.json中的poem_id一致
- [x] **更新validate_all.cjs**: 将新的 `validate_scenes.cjs` 添加到统一验证入口中
- [x] **测试完整验证流程**: 确保整个验证体系能够正常运行

### 第四阶段：验证脚本优化与重构 ✅ 已完成
- [x] **更新validate_simple_data_references.cjs**: 添加对诗歌中locations字段（场景引用）的验证
- [x] **重构validate_scenes.cjs**: 使用公共工具模块，减少重复代码，提高代码质量
- [x] **合并场景相关脚本**: 将`scene_statistics_report.cjs`的功能整合到`validate_scenes.cjs`中
- [x] **更新其他验证脚本**: 确保所有验证脚本都考虑场景实体的引用关系
- [x] **测试验证脚本优化**: 确保重构后的验证脚本功能完整且性能良好

## 更新日志关联
- **预计更新类型**: 架构重构 + 数据治理优化 + 验证脚本优化
- **更新目录**: `documentation/changelog/2025-08-01_毛小豆宇宙场景实体引入/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [x] scenes.json文件存在且包含有效的JSON数据，覆盖poems.json中的所有诗歌条目
  - [x] poems.json中的locations字段成功更新，所有引用关系正确
  - [x] validate_scenes.cjs能够正确识别和报告数据一致性问题
  - [x] 运行validate_all.cjs时包含scenes验证，无错误输出
  - [x] 场景类型重构完成，7种类型分布合理（封闭空间34.5%，兄弟会社交27.6%等）
  - [x] 受控冗余实现，所有场景都有`scenario`字段提供中文名称
  - [x] 统计报告正常显示场景名称和分类分布
  - [x] 所有验证脚本都使用公共工具模块，减少重复代码
  - [x] 场景引用验证在所有相关验证脚本中完整实现

## 注意事项
- 严格按照步骤顺序执行，每个步骤完成后进行验证
- 如果某个步骤失败，优先解决该步骤问题，不要跳过
- 确保所有引用关系的一致性，避免数据孤岛
- 保持Git提交记录清晰，每个步骤完成后提交
- 遵循公共工具模块设计原则，减少代码重复

## 完成后的操作
- [x] 创建更新目录：`documentation/changelog/2025-08-01_毛小豆宇宙场景实体引入/`
- [x] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 更新 `public/当前进展.md` 文件
- [ ] 提交所有更改到Git
- [ ] 更新项目状态

## 当前状态
✅ 已完成（包含验证脚本优化）

## 最终成果统计
- **场景总数**: 29个
- **场景类型**: 7种（商务社交、兄弟会社交、办公室社交、个人社交、封闭空间、运动环境、消费空间）
- **诗歌覆盖**: 14首
- **数据字段**: id + scenario + type + description + poem_id + characters + terminology
- **验证体系**: validate_scenes.cjs + validate_all.cjs（已优化，整合统计报告功能）

---
*本TODO基于陆家花园项目Git开发指南模板创建* 