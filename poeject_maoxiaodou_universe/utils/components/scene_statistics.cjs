/**
 * 毛小豆宇宙场景统计器
 * 负责场景数据的统计分析和展示
 * 从validate_scenes.cjs重构而来
 */

const { StatisticsGenerator } = require('./component_interfaces.cjs');
const { DataLoader } = require('./data_loader.cjs');

class SceneStatistics extends StatisticsGenerator {
    constructor(dataLoader) {
        super(dataLoader);
        this.config = {
            enablePoemAnalysis: true,
            enableTypeDistribution: true,
            enableCharacterAnalysis: true,
            enableTerminologyAnalysis: true
        };
    }

    /**
     * 生成场景统计数据
     * @param {Object} data - 场景数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        try {
            if (!this.validateInput(data)) {
                throw new Error('无效的场景数据输入');
            }

            const scenes = data.scenes || [];
            const totalCount = scenes.length;
            const validCount = scenes.filter(scene => this.isValidScene(scene)).length;
            const coverage = totalCount > 0 ? (validCount / totalCount * 100).toFixed(2) : 0;

            // 场景类型分布
            const typeDistribution = this.analyzeTypeDistribution(scenes);
            
            // 诗歌关联分析
            const poemAnalysis = this.config.enablePoemAnalysis ? 
                this.analyzePoemAssociations(scenes) : {};

            // 角色关联分析
            const characterAnalysis = this.config.enableCharacterAnalysis ? 
                this.analyzeCharacterAssociations(scenes) : {};

            // 术语关联分析
            const terminologyAnalysis = this.config.enableTerminologyAnalysis ? 
                this.analyzeTerminologyAssociations(scenes) : {};

            // 质量评估
            const qualityScore = this.calculateQualityScore(scenes);
            const completeness = this.calculateCompleteness(scenes);
            const consistency = this.calculateConsistency(scenes);

            return {
                totalCount,
                validCount,
                coverage: parseFloat(coverage),
                types: typeDistribution,
                distribution: {
                    byType: typeDistribution,
                    byPoem: poemAnalysis.poemDistribution || {},
                    byCharacter: characterAnalysis.characterDistribution || {},
                    byTerminology: terminologyAnalysis.terminologyDistribution || {}
                },
                coverageDetails: {
                    totalScenes: totalCount,
                    validScenes: validCount,
                    invalidScenes: totalCount - validCount,
                    coveragePercentage: parseFloat(coverage)
                },
                qualityScore,
                completeness,
                consistency,
                details: {
                    poemAnalysis,
                    characterAnalysis,
                    terminologyAnalysis,
                    typeAnalysis: typeDistribution
                },
                stats: {
                    averageCharacters: characterAnalysis.averageCharacters || 0,
                    averageTerminology: terminologyAnalysis.averageTerminology || 0,
                    mostFrequentType: this.getMostFrequentType(typeDistribution),
                    topPoems: poemAnalysis.topPoems || []
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成场景分类检查点
     * @param {Object} data - 场景数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        try {
            const scenes = data.scenes || [];
            const checkpoints = [];

            // 基础数据完整性检查
            checkpoints.push({
                id: 'scene_basic_integrity',
                name: '场景基础数据完整性',
                status: this.checkBasicIntegrity(scenes),
                description: '检查场景数据的基础完整性',
                priority: 'high'
            });

            // 场景类型分布检查
            checkpoints.push({
                id: 'scene_type_distribution',
                name: '场景类型分布合理性',
                status: this.checkTypeDistribution(scenes),
                description: '检查场景类型分布是否合理',
                priority: 'medium'
            });

            // 诗歌关联检查
            checkpoints.push({
                id: 'scene_poem_associations',
                name: '场景诗歌关联完整性',
                status: this.checkPoemAssociations(scenes),
                description: '检查场景诗歌关联的完整性',
                priority: 'high'
            });

            // 角色关联检查
            checkpoints.push({
                id: 'scene_character_associations',
                name: '场景角色关联完整性',
                status: this.checkCharacterAssociations(scenes),
                description: '检查场景角色关联的完整性',
                priority: 'high'
            });

            // 术语关联检查
            checkpoints.push({
                id: 'scene_terminology_associations',
                name: '场景术语关联完整性',
                status: this.checkTerminologyAssociations(scenes),
                description: '检查场景术语关联的完整性',
                priority: 'medium'
            });

            return checkpoints;
        } catch (error) {
            return [{
                id: 'scene_checkpoints_error',
                name: '场景检查点生成错误',
                status: false,
                description: `生成检查点时发生错误: ${error.message}`,
                priority: 'high'
            }];
        }
    }

    /**
     * 生成场景智能展示数据
     * @param {Object} data - 场景数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        try {
            const scenes = data.scenes || [];
            
            return {
                summary: {
                    totalScenes: scenes.length,
                    sceneTypes: this.getSceneTypes(scenes),
                    poemDistribution: this.getPoemDistribution(scenes),
                    characterDistribution: this.getCharacterDistribution(scenes)
                },
                details: {
                    sceneList: this.formatSceneList(scenes),
                    typeBreakdown: this.formatTypeBreakdown(scenes),
                    poemChart: this.formatPoemChart(scenes),
                    characterMatrix: this.formatCharacterMatrix(scenes)
                },
                insights: {
                    keyInsights: this.generateKeyInsights(scenes),
                    recommendations: this.generateRecommendations(scenes),
                    trends: this.analyzeTrends(scenes)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证场景数据完整性
     * @param {Object} data - 场景数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        try {
            const scenes = data.scenes || [];
            const errors = [];
            const warnings = [];

            // 检查必需字段
            scenes.forEach((scene, index) => {
                if (!scene.id) {
                    errors.push(`场景 ${index} 缺少ID字段`);
                }
                if (!scene.scenario) {
                    warnings.push(`场景 ${index} 缺少scenario字段`);
                }
                if (!scene.type) {
                    warnings.push(`场景 ${index} 缺少type字段`);
                }
                if (!scene.poem_id) {
                    warnings.push(`场景 ${index} 缺少poem_id字段`);
                }
            });

            // 检查ID唯一性
            const ids = scenes.map(scene => scene.id).filter(id => id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                errors.push('存在重复的场景ID');
            }

            // 检查角色关联有效性
            scenes.forEach(scene => {
                if (scene.characters && Array.isArray(scene.characters)) {
                    scene.characters.forEach(character => {
                        if (!character) {
                            warnings.push(`场景 ${scene.id} 的角色关联包含空值`);
                        }
                    });
                }
            });

            // 检查术语关联有效性
            scenes.forEach(scene => {
                if (scene.terminology && Array.isArray(scene.terminology)) {
                    scene.terminology.forEach(term => {
                        if (!term) {
                            warnings.push(`场景 ${scene.id} 的术语关联包含空值`);
                        }
                    });
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                totalChecks: scenes.length,
                passedChecks: scenes.length - errors.length - warnings.length
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 私有辅助方法

    /**
     * 验证场景数据有效性
     */
    isValidScene(scene) {
        return scene && 
               scene.id && 
               scene.scenario && 
               scene.type &&
               scene.poem_id;
    }

    /**
     * 分析场景类型分布
     */
    analyzeTypeDistribution(scenes) {
        const distribution = {};
        scenes.forEach(scene => {
            const type = scene.type || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * 分析诗歌关联
     */
    analyzePoemAssociations(scenes) {
        const poemDistribution = {};
        const poemScenes = {};
        let totalPoems = 0;

        scenes.forEach(scene => {
            const poemId = scene.poem_id;
            if (poemId) {
                poemDistribution[poemId] = (poemDistribution[poemId] || 0) + 1;
                if (!poemScenes[poemId]) {
                    poemScenes[poemId] = [];
                }
                poemScenes[poemId].push(scene);
                totalPoems++;
            }
        });

        // 获取场景最多的诗歌
        const topPoems = Object.entries(poemDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([poemId, count]) => ({
                poemId,
                count,
                scenes: poemScenes[poemId] || []
            }));

        return {
            poemDistribution,
            totalPoems,
            uniquePoems: Object.keys(poemDistribution).length,
            topPoems,
            averageScenesPerPoem: Object.keys(poemDistribution).length > 0 ? 
                (totalPoems / Object.keys(poemDistribution).length).toFixed(2) : 0
        };
    }

    /**
     * 分析角色关联
     */
    analyzeCharacterAssociations(scenes) {
        const characterDistribution = {};
        let totalCharacters = 0;
        let characterCount = 0;

        scenes.forEach(scene => {
            if (scene.characters && Array.isArray(scene.characters)) {
                scene.characters.forEach(character => {
                    if (character) {
                        characterDistribution[character] = (characterDistribution[character] || 0) + 1;
                        characterCount++;
                    }
                });
                totalCharacters++;
            }
        });

        return {
            characterDistribution,
            totalCharacters,
            characterCount,
            averageCharacters: totalCharacters > 0 ? (characterCount / totalCharacters).toFixed(2) : 0,
            uniqueCharacters: Object.keys(characterDistribution).length
        };
    }

    /**
     * 分析术语关联
     */
    analyzeTerminologyAssociations(scenes) {
        const terminologyDistribution = {};
        let totalTerminology = 0;
        let terminologyCount = 0;

        scenes.forEach(scene => {
            if (scene.terminology && Array.isArray(scene.terminology)) {
                scene.terminology.forEach(term => {
                    if (term) {
                        terminologyDistribution[term] = (terminologyDistribution[term] || 0) + 1;
                        terminologyCount++;
                    }
                });
                totalTerminology++;
            }
        });

        return {
            terminologyDistribution,
            totalTerminology,
            terminologyCount,
            averageTerminology: totalTerminology > 0 ? (terminologyCount / totalTerminology).toFixed(2) : 0,
            uniqueTerminology: Object.keys(terminologyDistribution).length
        };
    }

    /**
     * 计算质量分数
     */
    calculateQualityScore(scenes) {
        let score = 0;
        let totalChecks = 0;

        scenes.forEach(scene => {
            let sceneScore = 0;
            let sceneChecks = 0;

            // 基础字段检查
            if (scene.id) { sceneScore += 1; }
            if (scene.scenario) { sceneScore += 1; }
            if (scene.type) { sceneScore += 1; }
            if (scene.poem_id) { sceneScore += 1; }
            sceneChecks += 4;

            // 描述字段检查
            if (scene.description) { sceneScore += 1; }
            sceneChecks += 1;

            // 关联字段检查
            if (scene.characters && scene.characters.length > 0) { sceneScore += 1; }
            if (scene.terminology && scene.terminology.length > 0) { sceneScore += 1; }
            sceneChecks += 2;

            score += sceneScore;
            totalChecks += sceneChecks;
        });

        return totalChecks > 0 ? (score / totalChecks * 100).toFixed(2) : 0;
    }

    /**
     * 计算完整性
     */
    calculateCompleteness(scenes) {
        const requiredFields = ['id', 'scenario', 'type', 'poem_id'];
        let completeCount = 0;

        scenes.forEach(scene => {
            const hasAllRequired = requiredFields.every(field => scene[field]);
            if (hasAllRequired) completeCount++;
        });

        return scenes.length > 0 ? (completeCount / scenes.length * 100).toFixed(2) : 0;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(scenes) {
        const types = new Set();
        const poemIds = new Set();
        const characterTypes = new Set();
        const terminologyTypes = new Set();

        scenes.forEach(scene => {
            if (scene.type) types.add(scene.type);
            if (scene.poem_id) poemIds.add(scene.poem_id);
            if (scene.characters) {
                scene.characters.forEach(char => {
                    if (char) characterTypes.add(char);
                });
            }
            if (scene.terminology) {
                scene.terminology.forEach(term => {
                    if (term) terminologyTypes.add(term);
                });
            }
        });

        // 类型一致性：类型数量与场景数量的比例
        const typeConsistency = scenes.length > 0 ? (types.size / scenes.length * 100).toFixed(2) : 0;
        
        return parseFloat(typeConsistency);
    }

    /**
     * 获取最频繁的类型
     */
    getMostFrequentType(typeDistribution) {
        if (!typeDistribution || Object.keys(typeDistribution).length === 0) {
            return null;
        }
        return Object.entries(typeDistribution)
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    /**
     * 检查基础完整性
     */
    checkBasicIntegrity(scenes) {
        const validCount = scenes.filter(scene => this.isValidScene(scene)).length;
        return validCount === scenes.length;
    }

    /**
     * 检查类型分布
     */
    checkTypeDistribution(scenes) {
        const typeDistribution = this.analyzeTypeDistribution(scenes);
        const typeCount = Object.keys(typeDistribution).length;
        return typeCount >= 2 && typeCount <= 10; // 合理的类型数量范围
    }

    /**
     * 检查诗歌关联
     */
    checkPoemAssociations(scenes) {
        const poemAnalysis = this.analyzePoemAssociations(scenes);
        return poemAnalysis.totalPoems > 0;
    }

    /**
     * 检查角色关联
     */
    checkCharacterAssociations(scenes) {
        const characterAnalysis = this.analyzeCharacterAssociations(scenes);
        return characterAnalysis.totalCharacters > 0;
    }

    /**
     * 检查术语关联
     */
    checkTerminologyAssociations(scenes) {
        const terminologyAnalysis = this.analyzeTerminologyAssociations(scenes);
        return terminologyAnalysis.totalTerminology > 0;
    }

    /**
     * 获取场景类型
     */
    getSceneTypes(scenes) {
        const types = new Set();
        scenes.forEach(scene => {
            if (scene.type) types.add(scene.type);
        });
        return Array.from(types);
    }

    /**
     * 获取诗歌分布
     */
    getPoemDistribution(scenes) {
        const poemAnalysis = this.analyzePoemAssociations(scenes);
        return poemAnalysis.poemDistribution;
    }

    /**
     * 获取角色分布
     */
    getCharacterDistribution(scenes) {
        const characterAnalysis = this.analyzeCharacterAssociations(scenes);
        return characterAnalysis.characterDistribution;
    }

    /**
     * 格式化场景列表
     */
    formatSceneList(scenes) {
        return scenes.map(scene => ({
            id: scene.id,
            scenario: scene.scenario,
            type: scene.type,
            poem_id: scene.poem_id,
            description: scene.description || '',
            characters: scene.characters || [],
            terminology: scene.terminology || []
        }));
    }

    /**
     * 格式化类型分布
     */
    formatTypeBreakdown(scenes) {
        const distribution = this.analyzeTypeDistribution(scenes);
        return Object.entries(distribution).map(([type, count]) => ({
            type,
            count,
            percentage: ((count / scenes.length) * 100).toFixed(2)
        }));
    }

    /**
     * 格式化诗歌图表
     */
    formatPoemChart(scenes) {
        const poemAnalysis = this.analyzePoemAssociations(scenes);
        return Object.entries(poemAnalysis.poemDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([poemId, count]) => ({
                poemId,
                count,
                percentage: ((count / poemAnalysis.totalPoems) * 100).toFixed(2)
            }));
    }

    /**
     * 格式化角色矩阵
     */
    formatCharacterMatrix(scenes) {
        const characterAnalysis = this.analyzeCharacterAssociations(scenes);
        return Object.entries(characterAnalysis.characterDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([character, count]) => ({
                character,
                count,
                percentage: ((count / characterAnalysis.characterCount) * 100).toFixed(2)
            }));
    }

    /**
     * 生成关键洞察
     */
    generateKeyInsights(scenes) {
        const insights = [];
        const typeDistribution = this.analyzeTypeDistribution(scenes);
        const poemAnalysis = this.analyzePoemAssociations(scenes);
        const characterAnalysis = this.analyzeCharacterAssociations(scenes);

        // 场景类型洞察
        const mostCommonType = this.getMostFrequentType(typeDistribution);
        if (mostCommonType) {
            insights.push(`最常见的场景类型是"${mostCommonType}"`);
        }

        // 诗歌关联洞察
        if (poemAnalysis.totalPoems > 0) {
            insights.push(`场景覆盖${poemAnalysis.uniquePoems}首诗歌`);
        }

        // 角色关联洞察
        if (characterAnalysis.totalCharacters > 0) {
            insights.push(`场景涉及${characterAnalysis.uniqueCharacters}个不同角色`);
        }

        return insights;
    }

    /**
     * 生成建议
     */
    generateRecommendations(scenes) {
        const recommendations = [];
        const typeDistribution = this.analyzeTypeDistribution(scenes);
        const poemAnalysis = this.analyzePoemAssociations(scenes);
        const characterAnalysis = this.analyzeCharacterAssociations(scenes);

        // 类型分布建议
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('建议增加更多场景类型以丰富场景体系');
        }

        // 诗歌关联建议
        if (poemAnalysis.totalPoems === 0) {
            recommendations.push('建议为场景添加诗歌关联以增强叙事性');
        }

        // 角色关联建议
        if (characterAnalysis.totalCharacters === 0) {
            recommendations.push('建议为场景添加角色关联以增强互动性');
        }

        return recommendations;
    }

    /**
     * 分析趋势
     */
    analyzeTrends(scenes) {
        const trends = [];
        const typeDistribution = this.analyzeTypeDistribution(scenes);
        const poemAnalysis = this.analyzePoemAssociations(scenes);

        // 类型分布趋势
        const typeCount = Object.keys(typeDistribution).length;
        if (typeCount > 5) {
            trends.push('场景类型丰富，叙事多样');
        } else if (typeCount < 3) {
            trends.push('场景类型相对集中，可考虑扩展');
        }

        // 诗歌覆盖趋势
        if (poemAnalysis.uniquePoems > 10) {
            trends.push('诗歌覆盖广泛，内容丰富');
        } else if (poemAnalysis.uniquePoems < 5) {
            trends.push('诗歌覆盖相对集中，可考虑拓展');
        }

        return trends;
    }
}

module.exports = {
    SceneStatistics
}; 