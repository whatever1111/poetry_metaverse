const { dataLoader } = require('./data_loader.cjs');
const { ReportGenerator: BaseReportGenerator } = require('./component_interfaces.cjs');

/**
 * 通用报告生成器实现
 * 继承ReportGenerator接口，提供报告模板系统、数据聚合功能和格式化输出功能
 */
class ReportGenerator extends BaseReportGenerator {
    constructor() {
        super();
        this.templates = new Map();
        this.config = {
            showDetails: true,
            showWarnings: true,
            showStatistics: true,
            maxItems: 50,
            indentSize: 2
        };
        this.registerDefaultTemplates();
    }

    /**
     * 注册默认报告模板
     */
    registerDefaultTemplates() {
        // 总体统计模板
        this.templates.set('overview', {
            title: '📊 毛小豆宇宙数据概览报告',
            sections: ['summary', 'distribution', 'coverage', 'quality']
        });

        // 详细统计模板
        this.templates.set('detailed', {
            title: '📊 毛小豆宇宙详细统计报告',
            sections: ['summary', 'distribution', 'coverage', 'quality', 'details', 'recommendations']
        });

        // 验证报告模板
        this.templates.set('validation', {
            title: '🔍 毛小豆宇宙数据验证报告',
            sections: ['summary', 'errors', 'warnings', 'statistics', 'recommendations']
        });

        // 分类报告模板
        this.templates.set('categorization', {
            title: '📋 毛小豆宇宙分类统计报告',
            sections: ['summary', 'categories', 'distribution', 'coverage', 'checkpoints']
        });

        // 场景统计模板
        this.templates.set('scene', {
            title: '🎭 毛小豆宇宙场景统计报告',
            sections: ['summary', 'distribution', 'details', 'checkpoints', 'recommendations']
        });

        // 角色统计模板
        this.templates.set('character', {
            title: '👥 毛小豆宇宙角色统计报告',
            sections: ['summary', 'distribution', 'details', 'checkpoints', 'recommendations']
        });

        // 诗歌统计模板
        this.templates.set('poem', {
            title: '📖 毛小豆宇宙诗歌统计报告',
            sections: ['summary', 'distribution', 'details', 'checkpoints', 'recommendations']
        });

        // 主题统计模板
        this.templates.set('theme', {
            title: '🎨 毛小豆宇宙主题统计报告',
            sections: ['summary', 'distribution', 'details', 'checkpoints', 'recommendations']
        });

        // 术语统计模板
        this.templates.set('terminology', {
            title: '📚 毛小豆宇宙术语统计报告',
            sections: ['summary', 'distribution', 'details', 'checkpoints', 'recommendations']
        });

        // 理论统计模板
        this.templates.set('theory', {
            title: '🧠 毛小豆宇宙理论统计报告',
            sections: ['summary', 'distribution', 'details', 'checkpoints', 'recommendations']
        });
    }

    /**
     * 生成报告
     * @param {Object} statistics - 统计数据
     * @param {string} template - 模板名称
     * @param {Object} options - 配置选项
     * @returns {string} 格式化的报告文本
     */
    generateReport(statistics, template = 'detailed', options = {}) {
        try {
            // 验证输入数据
            if (!this.validateInput(statistics)) {
                throw new Error('统计数据格式无效');
            }

            const templateConfig = this.templates.get(template);
            if (!templateConfig) {
                throw new Error(`模板 "${template}" 不存在`);
            }

            const config = { ...this.config, ...options };
            let report = '';

            // 添加标题
            report += `${templateConfig.title}\n`;
            report += '='.repeat(80) + '\n\n';

            // 根据模板生成各个部分
            for (const section of templateConfig.sections) {
                const sectionContent = this.generateSection(section, statistics, config);
                if (sectionContent) {
                    report += sectionContent + '\n';
                }
            }

            return report;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成报告部分
     * @param {string} section - 部分名称
     * @param {Object} data - 数据
     * @param {Object} config - 配置
     * @returns {string} 部分内容
     */
    generateSection(section, data, config) {
        switch (section) {
            case 'summary':
                return this.generateSummarySection(data, config);
            case 'distribution':
                return this.generateDistributionSection(data, config);
            case 'coverage':
                return this.generateCoverageSection(data, config);
            case 'quality':
                return this.generateQualitySection(data, config);
            case 'details':
                return this.generateDetailsSection(data, config);
            case 'recommendations':
                return this.generateRecommendationsSection(data, config);
            case 'errors':
                return this.generateErrorsSection(data, config);
            case 'warnings':
                return this.generateWarningsSection(data, config);
            case 'statistics':
                return this.generateStatisticsSection(data, config);
            case 'categories':
                return this.generateCategoriesSection(data, config);
            case 'checkpoints':
                return this.generateCheckpointsSection(data, config);
            default:
                return '';
        }
    }

    /**
     * 生成总体统计部分
     */
    generateSummarySection(data, config) {
        if (!config.showStatistics) return '';

        let section = '🎯 总体统计:\n';
        section += '-'.repeat(40) + '\n';

        if (data.totalCount !== undefined) {
            section += `   - 总数量: ${data.totalCount}\n`;
        }

        if (data.validCount !== undefined) {
            section += `   - 有效数量: ${data.validCount}\n`;
        }

        if (data.coverage !== undefined) {
            section += `   - 覆盖率: ${data.coverage}%\n`;
        }

        if (data.types !== undefined) {
            section += `   - 类型数量: ${Object.keys(data.types).length}\n`;
        }

        return section + '\n';
    }

    /**
     * 生成分布统计部分
     */
    generateDistributionSection(data, config) {
        if (!data.distribution || !config.showStatistics) return '';

        let section = '📊 分布统计:\n';
        section += '-'.repeat(40) + '\n';

        Object.entries(data.distribution).forEach(([type, count]) => {
            const percentage = data.totalCount ? ((count / data.totalCount) * 100).toFixed(1) : '0.0';
            section += `   ${type}: ${count}个 (${percentage}%)\n`;
        });

        return section + '\n';
    }

    /**
     * 生成覆盖率部分
     */
    generateCoverageSection(data, config) {
        if (!data.coverageDetails || !config.showDetails) return '';

        let section = '📖 覆盖率详情:\n';
        section += '-'.repeat(40) + '\n';

        Object.entries(data.coverageDetails).forEach(([category, count]) => {
            section += `   ${category}: ${count}个\n`;
        });

        return section + '\n';
    }

    /**
     * 生成质量评估部分
     */
    generateQualitySection(data, config) {
        if (!config.showDetails) return '';

        let section = '🔍 质量评估:\n';
        section += '-'.repeat(40) + '\n';

        if (data.qualityScore !== undefined) {
            section += `   - 质量评分: ${data.qualityScore}/100\n`;
        }

        if (data.completeness !== undefined) {
            section += `   - 完整性: ${data.completeness}%\n`;
        }

        if (data.consistency !== undefined) {
            section += `   - 一致性: ${data.consistency}%\n`;
        }

        return section + '\n';
    }

    /**
     * 生成详细信息部分
     */
    generateDetailsSection(data, config) {
        if (!data.details || !config.showDetails) return '';

        let section = '📋 详细信息:\n';
        section += '-'.repeat(40) + '\n';

        let itemCount = 0;
        for (const [category, items] of Object.entries(data.details)) {
            if (itemCount >= config.maxItems) {
                section += `   ... (显示前${config.maxItems}项)\n`;
                break;
            }

            section += `\n   📍 ${category}:\n`;
            
            items.forEach((item, index) => {
                if (itemCount >= config.maxItems) return;
                
                section += `      ${index + 1}. ${item.name || item.id || item}\n`;
                if (item.description) {
                    section += `         描述: ${item.description}\n`;
                }
                if (item.count) {
                    section += `         数量: ${item.count}\n`;
                }
                itemCount++;
            });
        }

        return section + '\n';
    }

    /**
     * 生成建议部分
     */
    generateRecommendationsSection(data, config) {
        if (!data.recommendations || !config.showDetails) return '';

        let section = '💡 改进建议:\n';
        section += '-'.repeat(40) + '\n';

        data.recommendations.forEach((rec, index) => {
            section += `   ${index + 1}. ${rec}\n`;
        });

        return section + '\n';
    }

    /**
     * 生成错误部分
     */
    generateErrorsSection(data, config) {
        if (!data.errors || data.errors.length === 0) return '';

        let section = '❌ 错误信息:\n';
        section += '-'.repeat(40) + '\n';

        data.errors.forEach((error, index) => {
            section += `   ${index + 1}. ${error}\n`;
        });

        return section + '\n';
    }

    /**
     * 生成警告部分
     */
    generateWarningsSection(data, config) {
        if (!data.warnings || data.warnings.length === 0 || !config.showWarnings) return '';

        let section = '⚠️  警告信息:\n';
        section += '-'.repeat(40) + '\n';

        data.warnings.forEach((warning, index) => {
            section += `   ${index + 1}. ${warning}\n`;
        });

        return section + '\n';
    }

    /**
     * 生成统计信息部分
     */
    generateStatisticsSection(data, config) {
        if (!config.showStatistics) return '';

        let section = '📈 统计信息:\n';
        section += '-'.repeat(40) + '\n';

        if (data.stats) {
            Object.entries(data.stats).forEach(([key, value]) => {
                section += `   - ${key}: ${value}\n`;
            });
        }

        return section + '\n';
    }

    /**
     * 生成分类信息部分
     */
    generateCategoriesSection(data, config) {
        if (!data.categories || !config.showDetails) return '';

        let section = '📂 分类信息:\n';
        section += '-'.repeat(40) + '\n';

        Object.entries(data.categories).forEach(([category, items]) => {
            section += `\n   📁 ${category} (${items.length}个):\n`;
            
            items.forEach((item, index) => {
                if (index >= config.maxItems) return;
                section += `      ${index + 1}. ${item.name || item.id || item}\n`;
            });
        });

        return section + '\n';
    }

    /**
     * 生成检查点部分
     */
    generateCheckpointsSection(data, config) {
        if (!data.checkpoints || !config.showDetails) return '';

        let section = '✅ 检查点:\n';
        section += '-'.repeat(40) + '\n';

        data.checkpoints.forEach((checkpoint, index) => {
            section += `   ${index + 1}. ${checkpoint}\n`;
        });

        return section + '\n';
    }

    /**
     * 验证输入数据
     * @param {Object} data - 输入数据
     * @returns {boolean} 验证结果
     */
    validateInput(data) {
        return data && typeof data === 'object' && (
            data.totalCount !== undefined ||
            data.validCount !== undefined ||
            data.coverage !== undefined ||
            data.distribution !== undefined ||
            data.details !== undefined ||
            data.errors !== undefined ||
            data.warnings !== undefined ||
            data.types !== undefined
        );
    }
}

// 创建默认实例
const reportGenerator = new ReportGenerator();

// 导出类和默认实例
module.exports = {
    ReportGenerator,
    reportGenerator
}; 