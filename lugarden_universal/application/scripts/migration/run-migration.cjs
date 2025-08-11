/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const { migrateMainUniverse } = require('./migrate-main-universe.cjs');
const { migrateMaoxiaodou } = require('./migrate-maoxiaodou.cjs');
const { migrateZhou } = require('./migrate-zhou.cjs');

/**
 * 完整的数据库迁移脚本
 * 按照正确的顺序执行所有迁移，确保数据完整性和一致性
 * 
 * 执行顺序：
 * 1. 主宇宙基础数据（Universe, Theme, Emotion）
 * 2. 毛小豆宇宙数据（包含跨宇宙关联）
 * 3. 周春秋宇宙数据
 * 4. 主宇宙桥表关联（包含权重和置信度计算）
 */

async function runCompleteMigration() {
  console.log('=== 开始完整数据库迁移 ===\n');
  
  try {
    // 第一步：迁移主宇宙基础数据
    console.log('第一步：迁移主宇宙基础数据...');
    await migrateMainUniverse();
    console.log('✅ 主宇宙基础数据迁移完成\n');
    
    // 第二步：迁移毛小豆宇宙数据（包含跨宇宙关联）
    console.log('第二步：迁移毛小豆宇宙数据...');
    await migrateMaoxiaodou();
    console.log('✅ 毛小豆宇宙数据迁移完成\n');
    
    // 第三步：迁移周春秋宇宙数据
    console.log('第三步：迁移周春秋宇宙数据...');
    await migrateZhou();
    console.log('✅ 周春秋宇宙数据迁移完成\n');
    
    // 第四步：重新计算主宇宙桥表关联（确保权重和置信度正确）
    console.log('第四步：重新计算主宇宙桥表关联...');
    await migrateMainUniverse();
    console.log('✅ 主宇宙桥表关联计算完成\n');
    
    console.log('=== 完整数据库迁移完成 ===');
    console.log('所有数据已按照治理后的标准迁移完成');
    console.log('包括：');
    console.log('- 正确的诗歌内容读取');
    console.log('- 跨宇宙关联到主宇宙层');
    console.log('- 权重和置信度的正确计算');
    console.log('- 数据完整性和一致性保证');
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runCompleteMigration()
    .then(() => {
      console.log('\n🎉 迁移成功完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 迁移失败:', error);
      process.exit(1);
    });
}

module.exports = { runCompleteMigration };


