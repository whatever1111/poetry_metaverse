#!/usr/bin/env node

/**
 * 唐宗正宇宙诗歌数据JSON生成器 - 简洁版
 * 基于99个标准化.md文件生成干净的诗歌数据
 * 参考周与春秋项目的简洁设计理念
 */

const fs = require('fs');
const path = require('path');

// 配置
const COLLECTIONS = ['偶记集', '爱人'];
const UNIVERSE_ID = 'universe_tangzongzheng';

// 统计数据
let stats = {
    totalPoems: 0,
    collections: {},
    sections: {}
};

/**
 * 解析markdown文件
 */
function parseMarkdownFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 解析YAML Front Matter
        const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!yamlMatch) {
            throw new Error('未找到YAML Front Matter');
        }
        
        const yamlContent = yamlMatch[1];
        const yamlData = {};
        
        // 解析YAML字段
        const yamlLines = yamlContent.split('\n');
        yamlLines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                // 移除引号
                value = value.replace(/^["']|["']$/g, '');
                yamlData[key] = value;
            }
        });
        
        // 提取诗歌正文（去掉YAML和标题）
        const afterYaml = content.replace(/^---[\s\S]*?---\s*\n/, '');
        const afterTitle = afterYaml.replace(/^# .+?\r?\n\r?\n/, '');
        const body = afterTitle.trim();
        
        return {
            yaml: yamlData,
            body: body
        };
    } catch (error) {
        console.error(`解析文件失败 ${filePath}:`, error.message);
        return null;
    }
}

/**
 * 生成诗歌ID
 */
function generatePoemId(index) {
    return `tangzongzheng_poem_${String(index).padStart(3, '0')}`;
}

/**
 * 处理单个诗集目录
 */
function processCollection(collectionName) {
    const collectionPath = path.join('.', collectionName);
    const poems = [];
    
    if (!fs.existsSync(collectionPath)) {
        console.log(`诗集目录不存在: ${collectionPath}`);
        return poems;
    }
    
    // 获取所有辑目录，按序号排序
    const sectionDirs = fs.readdirSync(collectionPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort((a, b) => {
            const aNum = parseInt(a.split('_')[0]);
            const bNum = parseInt(b.split('_')[0]);
            return aNum - bNum;
        });
    
    console.log(`\n处理诗集: ${collectionName}`);
    console.log(`找到辑目录:`, sectionDirs);
    
    sectionDirs.forEach(sectionDir => {
        const sectionPath = path.join(collectionPath, sectionDir);
        const sectionName = sectionDir.split('_').slice(1).join('_');
        const sectionNumber = parseInt(sectionDir.split('_')[0]);
        
        // 获取该辑所有.md文件，按序号排序
        const mdFiles = fs.readdirSync(sectionPath)
            .filter(file => file.endsWith('.md'))
            .sort((a, b) => {
                const aNum = parseInt(a.split('_')[0]);
                const bNum = parseInt(b.split('_')[0]);
                return aNum - bNum;
            });
        
        console.log(`  辑 ${sectionNumber}_${sectionName}: ${mdFiles.length} 首诗歌`);
        
        mdFiles.forEach((file, index) => {
            const filePath = path.join(sectionPath, file);
            const parseResult = parseMarkdownFile(filePath);
            
            if (parseResult) {
                const { yaml, body } = parseResult;
                
                // 构建诗歌对象
                const poem = {
                    id: generatePoemId(stats.totalPoems + 1),
                    title: yaml.title || '',
                    author: yaml.author || '李尤台',
                    collection: yaml.collection || collectionName,
                    section: yaml.section || sectionName,
                    sectionNumber: parseInt(yaml.section_number) || sectionNumber,
                    sequence: parseInt(yaml.sequence) || (index + 1),
                    date: yaml.date || '',
                    body: body
                };
                
                poems.push(poem);
                stats.totalPoems++;
                
                // 更新统计
                if (!stats.collections[poem.collection]) {
                    stats.collections[poem.collection] = 0;
                }
                stats.collections[poem.collection]++;
                
                const sectionKey = `${poem.collection}-${poem.section}`;
                if (!stats.sections[sectionKey]) {
                    stats.sections[sectionKey] = 0;
                }
                stats.sections[sectionKey]++;
            }
        });
    });
    
    return poems;
}

/**
 * 主函数
 */
function main() {
    console.log('开始生成唐宗正宇宙诗歌数据...\n');
    
    let allPoems = [];
    
    // 处理每个诗集
    COLLECTIONS.forEach(collection => {
        const poems = processCollection(collection);
        allPoems = allPoems.concat(poems);
    });
    
    // 生成最终JSON结构
    const result = {
        metadata: {
            universe_id: UNIVERSE_ID,
            universe_name: '唐宗正宇宙',
            version: '1.0.0',
            generated_at: new Date().toISOString(),
            data_source: '99个标准化李尤台诗歌.md文件',
            total_poems: stats.totalPoems,
            collections: stats.collections,
            sections: stats.sections
        },
        poems: allPoems
    };
    
    // 写入文件
    const outputFile = 'tangzongzheng-poems.json';
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
    
    console.log(`\n✅ 数据生成完成！`);
    console.log(`📄 输出文件: ${outputFile}`);
    console.log(`📊 统计信息:`);
    console.log(`   总诗歌数: ${stats.totalPoems}`);
    console.log(`   诗集分布:`, stats.collections);
    console.log(`   辑分布: ${Object.keys(stats.sections).length} 个辑`);
    
    return result;
}

// 运行
if (require.main === module) {
    main();
}

module.exports = { main, parseMarkdownFile, generatePoemId };
