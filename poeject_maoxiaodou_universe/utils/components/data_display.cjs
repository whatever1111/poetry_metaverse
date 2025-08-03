const { dataLoader } = require('./data_loader.cjs');
const { DataDisplay: BaseDataDisplay } = require('./component_interfaces.cjs');

/**
 * 通用数据展示器实现
 * 继承DataDisplay接口，提供表格生成、图表数据格式化和分类统计展示功能
 */
class DataDisplay extends BaseDataDisplay {
    constructor() {
        super();
        this.config = {
            maxRows: 100,
            maxColumns: 10,
            showIndex: true,
            truncateLength: 50,
            numberFormat: 'default',
            dateFormat: 'YYYY-MM-DD',
            currencySymbol: '¥'
        };
        this.styles = {
            table: {
                header: 'bold',
                border: 'simple',
                alignment: 'left'
            },
            chart: {
                type: 'bar',
                colors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
                height: 400,
                width: 600
            }
        };
    }

    /**
     * 生成表格
     * @param {Array} data - 数据数组
     * @param {Array} columns - 列定义
     * @param {Object} options - 配置选项
     * @returns {string} 格式化的表格文本
     */
    generateTable(data, columns, options = {}) {
        try {
            const config = { ...this.config, ...options };
            
            if (!data || data.length === 0) {
                return '暂无数据\n';
            }

            // 限制数据行数
            const limitedData = data.slice(0, config.maxRows);
            
            // 生成表头
            let table = this.generateTableHeader(columns, config);
            
            // 生成表体
            table += this.generateTableBody(limitedData, columns, config);
            
            // 添加统计信息
            if (data.length > config.maxRows) {
                table += `\n... (显示前${config.maxRows}行，共${data.length}行)\n`;
            }

            return table;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成表头
     */
    generateTableHeader(columns, config) {
        let header = '';
        
        // 添加索引列
        if (config.showIndex) {
            header += '序号 | ';
        }
        
        // 添加数据列
        header += columns.map(col => col.title || col.key).join(' | ');
        header += '\n';
        
        // 添加分隔线
        const separator = config.showIndex ? '--- | ' : '';
        header += separator + columns.map(() => '---').join(' | ') + '\n';
        
        return header;
    }

    /**
     * 生成表体
     */
    generateTableBody(data, columns, config) {
        let body = '';
        
        data.forEach((row, index) => {
            // 添加索引
            if (config.showIndex) {
                body += `${index + 1} | `;
            }
            
            // 添加数据列
            const rowData = columns.map(col => {
                const value = row[col.key];
                return this.formatCellValue(value, col, config);
            });
            
            body += rowData.join(' | ') + '\n';
        });
        
        return body;
    }

    /**
     * 格式化单元格值
     */
    formatCellValue(value, column, config) {
        if (value === null || value === undefined) {
            return '-';
        }

        // 根据列类型格式化
        switch (column.type) {
            case 'number':
                return this.formatNumber(value, column.format);
            case 'date':
                return this.formatDate(value, column.format);
            case 'currency':
                return this.formatCurrency(value, column.format);
            case 'percentage':
                return this.formatPercentage(value, column.format);
            case 'text':
            default:
                return this.formatText(value, config.truncateLength);
        }
    }

    /**
     * 格式化数字
     */
    formatNumber(value, format) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        switch (format) {
            case 'integer':
                return Math.round(num).toString();
            case 'decimal':
                return num.toFixed(2);
            case 'scientific':
                return num.toExponential(2);
            default:
                return num.toString();
        }
    }

    /**
     * 格式化日期
     */
    formatDate(value, format) {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;
        
        // 简单日期格式化
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    /**
     * 格式化货币
     */
    formatCurrency(value, format) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        const symbol = format?.symbol || this.config.currencySymbol;
        return `${symbol}${num.toFixed(2)}`;
    }

    /**
     * 格式化百分比
     */
    formatPercentage(value, format) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        const decimals = format?.decimals || 1;
        return `${(num * 100).toFixed(decimals)}%`;
    }

    /**
     * 格式化文本
     */
    formatText(value, maxLength) {
        const text = String(value);
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 生成图表数据
     * @param {Array} data - 原始数据
     * @param {Object} config - 图表配置
     * @returns {Object} 图表数据对象
     */
    generateChartData(data, config = {}) {
        try {
            const chartConfig = { ...this.styles.chart, ...config };
            
            // 根据图表类型生成数据
            switch (chartConfig.type) {
                case 'bar':
                    return this.generateBarChartData(data, chartConfig);
                case 'pie':
                    return this.generatePieChartData(data, chartConfig);
                case 'line':
                    return this.generateLineChartData(data, chartConfig);
                case 'scatter':
                    return this.generateScatterChartData(data, chartConfig);
                default:
                    return this.generateBarChartData(data, chartConfig);
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成柱状图数据
     */
    generateBarChartData(data, config) {
        const labels = [];
        const values = [];
        const colors = [];

        data.forEach((item, index) => {
            labels.push(item.label || item.name || `项目${index + 1}`);
            values.push(item.value || item.count || 0);
            colors.push(config.colors[index % config.colors.length]);
        });

        return {
            type: 'bar',
            labels,
            datasets: [{
                label: config.label || '数据',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }

    /**
     * 生成饼图数据
     */
    generatePieChartData(data, config) {
        const labels = [];
        const values = [];
        const colors = [];

        data.forEach((item, index) => {
            labels.push(item.label || item.name || `项目${index + 1}`);
            values.push(item.value || item.count || 0);
            colors.push(config.colors[index % config.colors.length]);
        });

        return {
            type: 'pie',
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        };
    }

    /**
     * 生成折线图数据
     */
    generateLineChartData(data, config) {
        const labels = [];
        const values = [];

        data.forEach((item, index) => {
            labels.push(item.label || item.name || `点${index + 1}`);
            values.push(item.value || item.count || 0);
        });

        return {
            type: 'line',
            labels,
            datasets: [{
                label: config.label || '趋势',
                data: values,
                borderColor: config.colors[0],
                backgroundColor: config.colors[0] + '20',
                tension: 0.1
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }

    /**
     * 生成散点图数据
     */
    generateScatterChartData(data, config) {
        const points = [];

        data.forEach((item, index) => {
            points.push({
                x: item.x || index,
                y: item.y || item.value || 0
            });
        });

        return {
            type: 'scatter',
            datasets: [{
                label: config.label || '数据点',
                data: points,
                backgroundColor: config.colors[0],
                borderColor: config.colors[0]
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    },
                    y: {
                        type: 'linear',
                        position: 'left'
                    }
                }
            }
        };
    }

    /**
     * 生成分类统计展示
     * @param {Object} categories - 分类数据
     * @param {Object} options - 配置选项
     * @returns {string} 格式化的分类统计文本
     */
    generateCategoryStats(categories, options = {}) {
        try {
            const config = { ...this.config, ...options };
            let stats = '';

            Object.entries(categories).forEach(([category, items]) => {
                stats += `\n📁 ${category} (${items.length}个):\n`;
                stats += '-'.repeat(40) + '\n';

                // 按数量排序
                const sortedItems = items.sort((a, b) => (b.count || 0) - (a.count || 0));

                sortedItems.forEach((item, index) => {
                    if (index >= config.maxRows) return;
                    
                    const name = item.name || item.id || item;
                    const count = item.count || 1;
                    const percentage = ((count / items.length) * 100).toFixed(1);
                    
                    stats += `   ${index + 1}. ${name}: ${count}个 (${percentage}%)\n`;
                    
                    if (item.description) {
                        stats += `       描述: ${item.description}\n`;
                    }
                });

                if (items.length > config.maxRows) {
                    stats += `   ... (显示前${config.maxRows}项，共${items.length}项)\n`;
                }
            });

            return stats;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 生成数据摘要
     * @param {Array} data - 数据数组
     * @param {Object} options - 配置选项
     * @returns {Object} 数据摘要对象
     */
    generateDataSummary(data, options = {}) {
        try {
            if (!data || data.length === 0) {
                return {
                    count: 0,
                    summary: '暂无数据'
                };
            }

            const summary = {
                count: data.length,
                types: {},
                ranges: {},
                statistics: {}
            };

            // 统计类型分布
            data.forEach(item => {
                if (item.type) {
                    summary.types[item.type] = (summary.types[item.type] || 0) + 1;
                }
            });

            // 计算数值范围
            const numericValues = data
                .map(item => parseFloat(item.value || item.count || 0))
                .filter(val => !isNaN(val));

            if (numericValues.length > 0) {
                summary.statistics = {
                    min: Math.min(...numericValues),
                    max: Math.max(...numericValues),
                    average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                    total: numericValues.reduce((a, b) => a + b, 0)
                };
            }

            return summary;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * 验证输入数据
     * @param {Object} data - 输入数据
     * @returns {boolean} 验证结果
     */
    validateInput(data) {
        return data && (Array.isArray(data) || typeof data === 'object');
    }
}

// 创建默认实例
const dataDisplay = new DataDisplay();

// 导出类和默认实例
module.exports = {
    DataDisplay,
    dataDisplay
}; 