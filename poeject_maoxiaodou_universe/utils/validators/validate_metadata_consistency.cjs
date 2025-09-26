/**
 * 毛小豆宇宙数据统计验证脚本 (重构版)
 * 使用公共组件模块，消除重复代码
 * 新增：理论框架验证功能
 */
const { dataLoader } = require('../components/data_loader.cjs');
const { ReportGenerator } = require('../components/report_generator.cjs');
const { DataDisplay } = require('../components/data_display.cjs');
const { PoemStatistics } = require('../components/poem_statistics.cjs');
const { CharacterStatistics } = require('../components/character_statistics.cjs');
const { TerminologyStatistics } = require('../components/terminology_statistics.cjs');
const { ThemeStatistics } = require('../components/theme_statistics.cjs');
const { SceneStatistics } = require('../components/scene_statistics.cjs');
const { TheoryStatistics } = require('../components/theory_statistics.cjs');
const { versionChecker, frameworkFileChecker } = require('../components/common_tools.cjs');

function countTimelinePeriods(obj) {
  return obj.timeline && Array.isArray(obj.timeline.periods) ? obj.timeline.periods.length : 0;
}

async function validateMetadataConsistency() {
  try {
    console.log('🔍 开始数据统计验证...\n');
    
    // 使用公共工具加载数据文件
    console.log('📋 读取数据文件...');
    const dataObjects = await dataLoader.loadCoreDataFiles();
    
    // 还需要加载timeline、metadata、理论框架和阅读体验文件
    const timelineData = await dataLoader.loadFile('timeline.json');
    const metadataData = await dataLoader.loadFile('metadata.json');
    const theoreticalFrameworkData = await dataLoader.loadFile('theoretical_framework.json');
    const readingExperienceData = await dataLoader.loadFile('reading_experience.json');
    
    // 使用公共组件进行统计
    const poemStatistics = new PoemStatistics(dataLoader);
    const characterStatistics = new CharacterStatistics(dataLoader);
    const terminologyStatistics = new TerminologyStatistics(dataLoader);
    const themeStatistics = new ThemeStatistics(dataLoader);
    const sceneStatistics = new SceneStatistics(dataLoader);
    const theoryStatistics = new TheoryStatistics(dataLoader);
    const reportGenerator = new ReportGenerator();
    const dataDisplay = new DataDisplay();
    
    // 生成各类型统计数据
    const poemStats = await poemStatistics.generateStatistics(dataObjects['poems.json']);
    const characterStats = await characterStatistics.generateStatistics(dataObjects['characters.json']);
    const terminologyStats = await terminologyStatistics.generateStatistics(dataObjects['terminology.json']);
    const themeStats = await themeStatistics.generateStatistics(dataObjects['themes.json']);
    const sceneStats = await sceneStatistics.generateStatistics(dataObjects['scenes.json']);
    const theoryStats = await theoryStatistics.generateStatistics(theoreticalFrameworkData);
    
    // 时间线统计
    const timelinePeriods = countTimelinePeriods(timelineData);
    
    // 理论框架统计（作为普通数据类型）
    const expectedTheories = ['obscene_supplement', 'ugly_emotions', 'microphysics_of_power', 'gated_community_poetics'];
    const actualTheories = Object.keys(theoreticalFrameworkData.theoretical_framework.theories);
    const theoryCount = actualTheories.length;
    
    // 阅读体验统计
    const expectedLayers = ['open_narrative', 'cognitive_labor', 'theoretical_depth'];
    const actualLayers = Object.keys(readingExperienceData.reading_experience.reading_layers);
    const readingLayersCount = actualLayers.length;
    const readingPathsCount = Object.keys(readingExperienceData.reading_experience.reading_paths).length;
    
    // 合并统计结果（所有数据类型统一处理）
    const actualStats = {
      poems: poemStats.totalCount || 0,
      characters: characterStats.totalCount || 0,
      terminology: terminologyStats.totalCount || 0,
      themes: themeStats.totalCount || 0,
      scenes: sceneStats.totalCount || 0,
      theories: theoryCount,
      timeline_periods: timelinePeriods,
      reading_layers: readingLayersCount,
      reading_paths: readingPathsCount
    };
    
    // 读取metadata中的统计
    const metaStats = metadataData.statistics || {};
    const metaTheoryStats = metadataData.metadata?.theoretical_framework || {};
    
    // 输出统计
    console.log('=== 实际数据统计 ===');
    console.log(`诗歌条目数:         ${actualStats.poems}`);
    console.log(`术语条目数:         ${actualStats.terminology}`);
    console.log(`角色条目数:         ${actualStats.characters}`);
    console.log(`主题条目数:         ${actualStats.themes}`);
    console.log(`场景条目数:         ${actualStats.scenes}`);
    console.log(`理论条目数:         ${actualStats.theories}`);
    console.log(`时间线periods数:    ${actualStats.timeline_periods}`);
    console.log(`阅读层次数量:       ${actualStats.reading_layers}`);
    console.log(`阅读路径数量:       ${actualStats.reading_paths}`);
    
    console.log('\n=== metadata.json 统计 ===');
    if (metaStats.total_poems !== undefined) console.log(`total_poems:        ${metaStats.total_poems}`);
    if (metaStats.total_terminology !== undefined) console.log(`total_terminology:  ${metaStats.total_terminology}`);
    if (metaStats.total_characters !== undefined) console.log(`total_characters:   ${metaStats.total_characters}`);
    if (metaStats.total_themes !== undefined) console.log(`total_themes:       ${metaStats.total_themes}`);
    if (metaStats.total_scenes !== undefined) console.log(`total_scenes:       ${metaStats.total_scenes}`);
    if (metaTheoryStats.theories !== undefined) console.log(`theories:           ${metaTheoryStats.theories.length}`);

    // 校验
    console.log('\n=== 数据类型一致性校验 ===');
    let isValid = true;
    const validationIssues = [];
    
    // 统一的数据类型验证（所有数据类型一视同仁）
    if (metaStats.total_poems !== undefined && metaStats.total_poems !== actualStats.poems) {
      console.log(`❌ 诗歌条目数不一致: metadata=${metaStats.total_poems}, 实际=${actualStats.poems}`);
      validationIssues.push(`诗歌条目数不一致: metadata=${metaStats.total_poems}, 实际=${actualStats.poems}`);
      isValid = false;
    } else {
      console.log(`✅ 诗歌条目数一致: ${actualStats.poems}`);
    }
    
    if (metaStats.total_terminology !== undefined && metaStats.total_terminology !== actualStats.terminology) {
      console.log(`❌ 术语条目数不一致: metadata=${metaStats.total_terminology}, 实际=${actualStats.terminology}`);
      validationIssues.push(`术语条目数不一致: metadata=${metaStats.total_terminology}, 实际=${actualStats.terminology}`);
      isValid = false;
    } else {
      console.log(`✅ 术语条目数一致: ${actualStats.terminology}`);
    }
    
    if (metaStats.total_characters !== undefined && metaStats.total_characters !== actualStats.characters) {
      console.log(`❌ 角色条目数不一致: metadata=${metaStats.total_characters}, 实际=${actualStats.characters}`);
      validationIssues.push(`角色条目数不一致: metadata=${metaStats.total_characters}, 实际=${actualStats.characters}`);
      isValid = false;
    } else {
      console.log(`✅ 角色条目数一致: ${actualStats.characters}`);
    }
    
    if (metaStats.total_themes !== undefined && metaStats.total_themes !== actualStats.themes) {
      console.log(`❌ 主题条目数不一致: metadata=${metaStats.total_themes}, 实际=${actualStats.themes}`);
      validationIssues.push(`主题条目数不一致: metadata=${metaStats.total_themes}, 实际=${actualStats.themes}`);
      isValid = false;
    } else {
      console.log(`✅ 主题条目数一致: ${actualStats.themes}`);
    }
    
    if (metaStats.total_scenes !== undefined && metaStats.total_scenes !== actualStats.scenes) {
      console.log(`❌ 场景条目数不一致: metadata=${metaStats.total_scenes}, 实际=${actualStats.scenes}`);
      validationIssues.push(`场景条目数不一致: metadata=${metaStats.total_scenes}, 实际=${actualStats.scenes}`);
      isValid = false;
    } else {
      console.log(`✅ 场景条目数一致: ${actualStats.scenes}`);
    }
    
    // 理论框架验证（与其他数据类型统一处理）
    if (metaTheoryStats.theories !== undefined && metaTheoryStats.theories.length !== actualStats.theories) {
      console.log(`❌ 理论条目数不一致: metadata=${metaTheoryStats.theories.length}, 实际=${actualStats.theories}`);
      validationIssues.push(`理论条目数不一致: metadata=${metaTheoryStats.theories.length}, 实际=${actualStats.theories}`);
      isValid = false;
    } else {
      console.log(`✅ 理论条目数一致: ${actualStats.theories}`);
    }
    
    // 检查理论框架的完整性（与其他数据类型保持一致）
    let theoryIntegrityValid = true;
    for (const theoryId of expectedTheories) {
      if (!theoreticalFrameworkData.theoretical_framework.theories[theoryId]) {
        console.log(`❌ 缺少理论: ${theoryId}`);
        validationIssues.push(`缺少理论: ${theoryId}`);
        theoryIntegrityValid = false;
        isValid = false;
      }
    }
    if (theoryIntegrityValid) {
      console.log(`✅ 理论框架完整性验证通过`);
    }
    
    // 阅读体验验证（与其他数据类型统一处理）
    const expectedReadingLayers = ['open_narrative', 'cognitive_labor', 'theoretical_depth'];
    if (actualStats.reading_layers !== expectedReadingLayers.length) {
      console.log(`❌ 阅读层次数量不一致: 期望=${expectedReadingLayers.length}, 实际=${actualStats.reading_layers}`);
      validationIssues.push(`阅读层次数量不一致: 期望=${expectedReadingLayers.length}, 实际=${actualStats.reading_layers}`);
      isValid = false;
    } else {
      console.log(`✅ 阅读层次数量一致: ${actualStats.reading_layers}`);
    }
    
    // 检查阅读体验的完整性（与其他数据类型保持一致）
    let readingIntegrityValid = true;
    for (const layerId of expectedReadingLayers) {
      if (!readingExperienceData.reading_experience.reading_layers[layerId]) {
        console.log(`❌ 缺少阅读层次: ${layerId}`);
        validationIssues.push(`缺少阅读层次: ${layerId}`);
        readingIntegrityValid = false;
        isValid = false;
      }
    }
    if (readingIntegrityValid) {
      console.log(`✅ 阅读体验完整性验证通过`);
    }
    
    // 使用公共工具验证文件引用的一致性
    console.log('\n=== 文件引用验证 ===');
    const frameworkFileResult = frameworkFileChecker.checkFrameworkFileReferences(metadataData.metadata.theoretical_framework);
    if (!frameworkFileResult.isValid) {
      frameworkFileResult.issues.forEach(issue => {
        console.log(`❌ ${issue}`);
        validationIssues.push(issue);
      });
      isValid = false;
    } else {
      console.log('✅ 文件引用验证通过');
    }
    
    // 使用公共工具验证版本号一致性
    console.log('\n=== 版本号验证 ===');
    const allDataObjects = {
      ...dataObjects,
      'theoretical_framework.json': theoreticalFrameworkData,
      'reading_experience.json': readingExperienceData,
      'metadata.json': metadataData
    };
    const versionResult = versionChecker.checkTheoryFrameworkVersions(allDataObjects);
    if (!versionResult.isValid) {
      versionResult.issues.forEach(issue => {
        console.log(`❌ ${issue}`);
        validationIssues.push(issue);
      });
      isValid = false;
    } else {
      console.log('✅ 版本号验证通过');
    }
    
    if (isValid) {
      console.log('✅ 所有主要条目数一致');
    }
    
    // 使用公共组件生成详细报告
    const allStats = {
      actual: actualStats,
      metadata: metaStats,
      poemStats: poemStats,
      characterStats: characterStats,
      terminologyStats: terminologyStats,
      themeStats: themeStats,
      sceneStats: sceneStats,
      theoryStats: theoryStats,
      validationIssues: validationIssues,
      theoryValidation: {
        expectedTheories,
        actualTheories,
        expectedLayers,
        actualLayers
      }
    };
    
    const report = reportGenerator.generateReport(allStats, 'data_stats_template', {
      title: '毛小豆宇宙元数据统计一致性验证报告',
      includeValidation: true,
      includeDetails: true
    });
    
    console.log(`\n${isValid ? '✅' : '❌'} 元数据统计一致性验证${isValid ? '通过' : '失败'}`);
    
    return {
      isValid: isValid,
      actualStats: actualStats,
      metadataStats: metaStats,
      validationIssues: validationIssues,
      detailedStats: {
        poems: poemStats,
        characters: characterStats,
        terminology: terminologyStats,
        themes: themeStats,
        scenes: sceneStats,
        theories: theoryStats
      },
      theoryValidation: {
        expectedTheories,
        actualTheories,
        expectedLayers,
        actualLayers
      }
    };
    
  } catch (error) {
    console.error('❌ 数据统计验证失败:', error.message);
    return {
      isValid: false,
      error: error.message
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  validateMetadataConsistency();
}

module.exports = { validateMetadataConsistency };