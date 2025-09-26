const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

/**
 * 数据完整性检查脚本
 * 验证所有表的记录数、外键关联、唯一性约束等
 */

async function checkDataIntegrity() {
  console.log('=== 数据完整性检查开始 ===\n');
  
  const results = {
    tableCounts: {},
    foreignKeyChecks: {},
    uniqueConstraintChecks: {},
    dataQualityIssues: [],
    summary: {
      totalTables: 0,
      totalRecords: 0,
      issuesFound: 0
    }
  };

  try {
    // 1. 检查所有表的记录数
    console.log('1. 检查表记录数...');
    await checkTableCounts(results);
    
    // 2. 检查外键关联完整性
    console.log('\n2. 检查外键关联完整性...');
    await checkForeignKeyIntegrity(results);
    
    // 3. 检查唯一性约束
    console.log('\n3. 检查唯一性约束...');
    await checkUniqueConstraints(results);
    
    // 4. 检查数据质量问题
    console.log('\n4. 检查数据质量问题...');
    await checkDataQuality(results);
    
    // 5. 生成报告
    console.log('\n5. 生成完整性检查报告...');
    generateIntegrityReport(results);
    
  } catch (error) {
    console.error('完整性检查失败:', error);
    results.dataQualityIssues.push({
      type: 'ERROR',
      table: 'SYSTEM',
      field: 'EXECUTION',
      issue: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
  
  return results;
}

async function checkTableCounts(results) {
  const tables = [
    // 主宇宙表
    { name: 'Universe', model: prisma.universe },
    { name: 'Theme', model: prisma.theme },
    { name: 'Emotion', model: prisma.emotion },
    
    // 桥表
    { name: 'UniverseTheme', model: prisma.universeTheme },
    { name: 'UniverseEmotion', model: prisma.universeEmotion },
    { name: 'CrossUniverseContentLink', model: prisma.crossUniverseContentLink },
    
    // 周春秋宇宙表
    { name: 'ZhouProject', model: prisma.zhouProject },
    { name: 'ZhouSubProject', model: prisma.zhouSubProject },
    { name: 'ZhouPoem', model: prisma.zhouPoem },
    { name: 'ZhouQA', model: prisma.zhouQA },
    { name: 'ZhouMapping', model: prisma.zhouMapping },
    
    // 毛小豆宇宙表
    { name: 'MaoxiaodouPoem', model: prisma.maoxiaodouPoem },
    { name: 'MaoxiaodouCharacter', model: prisma.maoxiaodouCharacter },
    { name: 'MaoxiaodouCharacterRelation', model: prisma.maoxiaodouCharacterRelation },
    { name: 'MaoxiaodouScene', model: prisma.maoxiaodouScene },
    { name: 'MaoxiaodouTerminology', model: prisma.maoxiaodouTerminology },
    { name: 'MaoxiaodouTheme', model: prisma.maoxiaodouTheme },
    { name: 'MaoxiaodouTimeline', model: prisma.maoxiaodouTimeline },
    { name: 'MaoxiaodouTheory', model: prisma.maoxiaodouTheory },
    { name: 'MaoxiaodouReadingLayer', model: prisma.maoxiaodouReadingLayer },
    { name: 'MaoxiaodouMapping', model: prisma.maoxiaodouMapping },
    { name: 'MaoxiaodouMetadata', model: prisma.maoxiaodouMetadata }
  ];

  for (const table of tables) {
    try {
      const count = await table.model.count();
      results.tableCounts[table.name] = count;
      results.summary.totalRecords += count;
      console.log(`  ${table.name}: ${count} 条记录`);
    } catch (error) {
      console.error(`  ${table.name}: 检查失败 - ${error.message}`);
      results.dataQualityIssues.push({
        type: 'ERROR',
        table: table.name,
        field: 'COUNT',
        issue: error.message
      });
    }
  }
  
  results.summary.totalTables = tables.length;
}

async function checkForeignKeyIntegrity(results) {
  // 检查 Universe 外键关联
  const foreignKeyChecks = [
    {
      name: 'UniverseTheme -> Universe',
      check: async () => {
        // 使用更简单的方法检查外键关联
        const allUniverseThemes = await prisma.universeTheme.findMany({
          include: { universe: true }
        });
        const orphaned = allUniverseThemes.filter(ut => !ut.universe);
        return orphaned.length;
      }
    },
    {
      name: 'UniverseTheme -> Theme',
      check: async () => {
        const allUniverseThemes = await prisma.universeTheme.findMany({
          include: { theme: true }
        });
        const orphaned = allUniverseThemes.filter(ut => !ut.theme);
        return orphaned.length;
      }
    },
    {
      name: 'UniverseEmotion -> Universe',
      check: async () => {
        const allUniverseEmotions = await prisma.universeEmotion.findMany({
          include: { universe: true }
        });
        const orphaned = allUniverseEmotions.filter(ue => !ue.universe);
        return orphaned.length;
      }
    },
    {
      name: 'UniverseEmotion -> Emotion',
      check: async () => {
        const allUniverseEmotions = await prisma.universeEmotion.findMany({
          include: { emotion: true }
        });
        const orphaned = allUniverseEmotions.filter(ue => !ue.emotion);
        return orphaned.length;
      }
    },
    {
      name: 'ZhouPoem -> Universe',
      check: async () => {
        const allZhouPoems = await prisma.zhouPoem.findMany({
          include: { universe: true }
        });
        const orphaned = allZhouPoems.filter(poem => !poem.universe);
        return orphaned.length;
      }
    },
    {
      name: 'MaoxiaodouPoem -> Universe',
      check: async () => {
        const allMaoxiaodouPoems = await prisma.maoxiaodouPoem.findMany({
          include: { universe: true }
        });
        const orphaned = allMaoxiaodouPoems.filter(poem => !poem.universe);
        return orphaned.length;
      }
    }
  ];

  for (const check of foreignKeyChecks) {
    try {
      const orphanedCount = await check.check();
      results.foreignKeyChecks[check.name] = orphanedCount;
      
      if (orphanedCount > 0) {
        console.log(`  ❌ ${check.name}: ${orphanedCount} 条孤立记录`);
        results.dataQualityIssues.push({
          type: 'FOREIGN_KEY',
          table: check.name,
          field: 'RELATION',
          issue: `${orphanedCount} 条孤立记录`
        });
      } else {
        console.log(`  ✅ ${check.name}: 正常`);
      }
    } catch (error) {
      console.error(`  ❌ ${check.name}: 检查失败 - ${error.message}`);
      results.dataQualityIssues.push({
        type: 'ERROR',
        table: check.name,
        field: 'FOREIGN_KEY_CHECK',
        issue: error.message
      });
    }
  }
}

async function checkUniqueConstraints(results) {
  // 检查唯一性约束
  const uniqueChecks = [
    {
      name: 'Theme.name',
      check: async () => {
        const themes = await prisma.theme.findMany();
        const names = themes.map(t => t.name);
        const uniqueNames = new Set(names);
        return names.length - uniqueNames.size;
      }
    },
    {
      name: 'Emotion.name',
      check: async () => {
        const emotions = await prisma.emotion.findMany();
        const names = emotions.map(e => e.name);
        const uniqueNames = new Set(names);
        return names.length - uniqueNames.size;
      }
    },
    {
      name: 'Universe.code',
      check: async () => {
        const universes = await prisma.universe.findMany();
        const codes = universes.map(u => u.code);
        const uniqueCodes = new Set(codes);
        return codes.length - uniqueCodes.size;
      }
    }
  ];

  for (const check of uniqueChecks) {
    try {
      const duplicateCount = await check.check();
      results.uniqueConstraintChecks[check.name] = duplicateCount;
      
      if (duplicateCount > 0) {
        console.log(`  ❌ ${check.name}: ${duplicateCount} 条重复记录`);
        results.dataQualityIssues.push({
          type: 'UNIQUE_CONSTRAINT',
          table: check.name,
          field: 'UNIQUE',
          issue: `${duplicateCount} 条重复记录`
        });
      } else {
        console.log(`  ✅ ${check.name}: 正常`);
      }
    } catch (error) {
      console.error(`  ❌ ${check.name}: 检查失败 - ${error.message}`);
      results.dataQualityIssues.push({
        type: 'ERROR',
        table: check.name,
        field: 'UNIQUE_CHECK',
        issue: error.message
      });
    }
  }
}

async function checkDataQuality(results) {
  // 检查空值
  const nullChecks = [
    {
      name: 'Theme.description',
      check: async () => {
        const nullCount = await prisma.theme.count({
          where: { description: null }
        });
        return nullCount;
      }
    },
    {
      name: 'ZhouPoem.body',
      check: async () => {
        const nullCount = await prisma.zhouPoem.count({
          where: { body: null }
        });
        return nullCount;
      }
    },
    {
      name: 'MaoxiaodouPoem.body',
      check: async () => {
        const nullCount = await prisma.maoxiaodouPoem.count({
          where: { body: null }
        });
        return nullCount;
      }
    }
  ];

  for (const check of nullChecks) {
    try {
      const nullCount = await check.check();
      if (nullCount > 0) {
        console.log(`  ⚠️  ${check.name}: ${nullCount} 条空值记录`);
        results.dataQualityIssues.push({
          type: 'NULL_VALUE',
          table: check.name,
          field: 'NULL_CHECK',
          issue: `${nullCount} 条空值记录`
        });
      } else {
        console.log(`  ✅ ${check.name}: 正常`);
      }
    } catch (error) {
      console.error(`  ❌ ${check.name}: 检查失败 - ${error.message}`);
    }
  }
}

function generateIntegrityReport(results) {
  console.log('\n=== 数据完整性检查报告 ===');
  console.log(`总表数: ${results.summary.totalTables}`);
  console.log(`总记录数: ${results.summary.totalRecords}`);
  console.log(`发现问题数: ${results.dataQualityIssues.length}`);
  
  if (results.dataQualityIssues.length > 0) {
    console.log('\n发现的问题:');
    results.dataQualityIssues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}] ${issue.table}.${issue.field}: ${issue.issue}`);
    });
  } else {
    console.log('\n✅ 所有检查通过，数据完整性良好！');
  }
  
  results.summary.issuesFound = results.dataQualityIssues.length;
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDataIntegrity()
    .then(results => {
      console.log('\n=== 检查完成 ===');
      process.exit(results.summary.issuesFound > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('检查失败:', error);
      process.exit(1);
    });
}

module.exports = { checkDataIntegrity };
