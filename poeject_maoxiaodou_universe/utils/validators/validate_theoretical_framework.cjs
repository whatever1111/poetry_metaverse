/**
 * 毛小豆宇宙理论框架验证脚本 (重构版)
 * 使用公共工具模块，消除重复代码
 */
const { dataLoader } = require('../components/data_loader.cjs');
const { versionChecker } = require('../components/version_checker.cjs');
const { frameworkFileChecker } = require('../components/framework_file_checker.cjs');
const { fileExistenceChecker } = require('../components/file_existence_checker.cjs');

async function validateTheoreticalFramework() {
    console.log('🔍 开始毛小豆宇宙理论框架验证...\n');
    
    try {
        // 使用公共工具加载数据
        console.log('📋 加载理论框架相关文件...');
        const dataObjects = await dataLoader.loadTheoryFrameworkFiles();
        
        // 检查文件存在性
        console.log('📋 检查文件存在性...');
        const fileExistenceResult = await fileExistenceChecker.checkTheoryFrameworkFiles();
        if (!fileExistenceResult.isValid) {
            console.log(fileExistenceChecker.generateFileExistenceReport(fileExistenceResult));
            return false;
        }

        const theoretical_framework = dataObjects['theoretical_framework.json'];
        const mappings = dataObjects['mappings.json'];
        const reading_experience = dataObjects['reading_experience.json'];
        const metadata = dataObjects['metadata.json'];
        const issues = [];
        const warnings = [];

        // 1. 验证理论框架完整性
        console.log('📋 验证理论框架完整性...');
        const expectedTheories = ['obscene_supplement', 'ugly_emotions', 'microphysics_of_power', 'gated_community_poetics'];
        
        for (const theoryId of expectedTheories) {
            if (!theoretical_framework.theoretical_framework.theories[theoryId]) {
                issues.push(`❌ 缺少理论: ${theoryId}`);
            }
        }

        // 2. 验证理论-数据映射关系
        console.log('📋 验证理论-数据映射关系...');
        for (const [theoryId, mapping] of Object.entries(mappings.theory_mappings)) {
            if (!theoretical_framework.theoretical_framework.theories[theoryId]) {
                issues.push(`❌ 映射中的理论 ${theoryId} 在理论框架中不存在`);
            }
        }

        // 3. 验证阅读体验设计
        console.log('📋 验证阅读体验设计...');
        const expectedLayers = ['open_narrative', 'cognitive_labor', 'theoretical_depth'];
        
        for (const layerId of expectedLayers) {
            if (!reading_experience.reading_experience.reading_layers[layerId]) {
                issues.push(`❌ 缺少阅读层次: ${layerId}`);
            }
        }

        // 4. 验证元数据一致性
        console.log('📋 验证元数据一致性...');
        const metadataTheories = metadata.metadata.theoretical_framework.theories;
        if (metadataTheories.length !== expectedTheories.length) {
            issues.push(`❌ 元数据中的理论数量(${metadataTheories.length})与理论框架不匹配(${expectedTheories.length})`);
        }

        // 5. 使用公共工具验证文件引用的一致性
        console.log('📋 验证文件引用的一致性...');
        const frameworkFileResult = frameworkFileChecker.checkFrameworkFileReferences(metadata);
        if (!frameworkFileResult.isValid) {
            issues.push(...frameworkFileResult.issues);
        }
        warnings.push(...frameworkFileResult.warnings);

        // 6. 使用公共工具验证版本号一致性
        console.log('📋 验证版本号一致性...');
        const versionResult = versionChecker.checkTheoryFrameworkVersions(dataObjects);
        if (!versionResult.isValid) {
            issues.push(...versionResult.issues);
        }
        warnings.push(...versionResult.warnings);

        // 输出结果
        console.log('\n📊 验证结果:');
        if (issues.length === 0) {
            console.log('✅ 理论框架验证通过！');
        } else {
            console.log(`❌ 发现 ${issues.length} 个问题:`);
            issues.forEach(issue => console.log(issue));
        }

        if (warnings.length > 0) {
            console.log(`\n⚠️ 发现 ${warnings.length} 个警告:`);
            warnings.forEach(warning => console.log(warning));
        }

        // 生成统计信息
        const stats = {
            totalTheories: Object.keys(theoretical_framework.theoretical_framework.theories).length,
            totalMappings: Object.keys(mappings.theory_mappings).length,
            totalReadingLayers: Object.keys(reading_experience.reading_experience.reading_layers).length,
            totalReadingPaths: Object.keys(reading_experience.reading_experience.reading_paths).length
        };

        console.log('\n📈 理论框架统计:');
        console.log(`- 理论数量: ${stats.totalTheories}`);
        console.log(`- 映射关系: ${stats.totalMappings}`);
        console.log(`- 阅读层次: ${stats.totalReadingLayers}`);
        console.log(`- 阅读路径: ${stats.totalReadingPaths}`);

        // 输出详细报告
        console.log('\n📋 详细检查报告:');
        console.log(frameworkFileChecker.generateFrameworkFileReport(frameworkFileResult));
        console.log(versionChecker.generateVersionReport(versionResult));

        // 验证通过标志
        const isValid = issues.length === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 理论框架验证${isValid ? '通过' : '失败'}`);
        
        return isValid;

    } catch (error) {
        console.error('❌ 理论框架验证失败:', error.message);
        return false;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateTheoreticalFramework();
}

module.exports = { validateTheoreticalFramework }; 