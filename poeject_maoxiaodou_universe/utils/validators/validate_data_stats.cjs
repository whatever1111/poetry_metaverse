/**
 * 毛小豆宇宙数据统计验证脚本 (优化版)
 * 使用公共工具模块，消除重复代码
 */
const { dataLoader } = require('../components/data_loader.cjs');

function countPoems(obj) {
  return Array.isArray(obj.poems) ? obj.poems.length : 0;
}

function countTerminology(obj) {
  return Array.isArray(obj.terminology) ? obj.terminology.length : 0;
}

function countCharacters(obj) {
  // 角色分core/secondary/tertiary
  if (obj.characters && typeof obj.characters === 'object') {
    return Object.values(obj.characters).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  }
  return 0;
}

function countThemes(obj) {
  return Array.isArray(obj.themes) ? obj.themes.length : 0;
}

function countTimelinePeriods(obj) {
  return obj.timeline && Array.isArray(obj.timeline.periods) ? obj.timeline.periods.length : 0;
}

async function main() {
  try {
    console.log('🔍 开始数据统计验证...\n');
    
    // 使用公共工具加载数据文件
    console.log('📋 读取数据文件...');
    const dataObjects = await dataLoader.loadCoreDataFiles();
    
    // 还需要加载timeline和metadata文件
    const timelineData = await dataLoader.loadFile('timeline.json');
    const metadataData = await dataLoader.loadFile('metadata.json');
    
    const stats = {};
    
    // 1. 读取并统计
    const poems = dataObjects['poems.json'];
    stats.poems = countPoems(poems);
    
    const terminology = dataObjects['terminology.json'];
    stats.terminology = countTerminology(terminology);
    
    const characters = dataObjects['characters.json'];
    stats.characters = countCharacters(characters);
    
    const themes = dataObjects['themes.json'];
    stats.themes = countThemes(themes);
    
    stats.timeline_periods = countTimelinePeriods(timelineData);

    // 2. 读取metadata
    const metaStats = metadataData.statistics || {};

    // 3. 输出统计
    console.log('=== 实际数据统计 ===');
    console.log(`诗歌条目数:         ${stats.poems}`);
    console.log(`术语条目数:         ${stats.terminology}`);
    console.log(`角色条目数:         ${stats.characters}`);
    console.log(`主题条目数:         ${stats.themes}`);
    console.log(`时间线periods数:    ${stats.timeline_periods}`);
    
    console.log('\n=== metadata.json 统计 ===');
    if (metaStats.total_poems !== undefined) console.log(`total_poems:        ${metaStats.total_poems}`);
    if (metaStats.total_terminology !== undefined) console.log(`total_terminology:  ${metaStats.total_terminology}`);
    if (metaStats.total_characters !== undefined) console.log(`total_characters:   ${metaStats.total_characters}`);
    if (metaStats.total_themes !== undefined) console.log(`total_themes:       ${metaStats.total_themes}`);

    // 4. 校验
    console.log('\n=== 校验结果 ===');
    let ok = true;
    if (metaStats.total_poems !== undefined && metaStats.total_poems !== stats.poems) {
      console.log(`❌ 诗歌条目数不一致: metadata=${metaStats.total_poems}, 实际=${stats.poems}`);
      ok = false;
    }
    if (metaStats.total_terminology !== undefined && metaStats.total_terminology !== stats.terminology) {
      console.log(`❌ 术语条目数不一致: metadata=${metaStats.total_terminology}, 实际=${stats.terminology}`);
      ok = false;
    }
    if (metaStats.total_characters !== undefined && metaStats.total_characters !== stats.characters) {
      console.log(`❌ 角色条目数不一致: metadata=${metaStats.total_characters}, 实际=${stats.characters}`);
      ok = false;
    }
    if (metaStats.total_themes !== undefined && metaStats.total_themes !== stats.themes) {
      console.log(`❌ 主题条目数不一致: metadata=${metaStats.total_themes}, 实际=${stats.themes}`);
      ok = false;
    }
    
    if (ok) {
      console.log('✅ 所有主要条目数一致');
    }
    
    console.log(`\n${ok ? '✅' : '❌'} 数据统计验证${ok ? '通过' : '失败'}`);
    
    return ok;
    
  } catch (error) {
    console.error('❌ 数据统计验证失败:', error.message);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { validateDataStats: main };