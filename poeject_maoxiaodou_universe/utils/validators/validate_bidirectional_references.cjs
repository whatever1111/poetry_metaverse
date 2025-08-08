/**
 * 毛小豆宇宙双向引用一致性验证脚本
 * 专门验证两个数据类型之间的双向引用关系
 */
const { dataLoader } = require('../components/data_loader.cjs');

/**
 * 从characters.json中提取所有角色ID
 */
function extractCharacterIds(charactersData) {
    const ids = new Set();
    
    if (charactersData.characters) {
        Object.values(charactersData.characters).forEach(category => {
            if (Array.isArray(category)) {
                category.forEach(character => {
                    if (character.id) {
                        ids.add(character.id);
                    }
                });
            }
        });
    }
    
    return Array.from(ids);
}

/**
 * 从poems.json中提取所有诗歌ID
 */
function extractPoemIds(poemsData) {
    const ids = new Set();
    
    if (poemsData.poems && Array.isArray(poemsData.poems)) {
        poemsData.poems.forEach(poem => {
            if (poem.id) {
                ids.add(poem.id);
            }
        });
    }
    
    return Array.from(ids);
}

/**
 * 验证双向引用一致性
 * @param {string} sourceType - 源数据类型
 * @param {Array} sourceData - 源数据
 * @param {string} targetType - 目标数据类型
 * @param {Array} targetData - 目标数据
 * @param {Object} referenceConfig - 引用配置
 * @returns {Object} 验证结果
 */
function validateBidirectionalReferences(sourceType, sourceData, targetType, targetData, referenceConfig) {
    const errors = [];
    const warnings = [];
    
    // 构建目标数据的索引
    const targetIndex = {};
    targetData.forEach(item => {
        if (referenceConfig.targetKey in item) {
            const key = item[referenceConfig.targetKey];
            if (!targetIndex[key]) {
                targetIndex[key] = [];
            }
            targetIndex[key].push(item.id);
        }
    });
    
    // 验证源数据中的引用
    sourceData.forEach(sourceItem => {
        if (referenceConfig.sourceArray in sourceItem && Array.isArray(sourceItem[referenceConfig.sourceArray])) {
            sourceItem[referenceConfig.sourceArray].forEach(targetRef => {
                // 处理对象引用（如诗歌中的角色对象）和简单ID引用
                const targetId = typeof targetRef === 'object' ? targetRef.id : targetRef;
                if (targetId && !targetIndex[targetId]) {
                    errors.push(`${sourceType}${sourceItem.id}引用的${targetType}ID不存在: ${targetId}`);
                }
            });
        }
    });
    
    // 验证双向引用一致性
    if (referenceConfig.bidirectional) {
        sourceData.forEach(sourceItem => {
            if (referenceConfig.sourceKey in sourceItem) {
                const sourceKey = sourceItem[referenceConfig.sourceKey];
                const expectedTargets = targetIndex[sourceKey] || [];
                
                targetData.forEach(targetItem => {
                    if (referenceConfig.targetArray in targetItem && Array.isArray(targetItem[referenceConfig.targetArray])) {
                        if (targetItem[referenceConfig.targetArray].includes(sourceItem.id)) {
                            if (!expectedTargets.includes(targetItem.id)) {
                                warnings.push(`${targetType}${targetItem.id}引用的${sourceType}${sourceItem.id}的${referenceConfig.sourceKey}不匹配`);
                            }
                        }
                    }
                });
            }
        });
    }
    
    return { errors, warnings };
}

/**
 * 验证场景与诗歌的双向引用一致性
 */
async function validateScenePoemBidirectionalReferences() {
    console.log('🔍 开始验证场景与诗歌的双向引用一致性...');
    
    try {
        // 使用公共工具加载数据文件
        const dataObjects = await dataLoader.loadCoreDataFiles();
        const scenesData = dataObjects['scenes.json'];
        const poemsData = dataObjects['poems.json'];
        
        // 验证scenes.json的基本结构
        if (!scenesData.metadata || !scenesData.scenes) {
            console.log('❌ scenes.json缺少必要的metadata或scenes字段');
            return { isValid: false, errors: ['scenes.json缺少必要的metadata或scenes字段'] };
        }
        
        // 验证场景与诗歌的双向引用一致性
        const bidirectionalValidation = validateBidirectionalReferences(
            '场景', scenesData.scenes, '诗歌', poemsData.poems,
            {
                sourceKey: 'poem_id',
                sourceArray: 'locations',
                targetKey: 'id',
                targetArray: 'locations',
                bidirectional: true
            }
        );
        
        // 输出结果
        if (bidirectionalValidation.errors.length === 0) {
            console.log('✅ 场景与诗歌双向引用一致性验证通过');
            
            if (bidirectionalValidation.warnings.length > 0) {
                console.log(`\n⚠️  警告: ${bidirectionalValidation.warnings.length}个`);
                bidirectionalValidation.warnings.forEach(warning => console.log(`   - ${warning}`));
            }
            
            return {
                isValid: true,
                totalScenes: scenesData.scenes.length,
                totalPoems: poemsData.poems.length,
                errors: [],
                warnings: bidirectionalValidation.warnings
            };
        } else {
            console.log('❌ 场景与诗歌双向引用一致性验证失败');
            console.log(`错误: ${bidirectionalValidation.errors.length}个`);
            bidirectionalValidation.errors.forEach(error => console.log(`  - ${error}`));
            
            if (bidirectionalValidation.warnings.length > 0) {
                console.log(`警告: ${bidirectionalValidation.warnings.length}个`);
                bidirectionalValidation.warnings.forEach(warning => console.log(`  - ${warning}`));
            }
            
            return {
                isValid: false,
                errors: bidirectionalValidation.errors,
                warnings: bidirectionalValidation.warnings
            };
        }
        
    } catch (error) {
        console.error('❌ 场景与诗歌双向引用一致性验证失败:', error.message);
        return {
            isValid: false,
            errors: [error.message]
        };
    }
}

/**
 * 验证诗歌与主题的双向引用一致性
 */
async function validatePoemThemeBidirectionalReferences() {
    console.log('🔍 开始验证诗歌与主题的双向引用一致性...');
    
    try {
        // 使用公共工具加载数据文件
        const dataObjects = await dataLoader.loadCoreDataFiles();
        const poemsData = dataObjects['poems.json'];
        const themesData = dataObjects['themes.json'];
        
        // 验证诗歌与主题的双向引用一致性
        const bidirectionalValidation = validateBidirectionalReferences(
            '诗歌', poemsData.poems, '主题', themesData.themes,
            {
                sourceKey: 'id',
                sourceArray: 'themes',
                targetKey: 'id',
                targetArray: 'related_poems',
                bidirectional: true
            }
        );
        
        // 输出结果
        if (bidirectionalValidation.errors.length === 0) {
            console.log('✅ 诗歌与主题双向引用一致性验证通过');
            
            if (bidirectionalValidation.warnings.length > 0) {
                console.log(`\n⚠️  警告: ${bidirectionalValidation.warnings.length}个`);
                bidirectionalValidation.warnings.forEach(warning => console.log(`   - ${warning}`));
            }
            
            return {
                isValid: true,
                totalPoems: poemsData.poems.length,
                totalThemes: themesData.themes.length,
                errors: [],
                warnings: bidirectionalValidation.warnings
            };
        } else {
            console.log('❌ 诗歌与主题双向引用一致性验证失败');
            console.log(`错误: ${bidirectionalValidation.errors.length}个`);
            bidirectionalValidation.errors.forEach(error => console.log(`  - ${error}`));
            
            if (bidirectionalValidation.warnings.length > 0) {
                console.log(`警告: ${bidirectionalValidation.warnings.length}个`);
                bidirectionalValidation.warnings.forEach(warning => console.log(`  - ${warning}`));
            }
            
            return {
                isValid: false,
                errors: bidirectionalValidation.errors,
                warnings: bidirectionalValidation.warnings
            };
        }
        
    } catch (error) {
        console.error('❌ 诗歌与主题双向引用一致性验证失败:', error.message);
        return {
            isValid: false,
            errors: [error.message]
        };
    }
}

/**
 * 验证诗歌与角色的双向引用一致性
 */
async function validatePoemCharacterBidirectionalReferences() {
    console.log('🔍 开始验证诗歌与角色的双向引用一致性...');
    
    try {
        // 使用公共工具加载数据文件
        const dataObjects = await dataLoader.loadCoreDataFiles();
        const poemsData = dataObjects['poems.json'];
        const charactersData = dataObjects['characters.json'];
        
        // 提取所有ID列表
        const allCharacterIds = extractCharacterIds(charactersData);
        const allPoemIds = extractPoemIds(poemsData);
        
        // 验证诗歌与角色的双向引用一致性
        const bidirectionalValidation = validateBidirectionalReferences(
            '诗歌', poemsData.poems, '角色', Object.values(charactersData.characters).flat(),
            {
                sourceKey: 'id',
                sourceArray: 'characters',
                targetKey: 'id',
                targetArray: 'appearances',
                bidirectional: true
            }
        );
        
        // 输出结果
        if (bidirectionalValidation.errors.length === 0) {
            console.log('✅ 诗歌与角色双向引用一致性验证通过');
            
            if (bidirectionalValidation.warnings.length > 0) {
                console.log(`\n⚠️  警告: ${bidirectionalValidation.warnings.length}个`);
                bidirectionalValidation.warnings.forEach(warning => console.log(`   - ${warning}`));
            }
            
            return {
                isValid: true,
                totalPoems: poemsData.poems.length,
                totalCharacters: allCharacterIds.length,
                errors: [],
                warnings: bidirectionalValidation.warnings
            };
        } else {
            console.log('❌ 诗歌与角色双向引用一致性验证失败');
            console.log(`错误: ${bidirectionalValidation.errors.length}个`);
            bidirectionalValidation.errors.forEach(error => console.log(`  - ${error}`));
            
            if (bidirectionalValidation.warnings.length > 0) {
                console.log(`警告: ${bidirectionalValidation.warnings.length}个`);
                bidirectionalValidation.warnings.forEach(warning => console.log(`  - ${warning}`));
            }
            
            return {
                isValid: false,
                errors: bidirectionalValidation.errors,
                warnings: bidirectionalValidation.warnings
            };
        }
        
    } catch (error) {
        console.error('❌ 诗歌与角色双向引用一致性验证失败:', error.message);
        return {
            isValid: false,
            errors: [error.message]
        };
    }
}

/**
 * 验证所有双向引用一致性
 */
async function validateAllBidirectionalReferences() {
    console.log('🔍 开始验证所有双向引用一致性...\n');
    
    const results = {};
    
    // 验证场景与诗歌的双向引用一致性
    results.scenePoem = await validateScenePoemBidirectionalReferences();
    console.log('');
    
    // 验证诗歌与角色的双向引用一致性
    results.poemCharacter = await validatePoemCharacterBidirectionalReferences();
    console.log('');
    
    // 验证诗歌与主题的双向引用一致性
    results.poemTheme = await validatePoemThemeBidirectionalReferences();
    console.log('');
    
    // 汇总结果
    const allValid = Object.values(results).every(result => result.isValid);
    const totalErrors = Object.values(results).reduce((sum, result) => sum + (result.errors?.length || 0), 0);
    const totalWarnings = Object.values(results).reduce((sum, result) => sum + (result.warnings?.length || 0), 0);
    
    console.log('📊 双向引用一致性验证汇总:');
    console.log(`  ✅ 通过: ${Object.values(results).filter(r => r.isValid).length} 项`);
    console.log(`  ❌ 失败: ${Object.values(results).filter(r => !r.isValid).length} 项`);
    console.log(`  📝 总错误: ${totalErrors} 个`);
    console.log(`  ⚠️  总警告: ${totalWarnings} 个`);
    
    if (allValid) {
        console.log('\n🎉 所有双向引用一致性验证通过！');
    } else {
        console.log('\n❌ 存在双向引用一致性验证失败');
    }
    
    return {
        isValid: allValid,
        results: results,
        totalErrors: totalErrors,
        totalWarnings: totalWarnings
    };
}

// 如果直接运行此脚本
if (require.main === module) {
    validateAllBidirectionalReferences();
}

module.exports = { 
    validateBidirectionalReferences,
    validateScenePoemBidirectionalReferences,
    validatePoemCharacterBidirectionalReferences,
    validatePoemThemeBidirectionalReferences,
    validateAllBidirectionalReferences
}; 