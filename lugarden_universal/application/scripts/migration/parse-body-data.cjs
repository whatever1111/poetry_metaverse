const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// 配置路径
const OUTPUT_PATH = require('path').join(__dirname, 'temp/body_parsing_report.json');

console.log('🔍 开始解析body数据...');
console.log(`📁 输出文件: ${OUTPUT_PATH}`);

/**
 * 解析诗歌body内容
 * @param {string} body - 原始body内容
 * @returns {object} 解析后的结构化数据
 */
function parsePoemBody(body) {
    if (!body || typeof body !== 'string') {
        return {
            quote_text: null,
            quote_citation: null,
            main_text: body || null
        };
    }
    
    // 查找长破折号（——）的位置
    const dashIndex = body.indexOf('——');
    
    if (dashIndex === -1) {
        // 没有找到破折号，整个内容作为main_text
        return {
            quote_text: null,
            quote_citation: null,
            main_text: body.trim()
        };
    }
    
    // 找到破折号，按规则解析
    const beforeDash = body.substring(0, dashIndex).trim();
    const afterDash = body.substring(dashIndex).trim();
    
    // 提取quote_citation（以——开头的一整行）
    const lines = afterDash.split('\n');
    const firstLine = lines[0].replace(/^——/, '').replace(/\r$/, ''); // 去掉开头的"——"和末尾的"\r"
    const remainingLines = lines.slice(1).join('\n').trim();
    
    return {
        quote_text: beforeDash || null,
        quote_citation: firstLine || null,
        main_text: remainingLines || null
    };
}

async function main() {
    try {
        // 获取所有ZhouPoem记录
        const poems = await prisma.zhouPoem.findMany({
            select: {
                id: true,
                title: true,
                body: true
            }
        });
        
        console.log(`📊 找到 ${poems.length} 首诗歌需要解析`);
        
        const parsingResults = [];
        
        // 解析每首诗歌的body
        poems.forEach(poem => {
            const originalBody = poem.body;
            const parsed = parsePoemBody(originalBody);
            
            // 判断解析状态
            let status = 'SUCCESS';
            if (!originalBody) {
                status = 'EMPTY_BODY';
            } else if (typeof originalBody !== 'string') {
                status = 'INVALID_TYPE';
            }
            
            parsingResults.push({
                poem_id: poem.id,
                title: poem.title,
                original_body: originalBody,
                parsed_quote_text: parsed.quote_text,
                parsed_quote_citation: parsed.quote_citation,
                parsed_main_text: parsed.main_text,
                status: status
            });
        });
        
        // 生成报告
        const report = {
            parsed_at: new Date().toISOString(),
            total_poems: poems.length,
            success_count: parsingResults.filter(r => r.status === 'SUCCESS').length,
            empty_count: parsingResults.filter(r => r.status === 'EMPTY_BODY').length,
            invalid_count: parsingResults.filter(r => r.status === 'INVALID_TYPE').length,
            results: parsingResults
        };
        
        // 写入报告文件
        require('fs').writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');
        
        console.log(`✅ 成功解析 ${report.success_count} 首诗歌`);
        console.log(`📊 解析统计:`);
        console.log(`   - 成功: ${report.success_count} 首`);
        console.log(`   - 空内容: ${report.empty_count} 首`);
        console.log(`   - 类型错误: ${report.invalid_count} 首`);
        console.log(`📄 报告已保存到: ${OUTPUT_PATH}`);
        
    } catch (error) {
        console.error('❌ 解析body数据时发生错误:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
