/**
 * 版本号一致性检查器
 * 提供版本号验证、比较和一致性检查功能
 */
class VersionChecker {
    constructor() {
        this.expectedVersions = {
            'theoretical_framework': '3.0',
            'mappings': '3.0',
            'reading_experience': '3.0',
            'metadata': '3.0'
        };
    }

    /**
     * 验证版本号格式
     * @param {string} version - 版本号字符串
     * @returns {boolean} 版本号格式是否有效
     */
    validateVersionFormat(version) {
        if (typeof version !== 'string') {
            return false;
        }
        
        // 支持 x.y 或 x.y.z 格式
        const versionPattern = /^\d+\.\d+(\.\d+)?$/;
        return versionPattern.test(version);
    }

    /**
     * 比较两个版本号
     * @param {string} version1 - 第一个版本号
     * @param {string} version2 - 第二个版本号
     * @returns {number} 比较结果：-1(version1<version2), 0(相等), 1(version1>version2)
     */
    compareVersions(version1, version2) {
        if (!this.validateVersionFormat(version1) || !this.validateVersionFormat(version2)) {
            throw new Error('版本号格式无效');
        }

        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);

        // 确保两个版本号有相同数量的部分
        const maxLength = Math.max(v1Parts.length, v2Parts.length);
        while (v1Parts.length < maxLength) v1Parts.push(0);
        while (v2Parts.length < maxLength) v2Parts.push(0);

        for (let i = 0; i < maxLength; i++) {
            if (v1Parts[i] < v2Parts[i]) return -1;
            if (v1Parts[i] > v2Parts[i]) return 1;
        }

        return 0;
    }

    /**
     * 检查版本号是否匹配期望值
     * @param {string} actual - 实际版本号
     * @param {string} expected - 期望版本号
     * @returns {boolean} 版本号是否匹配
     */
    validateVersion(actual, expected) {
        if (!this.validateVersionFormat(actual) || !this.validateVersionFormat(expected)) {
            return false;
        }

        return this.compareVersions(actual, expected) === 0;
    }

    /**
     * 检查多个文件的版本号一致性
     * @param {Object} fileVersions - 文件版本号对象 {fileName: version}
     * @param {string} expectedVersion - 期望的版本号
     * @returns {Object} 检查结果
     */
    checkVersionConsistency(fileVersions, expectedVersion) {
        const results = {
            isValid: true,
            issues: [],
            warnings: [],
            details: {}
        };

        for (const [fileName, version] of Object.entries(fileVersions)) {
            const detail = {
                fileName,
                actualVersion: version,
                expectedVersion,
                isValid: false,
                message: ''
            };

            if (!version) {
                detail.message = '版本号为空';
                results.issues.push(`❌ ${fileName}: 版本号为空`);
                results.isValid = false;
            } else if (!this.validateVersionFormat(version)) {
                detail.message = '版本号格式无效';
                results.issues.push(`❌ ${fileName}: 版本号格式无效 (${version})`);
                results.isValid = false;
            } else if (!this.validateVersion(version, expectedVersion)) {
                detail.message = `版本号不匹配 (期望: ${expectedVersion}, 实际: ${version})`;
                results.warnings.push(`⚠️ ${fileName}: 版本号不匹配 (期望: ${expectedVersion}, 实际: ${version})`);
                detail.isValid = false;
            } else {
                detail.message = '版本号匹配';
                detail.isValid = true;
            }

            results.details[fileName] = detail;
        }

        return results;
    }

    /**
     * 检查理论框架相关文件的版本号一致性
     * @param {Object} dataObjects - 数据对象 {fileName: data}
     * @returns {Object} 检查结果
     */
    checkTheoryFrameworkVersions(dataObjects) {
        const fileVersions = {};
        const expectedVersion = '3.0';

        // 提取版本号
        if (dataObjects['theoretical_framework.json']) {
            fileVersions['theoretical_framework.json'] = 
                dataObjects['theoretical_framework.json'].theoretical_framework?.version;
        }
        
        if (dataObjects['mappings.json']) {
            fileVersions['mappings.json'] = 
                dataObjects['mappings.json'].metadata?.version;
        }
        
        if (dataObjects['reading_experience.json']) {
            fileVersions['reading_experience.json'] = 
                dataObjects['reading_experience.json'].reading_experience?.version;
        }
        
        if (dataObjects['metadata.json']) {
            fileVersions['metadata.json'] = 
                dataObjects['metadata.json'].metadata?.version;
        }

        return this.checkVersionConsistency(fileVersions, expectedVersion);
    }

    /**
     * 生成版本号检查报告
     * @param {Object} checkResult - 版本号检查结果
     * @returns {string} 格式化的报告
     */
    generateVersionReport(checkResult) {
        let report = '📋 版本号一致性检查报告\n\n';

        if (checkResult.isValid && checkResult.warnings.length === 0) {
            report += '✅ 所有文件版本号一致\n\n';
        } else {
            if (checkResult.issues.length > 0) {
                report += '❌ 发现版本号问题:\n';
                checkResult.issues.forEach(issue => {
                    report += `  ${issue}\n`;
                });
                report += '\n';
            }

            if (checkResult.warnings.length > 0) {
                report += '⚠️ 版本号警告:\n';
                checkResult.warnings.forEach(warning => {
                    report += `  ${warning}\n`;
                });
                report += '\n';
            }
        }

        report += '📊 详细检查结果:\n';
        for (const [fileName, detail] of Object.entries(checkResult.details)) {
            const status = detail.isValid ? '✅' : '❌';
            report += `  ${status} ${fileName}: ${detail.actualVersion || 'N/A'} (${detail.message})\n`;
        }

        return report;
    }

    /**
     * 设置期望版本号
     * @param {Object} expectedVersions - 期望版本号对象
     */
    setExpectedVersions(expectedVersions) {
        this.expectedVersions = { ...this.expectedVersions, ...expectedVersions };
    }

    /**
     * 获取期望版本号
     * @returns {Object} 期望版本号对象
     */
    getExpectedVersions() {
        return { ...this.expectedVersions };
    }
}

// 创建默认实例
const versionChecker = new VersionChecker();

// 导出类和默认实例
module.exports = {
    VersionChecker,
    versionChecker
}; 