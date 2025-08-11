const { checkDataIntegrity } = require('./check-integrity.cjs');
const { checkRelationships } = require('./check-relationships.cjs');
const { checkConsistency } = require('./check-consistency.cjs');
const fs = require('fs');
const path = require('path');

/**
 * 验证报告生成器
 * 整合所有验证结果并生成综合报告
 */

async function generateValidationReport() {
  console.log('=== 开始生成综合验证报告 ===\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      totalIssues: 0
    },
    sections: {},
    recommendations: []
  };

  try {
    // 1. 执行数据完整性检查
    console.log('执行数据完整性检查...');
    const integrityResults = await checkDataIntegrity();
    report.sections.integrity = integrityResults;
    report.summary.totalIssues += integrityResults.summary.issuesFound;
    
    // 2. 执行关联关系验证
    console.log('执行关联关系验证...');
    const relationshipResults = await checkRelationships();
    report.sections.relationships = relationshipResults;
    report.summary.totalIssues += relationshipResults.issues.length;
    
    // 3. 执行数据一致性检查
    console.log('执行数据一致性检查...');
    const consistencyResults = await checkConsistency();
    report.sections.consistency = consistencyResults;
    report.summary.totalIssues += consistencyResults.issues.length;
    
    // 4. 计算总体统计
    calculateOverallSummary(report);
    
    // 5. 生成建议
    generateRecommendations(report);
    
    // 6. 生成报告文件
    await generateReportFile(report);
    
    // 7. 显示总结
    displaySummary(report);
    
  } catch (error) {
    console.error('生成验证报告失败:', error);
    report.summary.totalIssues++;
    report.recommendations.push('验证过程出现错误，需要重新检查');
  }
  
  return report;
}

function calculateOverallSummary(report) {
  // 计算总体统计
  const sections = ['integrity', 'relationships', 'consistency'];
  
  sections.forEach(section => {
    if (report.sections[section]) {
      const sectionData = report.sections[section];
      
      if (sectionData.summary) {
        report.summary.totalChecks += sectionData.summary.totalChecks || 0;
        report.summary.passedChecks += sectionData.summary.passedChecks || 0;
        report.summary.failedChecks += sectionData.summary.failedChecks || 0;
      }
    }
  });
}

function generateRecommendations(report) {
  const recommendations = [];
  
  // 基于完整性检查结果生成建议
  if (report.sections.integrity && report.sections.integrity.dataQualityIssues.length > 0) {
    recommendations.push('数据完整性存在问题，建议检查外键关联和唯一性约束');
  }
  
  // 基于关联关系检查结果生成建议
  if (report.sections.relationships && report.sections.relationships.issues.length > 0) {
    recommendations.push('关联关系存在问题，建议检查桥表和跨宇宙关联');
  }
  
  // 基于一致性检查结果生成建议
  if (report.sections.consistency && report.sections.consistency.issues.length > 0) {
    recommendations.push('数据一致性存在问题，建议检查数据格式和类型');
  }
  
  // 总体建议
  if (report.summary.totalIssues === 0) {
    recommendations.push('所有验证通过，数据质量良好，可以继续后续开发');
  } else if (report.summary.totalIssues < 5) {
    recommendations.push('发现少量问题，建议优先修复后再继续开发');
  } else {
    recommendations.push('发现较多问题，建议系统性地修复数据质量问题');
  }
  
  report.recommendations = recommendations;
}

async function generateReportFile(report) {
  const reportDir = path.join(__dirname, '..', '..', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `validation-report-${timestamp}.json`);
  
  // 生成 JSON 报告
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n验证报告已保存到: ${reportPath}`);
  
  // 生成 Markdown 报告
  const markdownPath = path.join(reportDir, `validation-report-${timestamp}.md`);
  const markdownContent = generateMarkdownReport(report);
  fs.writeFileSync(markdownPath, markdownContent);
  console.log(`Markdown 报告已保存到: ${markdownPath}`);
  
  return { jsonPath: reportPath, markdownPath: markdownPath };
}

function generateMarkdownReport(report) {
  let markdown = `# 陆家花园数据库验证报告

**生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}
**验证状态**: ${report.summary.totalIssues === 0 ? '✅ 通过' : '❌ 发现问题'}

## 总体统计

- **总检查数**: ${report.summary.totalChecks}
- **通过检查**: ${report.summary.passedChecks}
- **失败检查**: ${report.summary.failedChecks}
- **发现问题**: ${report.summary.totalIssues}

## 详细结果

### 1. 数据完整性检查

`;

  if (report.sections.integrity) {
    const integrity = report.sections.integrity;
    markdown += `- **总表数**: ${integrity.summary.totalTables}
- **总记录数**: ${integrity.summary.totalRecords}
- **发现问题**: ${integrity.summary.issuesFound}

`;

    if (integrity.dataQualityIssues.length > 0) {
      markdown += '**发现的问题**:\n';
      integrity.dataQualityIssues.forEach((issue, index) => {
        markdown += `${index + 1}. [${issue.type}] ${issue.table}.${issue.field}: ${issue.issue}\n`;
      });
      markdown += '\n';
    }
  }

  markdown += `### 2. 关联关系验证

`;

  if (report.sections.relationships) {
    const relationships = report.sections.relationships;
    markdown += `- **总检查数**: ${relationships.summary.totalChecks}
- **通过检查**: ${relationships.summary.passedChecks}
- **失败检查**: ${relationships.summary.failedChecks}
- **发现问题**: ${relationships.issues.length}

`;

    if (relationships.issues.length > 0) {
      markdown += '**发现的问题**:\n';
      relationships.issues.forEach((issue, index) => {
        markdown += `${index + 1}. [${issue.type}] ${issue.category}: ${issue.issue}\n`;
      });
      markdown += '\n';
    }
  }

  markdown += `### 3. 数据一致性检查

`;

  if (report.sections.consistency) {
    const consistency = report.sections.consistency;
    markdown += `- **总检查数**: ${consistency.summary.totalChecks}
- **通过检查**: ${consistency.summary.passedChecks}
- **失败检查**: ${consistency.summary.failedChecks}
- **发现问题**: ${consistency.issues.length}

`;

    if (consistency.issues.length > 0) {
      markdown += '**发现的问题**:\n';
      consistency.issues.forEach((issue, index) => {
        markdown += `${index + 1}. [${issue.type}] ${issue.category}: ${issue.issue}\n`;
      });
      markdown += '\n';
    }
  }

  markdown += `## 建议

`;

  report.recommendations.forEach((recommendation, index) => {
    markdown += `${index + 1}. ${recommendation}\n`;
  });

  markdown += `
## 结论

${report.summary.totalIssues === 0 ? 
  '✅ 所有验证检查通过，数据质量良好，可以安全地继续后续开发工作。' : 
  '⚠️ 发现了一些数据质量问题，建议按照上述建议进行修复后再继续开发。'
}

---
*本报告由陆家花园项目验证系统自动生成*
`;

  return markdown;
}

function displaySummary(report) {
  console.log('\n=== 验证报告总结 ===');
  console.log(`总检查数: ${report.summary.totalChecks}`);
  console.log(`通过检查: ${report.summary.passedChecks}`);
  console.log(`失败检查: ${report.summary.failedChecks}`);
  console.log(`发现问题: ${report.summary.totalIssues}`);
  
  if (report.summary.totalIssues === 0) {
    console.log('\n🎉 恭喜！所有验证检查通过，数据质量良好！');
  } else {
    console.log('\n⚠️ 发现了一些问题，请查看详细报告。');
  }
  
  console.log('\n建议:');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  generateValidationReport()
    .then(report => {
      console.log('\n=== 报告生成完成 ===');
      process.exit(report.summary.totalIssues > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('报告生成失败:', error);
      process.exit(1);
    });
}

module.exports = { generateValidationReport };
