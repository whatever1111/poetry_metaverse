/**
 * 毛小豆宇宙简单数据引用验证脚本 (重构版)
 * 使用公共组件模块，消除重复代码
 * 新增：场景引用验证功能
 */
const { dataLoader } = require('../components/data_loader.cjs');
const { ReportGenerator } = require('../components/report_generator.cjs');
const { DataDisplay } = require('../components/data_display.cjs');
const { PoemStatistics } = require('../components/poem_statistics.cjs');
const { CharacterStatistics } = require('../components/character_statistics.cjs');
const { ThemeStatistics } = require('../components/theme_statistics.cjs');
const { TerminologyStatistics } = require('../components/terminology_statistics.cjs');
const { SceneStatistics } = require('../components/scene_statistics.cjs');

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
    const ids = [];
    
    if (poemsData.poems && Array.isArray(poemsData.poems)) {
        poemsData.poems.forEach(poem => {
            if (poem.id) {
                ids.push({
                    id: poem.id,
                    title: poem.title
                });
            }
        });
    }
    
    return ids;
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
            // 检查直接角色引用
            if (poem.characters && Array.isArray(poem.characters)) {
                poem.characters.forEach(character => {
                    // 修复：处理对象结构 {id: "xxx", name: "xxx"}
                    const charId = typeof character === 'string' ? character : character.id;
                    const charName = typeof character === 'string' ? character : character.name;
                    
                    if (characterIds.includes(charId)) {
                        references.push({
                            poemId: poem.id,
                            poemTitle: poem.title,
                            characterId: charId,
                            characterName: charName,
                            source: 'direct'
                        });
                    } else {
                        invalidReferences.push({
                            poemId: poem.id,
                            poemTitle: poem.title,
                            characterId: charId,
                            characterName: charName,
                            source: 'direct'
                        });
                    }
                });
            }
            
            // 检查事件中的角色引用
            if (poem.key_events && Array.isArray(poem.key_events)) {
                poem.key_events.forEach(event => {
                    if (event.related_characters && Array.isArray(event.related_characters)) {
                        event.related_characters.forEach(character => {
                            const charId = typeof character === 'string' ? character : character.id;
                            const charName = typeof character === 'string' ? character : character.name;
                            
                            if (characterIds.includes(charId)) {
                                references.push({
                                    poemId: poem.id,
                                    poemTitle: poem.title,
                                    characterId: charId,
                                    characterName: charName,
                                    source: 'event',
                                    eventId: event.event_id,
                                    eventDescription: event.description
                                });
                            } else {
                                invalidReferences.push({
                                    poemId: poem.id,
                                    poemTitle: poem.title,
                                    characterId: charId,
                                    characterName: charName,
                                    source: 'event',
                                    eventId: event.event_id
                                });
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
                            poemTitle: poem.title,
                            themeId: themeId
                        });
                    } else {
                        invalidReferences.push({
                            poemId: poem.id,
                            poemTitle: poem.title,
                            themeId: themeId
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
            if (poem.locations && Array.isArray(poem.locations)) {
                poem.locations.forEach(sceneId => {
                    if (sceneIds.includes(sceneId)) {
                        references.push({
                            poemId: poem.id,
                            poemTitle: poem.title,
                            sceneId: sceneId
                        });
                    } else {
                        invalidReferences.push({
                            poemId: poem.id,
                            poemTitle: poem.title,
                            sceneId: sceneId
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
            if (theme.characters && Array.isArray(theme.characters)) {
                theme.characters.forEach(charId => {
                    if (characterIds.includes(charId)) {
                        references.push({
                            themeId: theme.id,
                            themeName: theme.name,
                            characterId: charId
                        });
                    } else {
                        invalidReferences.push({
                            themeId: theme.id,
                            themeName: theme.name,
                            characterId: charId
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
    
    // 提取诗歌ID列表用于匹配
    const poemIdList = poemIds.map(poem => poem.id);
    
    if (themesData.themes && Array.isArray(themesData.themes)) {
        themesData.themes.forEach(theme => {
            if (theme.poems && Array.isArray(theme.poems)) {
                theme.poems.forEach(poemId => {
                    if (poemIdList.includes(poemId)) {
                        references.push({
                            themeId: theme.id,
                            themeName: theme.name,
                            poemId: poemId
                        });
                    } else {
                        invalidReferences.push({
                            themeId: theme.id,
                            themeName: theme.name,
                            poemId: poemId
                        });
                    }
                });
            }
        });
    }
    
    return { references, invalidReferences };
}

/**
 * 检查术语中的诗歌引用
 */
function checkTerminologyPoemReferences(terminologyData, poemIds) {
    const references = [];
    const invalidReferences = [];
    
    // 创建诗歌标题到ID的映射，支持多种格式
    const poemTitleToId = {};
    poemIds.forEach(poem => {
        if (typeof poem === 'object' && poem.title && poem.id) {
            // 支持多种标题格式
            poemTitleToId[poem.title] = poem.id;
            poemTitleToId[`《${poem.title}》`] = poem.id;
            poemTitleToId[poem.title.replace(/[《》]/g, '')] = poem.id;
            
            // 特殊处理一些常见的格式变体
            if (poem.title.includes('毛小豆故事演绎')) {
                // 处理 "毛小豆故事演绎 II" vs "毛小豆故事演绎 Ⅱ"
                const variant1 = poem.title.replace('Ⅱ', 'II');
                const variant2 = poem.title.replace('II', 'Ⅱ');
                poemTitleToId[variant1] = poem.id;
                poemTitleToId[variant2] = poem.id;
                poemTitleToId[`《${variant1}》`] = poem.id;
                poemTitleToId[`《${variant2}》`] = poem.id;
                
                // 处理 "毛小豆故事演绎 | REMAKE" vs "毛小豆故事演绎 Ⅰ REMAKE"
                if (poem.title.includes('REMAKE')) {
                    const remakeVariant1 = poem.title.replace('|', 'Ⅰ');
                    const remakeVariant2 = poem.title.replace('Ⅰ', '|');
                    poemTitleToId[remakeVariant1] = poem.id;
                    poemTitleToId[remakeVariant2] = poem.id;
                    poemTitleToId[`《${remakeVariant1}》`] = poem.id;
                    poemTitleToId[`《${remakeVariant2}》`] = poem.id;
                }
            }
            
            // 处理 "注 意 看" vs "注意看"
            if (poem.title.includes('注意看')) {
                const spaceVariant = poem.title.replace(/\s+/g, '');
                const spacedVariant = poem.title.replace(/(.)/g, '$1 ').trim();
                poemTitleToId[spaceVariant] = poem.id;
                poemTitleToId[spacedVariant] = poem.id;
                poemTitleToId[`《${spaceVariant}》`] = poem.id;
                poemTitleToId[`《${spacedVariant}》`] = poem.id;
            }
        }
    });
    
    if (terminologyData.terminology && Array.isArray(terminologyData.terminology)) {
        terminologyData.terminology.forEach(term => {
            if (term.context) {
                // 尝试多种匹配方式
                let matchedPoemId = null;
                
                // 1. 直接匹配ID
                if (poemIds.includes(term.context)) {
                    matchedPoemId = term.context;
                }
                // 2. 匹配各种标题格式
                else if (poemTitleToId[term.context]) {
                    matchedPoemId = poemTitleToId[term.context];
                }
                // 3. 尝试去除书名号的匹配
                else if (poemTitleToId[term.context.replace(/[《》]/g, '')]) {
                    matchedPoemId = poemTitleToId[term.context.replace(/[《》]/g, '')];
                }
                // 4. 尝试添加书名号的匹配
                else if (poemTitleToId[`《${term.context.replace(/[《》]/g, '')}》`]) {
                    matchedPoemId = poemTitleToId[`《${term.context.replace(/[《》]/g, '')}》`];
                }
                
                if (matchedPoemId) {
                    references.push({
                        termId: term.id,
                        termName: term.term,
                        poemId: matchedPoemId,
                        context: term.context
                    });
                } else {
                    invalidReferences.push({
                        termId: term.id,
                        termName: term.term,
                        context: term.context
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
    
    // 提取诗歌ID列表用于匹配
    const poemIdList = poemIds.map(poem => poem.id);
    
    if (theoryData.theoretical_framework && theoryData.theoretical_framework.theories) {
        // 理论框架的theories是对象，不是数组
        Object.entries(theoryData.theoretical_framework.theories).forEach(([theoryId, theory]) => {
            // 检查manifestations中的examples
            if (theory.manifestations) {
                Object.values(theory.manifestations).forEach(manifestation => {
                    if (manifestation.examples && Array.isArray(manifestation.examples)) {
                        manifestation.examples.forEach(example => {
                            if (example.poem && example.poem.id) {
                                if (poemIdList.includes(example.poem.id)) {
                                    references.push({
                                        theoryId: theoryId,
                                        theoryName: theory.name,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                } else {
                                    invalidReferences.push({
                                        theoryId: theoryId,
                                        theoryName: theory.name,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                }
                            }
                        });
                    }
                });
            }
            
            // 检查types中的examples
            if (theory.types) {
                Object.values(theory.types).forEach(type => {
                    if (type.examples && Array.isArray(type.examples)) {
                        type.examples.forEach(example => {
                            if (example.poem && example.poem.id) {
                                if (poemIdList.includes(example.poem.id)) {
                                    references.push({
                                        theoryId: theoryId,
                                        theoryName: theory.name,
                                        poemId: example.poem.id,
                                        poemTitle: example.poem.title
                                    });
                                } else {
                                    invalidReferences.push({
                                        theoryId: theoryId,
                                        theoryName: theory.name,
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
 * 验证简单数据引用
 */
async function validateSimpleDataReferences() {
    try {
        console.log('🔍 开始简单数据引用验证...');
        
        // 使用公共工具加载数据文件
        const dataObjects = await dataLoader.loadCoreDataFiles();
        const poemsData = dataObjects['poems.json'];
        const charactersData = dataObjects['characters.json'];
        const themesData = dataObjects['themes.json'];
        const terminologyData = dataObjects['terminology.json'];
        const scenesData = dataObjects['scenes.json'];
        
        // 还需要加载理论框架文件
        const theoryData = await dataLoader.loadFile('theoretical_framework.json');
        
        // 使用公共组件进行统计和报告生成
        const poemStatistics = new PoemStatistics(dataLoader);
        const characterStatistics = new CharacterStatistics(dataLoader);
        const themeStatistics = new ThemeStatistics(dataLoader);
        const terminologyStatistics = new TerminologyStatistics(dataLoader);
        const sceneStatistics = new SceneStatistics(dataLoader);
        const reportGenerator = new ReportGenerator();
        const dataDisplay = new DataDisplay();
        
        // 提取所有ID列表
        const poemIds = extractPoemIds(poemsData);
        const characterIds = extractCharacterIds(charactersData);
        const themeIds = extractThemeIds(themesData);
        const terminologyIds = extractTerminologyIds(terminologyData);
        const sceneIds = extractSceneIds(scenesData);
        
        // 检查诗歌中的角色引用
        console.log('📋 检查诗歌中的角色引用...');
        const poemCharRefs = checkPoemCharacterReferences(poemsData, characterIds);
        
        // 分别统计直接引用和事件引用
        const directRefs = poemCharRefs.references.filter(ref => ref.source === 'direct');
        const eventRefs = poemCharRefs.references.filter(ref => ref.source === 'event');
        
        console.log(`  ✅ 有效引用: ${poemCharRefs.references.length} 个`);
        console.log(`    - 直接引用: ${directRefs.length} 个`);
        console.log(`    - 事件引用: ${eventRefs.length} 个`);
        
        if (poemCharRefs.references.length > 0) {
            console.log('    示例:');
            poemCharRefs.references.slice(0, 3).forEach(ref => {
                const sourceType = ref.source === 'direct' ? '直接' : '事件';
                console.log(`    - 诗歌 "${ref.poemTitle}" ${sourceType}引用角色 "${ref.characterId}"`);
            });
        }
        
        if (poemCharRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${poemCharRefs.invalidReferences.length} 个`);
            poemCharRefs.invalidReferences.forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemTitle}" 引用无效角色 "${ref.characterId}"`);
            });
        }
        
        // 检查诗歌中的主题引用
        console.log('\n📋 检查诗歌中的主题引用...');
        const poemThemeRefs = checkPoemThemeReferences(poemsData, themeIds);
        
        console.log(`  ✅ 有效引用: ${poemThemeRefs.references.length} 个`);
        if (poemThemeRefs.references.length > 0) {
            console.log('    示例:');
            poemThemeRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemTitle}" 引用主题 "${ref.themeId}"`);
            });
        }
        
        if (poemThemeRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${poemThemeRefs.invalidReferences.length} 个`);
            poemThemeRefs.invalidReferences.forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemTitle}" 引用无效主题 "${ref.themeId}"`);
            });
        }
        
        // 检查诗歌中的场景引用
        console.log('\n📋 检查诗歌中的场景引用...');
        const poemSceneRefs = checkPoemSceneReferences(poemsData, sceneIds);
        
        console.log(`  ✅ 有效引用: ${poemSceneRefs.references.length} 个`);
        if (poemSceneRefs.references.length > 0) {
            console.log('    示例:');
            poemSceneRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemTitle}" 引用场景 "${ref.sceneId}"`);
            });
        }
        
        if (poemSceneRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${poemSceneRefs.invalidReferences.length} 个`);
            poemSceneRefs.invalidReferences.forEach(ref => {
                console.log(`    - 诗歌 "${ref.poemTitle}" 引用无效场景 "${ref.sceneId}"`);
            });
        }
        
        // 检查主题中的角色引用
        console.log('\n📋 检查主题中的角色引用...');
        const themeCharRefs = checkThemeCharacterReferences(themesData, characterIds);
        
        console.log(`  ✅ 有效引用: ${themeCharRefs.references.length} 个`);
        if (themeCharRefs.references.length > 0) {
            console.log('    示例:');
            themeCharRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 主题 "${ref.themeName}" 引用角色 "${ref.characterId}"`);
            });
        }
        
        if (themeCharRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${themeCharRefs.invalidReferences.length} 个`);
            themeCharRefs.invalidReferences.forEach(ref => {
                console.log(`    - 主题 "${ref.themeName}" 引用无效角色 "${ref.characterId}"`);
            });
        }
        
        // 检查主题中的诗歌引用
        console.log('\n📋 检查主题中的诗歌引用...');
        const themePoemRefs = checkThemePoemReferences(themesData, poemIds);
        
        console.log(`  ✅ 有效引用: ${themePoemRefs.references.length} 个`);
        if (themePoemRefs.references.length > 0) {
            console.log('    示例:');
            themePoemRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 主题 "${ref.themeName}" 引用诗歌 "${ref.poemId}"`);
            });
        }
        
        if (themePoemRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${themePoemRefs.invalidReferences.length} 个`);
            themePoemRefs.invalidReferences.forEach(ref => {
                console.log(`    - 主题 "${ref.themeName}" 引用无效诗歌 "${ref.poemId}"`);
            });
        }
        
        // 检查术语中的诗歌引用
        console.log('\n📋 检查术语中的诗歌引用...');
        const termPoemRefs = checkTerminologyPoemReferences(terminologyData, poemIds);
        
        console.log(`  ✅ 有效引用: ${termPoemRefs.references.length} 个`);
        if (termPoemRefs.references.length > 0) {
            console.log('    示例:');
            termPoemRefs.references.slice(0, 3).forEach(ref => {
                console.log(`    - 术语 "${ref.termName}" 引用诗歌 "${ref.context}"`);
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
                console.log(`    - 理论 "${ref.theoryName}" 引用诗歌 "${ref.poemId}" (${ref.poemTitle})`);
            });
        }
        
        if (theoryPoemRefs.invalidReferences.length > 0) {
            console.log(`  ❌ 无效引用: ${theoryPoemRefs.invalidReferences.length} 个`);
            theoryPoemRefs.invalidReferences.forEach(ref => {
                console.log(`    - 理论 "${ref.theoryId}" 引用无效诗歌 "${ref.poemId}"`);
            });
        }
        
        // 计算总体统计
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
        
        // 输出总体结果
        console.log('\n📊 数据引用校验结果:');
        if (totalInvalidRefs === 0) {
            console.log('✅ 所有数据引用校验通过！');
        } else {
            console.log(`❌ 发现 ${totalInvalidRefs} 个无效引用`);
        }
        
                 console.log(`\n📈 引用统计:`);
         console.log(`- 总有效引用: ${totalValidRefs}`);
         console.log(`- 总无效引用: ${totalInvalidRefs}`);
         console.log(`- 诗歌->角色引用: ${poemCharRefs.references.length} (直接: ${directRefs.length}, 事件: ${eventRefs.length})`);
         console.log(`- 诗歌->主题引用: ${poemThemeRefs.references.length}`);
         console.log(`- 诗歌->场景引用: ${poemSceneRefs.references.length}`);
         console.log(`- 主题->角色引用: ${themeCharRefs.references.length}`);
         console.log(`- 主题->诗歌引用: ${themePoemRefs.references.length}`);
         console.log(`- 术语->诗歌引用: ${termPoemRefs.references.length}`);
         console.log(`- 理论->诗歌引用: ${theoryPoemRefs.references.length}`);
        
        // 生成各类型统计数据
        const poemStats = await poemStatistics.generateStatistics(poemsData);
        const characterStats = await characterStatistics.generateStatistics(charactersData);
        const themeStats = await themeStatistics.generateStatistics(themesData);
        const terminologyStats = await terminologyStatistics.generateStatistics(terminologyData);
        const sceneStats = await sceneStatistics.generateStatistics(scenesData);
        
        // 使用公共组件生成详细报告
        const allStats = {
            references: {
                totalValid: totalValidRefs,
                totalInvalid: totalInvalidRefs,
                poemToCharacter: poemCharRefs.references.length,
                poemToTheme: poemThemeRefs.references.length,
                poemToScene: poemSceneRefs.references.length,
                themeToCharacter: themeCharRefs.references.length,
                themeToPoem: themePoemRefs.references.length,
                terminologyToPoem: termPoemRefs.references.length,
                theoryToPoem: theoryPoemRefs.references.length
            },
            statistics: {
                poems: poemStats,
                characters: characterStats,
                themes: themeStats,
                terminology: terminologyStats,
                scenes: sceneStats
            },
            validation: {
                isValid: totalInvalidRefs === 0,
                totalIssues: totalInvalidRefs,
                details: {
                    poemCharRefs,
                    poemThemeRefs,
                    poemSceneRefs,
                    themeCharRefs,
                    themePoemRefs,
                    termPoemRefs,
                    theoryPoemRefs
                }
            }
        };
        
        const report = reportGenerator.generateReport(allStats, 'simple_data_references_template', {
            title: '毛小豆宇宙简单数据引用验证报告',
            includeValidation: true,
            includeDetails: true
        });
        
        const isValid = totalInvalidRefs === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 简化数据引用校验${isValid ? '通过' : '失败'}`);
        
        return {
            isValid: isValid,
            totalValidRefs: totalValidRefs,
            totalInvalidRefs: totalInvalidRefs,
            referenceStats: allStats.references,
            validationDetails: allStats.validation.details
        };
        
    } catch (error) {
        console.error('❌ 简化数据引用校验失败:', error.message);
        return {
            isValid: false,
            error: error.message
        };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateSimpleDataReferences();
}

module.exports = { validateSimpleDataReferences }; 