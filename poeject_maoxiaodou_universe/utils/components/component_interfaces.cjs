/**
 * 毛小豆宇宙验证脚本公共组件接口定义
 * 定义统一的组件API和数据结构规范
 */

/**
 * 基础统计数据结构
 */
const BaseStatisticsData = {
    // 总体统计
    totalCount: 0,
    validCount: 0,
    coverage: 0,
    types: {},
    
    // 分布统计
    distribution: {},
    
    // 覆盖率详情
    coverageDetails: {},
    
    // 质量评估
    qualityScore: 0,
    completeness: 0,
    consistency: 0,
    
    // 详细信息
    details: {},
    
    // 建议和检查点
    recommendations: [],
    checkpoints: [],
    
    // 错误和警告
    errors: [],
    warnings: [],
    
    // 统计信息
    stats: {}
};

/**
 * 基础组件接口
 */
class BaseComponent {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.config = {};
    }

    /**
     * 设置配置
     * @param {Object} config - 配置对象
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * 获取配置
     * @returns {Object} 当前配置
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * 验证输入数据
     * @param {Object} data - 输入数据
     * @returns {boolean} 验证结果
     */
    validateInput(data) {
        return data && typeof data === 'object';
    }

    /**
     * 处理错误
     * @param {Error} error - 错误对象
     * @returns {Object} 错误信息
     */
    handleError(error) {
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 统计器组件接口
 */
class StatisticsGenerator extends BaseComponent {
    constructor(dataLoader) {
        super(dataLoader);
    }

    /**
     * 生成统计数据
     * @param {Object} data - 原始数据
     * @returns {Promise<Object>} 统计数据
     */
    async generateStatistics(data) {
        throw new Error('generateStatistics方法必须在子类中实现');
    }

    /**
     * 生成分类检查点
     * @param {Object} data - 原始数据
     * @returns {Promise<Array>} 检查点列表
     */
    async generateCheckpoints(data) {
        throw new Error('generateCheckpoints方法必须在子类中实现');
    }

    /**
     * 生成智能展示数据
     * @param {Object} data - 原始数据
     * @returns {Promise<Object>} 展示数据
     */
    async generateDisplay(data) {
        throw new Error('generateDisplay方法必须在子类中实现');
    }

    /**
     * 验证数据完整性
     * @param {Object} data - 原始数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateDataIntegrity(data) {
        throw new Error('validateDataIntegrity方法必须在子类中实现');
    }

    /**
     * 生成统计报告
     * @param {Object} data - 原始数据
     * @param {string} template - 报告模板
     * @param {Object} options - 配置选项
     * @returns {Promise<Object>} 完整报告
     */
    async generateReport(data, template = 'detailed', options = {}) {
        try {
            const statistics = await this.generateStatistics(data);
            const checkpoints = await this.generateCheckpoints(data);
            const display = await this.generateDisplay(data);
            const validation = await this.validateDataIntegrity(data);

            return {
                success: true,
                statistics,
                checkpoints,
                display,
                validation,
                template,
                options,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
}

/**
 * 报告生成器接口
 */
class ReportGenerator extends BaseComponent {
    constructor() {
        super(null);
        this.templates = new Map();
        this.registerDefaultTemplates();
    }

    /**
     * 注册默认模板
     */
    registerDefaultTemplates() {
        // 子类实现
    }

    /**
     * 生成报告
     * @param {Object} statistics - 统计数据
     * @param {string} template - 模板名称
     * @param {Object} options - 配置选项
     * @returns {string} 格式化的报告文本
     */
    generateReport(statistics, template, options = {}) {
        throw new Error('generateReport方法必须在子类中实现');
    }

    /**
     * 注册自定义模板
     * @param {string} name - 模板名称
     * @param {Object} template - 模板定义
     */
    registerTemplate(name, template) {
        this.templates.set(name, template);
    }

    /**
     * 获取可用模板列表
     * @returns {Array} 模板名称列表
     */
    getAvailableTemplates() {
        return Array.from(this.templates.keys());
    }
}

/**
 * 数据展示器接口
 */
class DataDisplay extends BaseComponent {
    constructor() {
        super(null);
        this.styles = {};
    }

    /**
     * 生成表格
     * @param {Array} data - 数据数组
     * @param {Array} columns - 列定义
     * @param {Object} options - 配置选项
     * @returns {string} 格式化的表格文本
     */
    generateTable(data, columns, options = {}) {
        throw new Error('generateTable方法必须在子类中实现');
    }

    /**
     * 生成图表数据
     * @param {Array} data - 原始数据
     * @param {Object} config - 图表配置
     * @returns {Object} 图表数据对象
     */
    generateChartData(data, config = {}) {
        throw new Error('generateChartData方法必须在子类中实现');
    }

    /**
     * 生成分类统计展示
     * @param {Object} categories - 分类数据
     * @param {Object} options - 配置选项
     * @returns {string} 格式化的分类统计文本
     */
    generateCategoryStats(categories, options = {}) {
        throw new Error('generateCategoryStats方法必须在子类中实现');
    }

    /**
     * 生成数据摘要
     * @param {Array} data - 数据数组
     * @param {Object} options - 配置选项
     * @returns {Object} 数据摘要对象
     */
    generateDataSummary(data, options = {}) {
        throw new Error('generateDataSummary方法必须在子类中实现');
    }

    /**
     * 设置样式
     * @param {Object} styles - 样式配置
     */
    setStyles(styles) {
        this.styles = { ...this.styles, ...styles };
    }

    /**
     * 获取样式
     * @returns {Object} 当前样式
     */
    getStyles() {
        return { ...this.styles };
    }
}

/**
 * 验证器组件接口
 */
class Validator extends BaseComponent {
    constructor(dataLoader) {
        super(dataLoader);
    }

    /**
     * 执行验证
     * @param {Object} data - 待验证数据
     * @returns {Promise<Object>} 验证结果
     */
    async validate(data) {
        throw new Error('validate方法必须在子类中实现');
    }

    /**
     * 生成验证报告
     * @param {Object} validationResult - 验证结果
     * @param {Object} options - 配置选项
     * @returns {Object} 验证报告
     */
    generateValidationReport(validationResult, options = {}) {
        throw new Error('generateValidationReport方法必须在子类中实现');
    }

    /**
     * 检查数据一致性
     * @param {Object} data - 数据对象
     * @returns {Promise<Object>} 一致性检查结果
     */
    async checkDataConsistency(data) {
        throw new Error('checkDataConsistency方法必须在子类中实现');
    }

    /**
     * 检查数据完整性
     * @param {Object} data - 数据对象
     * @returns {Promise<Object>} 完整性检查结果
     */
    async checkDataCompleteness(data) {
        throw new Error('checkDataCompleteness方法必须在子类中实现');
    }
}

/**
 * 组件工厂接口
 */
class ComponentFactory {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.components = new Map();
    }

    /**
     * 注册组件
     * @param {string} name - 组件名称
     * @param {Function} componentClass - 组件类
     */
    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
    }

    /**
     * 创建组件实例
     * @param {string} name - 组件名称
     * @param {Object} config - 配置选项
     * @returns {Object} 组件实例
     */
    createComponent(name, config = {}) {
        const ComponentClass = this.components.get(name);
        if (!ComponentClass) {
            throw new Error(`组件 "${name}" 不存在`);
        }

        const component = new ComponentClass(this.dataLoader);
        if (config) {
            component.setConfig(config);
        }

        return component;
    }

    /**
     * 获取已注册的组件列表
     * @returns {Array} 组件名称列表
     */
    getRegisteredComponents() {
        return Array.from(this.components.keys());
    }
}

/**
 * 统一的数据结构定义
 */
const DataStructures = {
    // 统计数据结构
    StatisticsData: {
        ...BaseStatisticsData,
        // 特定数据类型的扩展字段
        characterStats: {},
        poemStats: {},
        sceneStats: {},
        themeStats: {},
        terminologyStats: {},
        theoryStats: {}
    },

    // 验证结果数据结构
    ValidationResult: {
        isValid: false,
        errors: [],
        warnings: [],
        statistics: {},
        recommendations: [],
        timestamp: ''
    },

    // 报告数据结构
    ReportData: {
        title: '',
        sections: [],
        content: '',
        metadata: {},
        timestamp: ''
    },

    // 展示数据结构
    DisplayData: {
        format: 'table', // table, chart, summary
        data: [],
        columns: [],
        options: {},
        metadata: {}
    },

    // 配置数据结构
    ComponentConfig: {
        showDetails: true,
        showWarnings: true,
        showStatistics: true,
        maxItems: 50,
        indentSize: 2,
        truncateLength: 50,
        numberFormat: 'default',
        dateFormat: 'YYYY-MM-DD'
    }
};

/**
 * 错误类型定义
 */
const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DATA_LOAD_ERROR: 'DATA_LOAD_ERROR',
    PROCESSING_ERROR: 'PROCESSING_ERROR',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    TEMPLATE_ERROR: 'TEMPLATE_ERROR'
};

/**
 * 报告模板类型定义
 */
const ReportTemplates = {
    OVERVIEW: 'overview',
    DETAILED: 'detailed',
    VALIDATION: 'validation',
    CATEGORIZATION: 'categorization',
    SUMMARY: 'summary',
    CUSTOM: 'custom'
};

/**
 * 展示格式类型定义
 */
const DisplayFormats = {
    TABLE: 'table',
    CHART: 'chart',
    SUMMARY: 'summary',
    CATEGORY: 'category',
    CUSTOM: 'custom'
};

/**
 * 图表类型定义
 */
const ChartTypes = {
    BAR: 'bar',
    PIE: 'pie',
    LINE: 'line',
    SCATTER: 'scatter',
    CUSTOM: 'custom'
};

// 导出所有接口和数据结构
module.exports = {
    // 基础接口
    BaseComponent,
    StatisticsGenerator,
    ReportGenerator,
    DataDisplay,
    Validator,
    ComponentFactory,

    // 数据结构
    DataStructures,
    BaseStatisticsData,

    // 类型定义
    ErrorTypes,
    ReportTemplates,
    DisplayFormats,
    ChartTypes
}; 