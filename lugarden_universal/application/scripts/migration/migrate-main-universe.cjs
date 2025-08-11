/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// Prisma Client generated output path is configured in prisma/schema.prisma
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function upsertUniverse(universe) {
  const { id, code, name, type, description } = universe;
  return prisma.universe.upsert({
    where: { id },
    update: { code, name, type, description },
    create: { id, code, name, type, description },
  });
}

async function migrateMainUniverse() {
  console.log('[migrate-main-universe] Seeding Universe entries...');
  try {
    // 注意：此脚本应该在子宇宙数据迁移完成后执行，以确保权重和置信度计算正确
    const universes = [
      {
        id: 'universe_maoxiaodou',
        code: 'universe_maoxiaodou',
        name: '毛小豆宇宙',
        type: 'maoxiaodou',
        description: '毛小豆宇宙数据域',
      },
      {
        id: 'universe_zhou_spring_autumn',
        code: 'universe_zhou_spring_autumn',
        name: '周与春秋',
        type: 'zhou_spring_autumn',
        description: '周与春秋练习项目数据域',
      },
    ];

    for (const u of universes) {
      const saved = await upsertUniverse(u);
      console.log('  upserted:', saved.id, saved.code);
    }

    // Seed Themes from maoxiaodou themes.json
    const { resolveFromProjectRoot, readJsonFile } = require('./data-loader.cjs');
    const themesJsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/themes.json');
    const themesJson = await readJsonFile(themesJsonPath);
    const themes = Array.isArray(themesJson?.themes) ? themesJson.themes : [];
    for (const theme of themes) {
      const id = `theme_${String(theme.id)}`;
      const name = String(theme.name);
      const description = theme.description ? String(theme.description) : null;
      await prisma.theme.upsert({
        where: { id },
        update: { name, description },
        create: { id, name, description },
      });
    }

    // Seed basic Emotions (minimal set)
    const baseEmotions = [
      { id: 'emotion_positive', name: '积极', polarity: 'positive', intensity: 3 },
      { id: 'emotion_neutral', name: '中性', polarity: 'neutral', intensity: 3 },
      { id: 'emotion_negative', name: '消极', polarity: 'negative', intensity: 3 },
    ];
    for (const e of baseEmotions) {
      await prisma.emotion.upsert({
        where: { id: e.id },
        update: { name: e.name, polarity: e.polarity, intensity: e.intensity },
        create: e,
      });
    }

    const count = await prisma.universe.count();
    console.log(`[migrate-main-universe] Universe total count: ${count}`);
    const themeCount = await prisma.theme.count();
    const emotionCount = await prisma.emotion.count();
    console.log(`[migrate-main-universe] Theme total count: ${themeCount}`);
    console.log(`[migrate-main-universe] Emotion total count: ${emotionCount}`);

    // Create bridge associations with proper calculations:
    // - UniverseTheme for maoxiaodou ↔ all themes (with confidence calculation)
    // - UniverseEmotion for both universes ↔ base emotions (with weight calculation)
    
    // 主题关键词映射
    const THEME_KEYWORDS = {
      'theme_male_community': ['男性', '共同体', '兄弟', '朋友', '伙伴', '群体', '团结'],
      'theme_identity_anxiety': ['身份', '焦虑', '自我', '认同', '困惑', '迷茫', '定位'],
      'theme_microphysics_of_power': ['权力', '微观', '运作', '控制', '支配', '影响', '机制'],
      'theme_ugly_feelings': ['丑陋', '情感', '负面', '情绪', '痛苦', '愤怒', '悲伤'],
      'theme_consumerism': ['消费', '主义', '物质', '购买', '商品', '市场', '经济'],
      'theme_time_and_stagnation': ['时间', '停滞', '静止', '流逝', '永恒', '变化', '发展']
    };
    
    // 关键词匹配函数
    function countMatches(text, keywords) {
      if (!text) return 0;
      const lowerText = text.toLowerCase();
      return keywords.filter(keyword => lowerText.includes(keyword.toLowerCase())).length;
    }
    
    // 计算主题置信度
    function calculateThemeConfidence(text) {
      if (!text) return 0;
      const allKeywords = Object.values(THEME_KEYWORDS).flat();
      const matches = countMatches(text, allKeywords);
      return Math.min(matches / 10, 1.0); // 归一化到0-1
    }
    
    // 计算情感权重（使用Laplace平滑）
    function calculateEmotionWeight(text, emotionType) {
      if (!text) return 0.33; // 默认中性
      
      const positiveWords = ['快乐', '开心', '喜悦', '兴奋', '满足', '幸福', '温暖', '希望', '美好', '成功'];
      const negativeWords = ['痛苦', '悲伤', '愤怒', '恐惧', '焦虑', '绝望', '孤独', '失落', '失败', '黑暗'];
      const neutralWords = ['平静', '淡然', '客观', '理性', '中性', '平衡', '稳定', '自然', '普通', '日常'];
      
      let positiveCount = countMatches(text, positiveWords);
      let negativeCount = countMatches(text, negativeWords);
      let neutralCount = countMatches(text, neutralWords);
      
      // Laplace平滑
      const alpha = 1;
      positiveCount += alpha;
      negativeCount += alpha;
      neutralCount += alpha;
      
      const total = positiveCount + negativeCount + neutralCount;
      
      switch (emotionType) {
        case 'positive': return positiveCount / total;
        case 'negative': return negativeCount / total;
        case 'neutral': return neutralCount / total;
        default: return 0.33;
      }
    }
    
    // 清理现有的桥表数据
    await prisma.universeTheme.deleteMany({});
    await prisma.universeEmotion.deleteMany({});
    console.log('[migrate-main-universe] 清理现有桥表数据完成');
    
    const themesAll = await prisma.theme.findMany({});
    let utCreates = 0;
    
    // 获取毛小豆诗歌内容用于主题置信度计算
    const maoxiaodouPoems = await prisma.maoxiaodouPoem.findMany({
      where: { universeId: 'universe_maoxiaodou' }
    });
    const allPoemText = maoxiaodouPoems.map(p => p.body).filter(Boolean).join('\n');
    
    for (const th of themesAll) {
      const utId = `ut_universe_maoxiaodou__${th.id}`;
      const confidence = calculateThemeConfidence(allPoemText);
      
      await prisma.universeTheme.create({
        data: { id: utId, universeId: 'universe_maoxiaodou', themeId: th.id, confidence, note: '基于诗歌内容关键词匹配计算' },
      });
      utCreates += 1;
    }

    const emotionsAll = await prisma.emotion.findMany({});
    let ueCreates = 0;
    
    for (const em of emotionsAll) {
      for (const universeId of ['universe_maoxiaodou', 'universe_zhou_spring_autumn']) {
        const ueId = `ue_${universeId}__${em.id}`;
        
        // 获取对应宇宙的诗歌内容
        const poems = await prisma.maoxiaodouPoem.findMany({
          where: { universeId }
        });
        const zhouPoems = await prisma.zhouPoem.findMany({
          where: { universeId }
        });
        
        const allText = [...poems, ...zhouPoems].map(p => p.body).filter(Boolean).join('\n');
        const weight = calculateEmotionWeight(allText, em.polarity);
        
        await prisma.universeEmotion.upsert({
          where: { id: ueId },
          update: { universeId, emotionId: em.id, weight },
          create: { id: ueId, universeId, emotionId: em.id, weight },
        });
        ueCreates += 1;
      }
    }
    const utTotal = await prisma.universeTheme.count();
    const ueTotal = await prisma.universeEmotion.count();
    console.log(`[migrate-main-universe] UniverseTheme upserted: ${utCreates}, total: ${utTotal}`);
    console.log(`[migrate-main-universe] UniverseEmotion upserted: ${ueCreates}, total: ${ueTotal}`);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { migrateMainUniverse };


