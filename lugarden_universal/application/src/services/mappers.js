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
  // 输入：ZhouMapping[]（包含meaning字段）
  // 输出：{ defaultUnit, units: { [chapter]: { [combo]: { poemTitle, meaning? } } } }
  const units = {};
  const chapterOrder = [];
  for (const m of mappings || []) {
    if (!units[m.chapter]) {
      units[m.chapter] = {};
      chapterOrder.push(m.chapter);
    }
    // 支持新的meaning字段，保持向后兼容
    units[m.chapter][m.combination] = {
      poemTitle: m.poemTitle,
      ...(m.meaning && { meaning: m.meaning })
    };
  }
  const defaultUnit = chapterOrder.length > 0 ? chapterOrder[0] : '';
  return { defaultUnit, units };
}

export function mapZhouPoemsToPublicPoems(poems) {
  // 输入：ZhouPoem[]（body字段现在是JSON格式）
  // 输出：{ [titleWithoutBrackets]: body }
  const result = {};
  for (const poem of poems || []) {
    const cleaned = (poem.title || '').replace(/[《》]/g, '');
    if (cleaned) {
      // 处理新的JSON格式body字段
      let bodyContent = '';
      if (poem.body) {
        if (typeof poem.body === 'string') {
          // 向后兼容：如果body仍然是字符串格式
          bodyContent = poem.body;
        } else if (typeof poem.body === 'object' && poem.body !== null) {
          // 新的JSON格式：提取主要文本内容
          const { quote_text, quote_citation, main_text } = poem.body;
          const parts = [];
          if (quote_text) parts.push(quote_text);
          if (quote_citation) parts.push(`——${quote_citation}`);
          if (main_text) parts.push(main_text);
          bodyContent = parts.join('\n\n');
        }
      }
      result[cleaned] = bodyContent;
    }
  }
  return result;
}

export function mapPoemArchetypesForFrontend(poems) {
  // 输入：ZhouPoem[]（至少含 title, poetExplanation，body现在是JSON格式）
  // 输出：{ poems: [{ title, poet_explanation, classicalEcho, coreTheme, problemSolved, spiritualConsolation, chapter, body }] }
  return {
    poems: (poems || [])
      .filter((p) => (p.poetExplanation ?? '').length > 0)
      .map((p) => {
        // 处理新的JSON格式body字段
        let bodyContent = '';
        if (p.body) {
          if (typeof p.body === 'string') {
            // 向后兼容：如果body仍然是字符串格式
            bodyContent = p.body;
          } else if (typeof p.body === 'object' && p.body !== null) {
            // 新的JSON格式：提取主要文本内容
            const { quote_text, quote_citation, main_text } = p.body;
            const parts = [];
            if (quote_text) parts.push(quote_text);
            if (quote_citation) parts.push(`——${quote_citation}`);
            if (main_text) parts.push(main_text);
            bodyContent = parts.join('\n\n');
          }
        }
        
        return { 
          title: p.title, 
          poet_explanation: p.poetExplanation,
          classicalEcho: p.classicalEcho ?? null,
          coreTheme: p.coreTheme ?? null,
          problemSolved: p.problemSolved ?? null,
          spiritualConsolation: p.spiritualConsolation ?? null,
          chapter: p.chapter ?? null,
          body: bodyContent
        };
      })
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

// 宇宙内容聚合映射函数
export function mapUniverseContent(universe, projects, qas, mappings, poems, poemArchetypes) {
  // 输入：宇宙信息和相关数据
  // 输出：统一的宇宙内容结构
  return {
    universe: {
      id: universe.id,
      code: universe.code,
      name: universe.name,
      type: universe.type,
      description: universe.description,
      createdAt: universe.createdAt,
      updatedAt: universe.updatedAt
    },
    content: {
      projects: projects || [],
      questions: qas || {},
      mappings: mappings || { defaultUnit: '', units: {} },
      poems: poems || {},
      poemArchetypes: poemArchetypes || { poems: [] }
    }
  };
}


