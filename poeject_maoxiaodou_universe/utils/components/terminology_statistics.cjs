/**
 * 毛小豆宇宙术语统计器
 * 负责术语数据的统计分析和展示
 */

const { StatisticsGenerator } = require('./component_interfaces.cjs');
const { DataLoader } = require('./data_loader.cjs');

class TerminologyStatistics extends StatisticsGenerator {
    constructor(dataLoader) {
        super(dataLoader);
        this.config = {
            enableCategoryAnalysis: true,
            enableTypeDistribution: true,
            enableUsageAnalysis: true,
            enableQualityCheck: true
        };
    }

    /**
     * 生成术语统计数据
     * @param {Object} data - 术语数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        try {
            if (!this.validateInput(data)) {
                throw new Error('无效的术语数据输入');
            }

            const terminology = data.terminology || [];
            const totalCount = terminology.length;
            const validCount = terminology.filter(term => this.isValidTerm(term)).length;
            const coverage = totalCount > 0 ? (validCount / totalCount * 100).toFixed(2) : 0;

            // 术语类型分布
            const typeDistribution = this.analyzeTypeDistribution(terminology);
            
            // 术语分类分析
            const categoryAnalysis = this.config.enableCategoryAnalysis ? 
                this.analyzeCategoryDistribution(terminology) : {};

            // 术语使用频率分析
            const usageAnalysis = this.config.enableUsageAnalysis ? 
                this.analyzeUsageFrequency(terminology) : {};

            // 质量评估
            const qualityScore = this.calculateQualityScore(terminology);
            const completeness = this.calculateCompleteness(terminology);
            const consistency = this.calculateConsistency(terminology);

            return {
                totalCount,
                validCount,
                coverage: parseFloat(coverage),
                types: typeDistribution,
                distribution: {
                    byType: typeDistribution,
                    byCategory: categoryAnalysis.categoryDistribution || {},
                    byUsage: usageAnalysis.usageDistribution || {}
                },
                coverageDetails: {
                    totalTerms: totalCount,
                    validTerms: validCount,
                    invalidTerms: totalCount - validCount,
                    coveragePercentage: parseFloat(coverage)
                },
                qualityScore,
                completeness,
                consistency,
                details: {
                    categoryAnalysis,
                    usageAnalysis,
                    typeAnalysis: typeDistribution
                },
                stats: {
                    averageCategories: categoryAnalysis.averageCategories || 0,
                    averageUsage: usageAnalysis.averageUsage || 0,
                    mostFrequentType: this.getMostFrequentType(typeDistribution),
                    topTerms: this.getTopTerms(terminology)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成术语分类检查点
     * @param {Object} data - 术语数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        try {
            const terminology = data.terminology || [];
            const checkpoints = [];

            // 基础数据完整性检查
            checkpoints.push({
                id: 'terminology_basic_integrity',
                name: '术语基础数据完整性',
                status: this.checkBasicIntegrity(terminology),
                description: '检查术语数据的基础完整性',
                priority: 'high'
            });

            // 术语类型分布检查
            checkpoints.push({
                id: 'terminology_type_distribution',
                name: '术语类型分布合理性',
                status: this.checkTypeDistribution(terminology),
                description: '检查术语类型分布是否合理',
                priority: 'medium'
            });

            // 术语分类关联检查
            checkpoints.push({
                id: 'terminology_category_associations',
                name: '术语分类关联完整性',
                status: this.checkCategoryAssociations(terminology),
                description: '检查术语分类关联的完整性',
                priority: 'high'
            });

            // 术语使用频率检查
            checkpoints.push({
                id: 'terminology_usage_frequency',
                name: '术语使用频率合理性',
                status: this.checkUsageFrequency(terminology),
                description: '检查术语使用频率是否合理',
                priority: 'medium'
            });

            return checkpoints;
        } catch (error) {
            return [{
                id: 'terminology_checkpoints_error',
                name: '术语检查点生成错误',
                status: false,
                description: `生成检查点时发生错误: ${error.message}`,
                priority: 'high'
            }];
        }
    }

    /**
     * 生成术语智能展示数据
     * @param {Object} data - 术语数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        try {
            const terminology = data.terminology || [];
            
            return {
                summary: {
                    totalTerms: terminology.length,
                    termTypes: this.getTermTypes(terminology),
                    categoryDistribution: this.getCategoryDistribution(terminology),
                    usageDistribution: this.getUsageDistribution(terminology)
                },
                details: {
                    termList: this.formatTermList(terminology),
                    typeBreakdown: this.formatTypeBreakdown(terminology),
                    categoryChart: this.formatCategoryChart(terminology),
                    usageMatrix: this.formatUsageMatrix(terminology)
                },
                insights: {
                    keyInsights: this.generateKeyInsights(terminology),
                    recommendations: this.generateRecommendations(terminology),
                    trends: this.analyzeTrends(terminology)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证术语数据完整性
     * @param {Object} data - 术语数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        try {
            const terminology = data.terminology || [];
            const errors = [];
            const warnings = [];

            // 检查必需字段
            terminology.forEach((term, index) => {
                if (!term.id) {
                    errors.push(`术语 ${index} 缺少ID字段`);
                }
                if (!term.name) {
                    warnings.push(`术语 ${index} 缺少name字段`);
                }
                if (!term.type) {
                    warnings.push(`术语 ${index} 缺少type字段`);
                }
            });

            // 检查ID唯一性
            const ids = terminology.map(term => term.id).filter(id => id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                errors.push('存在重复的术语ID');
            }

            // 检查分类关联有效性
            terminology.forEach(term => {
                if (term.categories) {
                    term.categories.forEach(category => {
                        if (!category.id || !category.name) {
                            warnings.push(`术语 ${term.id} 的分类关联缺少必要字段`);
                        }
                    });
                }
            });

            // 检查使用频率有效性
            terminology.forEach(term => {
                if (term.usage && typeof term.usage !== 'number') {
                    warnings.push(`术语 ${term.id} 的使用频率字段格式不正确`);
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                totalChecks: terminology.length,
                passedChecks: terminology.length - errors.length - warnings.length
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 私有辅助方法

    /**
     * 验证术语数据有效性
     */
    isValidTerm(term) {
        return term && 
               term.id && 
               term.name;
    }

    /**
     * 分析术语类型分布
     */
    analyzeTypeDistribution(terminology) {
        const distribution = {};
        terminology.forEach(term => {
            const type = term.type || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * 分析术语分类分布
     */
    analyzeCategoryDistribution(terminology) {
        const categoryDistribution = {};
        let totalCategories = 0;

        terminology.forEach(term => {
            if (term.categories) {
                term.categories.forEach(category => {
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
     * 分析术语使用频率
     */
    analyzeUsageFrequency(terminology) {
        const usageDistribution = {};
        let totalUsage = 0;
        let usageCount = 0;

        terminology.forEach(term => {
            const usage = term.usage || 1;
            usageDistribution[term.id] = usage;
            totalUsage += usage;
            usageCount++;
        });

        return {
            usageDistribution,
            totalUsage,
            usageCount,
            averageUsage: usageCount > 0 ? (totalUsage / usageCount).toFixed(2) : 0,
            uniqueTerms: Object.keys(usageDistribution).length
        };
    }

    /**
     * 计算质量分数
     */
    calculateQualityScore(terminology) {
        let score = 0;
        let totalChecks = 0;

        terminology.forEach(term => {
            let termScore = 0;
            let termChecks = 0;

            // 基础字段检查
            if (term.id) { termScore += 1; }
            if (term.name) { termScore += 1; }
            if (term.type) { termScore += 1; }
            termChecks += 3;

            // 描述字段检查
            if (term.definition) { termScore += 1; }
            if (term.description) { termScore += 1; }
            termChecks += 2;

            // 关联字段检查
            if (term.categories && term.categories.length > 0) { termScore += 1; }
            if (term.usage && term.usage > 0) { termScore += 1; }
            termChecks += 2;

            score += termScore;
            totalChecks += termChecks;
        });

        return totalChecks > 0 ? (score / totalChecks * 100).toFixed(2) : 0;
    }

    /**
     * 计算完整性
     */
    calculateCompleteness(terminology) {
        const requiredFields = ['id', 'name', 'type'];
        let completeCount = 0;

        terminology.forEach(term => {
            const hasAllRequired = requiredFields.every(field => term[field]);
            if (hasAllRequired) completeCount++;
        });

        return terminology.length > 0 ? (completeCount / terminology.length * 100).toFixed(2) : 0;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(terminology) {
        const types = new Set();
        const categoryTypes = new Set();
        const usageTypes = new Set();

        terminology.forEach(term => {
            if (term.type) types.add(term.type);
            if (term.categories) {
                term.categories.forEach(category => {
                    if (category.type) categoryTypes.add(category.type);
                });
            }
            if (term.usage && typeof term.usage === 'number') {
                usageTypes.add('numeric');
            }
        });

        // 类型一致性：类型数量与术语数量的比例
        const typeConsistency = terminology.length > 0 ? (types.size / terminology.length * 100).toFixed(2) : 0;
        
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
     * 获取顶级术语
     */
    getTopTerms(terminology) {
        return terminology
            .filter(term => term.importance || term.usage)
            .sort((a, b) => (b.importance || 0) - (a.importance || 0))
            .slice(0, 5)
            .map(term => ({
                id: term.id,
                name: term.name,
                importance: term.importance || 0,
                usage: term.usage || 0
            }));
    }

    /**
     * 检查基础完整性
     */
    checkBasicIntegrity(terminology) {
        const validCount = terminology.filter(term => this.isValidTerm(term)).length;
        return validCount === terminology.length;
    }

    /**
     * 检查类型分布
     */
    checkTypeDistribution(terminology) {
        const typeDistribution = this.analyzeTypeDistribution(terminology);
        const typeCount = Object.keys(typeDistribution).length;
        return typeCount >= 2 && typeCount <= 10; // 合理的类型数量范围
    }

    /**
     * 检查分类关联
     */
    checkCategoryAssociations(terminology) {
        const categoryAnalysis = this.analyzeCategoryDistribution(terminology);
        return categoryAnalysis.totalCategories > 0;
    }

    /**
     * 检查使用频率
     */
    checkUsageFrequency(terminology) {
        const usageAnalysis = this.analyzeUsageFrequency(terminology);
        return usageAnalysis.averageUsage > 0;
    }

    /**
     * 获取术语类型
     */
    getTermTypes(terminology) {
        const types = new Set();
        terminology.forEach(term => {
            if (term.type) types.add(term.type);
        });
        return Array.from(types);
    }

    /**
     * 获取分类分布
     */
    getCategoryDistribution(terminology) {
        const categoryAnalysis = this.analyzeCategoryDistribution(terminology);
        return categoryAnalysis.categoryDistribution;
    }

    /**
     * 获取使用分布
     */
    getUsageDistribution(terminology) {
        const usageAnalysis = this.analyzeUsageFrequency(terminology);
        return usageAnalysis.usageDistribution;
    }

    /**
     * 格式化术语列表
     */
    formatTermList(terminology) {
        return terminology.map(term => ({
            id: term.id,
            name: term.name,
            type: term.type,
            definition: term.definition || '',
            categories: term.categories || [],
            usage: term.usage || 0
        }));
    }

    /**
     * 格式化类型分布
     */
    formatTypeBreakdown(terminology) {
        const distribution = this.analyzeTypeDistribution(terminology);
        return Object.entries(distribution).map(([type, count]) => ({
            type,
            count,
            percentage: ((count / terminology.length) * 100).toFixed(2)
        }));
    }

    /**
     * 格式化分类图表
     */
    formatCategoryChart(terminology) {
        const categoryAnalysis = this.analyzeCategoryDistribution(terminology);
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
     * 格式化使用矩阵
     */
    formatUsageMatrix(terminology) {
        const usageAnalysis = this.analyzeUsageFrequency(terminology);
        return Object.entries(usageAnalysis.usageDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([termId, usage]) => ({
                termId,
                usage,
                percentage: ((usage / usageAnalysis.totalUsage) * 100).toFixed(2)
            }));
    }

    /**
     * 生成关键洞察
     */
    generateKeyInsights(terminology) {
        const insights = [];
        const typeDistribution = this.analyzeTypeDistribution(terminology);
        const categoryAnalysis = this.analyzeCategoryDistribution(terminology);
        const usageAnalysis = this.analyzeUsageFrequency(terminology);

        // 术语类型洞察
        const mostCommonType = this.getMostFrequentType(typeDistribution);
        if (mostCommonType) {
            insights.push(`最常见的术语类型是"${mostCommonType}"`);
        }

        // 分类洞察
        if (categoryAnalysis.totalCategories > 0) {
            insights.push(`术语涉及${categoryAnalysis.uniqueCategories}个不同分类`);
        }

        // 使用频率洞察
        if (usageAnalysis.totalUsage > 0) {
            insights.push(`术语平均使用频率为${usageAnalysis.averageUsage}次`);
        }

        return insights;
    }

    /**
     * 生成建议
     */
    generateRecommendations(terminology) {
        const recommendations = [];
        const typeDistribution = this.analyzeTypeDistribution(terminology);
        const categoryAnalysis = this.analyzeCategoryDistribution(terminology);
        const usageAnalysis = this.analyzeUsageFrequency(terminology);

        // 类型分布建议
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('建议增加更多术语类型以丰富术语体系');
        }

        // 分类关联建议
        if (categoryAnalysis.totalCategories === 0) {
            recommendations.push('建议为术语添加分类关联以增强组织性');
        }

        // 使用频率建议
        if (usageAnalysis.averageUsage < 1) {
            recommendations.push('建议增加术语的使用频率以提升活跃度');
        }

        return recommendations;
    }

    /**
     * 分析趋势
     */
    analyzeTrends(terminology) {
        const trends = [];
        const typeDistribution = this.analyzeTypeDistribution(terminology);
        const categoryAnalysis = this.analyzeCategoryDistribution(terminology);

        // 类型分布趋势
        const typeCount = Object.keys(typeDistribution).length;
        if (typeCount > 5) {
            trends.push('术语类型丰富，体系完善');
        } else if (typeCount < 3) {
            trends.push('术语类型相对单一，可考虑扩展');
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
    TerminologyStatistics
}; 