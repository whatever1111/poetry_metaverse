const { PrismaClient } = require('../../generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 配置路径
const MEANING_REPORT_PATH = path.join(__dirname, 'temp/meaning_report.json');

console.log('📝 开始写入meaning数据...');
console.log(`📁 数据源: ${MEANING_REPORT_PATH}`);

async function main() {
    try {
        // 读取审核后的meaning报告
        const meaningReport = JSON.parse(fs.readFileSync(MEANING_REPORT_PATH, 'utf8'));
        
        console.log(`📊 准备写入 ${meaningReport.total_records} 条meaning记录`);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // 遍历meaning数据并写入数据库
        for (const record of meaningReport.data) {
            try {
                // 将字母组合转换为数字组合
                const combinationMap = {
                    'AAAA': '0000', 'AAAB': '0001', 'AABA': '0010', 'AABB': '0011',
                    'ABAA': '0100', 'ABAB': '0101', 'ABBA': '0110', 'ABBB': '0111',
                    'BAAA': '1000', 'BAAB': '1001', 'BABA': '1010', 'BABB': '1011',
                    'BBAA': '1100', 'BBAB': '1101', 'BBBA': '1110', 'BBBB': '1111'
                };
                
                const numericCombination = combinationMap[record.combination];
                if (!numericCombination) {
                    throw new Error(`无法转换组合: ${record.combination}`);
                }
                
                // 查找对应的ZhouMapping记录
                const mapping = await prisma.zhouMapping.findFirst({
                    where: {
                        universeId: 'universe_zhou_spring_autumn',
                        chapter: record.chapter,
                        combination: numericCombination
                    }
                });
                
                if (mapping) {
                    // 更新meaning字段
                    await prisma.zhouMapping.update({
                        where: { id: mapping.id },
                        data: { meaning: record.meaning }
                    });
                    successCount++;
                } else {
                    errorCount++;
                    errors.push({
                        record: record,
                        error: '找不到对应的ZhouMapping记录'
                    });
                }
            } catch (error) {
                errorCount++;
                errors.push({
                    record: record,
                    error: error.message
                });
            }
        }
        
        // 生成写入报告
        const writeReport = {
            written_at: new Date().toISOString(),
            total_records: meaningReport.total_records,
            success_count: successCount,
            error_count: errorCount,
            errors: errors
        };
        
        const reportPath = path.join(__dirname, 'temp/meaning_write_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(writeReport, null, 2), 'utf8');
        
        console.log(`✅ 成功写入 ${successCount} 条meaning记录`);
        console.log(`❌ 写入失败 ${errorCount} 条记录`);
        console.log(`📄 写入报告已保存到: ${reportPath}`);
        
        if (errors.length > 0) {
            console.log('\n📋 错误详情:');
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.record.chapter}-${error.record.combination}: ${error.error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 写入meaning数据时发生错误:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
