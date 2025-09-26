/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { PrismaClient } = require('../../generated/prisma');
const { resolveFromProjectRoot, readJsonFile, listFilesByExtensions, readTextFile } = require('./data-loader.cjs');

const prisma = new PrismaClient();
const ZHOU_UNIVERSE_ID = 'universe_zhou_spring_autumn';

async function migrateProjects() {
  const jsonPath = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft/projects.json');
  const data = await readJsonFile(jsonPath);
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  let projectCount = 0;
  let subProjectCount = 0;
  for (const p of projects) {
    const projectId = String(p.id);
    await prisma.zhouProject.upsert({
      where: { id: projectId },
      update: { name: String(p.name), description: p.description ? String(p.description) : null, poet: p.poet ? String(p.poet) : null, status: p.status ? String(p.status) : null, universeId: ZHOU_UNIVERSE_ID },
      create: { id: projectId, name: String(p.name), description: p.description ? String(p.description) : null, poet: p.poet ? String(p.poet) : null, status: p.status ? String(p.status) : null, universeId: ZHOU_UNIVERSE_ID },
    });
    projectCount += 1;

    const subs = Array.isArray(p.subProjects) ? p.subProjects : [];
    for (const s of subs) {
      const subId = String(s.id);
      await prisma.zhouSubProject.upsert({
        where: { id: subId },
        update: { projectId: projectId, name: String(s.name), description: s.description ? String(s.description) : null, universeId: ZHOU_UNIVERSE_ID },
        create: { id: subId, projectId: projectId, name: String(s.name), description: s.description ? String(s.description) : null, universeId: ZHOU_UNIVERSE_ID },
      });
      subProjectCount += 1;
    }
  }
  console.log(`[migrate-zhou] Projects upserted: ${projectCount}, SubProjects upserted: ${subProjectCount}`);
}

async function migrateQAAndMappings() {
  const qPath = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft/questions.json');
  const mPath = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft/mappings.json');
  const qData = await readJsonFile(qPath);
  const mData = await readJsonFile(mPath);

  const chapters = Array.isArray(qData?.chapters) ? qData.chapters : [];
  let qaCount = 0;
  let mappingCount = 0;

  // Build subProject lookup by name from DB
  const subProjects = await prisma.zhouSubProject.findMany({ where: { universeId: ZHOU_UNIVERSE_ID } });
  const subByName = new Map(subProjects.map((s) => [s.name, s]));

  for (const ch of chapters) {
    const chapterName = String(ch.title || ch.id);
    const sub = subByName.get(chapterName) || null;
    for (let i = 0; i < (ch.questions || []).length; i += 1) {
      const q = ch.questions[i];
      const id = `${chapterName}_${q.id}`;
      await prisma.zhouQA.upsert({
        where: { id },
        update: {
          chapter: chapterName,
          index: i + 1,
          question: String(q.text),
          optionA: String(q.options?.[0]?.text || ''),
          optionB: String(q.options?.[1]?.text || ''),
          meaningA: '',
          meaningB: '',
          universeId: ZHOU_UNIVERSE_ID,
          subProjectId: sub ? sub.id : null,
        },
        create: {
          id,
          chapter: chapterName,
          index: i + 1,
          question: String(q.text),
          optionA: String(q.options?.[0]?.text || ''),
          optionB: String(q.options?.[1]?.text || ''),
          meaningA: '',
          meaningB: '',
          universeId: ZHOU_UNIVERSE_ID,
          subProjectId: sub ? sub.id : null,
        },
      });
      qaCount += 1;
    }

    // mappings for this chapter
    const unitMap = mData?.units?.[chapterName] || {};
    for (const [combination, title] of Object.entries(unitMap)) {
      const comb = String(combination);
      await prisma.zhouMapping.upsert({
        where: { id: `${chapterName}_${comb}` },
        update: { chapter: chapterName, combination: comb, poemTitle: String(title), universeId: ZHOU_UNIVERSE_ID, subProjectId: sub ? sub.id : null },
        create: { id: `${chapterName}_${comb}`, chapter: chapterName, combination: comb, poemTitle: String(title), universeId: ZHOU_UNIVERSE_ID, subProjectId: sub ? sub.id : null },
      });
      mappingCount += 1;
    }
  }
  console.log(`[migrate-zhou] QAs upserted: ${qaCount}, Mappings upserted: ${mappingCount}`);
}

async function migratePoems() {
  const poemsDir = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/poems_draft');
  const txtFiles = await listFilesByExtensions(poemsDir, ['.txt']);
  const byTitle = new Map();
  for (const f of txtFiles) {
    const title = path.basename(f, path.extname(f));
    byTitle.set(title, f);
  }

  const mPath = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft/mappings.json');
  const mData = await readJsonFile(mPath);
  // Load archetype details for extra fields
  const aPath = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft/poem_archetypes.json');
  const aData = await readJsonFile(aPath);
  const archetypes = new Map((aData?.poems || []).map((p) => [String(p.title), p]));
  const chapters = Object.keys(mData?.units || {});
  let poemUpserts = 0;

  const subProjects = await prisma.zhouSubProject.findMany({ where: { universeId: ZHOU_UNIVERSE_ID } });
  const subByName = new Map(subProjects.map((s) => [s.name, s]));

  for (const chapter of chapters) {
    const unit = mData.units[chapter];
    const sub = subByName.get(chapter) || null;
    for (const title of Object.values(unit)) {
      const poemTitle = String(title);
      const bodyPath = byTitle.get(poemTitle) || null;
      const body = bodyPath ? await readTextFile(bodyPath) : null;
      const id = `zhou_${chapter}_${poemTitle}`;
      const arche = archetypes.get(poemTitle) || null;
      const coreTheme = arche?.core_theme ? String(arche.core_theme) : null;
      const problemSolved = arche?.problem_solved ? String(arche.problem_solved) : null;
      const spiritualConsolation = arche?.spiritual_consolation ? String(arche.spiritual_consolation) : null;
      const classicalEcho = arche?.classical_echo ? String(arche.classical_echo) : null;
      const poetExplanation = arche?.poet_explanation ? String(arche.poet_explanation) : null;
      await prisma.zhouPoem.upsert({
        where: { id },
        update: { title: poemTitle, chapter, body, filePath: bodyPath ? path.relative(resolveFromProjectRoot('.'), bodyPath) : null, coreTheme, problemSolved, spiritualConsolation, classicalEcho, poetExplanation, universeId: ZHOU_UNIVERSE_ID, subProjectId: sub ? sub.id : null },
        create: { id, title: poemTitle, chapter, body, filePath: bodyPath ? path.relative(resolveFromProjectRoot('.'), bodyPath) : null, coreTheme, problemSolved, spiritualConsolation, classicalEcho, poetExplanation, universeId: ZHOU_UNIVERSE_ID, subProjectId: sub ? sub.id : null },
      });
      poemUpserts += 1;
    }
  }
  console.log(`[migrate-zhou] Poems upserted: ${poemUpserts}`);
}

async function migrateZhou() {
  try {
    await migrateProjects();
    await migrateQAAndMappings();
    await migratePoems();
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { migrateZhou };


