/**
 * 毛小豆宇宙诗歌统计器
 * 负责诗歌数据的统计分析和展示
 */

const { StatisticsGenerator } = require('./component_interfaces.cjs');
const { DataLoader } = require('./data_loader.cjs');

class PoemStatistics extends StatisticsGenerator {
    constructor(dataLoader) {
        super(dataLoader);
        this.config = {
            enableThemeAnalysis: true,
            enableSceneAnalysis: true,
            enableTypeDistribution: true,
            enableQualityCheck: true
        };
    }

    /**
     * 生成诗歌统计数据
     * @param {Object} data - 诗歌数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        try {
            if (!this.validateInput(data)) {
                throw new Error('无效的诗歌数据输入');
            }

            const poems = data.poems || [];
            const totalCount = poems.length;
            const validCount = poems.filter(poem => this.isValidPoem(poem)).length;
            const coverage = totalCount > 0 ? (validCount / totalCount * 100).toFixed(2) : 0;

            // 诗歌类型分布
            const typeDistribution = this.analyzeTypeDistribution(poems);
            
            // 诗歌主题分布
            const themeAnalysis = this.config.enableThemeAnalysis ? 
                this.analyzeThemeDistribution(poems) : {};

            // 诗歌场景关联
            const sceneAnalysis = this.config.enableSceneAnalysis ? 
                this.analyzeSceneAssociations(poems) : {};

            // 质量评估
            const qualityScore = this.calculateQualityScore(poems);
            const completeness = this.calculateCompleteness(poems);
            const consistency = this.calculateConsistency(poems);

            return {
                totalCount,
                validCount,
                coverage: parseFloat(coverage),
                types: typeDistribution,
                distribution: {
                    byType: typeDistribution,
                    byTheme: themeAnalysis.themeDistribution || {},
                    byScene: sceneAnalysis.sceneDistribution || {}
                },
                coverageDetails: {
                    totalPoems: totalCount,
                    validPoems: validCount,
                    invalidPoems: totalCount - validCount,
                    coveragePercentage: parseFloat(coverage)
                },
                qualityScore,
                completeness,
                consistency,
                details: {
                    themeAnalysis,
                    sceneAnalysis,
                    typeAnalysis: typeDistribution
                },
                stats: {
                    averageThemes: themeAnalysis.averageThemes || 0,
                    averageScenes: sceneAnalysis.averageScenes || 0,
                    mostFrequentType: this.getMostFrequentType(typeDistribution),
                    topPoems: this.getTopPoems(poems)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成诗歌分类检查点
     * @param {Object} data - 诗歌数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        try {
            const poems = data.poems || [];
            const checkpoints = [];

            // 基础数据完整性检查
            checkpoints.push({
                id: 'poem_basic_integrity',
                name: '诗歌基础数据完整性',
                status: this.checkBasicIntegrity(poems),
                description: '检查诗歌数据的基础完整性',
                priority: 'high'
            });

            // 诗歌类型分布检查
            checkpoints.push({
                id: 'poem_type_distribution',
                name: '诗歌类型分布合理性',
                status: this.checkTypeDistribution(poems),
                description: '检查诗歌类型分布是否合理',
                priority: 'medium'
            });

            // 诗歌主题关联检查
            checkpoints.push({
                id: 'poem_theme_associations',
                name: '诗歌主题关联完整性',
                status: this.checkThemeAssociations(poems),
                description: '检查诗歌主题关联的完整性',
                priority: 'high'
            });

            // 诗歌场景关联检查
            checkpoints.push({
                id: 'poem_scene_associations',
                name: '诗歌场景关联完整性',
                status: this.checkSceneAssociations(poems),
                description: '检查诗歌场景关联的完整性',
                priority: 'high'
            });

            return checkpoints;
        } catch (error) {
            return [{
                id: 'poem_checkpoints_error',
                name: '诗歌检查点生成错误',
                status: false,
                description: `生成检查点时发生错误: ${error.message}`,
                priority: 'high'
            }];
        }
    }

    /**
     * 生成诗歌智能展示数据
     * @param {Object} data - 诗歌数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        try {
            const poems = data.poems || [];
            
            return {
                summary: {
                    totalPoems: poems.length,
                    poemTypes: this.getPoemTypes(poems),
                    themeDistribution: this.getThemeDistribution(poems),
                    sceneDistribution: this.getSceneDistribution(poems)
                },
                details: {
                    poemList: this.formatPoemList(poems),
                    typeBreakdown: this.formatTypeBreakdown(poems),
                    themeChart: this.formatThemeChart(poems),
                    sceneMatrix: this.formatSceneMatrix(poems)
                },
                insights: {
                    keyInsights: this.generateKeyInsights(poems),
                    recommendations: this.generateRecommendations(poems),
                    trends: this.analyzeTrends(poems)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证诗歌数据完整性
     * @param {Object} data - 诗歌数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        try {
            const poems = data.poems || [];
            const errors = [];
            const warnings = [];

            // 检查必需字段
            poems.forEach((poem, index) => {
                if (!poem.id) {
                    errors.push(`诗歌 ${index} 缺少ID字段`);
                }
                if (!poem.title) {
                    warnings.push(`诗歌 ${index} 缺少title字段`);
                }
                if (!poem.type) {
                    warnings.push(`诗歌 ${index} 缺少type字段`);
                }
            });

            // 检查ID唯一性
            const ids = poems.map(poem => poem.id).filter(id => id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                errors.push('存在重复的诗歌ID');
            }

            // 检查主题关联有效性
            poems.forEach(poem => {
                if (poem.themes) {
                    poem.themes.forEach(theme => {
                        if (!theme.id || !theme.name) {
                            warnings.push(`诗歌 ${poem.id} 的主题关联缺少必要字段`);
                        }
                    });
                }
            });

            // 检查场景关联有效性
            poems.forEach(poem => {
                if (poem.scenes) {
                    poem.scenes.forEach(scene => {
                        if (!scene.id || !scene.name) {
                            warnings.push(`诗歌 ${poem.id} 的场景关联缺少必要字段`);
                        }
                    });
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                totalChecks: poems.length,
                passedChecks: poems.length - errors.length - warnings.length
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 私有辅助方法

    /**
     * 验证诗歌数据有效性
     */
    isValidPoem(poem) {
        return poem && 
               poem.id && 
               poem.title && 
               poem.type;
    }

    /**
     * 分析诗歌类型分布
     */
    analyzeTypeDistribution(poems) {
        const distribution = {};
        poems.forEach(poem => {
            const type = poem.type || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * 分析诗歌主题分布
     */
    analyzeThemeDistribution(poems) {
        const themeDistribution = {};
        const themeCounts = {};
        let totalThemes = 0;

        poems.forEach(poem => {
            if (poem.themes) {
                poem.themes.forEach(theme => {
                    const themeId = theme.id || theme.name;
                    if (themeId) {
                        themeDistribution[themeId] = (themeDistribution[themeId] || 0) + 1;
                        totalThemes++;
                    }
                });
            }
        });

        // 计算每个主题的平均出现次数
        const averageThemes = Object.keys(themeDistribution).length > 0 ? 
            (totalThemes / Object.keys(themeDistribution).length).toFixed(2) : 0;

        return {
            themeDistribution,
            totalThemes,
            averageThemes: parseFloat(averageThemes),
            uniqueThemes: Object.keys(themeDistribution).length
        };
    }

    /**
     * 分析诗歌场景关联
     */
    analyzeSceneAssociations(poems) {
        const sceneDistribution = {};
        const sceneCounts = {};
        let totalScenes = 0;

        poems.forEach(poem => {
            if (poem.scenes) {
                poem.scenes.forEach(scene => {
                    const sceneId = scene.id || scene.name;
                    if (sceneId) {
                        sceneDistribution[sceneId] = (sceneDistribution[sceneId] || 0) + 1;
                        totalScenes++;
                    }
                });
            }
        });

        // 计算每个场景的平均出现次数
        const averageScenes = Object.keys(sceneDistribution).length > 0 ? 
            (totalScenes / Object.keys(sceneDistribution).length).toFixed(2) : 0;

        return {
            sceneDistribution,
            totalScenes,
            averageScenes: parseFloat(averageScenes),
            uniqueScenes: Object.keys(sceneDistribution).length
        };
    }

    /**
     * 计算质量分数
     */
    calculateQualityScore(poems) {
        let score = 0;
        let totalChecks = 0;

        poems.forEach(poem => {
            let poemScore = 0;
            let poemChecks = 0;

            // 基础字段检查
            if (poem.id) { poemScore += 1; }
            if (poem.title) { poemScore += 1; }
            if (poem.type) { poemScore += 1; }
            poemChecks += 3;

            // 内容字段检查
            if (poem.content) { poemScore += 1; }
            if (poem.description) { poemScore += 1; }
            poemChecks += 2;

            // 关联字段检查
            if (poem.themes && poem.themes.length > 0) { poemScore += 1; }
            if (poem.scenes && poem.scenes.length > 0) { poemScore += 1; }
            poemChecks += 2;

            score += poemScore;
            totalChecks += poemChecks;
        });

        return totalChecks > 0 ? (score / totalChecks * 100).toFixed(2) : 0;
    }

    /**
     * 计算完整性
     */
    calculateCompleteness(poems) {
        const requiredFields = ['id', 'title', 'type'];
        let completeCount = 0;

        poems.forEach(poem => {
            const hasAllRequired = requiredFields.every(field => poem[field]);
            if (hasAllRequired) completeCount++;
        });

        return poems.length > 0 ? (completeCount / poems.length * 100).toFixed(2) : 0;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(poems) {
        const types = new Set();
        const themeTypes = new Set();
        const sceneTypes = new Set();

        poems.forEach(poem => {
            if (poem.type) types.add(poem.type);
            if (poem.themes) {
                poem.themes.forEach(theme => {
                    if (theme.type) themeTypes.add(theme.type);
                });
            }
            if (poem.scenes) {
                poem.scenes.forEach(scene => {
                    if (scene.type) sceneTypes.add(scene.type);
                });
            }
        });

        // 类型一致性：类型数量与诗歌数量的比例
        const typeConsistency = poems.length > 0 ? (types.size / poems.length * 100).toFixed(2) : 0;
        
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
     * 获取顶级诗歌
     */
    getTopPoems(poems) {
        return poems
            .filter(poem => poem.rating || poem.importance)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
            .map(poem => ({
                id: poem.id,
                title: poem.title,
                rating: poem.rating || 0,
                importance: poem.importance || 'normal'
            }));
    }

    /**
     * 检查基础完整性
     */
    checkBasicIntegrity(poems) {
        const validCount = poems.filter(poem => this.isValidPoem(poem)).length;
        return validCount === poems.length;
    }

    /**
     * 检查类型分布
     */
    checkTypeDistribution(poems) {
        const typeDistribution = this.analyzeTypeDistribution(poems);
        const typeCount = Object.keys(typeDistribution).length;
        return typeCount >= 2 && typeCount <= 10; // 合理的类型数量范围
    }

    /**
     * 检查主题关联
     */
    checkThemeAssociations(poems) {
        const themeAnalysis = this.analyzeThemeDistribution(poems);
        return themeAnalysis.totalThemes > 0;
    }

    /**
     * 检查场景关联
     */
    checkSceneAssociations(poems) {
        const sceneAnalysis = this.analyzeSceneAssociations(poems);
        return sceneAnalysis.totalScenes > 0;
    }

    /**
     * 获取诗歌类型
     */
    getPoemTypes(poems) {
        const types = new Set();
        poems.forEach(poem => {
            if (poem.type) types.add(poem.type);
        });
        return Array.from(types);
    }

    /**
     * 获取主题分布
     */
    getThemeDistribution(poems) {
        const themeAnalysis = this.analyzeThemeDistribution(poems);
        return themeAnalysis.themeDistribution;
    }

    /**
     * 获取场景分布
     */
    getSceneDistribution(poems) {
        const sceneAnalysis = this.analyzeSceneAssociations(poems);
        return sceneAnalysis.sceneDistribution;
    }

    /**
     * 格式化诗歌列表
     */
    formatPoemList(poems) {
        return poems.map(poem => ({
            id: poem.id,
            title: poem.title,
            type: poem.type,
            description: poem.description || '',
            themes: poem.themes || [],
            scenes: poem.scenes || []
        }));
    }

    /**
     * 格式化类型分布
     */
    formatTypeBreakdown(poems) {
        const distribution = this.analyzeTypeDistribution(poems);
        return Object.entries(distribution).map(([type, count]) => ({
            type,
            count,
            percentage: ((count / poems.length) * 100).toFixed(2)
        }));
    }

    /**
     * 格式化主题图表
     */
    formatThemeChart(poems) {
        const themeAnalysis = this.analyzeThemeDistribution(poems);
        return Object.entries(themeAnalysis.themeDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([themeId, count]) => ({
                themeId,
                count,
                percentage: ((count / themeAnalysis.totalThemes) * 100).toFixed(2)
            }));
    }

    /**
     * 格式化场景矩阵
     */
    formatSceneMatrix(poems) {
        const sceneAnalysis = this.analyzeSceneAssociations(poems);
        return Object.entries(sceneAnalysis.sceneDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([sceneId, count]) => ({
                sceneId,
                count,
                percentage: ((count / sceneAnalysis.totalScenes) * 100).toFixed(2)
            }));
    }

    /**
     * 生成关键洞察
     */
    generateKeyInsights(poems) {
        const insights = [];
        const typeDistribution = this.analyzeTypeDistribution(poems);
        const themeAnalysis = this.analyzeThemeDistribution(poems);
        const sceneAnalysis = this.analyzeSceneAssociations(poems);

        // 诗歌类型洞察
        const mostCommonType = this.getMostFrequentType(typeDistribution);
        if (mostCommonType) {
            insights.push(`最常见的诗歌类型是"${mostCommonType}"`);
        }

        // 主题洞察
        if (themeAnalysis.totalThemes > 0) {
            insights.push(`诗歌涉及${themeAnalysis.uniqueThemes}个不同主题`);
        }

        // 场景洞察
        if (sceneAnalysis.totalScenes > 0) {
            insights.push(`诗歌涉及${sceneAnalysis.uniqueScenes}个不同场景`);
        }

        return insights;
    }

    /**
     * 生成建议
     */
    generateRecommendations(poems) {
        const recommendations = [];
        const typeDistribution = this.analyzeTypeDistribution(poems);
        const themeAnalysis = this.analyzeThemeDistribution(poems);
        const sceneAnalysis = this.analyzeSceneAssociations(poems);

        // 类型分布建议
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('建议增加更多诗歌类型以丰富诗歌体系');
        }

        // 主题关联建议
        if (themeAnalysis.totalThemes === 0) {
            recommendations.push('建议为诗歌添加主题关联以增强内容深度');
        }

        // 场景关联建议
        if (sceneAnalysis.totalScenes === 0) {
            recommendations.push('建议为诗歌添加场景关联以增强叙事性');
        }

        return recommendations;
    }

    /**
     * 分析趋势
     */
    analyzeTrends(poems) {
        const trends = [];
        const typeDistribution = this.analyzeTypeDistribution(poems);
        const themeAnalysis = this.analyzeThemeDistribution(poems);

        // 类型分布趋势
        const typeCount = Object.keys(typeDistribution).length;
        if (typeCount > 5) {
            trends.push('诗歌类型丰富，创作多样');
        } else if (typeCount < 3) {
            trends.push('诗歌类型相对集中，可考虑扩展');
        }

        // 主题分布趋势
        if (themeAnalysis.uniqueThemes > 10) {
            trends.push('主题覆盖广泛，内容丰富');
        } else if (themeAnalysis.uniqueThemes < 5) {
            trends.push('主题相对集中，可考虑拓展主题范围');
        }

        return trends;
    }
}

module.exports = {
    PoemStatistics
}; 