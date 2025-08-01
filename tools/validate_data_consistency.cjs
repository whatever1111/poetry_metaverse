const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const POEMS_DIR = path.join(__dirname, '..', 'poems');

async function validateDataConsistency() {
    console.log('🔍 开始数据一致性检查...\n');
    
    try {
        // 读取数据文件
        const [questionsData, mappingsData, projectsData] = await Promise.all([
            fs.readFile(path.join(DATA_DIR, 'questions.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DIR, 'mappings.json'), 'utf8').then(JSON.parse),
            fs.readFile(path.join(DATA_DIR, 'projects.json'), 'utf8').then(JSON.parse)
        ]);

        const issues = [];

        // 1. 检查问题与映射的一致性
        console.log('📋 检查问题与映射的一致性...');
        for (const [chapterName, questions] of Object.entries(questionsData)) {
            if (!mappingsData.units[chapterName]) {
                issues.push(`❌ 问题文件中的章节 "${chapterName}" 在映射文件中不存在`);
            } else {
                const expectedPoemCount = Math.pow(2, questions.length);
                const actualPoemCount = Object.keys(mappingsData.units[chapterName]).length;
                
                if (expectedPoemCount !== actualPoemCount) {
                    issues.push(`❌ 章节 "${chapterName}" 的问题数量(${questions.length})与诗歌数量(${actualPoemCount})不匹配，期望 ${expectedPoemCount} 首`);
                }
            }
        }

        // 2. 检查项目与问题的关联
        console.log('📋 检查项目与问题的关联...');
        for (const project of projectsData.projects) {
            for (const subProject of project.subProjects) {
                if (!questionsData[subProject.name]) {
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
            totalChapters: Object.keys(questionsData).length,
            totalQuestions: Object.values(questionsData).reduce((sum, questions) => sum + questions.length, 0),
            totalPoems: Object.values(mappingsData.units).reduce((sum, poems) => sum + Object.keys(poems).length, 0),
            totalProjects: projectsData.projects.length,
            totalSubProjects: projectsData.projects.reduce((sum, project) => sum + project.subProjects.length, 0)
        };

        console.log('\n📈 数据统计:');
        console.log(`- 章节数量: ${stats.totalChapters}`);
        console.log(`- 问题总数: ${stats.totalQuestions}`);
        console.log(`- 诗歌总数: ${stats.totalPoems}`);
        console.log(`- 主项目数: ${stats.totalProjects}`);
        console.log(`- 子项目数: ${stats.totalSubProjects}`);

    } catch (error) {
        console.error('❌ 数据一致性检查失败:', error.message);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateDataConsistency();
}

module.exports = { validateDataConsistency }; 