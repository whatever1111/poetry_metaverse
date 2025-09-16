#!/usr/bin/env node
/**
 * 李尤台现有MD知识库增强脚本
 * 在现有MD文件基础上添加ID字段，拆分序号和标题
 * 生成新的增强版MD文件（非破坏性修改）
 */

const fs = require('fs');
const path = require('path');

// 加载原始诗歌JSON数据，创建ID映射
function loadPoemsMapping() {
    console.log('📚 加载原始诗歌数据创建ID映射...');
    const poemsPath = './tangzongzheng-poems.json';
    if (!fs.existsSync(poemsPath)) {
        throw new Error(`诗歌JSON文件不存在: ${poemsPath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(poemsPath, 'utf8'));
    
    // 创建映射：collection-section-sequence -> {id, title, sequence}
    const mapping = {};
    data.poems.forEach(poem => {
        const key = `${poem.collection}-${poem.section}-${poem.sequence}`;
        mapping[key] = {
            id: poem.id,
            title: poem.title,
            sequence: poem.sequence
        };
    });
    
    console.log(`   ✅ 成功加载 ${data.poems.length} 首诗歌ID映射`);
    return mapping;
}

// 增强感知流模式知识库
function enhancePerceptionPatternsKB(filePath, mapping) {
    console.log(`\n📝 增强感知流模式知识库: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`   ❌ 文件不存在: ${filePath}`);
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 替换标题和说明
    let enhanced = content.replace(
        /# 李尤台感知流模式知识库\n## 适配DIFY平台的RAG知识库 - 中文字段设计/,
        '# 李尤台感知流模式知识库\n## 适配DIFY平台的RAG知识库 - 中文字段设计 (v2增强版)'
    );
    
    // 更新知识库说明
    enhanced = enhanced.replace(
        /\*\*更新时间\*\*: [\d年月日]+/,
        `**数据结构**: 整合原始JSON诗歌数据，包含全局ID和序号信息\n**更新时间**: ${new Date().toLocaleDateString('zh-CN')}`
    );
    
    // 处理每个条目
    enhanced = enhanced.replace(/### 感知流模式(\d+)\n\n\*\*诗集名称\*\*: (.+?)\n\*\*辑名\*\*: (.+?)\n\*\*诗歌标题\*\*: 第(\d+)首(.+?)\n/g, 
        (match, itemNum, collection, section, sequence, title) => {
            const key = `${collection}-${section}-${parseInt(sequence)}`;
            const poemInfo = mapping[key];
            
            if (!poemInfo) {
                console.warn(`   ⚠️  未找到诗歌映射: ${key}`);
                return match; // 保持原样
            }
            
            return `### 感知流模式${itemNum}

**ID**: ${poemInfo.id}
**诗集名称**: ${collection}
**辑名**: ${section}
**序号**: ${poemInfo.sequence}
**标题**: ${poemInfo.title}
`;
        }
    );
    
    console.log(`   ✅ 感知流模式知识库增强完成`);
    return enhanced;
}

// 增强反讽解构机制知识库
function enhanceIronicMechanismsKB(filePath, mapping) {
    console.log(`\n📝 增强反讽解构机制知识库: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`   ❌ 文件不存在: ${filePath}`);
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 替换标题和说明
    let enhanced = content.replace(
        /# 李尤台反讽解构机制知识库\n## 适配DIFY平台的RAG知识库 - 中文字段设计/,
        '# 李尤台反讽解构机制知识库\n## 适配DIFY平台的RAG知识库 - 中文字段设计 (v2增强版)'
    );
    
    // 更新知识库说明
    enhanced = enhanced.replace(
        /\*\*更新时间\*\*: [\d年月日]+/,
        `**数据结构**: 整合原始JSON诗歌数据，包含全局ID和序号信息\n**更新时间**: ${new Date().toLocaleDateString('zh-CN')}`
    );
    
    // 处理每个条目
    enhanced = enhanced.replace(/### 解构机制(\d+)\n\n\*\*诗集名称\*\*: (.+?)\n\*\*辑名\*\*: (.+?)\n\*\*诗歌标题\*\*: 第(\d+)首(.+?)\n/g, 
        (match, itemNum, collection, section, sequence, title) => {
            const key = `${collection}-${section}-${parseInt(sequence)}`;
            const poemInfo = mapping[key];
            
            if (!poemInfo) {
                console.warn(`   ⚠️  未找到诗歌映射: ${key}`);
                return match; // 保持原样
            }
            
            return `### 解构机制${itemNum}

**ID**: ${poemInfo.id}
**诗集名称**: ${collection}
**辑名**: ${section}
**序号**: ${poemInfo.sequence}
**标题**: ${poemInfo.title}
`;
        }
    );
    
    console.log(`   ✅ 反讽解构机制知识库增强完成`);
    return enhanced;
}

// 增强意象并置逻辑知识库
function enhanceJuxtapositionLogicKB(filePath, mapping) {
    console.log(`\n📝 增强意象并置逻辑知识库: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`   ❌ 文件不存在: ${filePath}`);
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 替换标题和说明
    let enhanced = content.replace(
        /# 李尤台意象并置逻辑知识库\n## 适配DIFY平台的RAG知识库 - 中文字段设计/,
        '# 李尤台意象并置逻辑知识库\n## 适配DIFY平台的RAG知识库 - 中文字段设计 (v2增强版)'
    );
    
    // 更新知识库说明
    enhanced = enhanced.replace(
        /\*\*更新时间\*\*: [\d年月日]+/,
        `**数据结构**: 整合原始JSON诗歌数据，包含全局ID和序号信息\n**更新时间**: ${new Date().toLocaleDateString('zh-CN')}`
    );
    
    // 处理每个条目
    enhanced = enhanced.replace(/### 并置逻辑(\d+)\n\n\*\*诗集名称\*\*: (.+?)\n\*\*辑名\*\*: (.+?)\n\*\*诗歌标题\*\*: 第(\d+)首(.+?)\n/g, 
        (match, itemNum, collection, section, sequence, title) => {
            const key = `${collection}-${section}-${parseInt(sequence)}`;
            const poemInfo = mapping[key];
            
            if (!poemInfo) {
                console.warn(`   ⚠️  未找到诗歌映射: ${key}`);
                return match; // 保持原样
            }
            
            return `### 并置逻辑${itemNum}

**ID**: ${poemInfo.id}
**诗集名称**: ${collection}
**辑名**: ${section}
**序号**: ${poemInfo.sequence}
**标题**: ${poemInfo.title}
`;
        }
    );
    
    console.log(`   ✅ 意象并置逻辑知识库增强完成`);
    return enhanced;
}

// 主函数
function main() {
    console.log('🚀 李尤台现有MD知识库增强脚本启动...');
    
    try {
        // 加载诗歌ID映射
        const mapping = loadPoemsMapping();
        
        // 定义文件配置
        const files = [
            {
                input: '李尤台感知流模式知识库.md',
                output: '李尤台感知流模式知识库_v2.md',
                enhancer: enhancePerceptionPatternsKB,
                name: '感知流模式'
            },
            {
                input: '李尤台反讽解构机制知识库.md', 
                output: '李尤台反讽解构机制知识库_v2.md',
                enhancer: enhanceIronicMechanismsKB,
                name: '反讽解构机制'
            },
            {
                input: '李尤台意象并置逻辑知识库.md',
                output: '李尤台意象并置逻辑知识库_v2.md', 
                enhancer: enhanceJuxtapositionLogicKB,
                name: '意象并置逻辑'
            }
        ];
        
        let successCount = 0;
        
        // 处理每个文件
        files.forEach(file => {
            const enhanced = file.enhancer(file.input, mapping);
            if (enhanced) {
                fs.writeFileSync(file.output, enhanced, 'utf8');
                console.log(`✅ ${file.name}知识库v2版本生成: ${file.output}`);
                successCount++;
            } else {
                console.error(`❌ ${file.name}知识库增强失败`);
            }
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 增强完成统计');
        console.log('='.repeat(60));
        console.log(`处理成功: ${successCount}/${files.length} 个文件`);
        console.log('🎯 增强功能: 添加全局ID字段，拆分序号和标题字段');
        console.log('📁 输出格式: v2版本MD文件（非破坏性修改）');
        console.log('✅ 现有文件保持完整，新版本文件已生成！');
        
    } catch (error) {
        console.error('❌ 脚本执行错误:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
