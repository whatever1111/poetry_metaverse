const fs = require('fs');
const path = require('path');

// 配置路径
const QUESTIONS_JSON_PATH = path.join(__dirname, '../../../../poeject_zhou_spring_autumn/data/content_draft/questions.json');
const OUTPUT_PATH = path.join(__dirname, 'temp/meaning_report.json');

console.log('🔍 开始提取meaning数据...');
console.log(`📁 源文件: ${QUESTIONS_JSON_PATH}`);
console.log(`📁 输出文件: ${OUTPUT_PATH}`);

try {
    // 读取questions.json文件
    const questionsData = JSON.parse(fs.readFileSync(QUESTIONS_JSON_PATH, 'utf8'));
    
    const meaningData = [];
    
    // 遍历所有章节
    questionsData.chapters.forEach(chapter => {
        const chapterId = chapter.id;
        
        // 遍历每个章节的results
        Object.entries(chapter.results).forEach(([combination, result]) => {
            meaningData.push({
                chapter: chapterId,
                combination: combination,
                meaning: result.meaning,
                poem_id: result.poem_id
            });
        });
    });
    
    // 生成报告
    const report = {
        extracted_at: new Date().toISOString(),
        source_file: QUESTIONS_JSON_PATH,
        total_records: meaningData.length,
        data: meaningData
    };
    
    // 写入报告文件
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');
    
    console.log(`✅ 成功提取 ${meaningData.length} 条meaning记录`);
    console.log(`📊 章节统计:`);
    
    // 统计每个章节的记录数
    const chapterStats = {};
    meaningData.forEach(record => {
        chapterStats[record.chapter] = (chapterStats[record.chapter] || 0) + 1;
    });
    
    Object.entries(chapterStats).forEach(([chapter, count]) => {
        console.log(`   - ${chapter}: ${count} 条记录`);
    });
    
    console.log(`📄 报告已保存到: ${OUTPUT_PATH}`);
    
} catch (error) {
    console.error('❌ 提取meaning数据时发生错误:', error.message);
    process.exit(1);
}
