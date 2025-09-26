/**
 * 毛小豆宇宙角色统计器
 * 负责角色数据的统计分析和展示
 */

const { StatisticsGenerator } = require('./component_interfaces.cjs');
const { DataLoader } = require('./data_loader.cjs');

class CharacterStatistics extends StatisticsGenerator {
    constructor(dataLoader) {
        super(dataLoader);
        this.config = {
            enableFrequencyAnalysis: true,
            enableRelationshipAnalysis: true,
            enableTypeDistribution: true,
            enableQualityCheck: true
        };
    }

    /**
     * 生成角色统计数据
     * @param {Object} data - 角色数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        try {
            if (!this.validateInput(data)) {
                throw new Error('无效的角色数据输入');
            }

            // 处理按分类组织的角色数据结构
            const characters = this.extractCharactersFromCategories(data.characters || {});
            const totalCount = characters.length;
            const validCount = characters.filter(char => this.isValidCharacter(char)).length;
            const coverage = totalCount > 0 ? (validCount / totalCount * 100).toFixed(2) : 0;

            // 角色类型分布
            const typeDistribution = this.analyzeTypeDistribution(characters);
            
            // 角色出现频率
            const frequencyAnalysis = this.config.enableFrequencyAnalysis ? 
                this.analyzeFrequency(characters) : {};

            // 角色关联关系
            const relationshipAnalysis = this.config.enableRelationshipAnalysis ? 
                this.analyzeRelationships(characters) : {};

            // 质量评估
            const qualityScore = this.calculateQualityScore(characters);
            const completeness = this.calculateCompleteness(characters);
            const consistency = this.calculateConsistency(characters);

            return {
                totalCount,
                validCount,
                coverage: parseFloat(coverage),
                types: typeDistribution,
                distribution: {
                    byType: typeDistribution,
                    byFrequency: frequencyAnalysis.frequencyDistribution || {},
                    byRelationship: relationshipAnalysis.relationshipTypes || {}
                },
                coverageDetails: {
                    totalCharacters: totalCount,
                    validCharacters: validCount,
                    invalidCharacters: totalCount - validCount,
                    coveragePercentage: parseFloat(coverage)
                },
                qualityScore,
                completeness,
                consistency,
                details: {
                    frequencyAnalysis,
                    relationshipAnalysis,
                    typeAnalysis: typeDistribution
                },
                stats: {
                    averageRelationships: relationshipAnalysis.averageRelationships || 0,
                    mostFrequentType: this.getMostFrequentType(typeDistribution),
                    topCharacters: frequencyAnalysis.topCharacters || []
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成角色分类检查点
     * @param {Object} data - 角色数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        try {
            const characters = this.extractCharactersFromCategories(data.characters || {});
            const checkpoints = [];

            // 基础数据完整性检查
            checkpoints.push({
                id: 'character_basic_integrity',
                name: '角色基础数据完整性',
                status: this.checkBasicIntegrity(characters),
                description: '检查角色数据的基础完整性',
                priority: 'high'
            });

            // 角色类型分布检查
            checkpoints.push({
                id: 'character_type_distribution',
                name: '角色类型分布合理性',
                status: this.checkTypeDistribution(characters),
                description: '检查角色类型分布是否合理',
                priority: 'medium'
            });

            // 角色关联关系检查
            checkpoints.push({
                id: 'character_relationships',
                name: '角色关联关系完整性',
                status: this.checkRelationships(characters),
                description: '检查角色关联关系的完整性',
                priority: 'high'
            });

            // 角色出现频率检查
            checkpoints.push({
                id: 'character_frequency',
                name: '角色出现频率合理性',
                status: this.checkFrequency(characters),
                description: '检查角色出现频率是否合理',
                priority: 'medium'
            });

            return checkpoints;
        } catch (error) {
            return [{
                id: 'character_checkpoints_error',
                name: '角色检查点生成错误',
                status: false,
                description: `生成检查点时发生错误: ${error.message}`,
                priority: 'high'
            }];
        }
    }

    /**
     * 生成角色智能展示数据
     * @param {Object} data - 角色数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        try {
            const characters = this.extractCharactersFromCategories(data.characters || {});
            
            return {
                summary: {
                    totalCharacters: characters.length,
                    mainCharacters: this.getMainCharacters(characters),
                    characterTypes: this.getCharacterTypes(characters),
                    relationshipNetwork: this.getRelationshipNetwork(characters)
                },
                details: {
                    characterList: this.formatCharacterList(characters),
                    typeBreakdown: this.formatTypeBreakdown(characters),
                    frequencyChart: this.formatFrequencyChart(characters),
                    relationshipMatrix: this.formatRelationshipMatrix(characters)
                },
                insights: {
                    keyInsights: this.generateKeyInsights(characters),
                    recommendations: this.generateRecommendations(characters),
                    trends: this.analyzeTrends(characters)
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证角色数据完整性
     * @param {Object} data - 角色数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        try {
            const characters = this.extractCharactersFromCategories(data.characters || {});
            const errors = [];
            const warnings = [];

            // 检查必需字段
            characters.forEach((char, index) => {
                if (!char.id) {
                    errors.push(`角色 ${index} 缺少ID字段`);
                }
                if (!char.name) {
                    warnings.push(`角色 ${index} 缺少name字段`);
                }
                if (!char.type) {
                    warnings.push(`角色 ${index} 缺少type字段`);
                }
            });

            // 检查ID唯一性
            const ids = characters.map(char => char.id).filter(id => id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                errors.push('存在重复的角色ID');
            }

            // 检查关联关系有效性
            characters.forEach(char => {
                if (char.relationships) {
                    char.relationships.forEach(rel => {
                        if (!rel.targetId || !rel.type) {
                            warnings.push(`角色 ${char.id} 的关联关系缺少必要字段`);
                        }
                    });
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                totalChecks: characters.length,
                passedChecks: characters.length - errors.length - warnings.length
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 私有辅助方法

    /**
     * 从分类结构中提取所有角色
     */
    extractCharactersFromCategories(charactersByCategory) {
        const allCharacters = [];
        
        Object.values(charactersByCategory).forEach(category => {
            if (Array.isArray(category)) {
                category.forEach(character => {
                    if (character && character.id) {
                        allCharacters.push(character);
                    }
                });
            }
        });
        
        return allCharacters;
    }

    /**
     * 验证角色数据有效性
     */
    isValidCharacter(character) {
        return character && 
               character.id && 
               character.name;
    }

    /**
     * 分析角色类型分布
     */
    analyzeTypeDistribution(characters) {
        const distribution = {};
        characters.forEach(char => {
            const type = char.type || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * 分析角色出现频率
     */
    analyzeFrequency(characters) {
        const frequency = {};
        const topCharacters = [];

        characters.forEach(char => {
            const appearances = char.appearances || 1;
            frequency[char.id] = appearances;
        });

        // 获取出现频率最高的角色
        const sortedCharacters = Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        sortedCharacters.forEach(([id, count]) => {
            const character = characters.find(c => c.id === id);
            if (character) {
                topCharacters.push({
                    id: character.id,
                    name: character.name,
                    frequency: count
                });
            }
        });

        return {
            frequencyDistribution: frequency,
            topCharacters,
            averageFrequency: Object.values(frequency).reduce((a, b) => a + b, 0) / Object.keys(frequency).length
        };
    }

    /**
     * 分析角色关联关系
     */
    analyzeRelationships(characters) {
        const relationshipTypes = {};
        let totalRelationships = 0;
        let relationshipCount = 0;

        characters.forEach(char => {
            if (char.relationships) {
                char.relationships.forEach(rel => {
                    const type = rel.type || 'unknown';
                    relationshipTypes[type] = (relationshipTypes[type] || 0) + 1;
                    relationshipCount++;
                });
                totalRelationships++;
            }
        });

        return {
            relationshipTypes,
            totalRelationships,
            relationshipCount,
            averageRelationships: totalRelationships > 0 ? (relationshipCount / totalRelationships).toFixed(2) : 0
        };
    }

    /**
     * 计算质量分数
     */
    calculateQualityScore(characters) {
        let score = 0;
        let totalChecks = 0;

        characters.forEach(char => {
            let charScore = 0;
            let charChecks = 0;

            // 基础字段检查
            if (char.id) { charScore += 1; }
            if (char.name) { charScore += 1; }
            if (char.type) { charScore += 1; }
            charChecks += 3;

            // 描述字段检查
            if (char.description) { charScore += 1; }
            if (char.background) { charScore += 1; }
            charChecks += 2;

            // 关联关系检查
            if (char.relationships && char.relationships.length > 0) { charScore += 1; }
            charChecks += 1;

            score += charScore;
            totalChecks += charChecks;
        });

        return totalChecks > 0 ? (score / totalChecks * 100).toFixed(2) : 0;
    }

    /**
     * 计算完整性
     */
    calculateCompleteness(characters) {
        const requiredFields = ['id', 'name', 'type'];
        let completeCount = 0;

        characters.forEach(char => {
            const hasAllRequired = requiredFields.every(field => char[field]);
            if (hasAllRequired) completeCount++;
        });

        return characters.length > 0 ? (completeCount / characters.length * 100).toFixed(2) : 0;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(characters) {
        const types = new Set();
        const relationshipTypes = new Set();

        characters.forEach(char => {
            if (char.type) types.add(char.type);
            if (char.relationships) {
                char.relationships.forEach(rel => {
                    if (rel.type) relationshipTypes.add(rel.type);
                });
            }
        });

        // 类型一致性：类型数量与角色数量的比例
        const typeConsistency = characters.length > 0 ? (types.size / characters.length * 100).toFixed(2) : 0;
        
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
    checkBasicIntegrity(characters) {
        const validCount = characters.filter(char => this.isValidCharacter(char)).length;
        return validCount === characters.length;
    }

    /**
     * 检查类型分布
     */
    checkTypeDistribution(characters) {
        const typeDistribution = this.analyzeTypeDistribution(characters);
        const typeCount = Object.keys(typeDistribution).length;
        return typeCount >= 2 && typeCount <= 10; // 合理的类型数量范围
    }

    /**
     * 检查关联关系
     */
    checkRelationships(characters) {
        const relationshipAnalysis = this.analyzeRelationships(characters);
        return relationshipAnalysis.totalRelationships > 0;
    }

    /**
     * 检查频率
     */
    checkFrequency(characters) {
        const frequencyAnalysis = this.analyzeFrequency(characters);
        return frequencyAnalysis.averageFrequency > 0;
    }

    /**
     * 获取主要角色
     */
    getMainCharacters(characters) {
        return characters
            .filter(char => char.type === 'main' || char.type === 'protagonist')
            .map(char => ({
                id: char.id,
                name: char.name,
                type: char.type
            }));
    }

    /**
     * 获取角色类型
     */
    getCharacterTypes(characters) {
        const types = new Set();
        characters.forEach(char => {
            if (char.type) types.add(char.type);
        });
        return Array.from(types);
    }

    /**
     * 获取关联关系网络
     */
    getRelationshipNetwork(characters) {
        const network = [];
        characters.forEach(char => {
            if (char.relationships) {
                char.relationships.forEach(rel => {
                    network.push({
                        source: char.id,
                        target: rel.targetId,
                        type: rel.type
                    });
                });
            }
        });
        return network;
    }

    /**
     * 格式化角色列表
     */
    formatCharacterList(characters) {
        return characters.map(char => ({
            id: char.id,
            name: char.name,
            type: char.type,
            description: char.description || '',
            frequency: char.appearances || 1
        }));
    }

    /**
     * 格式化类型分布
     */
    formatTypeBreakdown(characters) {
        const distribution = this.analyzeTypeDistribution(characters);
        return Object.entries(distribution).map(([type, count]) => ({
            type,
            count,
            percentage: ((count / characters.length) * 100).toFixed(2)
        }));
    }

    /**
     * 格式化频率图表
     */
    formatFrequencyChart(characters) {
        const frequencyAnalysis = this.analyzeFrequency(characters);
        return frequencyAnalysis.topCharacters.map(char => ({
            name: char.name,
            frequency: char.frequency
        }));
    }

    /**
     * 格式化关联关系矩阵
     */
    formatRelationshipMatrix(characters) {
        const matrix = [];
        characters.forEach(char => {
            if (char.relationships) {
                char.relationships.forEach(rel => {
                    matrix.push({
                        source: char.name,
                        target: rel.targetId,
                        relationship: rel.type
                    });
                });
            }
        });
        return matrix;
    }

    /**
     * 生成关键洞察
     */
    generateKeyInsights(characters) {
        const insights = [];
        const typeDistribution = this.analyzeTypeDistribution(characters);
        const frequencyAnalysis = this.analyzeFrequency(characters);

        // 角色类型洞察
        const mostCommonType = this.getMostFrequentType(typeDistribution);
        if (mostCommonType) {
            insights.push(`最常见的角色类型是"${mostCommonType}"`);
        }

        // 频率洞察
        if (frequencyAnalysis.topCharacters.length > 0) {
            const topChar = frequencyAnalysis.topCharacters[0];
            insights.push(`出现频率最高的角色是"${topChar.name}"`);
        }

        // 关联关系洞察
        const relationshipAnalysis = this.analyzeRelationships(characters);
        if (relationshipAnalysis.averageRelationships > 0) {
            insights.push(`平均每个角色有${relationshipAnalysis.averageRelationships}个关联关系`);
        }

        return insights;
    }

    /**
     * 生成建议
     */
    generateRecommendations(characters) {
        const recommendations = [];
        const typeDistribution = this.analyzeTypeDistribution(characters);

        // 类型分布建议
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('建议增加更多角色类型以丰富角色体系');
        }

        // 关联关系建议
        const relationshipAnalysis = this.analyzeRelationships(characters);
        if (relationshipAnalysis.totalRelationships === 0) {
            recommendations.push('建议为角色添加关联关系以增强角色间的互动');
        }

        return recommendations;
    }

    /**
     * 分析趋势
     */
    analyzeTrends(characters) {
        const trends = [];
        const typeDistribution = this.analyzeTypeDistribution(characters);

        // 类型分布趋势
        const typeCount = Object.keys(typeDistribution).length;
        if (typeCount > 5) {
            trends.push('角色类型丰富，体系完善');
        } else if (typeCount < 3) {
            trends.push('角色类型相对单一，可考虑扩展');
        }

        return trends;
    }
}

module.exports = {
    CharacterStatistics
}; 