# 数据库迁移脚本使用指南

## 概述

本目录包含了经过治理和修复的数据库迁移脚本，确保数据完整性和一致性。所有脚本已经修复了之前发现的问题，包括：

- ✅ 诗歌内容正确读取
- ✅ 跨宇宙关联正确存储到主宇宙层
- ✅ 权重和置信度正确计算
- ✅ 数据完整性和一致性保证

## 快速开始

### 1. 完整迁移（推荐）

运行完整的数据库迁移，按照正确的顺序执行所有步骤：

```bash
node scripts/migration/run-migration.cjs
```

这个脚本会自动执行以下步骤：
1. 迁移主宇宙基础数据
2. 迁移毛小豆宇宙数据（包含跨宇宙关联）
3. 迁移周春秋宇宙数据
4. 重新计算主宇宙桥表关联

### 2. 分步迁移

如果需要分步执行，可以按照以下顺序：

```bash
# 第一步：主宇宙基础数据
node -e "require('./scripts/migration/migrate-main-universe.cjs').migrateMainUniverse()"

# 第二步：毛小豆宇宙数据
node -e "require('./scripts/migration/migrate-maoxiaodou.cjs').migrateMaoxiaodou()"

# 第三步：周春秋宇宙数据
node -e "require('./scripts/migration/migrate-zhou.cjs').migrateZhou()"

# 第四步：重新计算桥表关联
node -e "require('./scripts/migration/migrate-main-universe.cjs').migrateMainUniverse()"
```

## 修复的问题

### 1. ID格式规范问题
- **问题**：Universe.code和Theme.id格式不符合设计规范
- **修复**：在migrate脚本中直接使用正确的格式
- **影响**：确保数据格式一致性

### 2. 诗歌文件匹配问题
- **问题**：部分诗歌文件无法正确匹配，导致body为空
- **修复**：改进了文件匹配逻辑，添加特殊处理规则
- **影响**：确保所有诗歌都有完整的真实内容

### 3. 跨宇宙关联数据污染问题
- **问题**：跨宇宙关联被错误地存储在子宇宙表中
- **修复**：将跨宇宙关联迁移到主宇宙层的`CrossUniverseContentLink`表
- **影响**：符合数据架构设计原则

### 4. 权重和置信度计算问题
- **问题**：权重算法产生极端值，置信度计算不对称
- **修复**：使用Laplace平滑算法，统一计算策略
- **影响**：确保数据的一致性和合理性

## 脚本说明

### `run-migration.cjs`
- **用途**：完整的数据库迁移脚本
- **特点**：自动按正确顺序执行所有迁移步骤
- **推荐**：新用户或完整迁移时使用

### `migrate-main-universe.cjs`
- **用途**：迁移主宇宙基础数据和桥表关联
- **包含**：Universe、Theme、Emotion、UniverseTheme、UniverseEmotion
- **特点**：包含权重和置信度的正确计算

### `migrate-maoxiaodou.cjs`
- **用途**：迁移毛小豆宇宙数据
- **包含**：诗歌、角色、场景、主题、术语等
- **特点**：包含跨宇宙关联的正确迁移

### `migrate-zhou.cjs`
- **用途**：迁移周春秋宇宙数据
- **包含**：项目、诗歌、问答、映射等
- **特点**：保持原有逻辑，数据完整

## 数据验证

迁移完成后，可以运行验证脚本检查数据质量：

```bash
# 运行完整的数据验证
node scripts/validation/generate-report.cjs

# 或运行单独的验证脚本
node scripts/validation/check-integrity.cjs
node scripts/validation/check-relationships.cjs
node scripts/validation/check-consistency.cjs
```

## 注意事项

1. **执行顺序**：必须按照指定顺序执行，确保数据依赖关系正确
2. **数据备份**：建议在执行前备份现有数据库
3. **环境要求**：确保Prisma客户端已生成，数据库连接正常
4. **文件路径**：确保原始数据文件路径正确

## 故障排除

### 常见问题

1. **诗歌文件未找到**
   - 检查文件路径和命名
   - 查看控制台输出的匹配日志

2. **数据库连接失败**
   - 检查`.env`文件配置
   - 确保数据库服务运行

3. **Prisma客户端错误**
   - 运行`npx prisma generate`重新生成客户端

### 日志说明

迁移脚本会输出详细的执行日志，包括：
- 每个步骤的执行状态
- 数据处理的统计信息
- 错误和警告信息

## 版本历史

- **v2.0**：修复了所有已知问题，确保数据完整性
- **v1.0**：初始版本，存在数据质量问题

## 支持

如果遇到问题，请检查：
1. 控制台输出的错误信息
2. 数据文件是否存在且格式正确
3. 数据库连接和权限设置
