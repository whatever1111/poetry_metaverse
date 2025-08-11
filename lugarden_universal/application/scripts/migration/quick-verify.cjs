/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { PrismaClient } = require('../../generated/prisma');
const { resolveFromProjectRoot, readJsonFile } = require('./data-loader.cjs');

const prisma = new PrismaClient();

async function verifyMaoxiaodou() {
  const base = resolveFromProjectRoot('poeject_maoxiaodou_universe/data');
  const meta = await readJsonFile(path.join(base, 'metadata.json'));
  const scenesJson = await readJsonFile(path.join(base, 'scenes.json'));
  const themesJson = await readJsonFile(path.join(base, 'themes.json'));
  const termsJson = await readJsonFile(path.join(base, 'terminology.json'));
  const poemsJson = await readJsonFile(path.join(base, 'poems.json'));

  const uni = 'universe_maoxiaodou';
  const counts = {
    poem: await prisma.maoxiaodouPoem.count({ where: { universeId: uni } }),
    character: await prisma.maoxiaodouCharacter.count({ where: { universeId: uni } }),
    relation: await prisma.maoxiaodouCharacterRelation.count({ where: { universeId: uni } }),
    scene: await prisma.maoxiaodouScene.count({ where: { universeId: uni } }),
    terminology: await prisma.maoxiaodouTerminology.count({ where: { universeId: uni } }),
    theme: await prisma.maoxiaodouTheme.count({ where: { universeId: uni } }),
    timeline: await prisma.maoxiaodouTimeline.count({ where: { universeId: uni } }),
    theory: await prisma.maoxiaodouTheory.count({ where: { universeId: uni } }),
    readingLayer: await prisma.maoxiaodouReadingLayer.count({ where: { universeId: uni } }),
    mapping: await prisma.maoxiaodouMapping.count({ where: { universeId: uni } }),
    metadata: await prisma.maoxiaodouMetadata.count({ where: { universeId: uni } }),
  };

  const expected = {
    poem: poemsJson?.poems?.length || 0,
    character: meta?.statistics?.character_categories ? (meta.statistics.character_categories.core + meta.statistics.character_categories.secondary + meta.statistics.character_categories.tertiary) : 0,
    scene: scenesJson?.scenes?.length || 0,
    terminology: termsJson?.terminology?.length || 0,
    theme: themesJson?.themes?.length || 0,
  };

  console.log('\n[VERIFY] Maoxiaodou');
  console.log('Counts:', counts);
  console.log('Expected (subset):', expected);
  const pass = counts.poem === expected.poem
    && counts.character === expected.character
    && counts.scene === expected.scene
    && counts.terminology === expected.terminology
    && counts.theme === expected.theme
    && counts.metadata === 1;
  console.log('Result:', pass ? 'PASS' : 'CHECK');
}

async function verifyZhou() {
  const base = resolveFromProjectRoot('poeject_zhou_spring_autumn/data/content_draft');
  const projJson = await readJsonFile(path.join(base, 'projects.json'));
  const quesJson = await readJsonFile(path.join(base, 'questions.json'));
  const mapJson = await readJsonFile(path.join(base, 'mappings.json'));

  const uni = 'universe_zhou_spring_autumn';
  const counts = {
    project: await prisma.zhouProject.count({ where: { universeId: uni } }),
    subProject: await prisma.zhouSubProject.count({ where: { universeId: uni } }),
    qa: await prisma.zhouQA.count({ where: { universeId: uni } }),
    mapping: await prisma.zhouMapping.count({ where: { universeId: uni } }),
    poem: await prisma.zhouPoem.count({ where: { universeId: uni } }),
  };

  const expectedQA = (quesJson?.chapters || []).reduce((sum, ch) => sum + (ch.questions?.length || 0), 0);
  const expectedMappings = Object.values(mapJson?.units || {}).reduce((sum, unit) => sum + Object.keys(unit).length, 0);
  const expectedPoems = expectedMappings; // one per mapping title
  const expectedProjects = projJson?.projects?.length || 0;
  const expectedSubProjects = (projJson?.projects?.[0]?.subProjects?.length) || 0;

  console.log('\n[VERIFY] Zhou');
  console.log('Counts:', counts);
  console.log('Expected:', { expectedProjects, expectedSubProjects, expectedQA, expectedMappings, expectedPoems });
  const pass = counts.project === expectedProjects
    && counts.subProject === expectedSubProjects
    && counts.qa === expectedQA
    && counts.mapping === expectedMappings
    && counts.poem === expectedPoems;
  console.log('Result:', pass ? 'PASS' : 'CHECK');
}

async function main() {
  try {
    await verifyMaoxiaodou();
    await verifyZhou();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


