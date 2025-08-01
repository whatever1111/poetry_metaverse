/**
 * 工具模块测试用例
 * 验证所有工具模块的功能
 */
const { dataLoader } = require('./data_loader.cjs');
const { versionChecker } = require('./version_checker.cjs');
const { frameworkFileChecker } = require('./framework_file_checker.cjs');
const { fileExistenceChecker } = require('./file_existence_checker.cjs');

async function testDataLoader() {
    console.log('🧪 测试数据加载器...\n');
    
    try {
        // 测试加载单个文件
        console.log('📋 测试加载单个文件...');
        const charactersData = await dataLoader.loadFile('characters.json');
        console.log(`✅ 成功加载 characters.json，角色数量: ${Object.keys(charactersData.characters).length}`);
        
        // 测试加载多个文件
        console.log('\n📋 测试加载多个文件...');
        const coreFiles = await dataLoader.loadCoreDataFiles();
        console.log(`✅ 成功加载核心数据文件，文件数量: ${Object.keys(coreFiles).length}`);
        
        // 测试缓存功能
        console.log('\n📋 测试缓存功能...');
        const cacheStats = dataLoader.getCacheStats();
        console.log(`✅ 缓存统计: ${cacheStats.size} 个文件已缓存`);
        
        // 测试文件存在性检查
        console.log('\n📋 测试文件存在性检查...');
        const exists = await dataLoader.fileExists('characters.json');
        console.log(`✅ characters.json 存在性检查: ${exists}`);
        
        console.log('\n✅ 数据加载器测试通过！\n');
        return true;
    } catch (error) {
        console.error('❌ 数据加载器测试失败:', error.message);
        return false;
    }
}

function testVersionChecker() {
    console.log('🧪 测试版本号检查器...\n');
    
    try {
        // 测试版本号格式验证
        console.log('📋 测试版本号格式验证...');
        const validVersions = ['1.0', '2.1', '3.0.1'];
        const invalidVersions = ['1', '2.1.2.3', 'abc', ''];
        
        validVersions.forEach(version => {
            const isValid = versionChecker.validateVersionFormat(version);
            console.log(`  ${isValid ? '✅' : '❌'} ${version}: ${isValid ? '有效' : '无效'}`);
        });
        
        invalidVersions.forEach(version => {
            const isValid = versionChecker.validateVersionFormat(version);
            console.log(`  ${isValid ? '❌' : '✅'} ${version}: ${isValid ? '错误地认为有效' : '正确识别为无效'}`);
        });
        
        // 测试版本号比较
        console.log('\n📋 测试版本号比较...');
        const comparisons = [
            ['1.0', '1.0'],
            ['1.0', '1.1'],
            ['2.0', '1.9'],
            ['1.0.1', '1.0']
        ];
        
        comparisons.forEach(([v1, v2]) => {
            const result = versionChecker.compareVersions(v1, v2);
            const symbol = result === 0 ? '=' : result > 0 ? '>' : '<';
            console.log(`  ${v1} ${symbol} ${v2}`);
        });
        
        // 测试版本号验证
        console.log('\n📋 测试版本号验证...');
        const validationTests = [
            ['3.0', '3.0', true],
            ['3.0', '3.1', false],
            ['2.9', '3.0', false]
        ];
        
        validationTests.forEach(([actual, expected, shouldMatch]) => {
            const isValid = versionChecker.validateVersion(actual, expected);
            const status = isValid === shouldMatch ? '✅' : '❌';
            console.log(`  ${status} ${actual} vs ${expected}: ${isValid ? '匹配' : '不匹配'} (期望: ${shouldMatch ? '匹配' : '不匹配'})`);
        });
        
        console.log('\n✅ 版本号检查器测试通过！\n');
        return true;
    } catch (error) {
        console.error('❌ 版本号检查器测试失败:', error.message);
        return false;
    }
}

function testFrameworkFileChecker() {
    console.log('🧪 测试框架文件检查器...\n');
    
    try {
        // 测试期望文件列表
        console.log('📋 测试期望文件列表...');
        const expectedFiles = frameworkFileChecker.getExpectedFrameworkFiles();
        console.log(`✅ 期望的框架文件: ${expectedFiles.join(', ')}`);
        
        // 测试设置期望文件列表
        console.log('\n📋 测试设置期望文件列表...');
        const newExpectedFiles = ['test1.json', 'test2.json'];
        frameworkFileChecker.setExpectedFrameworkFiles(newExpectedFiles);
        const updatedFiles = frameworkFileChecker.getExpectedFrameworkFiles();
        console.log(`✅ 更新后的期望文件: ${updatedFiles.join(', ')}`);
        
        // 恢复原始设置
        frameworkFileChecker.setExpectedFrameworkFiles(['theoretical_framework.json', 'mappings.json', 'reading_experience.json']);
        
        console.log('\n✅ 框架文件检查器测试通过！\n');
        return true;
    } catch (error) {
        console.error('❌ 框架文件检查器测试失败:', error.message);
        return false;
    }
}

async function testFileExistenceChecker() {
    console.log('🧪 测试文件存在性检查器...\n');
    
    try {
        // 测试单个文件检查
        console.log('📋 测试单个文件检查...');
        const exists = await fileExistenceChecker.checkFileExists('characters.json');
        console.log(`✅ characters.json 存在性: ${exists}`);
        
        // 测试多个文件检查
        console.log('\n📋 测试多个文件检查...');
        const testFiles = ['characters.json', 'poems.json', 'nonexistent.json'];
        const multipleResults = await fileExistenceChecker.checkMultipleFilesExist(testFiles);
        console.log('✅ 多个文件检查结果:');
        Object.entries(multipleResults).forEach(([file, exists]) => {
            console.log(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? '存在' : '不存在'}`);
        });
        
        // 测试详细检查
        console.log('\n📋 测试详细检查...');
        const detailedResults = await fileExistenceChecker.checkFilesWithDetails(['characters.json', 'poems.json']);
        console.log(`✅ 详细检查结果: ${detailedResults.stats.exists} 个存在，${detailedResults.stats.missing} 个缺失`);
        
        console.log('\n✅ 文件存在性检查器测试通过！\n');
        return true;
    } catch (error) {
        console.error('❌ 文件存在性检查器测试失败:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 开始运行工具模块测试...\n');
    
    const results = {
        dataLoader: false,
        versionChecker: false,
        frameworkFileChecker: false,
        fileExistenceChecker: false
    };
    
    // 运行所有测试
    results.dataLoader = await testDataLoader();
    results.versionChecker = testVersionChecker();
    results.frameworkFileChecker = testFrameworkFileChecker();
    results.fileExistenceChecker = await testFileExistenceChecker();
    
    // 输出测试结果
    console.log('📊 测试结果汇总:');
    Object.entries(results).forEach(([module, passed]) => {
        const status = passed ? '✅' : '❌';
        console.log(`  ${status} ${module}: ${passed ? '通过' : '失败'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n${allPassed ? '🎉 所有测试通过！' : '❌ 部分测试失败！'}`);
    
    return allPassed;
}

// 如果直接运行此脚本
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests }; 