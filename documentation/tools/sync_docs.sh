#!/bin/bash

# 文档同步脚本
# 用于在不同分支间同步共享文档

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 共享文档列表
SHARED_DOCS=("当前进展.md" "readme_forAI.md")

echo -e "${GREEN}📄 文档同步脚本${NC}"
echo "=================="

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}当前分支: ${CURRENT_BRANCH}${NC}"

# 函数：从docs/shared分支拉取文档更新
sync_from_docs() {
    echo -e "${YELLOW}🔄 从docs/shared分支拉取文档更新...${NC}"
    
    # 检查docs/shared分支是否存在
    if ! git show-ref --verify --quiet refs/remotes/origin/docs/shared; then
        echo -e "${RED}❌ docs/shared分支不存在，请先创建该分支${NC}"
        exit 1
    fi
    
    # 获取docs/shared分支的最新内容
    git fetch origin docs/shared
    
    # 为每个共享文档执行同步
    for doc in "${SHARED_DOCS[@]}"; do
        if [ -f "$doc" ]; then
            echo -e "${YELLOW}📝 同步文档: $doc${NC}"
            git checkout origin/docs/shared -- "$doc"
            
            # 检查是否有变更
            if ! git diff --quiet "$doc"; then
                echo -e "${GREEN}✅ $doc 已更新${NC}"
            else
                echo -e "${YELLOW}ℹ️  $doc 无变更${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  文档不存在: $doc${NC}"
        fi
    done
    
    # 同步documentation文件夹
    if [ -d "documentation" ]; then
        echo -e "${YELLOW}📁 同步documentation文件夹${NC}"
        git checkout origin/docs/shared -- documentation/
        
        # 检查是否有变更
        if ! git diff --quiet documentation/; then
            echo -e "${GREEN}✅ documentation文件夹已更新${NC}"
        else
            echo -e "${YELLOW}ℹ️  documentation文件夹无变更${NC}"
        fi
    fi
    
    # 同步documentation/tools文件夹
    if [ -d "documentation/tools" ]; then
        echo -e "${YELLOW}🔧 同步documentation/tools文件夹${NC}"
        git checkout origin/docs/shared -- documentation/tools/
        
        # 检查是否有变更
        if ! git diff --quiet documentation/tools/; then
            echo -e "${GREEN}✅ documentation/tools文件夹已更新${NC}"
        else
            echo -e "${YELLOW}ℹ️  documentation/tools文件夹无变更${NC}"
        fi
    fi
    
    # 如果有变更，提示提交
    if ! git diff --quiet; then
        echo -e "${GREEN}📤 检测到文档变更，请提交更新${NC}"
        echo "建议提交信息: docs: 同步共享文档更新"
    else
        echo -e "${GREEN}✅ 所有文档已是最新版本${NC}"
    fi
}

# 函数：推送文档更新到docs/shared分支
push_to_docs() {
    echo -e "${YELLOW}📤 推送文档更新到docs/shared分支...${NC}"
    
    # 检查是否有未提交的变更
    if ! git diff --quiet; then
        echo -e "${RED}❌ 请先提交当前分支的文档变更${NC}"
        echo -e "${YELLOW}💡 提示: 所有文档更新都应在当前分支完成并提交${NC}"
        exit 1
    fi
    
    # 检查是否有未推送的提交
    if [ "$(git rev-list HEAD...origin/$(git rev-parse --abbrev-ref HEAD) --count)" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  检测到未推送的提交${NC}"
        echo -e "${YELLOW}💡 建议: 先推送当前分支的提交到远程，确保工作已备份${NC}"
        echo -e "${YELLOW}💡 是否继续同步文档? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ 用户取消操作${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 继续执行文档同步${NC}"
    fi
    
    # 先保存源分支名（在切换分支之前）
    SOURCE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "${GREEN}✅ 源分支: $SOURCE_BRANCH${NC}"
    
    # 切换到docs/shared分支
    git checkout docs/shared
    
    # 从源分支拉取文档（只同步已commit的内容）
    for doc in "${SHARED_DOCS[@]}"; do
        if git ls-tree "$SOURCE_BRANCH" "$doc" >/dev/null 2>&1; then
            echo -e "${YELLOW}📝 同步文档: $doc${NC}"
            git checkout "$SOURCE_BRANCH" -- "$doc"
        else
            echo -e "${YELLOW}⚠️  文档不存在: $doc${NC}"
        fi
    done
    
    # 同步documentation文件夹（只同步已commit的内容）
    if git ls-tree "$SOURCE_BRANCH" documentation/ >/dev/null 2>&1; then
        echo -e "${YELLOW}📁 同步documentation文件夹${NC}"
        git checkout "$SOURCE_BRANCH" -- documentation/
    else
        echo -e "${YELLOW}⚠️  documentation文件夹不存在${NC}"
    fi
    
    # 同步documentation/tools文件夹（包含脚本本身）
    if git ls-tree "$SOURCE_BRANCH" documentation/tools/ >/dev/null 2>&1; then
        echo -e "${YELLOW}🔧 同步documentation/tools文件夹${NC}"
        git checkout "$SOURCE_BRANCH" -- documentation/tools/
    else
        echo -e "${YELLOW}⚠️  documentation/tools文件夹不存在${NC}"
    fi
    
    # 检查是否有实际变更
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo -e "${GREEN}📤 检测到文档变更，准备提交同步${NC}"
        
        # 只添加有变更的文件
        CHANGED_FILES=()
        
        # 检查共享文档
        for doc in "${SHARED_DOCS[@]}"; do
            if ! git diff --quiet "$doc" 2>/dev/null || ! git diff --cached --quiet "$doc" 2>/dev/null; then
                CHANGED_FILES+=("$doc")
            fi
        done
        
        # 检查documentation文件夹
        if ! git diff --quiet documentation/ 2>/dev/null || ! git diff --cached --quiet documentation/ 2>/dev/null; then
            CHANGED_FILES+=("documentation/")
        fi
        
        # 检查documentation/tools文件夹
        if git ls-tree "$SOURCE_BRANCH" documentation/tools/ >/dev/null 2>&1 && (! git diff --quiet documentation/tools/ 2>/dev/null || ! git diff --cached --quiet documentation/tools/ 2>/dev/null); then
            CHANGED_FILES+=("documentation/tools/")
        fi
        
        if [ ${#CHANGED_FILES[@]} -gt 0 ]; then
            git add "${CHANGED_FILES[@]}"
            git commit -m "docs: 同步来自 $SOURCE_BRANCH 分支的文档更新"
            git push origin docs/shared
            echo -e "${GREEN}✅ 文档已成功推送到docs/shared分支${NC}"
        else
            echo -e "${YELLOW}ℹ️  没有检测到实际变更${NC}"
        fi
    else
        echo -e "${YELLOW}ℹ️  文档无变更，无需同步${NC}"
    fi
    
    # 切换回原分支
    git checkout "$SOURCE_BRANCH"
    echo -e "${GREEN}✅ 已切换回 $SOURCE_BRANCH 分支${NC}"
}

# 主函数
main() {
    case "${1:-help}" in
        "pull")
            sync_from_docs
            ;;
        "push")
            push_to_docs
            ;;
        "help"|*)
            echo "用法: $0 [pull|push|help]"
            echo ""
            echo "命令:"
            echo "  pull  - 从docs/shared分支拉取文档更新"
            echo "  push  - 推送文档更新到docs/shared分支"
            echo "  help  - 显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 pull  # 同步文档到当前分支"
            echo "  $0 push  # 推送当前分支的文档更新"
            ;;
    esac
}

main "$@" 