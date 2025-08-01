/**
 * 毛小豆宇宙场景数据验证脚本 (重构版)
 * 使用公共工具模块，消除重复代码
 * 整合场景统计报告功能
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
 * 从terminology.json中提取所有术语ID
 */
function extractTerminologyIds(terminologyData) {
    const ids = new Set();
    
    if (terminologyData.terminology && Array.isArray(terminologyData.terminology)) {
        terminologyData.terminology.forEach(term => {
            if (term.id) {
                ids.add(term.id);
            }
        });
    }
    
    return Array.from(ids);
}

/**
 * 验证scenes.json文件的数据一致性
 */
async function validateScenes() {
    console.log('🔍 开始验证scenes.json...');
    
    let errors = [];
    let warnings = [];
    
    try {
        // 使用公共工具加载数据文件
        const dataObjects = await dataLoader.loadCoreDataFiles();
        const scenesData = dataObjects['scenes.json'];
        const charactersData = dataObjects['characters.json'];
        const terminologyData = dataObjects['terminology.json'];
        const poemsData = dataObjects['poems.json'];
        
        // 提取所有ID列表
        const allCharacterIds = extractCharacterIds(charactersData);
        const allTerminologyIds = extractTerminologyIds(terminologyData);
        const allPoemIds = extractPoemIds(poemsData);
        
        // 验证scenes.json的基本结构
        if (!scenesData.metadata || !scenesData.scenes) {
            errors.push('scenes.json缺少必要的metadata或scenes字段');
        }
        
        if (!Array.isArray(scenesData.scenes)) {
            errors.push('scenes字段必须是数组');
        }
        
        // 验证每个场景
        scenesData.scenes.forEach((scene, index) => {
            // 验证必需字段
            if (!scene.id) {
                errors.push(`场景${index + 1}缺少id字段`);
            }
            
            if (!scene.type) {
                errors.push(`场景${scene.id || index + 1}缺少type字段`);
            }
            
            if (!scene.scenario) {
                errors.push(`场景${scene.id || index + 1}缺少scenario字段`);
            }
            
            if (!scene.description) {
                errors.push(`场景${scene.id || index + 1}缺少description字段`);
            }
            
            if (!scene.poem_id) {
                errors.push(`场景${scene.id || index + 1}缺少poem_id字段`);
            }
            
            // 验证type字段的枚举值
            const validTypes = ['商务社交', '兄弟会社交', '办公室社交', '个人社交', '封闭空间', '运动环境', '消费空间'];
            if (!validTypes.includes(scene.type)) {
                errors.push(`场景${scene.id}的type字段值无效: ${scene.type}，应为: ${validTypes.join(', ')}`);
            }
            
            // 验证poem_id引用
            if (!allPoemIds.includes(scene.poem_id)) {
                errors.push(`场景${scene.id}引用的poem_id不存在: ${scene.poem_id}`);
            }
            
            // 验证characters数组
            if (!Array.isArray(scene.characters)) {
                errors.push(`场景${scene.id}的characters字段必须是数组`);
            } else {
                scene.characters.forEach(charId => {
                    if (!allCharacterIds.includes(charId)) {
                        errors.push(`场景${scene.id}引用的角色ID不存在: ${charId}`);
                    }
                });
            }
            
            // 验证terminology数组
            if (!Array.isArray(scene.terminology)) {
                errors.push(`场景${scene.id}的terminology字段必须是数组`);
            } else {
                scene.terminology.forEach(termId => {
                    if (!allTerminologyIds.includes(termId)) {
                        errors.push(`场景${scene.id}引用的术语ID不存在: ${termId}`);
                    }
                });
            }
        });
        
        // 验证场景ID的唯一性
        const sceneIds = scenesData.scenes.map(scene => scene.id);
        const duplicateIds = sceneIds.filter((id, index) => sceneIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            errors.push(`发现重复的场景ID: ${duplicateIds.join(', ')}`);
        }
        
        // 验证诗歌中的场景引用
        if (poemsData.poems && Array.isArray(poemsData.poems)) {
            poemsData.poems.forEach(poem => {
                if (poem.locations && Array.isArray(poem.locations)) {
                    poem.locations.forEach(sceneId => {
                        if (!sceneIds.includes(sceneId)) {
                            errors.push(`诗歌${poem.id}引用的场景ID不存在: ${sceneId}`);
                        }
                    });
                }
            });
        }
        
        // 验证场景与诗歌的双向引用一致性
        const scenesByPoem = {};
        scenesData.scenes.forEach(scene => {
            if (!scenesByPoem[scene.poem_id]) {
                scenesByPoem[scene.poem_id] = [];
            }
            scenesByPoem[scene.poem_id].push(scene.id);
        });
        
        poemsData.poems.forEach(poem => {
            const poemScenes = scenesByPoem[poem.id] || [];
            if (poem.locations && Array.isArray(poem.locations)) {
                poem.locations.forEach(sceneId => {
                    if (!poemScenes.includes(sceneId)) {
                        warnings.push(`诗歌${poem.id}引用的场景${sceneId}的poem_id不匹配`);
                    }
                });
            }
        });
        
        // 计算场景类型分布
        const typeCount = {};
        scenesData.scenes.forEach(scene => {
            typeCount[scene.type] = (typeCount[scene.type] || 0) + 1;
        });
        
        // 输出结果
        if (errors.length === 0) {
            console.log('✅ scenes.json验证通过');
            
            // 生成详细统计报告
            generateDetailedSceneReport(scenesData, scenesByPoem);
            
            if (warnings.length > 0) {
                console.log(`\n⚠️  警告: ${warnings.length}个`);
                warnings.forEach(warning => console.log(`   - ${warning}`));
            }
            
            return {
                isValid: true,
                totalScenes: scenesData.scenes.length,
                poemsCovered: Object.keys(scenesByPoem).length,
                typeDistribution: typeCount,
                warnings: warnings
            };
        } else {
            console.log('❌ scenes.json验证失败');
            console.log(`错误: ${errors.length}个`);
            errors.forEach(error => console.log(`  - ${error}`));
            
            if (warnings.length > 0) {
                console.log(`警告: ${warnings.length}个`);
                warnings.forEach(warning => console.log(`  - ${warning}`));
            }
            
            return {
                isValid: false,
                errors: errors,
                warnings: warnings
            };
        }
        
    } catch (error) {
        console.error('❌ scenes.json验证失败:', error.message);
        return {
            isValid: false,
            errors: [error.message]
        };
    }
}

/**
 * 生成详细的场景统计报告
 */
function generateDetailedSceneReport(scenesData, scenesByPoem) {
    console.log('\n📊 毛小豆宇宙场景统计报告');
    console.log('================================================================================');
    
    // 总体统计
    console.log('\n🎯 总体统计:');
    console.log(`   - 场景总数: ${scenesData.scenes.length}`);
    console.log(`   - 诗歌覆盖: ${Object.keys(scenesByPoem).length}首`);
    
    // 场景类型分布
    const typeCount = {};
    scenesData.scenes.forEach(scene => {
        typeCount[scene.type] = (typeCount[scene.type] || 0) + 1;
    });
    
    console.log(`   - 场景类型分布:`);
    Object.entries(typeCount).forEach(([type, count]) => {
        const percentage = ((count / scenesData.scenes.length) * 100).toFixed(1);
        console.log(`     ${type}: ${count}个 (${percentage}%)`);
    });
    
    // 各诗歌场景详细分类明细
    console.log('\n📖 各诗歌场景详细分类明细:');
    console.log('================================================================================');
    
    // 按诗歌分组场景
    const scenesByPoemDetailed = {};
    scenesData.scenes.forEach(scene => {
        if (!scenesByPoemDetailed[scene.poem_id]) {
            scenesByPoemDetailed[scene.poem_id] = [];
        }
        scenesByPoemDetailed[scene.poem_id].push(scene);
    });
    
    // 获取诗歌标题映射
    const poemTitles = {};
    Object.keys(scenesByPoemDetailed).forEach(poemId => {
        const poem = scenesData.scenes.find(scene => scene.poem_id === poemId);
        if (poem) {
            poemTitles[poemId] = poem.poem_id; // 简化处理，实际应该从poems.json获取标题
        }
    });
    
    let poemIndex = 1;
    Object.entries(scenesByPoemDetailed).forEach(([poemId, scenes]) => {
        console.log(`\n${poemIndex}. 🎭 ${poemId}`);
        console.log(`   场景数量: ${scenes.length}个`);
        console.log('   ----------------------------------------------------------------------');
        
        // 按类型分组
        const scenesByType = {};
        scenes.forEach(scene => {
            if (!scenesByType[scene.type]) {
                scenesByType[scene.type] = [];
            }
            scenesByType[scene.type].push(scene);
        });
        
        Object.entries(scenesByType).forEach(([type, typeScenes]) => {
            console.log(`\n   📍 ${type} (${typeScenes.length}个):`);
            
            typeScenes.forEach((scene, index) => {
                console.log(`\n      ${index + 1}. ${scene.id}`);
                console.log(`         场景: ${scene.scenario}`);
                console.log(`         描述: ${scene.description}`);
                console.log(`         角色: ${scene.characters.join(', ')}`);
                console.log(`         术语: ${scene.terminology.length > 0 ? scene.terminology.join(', ') : '无'}`);
            });
        });
        
        poemIndex++;
    });
    
    // 场景类型汇总分析
    console.log('\n🔍 场景类型汇总分析:');
    console.log('================================================================================');
    
    Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`\n📍 ${type} (${count}个):`);
        
        const typeScenes = scenesData.scenes.filter(scene => scene.type === type);
        const scenesByPoemInType = {};
        
        typeScenes.forEach(scene => {
            if (!scenesByPoemInType[scene.poem_id]) {
                scenesByPoemInType[scene.poem_id] = [];
            }
            scenesByPoemInType[scene.poem_id].push(scene);
        });
        
        Object.entries(scenesByPoemInType).forEach(([poemId, poemScenes]) => {
            console.log(`   ${poemId}: ${poemScenes.length}个`);
            poemScenes.forEach(scene => {
                console.log(`     - ${scene.id}: ${scene.scenario}`);
            });
        });
    });
    
    console.log('\n📋 分类建议检查点:');
    console.log('================================================================================');
    console.log('请检查以下方面:');
    console.log('1. 场景类型分类是否准确反映诗歌内容');
    console.log('2. 同一诗歌内的场景类型是否合理分布');
    console.log('3. 场景描述是否准确概括了诗歌片段');
    console.log('4. 角色和术语引用是否完整且准确');
    console.log('5. 是否需要调整场景类型枚举或添加新类型');
}

// 如果直接运行此脚本
if (require.main === module) {
    validateScenes();
}

module.exports = { validateScenes }; 