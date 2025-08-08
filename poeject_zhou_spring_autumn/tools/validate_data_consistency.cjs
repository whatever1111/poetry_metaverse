const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'content');
<<<<<<< HEAD
=======
const DATA_DRAFT_DIR = path.join(__dirname, '..', 'data', 'content_draft');
>>>>>>> feature/zhou-spring-autumn
const POEMS_DIR = path.join(__dirname, '..', 'data', 'poems');

async function validateDataConsistency() {
    console.log('🔍 开始数据一致性检查...\n');
    
    try {
        // 读取数据文件
<<<<<<< HEAD
        const [questionsData, mappingsData, projectsData] = await Promise.all([
            fs.readFile(path.join(DATA_DIR, 'questions.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DIR, 'mappings.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DIR, 'projects.json'), 'utf8').then(JSON.parse)
=======
        const [questionsData, mappingsData, projectsData, poemArchetypesData] = await Promise.all([
            fs.readFile(path.join(DATA_DRAFT_DIR, 'questions.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DRAFT_DIR, 'mappings.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DRAFT_DIR, 'projects.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DRAFT_DIR, 'poem_archetypes.json'), 'utf8').then(JSON.parse)
>>>>>>> feature/zhou-spring-autumn
        ]);

        const issues = [];

        // 1. 检查问题与映射的一致性
        console.log('📋 检查问题与映射的一致性...');
<<<<<<< HEAD
        for (const [chapterName, questions] of Object.entries(questionsData)) {
            if (!mappingsData.units[chapterName]) {
                issues.push(`❌ 问题文件中的章节 "${chapterName}" 在映射文件中不存在`);
            } else {
                const expectedPoemCount = Math.pow(2, questions.length);
                const actualPoemCount = Object.keys(mappingsData.units[chapterName]).length;
                
                if (expectedPoemCount !== actualPoemCount) {
                    issues.push(`❌ 章节 "${chapterName}" 的问题数量(${questions.length})与诗歌数量(${actualPoemCount})不匹配，期望 ${expectedPoemCount} 首`);
=======
        for (const chapter of questionsData.chapters) {
            const chapterName = chapter.id;
            if (!mappingsData.units[chapterName]) {
                issues.push(`❌ 问题文件中的章节 "${chapterName}" 在映射文件中不存在`);
            } else {
                const expectedPoemCount = Math.pow(2, chapter.questions.length);
                const actualPoemCount = Object.keys(mappingsData.units[chapterName]).length;
                
                if (expectedPoemCount !== actualPoemCount) {
                    issues.push(`❌ 章节 "${chapterName}" 的问题数量(${chapter.questions.length})与诗歌数量(${actualPoemCount})不匹配，期望 ${expectedPoemCount} 首`);
>>>>>>> feature/zhou-spring-autumn
                }
            }
        }

        // 2. 检查项目与问题的关联
        console.log('📋 检查项目与问题的关联...');
        for (const project of projectsData.projects) {
            for (const subProject of project.subProjects) {
<<<<<<< HEAD
                if (!questionsData[subProject.name]) {
=======
                const chapterExists = questionsData.chapters.some(chapter => chapter.id === subProject.name);
                if (!chapterExists) {
>>>>>>> feature/zhou-spring-autumn
                    issues.push(`❌ 项目 "${project.name}" 的子项目 "${subProject.name}" 在问题文件中不存在`);
                }
            }
        }

        // 3. 检查诗歌文件是否存在
        console.log('📋 检查诗歌文件是否存在...');
        for (const [chapterName, poems] of Object.entries(mappingsData.units)) {
            const chapterDir = path.join(POEMS_DIR, chapterName);
            try {
                await fs.access(chapterDir);
            } catch (error) {
                issues.push(`❌ 章节 "${chapterName}" 的诗歌目录不存在: ${chapterDir}`);
                continue;
            }

            for (const [code, poemTitle] of Object.entries(poems)) {
                // 移除书名号，因为实际文件名没有书名号
                const cleanTitle = poemTitle.replace(/《|》/g, '');
                const poemFile = path.join(chapterDir, `${cleanTitle}.txt`);
                try {
                    await fs.access(poemFile);
                } catch (error) {
                    issues.push(`❌ 诗歌文件不存在: ${poemFile}`);
                }
            }
        }

        // 4. 检查问题格式
        console.log('📋 检查问题格式...');
<<<<<<< HEAD
        for (const [chapterName, questions] of Object.entries(questionsData)) {
            questions.forEach((question, index) => {
                if (!question.id || !question.question || !question.options || !question.meaning) {
                    issues.push(`❌ 章节 "${chapterName}" 第 ${index + 1} 个问题缺少必需字段`);
                }
                
                if (!question.options.A || !question.options.B) {
                    issues.push(`❌ 章节 "${chapterName}" 第 ${index + 1} 个问题缺少选项A或B`);
                }
                
                if (!question.meaning.A || !question.meaning.B) {
                    issues.push(`❌ 章节 "${chapterName}" 第 ${index + 1} 个问题缺少含义A或B`);
                }
            });
        }

=======
        for (const chapter of questionsData.chapters) {
            chapter.questions.forEach((question, index) => {
                if (!question.id || !question.text || !question.options) {
                    issues.push(`❌ 章节 "${chapter.id}" 第 ${index + 1} 个问题缺少必需字段`);
                }
                
                if (!Array.isArray(question.options) || question.options.length !== 2) {
                    issues.push(`❌ 章节 "${chapter.id}" 第 ${index + 1} 个问题选项格式不正确`);
                }
                
                question.options.forEach((option, optionIndex) => {
                    if (!option.id || !option.text) {
                        issues.push(`❌ 章节 "${chapter.id}" 第 ${index + 1} 个问题的第 ${optionIndex + 1} 个选项缺少必需字段`);
                    }
                });
            });
        }

        // 5. 检查结果映射
        console.log('📋 检查结果映射...');
        for (const chapter of questionsData.chapters) {
            if (!chapter.results) {
                issues.push(`❌ 章节 "${chapter.id}" 缺少结果映射`);
                continue;
            }

            const expectedResultCount = Math.pow(2, chapter.questions.length);
            const actualResultCount = Object.keys(chapter.results).length;
            
            if (expectedResultCount !== actualResultCount) {
                issues.push(`❌ 章节 "${chapter.id}" 结果数量(${actualResultCount})与期望(${expectedResultCount})不匹配`);
            }

            // 检查每个结果是否有必需的字段
            for (const [code, result] of Object.entries(chapter.results)) {
                if (!result.meaning || !result.poem_id) {
                    issues.push(`❌ 章节 "${chapter.id}" 结果 "${code}" 缺少必需字段`);
                }
            }
        }

        // 6. 检查诗歌原型数据
        console.log('📋 检查诗歌原型数据...');
        if (!poemArchetypesData.poems || !Array.isArray(poemArchetypesData.poems)) {
            issues.push(`❌ poem_archetypes.json 缺少 poems 数组`);
        } else {
            for (const poem of poemArchetypesData.poems) {
                const requiredFields = ['id', 'title', 'chapter', 'core_theme', 'problem_solved', 'spiritual_consolation', 'classical_echo', 'poet_explanation'];
                for (const field of requiredFields) {
                    if (!(field in poem)) {
                        issues.push(`❌ 诗歌 "${poem.id || '未知'}" 缺少字段 "${field}"`);
                    }
                }
                
                // 检查poet_explanation字段是否为空（除了观我生章节）
                if (poem.chapter === '观我生' && (!poem.poet_explanation || poem.poet_explanation.trim() === '')) {
                    issues.push(`❌ 观我生诗歌 "${poem.id}" 缺少吴任几解诗内容`);
                }
            }
        }

>>>>>>> feature/zhou-spring-autumn
        // 输出结果
        console.log('\n📊 检查结果:');
        if (issues.length === 0) {
            console.log('✅ 所有数据一致性检查通过！');
        } else {
            console.log(`❌ 发现 ${issues.length} 个问题:`);
            issues.forEach(issue => console.log(issue));
        }

        // 生成统计信息
        const stats = {
<<<<<<< HEAD
            totalChapters: Object.keys(questionsData).length,
            totalQuestions: Object.values(questionsData).reduce((sum, questions) => sum + questions.length, 0),
            totalPoems: Object.values(mappingsData.units).reduce((sum, poems) => sum + Object.keys(poems).length, 0),
=======
            totalChapters: questionsData.chapters.length,
            totalQuestions: questionsData.chapters.reduce((sum, chapter) => sum + chapter.questions.length, 0),
            totalPoems: Object.values(mappingsData.units).reduce((sum, poems) => sum + Object.keys(poems).length, 0),
            totalPoemArchetypes: poemArchetypesData.poems ? poemArchetypesData.poems.length : 0,
>>>>>>> feature/zhou-spring-autumn
            totalProjects: projectsData.projects.length,
            totalSubProjects: projectsData.projects.reduce((sum, project) => sum + project.subProjects.length, 0)
        };

        console.log('\n📈 数据统计:');
        console.log(`- 章节数量: ${stats.totalChapters}`);
        console.log(`- 问题总数: ${stats.totalQuestions}`);
        console.log(`- 诗歌总数: ${stats.totalPoems}`);
<<<<<<< HEAD
=======
        console.log(`- 诗歌原型数: ${stats.totalPoemArchetypes}`);
>>>>>>> feature/zhou-spring-autumn
        console.log(`- 主项目数: ${stats.totalProjects}`);
        console.log(`- 子项目数: ${stats.totalSubProjects}`);

    } catch (error) {
<<<<<<< HEAD
        console.error('❌ 数据一致性检查失败:', error.message);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateDataConsistency();
}

module.exports = { validateDataConsistency }; 
=======
        console.error('❌ 验证过程中发生错误:', error.message);
        process.exit(1);
    }
}

// 运行验证
validateDataConsistency(); 
>>>>>>> feature/zhou-spring-autumn
