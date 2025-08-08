/**
 * 毛小豆宇宙统一验证入口脚本
 * 提供并行验证功能和验证结果汇总报告
 */
const { validateControlledRedundancy } = require('./validate_controlled_redundancy.cjs');
const { validateDeepCrossReferences } = require('./validate_deep_cross_references.cjs');
const { validateSimpleDataReferences } = require('./validate_simple_data_references.cjs');
const { validateMetadataConsistency } = require('./validate_metadata_consistency.cjs');
const { validateAllBidirectionalReferences } = require('./validate_bidirectional_references.cjs');

/**
 * 验证配置
 */
const VALIDATION_CONFIG = {
    // 验证脚本配置
    validators: {
        controlled_redundancy: {
            name: '受控冗余机制验证',
            function: validateControlledRedundancy,
            enabled: true,
            description: '验证受控冗余机制的文件引用和交叉引用'
        },
        deep_cross_references: {
            name: '深度交叉引用验证',
            function: validateDeepCrossReferences,
            enabled: true,
            description: '验证复杂的元数据驱动的交叉引用关系'
        },
        simple_data_references: {
            name: '简化数据引用验证',
            function: validateSimpleDataReferences,
            enabled: true,
            description: '验证直接的数据引用关系（诗歌、角色、主题等）'
        },
                       data_stats: {
                   name: '元数据统计一致性验证',
                   function: validateMetadataConsistency,
                   enabled: true,
                   description: '验证metadata.json中的统计数量与实际数据文件中的真实数量一致性'
               },
        bidirectional_references: {
            name: '双向引用一致性验证',
            function: validateAllBidirectionalReferences,
            enabled: true,
            description: '验证两个数据类型之间的双向引用关系一致性'
        }
    },
    
    // 并行验证配置
    parallel: {
        enabled: true,
        maxConcurrency: 3, // 最大并发数
        timeout: 30000 // 超时时间（毫秒）
    },
    
    // 报告配置
    reporting: {
        showDetails: true,
        showWarnings: true,
        showStats: true,
        outputFormat: 'console' // 'console' | 'json' | 'html'
    }
};

/**
 * 验证结果汇总器
 */
class ValidationResultAggregator {
    constructor() {
        this.results = {};
        this.summary = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            startTime: null,
            endTime: null,
            duration: 0
        };
    }

    /**
     * 添加验证结果
     * @param {string} validatorName - 验证器名称
     * @param {Object} result - 验证结果
     */
    addResult(validatorName, result) {
        this.results[validatorName] = {
            ...result,
            timestamp: new Date(),
            validatorName
        };

        this.summary.total++;
        if (result.isValid) {
            this.summary.passed++;
        } else {
            this.summary.failed++;
        }
    }

    /**
     * 设置开始时间
     */
    setStartTime() {
        this.summary.startTime = new Date();
    }

    /**
     * 设置结束时间
     */
    setEndTime() {
        this.summary.endTime = new Date();
        this.summary.duration = this.summary.endTime - this.summary.startTime;
    }

    /**
     * 生成汇总报告
     * @returns {string} 格式化的汇总报告
     */
    generateSummaryReport() {
        let report = '🎯 毛小豆宇宙验证汇总报告\n';
        report += '='.repeat(50) + '\n\n';

        // 总体统计
        report += '📊 总体统计:\n';
        report += `  ✅ 通过: ${this.summary.passed}\n`;
        report += `  ❌ 失败: ${this.summary.failed}\n`;
        report += `  📈 总计: ${this.summary.total}\n`;
        report += `  ⏱️  耗时: ${this.summary.duration}ms\n\n`;

        // 成功率
        const successRate = this.summary.total > 0 ? (this.summary.passed / this.summary.total * 100).toFixed(1) : 0;
        report += `📈 成功率: ${successRate}%\n\n`;

        // 详细结果
        report += '📋 详细结果:\n';
        for (const [validatorName, result] of Object.entries(this.results)) {
            const status = result.isValid ? '✅' : '❌';
            const config = VALIDATION_CONFIG.validators[validatorName];
            report += `  ${status} ${config.name}\n`;
            report += `     描述: ${config.description}\n`;
            report += `     耗时: ${result.duration || 'N/A'}ms\n`;
            
            if (result.issues && result.issues.length > 0) {
                report += `     问题: ${result.issues.length} 个\n`;
            }
            
            if (result.warnings && result.warnings.length > 0) {
                report += `     警告: ${result.warnings.length} 个\n`;
            }
            report += '\n';
        }

        // 问题汇总
        const allIssues = [];
        const allWarnings = [];
        
        for (const result of Object.values(this.results)) {
            if (result.issues) allIssues.push(...result.issues);
            if (result.warnings) allWarnings.push(...result.warnings);
        }

        if (allIssues.length > 0) {
            report += '❌ 问题汇总:\n';
            allIssues.forEach((issue, index) => {
                report += `  ${index + 1}. ${issue}\n`;
            });
            report += '\n';
        }

        if (allWarnings.length > 0) {
            report += '⚠️ 警告汇总:\n';
            allWarnings.forEach((warning, index) => {
                report += `  ${index + 1}. ${warning}\n`;
            });
            report += '\n';
        }

        // 最终状态
        const overallStatus = this.summary.failed === 0 ? '✅ 全部验证通过' : '❌ 存在验证失败';
        report += `${overallStatus}\n`;

        return report;
    }

    /**
     * 生成JSON格式报告
     * @returns {Object} JSON格式的报告
     */
    generateJsonReport() {
        return {
            summary: this.summary,
            results: this.results,
            config: VALIDATION_CONFIG,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 并行验证执行器
 */
class ParallelValidator {
    constructor(config = VALIDATION_CONFIG) {
        this.config = config;
        this.aggregator = new ValidationResultAggregator();
    }

    /**
     * 执行单个验证器
     * @param {string} validatorName - 验证器名称
     * @param {Object} validatorConfig - 验证器配置
     * @returns {Promise<Object>} 验证结果
     */
    async executeValidator(validatorName, validatorConfig) {
        const startTime = Date.now();
        
        try {
            console.log(`🔍 开始执行: ${validatorConfig.name}`);
            
            const result = await validatorConfig.function();
            const duration = Date.now() - startTime;
            
            return {
                isValid: result,
                duration,
                validatorName,
                timestamp: new Date()
            };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            return {
                isValid: false,
                duration,
                validatorName,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * 执行并行验证
     * @returns {Promise<Object>} 验证结果汇总
     */
    async executeParallelValidation() {
        this.aggregator.setStartTime();
        
        console.log('🚀 开始毛小豆宇宙并行验证...\n');
        
        const enabledValidators = Object.entries(this.config.validators)
            .filter(([name, config]) => config.enabled)
            .map(([name, config]) => ({ name, config }));

        if (enabledValidators.length === 0) {
            throw new Error('没有启用的验证器');
        }

        const results = [];
        const maxConcurrency = this.config.parallel.maxConcurrency;
        
        // 分批执行验证器
        for (let i = 0; i < enabledValidators.length; i += maxConcurrency) {
            const batch = enabledValidators.slice(i, i + maxConcurrency);
            const batchPromises = batch.map(({ name, config }) => 
                this.executeValidator(name, config)
            );
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        // 汇总结果
        for (const result of results) {
            this.aggregator.addResult(result.validatorName, result);
        }

        this.aggregator.setEndTime();
        
        return this.aggregator;
    }

    /**
     * 执行串行验证
     * @returns {Promise<Object>} 验证结果汇总
     */
    async executeSerialValidation() {
        this.aggregator.setStartTime();
        
        console.log('🚀 开始毛小豆宇宙串行验证...\n');
        
        const enabledValidators = Object.entries(this.config.validators)
            .filter(([name, config]) => config.enabled);

        for (const [name, config] of enabledValidators) {
            const result = await this.executeValidator(name, config);
            this.aggregator.addResult(name, result);
        }

        this.aggregator.setEndTime();
        
        return this.aggregator;
    }
}

/**
 * 主验证函数
 */
async function validateAll(options = {}) {
    const config = { ...VALIDATION_CONFIG, ...options };
    const validator = new ParallelValidator(config);
    
    try {
        const aggregator = config.parallel.enabled 
            ? await validator.executeParallelValidation()
            : await validator.executeSerialValidation();
        
        // 输出汇总报告
        console.log('\n' + aggregator.generateSummaryReport());
        
        return aggregator;
        
    } catch (error) {
        console.error('❌ 验证执行失败:', error.message);
        throw error;
    }
}

/**
 * 命令行接口
 */
async function main() {
    const args = process.argv.slice(2);
    const options = {};
    
    // 解析命令行参数
    for (const arg of args) {
        if (arg === '--serial') {
            options.parallel = { ...VALIDATION_CONFIG.parallel, enabled: false };
        } else if (arg === '--json') {
            options.reporting = { ...VALIDATION_CONFIG.reporting, outputFormat: 'json' };
        } else if (arg.startsWith('--concurrency=')) {
            const concurrency = parseInt(arg.split('=')[1]);
            if (!isNaN(concurrency)) {
                options.parallel = { ...VALIDATION_CONFIG.parallel, maxConcurrency: concurrency };
            }
        }
    }
    
    try {
        const aggregator = await validateAll(options);
        
        if (options.reporting?.outputFormat === 'json') {
            console.log(JSON.stringify(aggregator.generateJsonReport(), null, 2));
        }
        
        // 设置退出码
        process.exit(aggregator.summary.failed === 0 ? 0 : 1);
        
    } catch (error) {
        console.error('❌ 验证失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    validateAll,
    ParallelValidator,
    ValidationResultAggregator,
    VALIDATION_CONFIG
}; 