/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const { PrismaClient } = require('../../generated/prisma');
const {
  resolveFromProjectRoot,
  readJsonFile,
  listFilesByExtensions,
  readTextFile,
} = require('./data-loader.cjs');

const prisma = new PrismaClient();

function indexTxtFilesByBasename(filePaths) {
  const index = new Map();
  for (const fullPath of filePaths) {
    const base = path.basename(fullPath, path.extname(fullPath));
    index.set(base, fullPath);
  }
  return index;
}

async function migratePoems() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/poems.json');
  const poemsJson = await readJsonFile(jsonPath);
  const poems = Array.isArray(poemsJson?.poems) ? poemsJson.poems : [];

  const poemsDir = resolveFromProjectRoot('poeject_maoxiaodou_universe/poems');
  const txtFiles = await listFilesByExtensions(poemsDir, ['.txt']);
  const basenameToPath = indexTxtFilesByBasename(txtFiles);

  let inserted = 0;
  for (const poem of poems) {
    const id = String(poem.id);
    const title = String(poem.title);
    const section = String(poem.section || '');
    const summary = poem.summary ? String(poem.summary) : null;
    const emotionalTone = poem.emotional_tone ? String(poem.emotional_tone) : null;
    const conflictExplicit = poem.conflict?.explicit ? String(poem.conflict.explicit) : null;
    const conflictImplicit = poem.conflict?.implicit ? String(poem.conflict.implicit) : null;

    // 改进：更精确的文件匹配逻辑
    let matchedTxtPath = null;
    let body = null;
    
    // 尝试多种匹配方式
    const possibleMatches = [
      title, // 直接匹配
      title.replace(/\s*\|\s*/, ' | '), // 处理 "|" 符号
      title.replace(/\s+/g, ''), // 移除所有空格
      title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ''), // 只保留中文、英文、数字
      // 特殊处理：毛小豆故事演绎 | REMAKE -> 毛小豆故事演绎 Ⅰ REMAKE
      title === '毛小豆故事演绎 | REMAKE' ? '毛小豆故事演绎 Ⅰ REMAKE' : null,
      // 特殊处理：注意看 -> 注 意 看
      title === '注意看' ? '注 意 看' : null,
    ].filter(Boolean); // 过滤掉null值
    
    for (const match of possibleMatches) {
      if (basenameToPath.has(match)) {
        matchedTxtPath = basenameToPath.get(match);
        break;
      }
    }
    
    // 如果还是找不到，尝试模糊匹配
    if (!matchedTxtPath) {
      for (const [basename, filePath] of basenameToPath.entries()) {
        if (basename.includes(title) || title.includes(basename)) {
          matchedTxtPath = filePath;
          break;
        }
      }
    }
    
    if (matchedTxtPath) {
      try {
        body = await readTextFile(matchedTxtPath);
        console.log(`[migrate-maoxiaodou] 成功读取诗歌内容: ${title} -> ${matchedTxtPath}`);
      } catch (error) {
        console.error(`[migrate-maoxiaodou] 读取诗歌文件失败: ${matchedTxtPath}`, error.message);
        body = null;
      }
    } else {
      console.warn(`[migrate-maoxiaodou] 未找到诗歌文件: ${title}`);
    }

    // Preserve extra fields as metadata JSON (excluding ones we mapped)
    const {
      id: _omitId,
      title: _omitTitle,
      section: _omitSection,
      summary: _omitSummary,
      emotional_tone: _omitEmotionalTone,
      conflict: _omitConflict,
      ...rest
    } = poem;
    const metadata = Object.keys(rest).length > 0 ? JSON.stringify(rest) : null;

    await prisma.maoxiaodouPoem.upsert({
      where: { id },
      update: {
        title,
        section,
        summary,
        body,
        emotionalTone,
        conflictExplicit,
        conflictImplicit,
        metadata,
        universeId,
      },
      create: {
        id,
        title,
        section,
        summary,
        body,
        emotionalTone,
        conflictExplicit,
        conflictImplicit,
        metadata,
        universeId,
      },
    });
    inserted += 1;
  }

  const total = await prisma.maoxiaodouPoem.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Poems upserted: ${inserted}, total now: ${total}`);
}

function makeRelationId(sourceId, targetId, relationType, index) {
  const safe = (s) => String(s).replace(/[^a-zA-Z0-9_\-]+/g, '_');
  return `rel_${safe(sourceId)}__${safe(targetId)}__${safe(relationType)}__${index}`;
}

async function migrateCharactersAndRelations() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/characters.json');
  const charactersJson = await readJsonFile(jsonPath);
  const buckets = charactersJson?.characters || {};

  const categories = [
    ['core', Array.isArray(buckets.core) ? buckets.core : []],
    ['secondary', Array.isArray(buckets.secondary) ? buckets.secondary : []],
    ['tertiary', Array.isArray(buckets.tertiary) ? buckets.tertiary : []],
  ];

  // Upsert characters by category
  let characterUpserts = 0;
  for (const [category, items] of categories) {
    for (const ch of items) {
      const id = String(ch.id);
      const name = String(ch.name);
      const aliases = Array.isArray(ch.aliases) ? JSON.stringify(ch.aliases) : null;
      const role = ch.role ? String(ch.role) : null;
      const description = ch.description ? String(ch.description) : null;
      const coreMotivation = ch.core_motivation ? String(ch.core_motivation) : null;
      const developmentArc = ch.development_arc ? JSON.stringify(ch.development_arc) : null;
      const notes = ch.notes ? String(ch.notes) : null;

      await prisma.maoxiaodouCharacter.upsert({
        where: { id },
        update: {
          name,
          aliases,
          role,
          description,
          coreMotivation,
          developmentArc,
          notes,
          category,
          universeId,
        },
        create: {
          id,
          name,
          aliases,
          role,
          description,
          coreMotivation,
          developmentArc,
          notes,
          category,
          universeId,
        },
      });
      characterUpserts += 1;
    }
  }

  // Create relations after all characters exist
  let relationCreates = 0;
  for (const [, items] of categories) {
    for (const ch of items) {
      const sourceId = String(ch.id);
      const rels = Array.isArray(ch.relationships) ? ch.relationships : [];
      let idx = 0;
      for (const rel of rels) {
        const targetId = String(rel.target_id);
        const relationType = String(rel.type || 'related');
        const description = rel.description ? String(rel.description) : null;
        const strength = typeof rel.strength === 'number' ? rel.strength : null;
        const id = makeRelationId(sourceId, targetId, relationType, idx++);

        // Ensure both sides exist; if not, skip but continue gracefully
        const [sourceExists, targetExists] = await Promise.all([
          prisma.maoxiaodouCharacter.findUnique({ where: { id: sourceId } }),
          prisma.maoxiaodouCharacter.findUnique({ where: { id: targetId } }),
        ]);
        if (!sourceExists || !targetExists) {
          continue;
        }

        await prisma.maoxiaodouCharacterRelation.upsert({
          where: { id },
          update: { sourceCharacterId: sourceId, targetCharacterId: targetId, relationType, description, strength, universeId },
          create: { id, sourceCharacterId: sourceId, targetCharacterId: targetId, relationType, description, strength, universeId },
        });
        relationCreates += 1;
      }
    }
  }

  const characterTotal = await prisma.maoxiaodouCharacter.count({ where: { universeId } });
  const relationTotal = await prisma.maoxiaodouCharacterRelation.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Characters upserted: ${characterUpserts}, total: ${characterTotal}`);
  console.log(`[migrate-maoxiaodou] CharacterRelations upserted: ${relationCreates}, total: ${relationTotal}`);
}

async function migrateTerminology() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/terminology.json');
  const data = await readJsonFile(jsonPath);
  const terms = Array.isArray(data?.terminology) ? data.terminology : [];
  let upserts = 0;
  for (const t of terms) {
    const id = String(t.id);
    const term = String(t.term);
    const category = t.category ? String(t.category) : null;
    const definition = t.definition ? String(t.definition) : null;
    const context = t.context ? String(t.context) : null;
    const usage = t.usage ? String(t.usage) : null;
    await prisma.maoxiaodouTerminology.upsert({
      where: { id },
      update: { term, category, definition, context, usage, universeId },
      create: { id, term, category, definition, context, usage, universeId },
    });
    upserts += 1;
  }
  const total = await prisma.maoxiaodouTerminology.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Terminology upserted: ${upserts}, total: ${total}`);
}

async function migrateThemes() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/themes.json');
  const data = await readJsonFile(jsonPath);
  const themes = Array.isArray(data?.themes) ? data.themes : [];
  let upserts = 0;
  for (const th of themes) {
    const id = String(th.id);
    const name = String(th.name);
    const description = th.description ? String(th.description) : null;
    const manifestations = th.manifestations ? JSON.stringify(th.manifestations) : null;
    await prisma.maoxiaodouTheme.upsert({
      where: { id },
      update: { name, description, manifestations, universeId },
      create: { id, name, description, manifestations, universeId },
    });
    upserts += 1;
  }
  const total = await prisma.maoxiaodouTheme.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Themes upserted: ${upserts}, total: ${total}`);
}

async function migrateTimeline() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/timeline.json');
  const data = await readJsonFile(jsonPath);
  const periods = Array.isArray(data?.timeline?.periods) ? data.timeline.periods : [];
  let upserts = 0;
  for (const p of periods) {
    const id = String(p.id);
    const name = String(p.name);
    const timeRange = p.time_range ? String(p.time_range) : null;
    const description = p.description ? String(p.description) : null;
    const keyEvents = p.key_events ? JSON.stringify(p.key_events) : null;
    await prisma.maoxiaodouTimeline.upsert({
      where: { id },
      update: { name, timeRange, description, keyEvents, universeId },
      create: { id, name, timeRange, description, keyEvents, universeId },
    });
    upserts += 1;
  }
  const total = await prisma.maoxiaodouTimeline.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Timeline periods upserted: ${upserts}, total: ${total}`);
}

async function migrateTheory() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/theoretical_framework.json');
  const data = await readJsonFile(jsonPath);
  const theoriesObj = data?.theoretical_framework?.theories || {};
  let upserts = 0;
  for (const [theoryId, theory] of Object.entries(theoriesObj)) {
    const id = String(theoryId);
    const name = theory.name ? String(theory.name) : id;
    const concept = theory.concept ? String(theory.concept) : null;
    const description = theory.description ? String(theory.description) : null;
    const manifestations = theory.manifestations
      ? JSON.stringify(theory.manifestations)
      : theory.types
        ? JSON.stringify(theory.types)
        : null;
    await prisma.maoxiaodouTheory.upsert({
      where: { id },
      update: { name, concept, description, manifestations, universeId },
      create: { id, name, concept, description, manifestations, universeId },
    });
    upserts += 1;
  }
  const total = await prisma.maoxiaodouTheory.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Theories upserted: ${upserts}, total: ${total}`);
}

async function migrateReadingLayers() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/reading_experience.json');
  const data = await readJsonFile(jsonPath);
  const layersObj = data?.reading_experience?.reading_layers || {};
  let upserts = 0;
  for (const [layerId, layer] of Object.entries(layersObj)) {
    const id = String(layerId);
    const name = layer.name ? String(layer.name) : id;
    const description = layer.description ? String(layer.description) : null;
    const accessibility = layer.accessibility ? String(layer.accessibility) : null;
    const readingGoals = layer.reading_goals ? JSON.stringify(layer.reading_goals) : null;
    await prisma.maoxiaodouReadingLayer.upsert({
      where: { id },
      update: { name, description, accessibility, readingGoals, universeId },
      create: { id, name, description, accessibility, readingGoals, universeId },
    });
    upserts += 1;
  }
  const total = await prisma.maoxiaodouReadingLayer.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] ReadingLayers upserted: ${upserts}, total: ${total}`);
}

async function migrateScenes() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/scenes.json');
  const data = await readJsonFile(jsonPath);
  const scenes = Array.isArray(data?.scenes) ? data.scenes : [];
  let upserts = 0;
  for (const s of scenes) {
    const id = String(s.id);
    const scenario = String(s.scenario);
    const type = s.type ? String(s.type) : null;
    const description = s.description ? String(s.description) : null;
    const poemId = s.poem_id ? String(s.poem_id) : null;

    // ensure poem exists; if not, skip to keep FK valid
    if (poemId) {
      const poem = await prisma.maoxiaodouPoem.findUnique({ where: { id: poemId } });
      if (!poem) {
        continue;
      }
    }

    await prisma.maoxiaodouScene.upsert({
      where: { id },
      update: { scenario, type, description, poemId, universeId },
      create: { id, scenario, type, description, poemId, universeId },
    });
    upserts += 1;
  }
  const total = await prisma.maoxiaodouScene.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Scenes upserted: ${upserts}, total: ${total}`);
}

async function migrateMappings() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/mappings.json');
  const data = await readJsonFile(jsonPath);
  let creates = 0;

  // section -> poem mapping
  const sections = data?.sections || {};
  for (const [sectionName, poemsMap] of Object.entries(sections)) {
    for (const [poemId, _poemTitle] of Object.entries(poemsMap || {})) {
      const id = `map_section_poem__${sectionName}__${poemId}`;
      await prisma.maoxiaodouMapping.upsert({
        where: { id },
        update: { sourceType: 'section', sourceId: sectionName, targetType: 'poem', targetId: poemId, mappingType: 'section_poem', universeId },
        create: { id, sourceType: 'section', sourceId: sectionName, targetType: 'poem', targetId: poemId, mappingType: 'section_poem', universeId },
      });
      creates += 1;
    }
  }

  // theme label mapping
  const themeMappings = data?.theme_mappings || {};
  for (const [themeId, label] of Object.entries(themeMappings)) {
    const id = `map_theme_label__${themeId}`;
    await prisma.maoxiaodouMapping.upsert({
      where: { id },
      update: { sourceType: 'theme', sourceId: themeId, targetType: 'label', targetId: String(label), mappingType: 'theme_label', universeId },
      create: { id, sourceType: 'theme', sourceId: themeId, targetType: 'label', targetId: String(label), mappingType: 'theme_label', universeId },
    });
    creates += 1;
  }

  // character label mapping (flatten categories)
  const characterMappings = data?.character_mappings || {};
  for (const [category, cmap] of Object.entries(characterMappings)) {
    for (const [charId, label] of Object.entries(cmap || {})) {
      const id = `map_character_label__${category}__${charId}`;
      await prisma.maoxiaodouMapping.upsert({
        where: { id },
        update: { sourceType: 'character', sourceId: charId, targetType: 'label', targetId: String(label), mappingType: `character_label_${category.toLowerCase()}`, universeId },
        create: { id, sourceType: 'character', sourceId: charId, targetType: 'label', targetId: String(label), mappingType: `character_label_${category.toLowerCase()}`, universeId },
      });
      creates += 1;
    }
  }

  const total = await prisma.maoxiaodouMapping.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Mappings upserted: ${creates}, total: ${total}`);
}

// 新增：迁移跨宇宙关联到主宇宙层
async function migrateCrossUniverseLinks() {
  console.log('[migrate-maoxiaodou] 开始迁移跨宇宙关联...');
  
  // 清理现有的跨宇宙映射（从 MaoxiaodouMapping 中删除）
  const deletedCount = await prisma.maoxiaodouMapping.deleteMany({
    where: { mappingType: 'cross_universe_poem' }
  });
  console.log(`[migrate-maoxiaodou] 已从 MaoxiaodouMapping 删除 ${deletedCount.count} 条跨宇宙映射`);
  
  // 清理现有的 CrossUniverseContentLink 数据
  await prisma.crossUniverseContentLink.deleteMany({});
  console.log('[migrate-maoxiaodou] 已清理现有 CrossUniverseContentLink 数据');
  
  // 为周春秋诗歌生成稳定 ID
  const aPath = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft/poem_archetypes.json');
  const aData = await readJsonFile(aPath);
  const zPoems = Array.isArray(aData?.poems) ? aData.poems : [];
  
  // 创建标题到稳定 ID 的映射
  const titleToStableId = new Map();
  for (const p of zPoems) {
    const stableId = `zhou_poem__${p.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`;
    titleToStableId.set(p.title, stableId);
  }
  
  // 主题关键词映射
  const THEME_KEYWORDS = {
    'male_community': ['男性', '共同体', '兄弟', '朋友', '伙伴', '群体', '团结'],
    'identity_anxiety': ['身份', '焦虑', '自我', '认同', '困惑', '迷茫', '定位'],
    'microphysics_of_power': ['权力', '微观', '运作', '控制', '支配', '影响', '机制'],
    'ugly_feelings': ['丑陋', '情感', '负面', '情绪', '痛苦', '愤怒', '悲伤'],
    'consumerism': ['消费', '主义', '物质', '购买', '商品', '市场', '经济'],
    'time_and_stagnation': ['时间', '停滞', '静止', '流逝', '永恒', '变化', '发展']
  };
  
  // 关键词匹配函数
  function countMatches(text, keywords) {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => lowerText.includes(keyword.toLowerCase())).length;
  }
  
  // 建立跨宇宙内容关联
  const themes = await prisma.maoxiaodouTheme.findMany({});
  let creates = 0;
  
  for (const theme of themes) {
    const words = THEME_KEYWORDS[theme.id] || [];
    if (words.length === 0) continue;
    
    for (const p of zPoems) {
      const blob = [p.core_theme, p.problem_solved, p.spiritual_consolation, p.classical_echo, p.poet_explanation]
        .filter(Boolean)
        .join('\n');
      const score = countMatches(blob, words);
      
      if (score > 0) {
        const stableId = titleToStableId.get(p.title);
        const id = `cross_${theme.id}__${stableId}`;
        
        await prisma.crossUniverseContentLink.upsert({
          where: { id },
          update: {
            sourceUniverseId: 'universe_maoxiaodou',
            sourceEntityType: 'theme',
            sourceEntityId: theme.id,
            targetUniverseId: 'universe_zhou_spring_autumn',
            targetEntityType: 'poem',
            targetEntityId: stableId,
            mappingType: 'theme_to_poem',
            score: score / 10, // 归一化分数
            note: `基于关键词匹配: ${words.join(', ')}`
          },
          create: {
            id,
            sourceUniverseId: 'universe_maoxiaodou',
            sourceEntityType: 'theme',
            sourceEntityId: theme.id,
            targetUniverseId: 'universe_zhou_spring_autumn',
            targetEntityType: 'poem',
            targetEntityId: stableId,
            mappingType: 'theme_to_poem',
            score: score / 10,
            note: `基于关键词匹配: ${words.join(', ')}`
          },
        });
        creates += 1;
      }
    }
  }
  
  const total = await prisma.crossUniverseContentLink.count();
  console.log(`[migrate-maoxiaodou] 跨宇宙关联迁移完成: 创建 ${creates} 条, 总计 ${total} 条`);
}

async function migrateMetadata() {
  const universeId = 'universe_maoxiaodou';
  const jsonPath = resolveFromProjectRoot('poeject_maoxiaodou_universe/data/metadata.json');
  const data = await readJsonFile(jsonPath);
  const meta = data?.metadata || {};
  const statistics = data?.statistics ? JSON.stringify(data.statistics) : null;
  const relationships = data?.relationships ? JSON.stringify(data.relationships) : null;

  const id = 'maoxiaodou_metadata_v2';
  const universeName = meta.universe_name ? String(meta.universe_name) : '毛小豆宇宙';
  const version = meta.version ? String(meta.version) : 'unknown';
  const description = meta.description ? String(meta.description) : null;
  const dataSources = meta.data_sources ? JSON.stringify(meta.data_sources) : null;

  await prisma.maoxiaodouMetadata.upsert({
    where: { id },
    update: { universeName, version, description, dataSources, statistics, relationships, universeId },
    create: { id, universeName, version, description, dataSources, statistics, relationships, universeId },
  });

  const total = await prisma.maoxiaodouMetadata.count({ where: { universeId } });
  console.log(`[migrate-maoxiaodou] Metadata upserted: 1, total: ${total}`);
}

async function migrateMaoxiaodou() {
  try {
    await migratePoems();
    await migrateCharactersAndRelations();
    await migrateTerminology();
    await migrateThemes();
    await migrateTimeline();
    await migrateTheory();
    await migrateReadingLayers();
    await migrateScenes();
    await migrateMappings();
    await migrateCrossUniverseLinks(); // 新增：迁移跨宇宙关联
    await migrateMetadata();
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { migrateMaoxiaodou };



