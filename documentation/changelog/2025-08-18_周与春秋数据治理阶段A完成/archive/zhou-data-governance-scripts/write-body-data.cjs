const { PrismaClient } = require('../../generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 配置路径
const BODY_REPORT_PATH = path.join(__dirname, 'temp/body_parsing_report.json');

console.log('📝 开始写入body数据...');
console.log(`📁 数据源: ${BODY_REPORT_PATH}`);

async function main() {
    try {
        // 读取审核后的body解析报告
        const bodyReport = JSON.parse(fs.readFileSync(BODY_REPORT_PATH, 'utf8'));
        
        console.log(`📊 准备写入 ${bodyReport.total_poems} 首诗歌的body数据`);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // 遍历body解析结果并写入数据库
        for (const result of bodyReport.results) {
            try {
                // 构建结构化的JSON数据
                const structuredBody = {
                    quote_text: result.parsed_quote_text,
                    quote_citation: result.parsed_quote_citation,
                    main_text: result.parsed_main_text
                };
                
                // 更新ZhouPoem的body字段
                await prisma.zhouPoem.update({
                    where: { id: result.poem_id },
                    data: { body: structuredBody }
                });
                
                successCount++;
            } catch (error) {
                errorCount++;
                errors.push({
                    poem_id: result.poem_id,
                    title: result.title,
                    error: error.message
                });
            }
        }
        
        // 生成写入报告
        const writeReport = {
            written_at: new Date().toISOString(),
            total_poems: bodyReport.total_poems,
            success_count: successCount,
            error_count: errorCount,
            errors: errors
        };
        
        const reportPath = path.join(__dirname, 'temp/body_write_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(writeReport, null, 2), 'utf8');
        
        console.log(`✅ 成功写入 ${successCount} 首诗歌的body数据`);
        console.log(`❌ 写入失败 ${errorCount} 首诗歌`);
        console.log(`📄 写入报告已保存到: ${reportPath}`);
        
        if (errors.length > 0) {
            console.log('\n📋 错误详情:');
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.title} (${error.poem_id}): ${error.error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 写入body数据时发生错误:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
