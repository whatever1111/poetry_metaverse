const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 验证数据写入结果...');
        
        // 验证ZhouMapping.meaning字段
        console.log('\n📊 验证ZhouMapping.meaning字段:');
        const mappingsWithMeaning = await prisma.zhouMapping.findMany({
            where: {
                meaning: { not: null }
            },
            select: {
                id: true,
                chapter: true,
                combination: true,
                meaning: true
            }
        });
        
        console.log(`   - 有meaning数据的记录: ${mappingsWithMeaning.length} 条`);
        
        if (mappingsWithMeaning.length > 0) {
            console.log('   - 示例meaning数据:');
            mappingsWithMeaning.slice(0, 2).forEach((mapping, index) => {
                console.log(`     ${index + 1}. ${mapping.chapter}-${mapping.combination}: ${mapping.meaning.substring(0, 50)}...`);
            });
        }
        
        // 验证ZhouPoem.body字段
        console.log('\n📊 验证ZhouPoem.body字段:');
        const poemsWithStructuredBody = await prisma.zhouPoem.findMany({
            where: {
                body: { not: null }
            },
            select: {
                id: true,
                title: true,
                body: true
            }
        });
        
        console.log(`   - 有结构化body数据的诗歌: ${poemsWithStructuredBody.length} 首`);
        
        if (poemsWithStructuredBody.length > 0) {
            console.log('   - 示例结构化body数据:');
            const samplePoem = poemsWithStructuredBody[0];
            console.log(`     诗歌: ${samplePoem.title}`);
            console.log(`     Body结构: ${JSON.stringify(samplePoem.body, null, 6)}`);
        }
        
        // 统计验证
        const totalMappings = await prisma.zhouMapping.count();
        const totalPoems = await prisma.zhouPoem.count();
        
        console.log('\n📊 数据完整性统计:');
        console.log(`   - ZhouMapping表总记录: ${totalMappings} 条`);
        console.log(`   - 有meaning数据的记录: ${mappingsWithMeaning.length} 条`);
        console.log(`   - ZhouPoem表总记录: ${totalPoems} 首`);
        console.log(`   - 有结构化body数据的诗歌: ${poemsWithStructuredBody.length} 首`);
        
        const mappingCompleteness = (mappingsWithMeaning.length / totalMappings * 100).toFixed(1);
        const poemCompleteness = (poemsWithStructuredBody.length / totalPoems * 100).toFixed(1);
        
        console.log(`   - ZhouMapping.meaning完整度: ${mappingCompleteness}%`);
        console.log(`   - ZhouPoem.body完整度: ${poemCompleteness}%`);
        
        // 生成验证报告
        const verificationReport = {
            verified_at: new Date().toISOString(),
            summary: {
                total_mappings: totalMappings,
                mappings_with_meaning: mappingsWithMeaning.length,
                total_poems: totalPoems,
                poems_with_structured_body: poemsWithStructuredBody.length,
                mapping_completeness: parseFloat(mappingCompleteness),
                poem_completeness: parseFloat(poemCompleteness)
            },
            verification_result: {
                meaning_data_complete: mappingsWithMeaning.length === totalMappings,
                body_data_complete: poemsWithStructuredBody.length === totalPoems,
                all_data_verified: mappingsWithMeaning.length === totalMappings && poemsWithStructuredBody.length === totalPoems
            }
        };
        
        const fs = require('fs');
        const path = require('path');
        const reportPath = path.join(__dirname, 'temp/data_verification_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(verificationReport, null, 2), 'utf8');
        
        console.log(`\n📄 验证报告已保存到: ${reportPath}`);
        
        if (verificationReport.verification_result.all_data_verified) {
            console.log('\n✅ 数据验证通过！所有数据已成功写入。');
        } else {
            console.log('\n⚠️ 数据验证发现问题，请检查写入过程。');
        }
        
    } catch (error) {
        console.error('❌ 验证数据时发生错误:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
