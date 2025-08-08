const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * 统一数据文件加载器
 * 提供通用的数据文件读取和JSON解析功能
 */
class DataLoader {
    constructor() {
        this.cache = new Map(); // 简单的内存缓存
    }

    /**
     * 加载单个数据文件
     * @param {string} fileName - 文件名
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} 解析后的JSON数据
     */
    async loadFile(fileName, useCache = true) {
        if (useCache && this.cache.has(fileName)) {
            return this.cache.get(fileName);
        }

        try {
            const filePath = path.join(DATA_DIR, fileName);
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            
            if (useCache) {
                this.cache.set(fileName, data);
            }
            
            return data;
        } catch (error) {
            throw new Error(`加载文件 ${fileName} 失败: ${error.message}`);
        }
    }

    /**
     * 加载多个数据文件
     * @param {string[]} fileNames - 文件名数组
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} 包含所有文件数据的对象
     */
    async loadFiles(fileNames, useCache = true) {
        const dataObjects = {};
        
        for (const fileName of fileNames) {
            try {
                dataObjects[fileName] = await this.loadFile(fileName, useCache);
            } catch (error) {
                console.warn(`⚠️ 文件不存在或读取失败: ${fileName}`);
                dataObjects[fileName] = null;
            }
        }
        
        return dataObjects;
    }

    /**
     * 加载所有主要数据文件
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} 包含所有主要文件数据的对象
     */
    async loadAllDataFiles(useCache = true) {
        const dataFiles = [
            'theoretical_framework.json',
            'mappings.json', 
            'reading_experience.json',
            'characters.json',
            'poems.json',
            'terminology.json',
            'themes.json',
            'metadata.json',
            'timeline.json',
            'scenes.json'
        ];
        
        return await this.loadFiles(dataFiles, useCache);
    }

    /**
     * 加载理论框架相关文件
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} 理论框架相关文件数据
     */
    async loadTheoryFrameworkFiles(useCache = true) {
        const theoryFiles = [
            'theoretical_framework.json',
            'mappings.json',
            'reading_experience.json',
            'metadata.json'
        ];
        
        return await this.loadFiles(theoryFiles, useCache);
    }

    /**
     * 加载核心数据文件
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} 核心数据文件数据
     */
    async loadCoreDataFiles(useCache = true) {
        const coreFiles = [
            'characters.json',
            'poems.json',
            'themes.json',
            'terminology.json',
            'scenes.json'
        ];
        
        return await this.loadFiles(coreFiles, useCache);
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计信息
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * 检查文件是否存在
     * @param {string} fileName - 文件名
     * @returns {Promise<boolean>} 文件是否存在
     */
    async fileExists(fileName) {
        try {
            const filePath = path.join(DATA_DIR, fileName);
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取数据目录路径
     * @returns {string} 数据目录的绝对路径
     */
    getDataDir() {
        return DATA_DIR;
    }
}

// 创建默认实例
const dataLoader = new DataLoader();

// 导出类和默认实例
module.exports = {
    DataLoader,
    dataLoader
}; 