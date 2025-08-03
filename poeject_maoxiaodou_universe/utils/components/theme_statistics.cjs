/**
 * 毛小豆宇宙主题统计器
 * 负责主题数据的统计分析和展示
 */

const { StatisticsGenerator } = require('./component_interfaces.cjs');
const { DataLoader } = require('./data_loader.cjs');

class ThemeStatistics extends StatisticsGenerator {
    constructor(dataLoader) {
        super(dataLoader);
        this.config = {
            enablePoemAnalysis: true,
            enableTypeDistribution: true,
            enableCategoryAnalysis: true,
            enableQualityCheck: true
        };
    }

    /**
     * 生成主题统计数据
     * @param {Object} data - 主题数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        try {
            if (!this.validateInput(data)) {
                throw new Error('无效的主题数据输入');
            }

            const themes = data.themes || [];
            const totalCount = themes.length;
            const validCount = themes.filter(theme => this.isValidTheme(theme)).length;
            const coverage = totalCount > 0 ? (validCount / totalCount * 100).toFixed(2) : 0;

            // 主题类型分布
            const typeDistribution = this.analyzeTypeDistribution(themes);
            
            // 主题分类分析
            const categoryAnalysis = this.config.enableCategoryAnalysis ? 
                this.analyzeCategoryDistribution(themes) : {};

            // 主题诗歌关联
            const poemAnalysis = this.config.enablePoemAnalysis ? 
                this.analyzePoemAssociations(themes) : {};

            // 质量评估
            const qualityScore = this.calculateQualityScore(themes);
            const completeness = this.calculateCompleteness(themes);
            const consistency = this.calculateConsistency(themes);

            return {
                totalCount,
                validCount,
                coverage: parseFloat(coverage),
                types: typeDistribution,
                distribution: {
                    byType: typeDistribution,
                    byCategory: categoryAnalysis.categoryDistribution || {},
                    byPoem: poemAnalysis.poemDistribution || {}
                },
                coverageDetails: {
                    totalThemes: totalCount,
                    validThemes: validCount,
                    invalidThemes: totalCount - validCount,
                    coveragePercentage: parseFloat(coverage)
                },
                qualityScore,
                completeness,
                consistency,
                details: {
                    categoryAnalysis,
                    poemAnalysis,
                    typeAnalysis: typeDistribution
                },
                stats: {
                    averageCategories: categoryAnalysis.averageCategories || 0,
                    averagePoems: poemAnalysis.averagePoems || 0,
                    mostFrequentType: this.getMostFrequentType(typeDistribution),
                    topThemes: this.getTopThemes(themes)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成主题分类检查点
     * @param {Object} data - 主题数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        try {
            const themes = data.themes || [];
            const checkpoints = [];

            // 基础数据完整性检查
            checkpoints.push({
                id: 'theme_basic_integrity',
                name: '主题基础数据完整性',
                status: this.checkBasicIntegrity(themes),
                description: '检查主题数据的基础完整性',
                priority: 'high'
            });

            // 主题类型分布检查
            checkpoints.push({
                id: 'theme_type_distribution',
                name: '主题类型分布合理性',
                status: this.checkTypeDistribution(themes),
                description: '检查主题类型分布是否合理',
                priority: 'medium'
            });

            // 主题分类关联检查
            checkpoints.push({
                id: 'theme_category_associations',
                name: '主题分类关联完整性',
                status: this.checkCategoryAssociations(themes),
                description: '检查主题分类关联的完整性',
                priority: 'high'
            });

            // 主题诗歌关联检查
            checkpoints.push({
                id: 'theme_poem_associations',
                name: '主题诗歌关联完整性',
                status: this.checkPoemAssociations(themes),
                description: '检查主题诗歌关联的完整性',
                priority: 'high'
            });

            return checkpoints;
        } catch (error) {
            return [{
                id: 'theme_checkpoints_error',
                name: '主题检查点生成错误',
                status: false,
                description: `生成检查点时发生错误: ${error.message}`,
                priority: 'high'
            }];
        }
    }

    /**
     * 生成主题智能展示数据
     * @param {Object} data - 主题数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        try {
            const themes = data.themes || [];
            
            return {
                summary: {
                    totalThemes: themes.length,
                    themeTypes: this.getThemeTypes(themes),
                    categoryDistribution: this.getCategoryDistribution(themes),
                    poemDistribution: this.getPoemDistribution(themes)
                },
                details: {
                    themeList: this.formatThemeList(themes),
                    typeBreakdown: this.formatTypeBreakdown(themes),
                    categoryChart: this.formatCategoryChart(themes),
                    poemMatrix: this.formatPoemMatrix(themes)
                },
                insights: {
                    keyInsights: this.generateKeyInsights(themes),
                    recommendations: this.generateRecommendations(themes),
                    trends: this.analyzeTrends(themes)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证主题数据完整性
     * @param {Object} data - 主题数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        try {
            const themes = data.themes || [];
            const errors = [];
            const warnings = [];

            // 检查必需字段
            themes.forEach((theme, index) => {
                if (!theme.id) {
                    errors.push(`主题 ${index} 缺少ID字段`);
                }
                if (!theme.name) {
                    warnings.push(`主题 ${index} 缺少name字段`);
                }
                if (!theme.type) {
                    warnings.push(`主题 ${index} 缺少type字段`);
                }
            });

            // 检查ID唯一性
            const ids = themes.map(theme => theme.id).filter(id => id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                errors.push('存在重复的主题ID');
            }

            // 检查分类关联有效性
            themes.forEach(theme => {
                if (theme.categories) {
                    theme.categories.forEach(category => {
                        if (!category.id || !category.name) {
                            warnings.push(`主题 ${theme.id} 的分类关联缺少必要字段`);
                        }
                    });
                }
            });

            // 检查诗歌关联有效性
            themes.forEach(theme => {
                if (theme.poems) {
                    theme.poems.forEach(poem => {
                        if (!poem.id || !poem.title) {
                            warnings.push(`主题 ${theme.id} 的诗歌关联缺少必要字段`);
                        }
                    });
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                totalChecks: themes.length,
                passedChecks: themes.length - errors.length - warnings.length
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 私有辅助方法

    /**
     * 验证主题数据有效性
     */
    isValidTheme(theme) {
        return theme && 
               theme.id && 
               theme.name;
    }

    /**
     * 分析主题类型分布
     */
    analyzeTypeDistribution(themes) {
        const distribution = {};
        themes.forEach(theme => {
            const type = theme.type || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * 分析主题分类分布
     */
    analyzeCategoryDistribution(themes) {
        const categoryDistribution = {};
        let totalCategories = 0;

        themes.forEach(theme => {
            if (theme.categories) {
                theme.categories.forEach(category => {
                    const categoryId = category.id || category.name;
                    if (categoryId) {
                        categoryDistribution[categoryId] = (categoryDistribution[categoryId] || 0) + 1;
                        totalCategories++;
                    }
                });
            }
        });

        // 计算每个分类的平均出现次数
        const averageCategories = Object.keys(categoryDistribution).length > 0 ? 
            (totalCategories / Object.keys(categoryDistribution).length).toFixed(2) : 0;

        return {
            categoryDistribution,
            totalCategories,
            averageCategories: parseFloat(averageCategories),
            uniqueCategories: Object.keys(categoryDistribution).length
        };
    }

    /**
     * 分析主题诗歌关联
     */
    analyzePoemAssociations(themes) {
        const poemDistribution = {};
        let totalPoems = 0;

        themes.forEach(theme => {
            if (theme.poems) {
                theme.poems.forEach(poem => {
                    const poemId = poem.id || poem.title;
                    if (poemId) {
                        poemDistribution[poemId] = (poemDistribution[poemId] || 0) + 1;
                        totalPoems++;
                    }
                });
            }
        });

        // 计算每个诗歌的平均出现次数
        const averagePoems = Object.keys(poemDistribution).length > 0 ? 
            (totalPoems / Object.keys(poemDistribution).length).toFixed(2) : 0;

        return {
            poemDistribution,
            totalPoems,
            averagePoems: parseFloat(averagePoems),
            uniquePoems: Object.keys(poemDistribution).length
        };
    }

    /**
     * 计算质量分数
     */
    calculateQualityScore(themes) {
        let score = 0;
        let totalChecks = 0;

        themes.forEach(theme => {
            let themeScore = 0;
            let themeChecks = 0;

            // 基础字段检查
            if (theme.id) { themeScore += 1; }
            if (theme.name) { themeScore += 1; }
            if (theme.type) { themeScore += 1; }
            themeChecks += 3;

            // 描述字段检查
            if (theme.description) { themeScore += 1; }
            if (theme.definition) { themeScore += 1; }
            themeChecks += 2;

            // 关联字段检查
            if (theme.categories && theme.categories.length > 0) { themeScore += 1; }
            if (theme.poems && theme.poems.length > 0) { themeScore += 1; }
            themeChecks += 2;

            score += themeScore;
            totalChecks += themeChecks;
        });

        return totalChecks > 0 ? (score / totalChecks * 100).toFixed(2) : 0;
    }

    /**
     * 计算完整性
     */
    calculateCompleteness(themes) {
        const requiredFields = ['id', 'name', 'type'];
        let completeCount = 0;

        themes.forEach(theme => {
            const hasAllRequired = requiredFields.every(field => theme[field]);
            if (hasAllRequired) completeCount++;
        });

        return themes.length > 0 ? (completeCount / themes.length * 100).toFixed(2) : 0;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(themes) {
        const types = new Set();
        const categoryTypes = new Set();
        const poemTypes = new Set();

        themes.forEach(theme => {
            if (theme.type) types.add(theme.type);
            if (theme.categories) {
                theme.categories.forEach(category => {
                    if (category.type) categoryTypes.add(category.type);
                });
            }
            if (theme.poems) {
                theme.poems.forEach(poem => {
                    if (poem.type) poemTypes.add(poem.type);
                });
            }
        });

        // 类型一致性：类型数量与主题数量的比例
        const typeConsistency = themes.length > 0 ? (types.size / themes.length * 100).toFixed(2) : 0;
        
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
     * 获取顶级主题
     */
    getTopThemes(themes) {
        return themes
            .filter(theme => theme.importance || theme.frequency)
            .sort((a, b) => (b.importance || 0) - (a.importance || 0))
            .slice(0, 5)
            .map(theme => ({
                id: theme.id,
                name: theme.name,
                importance: theme.importance || 0,
                frequency: theme.frequency || 0
            }));
    }

    /**
     * 检查基础完整性
     */
    checkBasicIntegrity(themes) {
        const validCount = themes.filter(theme => this.isValidTheme(theme)).length;
        return validCount === themes.length;
    }

    /**
     * 检查类型分布
     */
    checkTypeDistribution(themes) {
        const typeDistribution = this.analyzeTypeDistribution(themes);
        const typeCount = Object.keys(typeDistribution).length;
        return typeCount >= 2 && typeCount <= 10; // 合理的类型数量范围
    }

    /**
     * 检查分类关联
     */
    checkCategoryAssociations(themes) {
        const categoryAnalysis = this.analyzeCategoryDistribution(themes);
        return categoryAnalysis.totalCategories > 0;
    }

    /**
     * 检查诗歌关联
     */
    checkPoemAssociations(themes) {
        const poemAnalysis = this.analyzePoemAssociations(themes);
        return poemAnalysis.totalPoems > 0;
    }

    /**
     * 获取主题类型
     */
    getThemeTypes(themes) {
        const types = new Set();
        themes.forEach(theme => {
            if (theme.type) types.add(theme.type);
        });
        return Array.from(types);
    }

    /**
     * 获取分类分布
     */
    getCategoryDistribution(themes) {
        const categoryAnalysis = this.analyzeCategoryDistribution(themes);
        return categoryAnalysis.categoryDistribution;
    }

    /**
     * 获取诗歌分布
     */
    getPoemDistribution(themes) {
        const poemAnalysis = this.analyzePoemAssociations(themes);
        return poemAnalysis.poemDistribution;
    }

    /**
     * 格式化主题列表
     */
    formatThemeList(themes) {
        return themes.map(theme => ({
            id: theme.id,
            name: theme.name,
            type: theme.type,
            description: theme.description || '',
            categories: theme.categories || [],
            poems: theme.poems || []
        }));
    }

    /**
     * 格式化类型分布
     */
    formatTypeBreakdown(themes) {
        const distribution = this.analyzeTypeDistribution(themes);
        return Object.entries(distribution).map(([type, count]) => ({
            type,
            count,
            percentage: ((count / themes.length) * 100).toFixed(2)
        }));
    }

    /**
     * 格式化分类图表
     */
    formatCategoryChart(themes) {
        const categoryAnalysis = this.analyzeCategoryDistribution(themes);
        return Object.entries(categoryAnalysis.categoryDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([categoryId, count]) => ({
                categoryId,
                count,
                percentage: ((count / categoryAnalysis.totalCategories) * 100).toFixed(2)
            }));
    }

    /**
     * 格式化诗歌矩阵
     */
    formatPoemMatrix(themes) {
        const poemAnalysis = this.analyzePoemAssociations(themes);
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
     * 生成关键洞察
     */
    generateKeyInsights(themes) {
        const insights = [];
        const typeDistribution = this.analyzeTypeDistribution(themes);
        const categoryAnalysis = this.analyzeCategoryDistribution(themes);
        const poemAnalysis = this.analyzePoemAssociations(themes);

        // 主题类型洞察
        const mostCommonType = this.getMostFrequentType(typeDistribution);
        if (mostCommonType) {
            insights.push(`最常见的主题类型是"${mostCommonType}"`);
        }

        // 分类洞察
        if (categoryAnalysis.totalCategories > 0) {
            insights.push(`主题涉及${categoryAnalysis.uniqueCategories}个不同分类`);
        }

        // 诗歌关联洞察
        if (poemAnalysis.totalPoems > 0) {
            insights.push(`主题关联${poemAnalysis.uniquePoems}首诗歌`);
        }

        return insights;
    }

    /**
     * 生成建议
     */
    generateRecommendations(themes) {
        const recommendations = [];
        const typeDistribution = this.analyzeTypeDistribution(themes);
        const categoryAnalysis = this.analyzeCategoryDistribution(themes);
        const poemAnalysis = this.analyzePoemAssociations(themes);

        // 类型分布建议
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('建议增加更多主题类型以丰富主题体系');
        }

        // 分类关联建议
        if (categoryAnalysis.totalCategories === 0) {
            recommendations.push('建议为主题添加分类关联以增强组织性');
        }

        // 诗歌关联建议
        if (poemAnalysis.totalPoems === 0) {
            recommendations.push('建议为主题添加诗歌关联以增强内容性');
        }

        return recommendations;
    }

    /**
     * 分析趋势
     */
    analyzeTrends(themes) {
        const trends = [];
        const typeDistribution = this.analyzeTypeDistribution(themes);
        const categoryAnalysis = this.analyzeCategoryDistribution(themes);

        // 类型分布趋势
        const typeCount = Object.keys(typeDistribution).length;
        if (typeCount > 5) {
            trends.push('主题类型丰富，体系完善');
        } else if (typeCount < 3) {
            trends.push('主题类型相对单一，可考虑扩展');
        }

        // 分类分布趋势
        if (categoryAnalysis.uniqueCategories > 10) {
            trends.push('分类覆盖广泛，组织清晰');
        } else if (categoryAnalysis.uniqueCategories < 5) {
            trends.push('分类相对集中，可考虑细化');
        }

        return trends;
    }
}

module.exports = {
    ThemeStatistics
}; 