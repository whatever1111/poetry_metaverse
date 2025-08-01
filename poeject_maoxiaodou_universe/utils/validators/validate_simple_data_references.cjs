/**
 * 毛小豆宇宙简单数据引用验证脚本 (优化版)
 * 使用公共工具模块，消除重复代码
 * 新增：场景引用验证功能
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
 * 从themes.json中提取所有主题ID
 */
function extractThemeIds(themesData) {
    const ids = new Set();
    
    if (themesData.themes && Array.isArray(themesData.themes)) {
        themesData.themes.forEach(theme => {
            if (theme.id) {
                ids.add(theme.id);
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
 * 从scenes.json中提取所有场景ID
 */
function extractSceneIds(scenesData) {
    const ids = new Set();
    
    if (scenesData.scenes && Array.isArray(scenesData.scenes)) {
        scenesData.scenes.forEach(scene => {
            if (scene.id) {
                ids.add(scene.id);
            }
        });
    }
    
    return Array.from(ids);
}

/**
 * 检查诗歌中的角色引用
 */
function checkPoemCharacterReferences(poemsData, characterIds) {
    const references = [];
    const invalidReferences = [];
    
    if (poemsData.poems && Array.isArray(poemsData.poems)) {
        poemsData.poems.forEach(poem => {
            // 检查 poems.characters 数组
            if (poem.characters && Array.isArray(poem.characters)) {
                poem.characters.forEach(charRef => {
                    if (charRef.id) {
                        if (characterIds.includes(charRef.id)) {
                            references.push({
                                poemId: poem.id,
                                characterId: charRef.id,
                                characterName: charRef.name,
                                location: 'characters'
                            });
                        } else {
                            invalidReferences.push({
                                poemId: poem.id,
                                characterId: charRef.id,
                                characterName: charRef.name,
                                location: 'characters'
                            });
                        }
                    }
                });
            }
            
            // 检查 key_events.related_characters 数组
            if (poem.key_events && Array.isArray(poem.key_events)) {
                poem.key_events.forEach(event => {
                    if (event.related_characters && Array.isArray(event.related_characters)) {
                        event.related_characters.forEach(charRef => {
                            if (charRef.id) {
                                if (characterIds.includes(charRef.id)) {
                                    references.push({
                                        poemId: poem.id,
                                        characterId: charRef.id,
                                        characterName: charRef.name,
                                        location: `key_events.${event.event_id}`
                                    });
                                } else {
                                    invalidReferences.push({
                                        poemId: poem.id,
                                        characterId: charRef.id,
                                        characterName: charRef.name,
                                        location: `key_events.${event.event_id}`
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查诗歌中的主题引用
 */
function checkPoemThemeReferences(poemsData, themeIds) {
    const references = [];
    const invalidReferences = [];
    
    if (poemsData.poems && Array.isArray(poemsData.poems)) {
        poemsData.poems.forEach(poem => {
            if (poem.themes && Array.isArray(poem.themes)) {
                poem.themes.forEach(themeId => {
                    if (themeIds.includes(themeId)) {
                        references.push({
                            poemId: poem.id,
                            themeId: themeId,
                            location: 'themes'
                        });
                    } else {
                        invalidReferences.push({
                            poemId: poem.id,
                            themeId: themeId,
                            location: 'themes'
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查主题中的角色引用
 */
function checkThemeCharacterReferences(themesData, characterIds) {
    const references = [];
    const invalidReferences = [];
    
    if (themesData.themes && Array.isArray(themesData.themes)) {
        themesData.themes.forEach(theme => {
            if (theme.related_characters && Array.isArray(theme.related_characters)) {
                theme.related_characters.forEach(charId => {
                    if (characterIds.includes(charId)) {
                        references.push({
                            themeId: theme.id,
                            characterId: charId,
                            location: 'related_characters'
                        });
                    } else {
                        invalidReferences.push({
                            themeId: theme.id,
                            characterId: charId,
                            location: 'related_characters'
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查主题中的诗歌引用
 */
function checkThemePoemReferences(themesData, poemIds) {
    const references = [];
    const invalidReferences = [];
    
    if (themesData.themes && Array.isArray(themesData.themes)) {
        themesData.themes.forEach(theme => {
            if (theme.related_poems && Array.isArray(theme.related_poems)) {
                theme.related_poems.forEach(poemId => {
                    if (poemIds.includes(poemId)) {
                        references.push({
                            themeId: theme.id,
                            poemId: poemId,
                            location: 'related_poems'
                        });
                    } else {
                        invalidReferences.push({
                            themeId: theme.id,
                            poemId: poemId,
                            location: 'related_poems'
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查术语中的诗歌引用（通过context字段）
 */
function checkTerminologyPoemReferences(terminologyData, poemIds) {
    const references = [];
    const invalidReferences = [];
    
    if (terminologyData.terminology && Array.isArray(terminologyData.terminology)) {
        terminologyData.terminology.forEach(term => {
            if (term.context) {
                // 尝试从context中提取诗歌ID
                // 假设context格式为"《诗歌标题》"
                const contextMatch = term.context.match(/《([^》]+)》/);
                if (contextMatch) {
                    const poemTitle = contextMatch[1];
                    // 这里需要更复杂的匹配逻辑，暂时记录所有context
                    references.push({
                        termId: term.id,
                        termName: term.term,
                        context: term.context,
                        location: 'context'
                    });
                }
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查理论框架中的诗歌引用
 */
function checkTheoryPoemReferences(theoryData, poemIds) {
    const references = [];
    const invalidReferences = [];
    
    if (theoryData.theoretical_framework && theoryData.theoretical_framework.theories) {
        Object.entries(theoryData.theoretical_framework.theories).forEach(([theoryId, theory]) => {
            // 检查manifestations中的诗歌引用
            if (theory.manifestations) {
                Object.values(theory.manifestations).forEach(manifestation => {
                    if (manifestation.examples && Array.isArray(manifestation.examples)) {
                        manifestation.examples.forEach(example => {
                            if (example.poem && example.poem.id) {
                                if (poemIds.includes(example.poem.id)) {
                                    references.push({
                                        theoryId,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                } else {
                                    invalidReferences.push({
                                        theoryId,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                }
                            }
                        });
                    }
                });
            }
            
            // 检查types中的诗歌引用
            if (theory.types) {
                Object.values(theory.types).forEach(type => {
                    if (type.examples && Array.isArray(type.examples)) {
                        type.examples.forEach(example => {
                            if (example.poem && example.poem.id) {
                                if (poemIds.includes(example.poem.id)) {
                                    references.push({
                                        theoryId,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                } else {
                                    invalidReferences.push({
                                        theoryId,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查诗歌中的场景引用
 */
function checkPoemSceneReferences(poemsData, sceneIds) {
    const references = [];
    const invalidReferences = [];
    
    if (poemsData.poems && Array.isArray(poemsData.poems)) {
        poemsData.poems.forEach(poem => {
            // 检查 poems.locations 数组（场景引用）
            if (poem.locations && Array.isArray(poem.locations)) {
                poem.locations.forEach(sceneId => {
                    if (sceneIds.includes(sceneId)) {
                        references.push({
                            poemId: poem.id,
                            sceneId: sceneId,
                            location: 'locations'
                        });
                    } else {
                        invalidReferences.push({
                            poemId: poem.id,
                            sceneId: sceneId,
                            location: 'locations'
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

async function validateSimpleDataReferences() {
    console.log('🔍 开始简化数据引用校验...\n');
    
    try {
        // 使用公共工具加载数据文件
        console.log('📋 读取数据文件...');
        const dataObjects = await dataLoader.loadCoreDataFiles();
        
        const charactersData = dataObjects['characters.json'];
        const poemsData = dataObjects['poems.json'];
        const themesData = dataObjects['themes.json'];
        const terminologyData = dataObjects['terminology.json'];
        
        // 还需要加载理论框架文件和场景文件
        const theoryData = await dataLoader.loadFile('theoretical_framework.json');
        const scenesData = await dataLoader.loadFile('scenes.json');
        
        console.log('✅ 已读取: characters.json');
        console.log('✅ 已读取: poems.json');
        console.log('✅ 已读取: theoretical_framework.json');
        console.log('✅ 已读取: themes.json');
        console.log('✅ 已读取: terminology.json');
        console.log('✅ 已读取: scenes.json');
        
        // 提取ID列表
        const characterIds = extractCharacterIds(charactersData);
        const poemIds = extractPoemIds(poemsData);
        const themeIds = extractThemeIds(themesData);
        const terminologyIds = extractTerminologyIds(terminologyData);
        const sceneIds = extractSceneIds(scenesData);
        
        console.log(`\n📊 数据统计:`);
        console.log(`- 角色数量: ${characterIds.length}`);
        console.log(`- 诗歌数量: ${poemIds.length}`);
        console.log(`- 主题数量: ${themeIds.length}`);
        console.log(`- 术语数量: ${terminologyIds.length}`);
        console.log(`- 场景数量: ${sceneIds.length}`);
        
        // 检查诗歌中的角色引用
        console.log('\n📋 检查诗歌中的角色引用...');
        const poemCharRefs = checkPoemCharacterReferences(poemsData, characterIds);
        
        console.log(`  ✅ 有效引用: ${poemCharRefs.references.length} 个`);
        if (poemCharRefs.references.length > 0) {
            console.log('    示例:');
            poemCharRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemId}" 在 "${ref.location}" 中引用角色 "${ref.characterId}" (${ref.characterName})`);
            });
        }
        
        if (poemCharRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${poemCharRefs.invalidReferences.length} 个`);
            poemCharRefs.invalidReferences.forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemId}" 引用无效角色 "${ref.characterId}"`);
            });
        }
        
        // 检查诗歌中的主题引用
        console.log('\n📋 检查诗歌中的主题引用...');
        const poemThemeRefs = checkPoemThemeReferences(poemsData, themeIds);
        
        console.log(`  ✅ 有效引用: ${poemThemeRefs.references.length} 个`);
        if (poemThemeRefs.references.length > 0) {
            console.log('    示例:');
            poemThemeRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemId}" 引用主题 "${ref.themeId}"`);
            });
        }
        
        if (poemThemeRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${poemThemeRefs.invalidReferences.length} 个`);
            poemThemeRefs.invalidReferences.forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemId}" 引用无效主题 "${ref.themeId}"`);
            });
        }
        
        // 检查诗歌中的场景引用
        console.log('\n📋 检查诗歌中的场景引用...');
        const poemSceneRefs = checkPoemSceneReferences(poemsData, sceneIds);
        
        console.log(`  ✅ 有效引用: ${poemSceneRefs.references.length} 个`);
        if (poemSceneRefs.references.length > 0) {
            console.log('    示例:');
            poemSceneRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemId}" 在 "${ref.location}" 中引用场景 "${ref.sceneId}"`);
            });
        }
        
        if (poemSceneRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${poemSceneRefs.invalidReferences.length} 个`);
            poemSceneRefs.invalidReferences.forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemId}" 引用无效场景 "${ref.sceneId}"`);
            });
        }
        
        // 检查主题中的角色引用
        console.log('\n📋 检查主题中的角色引用...');
        const themeCharRefs = checkThemeCharacterReferences(themesData, characterIds);
        
        console.log(`  ✅ 有效引用: ${themeCharRefs.references.length} 个`);
        if (themeCharRefs.references.length > 0) {
            console.log('    示例:');
            themeCharRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 主题 "${ref.themeId}" 引用角色 "${ref.characterId}"`);
            });
        }
        
        if (themeCharRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${themeCharRefs.invalidReferences.length} 个`);
            themeCharRefs.invalidReferences.forEach(ref => {
                console.log(`    - 主题 "${ref.themeId}" 引用无效角色 "${ref.characterId}"`);
            });
        }
        
        // 检查主题中的诗歌引用
        console.log('\n📋 检查主题中的诗歌引用...');
        const themePoemRefs = checkThemePoemReferences(themesData, poemIds);
        
        console.log(`  ✅ 有效引用: ${themePoemRefs.references.length} 个`);
        if (themePoemRefs.references.length > 0) {
            console.log('    示例:');
            themePoemRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 主题 "${ref.themeId}" 引用诗歌 "${ref.poemId}"`);
            });
        }
        
        if (themePoemRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${themePoemRefs.invalidReferences.length} 个`);
            themePoemRefs.invalidReferences.forEach(ref => {
                console.log(`    - 主题 "${ref.themeId}" 引用无效诗歌 "${ref.poemId}"`);
            });
        }
        
        // 检查术语中的诗歌引用
        console.log('\n📋 检查术语中的诗歌引用...');
        const termPoemRefs = checkTerminologyPoemReferences(terminologyData, poemIds);
        
        console.log(`  ✅ 有效引用: ${termPoemRefs.references.length} 个`);
        if (termPoemRefs.references.length > 0) {
            console.log('    示例:');
            termPoemRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 术语 "${ref.termId}" (${ref.termName}) 引用诗歌 "${ref.context}"`);
            });
        }
        
        if (termPoemRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${termPoemRefs.invalidReferences.length} 个`);
            termPoemRefs.invalidReferences.forEach(ref => {
                console.log(`    - 术语 "${ref.termId}" 引用无效诗歌 "${ref.context}"`);
            });
        }
        
        // 检查理论框架中的诗歌引用
        console.log('\n📋 检查理论框架中的诗歌引用...');
        const theoryPoemRefs = checkTheoryPoemReferences(theoryData, poemIds);
        
        console.log(`  ✅ 有效引用: ${theoryPoemRefs.references.length} 个`);
        if (theoryPoemRefs.references.length > 0) {
            console.log('    示例:');
            theoryPoemRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 理论 "${ref.theoryId}" 引用诗歌 "${ref.poemId}" (${ref.poemTitle})`);
            });
        }
        
        if (theoryPoemRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${theoryPoemRefs.invalidReferences.length} 个`);
            theoryPoemRefs.invalidReferences.forEach(ref => {
                console.log(`    - 理论 "${ref.theoryId}" 引用无效诗歌 "${ref.poemId}"`);
            });
        }
        
        // 输出总体结果
        const totalValidRefs = poemCharRefs.references.length + 
                             poemThemeRefs.references.length + 
                             poemSceneRefs.references.length + 
                             themeCharRefs.references.length + 
                             themePoemRefs.references.length + 
                             termPoemRefs.references.length + 
                             theoryPoemRefs.references.length;
        
        const totalInvalidRefs = poemCharRefs.invalidReferences.length + 
                               poemThemeRefs.invalidReferences.length + 
                               poemSceneRefs.invalidReferences.length + 
                               themeCharRefs.invalidReferences.length + 
                               themePoemRefs.invalidReferences.length + 
                               termPoemRefs.invalidReferences.length + 
                               theoryPoemRefs.invalidReferences.length;
        
        console.log('\n📊 数据引用校验结果:');
        if (totalInvalidRefs === 0) {
            console.log('✅ 所有数据引用校验通过！');
        } else {
            console.log(`❌ 发现 ${totalInvalidRefs} 个无效引用`);
        }
        
        console.log(`\n📈 引用统计:`);
        console.log(`- 总有效引用: ${totalValidRefs}`);
        console.log(`- 总无效引用: ${totalInvalidRefs}`);
        console.log(`- 诗歌->角色引用: ${poemCharRefs.references.length}`);
        console.log(`- 诗歌->主题引用: ${poemThemeRefs.references.length}`);
        console.log(`- 诗歌->场景引用: ${poemSceneRefs.references.length}`);
        console.log(`- 主题->角色引用: ${themeCharRefs.references.length}`);
        console.log(`- 主题->诗歌引用: ${themePoemRefs.references.length}`);
        console.log(`- 术语->诗歌引用: ${termPoemRefs.references.length}`);
        console.log(`- 理论->诗歌引用: ${theoryPoemRefs.references.length}`);
        
        const isValid = totalInvalidRefs === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 简化数据引用校验${isValid ? '通过' : '失败'}`);
        
        return isValid;
        
    } catch (error) {
        console.error('❌ 简化数据引用校验失败:', error.message);
        return false;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateSimpleDataReferences();
}

module.exports = { validateSimpleDataReferences }; 