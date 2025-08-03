/**
 * 毛小豆宇宙通用工具模块
 * 提供版本检查、文件检查、框架检查等通用工具功能
 */

const fs = require('fs/promises');
const path = require('path');

/**
 * 版本号一致性检查器
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

            if (!this.validateVersionFormat(version)) {
                detail.message = '版本号格式无效';
                results.issues.push(`${fileName}: 版本号格式无效 (${version})`);
                results.isValid = false;
            } else if (!this.validateVersion(version, expectedVersion)) {
                detail.message = '版本号不匹配';
                results.issues.push(`${fileName}: 版本号不匹配 (期望: ${expectedVersion}, 实际: ${version})`);
                results.isValid = false;
            } else {
                detail.isValid = true;
                detail.message = '版本号匹配';
            }

            results.details[fileName] = detail;
        }

        return results;
    }

    /**
     * 检查理论框架相关文件的版本号一致性
     * @param {Object} dataObjects - 数据对象集合
     * @returns {Object} 检查结果
     */
    checkTheoryFrameworkVersions(dataObjects) {
        const fileVersions = {};
        
        // 提取理论框架相关文件的版本号
        if (dataObjects['theoretical_framework.json']?.metadata?.version) {
            fileVersions['theoretical_framework.json'] = dataObjects['theoretical_framework.json'].metadata.version;
        }
        if (dataObjects['mappings.json']?.metadata?.version) {
            fileVersions['mappings.json'] = dataObjects['mappings.json'].metadata.version;
        }
        if (dataObjects['reading_experience.json']?.metadata?.version) {
            fileVersions['reading_experience.json'] = dataObjects['reading_experience.json'].metadata.version;
        }
        if (dataObjects['metadata.json']?.version) {
            fileVersions['metadata.json'] = dataObjects['metadata.json'].version;
        }

        return this.checkVersionConsistency(fileVersions, '3.0');
    }
}

/**
 * 框架文件引用检查器
 */
class FrameworkFileChecker {
    constructor() {
        this.expectedFrameworkFiles = ['theoretical_framework.json', 'mappings.json', 'reading_experience.json'];
    }

    /**
     * 设置期望的框架文件列表
     * @param {string[]} files - 期望的框架文件列表
     */
    setExpectedFrameworkFiles(files) {
        this.expectedFrameworkFiles = files;
    }

    /**
     * 获取期望的框架文件列表
     * @returns {string[]} 期望的框架文件列表
     */
    getExpectedFrameworkFiles() {
        return this.expectedFrameworkFiles;
    }

    /**
     * 检查元数据中的框架文件引用
     * @param {Object} metadata - 元数据对象
     * @returns {Object} 检查结果
     */
    checkFrameworkFileReferences(metadata) {
        const results = {
            isValid: true,
            issues: [],
            warnings: [],
            details: {}
        };

        if (!metadata || !metadata.framework_files) {
            results.issues.push('元数据中缺少framework_files字段');
            results.isValid = false;
            return results;
        }

        const frameworkFiles = metadata.framework_files;
        
        for (const expectedFile of this.expectedFrameworkFiles) {
            const detail = {
                expectedFile,
                isReferenced: false,
                message: ''
            };

            if (!frameworkFiles.includes(expectedFile)) {
                detail.message = '框架文件未在元数据中引用';
                results.issues.push(`框架文件未引用: ${expectedFile}`);
                results.isValid = false;
            } else {
                detail.isReferenced = true;
                detail.message = '框架文件已正确引用';
            }

            results.details[expectedFile] = detail;
        }

        return results;
    }
}

/**
 * 文件存在性检查器
 */
class FileExistenceChecker {
    constructor() {
        this.dataDir = path.join(__dirname, '..', '..', 'data');
    }

    /**
     * 检查单个文件是否存在
     * @param {string} fileName - 文件名
     * @returns {Promise<boolean>} 文件是否存在
     */
    async checkFileExists(fileName) {
        try {
            const filePath = path.join(this.dataDir, fileName);
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 检查多个文件是否存在
     * @param {string[]} fileNames - 文件名数组
     * @returns {Promise<Object>} 文件存在性检查结果 {fileName: exists}
     */
    async checkMultipleFilesExist(fileNames) {
        const results = {};
        
        for (const fileName of fileNames) {
            results[fileName] = await this.checkFileExists(fileName);
        }
        
        return results;
    }

    /**
     * 检查文件存在性并返回详细信息
     * @param {string[]} fileNames - 文件名数组
     * @returns {Promise<Object>} 详细的检查结果
     */
    async checkFilesWithDetails(fileNames) {
        const results = {
            stats: {
                total: fileNames.length,
                exists: 0,
                missing: 0
            },
            details: {},
            issues: [],
            warnings: []
        };

        for (const fileName of fileNames) {
            const exists = await this.checkFileExists(fileName);
            
            results.details[fileName] = {
                fileName,
                exists,
                message: exists ? '文件存在' : '文件不存在'
            };

            if (exists) {
                results.stats.exists++;
            } else {
                results.stats.missing++;
                results.issues.push(`文件不存在: ${fileName}`);
            }
        }

        return results;
    }
}

// 创建默认实例
const versionChecker = new VersionChecker();
const frameworkFileChecker = new FrameworkFileChecker();
const fileExistenceChecker = new FileExistenceChecker();

// 导出类和默认实例
module.exports = {
    VersionChecker,
    FrameworkFileChecker,
    FileExistenceChecker,
    versionChecker,
    frameworkFileChecker,
    fileExistenceChecker
}; 