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
    
    # 同步tools文件夹
    if [ -d "tools" ]; then
        echo -e "${YELLOW}🔧 同步tools文件夹${NC}"
        git checkout origin/docs/shared -- tools/
        
        # 检查是否有变更
        if ! git diff --quiet tools/; then
            echo -e "${GREEN}✅ tools文件夹已更新${NC}"
        else
            echo -e "${YELLOW}ℹ️  tools文件夹无变更${NC}"
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
        exit 1
    fi
    
    # 切换到docs/shared分支
    git checkout docs/shared
    
    # 从当前分支拉取文档
    SOURCE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    for doc in "${SHARED_DOCS[@]}"; do
        if [ -f "$doc" ]; then
            echo -e "${YELLOW}📝 更新文档: $doc${NC}"
            git checkout "$SOURCE_BRANCH" -- "$doc"
        fi
    done
    
    # 同步documentation文件夹
    if [ -d "documentation" ]; then
        echo -e "${YELLOW}📁 更新documentation文件夹${NC}"
        git checkout "$SOURCE_BRANCH" -- documentation/
    fi
    
    # 同步tools文件夹
    if [ -d "tools" ]; then
        echo -e "${YELLOW}🔧 更新tools文件夹${NC}"
        git checkout "$SOURCE_BRANCH" -- tools/
    fi
    
    # 检查是否有变更
    if ! git diff --quiet; then
        git add "${SHARED_DOCS[@]}" documentation/ tools/
        git commit -m "docs: 同步共享文档更新"
        git push origin docs/shared
        echo -e "${GREEN}✅ 文档已推送到docs/shared分支${NC}"
    else
        echo -e "${YELLOW}ℹ️  文档无变更${NC}"
    fi
    
    # 切换回原分支
    git checkout "$SOURCE_BRANCH"
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