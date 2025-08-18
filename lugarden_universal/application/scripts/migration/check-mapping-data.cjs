const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 检查ZhouMapping表数据...');
        
        // 获取所有ZhouMapping记录
        const mappings = await prisma.zhouMapping.findMany({
            select: {
                id: true,
                chapter: true,
                combination: true,
                poemTitle: true,
                universeId: true
            }
        });
        
        console.log(`📊 ZhouMapping表共有 ${mappings.length} 条记录`);
        
        if (mappings.length > 0) {
            console.log('\n📋 前5条记录:');
            mappings.slice(0, 5).forEach((mapping, index) => {
                console.log(`   ${index + 1}. ID: ${mapping.id}`);
                console.log(`      章节: ${mapping.chapter}`);
                console.log(`      组合: ${mapping.combination}`);
                console.log(`      诗歌标题: ${mapping.poemTitle}`);
                console.log(`      宇宙ID: ${mapping.universeId}`);
                console.log('');
            });
            
            // 统计章节分布
            const chapterStats = {};
            mappings.forEach(mapping => {
                chapterStats[mapping.chapter] = (chapterStats[mapping.chapter] || 0) + 1;
            });
            
            console.log('📊 章节统计:');
            Object.entries(chapterStats).forEach(([chapter, count]) => {
                console.log(`   - ${chapter}: ${count} 条记录`);
            });
        } else {
            console.log('❌ ZhouMapping表中没有数据');
        }
        
    } catch (error) {
        console.error('❌ 检查ZhouMapping数据时发生错误:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
