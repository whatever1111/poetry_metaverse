// 映射与契约适配占位（不改变现有行为）
// 后续在 C-2/C-3 中逐步补全从 Prisma 实体 → 前端期望结构的转换

export function mapZhouProjectsToPublicProjects(projects) {
  // 输入：ZhouProject[]（建议已 include subProjects）
  // 输出：{ id,name,description,poet,status,subProjects:[{name,description}] }[]
  return (projects || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    poet: p.poet ?? '',
    status: p.status ?? 'draft',
    subProjects: (p.subProjects || []).map((sp) => ({
      name: sp.name,
      description: sp.description ?? '',
    })),
  }));
}

export function mapZhouQAToPublicQuestions(qas) {
  // 输入：ZhouQA[] 任意顺序
  // 输出：{ [chapter]: [{question, options:{A,B}, meaning:{A,B}}] }
  const result = {};
  for (const qa of qas || []) {
    const chapter = qa.chapter;
    if (!result[chapter]) result[chapter] = [];
    result[chapter].push({
      question: qa.question,
      options: { A: qa.optionA ?? '', B: qa.optionB ?? '' },
      meaning: { A: qa.meaningA ?? '', B: qa.meaningB ?? '' },
    });
  }
  return result;
}

export function mapZhouMappingToPublicMappings(mappings) {
  // 输入：ZhouMapping[]
  // 输出：{ defaultUnit, units: { [chapter]: { [combo]: poemTitle } } }
  const units = {};
  const chapterOrder = [];
  for (const m of mappings || []) {
    if (!units[m.chapter]) {
      units[m.chapter] = {};
      chapterOrder.push(m.chapter);
    }
    units[m.chapter][m.combination] = m.poemTitle;
  }
  const defaultUnit = chapterOrder.length > 0 ? chapterOrder[0] : '';
  return { defaultUnit, units };
}

export function mapZhouPoemsToPublicPoems(poems) {
  // 输入：ZhouPoem[]
  // 输出：{ [titleWithoutBrackets]: body }
  const result = {};
  for (const poem of poems || []) {
    const cleaned = (poem.title || '').replace(/[《》]/g, '');
    if (cleaned) result[cleaned] = poem.body ?? '';
  }
  return result;
}

export function mapPoemArchetypesForFrontend(poems) {
  // 输入：ZhouPoem[]（至少含 title, poetExplanation）
  // 输出：{ poems: [{ title, poet_explanation }] }
  return {
    poems: (poems || [])
      .filter((p) => (p.poetExplanation ?? '').length > 0)
      .map((p) => ({ title: p.title, poet_explanation: p.poetExplanation }))
  };
}

export function getPublishedChapterSetFromProjects(projects) {
  // 提取所有已发布项目的子项目名称集合
  const set = new Set();
  for (const p of projects || []) {
    if ((p.status ?? '').toLowerCase() === 'published') {
      for (const sp of p.subProjects || []) {
        set.add(sp.name);
      }
    }
  }
  return set;
}


