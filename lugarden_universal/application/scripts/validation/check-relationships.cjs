const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

/**
 * 关联关系验证脚本
 * 检查跨宇宙关联、桥表关联、子宇宙内部关联等
 */

async function checkRelationships() {
  console.log('=== 关联关系验证开始 ===\n');
  
  const results = {
    bridgeRelationships: {},
    crossUniverseRelationships: {},
    internalRelationships: {},
    issues: [],
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0
    }
  };

  try {
    // 1. 检查桥表关联
    console.log('1. 检查桥表关联...');
    await checkBridgeRelationships(results);
    
    // 2. 检查跨宇宙关联
    console.log('\n2. 检查跨宇宙关联...');
    await checkCrossUniverseRelationships(results);
    
    // 3. 检查子宇宙内部关联
    console.log('\n3. 检查子宇宙内部关联...');
    await checkInternalRelationships(results);
    
    // 4. 生成报告
    console.log('\n4. 生成关联关系报告...');
    generateRelationshipReport(results);
    
  } catch (error) {
    console.error('关联关系验证失败:', error);
    results.issues.push({
      type: 'ERROR',
      category: 'SYSTEM',
      issue: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
  
  return results;
}

async function checkBridgeRelationships(results) {
  const bridgeChecks = [
    {
      name: 'UniverseTheme 桥表关联',
      check: async () => {
        const relationships = await prisma.universeTheme.findMany({
          include: {
            universe: true,
            theme: true
          }
        });
        
        const issues = [];
        for (const rel of relationships) {
          if (!rel.universe) {
            issues.push(`孤立 UniverseTheme: ${rel.id} -> Universe 不存在`);
          }
          if (!rel.theme) {
            issues.push(`孤立 UniverseTheme: ${rel.id} -> Theme 不存在`);
          }
        }
        
        return {
          count: relationships.length,
          issues: issues
        };
      }
    },
    {
      name: 'UniverseEmotion 桥表关联',
      check: async () => {
        const relationships = await prisma.universeEmotion.findMany({
          include: {
            universe: true,
            emotion: true
          }
        });
        
        const issues = [];
        for (const rel of relationships) {
          if (!rel.universe) {
            issues.push(`孤立 UniverseEmotion: ${rel.id} -> Universe 不存在`);
          }
          if (!rel.emotion) {
            issues.push(`孤立 UniverseEmotion: ${rel.id} -> Emotion 不存在`);
          }
        }
        
        return {
          count: relationships.length,
          issues: issues
        };
      }
    }
  ];

  for (const check of bridgeChecks) {
    try {
      const result = await check.check();
      results.bridgeRelationships[check.name] = result;
      results.summary.totalChecks++;
      
      if (result.issues.length > 0) {
        console.log(`  ❌ ${check.name}: ${result.count} 条关联，${result.issues.length} 个问题`);
        result.issues.forEach(issue => {
          results.issues.push({
            type: 'BRIDGE_RELATIONSHIP',
            category: check.name,
            issue: issue
          });
        });
        results.summary.failedChecks++;
      } else {
        console.log(`  ✅ ${check.name}: ${result.count} 条关联，正常`);
        results.summary.passedChecks++;
      }
    } catch (error) {
      console.error(`  ❌ ${check.name}: 检查失败 - ${error.message}`);
      results.issues.push({
        type: 'ERROR',
        category: check.name,
        issue: error.message
      });
      results.summary.failedChecks++;
    }
  }
}

async function checkCrossUniverseRelationships(results) {
  const crossUniverseChecks = [
    {
      name: 'CrossUniverseContentLink 跨宇宙关联',
      check: async () => {
        const relationships = await prisma.crossUniverseContentLink.findMany({
          include: {
            sourceUniverse: true,
            targetUniverse: true
          }
        });
        
        const issues = [];
        for (const rel of relationships) {
          if (!rel.sourceUniverse) {
            issues.push(`孤立 CrossUniverseContentLink: ${rel.id} -> SourceUniverse 不存在`);
          }
          if (!rel.targetUniverse) {
            issues.push(`孤立 CrossUniverseContentLink: ${rel.id} -> TargetUniverse 不存在`);
          }
          if (rel.sourceUniverseId === rel.targetUniverseId) {
            issues.push(`自关联 CrossUniverseContentLink: ${rel.id} 源宇宙和目标宇宙相同`);
          }
        }
        
        return {
          count: relationships.length,
          issues: issues
        };
      }
    }
  ];

  for (const check of crossUniverseChecks) {
    try {
      const result = await check.check();
      results.crossUniverseRelationships[check.name] = result;
      results.summary.totalChecks++;
      
      if (result.issues.length > 0) {
        console.log(`  ❌ ${check.name}: ${result.count} 条关联，${result.issues.length} 个问题`);
        result.issues.forEach(issue => {
          results.issues.push({
            type: 'CROSS_UNIVERSE_RELATIONSHIP',
            category: check.name,
            issue: issue
          });
        });
        results.summary.failedChecks++;
      } else {
        console.log(`  ✅ ${check.name}: ${result.count} 条关联，正常`);
        results.summary.passedChecks++;
      }
    } catch (error) {
      console.error(`  ❌ ${check.name}: 检查失败 - ${error.message}`);
      results.issues.push({
        type: 'ERROR',
        category: check.name,
        issue: error.message
      });
      results.summary.failedChecks++;
    }
  }
}

async function checkInternalRelationships(results) {
  const internalChecks = [
    {
      name: '周春秋宇宙内部关联',
      check: async () => {
        const issues = [];
        
        // 检查 ZhouSubProject -> ZhouProject
        const subProjects = await prisma.zhouSubProject.findMany({
          include: { project: true }
        });
        for (const sub of subProjects) {
          if (!sub.project) {
            issues.push(`孤立 ZhouSubProject: ${sub.id} -> ZhouProject 不存在`);
          }
        }
        
        // 检查 ZhouPoem -> ZhouSubProject
        const poems = await prisma.zhouPoem.findMany({
          include: { subProject: true }
        });
        for (const poem of poems) {
          if (poem.subProjectId && !poem.subProject) {
            issues.push(`孤立 ZhouPoem: ${poem.id} -> ZhouSubProject 不存在`);
          }
        }
        
        // 检查 ZhouQA -> ZhouSubProject
        const qas = await prisma.zhouQA.findMany({
          include: { subProject: true }
        });
        for (const qa of qas) {
          if (qa.subProjectId && !qa.subProject) {
            issues.push(`孤立 ZhouQA: ${qa.id} -> ZhouSubProject 不存在`);
          }
        }
        
        return {
          count: subProjects.length + poems.length + qas.length,
          issues: issues
        };
      }
    },
    {
      name: '毛小豆宇宙内部关联',
      check: async () => {
        const issues = [];
        
        // 检查 MaoxiaodouCharacterRelation -> MaoxiaodouCharacter
        const relations = await prisma.maoxiaodouCharacterRelation.findMany({
          include: {
            sourceCharacter: true,
            targetCharacter: true
          }
        });
        for (const rel of relations) {
          if (!rel.sourceCharacter) {
            issues.push(`孤立 MaoxiaodouCharacterRelation: ${rel.id} -> SourceCharacter 不存在`);
          }
          if (!rel.targetCharacter) {
            issues.push(`孤立 MaoxiaodouCharacterRelation: ${rel.id} -> TargetCharacter 不存在`);
          }
        }
        
        // 检查 MaoxiaodouScene -> MaoxiaodouPoem
        const scenes = await prisma.maoxiaodouScene.findMany({
          include: { poem: true }
        });
        for (const scene of scenes) {
          if (!scene.poem) {
            issues.push(`孤立 MaoxiaodouScene: ${scene.id} -> MaoxiaodouPoem 不存在`);
          }
        }
        
        return {
          count: relations.length + scenes.length,
          issues: issues
        };
      }
    }
  ];

  for (const check of internalChecks) {
    try {
      const result = await check.check();
      results.internalRelationships[check.name] = result;
      results.summary.totalChecks++;
      
      if (result.issues.length > 0) {
        console.log(`  ❌ ${check.name}: ${result.count} 条关联，${result.issues.length} 个问题`);
        result.issues.forEach(issue => {
          results.issues.push({
            type: 'INTERNAL_RELATIONSHIP',
            category: check.name,
            issue: issue
          });
        });
        results.summary.failedChecks++;
      } else {
        console.log(`  ✅ ${check.name}: ${result.count} 条关联，正常`);
        results.summary.passedChecks++;
      }
    } catch (error) {
      console.error(`  ❌ ${check.name}: 检查失败 - ${error.message}`);
      results.issues.push({
        type: 'ERROR',
        category: check.name,
        issue: error.message
      });
      results.summary.failedChecks++;
    }
  }
}

function generateRelationshipReport(results) {
  console.log('\n=== 关联关系验证报告 ===');
  console.log(`总检查数: ${results.summary.totalChecks}`);
  console.log(`通过检查: ${results.summary.passedChecks}`);
  console.log(`失败检查: ${results.summary.failedChecks}`);
  console.log(`发现问题: ${results.issues.length}`);
  
  if (results.issues.length > 0) {
    console.log('\n发现的问题:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}] ${issue.category}: ${issue.issue}`);
    });
  } else {
    console.log('\n✅ 所有关联关系检查通过！');
  }
  
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  checkRelationships()
    .then(results => {
      console.log('\n=== 验证完成 ===');
      process.exit(results.summary.failedChecks > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('验证失败:', error);
      process.exit(1);
    });
}

module.exports = { checkRelationships };
