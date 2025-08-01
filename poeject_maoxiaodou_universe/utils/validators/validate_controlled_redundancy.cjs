/**
 * 毛小豆宇宙受控冗余机制验证脚本 (重构版)
 * 使用公共工具模块，消除重复代码
 */
const { dataLoader } = require('../components/data_loader.cjs');
const { versionChecker } = require('../components/version_checker.cjs');
const { frameworkFileChecker } = require('../components/framework_file_checker.cjs');
const { fileExistenceChecker } = require('../components/file_existence_checker.cjs');

async function validateControlledRedundancy() {
    console.log('🔍 开始毛小豆宇宙受控冗余机制验证...\n');
    
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

        // 1. 验证理论框架的受控冗余机制
        console.log('📋 验证理论框架的受控冗余机制...');
        const tfRedundancy = theoretical_framework.theoretical_framework.controlled_redundancy;
        if (!tfRedundancy) {
            issues.push('❌ 理论框架文件缺少受控冗余机制');
        } else {
            // 检查引用的文件是否都存在
            const tfFileCheck = await fileExistenceChecker.checkFilesWithDetails(tfRedundancy.referenced_files);
            if (!tfFileCheck.isValid) {
                issues.push(...tfFileCheck.issues);
            }
            
            // 检查交叉引用的一致性
            const expectedCrossRefs = [
                'character_mappings',
                'poem_mappings', 
                'theory_mappings',
                'reading_layers',
                'character_data',
                'poem_data',
                'terminology_data'
            ];
            
            for (const ref of expectedCrossRefs) {
                if (!tfRedundancy.cross_references[ref]) {
                    issues.push(`❌ 理论框架缺少交叉引用: ${ref}`);
                }
            }
        }

        // 2. 验证阅读体验的受控冗余机制
        console.log('📋 验证阅读体验的受控冗余机制...');
        const reRedundancy = reading_experience.reading_experience.controlled_redundancy;
        if (!reRedundancy) {
            issues.push('❌ 阅读体验文件缺少受控冗余机制');
        } else {
            // 检查引用的文件是否都存在
            const reFileCheck = await fileExistenceChecker.checkFilesWithDetails(reRedundancy.referenced_files);
            if (!reFileCheck.isValid) {
                issues.push(...reFileCheck.issues);
            }
        }

        // 3. 验证映射文件的受控冗余机制
        console.log('📋 验证映射文件的受控冗余机制...');
        const mapRedundancy = mappings.metadata.controlled_redundancy;
        if (!mapRedundancy) {
            issues.push('❌ 映射文件缺少受控冗余机制');
        } else {
            // 检查引用的文件是否都存在
            const mapFileCheck = await fileExistenceChecker.checkFilesWithDetails(mapRedundancy.referenced_files);
            if (!mapFileCheck.isValid) {
                issues.push(...mapFileCheck.issues);
            }
        }

        // 4. 使用公共工具验证版本号一致性
        console.log('📋 验证版本号一致性...');
        const versionResult = versionChecker.checkTheoryFrameworkVersions(dataObjects);
        if (!versionResult.isValid) {
            issues.push(...versionResult.issues);
        }
        warnings.push(...versionResult.warnings);

        // 5. 使用公共工具验证元数据中的框架文件引用
        console.log('📋 验证元数据中的框架文件引用...');
        const frameworkFileResult = frameworkFileChecker.checkFrameworkFileReferences(metadata);
        if (!frameworkFileResult.isValid) {
            issues.push(...frameworkFileResult.issues);
        }
        warnings.push(...frameworkFileResult.warnings);

        // 输出结果
        console.log('\n📊 受控冗余机制验证结果:');
        if (issues.length === 0) {
            console.log('✅ 受控冗余机制验证通过！');
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
            totalReferencedFiles: tfRedundancy ? tfRedundancy.referenced_files.length : 0,
            totalCrossReferences: tfRedundancy ? Object.keys(tfRedundancy.cross_references).length : 0,
            frameworkFilesInMetadata: metadata.metadata.theoretical_framework.framework_files.length,
            versionConsistency: versionResult.isValid
        };

        console.log('\n📈 受控冗余机制统计:');
        console.log(`- 引用文件数量: ${stats.totalReferencedFiles}`);
        console.log(`- 交叉引用数量: ${stats.totalCrossReferences}`);
        console.log(`- 元数据框架文件: ${stats.frameworkFilesInMetadata}`);
        console.log(`- 版本一致性: ${stats.versionConsistency ? '✅' : '❌'}`);

        // 输出详细报告
        console.log('\n📋 详细检查报告:');
        console.log(frameworkFileChecker.generateFrameworkFileReport(frameworkFileResult));
        console.log(versionChecker.generateVersionReport(versionResult));

        // 验证通过标志
        const isValid = issues.length === 0;
        console.log(`\n${isValid ? '✅' : '❌'} 受控冗余机制验证${isValid ? '通过' : '失败'}`);
        
        return isValid;

    } catch (error) {
        console.error('❌ 受控冗余机制验证失败:', error.message);
        return false;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    validateControlledRedundancy();
}

module.exports = { validateControlledRedundancy }; 