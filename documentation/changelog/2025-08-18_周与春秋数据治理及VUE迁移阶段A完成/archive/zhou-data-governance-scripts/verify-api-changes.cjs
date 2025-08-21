const { PrismaClient } = require('../../generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 验证API修改是否正确处理新的数据结构...');
        
        // 1. 验证ZhouMapping.meaning字段
        console.log('\n📊 验证ZhouMapping.meaning字段:');
        const mappingsWithMeaning = await prisma.zhouMapping.findMany({
            where: {
                meaning: { not: null }
            },
            select: {
                id: true,
                chapter: true,
                combination: true,
                poemTitle: true,
                meaning: true
            },
            take: 3
        });
        
        console.log(`   - 找到 ${mappingsWithMeaning.length} 条包含meaning的记录`);
        if (mappingsWithMeaning.length > 0) {
            console.log('   - 示例meaning数据:');
            mappingsWithMeaning.forEach((mapping, index) => {
                console.log(`     ${index + 1}. ${mapping.chapter}-${mapping.combination}: ${mapping.meaning.substring(0, 50)}...`);
            });
        }
        
        // 2. 验证ZhouPoem.body字段的JSON格式
        console.log('\n📊 验证ZhouPoem.body字段的JSON格式:');
        const poemsWithJsonBody = await prisma.zhouPoem.findMany({
            where: {
                body: { not: null }
            },
            select: {
                id: true,
                title: true,
                body: true
            },
            take: 3
        });
        
        console.log(`   - 找到 ${poemsWithJsonBody.length} 首诗歌包含body数据`);
        if (poemsWithJsonBody.length > 0) {
            console.log('   - 示例JSON body数据:');
            poemsWithJsonBody.forEach((poem, index) => {
                if (typeof poem.body === 'object' && poem.body !== null) {
                    console.log(`     ${index + 1}. ${poem.title}:`);
                    console.log(`        quote_text: ${poem.body.quote_text ? '有' : '无'}`);
                    console.log(`        quote_citation: ${poem.body.quote_citation ? '有' : '无'}`);
                    console.log(`        main_text: ${poem.body.main_text ? '有' : '无'}`);
                } else {
                    console.log(`     ${index + 1}. ${poem.title}: 字符串格式（向后兼容）`);
                }
            });
        }
        
        // 3. 验证数据完整性
        console.log('\n📊 验证数据完整性:');
        const totalMappings = await prisma.zhouMapping.count();
        const mappingsWithMeaningCount = await prisma.zhouMapping.count({
            where: { meaning: { not: null } }
        });
        const totalPoems = await prisma.zhouPoem.count();
        const poemsWithBodyCount = await prisma.zhouPoem.count({
            where: { body: { not: null } }
        });
        
        console.log(`   - ZhouMapping表: ${totalMappings} 条记录，${mappingsWithMeaningCount} 条有meaning数据`);
        console.log(`   - ZhouPoem表: ${totalPoems} 首诗歌，${poemsWithBodyCount} 首有body数据`);
        
        const mappingCompleteness = (mappingsWithMeaningCount / totalMappings * 100).toFixed(1);
        const poemCompleteness = (poemsWithBodyCount / totalPoems * 100).toFixed(1);
        
        console.log(`   - ZhouMapping.meaning完整度: ${mappingCompleteness}%`);
        console.log(`   - ZhouPoem.body完整度: ${poemCompleteness}%`);
        
        // 4. 生成验证报告
        const verificationReport = {
            verified_at: new Date().toISOString(),
            summary: {
                mappings_with_meaning: mappingsWithMeaningCount,
                total_mappings: totalMappings,
                poems_with_body: poemsWithBodyCount,
                total_poems: totalPoems,
                mapping_completeness: parseFloat(mappingCompleteness),
                poem_completeness: parseFloat(poemCompleteness)
            },
            sample_data: {
                mappings: mappingsWithMeaning.slice(0, 2).map(m => ({
                    chapter: m.chapter,
                    combination: m.combination,
                    poemTitle: m.poemTitle,
                    meaning_preview: m.meaning.substring(0, 100)
                })),
                poems: poemsWithJsonBody.slice(0, 2).map(p => ({
                    title: p.title,
                    body_type: typeof p.body,
                    has_quote_text: p.body && typeof p.body === 'object' && p.body.quote_text ? true : false,
                    has_quote_citation: p.body && typeof p.body === 'object' && p.body.quote_citation ? true : false,
                    has_main_text: p.body && typeof p.body === 'object' && p.body.main_text ? true : false
                }))
            },
            verification_result: {
                meaning_data_available: mappingsWithMeaningCount > 0,
                json_body_format_available: poemsWithJsonBody.some(p => typeof p.body === 'object'),
                all_data_verified: mappingsWithMeaningCount === totalMappings && poemsWithBodyCount === totalPoems
            }
        };
        
        const reportPath = path.join(__dirname, 'temp/api_verification_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(verificationReport, null, 2), 'utf8');
        
        console.log(`\n📄 API验证报告已保存到: ${reportPath}`);
        
        if (verificationReport.verification_result.all_data_verified) {
            console.log('\n✅ API修改验证通过！所有数据已正确迁移。');
        } else {
            console.log('\n⚠️ API修改验证完成，但发现部分数据不完整。');
        }
        
    } catch (error) {
        console.error('❌ 验证API修改时发生错误:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
