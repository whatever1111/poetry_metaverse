/**
 * 框架文件引用检查器
 * 提供框架文件引用验证功能
 */
class FrameworkFileChecker {
    constructor() {
        this.expectedFrameworkFiles = [
            'theoretical_framework.json',
            'mappings.json',
            'reading_experience.json'
        ];
    }

    /**
     * 检查元数据中的框架文件引用
     * @param {Object} metadata - 元数据对象
     * @param {string[]} expectedFiles - 期望的框架文件列表
     * @returns {Object} 检查结果
     */
    checkFrameworkFileReferences(metadata, expectedFiles = null) {
        const expected = expectedFiles || this.expectedFrameworkFiles;
        const results = {
            isValid: true,
            issues: [],
            warnings: [],
            details: {}
        };

        // 获取元数据中的框架文件列表
        const frameworkFiles = metadata?.metadata?.theoretical_framework?.framework_files || [];

        // 检查每个期望的文件是否在引用列表中
        for (const expectedFile of expected) {
            const detail = {
                fileName: expectedFile,
                isReferenced: false,
                message: ''
            };

            if (frameworkFiles.includes(expectedFile)) {
                detail.isReferenced = true;
                detail.message = '文件引用正确';
            } else {
                detail.isReferenced = false;
                detail.message = '文件未在元数据中引用';
                results.issues.push(`❌ 元数据中缺少框架文件引用: ${expectedFile}`);
                results.isValid = false;
            }

            results.details[expectedFile] = detail;
        }

        // 检查是否有额外的文件引用
        const extraFiles = frameworkFiles.filter(file => !expected.includes(file));
        if (extraFiles.length > 0) {
            results.warnings.push(`⚠️ 发现额外的框架文件引用: ${extraFiles.join(', ')}`);
        }

        return results;
    }

    /**
     * 检查受控冗余机制中的文件引用
     * @param {Object} dataObjects - 数据对象 {fileName: data}
     * @returns {Object} 检查结果
     */
    checkControlledRedundancyReferences(dataObjects) {
        const results = {
            isValid: true,
            issues: [],
            warnings: [],
            details: {}
        };

        // 检查理论框架文件的受控冗余机制
        const tfData = dataObjects['theoretical_framework.json'];
        if (tfData && tfData.theoretical_framework?.controlled_redundancy) {
            const tfRedundancy = tfData.theoretical_framework.controlled_redundancy;
            const tfResult = this.checkRedundancyFileReferences(tfRedundancy, 'theoretical_framework.json');
            
            results.details['theoretical_framework.json'] = tfResult;
            if (!tfResult.isValid) {
                results.isValid = false;
                results.issues.push(...tfResult.issues);
            }
            results.warnings.push(...tfResult.warnings);
        } else {
            results.issues.push('❌ 理论框架文件缺少受控冗余机制');
            results.isValid = false;
        }

        // 检查映射文件的受控冗余机制
        const mappingsData = dataObjects['mappings.json'];
        if (mappingsData && mappingsData.metadata?.controlled_redundancy) {
            const mapRedundancy = mappingsData.metadata.controlled_redundancy;
            const mapResult = this.checkRedundancyFileReferences(mapRedundancy, 'mappings.json');
            
            results.details['mappings.json'] = mapResult;
            if (!mapResult.isValid) {
                results.isValid = false;
                results.issues.push(...mapResult.issues);
            }
            results.warnings.push(...mapResult.warnings);
        } else {
            results.issues.push('❌ 映射文件缺少受控冗余机制');
            results.isValid = false;
        }

        // 检查阅读体验文件的受控冗余机制
        const reData = dataObjects['reading_experience.json'];
        if (reData && reData.reading_experience?.controlled_redundancy) {
            const reRedundancy = reData.reading_experience.controlled_redundancy;
            const reResult = this.checkRedundancyFileReferences(reRedundancy, 'reading_experience.json');
            
            results.details['reading_experience.json'] = reResult;
            if (!reResult.isValid) {
                results.isValid = false;
                results.issues.push(...reResult.issues);
            }
            results.warnings.push(...reResult.warnings);
        } else {
            results.issues.push('❌ 阅读体验文件缺少受控冗余机制');
            results.isValid = false;
        }

        return results;
    }

    /**
     * 检查单个受控冗余机制的文件引用
     * @param {Object} redundancy - 受控冗余机制对象
     * @param {string} sourceFile - 源文件名
     * @returns {Object} 检查结果
     */
    checkRedundancyFileReferences(redundancy, sourceFile) {
        const results = {
            isValid: true,
            issues: [],
            warnings: [],
            sourceFile
        };

        if (!redundancy.referenced_files || !Array.isArray(redundancy.referenced_files)) {
            results.issues.push(`❌ ${sourceFile} 缺少 referenced_files 数组`);
            results.isValid = false;
            return results;
        }

        if (redundancy.referenced_files.length === 0) {
            results.warnings.push(`⚠️ ${sourceFile} 的 referenced_files 数组为空`);
        }

        // 检查交叉引用
        if (!redundancy.cross_references || typeof redundancy.cross_references !== 'object') {
            results.issues.push(`❌ ${sourceFile} 缺少 cross_references 对象`);
            results.isValid = false;
        } else {
            const crossRefCount = Object.keys(redundancy.cross_references).length;
            if (crossRefCount === 0) {
                results.warnings.push(`⚠️ ${sourceFile} 的 cross_references 对象为空`);
            }
        }

        return results;
    }

    /**
     * 生成框架文件检查报告
     * @param {Object} checkResult - 检查结果
     * @returns {string} 格式化的报告
     */
    generateFrameworkFileReport(checkResult) {
        let report = '📋 框架文件引用检查报告\n\n';

        if (checkResult.isValid && checkResult.warnings.length === 0) {
            report += '✅ 所有框架文件引用正确\n\n';
        } else {
            if (checkResult.issues.length > 0) {
                report += '❌ 发现框架文件引用问题:\n';
                checkResult.issues.forEach(issue => {
                    report += `  ${issue}\n`;
                });
                report += '\n';
            }

            if (checkResult.warnings.length > 0) {
                report += '⚠️ 框架文件引用警告:\n';
                checkResult.warnings.forEach(warning => {
                    report += `  ${warning}\n`;
                });
                report += '\n';
            }
        }

        if (checkResult.details) {
            report += '📊 详细检查结果:\n';
            for (const [fileName, detail] of Object.entries(checkResult.details)) {
                if (typeof detail === 'object' && detail.hasOwnProperty('isReferenced')) {
                    const status = detail.isReferenced ? '✅' : '❌';
                    report += `  ${status} ${fileName}: ${detail.message}\n`;
                } else if (typeof detail === 'object' && detail.hasOwnProperty('sourceFile')) {
                    const status = detail.isValid ? '✅' : '❌';
                    report += `  ${status} ${detail.sourceFile}: 受控冗余机制检查\n`;
                }
            }
        }

        return report;
    }

    /**
     * 设置期望的框架文件列表
     * @param {string[]} expectedFiles - 期望的框架文件列表
     */
    setExpectedFrameworkFiles(expectedFiles) {
        this.expectedFrameworkFiles = [...expectedFiles];
    }

    /**
     * 获取期望的框架文件列表
     * @returns {string[]} 期望的框架文件列表
     */
    getExpectedFrameworkFiles() {
        return [...this.expectedFrameworkFiles];
    }
}

// 创建默认实例
const frameworkFileChecker = new FrameworkFileChecker();

// 导出类和默认实例
module.exports = {
    FrameworkFileChecker,
    frameworkFileChecker
}; 