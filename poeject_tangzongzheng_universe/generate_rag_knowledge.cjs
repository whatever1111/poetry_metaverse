/**
 * 李尤台分析报告知识库化脚本
 * 功能：从9个辑分析报告中提取核心信息，生成DIFY适配的中文字段RAG知识库
 * 输出：3个MD文件（感知流模式、反讽解构机制、意象并置逻辑）
 * 
 * 作者：AI助手
 * 日期：2025-09-16
 * 适配：DIFY平台 + 中文字段设计
 */

const fs = require('fs');
const path = require('path');

// 配置：9个分析报告文件
const ANALYSIS_FILES = [
    // 偶记集
    '偶记集_阳光雨露辑_分析报告.md',
    '偶记集_伪士嚎辑_分析报告.md', 
    '偶记集_感时孕辑_分析报告.md',
    '偶记集_异性阑珊辑_分析报告.md',
    // 爱人
    '爱人_急就诗辑_分析报告.md',
    '爱人_改良派辑_分析报告.md',
    '爱人_学朽辑_分析报告.md',
    '爱人_歪门邪道辑_分析报告.md',
    '爱人_儒家辑_分析报告.md'
];

// 输出文件配置
const OUTPUT_FILES = {
    perception: '李尤台感知流模式知识库.md',
    deconstruction: '李尤台反讽解构机制知识库.md',
    juxtaposition: '李尤台意象并置逻辑知识库.md'
};

/**
 * 从分析报告中提取感知流模式信息
 * @param {string} content - 报告内容
 * @param {string} fileName - 文件名
 * @returns {Array} 感知流模式数据
 */
function extractPerceptionPatterns(content, fileName) {
    const patterns = [];
    // 修正文件名解析：偶记集_阳光雨露辑_分析报告.md
    const collectionMatch = fileName.match(/(.+)_(.+)辑_分析报告\.md/);
    const collection = collectionMatch ? collectionMatch[1] : '';
    const section = collectionMatch ? collectionMatch[2] : '';
    
    // 提取每首诗歌的感知流分析
    const poemBlocks = content.split(/### \*\*第\d+首/);
    
    poemBlocks.forEach((block, index) => {
        if (index === 0) return; // 跳过第一个空块
        
        // 修复标题提取 - 处理分割后的格式
        const titleMatch = block.match(/^(.+?)\*\* \(/);
        let poemTitle = titleMatch ? titleMatch[1] : `第${index}首`;
        // 如果成功提取到标题，加上"第X首"前缀重建完整标题
        if (titleMatch && titleMatch[1].trim()) {
            poemTitle = `第${index}首${titleMatch[1]}`;
        } else {
            poemTitle = `第${index}首`;
        }
        
        // 提取感知流动模式
        const perceptionMatch = block.match(/\* \*\*感知流动模式\*\*: (.+)/);
        if (perceptionMatch) {
            patterns.push({
                诗集: collection,
                辑名: section,
                诗歌标题: poemTitle,
                感知流动模式: perceptionMatch[1],
                主导感官: extractSensoryInfo(block),
                关键意象序列: extractImagerySequence(block)
            });
        }
    });
    
    return patterns;
}

/**
 * 提取主导感官信息
 */
function extractSensoryInfo(block) {
    const match = block.match(/\* \*\*主导感官\*\*: (.+)/);
    return match ? match[1] : '';
}

/**
 * 提取关键意象序列
 */
function extractImagerySequence(block) {
    // 更精确的匹配，只提取意象序列本身，避免包含后续内容
    const match = block.match(/\* \*\*关键意象序列\*\*:\s*\n((?:\s*\d+\..+?→.+?(?=\n\s*\d+\.|\n\* \*\*感知流动模式\*\*|\n\*|$))*)/s);
    if (match) {
        // 清理格式，正确提取意象序列
        const sequences = match[1]
            .split(/\s*\d+\.\s*/)
            .filter(item => item.trim())
            .map(item => item.replace(/→\s*$/, '').trim().replace(/\s*\*\*感知流动模式\*\*.*/, ''))
            .filter(item => item.length > 0)
            .join(' → ');
        return sequences;
    }
    return '';
}

/**
 * 从分析报告中提取反讽解构机制信息
 */
function extractDeconstructionMechanisms(content, fileName) {
    const mechanisms = [];
    // 修正文件名解析
    const collectionMatch = fileName.match(/(.+)_(.+)辑_分析报告\.md/);
    const collection = collectionMatch ? collectionMatch[1] : '';
    const section = collectionMatch ? collectionMatch[2] : '';
    
    const poemBlocks = content.split(/### \*\*第\d+首/);
    
    poemBlocks.forEach((block, index) => {
        if (index === 0) return;
        
        // 修复标题提取 - 处理分割后的格式（反讽解构机制用）
        const titleMatch = block.match(/^(.+?)\*\* \(/);
        let poemTitle = titleMatch ? titleMatch[1] : `第${index}首`;
        if (titleMatch && titleMatch[1].trim()) {
            poemTitle = `第${index}首${titleMatch[1]}`;
        } else {
            poemTitle = `第${index}首`;
        }
        
        // 提取情感基调和主题
        const emotionMatch = block.match(/\* \*\*核心情感基调\*\*: (.+)/);
        const themeMatch = block.match(/\* \*\*关联主题\*\*: (.+)/);
        const polarityMatch = block.match(/\* \*\*情感极性评分\*\*: (.+)/);
        
        if (emotionMatch || themeMatch) {
            mechanisms.push({
                诗集: collection,
                辑名: section,
                诗歌标题: poemTitle,
                核心情感基调: emotionMatch ? emotionMatch[1] : '',
                情感极性评分: polarityMatch ? polarityMatch[1] : '',
                关联主题: themeMatch ? themeMatch[1] : '',
                我的功能角色: extractFunctionRole(block),
                解构策略: extractDeconstructionStrategy(content, section)
            });
        }
    });
    
    return mechanisms;
}

/**
 * 提取"我"的功能角色
 */
function extractFunctionRole(block) {
    const match = block.match(/\* \*\*"我"的功能角色\*\*: (.+)/);
    return match ? match[1] : '';
}

/**
 * 提取解构策略（基于辑的特色）
 */
function extractDeconstructionStrategy(content, section) {
    const strategyMap = {
        '阳光雨露': '日常感知的孤独化转换',
        '伪士嚎': '知识分子身份的历史投射',
        '感时孕': '时间感知的情感化处理',
        '异性阑珊': '异性关系的身体化表达',
        '急就诗': '现代性体验的突然中断',
        '改良派': '社会批判的文学化表达',
        '学朽': '自我贬抑的反诗性实验',
        '歪门邪道': '传统形式的多重突破',
        '儒家': '传统文化的粗鄙化解构'
    };
    return strategyMap[section] || '观念碎片并置';
}

/**
 * 从分析报告中提取意象并置逻辑信息
 */
function extractJuxtapositionLogic(content, fileName) {
    const logics = [];
    // 修正文件名解析
    const collectionMatch = fileName.match(/(.+)_(.+)辑_分析报告\.md/);
    const collection = collectionMatch ? collectionMatch[1] : '';
    const section = collectionMatch ? collectionMatch[2] : '';
    
    const poemBlocks = content.split(/### \*\*第\d+首/);
    
    poemBlocks.forEach((block, index) => {
        if (index === 0) return;
        
        // 修复标题提取 - 处理分割后的格式（意象并置逻辑用）
        const titleMatch = block.match(/^(.+?)\*\* \(/);
        let poemTitle = titleMatch ? titleMatch[1] : `第${index}首`;
        if (titleMatch && titleMatch[1].trim()) {
            poemTitle = `第${index}首${titleMatch[1]}`;
        } else {
            poemTitle = `第${index}首`;
        }
        
        // 提取AI建模应用注释 - 精确匹配多行内容
        const triggerMatch = block.match(/\* \*\*潜在触发器\*\*: (.+)/);
        // 更宽松的匹配，处理实际的缩进格式
        const logicMatch = block.match(/\* \*\*生成逻辑链\*\*:\s*\n((?:\s+\d+\.\s\*\*.+?\*\*:.+\n?)+?)(?=\* \*\*禁用元素\*\*|\* \*\*核心词汇库\*\*|---)/s);
        const forbiddenMatch = block.match(/\* \*\*禁用元素\*\*: (.+)/);
        const vocabMatch = block.match(/\* \*\*核心词汇库\*\*: (.+)/);
        
        if (triggerMatch || logicMatch) {
            logics.push({
                诗集: collection,
                辑名: section,
                诗歌标题: poemTitle,
                潜在触发器: triggerMatch ? triggerMatch[1] : '',
                生成逻辑链: logicMatch ? parseGenerationLogic(logicMatch[1]) : '',
                禁用元素: forbiddenMatch ? forbiddenMatch[1] : '',
                核心词汇库: vocabMatch ? vocabMatch[1] : ''
            });
        }
    });
    
    return logics;
}

/**
 * 解析生成逻辑链
 */
function parseGenerationLogic(logicText) {
    return logicText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            // 提取格式：  1. **标题**: 内容
            const match = line.match(/^\s*\d+\.\s\*\*(.+?)\*\*:\s*(.+)/);
            if (match) {
                return `${match[1]}: ${match[2].trim()}`;
            }
            return '';
        })
        .filter(item => item.length > 0)
        .join(' → ');
}

/**
 * 生成感知流模式知识库MD文件
 */
function generatePerceptionKnowledgeBase(allPatterns) {
    let content = `# 李尤台感知流模式知识库
## 适配DIFY平台的RAG知识库 - 中文字段设计

---

## 📖 知识库说明

**知识库用途**: 用于陆家明AI诗人的李尤台风格诗歌生成，专门提取感知流动模式和意象序列逻辑
**数据来源**: 基于李尤台99首诗歌的深度分析报告，涵盖《偶记集》56首 + 《爱人》43首
**适配平台**: DIFY RAG系统，支持中文语义检索
**更新时间**: 2025年9月16日

---

## 🌊 感知流模式条目

`;

    allPatterns.forEach((pattern, index) => {
        content += `### 感知流模式${String(index + 1).padStart(3, '0')}

**诗集名称**: ${pattern.诗集}
**辑名**: ${pattern.辑名}
**诗歌标题**: ${pattern.诗歌标题}
**主导感官**: ${pattern.主导感官}
**感知流动模式**: ${pattern.感知流动模式}
**关键意象序列**: ${pattern.关键意象序列}

**应用场景**: 当用户输入涉及${pattern.主导感官}相关感受时，可调用此感知流模式
**生成指导**: 按照"${pattern.感知流动模式}"的流程进行意象组织和情感推进

---

`;
    });

    return content;
}

/**
 * 生成反讽解构机制知识库MD文件
 */
function generateDeconstructionKnowledgeBase(allMechanisms) {
    let content = `# 李尤台反讽解构机制知识库
## 适配DIFY平台的RAG知识库 - 中文字段设计

---

## 📖 知识库说明

**知识库用途**: 用于陆家明AI诗人的李尤台风格诗歌生成，专门提取反讽解构策略和情感处理机制
**数据来源**: 基于李尤台99首诗歌的深度分析报告，涵盖《偶记集》56首 + 《爱人》43首
**适配平台**: DIFY RAG系统，支持中文语义检索
**更新时间**: 2025年9月16日

---

## 🎭 反讽解构机制条目

`;

    allMechanisms.forEach((mechanism, index) => {
        content += `### 解构机制${String(index + 1).padStart(3, '0')}

**诗集名称**: ${mechanism.诗集}
**辑名**: ${mechanism.辑名}
**诗歌标题**: ${mechanism.诗歌标题}
**核心情感基调**: ${mechanism.核心情感基调}
**情感极性评分**: ${mechanism.情感极性评分}
**关联主题**: ${mechanism.关联主题}
**我的功能角色**: ${mechanism.我的功能角色}
**解构策略**: ${mechanism.解构策略}

**应用场景**: 当用户表达${mechanism.关联主题}相关情感时，采用此解构机制
**情感处理**: 按照${mechanism.核心情感基调}进行情感基调设定，采用${mechanism.解构策略}进行主题处理

---

`;
    });

    return content;
}

/**
 * 生成意象并置逻辑知识库MD文件
 */
function generateJuxtapositionKnowledgeBase(allLogics) {
    let content = `# 李尤台意象并置逻辑知识库
## 适配DIFY平台的RAG知识库 - 中文字段设计

---

## 📖 知识库说明

**知识库用途**: 用于陆家明AI诗人的李尤台风格诗歌生成，专门提取意象并置规则和生成逻辑链
**数据来源**: 基于李尤台99首诗歌的深度分析报告，涵盖《偶记集》56首 + 《爱人》43首
**适配平台**: DIFY RAG系统，支持中文语义检索
**更新时间**: 2025年9月16日

---

## 🔗 意象并置逻辑条目

`;

    allLogics.forEach((logic, index) => {
        content += `### 并置逻辑${String(index + 1).padStart(3, '0')}

**诗集名称**: ${logic.诗集}
**辑名**: ${logic.辑名}
**诗歌标题**: ${logic.诗歌标题}
**潜在触发器**: ${logic.潜在触发器}
**生成逻辑链**: ${logic.生成逻辑链}
**禁用元素**: ${logic.禁用元素}
**核心词汇库**: ${logic.核心词汇库}

---

`;
    });

    return content;
}

/**
 * 主函数：执行知识库生成流程
 */
function main() {
    console.log('🚀 李尤台分析报告知识库化脚本启动...\n');
    
    const allPerceptionPatterns = [];
    const allDeconstructionMechanisms = [];
    const allJuxtapositionLogics = [];
    
    let processedCount = 0;
    let errorCount = 0;
    
    // 处理每个分析报告文件
    ANALYSIS_FILES.forEach(fileName => {
        try {
            console.log(`📝 正在处理: ${fileName}`);
            
            const filePath = path.join(__dirname, fileName);
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  文件不存在: ${fileName}`);
                errorCount++;
                return;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // 提取三类信息
            const perceptionPatterns = extractPerceptionPatterns(content, fileName);
            const deconstructionMechanisms = extractDeconstructionMechanisms(content, fileName);
            const juxtapositionLogics = extractJuxtapositionLogic(content, fileName);
            
            // 统计提取结果
            console.log(`   - 感知流模式: ${perceptionPatterns.length} 条`);
            console.log(`   - 解构机制: ${deconstructionMechanisms.length} 条`);
            console.log(`   - 并置逻辑: ${juxtapositionLogics.length} 条`);
            
            // 合并到总数组
            allPerceptionPatterns.push(...perceptionPatterns);
            allDeconstructionMechanisms.push(...deconstructionMechanisms);
            allJuxtapositionLogics.push(...juxtapositionLogics);
            
            processedCount++;
            console.log(`✅ ${fileName} 处理完成\n`);
            
        } catch (error) {
            console.error(`❌ 处理 ${fileName} 时发生错误:`, error.message);
            errorCount++;
        }
    });
    
    // 生成三个知识库文件
    try {
        console.log('📚 生成知识库文件...\n');
        
        // 感知流模式知识库
        const perceptionContent = generatePerceptionKnowledgeBase(allPerceptionPatterns);
        fs.writeFileSync(OUTPUT_FILES.perception, perceptionContent, 'utf8');
        console.log(`✅ ${OUTPUT_FILES.perception} 生成完成 (${allPerceptionPatterns.length}条记录)`);
        
        // 反讽解构机制知识库
        const deconstructionContent = generateDeconstructionKnowledgeBase(allDeconstructionMechanisms);
        fs.writeFileSync(OUTPUT_FILES.deconstruction, deconstructionContent, 'utf8');
        console.log(`✅ ${OUTPUT_FILES.deconstruction} 生成完成 (${allDeconstructionMechanisms.length}条记录)`);
        
        // 意象并置逻辑知识库
        const juxtapositionContent = generateJuxtapositionKnowledgeBase(allJuxtapositionLogics);
        fs.writeFileSync(OUTPUT_FILES.juxtaposition, juxtapositionContent, 'utf8');
        console.log(`✅ ${OUTPUT_FILES.juxtaposition} 生成完成 (${allJuxtapositionLogics.length}条记录)`);
        
    } catch (error) {
        console.error('❌ 生成知识库文件时发生错误:', error.message);
        errorCount++;
    }
    
    // 输出总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 任务完成统计');
    console.log('='.repeat(60));
    console.log(`处理文件: ${processedCount}/${ANALYSIS_FILES.length} 个`);
    console.log(`错误数量: ${errorCount} 个`);
    console.log(`感知流模式总数: ${allPerceptionPatterns.length} 条`);
    console.log(`解构机制总数: ${allDeconstructionMechanisms.length} 条`);
    console.log(`并置逻辑总数: ${allJuxtapositionLogics.length} 条`);
    console.log('\n🎉 李尤台RAG知识库生成完成！适配DIFY平台，支持中文字段检索。');
}

// 执行主函数
if (require.main === module) {
    main();
}

module.exports = {
    extractPerceptionPatterns,
    extractDeconstructionMechanisms,  
    extractJuxtapositionLogic
};
