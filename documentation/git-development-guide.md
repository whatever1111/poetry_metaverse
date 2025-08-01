# 陆家花园诗歌元宇宙项目 - Git开发指南

> 本文档专为陆家花园诗歌元宇宙项目的开发团队编写，特别是为不熟悉Git开发流程的团队成员提供标准化的Git操作指南。

## 📋 目录

- [开始前](#开始前)
- [项目概述](#项目概述)
- [基础概念](#基础概念)
- [项目文档管理](#项目文档管理)
- [分支管理](#分支管理)
- [日常开发流程](#日常开发流程)
- [协作开发](#协作开发)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 🚀 开始前

### 1. Git环境准备

#### 安装Git
```bash
# Windows (推荐使用Git for Windows)
# 下载地址: https://git-scm.com/download/win

# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git
```

#### 验证安装
```bash
git --version
```
**陆家花园项目示例**:
```bash
$ git --version
git version 2.40.0.windows.1
```

### 2. 个人身份设置

#### 设置用户名和邮箱
```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```
**陆家花园项目示例**:
```bash
# 设置西尔的Git身份信息
git config --global user.name "szjetfighter"
git config --global user.email "40232607@qq.com"
```

#### 验证设置
```bash
git config --global user.name
git config --global user.email
```
**陆家花园项目示例**:
```bash
$ git config --global user.name
szjetfighter

$ git config --global user.email
40232607@qq.com
```

### 3. 项目克隆

#### 克隆陆家花园项目
```bash
git clone https://github.com/whatever1111/poetry_metaverse.git
cd poetry_metaverse
```
**陆家花园项目示例**:
```bash
# 克隆项目到本地
git clone https://github.com/whatever1111/poetry_metaverse.git
cd poetry_metaverse

# 验证克隆成功
ls
# 应该看到: server.js, package.json, poems/, public/ 等文件
```

### 4. 开发环境检查

#### 检查当前状态
```bash
git status
git branch -a
```
**陆家花园项目示例**:
```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/add-project-based-management
  remotes/origin/feature/maoxiaodou-universe
  remotes/origin/main
```

---

## 🎯 项目概述

### 项目信息
- **项目名称**: 陆家花园诗歌元宇宙
- **Git仓库**: https://github.com/whatever1111/poetry_metaverse.git
- **主要分支**: 
  - `main` - 主分支
  - `feature/add-project-based-management` - 项目基础管理功能分支
  - `feature/maoxiaodou-universe` - 毛小豆宇宙功能分支

### 分支关系
```
main (基础分支)
└── feature/add-project-based-management (功能分支1)
    └── feature/maoxiaodou-universe (功能分支2，基于功能分支1)
```

---

## 🔍 基础概念

### Git核心概念
- **Repository (仓库)**: 项目的完整历史记录
- **Commit (提交)**: 代码变更的快照
- **Branch (分支)**: 独立开发线
- **Remote (远程)**: 远程服务器上的仓库副本
- **Origin**: 远程仓库的默认名称

### 陆家花园项目中的概念
- **本地分支**: 你电脑上的分支
- **远程分支**: GitHub上的分支（以 `origin/` 开头）
- **跟踪关系**: 本地分支与远程分支的关联

---

## 📚 项目文档管理

### 0. TODO清单使用指南

#### 为什么要使用TODO清单？

**1. 明确开发目标**
- 将模糊的需求转化为具体的可执行任务
- 避免开发过程中偏离原始目标
- 便于团队成员理解项目方向

**2. 提高开发效率**
- 将复杂功能分解为小任务，降低心理负担
- 提供清晰的进度追踪，增强成就感
- 避免重复工作和遗漏重要步骤

**3. 便于协作沟通**
- 团队成员可以清楚了解当前开发状态
- 便于任务分配和进度同步
- 减少沟通成本，提高协作效率

**4. 建立项目历史**
- TODO清单完成后成为项目文档的一部分
- 为后续维护和功能扩展提供参考
- 建立完整的项目演进记录

#### 什么时候使用TODO清单？

**✅ 应该使用TODO清单的情况：**

**1. 功能开发（推荐）**
```bash
# 新功能开发
- 添加诗歌编辑器功能
- 实现用户权限管理
- 创建数据导入导出功能

# 功能重构
- 重构毛小豆宇宙数据结构
- 优化诗歌展示性能
- 重新设计用户界面
```

**2. 架构调整（必须）**
```bash
# 项目结构变更
- 建立多项目架构
- 重新组织文件目录
- 调整数据库设计

# 技术栈升级
- 升级Node.js版本
- 迁移到新的框架
- 重构API接口
```

**3. 复杂问题修复（推荐）**
```bash
# 涉及多个模块的bug修复
- 修复跨模块的数据同步问题
- 解决性能瓶颈问题
- 处理复杂的用户权限问题
```

**4. 项目治理（必须）**
```bash
# 文档体系建立
- 创建开发指南
- 建立代码规范
- 完善部署文档

# 流程优化
- 建立CI/CD流程
- 优化测试流程
- 改进代码审查流程
```

**❌ 不需要TODO清单的情况：**

**1. 简单修改**
```bash
# 文本内容更新
- 修改诗歌内容
- 更新页面标题
- 调整CSS样式

# 配置调整
- 修改端口号
- 更新环境变量
- 调整日志级别
```

**2. 临时调试**
```bash
# 开发过程中的临时修改
- 添加调试日志
- 临时注释代码
- 快速测试某个功能
```

**3. 文档更新**
```bash
# 简单的文档维护
- 更新README中的联系方式
- 修正文档中的错别字
- 添加简单的注释
```

#### 判断标准

**使用TODO清单的判断标准：**

1. **任务数量**：超过3个相关任务
2. **时间跨度**：预计需要超过1天完成
3. **影响范围**：涉及多个文件或模块
4. **复杂度**：需要分阶段完成
5. **协作需求**：需要多人参与或交接

**陆家花园项目示例：**

```bash
# ✅ 需要TODO清单
- 毛小豆宇宙项目功能完善（涉及多个模块，预计3-5天）
- 项目文件结构重构（影响整个项目架构）
- 建立Git开发指南（涉及文档体系建立）

# ❌ 不需要TODO清单
- 修复单个诗歌显示问题（简单bug修复）
- 更新项目版本号（简单配置修改）
- 添加新的诗歌文件（内容更新）
```

**作用**: 避免过度文档化，确保重要变更有完整记录
**预防故障**: 防止小改动过度复杂化，大改动缺乏规划

### 1. 更新日志目录结构规范

#### 目录组织原则
每个重要更新都创建一个独立的子目录，包含该更新的完整信息：

```
documentation/changelog/
├── YYYY-MM-DD_更新内容/
│   ├── TODO.md              # 原始任务清单
│   ├── 更新日志.md          # 技术实现文档
│   ├── 相关文件/            # 其他相关文档
│   └── README.md            # 目录说明（可选）
└── README.md                # 目录结构说明
```

#### 命名规范
**目录命名**：
- 格式：`YYYY-MM-DD_更新内容`
- 示例：`2025-07-31_项目文件结构重构`
- 原则：日期优先，内容描述简洁明确

**文件命名**：
- `TODO.md`：原始任务清单
- `更新日志.md`：技术实现文档
- `README.md`：目录说明（可选）

#### 陆家花园项目示例
```bash
# 创建新的更新目录
mkdir -p "documentation/changelog/2025-01-XX_毛小豆宇宙项目功能完善"

# 移动TODO清单到更新目录
mv TODO_毛小豆宇宙项目开发.md "documentation/changelog/2025-01-XX_毛小豆宇宙项目功能完善/TODO.md"

# 完成更新后创建更新日志
touch "documentation/changelog/2025-01-XX_毛小豆宇宙项目功能完善/更新日志.md"
```

**作用**: 保持项目文档的逻辑关联性和历史追溯性
**预防故障**: 避免文档分散，确保更新信息的完整性

### 2. TODO清单与更新日志关联机制

#### TODO清单模板
**模板位置**: `documentation/templates/TODO_TEMPLATE.md`

**使用方法**:
```bash
# 复制模板到项目根目录
cp documentation/templates/TODO_TEMPLATE.md TODO_新功能开发.md

# 编辑TODO清单
# 填写目标、任务列表、更新日志关联等信息
```

**模板内容**:
```markdown
# [项目名称] [功能描述] TODO

## 目标
[明确描述本次开发的目标和意义]

## 任务列表
### 第一阶段：[阶段名称]
- [ ] 任务1：[具体任务描述]
- [ ] 任务2：[具体任务描述]

## 更新日志关联
- **预计更新类型**: [功能更新/架构重构/问题修复/项目治理]
- **更新目录**: `documentation/changelog/YYYY-MM-DD_[更新内容]/`
- **更新日志文件**: `更新日志.md`
- **测试验证点**: 
  - [ ] 验证点1
  - [ ] 验证点2

## 完成后的操作
- [ ] 创建更新目录：`documentation/changelog/YYYY-MM-DD_[更新内容]/`
- [ ] 将本TODO文件移动到更新目录并重命名为 `TODO.md`
- [ ] 创建对应的更新日志文档：`更新日志.md`
- [ ] 可选：创建 `README.md` 说明本次更新
- [ ] 更新 `public/更新日志.md` 文件
- [ ] 提交所有更改到Git
```

#### 陆家花园项目示例
```bash
# 开发新功能时
1. 创建基于模板的TODO清单
2. 明确更新日志关联信息
3. 按阶段执行任务
4. 完成所有任务后创建更新日志
5. 归档TODO清单到对应目录
6. 提交到Git
```

**作用**: 确保TODO清单和更新日志的逻辑关联
**预防故障**: 避免任务遗漏，确保文档与代码的一致性

### 3. 更新日志内容规范

#### 更新日志模板
**模板位置**: `documentation/templates/更新日志_TEMPLATE.md`

**使用方法**:
```bash
# 复制模板到对应的changelog目录
cp documentation/templates/更新日志_TEMPLATE.md "documentation/changelog/YYYY-MM-DD_更新内容/更新日志.md"

# 编辑更新日志
# 填写具体的更新内容
```

**模板内容**:
```markdown
# 陆家花园项目[更新类型]更新日志

**更新时间**: YYYY-MM-DD  
**版本**: X.X  
**更新类型**: [功能更新/架构重构/问题修复/项目治理]  
**关联TODO**: [TODO文件名或链接]

## 更新概述
[简要说明本次更新的目的和意义]

## 任务执行情况
### 已完成任务
- [x] 任务1：[具体任务描述]
- [x] 任务2：[具体任务描述]

### 技术实现
[详细描述实现方法，包括：
- 主要技术变更
- 架构调整
- 代码修改
- 配置更新]

## 功能验证
- [x] 验证点1：[验证结果]
- [x] 验证点2：[验证结果]

## 影响范围
- **功能影响**：[影响的功能模块]
- **配置变更**：[需要注意的配置变更]
- **部署要求**：[部署相关的注意事项]

## 后续计划
[说明后续开发计划，包括：
- 待完成的功能
- 优化方向
- 长期规划]

## 总结
[总结本次更新的价值和影响]
```

#### 陆家花园项目示例
```markdown
# 陆家花园项目架构重构更新日志

**更新时间**: 2025-07-31  
**版本**: 2.0  
**更新类型**: 架构重构  
**关联TODO**: TODO_周与春秋练习项目重构.md

## 更新概述
将《周与春秋练习》项目相关文件移动到独立文件夹，为多项目架构做准备。

## 任务执行情况
### 已完成任务
- [x] 备份当前项目状态
- [x] 创建新的目录结构
- [x] 移动所有相关文件
- [x] 修改代码配置
- [x] 测试所有功能

## 技术实现
- 创建 `poeject_zhou_spring_autumn/` 目录
- 移动 data/、poems/ 等文件夹
- 修改 server.js 中的路径配置
- 更新 .gitignore 文件

## 功能验证
- [x] 所有API功能正常
- [x] 前端页面正常显示
- [x] 数据文件完整性验证
- [x] 部署测试通过
```

**作用**: 提供完整的变更记录，便于团队理解和维护
**预防故障**: 避免更新信息不清晰，确保变更可追溯

### 4. 文档管理最佳实践

#### 创建新更新流程
1. **创建TODO清单**：使用标准模板
2. **明确关联信息**：指定更新目录和日志文件
3. **执行开发任务**：按阶段完成任务
4. **创建更新目录**：`documentation/changelog/YYYY-MM-DD_[更新内容]/`
5. **移动TODO清单**：重命名为 `TODO.md`
6. **创建更新日志**：使用标准模板
7. **可选README**：添加目录说明
8. **提交到Git**：保持文档与代码同步

#### 查找历史更新流程
1. **按日期查找**：在 `documentation/changelog/` 目录下查找对应日期
2. **查看TODO.md**：了解任务执行过程
3. **查看更新日志.md**：了解技术实现细节
4. **查看README.md**：了解更新概述（如果有）

#### 陆家花园项目特殊注意事项
- **多项目架构**：注意不同项目间的文档关联
- **诗歌数据**：大文件更新需要特别注意文档记录
- **分支管理**：文档更新应与代码分支同步
- **团队协作**：确保所有团队成员了解文档规范

**作用**: 建立标准化的文档管理流程
**预防故障**: 避免文档管理混乱，确保项目历史可追溯

---

## 🌿 分支管理

### 1. 查看分支

#### 查看所有分支（本地+远程）
```bash
git branch -a
```
**陆家花园项目示例**:
```bash
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/add-project-based-management
  remotes/origin/feature/maoxiaodou-universe
  remotes/origin/main
```
**作用**: 全面了解项目所有分支，避免在错误分支上工作
**预防故障**: 防止意外在远程分支上直接修改，确保选择正确的开发分支

#### 查看本地分支
```bash
git branch
```
**陆家花园项目示例**:
```bash
$ git branch
* main
  feature/add-project-based-management
  feature/maoxiaodou-universe
```
**作用**: 快速查看本地分支，确认当前工作分支
**预防故障**: 避免在错误分支上开发，确保在正确的功能分支上工作

#### 查看远程分支
```bash
git branch -r
```
**陆家花园项目示例**:
```bash
$ git branch -r
  origin/HEAD -> origin/main
  origin/feature/add-project-based-management
  origin/feature/maoxiaodou-universe
  origin/main
```
**作用**: 了解远程仓库的分支结构，便于协作
**预防故障**: 避免创建重复的远程分支，确保分支命名规范

#### 查看分支详细信息（推荐）
```bash
git branch -vv
```
**陆家花园项目示例**:
```bash
$ git branch -vv
* feature/maoxiaodou-universe 313bb2b [origin/feature/maoxiaodou-universe] refactor: 项目文件结构重构
  feature/add-project-based-management 7befe78 [origin/feature/add-project-based-management] feat: 数据治理优化
  main                                 eef346e [origin/main] version 0.2
```
**作用**: 查看分支跟踪关系，确保本地分支正确跟踪远程分支
**预防故障**: 避免推送失败，确保分支同步，防止在错误分支上工作

### 2. 切换分支

#### 切换到已存在的本地分支
```bash
git checkout 分支名
# 或使用现代命令
git switch 分支名
```
**陆家花园项目示例**:
```bash
# 切换到主分支
git checkout main

# 切换到毛小豆宇宙分支
git checkout feature/maoxiaodou-universe
```
**作用**: 在不同功能分支间切换，保持工作环境整洁
**预防故障**: 避免在错误分支上开发，确保功能隔离

#### 创建并切换到新分支（基于当前分支）
```bash
git checkout -b 新分支名
# 或使用现代命令
git switch -c 新分支名
```
**陆家花园项目示例**:
```bash
# 基于当前分支创建新功能分支
git checkout -b feature/new-poetry-feature
```
**作用**: 为每个新功能创建独立分支，便于管理和回滚
**预防故障**: 避免功能间相互影响，确保代码隔离

#### 创建并切换到新分支（基于远程分支）
```bash
git checkout -b 本地分支名 origin/远程分支名
# 或使用现代命令
git switch -c 本地分支名 origin/远程分支名
```
**陆家花园项目示例**:
```bash
# 创建本地分支并跟踪远程分支
git checkout -b feature/maoxiaodou-universe origin/feature/maoxiaodou-universe
```
**作用**: 正确设置分支跟踪关系，便于后续推送和拉取
**预防故障**: 避免推送失败，确保分支同步，防止代码丢失

### 3. 删除分支

#### 删除本地分支
```bash
git branch -d 分支名  # 安全删除（如果分支未合并会报错）
git branch -D 分支名  # 强制删除
```
**陆家花园项目示例**:
```bash
# 删除测试分支
git branch -d test-branch
```
**作用**: 清理不需要的分支，保持仓库整洁
**预防故障**: 避免删除重要分支，确保代码安全

#### 删除远程分支
```bash
git push origin --delete 分支名
```
**陆家花园项目示例**:
```bash
# 删除远程测试分支
git push origin --delete feature/test-branch
```
**作用**: 清理远程仓库，保持分支结构清晰
**预防故障**: 避免删除主分支，确保团队协作不受影响

---

## 💻 日常开发流程

### 1. 开始开发前的准备

#### 更新本地代码
```bash
git pull origin main
```
**陆家花园项目示例**:
```bash
# 确保主分支是最新的
git checkout main
git pull origin main
```
**作用**: 获取最新代码，避免基于过时代码开发
**预防故障**: 避免合并冲突，确保开发基础正确

#### 创建功能分支
```bash
git checkout -b feature/新功能名
```
**陆家花园项目示例**:
```bash
# 为新的诗歌功能创建分支
git checkout -b feature/poetry-editor-enhancement
```
**作用**: 为每个功能创建独立分支，便于管理和回滚
**预防故障**: 避免功能间相互影响，确保代码隔离

### 2. 开发过程中的操作

#### 查看当前状态
```bash
git status
```
**陆家花园项目示例**:
```bash
$ git status
On branch feature/maoxiaodou-universe
Your branch is up to date with 'origin/feature/maoxiaodou-universe'.

nothing to commit, working tree clean
```
**作用**: 了解当前工作状态，确保在正确分支上工作
**预防故障**: 避免在错误分支上开发，及时发现未提交的更改

#### 添加文件到暂存区
```bash
git add 文件名          # 添加特定文件
git add .              # 添加所有更改
git add *.js           # 添加所有JS文件
```
**陆家花园项目示例**:
```bash
# 添加新创建的诗歌文件
git add poems/新诗歌.txt

# 添加所有更改
git add .
```
**作用**: 选择性地暂存更改，保持提交的精确性
**预防故障**: 避免提交敏感信息，确保代码质量

#### 提交更改
```bash
git commit -m "提交信息"
```
**陆家花园项目示例**:
```bash
# 提交新功能
git commit -m "feat: 添加诗歌编辑器增强功能"

# 提交修复
git commit -m "fix: 修复诗歌显示格式问题"

# 提交重构
git commit -m "refactor: 重构毛小豆宇宙数据结构"
```
**作用**: 记录代码变更，便于追踪和回滚
**预防故障**: 避免空提交，确保提交信息准确

#### 推送到远程
```bash
git push                    # 推送到跟踪的远程分支
git push origin 分支名      # 推送到指定远程分支
```
**陆家花园项目示例**:
```bash
# 推送到毛小豆宇宙分支
git push origin feature/maoxiaodou-universe
```
**作用**: 备份代码，便于团队协作
**预防故障**: 避免代码丢失，确保远程同步

### 3. 获取远程更新

#### 拉取远程更新
```bash
git pull                    # 拉取当前分支的更新
git pull origin 分支名      # 拉取指定分支的更新
```
**陆家花园项目示例**:
```bash
# 拉取主分支更新
git checkout main
git pull origin main

# 拉取毛小豆宇宙分支更新
git checkout feature/maoxiaodou-universe
git pull origin feature/maoxiaodou-universe
```
**作用**: 获取团队最新代码，保持同步
**预防故障**: 避免基于过时代码开发，减少合并冲突

---

## 🤝 协作开发

### 1. 查看远程仓库信息

#### 查看远程仓库
```bash
git remote -v
```
**陆家花园项目示例**:
```bash
$ git remote -v
origin  https://github.com/whatever1111/poetry_metaverse.git (fetch)
origin  https://github.com/whatever1111/poetry_metaverse.git (push)
```
**作用**: 确认远程仓库配置，确保连接正确
**预防故障**: 避免推送失败，确保仓库地址正确

### 2. 分支合并

#### 合并分支到当前分支
```bash
git merge 分支名
```
**陆家花园项目示例**:
```bash
# 将毛小豆宇宙分支合并到主分支
git checkout main
git merge feature/maoxiaodou-universe
```
**作用**: 将功能分支的更改合并到主分支
**预防故障**: 避免直接在主分支上开发，确保代码质量

#### 使用Pull Request（推荐）
1. 在GitHub上创建Pull Request
2. 进行代码审查
3. 合并到目标分支

**作用**: 通过代码审查确保代码质量
**预防故障**: 避免低质量代码进入主分支

### 3. 解决冲突

#### 查看冲突文件
```bash
git status
```

#### 解决冲突后
```bash
git add .
git commit -m "fix: 解决合并冲突"
```

**陆家花园项目示例**:
```bash
# 解决诗歌数据格式冲突
git status  # 查看冲突文件
# 手动编辑冲突文件
git add poems/data.json
git commit -m "fix: 解决诗歌数据格式冲突"
```
**作用**: 正确处理代码冲突，确保功能正常
**预防故障**: 避免冲突解决错误，确保代码完整性

---

## 🔧 故障排除

### 1. 常见问题

#### 推送失败（没有上游分支）
```bash
git push --set-upstream origin 分支名
# 或简写
git push -u origin 分支名
```
**陆家花园项目示例**:
```bash
# 设置毛小豆宇宙分支的上游分支
git push -u origin feature/maoxiaodou-universe
```
**作用**: 设置分支跟踪关系，便于后续推送
**预防故障**: 避免推送失败，确保分支同步

#### 拉取冲突
```bash
git stash              # 暂存当前更改
git pull              # 拉取更新
git stash pop         # 恢复暂存的更改
```
**作用**: 安全地拉取更新，避免丢失本地更改
**预防故障**: 避免代码丢失，确保工作进度不丢失

#### 撤销最后一次提交
```bash
git reset --soft HEAD~1  # 保留更改，撤销提交
git reset --hard HEAD~1  # 完全撤销提交和更改
```
**作用**: 修正错误的提交，保持提交历史整洁
**预防故障**: 避免错误的提交记录，确保代码安全

### 2. 查看历史

#### 查看提交历史
```bash
git log --oneline                    # 简洁显示
git log --oneline --graph --all      # 图形化显示所有分支
```
**陆家花园项目示例**:
```bash
$ git log --oneline --graph --all
* 313bb2b (origin/feature/maoxiaodou-universe) refactor: 项目文件结构重构
* d4d804e feat: 将毛小豆宇宙纳入版本控制
* 7befe78 (origin/feature/add-project-based-management) feat: 数据治理优化
* eef346e (HEAD -> main, origin/main) version 0.2
```
**作用**: 了解项目历史，便于调试和回滚
**预防故障**: 避免重复开发，确保代码追踪

#### 查看分支差异
```bash
git diff 分支1..分支2
```
**陆家花园项目示例**:
```bash
# 查看毛小豆宇宙分支相对于主分支的差异
git diff main..feature/maoxiaodou-universe

# 查看毛小豆宇宙分支相对于项目管理分支的差异
git diff feature/add-project-based-management..feature/maoxiaodou-universe
```
**作用**: 了解分支间的差异，便于合并决策
**预防故障**: 避免错误的合并，确保代码质量

---

## 📚 最佳实践

### 1. 分支命名规范
- `main` - 主分支
- `feature/功能名` - 功能分支
- `hotfix/问题描述` - 紧急修复分支
- `release/版本号` - 发布分支

### 2. 提交信息规范
- `feat:` - 新功能
- `fix:` - 修复bug
- `refactor:` - 重构代码
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `test:` - 测试相关

#### 详细提交信息规范（推荐）

**基本格式**：
```bash
git commit -m "类型: 简短描述" -m "详细说明"
```

**陆家花园项目示例**：
```bash
# 简单提交（适用于小改动）
git commit -m "fix: 修复诗歌显示格式问题"

# 详细提交（适用于重要功能）
git commit -m "feat: 添加诗歌编辑器增强功能" -m "
- 新增诗歌格式自动检测功能
- 实现实时预览编辑效果
- 添加多种诗歌模板选择
- 优化编辑器响应速度
- 修复已知的格式兼容性问题"
```

**详细提交信息模板**：
```bash
git commit -m "类型: 简短描述" -m "
详细变更说明：

- 变更1：具体做了什么
- 变更2：具体做了什么
- 变更3：具体做了什么

影响范围：
- 影响的功能模块
- 需要注意的配置变更
- 测试建议"
```

**陆家花园项目实际示例**：
```bash
git commit -m "refactor: 项目文件结构重构 - 建立多项目架构、统一命名规范及更新日志规则定义" -m "
- 建立多项目架构，将周与春秋练习项目移动到 poeject_zhou_spring_autumn/ 目录
- 将毛小豆宇宙项目重命名为 poeject_maoxiaodou_universe/ 并规范化结构
- 更新 server.js 中的文件路径配置，支持新的项目目录结构
- 建立统一的 poeject_ 前缀命名规范，提升项目专业性
- 创建 documentation/changelog/ 目录，建立规范的更新日志管理
- 建立更新日志规则定义，规范项目文档管理
- 将旧文档移动到 archive/ 目录进行归档管理"
```

**作用**: 提供完整的变更记录，便于团队理解和维护
**预防故障**: 避免提交信息不清晰，确保变更可追溯

### 3. 提交历史管理（重要）

#### 何时合并提交，何时保持分离

**应该合并提交的情况**：
```bash
# 1. 同一个功能的多个开发步骤
git commit -m "WIP: 创建Git开发指南基础结构"
git commit -m "WIP: 添加分支管理章节"
git commit -m "WIP: 优化文档格式"
# 功能完成后合并为一个提交
git reset --soft HEAD~3
git commit -m "docs: 创建陆家花园项目Git开发指南文档"
```

**应该保持分离的情况**：
```bash
# 1. 不同功能的提交
git commit -m "feat: 添加诗歌编辑器功能"
git commit -m "fix: 修复用户登录问题"
git commit -m "docs: 更新API文档"

# 2. 不同模块的修改
git commit -m "feat: 前端添加诗歌展示组件"
git commit -m "feat: 后端添加诗歌数据API"
git commit -m "test: 添加诗歌功能单元测试"

# 3. 不同时间的重要里程碑
git commit -m "feat: 完成毛小豆宇宙基础架构"
git commit -m "feat: 实现诗歌数据导入功能"
git commit -m "feat: 添加用户交互界面"
```

**陆家花园项目示例**：
```bash
# ✅ 应该合并：同一个功能的多个步骤
git commit -m "WIP: 创建Git开发指南文档"
git commit -m "WIP: 添加分支管理章节"
git commit -m "WIP: 添加提交历史管理规范"
# 合并为：
git commit -m "docs: 创建陆家花园项目Git开发指南文档"

# ✅ 应该分离：不同功能模块
git commit -m "feat: 添加诗歌编辑器功能"
git commit -m "feat: 实现用户权限管理"
git commit -m "docs: 更新部署文档"
```

**判断原则**：
- **合并原则**：同一个功能、同一个模块、同一个开发阶段
- **分离原则**：不同功能、不同模块、不同时间的重要里程碑

**作用**: 保持提交历史的逻辑清晰，便于理解和维护
**预防故障**: 避免功能混乱，确保每个提交都有明确的目的

#### 保持干净的提交历史
```bash
# 开发过程中频繁提交，保存工作进度
git commit -m "WIP: 正在开发诗歌编辑器功能"

# 功能完成后，合并相关提交
git reset --soft HEAD~3  # 撤销最近3个提交，保留更改
git commit -m "feat: 添加诗歌编辑器完整功能"
```

**陆家花园项目示例**:
```bash
# 开发过程中的提交
git commit -m "WIP: 创建Git开发指南基础结构"
git commit -m "WIP: 添加分支管理章节"
git commit -m "WIP: 优化文档格式"

# 功能完成后合并
git reset --soft HEAD~3
git commit -m "docs: 创建陆家花园项目Git开发指南文档" -m "
- 创建完整的Git开发指南文档
- 添加分支管理、日常开发流程等章节
- 包含最佳实践和故障预防说明"
```

**作用**: 保持项目演进历史清晰，便于追溯和维护
**预防故障**: 避免提交历史混乱，确保每个提交都有明确的意义

#### 合并提交的方法

**方法1：使用 `git reset --soft`（推荐用于简单情况）**
```bash
# 撤销最近N个提交，但保留更改
git reset --soft HEAD~N

# 重新提交为一个有意义的提交
git commit -m "feat: 完整功能描述"
```

**方法2：使用 `git rebase -i`（推荐用于复杂情况）**
```bash
# 交互式rebase，可以编辑、合并、删除提交
git rebase -i HEAD~3

# 在编辑器中：
# pick 第一个提交
# squash 第二个提交（合并到第一个）
# squash 第三个提交（合并到第一个）
```

**陆家花园项目示例**:
```bash
# 查看最近的提交
git log --oneline -5
# 输出：
# af34fc0 docs: 创建陆家花园项目Git开发指南文档
# 313bb2b refactor: 项目文件结构重构
# d4d804e feat: 将毛小豆宇宙纳入版本控制

# 合并提交
git reset --soft HEAD~2
git commit -m "docs: 创建陆家花园项目Git开发指南文档"
```

### 4. 开发流程建议
1. **开发阶段**：频繁提交，保存工作进度
2. **功能完成**：合并相关提交，保持历史清晰
3. **合并前**：确保提交历史整洁，便于代码审查
4. **主分支**：只包含有意义的完整功能提交
5. **及时删除**：删除已合并的分支

### 5. 陆家花园项目特殊注意事项
- 毛小豆宇宙分支基于项目管理分支，注意继承关系
- 诗歌数据文件较大，注意提交效率
- 多项目架构，注意分支间的依赖关系
- **提交历史管理**：每个功能分支合并到主分支时，应该只包含一个（或少数几个）逻辑清晰的提交 

 