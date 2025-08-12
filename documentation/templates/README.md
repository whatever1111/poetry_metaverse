# 陆家花园项目文档模板

本目录包含陆家花园项目开发过程中使用的各种文档模板。

## 模板列表

### 1. TODO_TEMPLATE_ENHANCED.md（默认）
**用途**: 创建新的TODO清单（增强版，含契约冻结/字段映射/灰度与健康检查等字段）
**使用场景**: 开始新功能开发时（推荐默认使用）
**位置**: `documentation/templates/TODO_TEMPLATE_ENHANCED.md`

**使用方法**:
1. 复制 `TODO_TEMPLATE_ENHANCED.md` 到项目根目录
2. 重命名为 `TODO_[项目名称]_[功能描述].md`
3. 填写具体的任务和目标
4. 完成后移动到对应的changelog目录

### 2. 更新日志_TEMPLATE.md
**用途**: 创建更新日志文档
**使用场景**: 完成功能开发后
**位置**: `documentation/templates/更新日志_TEMPLATE.md`

**使用方法**:
1. 复制 `更新日志_TEMPLATE.md` 到对应的changelog目录
2. 重命名为 `更新日志.md`
3. 填写具体的更新内容
4. 与TODO清单关联

## 工作流程

### 开始新功能开发
```bash
# 1. 复制TODO模板
cp documentation/templates/TODO_TEMPLATE_ENHANCED.md TODO_新功能开发.md

# 2. 编辑TODO清单
# 填写目标、任务列表、更新日志关联等信息

# 3. 开始开发
# 按照TODO清单执行任务
```

### 完成功能开发
```bash
# 1. 创建更新目录
mkdir -p "documentation/changelog/YYYY-MM-DD_更新内容/"

# 2. 移动TODO清单
mv TODO_新功能开发.md "documentation/changelog/YYYY-MM-DD_更新内容/TODO.md"

# 3. 创建更新日志
cp documentation/templates/更新日志_TEMPLATE.md "documentation/changelog/YYYY-MM-DD_更新内容/更新日志.md"

# 4. 编辑更新日志
# 填写具体的更新内容

# 5. 提交到Git
git add .
git commit -m "feat: 新功能描述"
```

## 模板维护

### 更新模板
- 模板文件应该保持稳定，避免频繁变更
- 重大变更需要团队讨论和批准
- 更新模板后需要通知所有团队成员

### 版本控制
- 所有模板文件都纳入Git版本控制
- 模板变更需要清晰的提交信息
- 保持模板与开发指南的一致性

## 注意事项

1. **模板使用**: 严格按照模板格式填写，保持一致性
2. **文件命名**: 遵循项目的命名规范
3. **关联关系**: 确保TODO清单和更新日志的关联性
4. **版本同步**: 模板更新后及时同步到所有相关文档

---
*本说明基于陆家花园项目Git开发指南创建* 