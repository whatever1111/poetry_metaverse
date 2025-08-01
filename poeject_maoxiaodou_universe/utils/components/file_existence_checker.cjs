const fs = require('fs/promises');
const path = require('path');

/**
 * 文件存在性检查器
 * 提供文件存在性验证功能
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
     * @returns {Promise<Object>} 检查结果 {fileName: exists}
     */
    async checkMultipleFilesExist(fileNames) {
        const results = {};
        
        for (const fileName of fileNames) {
            results[fileName] = await this.checkFileExists(fileName);
        }
        
        return results;
    }

    /**
     * 检查文件列表并返回详细结果
     * @param {string[]} fileNames - 文件名数组
     * @returns {Promise<Object>} 详细检查结果
     */
    async checkFilesWithDetails(fileNames) {
        const results = {
            isValid: true,
            issues: [],
            warnings: [],
            details: {},
            stats: {
                total: fileNames.length,
                exists: 0,
                missing: 0
            }
        };

        for (const fileName of fileNames) {
            const exists = await this.checkFileExists(fileName);
            const detail = {
                fileName,
                exists,
                filePath: path.join(this.dataDir, fileName),
                message: exists ? '文件存在' : '文件不存在'
            };

            results.details[fileName] = detail;

            if (exists) {
                results.stats.exists++;
            } else {
                results.stats.missing++;
                results.issues.push(`❌ 文件不存在: ${fileName}`);
                results.isValid = false;
            }
        }

        // 添加统计信息
        if (results.stats.missing > 0) {
            results.warnings.push(`⚠️ 发现 ${results.stats.missing} 个文件不存在，${results.stats.exists} 个文件存在`);
        }

        return results;
    }

    /**
     * 检查受控冗余机制中引用的文件
     * @param {Object} dataObjects - 数据对象 {fileName: data}
     * @returns {Promise<Object>} 检查结果
     */
    async checkControlledRedundancyFiles(dataObjects) {
        const allReferencedFiles = new Set();

        // 收集所有受控冗余机制中引用的文件
        const filesToCheck = ['theoretical_framework.json', 'mappings.json', 'reading_experience.json'];
        
        for (const fileName of filesToCheck) {
            const data = dataObjects[fileName];
            if (data) {
                let redundancy = null;
                
                if (fileName === 'theoretical_framework.json') {
                    redundancy = data.theoretical_framework?.controlled_redundancy;
                } else if (fileName === 'mappings.json') {
                    redundancy = data.metadata?.controlled_redundancy;
                } else if (fileName === 'reading_experience.json') {
                    redundancy = data.reading_experience?.controlled_redundancy;
                }

                if (redundancy?.referenced_files && Array.isArray(redundancy.referenced_files)) {
                    redundancy.referenced_files.forEach(file => allReferencedFiles.add(file));
                }
            }
        }

        const referencedFilesArray = Array.from(allReferencedFiles);
        return await this.checkFilesWithDetails(referencedFilesArray);
    }

    /**
     * 检查理论框架相关文件
     * @returns {Promise<Object>} 检查结果
     */
    async checkTheoryFrameworkFiles() {
        const theoryFiles = [
            'theoretical_framework.json',
            'mappings.json',
            'reading_experience.json',
            'metadata.json'
        ];

        return await this.checkFilesWithDetails(theoryFiles);
    }

    /**
     * 检查核心数据文件
     * @returns {Promise<Object>} 检查结果
     */
    async checkCoreDataFiles() {
        const coreFiles = [
            'characters.json',
            'poems.json',
            'themes.json',
            'terminology.json',
            'timeline.json'
        ];

        return await this.checkFilesWithDetails(coreFiles);
    }

    /**
     * 检查所有主要数据文件
     * @returns {Promise<Object>} 检查结果
     */
    async checkAllDataFiles() {
        const allFiles = [
            'theoretical_framework.json',
            'mappings.json',
            'reading_experience.json',
            'characters.json',
            'poems.json',
            'terminology.json',
            'themes.json',
            'metadata.json',
            'timeline.json'
        ];

        return await this.checkFilesWithDetails(allFiles);
    }

    /**
     * 生成文件存在性检查报告
     * @param {Object} checkResult - 检查结果
     * @returns {string} 格式化的报告
     */
    generateFileExistenceReport(checkResult) {
        let report = '📋 文件存在性检查报告\n\n';

        if (checkResult.isValid) {
            report += `✅ 所有文件都存在 (${checkResult.stats.total} 个文件)\n\n`;
        } else {
            report += `❌ 发现 ${checkResult.stats.missing} 个文件不存在，${checkResult.stats.exists} 个文件存在\n\n`;
        }

        if (checkResult.issues.length > 0) {
            report += '❌ 缺失文件:\n';
            checkResult.issues.forEach(issue => {
                report += `  ${issue}\n`;
            });
            report += '\n';
        }

        if (checkResult.warnings.length > 0) {
            report += '⚠️ 警告信息:\n';
            checkResult.warnings.forEach(warning => {
                report += `  ${warning}\n`;
            });
            report += '\n';
        }

        report += '📊 详细检查结果:\n';
        for (const [fileName, detail] of Object.entries(checkResult.details)) {
            const status = detail.exists ? '✅' : '❌';
            report += `  ${status} ${fileName}: ${detail.message}\n`;
        }

        report += `\n📈 统计信息: 总计 ${checkResult.stats.total} 个文件，存在 ${checkResult.stats.exists} 个，缺失 ${checkResult.stats.missing} 个`;

        return report;
    }

    /**
     * 设置数据目录路径
     * @param {string} dataDir - 数据目录路径
     */
    setDataDir(dataDir) {
        this.dataDir = dataDir;
    }

    /**
     * 获取数据目录路径
     * @returns {string} 数据目录路径
     */
    getDataDir() {
        return this.dataDir;
    }

    /**
     * 获取文件的完整路径
     * @param {string} fileName - 文件名
     * @returns {string} 文件的完整路径
     */
    getFilePath(fileName) {
        return path.join(this.dataDir, fileName);
    }
}

// 创建默认实例
const fileExistenceChecker = new FileExistenceChecker();

// 导出类和默认实例
module.exports = {
    FileExistenceChecker,
    fileExistenceChecker
}; 