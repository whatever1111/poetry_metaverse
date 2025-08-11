const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

/**
 * 数据一致性检查脚本
 * 检查数据类型、格式、跨宇宙数据一致性等
 */

async function checkConsistency() {
  console.log('=== 数据一致性检查开始 ===\n');
  
  const results = {
    dataTypeChecks: {},
    formatChecks: {},
    crossUniverseConsistency: {},
    issues: [],
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0
    }
  };

  try {
    // 1. 检查数据类型一致性
    console.log('1. 检查数据类型一致性...');
    await checkDataTypeConsistency(results);
    
    // 2. 检查数据格式一致性
    console.log('\n2. 检查数据格式一致性...');
    await checkFormatConsistency(results);
    
    // 3. 检查跨宇宙数据一致性
    console.log('\n3. 检查跨宇宙数据一致性...');
    await checkCrossUniverseConsistency(results);
    
    // 4. 生成报告
    console.log('\n4. 生成一致性检查报告...');
    generateConsistencyReport(results);
    
  } catch (error) {
    console.error('一致性检查失败:', error);
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

async function checkDataTypeConsistency(results) {
  const dataTypeChecks = [
    {
      name: 'Universe ID 格式一致性',
      check: async () => {
        const universes = await prisma.universe.findMany();
        const issues = [];
        
        for (const universe of universes) {
          if (!universe.id.startsWith('universe_')) {
            issues.push(`Universe ID 格式错误: ${universe.id} 应该以 'universe_' 开头`);
          }
          if (!universe.code.startsWith('universe_')) {
            issues.push(`Universe Code 格式错误: ${universe.code} 应该以 'universe_' 开头`);
          }
        }
        
        return {
          count: universes.length,
          issues: issues
        };
      }
    },
    {
      name: 'Theme ID 格式一致性',
      check: async () => {
        const themes = await prisma.theme.findMany();
        const issues = [];
        
        for (const theme of themes) {
          if (!theme.id.startsWith('theme_')) {
            issues.push(`Theme ID 格式错误: ${theme.id} 应该以 'theme_' 开头`);
          }
        }
        
        return {
          count: themes.length,
          issues: issues
        };
      }
    },
    {
      name: 'Emotion ID 格式一致性',
      check: async () => {
        const emotions = await prisma.emotion.findMany();
        const issues = [];
        
        for (const emotion of emotions) {
          if (!emotion.id.startsWith('emotion_')) {
            issues.push(`Emotion ID 格式错误: ${emotion.id} 应该以 'emotion_' 开头`);
          }
          if (!['positive', 'negative', 'neutral', 'mixed'].includes(emotion.polarity)) {
            issues.push(`Emotion 极性值错误: ${emotion.polarity} 应该是 positive/negative/neutral/mixed 之一`);
          }
          if (emotion.intensity < 1 || emotion.intensity > 5) {
            issues.push(`Emotion 强度值错误: ${emotion.intensity} 应该在 1-5 范围内`);
          }
        }
        
        return {
          count: emotions.length,
          issues: issues
        };
      }
    }
  ];

  for (const check of dataTypeChecks) {
    try {
      const result = await check.check();
      results.dataTypeChecks[check.name] = result;
      results.summary.totalChecks++;
      
      if (result.issues.length > 0) {
        console.log(`  ❌ ${check.name}: ${result.count} 条记录，${result.issues.length} 个问题`);
        result.issues.forEach(issue => {
          results.issues.push({
            type: 'DATA_TYPE',
            category: check.name,
            issue: issue
          });
        });
        results.summary.failedChecks++;
      } else {
        console.log(`  ✅ ${check.name}: ${result.count} 条记录，正常`);
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

async function checkFormatConsistency(results) {
  const formatChecks = [
    {
      name: '诗歌标题格式一致性',
      check: async () => {
        const zhouPoems = await prisma.zhouPoem.findMany();
        const maoxiaodouPoems = await prisma.maoxiaodouPoem.findMany();
        const issues = [];
        
        // 检查周春秋诗歌标题
        for (const poem of zhouPoems) {
          if (!poem.title || poem.title.trim() === '') {
            issues.push(`周春秋诗歌标题为空: ${poem.id}`);
          }
          if (poem.title && poem.title.length > 100) {
            issues.push(`周春秋诗歌标题过长: ${poem.id} (${poem.title.length} 字符)`);
          }
        }
        
        // 检查毛小豆诗歌标题
        for (const poem of maoxiaodouPoems) {
          if (!poem.title || poem.title.trim() === '') {
            issues.push(`毛小豆诗歌标题为空: ${poem.id}`);
          }
          if (poem.title && poem.title.length > 100) {
            issues.push(`毛小豆诗歌标题过长: ${poem.id} (${poem.title.length} 字符)`);
          }
        }
        
        return {
          count: zhouPoems.length + maoxiaodouPoems.length,
          issues: issues
        };
      }
    },
    {
      name: 'JSON 字段格式一致性',
      check: async () => {
        const issues = [];
        
        // 检查毛小豆角色的 aliases 字段
        const characters = await prisma.maoxiaodouCharacter.findMany();
        for (const char of characters) {
          if (char.aliases) {
            try {
              JSON.parse(char.aliases);
            } catch (error) {
              issues.push(`毛小豆角色 aliases JSON 格式错误: ${char.id}`);
            }
          }
        }
        
        // 检查毛小豆角色的 developmentArc 字段
        for (const char of characters) {
          if (char.developmentArc) {
            try {
              JSON.parse(char.developmentArc);
            } catch (error) {
              issues.push(`毛小豆角色 developmentArc JSON 格式错误: ${char.id}`);
            }
          }
        }
        
        return {
          count: characters.length,
          issues: issues
        };
      }
    }
  ];

  for (const check of formatChecks) {
    try {
      const result = await check.check();
      results.formatChecks[check.name] = result;
      results.summary.totalChecks++;
      
      if (result.issues.length > 0) {
        console.log(`  ❌ ${check.name}: ${result.count} 条记录，${result.issues.length} 个问题`);
        result.issues.forEach(issue => {
          results.issues.push({
            type: 'FORMAT',
            category: check.name,
            issue: issue
          });
        });
        results.summary.failedChecks++;
      } else {
        console.log(`  ✅ ${check.name}: ${result.count} 条记录，正常`);
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

async function checkCrossUniverseConsistency(results) {
  const crossUniverseChecks = [
    {
      name: '主题名称跨宇宙一致性',
      check: async () => {
        const themes = await prisma.theme.findMany();
        const issues = [];
        
        // 检查主题名称是否有重复
        const themeNames = themes.map(t => t.name);
        const duplicateNames = themeNames.filter((name, index) => themeNames.indexOf(name) !== index);
        
        if (duplicateNames.length > 0) {
          issues.push(`发现重复的主题名称: ${duplicateNames.join(', ')}`);
        }
        
        // 检查主题名称长度一致性
        for (const theme of themes) {
          if (theme.name.length > 50) {
            issues.push(`主题名称过长: ${theme.name} (${theme.name.length} 字符)`);
          }
        }
        
        return {
          count: themes.length,
          issues: issues
        };
      }
    },
    {
      name: '桥表数据一致性',
      check: async () => {
        const universeThemes = await prisma.universeTheme.findMany();
        const universeEmotions = await prisma.universeEmotion.findMany();
        const issues = [];
        
        // 检查 UniverseTheme 置信度范围
        for (const ut of universeThemes) {
          if (ut.confidence !== null && (ut.confidence < 0 || ut.confidence > 1)) {
            issues.push(`UniverseTheme 置信度超出范围: ${ut.id} (${ut.confidence})`);
          }
        }
        
        // 检查 UniverseEmotion 权重范围
        for (const ue of universeEmotions) {
          if (ue.weight !== null && (ue.weight < 0 || ue.weight > 1)) {
            issues.push(`UniverseEmotion 权重超出范围: ${ue.id} (${ue.weight})`);
          }
        }
        
        return {
          count: universeThemes.length + universeEmotions.length,
          issues: issues
        };
      }
    },
    {
      name: '跨宇宙关联一致性',
      check: async () => {
        const crossLinks = await prisma.crossUniverseContentLink.findMany();
        const issues = [];
        
        // 检查跨宇宙关联的评分范围
        for (const link of crossLinks) {
          if (link.score !== null && (link.score < 0 || link.score > 1)) {
            issues.push(`跨宇宙关联评分超出范围: ${link.id} (${link.score})`);
          }
        }
        
        // 检查实体类型一致性
        const validEntityTypes = ['poem', 'character', 'theme', 'scene'];
        for (const link of crossLinks) {
          if (!validEntityTypes.includes(link.sourceEntityType)) {
            issues.push(`无效的源实体类型: ${link.id} (${link.sourceEntityType})`);
          }
          if (!validEntityTypes.includes(link.targetEntityType)) {
            issues.push(`无效的目标实体类型: ${link.id} (${link.targetEntityType})`);
          }
        }
        
        return {
          count: crossLinks.length,
          issues: issues
        };
      }
    }
  ];

  for (const check of crossUniverseChecks) {
    try {
      const result = await check.check();
      results.crossUniverseConsistency[check.name] = result;
      results.summary.totalChecks++;
      
      if (result.issues.length > 0) {
        console.log(`  ❌ ${check.name}: ${result.count} 条记录，${result.issues.length} 个问题`);
        result.issues.forEach(issue => {
          results.issues.push({
            type: 'CROSS_UNIVERSE_CONSISTENCY',
            category: check.name,
            issue: issue
          });
        });
        results.summary.failedChecks++;
      } else {
        console.log(`  ✅ ${check.name}: ${result.count} 条记录，正常`);
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

function generateConsistencyReport(results) {
  console.log('\n=== 数据一致性检查报告 ===');
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
    console.log('\n✅ 所有一致性检查通过！');
  }
  
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  checkConsistency()
    .then(results => {
      console.log('\n=== 检查完成 ===');
      process.exit(results.summary.failedChecks > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('检查失败:', error);
      process.exit(1);
    });
}

module.exports = { checkConsistency };
