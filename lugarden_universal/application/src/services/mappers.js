// 映射与契约适配占位（不改变现有行为）
// 后续在 C-2/C-3 中逐步补全从 Prisma 实体 → 前端期望结构的转换

export function mapZhouProjectsToPublicProjects(projects) {
  // 输入：ZhouProject[]（含子项目）
  // 输出：{ id,name,description,poet,status,subProjects:[{name,description}] }[]
  return projects;
}

export function mapZhouQAToPublicQuestions(qaByChapter) {
  // 输入：ZhouQA[] 按章节聚合
  // 输出：{ [chapter]: [{question, options:{A,B}, meaning:{A,B}}] }
  return qaByChapter;
}

export function mapZhouMappingToPublicMappings(mappingsByChapter) {
  // 输出：{ defaultUnit, units: { [chapter]: { [combo]: poemTitle } } }
  return mappingsByChapter;
}

export function mapZhouPoemsToPublicPoems(poems) {
  // 输出：{ [titleWithoutBrackets]: body }
  return poems;
}

export function mapPoemArchetypesForFrontend(poems) {
  // 输出：{ poems: [{ title, poet_explanation }] }
  return poems;
}


