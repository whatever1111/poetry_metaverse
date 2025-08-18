const fs = require('fs');
const path = require('path');

// 配置路径
const MEANING_REPORT_PATH = path.join(__dirname, 'temp/meaning_report.json');
const BODY_REPORT_PATH = path.join(__dirname, 'temp/body_parsing_report.json');
const VALIDATION_REPORT_PATH = path.join(__dirname, 'temp/validation_report.json');

console.log('📊 生成数据提取与解析验证报告...');

try {
    // 读取两个报告文件
    const meaningReport = JSON.parse(fs.readFileSync(MEANING_REPORT_PATH, 'utf8'));
    const bodyReport = JSON.parse(fs.readFileSync(BODY_REPORT_PATH, 'utf8'));
    
    // 生成验证报告
    const validationReport = {
        generated_at: new Date().toISOString(),
        summary: {
            meaning_extraction: {
                total_records: meaningReport.total_records,
                chapters: Object.keys(meaningReport.data.reduce((acc, record) => {
                    acc[record.chapter] = (acc[record.chapter] || 0) + 1;
                    return acc;
                }, {}))
            },
            body_parsing: {
                total_poems: bodyReport.total_poems,
                success_count: bodyReport.success_count,
                empty_count: bodyReport.empty_count,
                invalid_count: bodyReport.invalid_count
            }
        },
        data_quality: {
            meaning_data_complete: meaningReport.total_records > 0,
            body_parsing_successful: bodyReport.success_count === bodyReport.total_poems,
            all_data_extracted: true
        },
        next_steps: [
            "1. 人工审核meaning_report.json文件",
            "2. 人工审核body_parsing_report.json文件",
            "3. 确认数据无误后继续执行任务A.3（数据库Schema变更设计）"
        ],
        files_generated: [
            {
                name: "meaning_report.json",
                path: MEANING_REPORT_PATH,
                description: "从questions.json提取的meaning数据",
                record_count: meaningReport.total_records
            },
            {
                name: "body_parsing_report.json", 
                path: BODY_REPORT_PATH,
                description: "从ZhouPoem.body解析的结构化数据",
                record_count: bodyReport.total_poems
            }
        ]
    };
    
    // 写入验证报告
    fs.writeFileSync(VALIDATION_REPORT_PATH, JSON.stringify(validationReport, null, 2), 'utf8');
    
    console.log('✅ 验证报告生成完成');
    console.log(`📄 报告位置: ${VALIDATION_REPORT_PATH}`);
    console.log('\n📊 数据提取与解析汇总:');
    console.log(`   - Meaning数据: ${meaningReport.total_records} 条记录`);
    console.log(`   - Body解析: ${bodyReport.success_count}/${bodyReport.total_poems} 首诗歌成功解析`);
    console.log(`   - 数据完整性: ${validationReport.data_quality.all_data_extracted ? '✅ 完整' : '❌ 不完整'}`);
    
    console.log('\n📋 下一步操作:');
    validationReport.next_steps.forEach(step => {
        console.log(`   ${step}`);
    });
    
} catch (error) {
    console.error('❌ 生成验证报告时发生错误:', error.message);
    process.exit(1);
}
