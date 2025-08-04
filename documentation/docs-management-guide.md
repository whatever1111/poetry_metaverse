# 文档管理指南

## 概述

为了管理多分支开发中的共享文档，我们建立了文档分支策略。这个策略确保所有分支都能保持文档的同步，同时避免代码层面的意外合并。

## 分支结构

```
main
├── feature/maoxiaodou-universe  (毛小豆宇宙项目)
├── feature/zhou-spring-autumn   (周与春秋项目)
└── docs/shared                  (共享文档分支)
```

## 共享文档列表

- `当前进展.md` - 项目整体进展汇总
- `readme_forAI.md` - AI协作指南
- `documentation/` - 项目文档体系
- `tools/` - 工具脚本

## 工作流程

### 1. 更新共享文档

当您需要更新共享文档时：

```bash
# 1. 在您的开发分支上更新文档
git checkout feature/your-branch
# 编辑文档...

# 2. 提交文档更新
git add 当前进展.md
git commit -m "docs: 更新项目进展"

# 3. 推送到docs/shared分支
./tools/sync_docs.sh push
```

### 2. 同步文档到开发分支

当您需要从其他分支获取最新的文档更新时：

```bash
# 1. 切换到您的开发分支
git checkout feature/your-branch

# 2. 从docs/shared分支拉取文档更新
./tools/sync_docs.sh pull

# 3. 提交同步的文档
git add 当前进展.md documentation/ tools/
git commit -m "docs: 同步共享文档更新"
```

## 脚本使用说明

### sync_docs.sh 脚本

位置：`tools/sync_docs.sh`

#### 命令

- `./tools/sync_docs.sh pull` - 从docs/shared分支拉取文档更新
- `./tools/sync_docs.sh push` - 推送文档更新到docs/shared分支
- `./tools/sync_docs.sh help` - 显示帮助信息

#### 示例

```bash
# 同步文档到当前分支
./tools/sync_docs.sh pull

# 推送当前分支的文档更新
./tools/sync_docs.sh push
```

## 最佳实践

### 1. 定期同步

建议每周至少同步一次文档，确保所有分支的文档都是最新的。

### 2. 提交信息规范

文档相关的提交信息应使用 `docs:` 前缀：

```bash
git commit -m "docs: 更新项目进展"
git commit -m "docs: 同步共享文档更新"
```

### 3. 冲突处理

如果出现文档冲突：

1. 手动解决冲突
2. 确保文档内容的一致性
3. 提交解决后的文档
4. 推送到docs/shared分支

### 4. 文档审查

在推送文档更新前，建议：

1. 检查文档格式是否正确
2. 确认内容是否准确
3. 验证链接是否有效

## 故障排除

### 常见问题

1. **脚本权限问题**
   ```bash
   chmod +x tools/sync_docs.sh
   ```

2. **docs/shared分支不存在**
   ```bash
   git checkout -b docs/shared
   git push origin docs/shared
   ```

3. **文档冲突**
   - 手动编辑冲突文件
   - 解决冲突后提交

### 联系支持

如果遇到问题，请：

1. 检查git状态：`git status`
2. 查看错误日志
3. 联系项目维护者

## 更新日志

- 2025-08-04: 创建文档管理指南
- 2025-08-04: 建立docs/shared分支策略
- 2025-08-04: 创建sync_docs.sh同步脚本 