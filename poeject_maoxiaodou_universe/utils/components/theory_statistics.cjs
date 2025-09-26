/**
 * 毛小豆宇宙理论统计器
 * 负责理论框架数据的统计分析和展示
 */

const { StatisticsGenerator } = require('./component_interfaces.cjs');
const { DataLoader } = require('./data_loader.cjs');

class TheoryStatistics extends StatisticsGenerator {
    constructor(dataLoader) {
        super(dataLoader);
        this.config = {
            enableFrameworkAnalysis: true,
            enableApplicationAnalysis: true,
            enableCompletenessCheck: true,
            enableQualityCheck: true
        };
    }

    /**
     * 生成理论统计数据
     * @param {Object} data - 理论数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        try {
            if (!this.validateInput(data)) {
                throw new Error('无效的理论数据输入');
            }

            const theories = data.theoretical_framework || {};
            const theoryEntries = Object.entries(theories);
            const totalCount = theoryEntries.length;
            const validCount = theoryEntries.filter(([id, theory]) => this.isValidTheory(id, theory)).length;
            const coverage = totalCount > 0 ? (validCount / totalCount * 100).toFixed(2) : 0;

            // 理论类型分布
            const typeDistribution = this.analyzeTypeDistribution(theoryEntries);
            
            // 理论框架分析
            const frameworkAnalysis = this.config.enableFrameworkAnalysis ? 
                this.analyzeFrameworkStructure(theoryEntries) : {};

            // 理论应用分析
            const applicationAnalysis = this.config.enableApplicationAnalysis ? 
                this.analyzeApplicationScenarios(theoryEntries) : {};

            // 质量评估
            const qualityScore = this.calculateQualityScore(theoryEntries);
            const completeness = this.calculateCompleteness(theoryEntries);
            const consistency = this.calculateConsistency(theoryEntries);

            return {
                totalCount,
                validCount,
                coverage: parseFloat(coverage),
                types: typeDistribution,
                distribution: {
                    byType: typeDistribution,
                    byFramework: frameworkAnalysis.frameworkDistribution || {},
                    byApplication: applicationAnalysis.applicationDistribution || {}
                },
                coverageDetails: {
                    totalTheories: totalCount,
                    validTheories: validCount,
                    invalidTheories: totalCount - validCount,
                    coveragePercentage: parseFloat(coverage)
                },
                qualityScore,
                completeness,
                consistency,
                details: {
                    frameworkAnalysis,
                    applicationAnalysis,
                    typeAnalysis: typeDistribution
                },
                stats: {
                    averageFrameworks: frameworkAnalysis.averageFrameworks || 0,
                    averageApplications: applicationAnalysis.averageApplications || 0,
                    mostFrequentType: this.getMostFrequentType(typeDistribution),
                    topTheories: this.getTopTheories(theoryEntries)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成理论分类检查点
     * @param {Object} data - 理论数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        try {
            const theories = data.theoretical_framework || [];
            const checkpoints = [];

            // 基础数据完整性检查
            checkpoints.push({
                id: 'theory_basic_integrity',
                name: '理论基础数据完整性',
                status: this.checkBasicIntegrity(theories),
                description: '检查理论数据的基础完整性',
                priority: 'high'
            });

            // 理论类型分布检查
            checkpoints.push({
                id: 'theory_type_distribution',
                name: '理论类型分布合理性',
                status: this.checkTypeDistribution(theories),
                description: '检查理论类型分布是否合理',
                priority: 'medium'
            });

            // 理论框架完整性检查
            checkpoints.push({
                id: 'theory_framework_completeness',
                name: '理论框架完整性',
                status: this.checkFrameworkCompleteness(theories),
                description: '检查理论框架的完整性',
                priority: 'high'
            });

            // 理论应用场景检查
            checkpoints.push({
                id: 'theory_application_scenarios',
                name: '理论应用场景完整性',
                status: this.checkApplicationScenarios(theories),
                description: '检查理论应用场景的完整性',
                priority: 'high'
            });

            return checkpoints;
        } catch (error) {
            return [{
                id: 'theory_checkpoints_error',
                name: '理论检查点生成错误',
                status: false,
                description: `生成检查点时发生错误: ${error.message}`,
                priority: 'high'
            }];
        }
    }

    /**
     * 生成理论智能展示数据
     * @param {Object} data - 理论数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        try {
            const theories = data.theoretical_framework || [];
            
            return {
                summary: {
                    totalTheories: theories.length,
                    theoryTypes: this.getTheoryTypes(theories),
                    frameworkDistribution: this.getFrameworkDistribution(theories),
                    applicationDistribution: this.getApplicationDistribution(theories)
                },
                details: {
                    theoryList: this.formatTheoryList(theories),
                    typeBreakdown: this.formatTypeBreakdown(theories),
                    frameworkChart: this.formatFrameworkChart(theories),
                    applicationMatrix: this.formatApplicationMatrix(theories)
                },
                insights: {
                    keyInsights: this.generateKeyInsights(theories),
                    recommendations: this.generateRecommendations(theories),
                    trends: this.analyzeTrends(theories)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证理论数据完整性
     * @param {Object} data - 理论数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        try {
            const theories = data.theoretical_framework || [];
            const errors = [];
            const warnings = [];

            // 检查必需字段
            theories.forEach((theory, index) => {
                if (!theory.id) {
                    errors.push(`理论 ${index} 缺少ID字段`);
                }
                if (!theory.name) {
                    warnings.push(`理论 ${index} 缺少name字段`);
                }
                if (!theory.type) {
                    warnings.push(`理论 ${index} 缺少type字段`);
                }
            });

            // 检查ID唯一性
            const ids = theories.map(theory => theory.id).filter(id => id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                errors.push('存在重复的理论ID');
            }

            // 检查框架关联有效性
            theories.forEach(theory => {
                if (theory.frameworks) {
                    theory.frameworks.forEach(framework => {
                        if (!framework.id || !framework.name) {
                            warnings.push(`理论 ${theory.id} 的框架关联缺少必要字段`);
                        }
                    });
                }
            });

            // 检查应用场景有效性
            theories.forEach(theory => {
                if (theory.applications) {
                    theory.applications.forEach(application => {
                        if (!application.id || !application.name) {
                            warnings.push(`理论 ${theory.id} 的应用场景缺少必要字段`);
                        }
                    });
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                totalChecks: theories.length,
                passedChecks: theories.length - errors.length - warnings.length
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 私有辅助方法

    /**
     * 验证理论数据有效性
     */
    isValidTheory(id, theory) {
        return theory && 
               id && 
               theory.name &&
               theory.concept;
    }

    /**
     * 分析理论类型分布
     */
    analyzeTypeDistribution(theoryEntries) {
        const distribution = {};
        theoryEntries.forEach(([id, theory]) => {
            const type = theory.type || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * 分析理论框架结构
     */
    analyzeFrameworkStructure(theoryEntries) {
        const frameworkDistribution = {};
        let totalFrameworks = 0;

        theoryEntries.forEach(([id, theory]) => {
            if (theory.frameworks) {
                theory.frameworks.forEach(framework => {
                    const frameworkId = framework.id || framework.name;
                    if (frameworkId) {
                        frameworkDistribution[frameworkId] = (frameworkDistribution[frameworkId] || 0) + 1;
                        totalFrameworks++;
                    }
                });
            }
        });

        // 计算每个框架的平均出现次数
        const averageFrameworks = Object.keys(frameworkDistribution).length > 0 ? 
            (totalFrameworks / Object.keys(frameworkDistribution).length).toFixed(2) : 0;

        return {
            frameworkDistribution,
            totalFrameworks,
            averageFrameworks: parseFloat(averageFrameworks),
            uniqueFrameworks: Object.keys(frameworkDistribution).length
        };
    }

    /**
     * 分析理论应用场景
     */
    analyzeApplicationScenarios(theoryEntries) {
        const applicationDistribution = {};
        let totalApplications = 0;

        theoryEntries.forEach(([id, theory]) => {
            if (theory.applications) {
                theory.applications.forEach(application => {
                    const applicationId = application.id || application.name;
                    if (applicationId) {
                        applicationDistribution[applicationId] = (applicationDistribution[applicationId] || 0) + 1;
                        totalApplications++;
                    }
                });
            }
        });

        // 计算每个应用场景的平均出现次数
        const averageApplications = Object.keys(applicationDistribution).length > 0 ? 
            (totalApplications / Object.keys(applicationDistribution).length).toFixed(2) : 0;

        return {
            applicationDistribution,
            totalApplications,
            averageApplications: parseFloat(averageApplications),
            uniqueApplications: Object.keys(applicationDistribution).length
        };
    }

    /**
     * 计算质量分数
     */
    calculateQualityScore(theoryEntries) {
        let score = 0;
        let totalChecks = 0;

        theoryEntries.forEach(([id, theory]) => {
            let theoryScore = 0;
            let theoryChecks = 0;

            // 基础字段检查
            if (id) { theoryScore += 1; }
            if (theory.name) { theoryScore += 1; }
            if (theory.type) { theoryScore += 1; }
            theoryChecks += 3;

            // 描述字段检查
            if (theory.description) { theoryScore += 1; }
            if (theory.definition) { theoryScore += 1; }
            theoryChecks += 2;

            // 关联字段检查
            if (theory.frameworks && theory.frameworks.length > 0) { theoryScore += 1; }
            if (theory.applications && theory.applications.length > 0) { theoryScore += 1; }
            theoryChecks += 2;

            score += theoryScore;
            totalChecks += theoryChecks;
        });

        return totalChecks > 0 ? (score / totalChecks * 100).toFixed(2) : 0;
    }

    /**
     * 计算完整性
     */
    calculateCompleteness(theoryEntries) {
        const requiredFields = ['name', 'type'];
        let completeCount = 0;

        theoryEntries.forEach(([id, theory]) => {
            const hasAllRequired = id && requiredFields.every(field => theory[field]);
            if (hasAllRequired) completeCount++;
        });

        return theoryEntries.length > 0 ? (completeCount / theoryEntries.length * 100).toFixed(2) : 0;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(theoryEntries) {
        const types = new Set();
        const frameworkTypes = new Set();
        const applicationTypes = new Set();

        theoryEntries.forEach(([id, theory]) => {
            if (theory.type) types.add(theory.type);
            if (theory.frameworks) {
                theory.frameworks.forEach(framework => {
                    if (framework.type) frameworkTypes.add(framework.type);
                });
            }
            if (theory.applications) {
                theory.applications.forEach(application => {
                    if (application.type) applicationTypes.add(application.type);
                });
            }
        });

        // 类型一致性：类型数量与理论数量的比例
        const typeConsistency = theoryEntries.length > 0 ? (types.size / theoryEntries.length * 100).toFixed(2) : 0;
        
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
     * 获取顶级理论
     */
    getTopTheories(theoryEntries) {
        return theoryEntries
            .filter(([id, theory]) => theory.importance || theory.complexity)
            .sort(([,a], [,b]) => (b.importance || 0) - (a.importance || 0))
            .slice(0, 5)
            .map(([id, theory]) => ({
                id: id,
                name: theory.name,
                importance: theory.importance || 0,
                complexity: theory.complexity || 0
            }));
    }

    /**
     * 检查基础完整性
     */
    checkBasicIntegrity(theoryEntries) {
        const validCount = theoryEntries.filter(([id, theory]) => this.isValidTheory(id, theory)).length;
        return validCount === theoryEntries.length;
    }

    /**
     * 检查类型分布
     */
    checkTypeDistribution(theoryEntries) {
        const typeDistribution = this.analyzeTypeDistribution(theoryEntries);
        const typeCount = Object.keys(typeDistribution).length;
        return typeCount >= 2 && typeCount <= 10; // 合理的类型数量范围
    }

    /**
     * 检查框架完整性
     */
    checkFrameworkCompleteness(theoryEntries) {
        const frameworkAnalysis = this.analyzeFrameworkStructure(theoryEntries);
        return frameworkAnalysis.totalFrameworks > 0;
    }

    /**
     * 检查应用场景
     */
    checkApplicationScenarios(theoryEntries) {
        const applicationAnalysis = this.analyzeApplicationScenarios(theoryEntries);
        return applicationAnalysis.totalApplications > 0;
    }

    /**
     * 获取理论类型
     */
    getTheoryTypes(theoryEntries) {
        const types = new Set();
        theoryEntries.forEach(([id, theory]) => {
            if (theory.type) types.add(theory.type);
        });
        return Array.from(types);
    }

    /**
     * 获取框架分布
     */
    getFrameworkDistribution(theoryEntries) {
        const frameworkAnalysis = this.analyzeFrameworkStructure(theoryEntries);
        return frameworkAnalysis.frameworkDistribution;
    }

    /**
     * 获取应用分布
     */
    getApplicationDistribution(theoryEntries) {
        const applicationAnalysis = this.analyzeApplicationScenarios(theoryEntries);
        return applicationAnalysis.applicationDistribution;
    }

    /**
     * 格式化理论列表
     */
    formatTheoryList(theoryEntries) {
        return theoryEntries.map(([id, theory]) => ({
            id: id,
            name: theory.name,
            type: theory.type,
            description: theory.description || '',
            frameworks: theory.frameworks || [],
            applications: theory.applications || []
        }));
    }

    /**
     * 格式化类型分布
     */
    formatTypeBreakdown(theoryEntries) {
        const distribution = this.analyzeTypeDistribution(theoryEntries);
        return Object.entries(distribution).map(([type, count]) => ({
            type,
            count,
            percentage: ((count / theoryEntries.length) * 100).toFixed(2)
        }));
    }

    /**
     * 格式化框架图表
     */
    formatFrameworkChart(theories) {
        const frameworkAnalysis = this.analyzeFrameworkStructure(theories);
        return Object.entries(frameworkAnalysis.frameworkDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([frameworkId, count]) => ({
                frameworkId,
                count,
                percentage: ((count / frameworkAnalysis.totalFrameworks) * 100).toFixed(2)
            }));
    }

    /**
     * 格式化应用矩阵
     */
    formatApplicationMatrix(theories) {
        const applicationAnalysis = this.analyzeApplicationScenarios(theories);
        return Object.entries(applicationAnalysis.applicationDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([applicationId, count]) => ({
                applicationId,
                count,
                percentage: ((count / applicationAnalysis.totalApplications) * 100).toFixed(2)
            }));
    }

    /**
     * 生成关键洞察
     */
    generateKeyInsights(theories) {
        const insights = [];
        const typeDistribution = this.analyzeTypeDistribution(theories);
        const frameworkAnalysis = this.analyzeFrameworkStructure(theories);
        const applicationAnalysis = this.analyzeApplicationScenarios(theories);

        // 理论类型洞察
        const mostCommonType = this.getMostFrequentType(typeDistribution);
        if (mostCommonType) {
            insights.push(`最常见的理论类型是"${mostCommonType}"`);
        }

        // 框架洞察
        if (frameworkAnalysis.totalFrameworks > 0) {
            insights.push(`理论涉及${frameworkAnalysis.uniqueFrameworks}个不同框架`);
        }

        // 应用场景洞察
        if (applicationAnalysis.totalApplications > 0) {
            insights.push(`理论关联${applicationAnalysis.uniqueApplications}个应用场景`);
        }

        return insights;
    }

    /**
     * 生成建议
     */
    generateRecommendations(theories) {
        const recommendations = [];
        const typeDistribution = this.analyzeTypeDistribution(theories);
        const frameworkAnalysis = this.analyzeFrameworkStructure(theories);
        const applicationAnalysis = this.analyzeApplicationScenarios(theories);

        // 类型分布建议
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('建议增加更多理论类型以丰富理论体系');
        }

        // 框架关联建议
        if (frameworkAnalysis.totalFrameworks === 0) {
            recommendations.push('建议为理论添加框架关联以增强系统性');
        }

        // 应用场景建议
        if (applicationAnalysis.totalApplications === 0) {
            recommendations.push('建议为理论添加应用场景以增强实用性');
        }

        return recommendations;
    }

    /**
     * 分析趋势
     */
    analyzeTrends(theories) {
        const trends = [];
        const typeDistribution = this.analyzeTypeDistribution(theories);
        const frameworkAnalysis = this.analyzeFrameworkStructure(theories);

        // 类型分布趋势
        const typeCount = Object.keys(typeDistribution).length;
        if (typeCount > 5) {
            trends.push('理论类型丰富，体系完善');
        } else if (typeCount < 3) {
            trends.push('理论类型相对单一，可考虑扩展');
        }

        // 框架分布趋势
        if (frameworkAnalysis.uniqueFrameworks > 10) {
            trends.push('框架覆盖广泛，系统性强');
        } else if (frameworkAnalysis.uniqueFrameworks < 5) {
            trends.push('框架相对集中，可考虑拓展');
        }

        return trends;
    }
}

module.exports = {
    TheoryStatistics
}; 