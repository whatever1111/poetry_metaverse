const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 测试数据库连接...');
        
        // 测试连接
        await prisma.$connect();
        console.log('✅ 数据库连接成功');
        
        // 获取ZhouPoem记录数量
        const count = await prisma.zhouPoem.count();
        console.log(`📊 ZhouPoem表共有 ${count} 条记录`);
        
        // 获取前3条记录的基本信息
        const poems = await prisma.zhouPoem.findMany({
            select: {
                id: true,
                title: true,
                body: true
            },
            take: 3
        });
        
        console.log('📋 前3条记录信息:');
        poems.forEach((poem, index) => {
            console.log(`\n--- 记录 ${index + 1} ---`);
            console.log(`ID: ${poem.id}`);
            console.log(`标题: ${poem.title}`);
            console.log(`Body类型: ${typeof poem.body}`);
            console.log(`Body长度: ${poem.body ? poem.body.length : 0}`);
            if (poem.body) {
                console.log(`Body前50字符: ${poem.body.substring(0, 50)}...`);
            }
        });
        
    } catch (error) {
        console.error('❌ 数据库连接或查询失败:', error.message);
        console.error('错误详情:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
