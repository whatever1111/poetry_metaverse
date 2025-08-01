/**
 * 毛小豆宇宙深度交叉引用验证脚本 (优化版)
 * 使用公共工具模块，消除重复代码
 */
const { dataLoader } = require('../components/data_loader.cjs');

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
    
    // 检查目标文件是否存在
    if (!targetData[fileName]) {
        issues.push(`❌ 交叉引用 "${refName}" 指向的文件 "${fileName}" 不存在`);
        return { issues, warnings };
    }
    
    // 获取目标数据
    const targetValue = getNestedValue(targetData[fileName], fieldPath.join('.'));
    
    if (targetValue === undefined) {
        issues.push(`❌ 交叉引用 "${refName}" 的路径 "${pathString}" 无效`);
        return { issues, warnings };
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
                // 检查是否是ID引用
                if (targetKeys.includes(obj)) {
                    foundReferences++;
                    console.log(`    [DEBUG] 找到有效引用: "${obj}" 在路径 "${path}"`);
                } else if (obj.includes('_') && targetKeys.some(key => key.includes(obj.split('_')[0]))) {
                    warnings.push(`⚠️ 可能的ID引用 "${obj}" 在路径 "${path}" 中，但目标数据中没有完全匹配`);
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const [key, value] of Object.entries(obj)) {
                    findReferences(value, path ? `${path}.${key}` : key);
                }
            }
        };
        
        findReferences(sourceValue, sourceKey);
    }
    
    if (foundReferences === 0) {
        warnings.push(`⚠️ 交叉引用 "${refName}" 在源数据中未找到任何有效的ID引用`);
    }
    
    return { issues, warnings, foundReferences, targetKeysCount: targetKeys.length };
}

async function validateDeepCrossReferences() {
    console.log('🔍 开始深度交叉引用校验...\n');
    
    try {
        // 使用公共工具加载所有数据文件
        console.log('📋 读取数据文件...');
        const dataObjects = await dataLoader.loadAllDataFiles();
        
        const allIssues = [];
        const allWarnings = [];
        const stats = {
            totalCrossReferences: 0,
            validCrossReferences: 0,
            invalidCrossReferences: 0,
            totalReferencesFound: 0
        };
        
        // 验证理论框架的交叉引用
        console.log('\n📋 验证理论框架的交叉引用...');
        const tfData = dataObjects['theoretical_framework.json'];
        if (tfData && tfData.theoretical_framework.controlled_redundancy) {
            const crossRefs = tfData.theoretical_framework.controlled_redundancy.cross_references;
            
            for (const [refName, pathString] of Object.entries(crossRefs)) {
                stats.totalCrossReferences++;
                console.log(`  - 检查引用: ${refName} -> ${pathString}`);
                
                // 对于理论框架，检查整个theoretical_framework对象，而不仅仅是theories
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
        
        // 验证映射文件的交叉引用
        console.log('\n📋 验证映射文件的交叉引用...');
        const mappingsData = dataObjects['mappings.json'];
        if (mappingsData && mappingsData.metadata.controlled_redundancy) {
            const crossRefs = mappingsData.metadata.controlled_redundancy.cross_references;
            
            for (const [refName, pathString] of Object.entries(crossRefs)) {
                stats.totalCrossReferences++;
                console.log(`  - 检查引用: ${refName} -> ${pathString}`);
                
                // 对于映射文件，检查整个mappings对象
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
        
        if (stats.totalCrossReferences > 0) {
            const successRate = ((stats.validCrossReferences / stats.totalCrossReferences) * 100).toFixed(1);
            console.log(`- 成功率: ${successRate}%`);
        }
        
        // 验证通过标志
        const isValid = allIssues.length === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 深度交叉引用校验${isValid ? '通过' : '失败'}`);
        
        return isValid;
        
    } catch (error) {
        console.error('❌ 深度交叉引用校验失败:', error.message);
        return false;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateDeepCrossReferences();
}

module.exports = { validateDeepCrossReferences }; 