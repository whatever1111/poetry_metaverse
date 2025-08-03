/**
 * 毛小豆宇宙深度交叉引用验证脚本 (重构版)
 * 使用公共组件模块，消除重复代码
 * 专注验证交叉引用的实际有效性和质量
 */
const { dataLoader } = require('../components/data_loader.cjs');
const { ReportGenerator } = require('../components/report_generator.cjs');
const { DataDisplay } = require('../components/data_display.cjs');
const { TheoryStatistics } = require('../components/theory_statistics.cjs');
const { CharacterStatistics } = require('../components/character_statistics.cjs');
const { PoemStatistics } = require('../components/poem_statistics.cjs');
const { ThemeStatistics } = require('../components/theme_statistics.cjs');
const { TerminologyStatistics } = require('../components/terminology_statistics.cjs');

/**
 * 根据路径字符串获取嵌套对象的值
 * @param {Object} obj - 要查询的对象
 * @param {string} pathString - 路径字符串，如 "characters.json.characters.core"
 * @returns {any} 路径指向的值
 */
function getNestedValue(obj, pathString) {
    const keys = pathString.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    
    return current;
}

/**
 * 检查引用是否被实际使用
 * @param {Object} sourceData - 源数据对象
 * @param {Object} targetValue - 目标数据值
 * @returns {boolean} 是否被使用
 */
function checkReferenceUsage(sourceData, targetValue) {
    const targetKeys = Object.keys(targetValue);
    let isUsed = false;
    
    // 递归查找源数据中是否引用了目标数据的键
    const findReferences = (obj) => {
        if (typeof obj === 'string') {
            if (targetKeys.includes(obj)) {
                isUsed = true;
                return true;
            }
        } else if (Array.isArray(obj)) {
            obj.forEach(item => findReferences(item));
        } else if (obj && typeof obj === 'object') {
            Object.values(obj).forEach(value => findReferences(value));
        }
    };
    
    findReferences(sourceData);
    return isUsed;
}

/**
 * 验证所有预期的引用是否都被实际使用
 * @param {Object} sourceData - 源数据对象
 * @param {Object} targetData - 目标数据对象
 * @param {Object} crossReferences - 交叉引用配置
 * @returns {Array} 未使用的引用列表
 */
function validateReferenceCompleteness(sourceData, targetData, crossReferences) {
    const unusedReferences = [];
    
    for (const [refName, pathString] of Object.entries(crossReferences)) {
        const targetValue = getNestedValue(targetData, pathString);
        if (targetValue) {
            const isUsed = checkReferenceUsage(sourceData, targetValue);
            if (!isUsed) {
                unusedReferences.push(refName);
            }
        }
    }
    
    return unusedReferences;
}

/**
 * 评估引用的质量和相关性
 * @param {Object} sourceData - 源数据对象
 * @param {Object} targetData - 目标数据对象
 * @param {Object} crossReferences - 交叉引用配置
 * @returns {Object} 引用质量指标
 */
function evaluateReferenceQuality(sourceData, targetData, crossReferences) {
    const qualityMetrics = {
        totalReferences: 0,
        highQualityRefs: 0,
        mediumQualityRefs: 0,
        lowQualityRefs: 0,
        averageQuality: 0,
        referenceFrequency: {},
        referenceRelevance: {}
    };
    
    // 确保crossReferences是有效的对象
    if (!crossReferences || typeof crossReferences !== 'object') {
        return qualityMetrics;
    }
    
    for (const [refName, pathString] of Object.entries(crossReferences)) {
        const targetValue = getNestedValue(targetData, pathString);
        if (targetValue && typeof targetValue === 'object') {
            qualityMetrics.totalReferences++;
            
            // 计算引用频率
            const usageCount = countReferenceUsage(sourceData, targetValue);
            qualityMetrics.referenceFrequency[refName] = usageCount;
            
            // 评估引用相关性
            const relevance = calculateReferenceRelevance(sourceData, targetValue);
            qualityMetrics.referenceRelevance[refName] = relevance;
            
            // 根据频率和相关性评估质量
            if (usageCount > 5 && relevance > 0.7) {
                qualityMetrics.highQualityRefs++;
            } else if (usageCount > 2 && relevance > 0.4) {
                qualityMetrics.mediumQualityRefs++;
            } else {
                qualityMetrics.lowQualityRefs++;
            }
        }
    }
    
    // 计算平均质量
    if (qualityMetrics.totalReferences > 0) {
        qualityMetrics.averageQuality = qualityMetrics.highQualityRefs / qualityMetrics.totalReferences;
    }
    
    return qualityMetrics;
}

/**
 * 计算引用使用频率
 * @param {Object} sourceData - 源数据对象
 * @param {Object} targetValue - 目标数据值
 * @returns {number} 使用频率
 */
function countReferenceUsage(sourceData, targetValue) {
    const targetKeys = Object.keys(targetValue);
    let usageCount = 0;
    
    const countReferences = (obj) => {
        if (typeof obj === 'string') {
            if (targetKeys.includes(obj)) {
                usageCount++;
            }
        } else if (Array.isArray(obj)) {
            obj.forEach(item => countReferences(item));
        } else if (obj && typeof obj === 'object') {
            Object.values(obj).forEach(value => countReferences(value));
        }
    };
    
    countReferences(sourceData);
    return usageCount;
}

/**
 * 计算引用相关性
 * @param {Object} sourceData - 源数据对象
 * @param {Object} targetValue - 目标数据值
 * @returns {number} 相关性分数 (0-1)
 */
function calculateReferenceRelevance(sourceData, targetValue) {
    const targetKeys = Object.keys(targetValue);
    const sourceKeys = Object.keys(sourceData);
    
    if (targetKeys.length === 0 || sourceKeys.length === 0) {
        return 0;
    }
    
    // 计算键的匹配度
    const matchingKeys = targetKeys.filter(key => sourceKeys.includes(key));
    const relevance = matchingKeys.length / Math.max(targetKeys.length, sourceKeys.length);
    
    return relevance;
}

/**
 * 检测循环引用
 * @param {Object} crossReferences - 交叉引用配置
 * @returns {Array} 循环引用列表
 */
function detectCircularReferences(crossReferences) {
    const issues = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    function dfs(refName, path) {
        if (recursionStack.has(refName)) {
            issues.push(`❌ 发现循环引用: ${path.join(' -> ')} -> ${refName}`);
            return;
        }
        
        if (visited.has(refName)) {
            return;
        }
        
        visited.add(refName);
        recursionStack.add(refName);
        
        // 递归检查引用链
        const targetRefs = crossReferences[refName];
        if (targetRefs) {
            for (const targetRef of Object.keys(targetRefs)) {
                dfs(targetRef, [...path, refName]);
            }
        }
        
        recursionStack.delete(refName);
    }
    
    for (const refName of Object.keys(crossReferences)) {
        if (!visited.has(refName)) {
            dfs(refName, []);
        }
    }
    
    return issues;
}

/**
 * 验证单个交叉引用的有效性
 * @param {Object} sourceData - 源数据对象
 * @param {Object} targetData - 目标数据对象
 * @param {string} refName - 引用名称
 * @param {string} pathString - 路径字符串
 * @param {string} sourceFile - 源文件名
 * @returns {Object} 验证结果
 */
function validateSingleCrossReference(sourceData, targetData, refName, pathString, sourceFile) {
    const issues = [];
    const warnings = [];
    
    // 解析路径 - 正确处理包含.json的文件名
    let fileName, fieldPath;
    if (pathString.startsWith('mappings.json.')) {
        fileName = 'mappings.json';
        fieldPath = pathString.substring('mappings.json.'.length).split('.');
    } else if (pathString.startsWith('reading_experience.json.')) {
        fileName = 'reading_experience.json';
        fieldPath = pathString.substring('reading_experience.json.'.length).split('.');
    } else if (pathString.startsWith('theoretical_framework.json.')) {
        fileName = 'theoretical_framework.json';
        fieldPath = pathString.substring('theoretical_framework.json.'.length).split('.');
    } else if (pathString.startsWith('characters.json.')) {
        fileName = 'characters.json';
        fieldPath = pathString.substring('characters.json.'.length).split('.');
    } else if (pathString.startsWith('poems.json.')) {
        fileName = 'poems.json';
        fieldPath = pathString.substring('poems.json.'.length).split('.');
    } else if (pathString.startsWith('terminology.json.')) {
        fileName = 'terminology.json';
        fieldPath = pathString.substring('terminology.json.'.length).split('.');
    } else if (pathString.startsWith('themes.json.')) {
        fileName = 'themes.json';
        fieldPath = pathString.substring('themes.json.'.length).split('.');
    } else {
        // 通用处理
        const pathParts = pathString.split('.');
        fileName = pathParts[0];
        fieldPath = pathParts.slice(1);
    }
    
    // 检查目标文件是否存在 - 修复：适配数据加载器返回的对象结构
    const targetFileData = targetData[fileName];
    if (!targetFileData) {
        issues.push(`❌ 交叉引用 "${refName}" 指向的文件 "${fileName}" 不存在`);
        return { issues, warnings, foundReferences: 0, targetKeysCount: 0 };
    }
    
    // 获取目标数据
    const targetValue = getNestedValue(targetFileData, fieldPath.join('.'));
    
    if (targetValue === undefined) {
        issues.push(`❌ 交叉引用 "${refName}" 的路径 "${pathString}" 无效`);
        return { issues, warnings, foundReferences: 0, targetKeysCount: 0 };
    }
    
    // 检查源数据中是否有引用目标数据的ID
    const sourceKeys = Object.keys(sourceData);
    const targetKeys = Object.keys(targetValue);
    
    // 查找可能的引用关系
    let foundReferences = 0;
    let invalidReferences = 0;
    
    for (const sourceKey of sourceKeys) {
        const sourceValue = sourceData[sourceKey];
        
        // 递归查找所有可能的ID引用
        const findReferences = (obj, path = '') => {
            if (typeof obj === 'string') {
                // 检查字符串是否匹配目标键
                if (targetKeys.includes(obj)) {
                    foundReferences++;
                    return true;
                }
            } else if (Array.isArray(obj)) {
                // 检查数组中的每个元素
                obj.forEach((item, index) => {
                    findReferences(item, `${path}[${index}]`);
                });
            } else if (obj && typeof obj === 'object') {
                // 检查对象的所有属性
                Object.entries(obj).forEach(([key, value]) => {
                    findReferences(value, path ? `${path}.${key}` : key);
                });
            }
        };
        
        findReferences(sourceValue, sourceKey);
    }
    
    return { 
        issues, 
        warnings, 
        foundReferences, 
        targetKeysCount: targetKeys.length 
    };
}

/**
 * 验证深度交叉引用
 */
async function validateDeepCrossReferences() {
    try {
        console.log('🔍 开始深度交叉引用验证...');
        
        // 使用公共工具加载所有数据文件 - 修复：使用loadAllDataFiles而不是loadTheoryFrameworkFiles
        const dataObjects = await dataLoader.loadAllDataFiles();
        
        // 使用公共组件进行统计和报告生成
        const theoryStatistics = new TheoryStatistics(dataLoader);
        const characterStatistics = new CharacterStatistics(dataLoader);
        const poemStatistics = new PoemStatistics(dataLoader);
        const themeStatistics = new ThemeStatistics(dataLoader);
        const terminologyStatistics = new TerminologyStatistics(dataLoader);
        const reportGenerator = new ReportGenerator();
        const dataDisplay = new DataDisplay();
        
        let allIssues = [];
        let allWarnings = [];
        
        const stats = {
            totalCrossReferences: 0,
            validCrossReferences: 0,
            invalidCrossReferences: 0,
            totalReferencesFound: 0,
            unusedReferences: 0,
            circularReferences: 0,
            averageQuality: 0
        };
        
        // 收集所有交叉引用配置
        const allCrossReferences = {};
        
        // 验证理论框架的交叉引用
        console.log('📋 验证理论框架的交叉引用...');
        const tfData = dataObjects['theoretical_framework.json'];
        if (tfData && tfData.theoretical_framework.controlled_redundancy) {
            const crossRefs = tfData.theoretical_framework.controlled_redundancy.cross_references;
            allCrossReferences['theoretical_framework'] = crossRefs;
            
            for (const [refName, pathString] of Object.entries(crossRefs)) {
                stats.totalCrossReferences++;
                console.log(`  - 检查引用: ${refName} -> ${pathString}`);
                
                const result = validateSingleCrossReference(
                    tfData.theoretical_framework,
                    dataObjects,
                    refName,
                    pathString,
                    'theoretical_framework.json'
                );
                
                allIssues.push(...result.issues);
                allWarnings.push(...result.warnings);
                
                if (result.issues.length === 0) {
                    stats.validCrossReferences++;
                    if (result.foundReferences > 0) {
                        stats.totalReferencesFound += result.foundReferences;
                        console.log(`    ✅ 找到 ${result.foundReferences} 个有效引用 (目标数据: ${result.targetKeysCount} 项)`);
                    }
                } else {
                    stats.invalidCrossReferences++;
                }
            }
        }
        
        // 验证映射的交叉引用
        console.log('\n📋 验证映射的交叉引用...');
        const mappingsData = dataObjects['mappings.json'];
        if (mappingsData && mappingsData.metadata.controlled_redundancy) {
            const crossRefs = mappingsData.metadata.controlled_redundancy.cross_references;
            allCrossReferences['mappings'] = crossRefs;
            
            for (const [refName, pathString] of Object.entries(crossRefs)) {
                stats.totalCrossReferences++;
                console.log(`  - 检查引用: ${refName} -> ${pathString}`);
                
                const result = validateSingleCrossReference(
                    mappingsData,
                    dataObjects,
                    refName,
                    pathString,
                    'mappings.json'
                );
                
                allIssues.push(...result.issues);
                allWarnings.push(...result.warnings);
                
                if (result.issues.length === 0) {
                    stats.validCrossReferences++;
                    if (result.foundReferences > 0) {
                        stats.totalReferencesFound += result.foundReferences;
                        console.log(`    ✅ 找到 ${result.foundReferences} 个有效引用 (目标数据: ${result.targetKeysCount} 项)`);
                    }
                } else {
                    stats.invalidCrossReferences++;
                }
            }
        }
        
        // 验证阅读体验的交叉引用
        console.log('\n📋 验证阅读体验的交叉引用...');
        const reData = dataObjects['reading_experience.json'];
        if (reData && reData.reading_experience.controlled_redundancy) {
            const crossRefs = reData.reading_experience.controlled_redundancy.cross_references;
            allCrossReferences['reading_experience'] = crossRefs;
            
            for (const [refName, pathString] of Object.entries(crossRefs)) {
                stats.totalCrossReferences++;
                console.log(`  - 检查引用: ${refName} -> ${pathString}`);
                
                // 对于阅读体验，检查整个reading_experience对象
                const result = validateSingleCrossReference(
                    reData.reading_experience,
                    dataObjects,
                    refName,
                    pathString,
                    'reading_experience.json'
                );
                
                allIssues.push(...result.issues);
                allWarnings.push(...result.warnings);
                
                if (result.issues.length === 0) {
                    stats.validCrossReferences++;
                    if (result.foundReferences > 0) {
                        stats.totalReferencesFound += result.foundReferences;
                        console.log(`    ✅ 找到 ${result.foundReferences} 个有效引用 (目标数据: ${result.targetKeysCount} 项)`);
                    }
                } else {
                    stats.invalidCrossReferences++;
                }
            }
        }
        
        // 新增：引用完整性验证
        console.log('\n📋 验证引用完整性...');
        for (const [sourceFile, sourceData] of Object.entries(dataObjects)) {
            if (sourceData.controlled_redundancy) {
                const unusedRefs = validateReferenceCompleteness(
                    sourceData, 
                    dataObjects, 
                    sourceData.controlled_redundancy.cross_references
                );
                
                if (unusedRefs.length > 0) {
                    allIssues.push(`❌ ${sourceFile} 中存在未使用的交叉引用: ${unusedRefs.join(', ')}`);
                    stats.unusedReferences += unusedRefs.length;
                }
            }
        }
        
        // 新增：引用质量评估
        console.log('\n📋 评估引用质量...');
        const qualityMetrics = evaluateReferenceQuality(dataObjects, allCrossReferences);
        stats.averageQuality = qualityMetrics.averageQuality;
        
        console.log(`  - 高质量引用: ${qualityMetrics.highQualityRefs}`);
        console.log(`  - 中等质量引用: ${qualityMetrics.mediumQualityRefs}`);
        console.log(`  - 低质量引用: ${qualityMetrics.lowQualityRefs}`);
        console.log(`  - 平均质量: ${(qualityMetrics.averageQuality * 100).toFixed(1)}%`);
        
        // 新增：循环引用检测
        console.log('\n📋 检测循环引用...');
        const circularIssues = detectCircularReferences(allCrossReferences);
        allIssues.push(...circularIssues);
        stats.circularReferences = circularIssues.length;
        
        if (circularIssues.length > 0) {
            console.log(`  ❌ 发现 ${circularIssues.length} 个循环引用`);
        } else {
            console.log(`  ✅ 未发现循环引用`);
        }
        
        // 输出结果
        console.log('\n📊 深度交叉引用校验结果:');
        if (allIssues.length === 0) {
            console.log('✅ 所有交叉引用校验通过！');
        } else {
            console.log(`❌ 发现 ${allIssues.length} 个问题:`);
            allIssues.forEach(issue => console.log(`  ${issue}`));
        }
        
        if (allWarnings.length > 0) {
            console.log(`\n⚠️ 发现 ${allWarnings.length} 个警告:`);
            allWarnings.forEach(warning => console.log(`  ${warning}`));
        }
        
        // 输出统计信息
        console.log('\n📈 交叉引用统计:');
        console.log(`- 总交叉引用数: ${stats.totalCrossReferences}`);
        console.log(`- 有效交叉引用: ${stats.validCrossReferences}`);
        console.log(`- 无效交叉引用: ${stats.invalidCrossReferences}`);
        console.log(`- 找到的有效引用: ${stats.totalReferencesFound}`);
        console.log(`- 未使用的引用: ${stats.unusedReferences}`);
        console.log(`- 循环引用: ${stats.circularReferences}`);
        console.log(`- 平均质量: ${(stats.averageQuality * 100).toFixed(1)}%`);
        
        if (stats.totalCrossReferences > 0) {
            const successRate = ((stats.validCrossReferences / stats.totalCrossReferences) * 100).toFixed(1);
            console.log(`- 成功率: ${successRate}%`);
        }
        
        // 生成各类型统计数据
        const theoryStats = await theoryStatistics.generateStatistics(tfData);
        const characterStats = await characterStatistics.generateStatistics(dataObjects['characters.json']);
        const poemStats = await poemStatistics.generateStatistics(dataObjects['poems.json']);
        const themeStats = await themeStatistics.generateStatistics(dataObjects['themes.json']);
        const terminologyStats = await terminologyStatistics.generateStatistics(dataObjects['terminology.json']);
        
        // 使用公共组件生成详细报告
        const allStats = {
            crossReferences: stats,
            qualityMetrics: qualityMetrics,
            statistics: {
                theory: theoryStats,
                characters: characterStats,
                poems: poemStats,
                themes: themeStats,
                terminology: terminologyStats
            },
            validation: {
                issues: allIssues,
                warnings: allWarnings,
                isValid: allIssues.length === 0
            },
            details: {
                theoreticalFramework: tfData ? {
                    crossReferences: Object.keys(tfData.theoretical_framework.controlled_redundancy?.cross_references || {}).length
                } : null,
                mappings: mappingsData ? {
                    crossReferences: Object.keys(mappingsData.metadata.controlled_redundancy?.cross_references || {}).length
                } : null,
                readingExperience: reData ? {
                    crossReferences: Object.keys(reData.reading_experience.controlled_redundancy?.cross_references || {}).length
                } : null
            }
        };
        
        const report = reportGenerator.generateReport(allStats, 'deep_cross_references_template', {
            title: '毛小豆宇宙深度交叉引用验证报告',
            includeValidation: true,
            includeDetails: true
        });

        // 验证通过标志
        const isValid = allIssues.length === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 深度交叉引用校验${isValid ? '通过' : '失败'}`);
        
        return {
            isValid: isValid,
            issues: allIssues,
            warnings: allWarnings,
            statistics: stats,
            qualityMetrics: qualityMetrics,
            theoryStats: theoryStats,
            characterStats: characterStats,
            poemStats: poemStats,
            themeStats: themeStats,
            terminologyStats: terminologyStats,
            crossReferenceStats: allStats.crossReferences,
            details: allStats.details
        };
        
    } catch (error) {
        console.error('❌ 深度交叉引用校验失败:', error.message);
        return {
            isValid: false,
            error: error.message
        };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateDeepCrossReferences();
}

module.exports = { validateDeepCrossReferences }; 