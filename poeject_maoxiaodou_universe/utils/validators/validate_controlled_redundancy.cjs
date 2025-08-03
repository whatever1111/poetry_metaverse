/**
 * 毛小豆宇宙受控冗余机制验证脚本 (重构版)
 * 使用公共组件模块，消除重复代码
 * 专注验证受控冗余机制的架构完整性和配置合理性
 */
const { dataLoader } = require('../components/data_loader.cjs');
const { ReportGenerator } = require('../components/report_generator.cjs');
const { DataDisplay } = require('../components/data_display.cjs');
const { TheoryStatistics } = require('../components/theory_statistics.cjs');
const { versionChecker, frameworkFileChecker, fileExistenceChecker } = require('../components/common_tools.cjs');

/**
 * 验证受控冗余机制的整体架构合理性
 * @param {Object} tfRedundancy - 理论框架的受控冗余配置
 * @param {Object} mappingsRedundancy - 映射文件的受控冗余配置
 * @param {Object} reRedundancy - 阅读体验的受控冗余配置
 * @returns {Array} 架构问题列表
 */
function validateRedundancyArchitecture(tfRedundancy, mappingsRedundancy, reRedundancy) {
    const issues = [];
    
    // 检查不同文件间的配置一致性
    const tfFiles = new Set(tfRedundancy?.referenced_files || []);
    const mappingsFiles = new Set(mappingsRedundancy?.referenced_files || []);
    const reFiles = new Set(reRedundancy?.referenced_files || []);
    
    // 检查文件引用的一致性
    const allFiles = new Set([...tfFiles, ...mappingsFiles, ...reFiles]);
    const expectedFiles = ['theoretical_framework.json', 'mappings.json', 'reading_experience.json', 
                          'characters.json', 'poems.json', 'terminology.json', 'themes.json'];
    
    for (const expectedFile of expectedFiles) {
        if (!allFiles.has(expectedFile)) {
            issues.push(`❌ 受控冗余机制缺少核心文件引用: ${expectedFile}`);
        }
    }
    
    // 检查架构的合理性
    if (tfFiles.size === 0 && mappingsFiles.size === 0 && reFiles.size === 0) {
        issues.push('❌ 受控冗余机制架构不完整：没有文件引用配置');
    }
    
    // 检查是否有孤立的配置
    if (tfRedundancy && !mappingsRedundancy && !reRedundancy) {
        issues.push('❌ 受控冗余机制架构不平衡：只有理论框架有配置');
    }
    
    return issues;
}

/**
 * 验证不同文件间的配置一致性
 * @param {Object} tfRedundancy - 理论框架的受控冗余配置
 * @param {Object} mappingsRedundancy - 映射文件的受控冗余配置
 * @param {Object} reRedundancy - 阅读体验的受控冗余配置
 * @returns {Array} 一致性问题列表
 */
function validateConfigurationConsistency(tfRedundancy, mappingsRedundancy, reRedundancy) {
    const issues = [];
    
    // 检查交叉引用配置的一致性
    const tfCrossRefs = Object.keys(tfRedundancy?.cross_references || {});
    const mappingsCrossRefs = Object.keys(mappingsRedundancy?.cross_references || {});
    const reCrossRefs = Object.keys(reRedundancy?.cross_references || {});
    
    // 检查是否有冲突的交叉引用
    const allCrossRefs = [...tfCrossRefs, ...mappingsCrossRefs, ...reCrossRefs];
    const duplicateCrossRefs = allCrossRefs.filter((item, index) => allCrossRefs.indexOf(item) !== index);
    
    if (duplicateCrossRefs.length > 0) {
        issues.push(`❌ 发现重复的交叉引用配置: ${duplicateCrossRefs.join(', ')}`);
    }
    
    // 检查版本一致性
    const versions = new Set();
    if (tfRedundancy?.version) versions.add(tfRedundancy.version);
    if (mappingsRedundancy?.version) versions.add(mappingsRedundancy.version);
    if (reRedundancy?.version) versions.add(reRedundancy.version);
    
    if (versions.size > 1) {
        issues.push(`❌ 受控冗余机制版本不一致: ${Array.from(versions).join(', ')}`);
    }
    
    return issues;
}

/**
 * 验证冗余信息的合理性
 * @param {Object} dataObjects - 所有数据对象
 * @returns {Object} 冗余度验证结果
 */
function validateRedundancyLevel(dataObjects) {
    const issues = [];
    const warnings = [];
    
    // 计算冗余度统计
    const redundancyStats = {
        totalRedundantFields: 0,
        redundantFiles: 0,
        redundancyRatio: 0,
        totalFields: 0
    };
    
    // 分析每个文件的冗余度
    for (const [fileName, fileData] of Object.entries(dataObjects)) {
        if (fileData.controlled_redundancy) {
            const redundantFields = Object.keys(fileData.controlled_redundancy.cross_references || {}).length;
            const totalFields = Object.keys(fileData).length;
            
            redundancyStats.totalRedundantFields += redundantFields;
            redundancyStats.totalFields += totalFields;
            
            if (redundantFields > 0) {
                redundancyStats.redundantFiles++;
            }
        }
    }
    
    // 计算冗余度比例
    if (redundancyStats.totalFields > 0) {
        redundancyStats.redundancyRatio = redundancyStats.totalRedundantFields / redundancyStats.totalFields;
    }
    
    // 评估冗余度合理性
    if (redundancyStats.redundancyRatio > 0.3) {
        warnings.push(`⚠️ 冗余度过高: ${(redundancyStats.redundancyRatio * 100).toFixed(1)}%`);
    }
    
    if (redundancyStats.redundancyRatio < 0.05) {
        warnings.push(`⚠️ 冗余度过低: ${(redundancyStats.redundancyRatio * 100).toFixed(1)}%，可能影响数据完整性`);
    }
    
    return { issues, warnings, stats: redundancyStats };
}

async function validateControlledRedundancy() {
    try {
        console.log('🔍 开始受控冗余机制验证...');
        
        // 使用公共工具加载数据文件
        const dataObjects = await dataLoader.loadTheoryFrameworkFiles();
        const theoretical_framework = dataObjects['theoretical_framework.json'];
        const mappings = dataObjects['mappings.json'];
        const reading_experience = dataObjects['reading_experience.json'];
        const metadata = dataObjects['metadata.json'];
        
        let issues = [];
        let warnings = [];
        
        // 1. 验证理论框架的受控冗余机制
        console.log('📋 验证理论框架的受控冗余机制...');
        const tfRedundancy = theoretical_framework.theoretical_framework.controlled_redundancy;
        if (!tfRedundancy) {
            issues.push('❌ 理论框架文件缺少受控冗余机制');
        } else {
            // 检查引用的文件是否都存在
            const tfFileCheck = await fileExistenceChecker.checkFilesWithDetails(tfRedundancy.referenced_files);
            if (!tfFileCheck.isValid) {
                issues.push(...tfFileCheck.issues);
            }
            
            // 检查交叉引用 - 修复：适配实际的交叉引用结构
            const expectedCrossRefs = ['character_mappings', 'poem_mappings', 'theory_mappings', 'reading_layers', 'character_data', 'poem_data', 'terminology_data'];
            const actualCrossRefs = Object.keys(tfRedundancy.cross_references || {});
            
            for (const expectedRef of expectedCrossRefs) {
                if (!actualCrossRefs.includes(expectedRef)) {
                    issues.push(`❌ 理论框架缺少交叉引用: ${expectedRef}`);
                }
            }
            
            // 检查是否有额外的交叉引用
            for (const actualRef of actualCrossRefs) {
                if (!expectedCrossRefs.includes(actualRef)) {
                    warnings.push(`⚠️ 理论框架包含未预期的交叉引用: ${actualRef}`);
                }
            }
        }

        // 2. 验证阅读体验的受控冗余机制
        console.log('📋 验证阅读体验的受控冗余机制...');
        const reRedundancy = reading_experience.reading_experience.controlled_redundancy;
        if (!reRedundancy) {
            issues.push('❌ 阅读体验文件缺少受控冗余机制');
        } else {
            // 检查引用的文件是否都存在
            const reFileCheck = await fileExistenceChecker.checkFilesWithDetails(reRedundancy.referenced_files);
            if (!reFileCheck.isValid) {
                issues.push(...reFileCheck.issues);
            }
        }

        // 3. 验证映射文件的受控冗余机制
        console.log('📋 验证映射文件的受控冗余机制...');
        const mapRedundancy = mappings.metadata.controlled_redundancy;
        if (!mapRedundancy) {
            issues.push('❌ 映射文件缺少受控冗余机制');
        } else {
            // 检查引用的文件是否都存在
            const mapFileCheck = await fileExistenceChecker.checkFilesWithDetails(mapRedundancy.referenced_files);
            if (!mapFileCheck.isValid) {
                issues.push(...mapFileCheck.issues);
            }
        }

        // 4. 新增：架构合理性验证
        console.log('📋 验证受控冗余机制架构合理性...');
        const architectureIssues = validateRedundancyArchitecture(tfRedundancy, mapRedundancy, reRedundancy);
        issues.push(...architectureIssues);
        
        // 5. 新增：配置一致性验证
        console.log('📋 验证受控冗余机制配置一致性...');
        const consistencyIssues = validateConfigurationConsistency(tfRedundancy, mapRedundancy, reRedundancy);
        issues.push(...consistencyIssues);
        
        // 6. 新增：冗余度验证
        console.log('📋 验证受控冗余机制冗余度...');
        const redundancyResult = validateRedundancyLevel(dataObjects);
        issues.push(...redundancyResult.issues);
        warnings.push(...redundancyResult.warnings);

        // 7. 使用公共工具验证版本号一致性
        console.log('📋 验证版本号一致性...');
        const versionResult = versionChecker.checkTheoryFrameworkVersions(dataObjects);
        if (!versionResult.isValid) {
            issues.push(...versionResult.issues);
        }
        warnings.push(...versionResult.warnings);

        // 8. 使用公共工具验证元数据中的框架文件引用
        console.log('📋 验证元数据中的框架文件引用...');
        const frameworkFileResult = frameworkFileChecker.checkFrameworkFileReferences(metadata.metadata.theoretical_framework);
        if (!frameworkFileResult.isValid) {
            issues.push(...frameworkFileResult.issues);
        }
        warnings.push(...frameworkFileResult.warnings);

        // 使用公共组件进行统计和报告生成
        const theoryStatistics = new TheoryStatistics(dataLoader);
        const reportGenerator = new ReportGenerator();
        const dataDisplay = new DataDisplay();
        
        // 输出结果
        console.log('\n📊 受控冗余机制验证结果:');
        if (issues.length === 0) {
            console.log('✅ 受控冗余机制验证通过！');
        } else {
            console.log(`❌ 发现 ${issues.length} 个问题:`);
            issues.forEach(issue => console.log(issue));
        }

        if (warnings.length > 0) {
            console.log(`\n⚠️ 发现 ${warnings.length} 个警告:`);
            warnings.forEach(warning => console.log(warning));
        }

        // 生成统计信息
        const stats = {
            totalReferencedFiles: tfRedundancy ? tfRedundancy.referenced_files.length : 0,
            totalCrossReferences: tfRedundancy ? Object.keys(tfRedundancy.cross_references).length : 0,
            frameworkFilesInMetadata: metadata.metadata.theoretical_framework.framework_files.length,
            versionConsistency: versionResult.isValid,
            architectureValid: architectureIssues.length === 0,
            configurationConsistent: consistencyIssues.length === 0,
            redundancyLevel: redundancyResult.stats.redundancyRatio
        };

        console.log('\n📈 受控冗余机制统计:');
        console.log(`- 引用文件数量: ${stats.totalReferencedFiles}`);
        console.log(`- 交叉引用数量: ${stats.totalCrossReferences}`);
        console.log(`- 元数据框架文件: ${stats.frameworkFilesInMetadata}`);
        console.log(`- 版本一致性: ${stats.versionConsistency ? '✅' : '❌'}`);
        console.log(`- 架构合理性: ${stats.architectureValid ? '✅' : '❌'}`);
        console.log(`- 配置一致性: ${stats.configurationConsistent ? '✅' : '❌'}`);
        console.log(`- 冗余度比例: ${(stats.redundancyLevel * 100).toFixed(1)}%`);

        // 生成理论统计数据
        const theoryStats = await theoryStatistics.generateStatistics(theoretical_framework);
        const theoryCheckpoints = await theoryStatistics.generateCheckpoints(theoretical_framework);
        const theoryDisplay = await theoryStatistics.generateDisplay(theoretical_framework);
        
        // 使用公共组件生成详细报告
        const allStats = {
            redundancy: {
                theoreticalFramework: tfRedundancy ? {
                    referencedFiles: tfRedundancy.referenced_files.length,
                    crossReferences: Object.keys(tfRedundancy.cross_references).length
                } : null,
                readingExperience: reRedundancy ? {
                    referencedFiles: reRedundancy.referenced_files.length
                } : null,
                mappings: mapRedundancy ? {
                    referencedFiles: mapRedundancy.referenced_files.length
                } : null,
                architecture: {
                    isValid: stats.architectureValid,
                    issues: architectureIssues
                },
                consistency: {
                    isValid: stats.configurationConsistent,
                    issues: consistencyIssues
                },
                redundancyLevel: redundancyResult.stats
            },
            statistics: {
                theory: theoryStats,
                checkpoints: theoryCheckpoints,
                display: theoryDisplay
            },
            validation: {
                issues: issues,
                warnings: warnings,
                isValid: issues.length === 0
            },
            version: versionResult,
            framework: frameworkFileResult
        };
        
        const report = reportGenerator.generateReport(allStats, 'controlled_redundancy_template', {
            title: '毛小豆宇宙受控冗余机制验证报告',
            includeValidation: true,
            includeDetails: true
        });

        // 验证通过标志
        const isValid = issues.length === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 受控冗余机制验证${isValid ? '通过' : '失败'}`);
        
        return {
            isValid: isValid,
            issues: issues,
            warnings: warnings,
            statistics: stats,
            theoryStats: theoryStats,
            theoryCheckpoints: theoryCheckpoints,
            theoryDisplay: theoryDisplay,
            redundancyStats: allStats.redundancy,
            versionResult: versionResult,
            frameworkFileResult: frameworkFileResult,
            architectureIssues: architectureIssues,
            consistencyIssues: consistencyIssues,
            redundancyResult: redundancyResult
        };

    } catch (error) {
        console.error('❌ 受控冗余机制验证失败:', error.message);
        return {
            isValid: false,
            error: error.message
        };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateControlledRedundancy();
}

module.exports = { validateControlledRedundancy }; 