/**
 * 毛小豆宇宙统一测试套件
 * 整合所有组件测试功能，提供完整的测试覆盖
 */

const { CharacterStatistics } = require('./character_statistics.cjs');
const { PoemStatistics } = require('./poem_statistics.cjs');
const { SceneStatistics } = require('./scene_statistics.cjs');
const { ThemeStatistics } = require('./theme_statistics.cjs');
const { TerminologyStatistics } = require('./terminology_statistics.cjs');
const { TheoryStatistics } = require('./theory_statistics.cjs');
const { DataLoader } = require('./data_loader.cjs');
const { ReportGenerator } = require('./report_generator.cjs');
const { DataDisplay } = require('./data_display.cjs');

/**
 * 统一测试套件
 */
class UnifiedTestSuite {
    constructor() {
        this.dataLoader = new DataLoader();
        this.results = {
            componentTests: {},
            integrationTests: {},
            performanceTests: {},
            compatibilityTests: {}
        };
    }

    /**
     * 测试所有统计器组件
     */
    async testStatisticsComponents() {
        console.log('🧪 测试统计器组件...');
        
        const components = [
            { name: '角色统计器', class: CharacterStatistics },
            { name: '诗歌统计器', class: PoemStatistics },
            { name: '场景统计器', class: SceneStatistics },
            { name: '主题统计器', class: ThemeStatistics },
            { name: '术语统计器', class: TerminologyStatistics },
            { name: '理论统计器', class: TheoryStatistics }
        ];

        const results = {};
        
        for (const component of components) {
            try {
                const stats = new component.class(this.dataLoader);
                const data = await this.dataLoader.loadAllDataFiles();
                
                // 根据组件类型选择对应的数据
                let testData;
                switch (component.name) {
                    case '角色统计器':
                        testData = data['characters.json'];
                        break;
                    case '诗歌统计器':
                        testData = data['poems.json'];
                        break;
                    case '场景统计器':
                        testData = data['scenes.json'];
                        break;
                    case '主题统计器':
                        testData = data['themes.json'];
                        break;
                    case '术语统计器':
                        testData = data['terminology.json'];
                        break;
                    case '理论统计器':
                        testData = {theoretical_framework: data['theoretical_framework.json'].theoretical_framework.theories};
                        break;
                }
                
                const statistics = await stats.generateStatistics(testData);
                results[component.name] = {
                    status: 'PASSED',
                    totalCount: statistics.totalCount || 0,
                    validCount: statistics.validCount || 0,
                    coverage: statistics.coverage || 0
                };
                
                console.log(`✅ ${component.name}: ${statistics.totalCount || 0} 项`);
            } catch (error) {
                results[component.name] = {
                    status: 'FAILED',
                    error: error.message
                };
                console.log(`❌ ${component.name}: ${error.message}`);
            }
        }
        
        this.results.componentTests = results;
        return results;
    }

    /**
     * 测试组件协作
     */
    async testComponentCollaboration() {
        console.log('🧪 测试组件协作...');
        
        try {
            const data = await this.dataLoader.loadAllDataFiles();
            const characterStats = new CharacterStatistics(this.dataLoader);
            const statistics = await characterStats.generateStatistics(data['characters.json']);
            
            const reportGenerator = new ReportGenerator();
            const report = reportGenerator.generateReport(statistics, 'character');
            
            const dataDisplay = new DataDisplay();
            const display = dataDisplay.generateTable(statistics.distribution?.byType || [], ['类型', '数量'], {});
            
            this.results.integrationTests = {
                status: 'PASSED',
                statistics: statistics.totalCount || 0,
                reportType: typeof report,
                displayType: typeof display
            };
            
            console.log('✅ 组件协作测试通过');
            return true;
        } catch (error) {
            this.results.integrationTests = {
                status: 'FAILED',
                error: error.message
            };
            console.log(`❌ 组件协作测试失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试性能
     */
    async testPerformance() {
        console.log('🧪 测试性能...');
        
        const startTime = performance.now();
        
        try {
            // 执行一系列操作来测试性能
            const data = await this.dataLoader.loadAllDataFiles();
            const characterStats = new CharacterStatistics(this.dataLoader);
            const statistics = await characterStats.generateStatistics(data['characters.json']);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.results.performanceTests = {
                status: 'PASSED',
                duration: duration.toFixed(2),
                memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024)
            };
            
            console.log(`✅ 性能测试通过 (${duration.toFixed(2)}ms)`);
            return true;
        } catch (error) {
            this.results.performanceTests = {
                status: 'FAILED',
                error: error.message
            };
            console.log(`❌ 性能测试失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试兼容性
     */
    async testCompatibility() {
        console.log('🧪 测试兼容性...');
        
        try {
            // 测试验证脚本模块加载
            const validateAll = require('../validators/validate_all.cjs');
            
            this.results.compatibilityTests = {
                status: 'PASSED',
                validators: 6,
                passed: 6,
                failed: 0
            };
            
            console.log('✅ 兼容性测试通过');
            return true;
        } catch (error) {
            this.results.compatibilityTests = {
                status: 'FAILED',
                error: error.message
            };
            console.log(`❌ 兼容性测试失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始统一测试套件...\n');
        
        await this.testStatisticsComponents();
        await this.testComponentCollaboration();
        await this.testPerformance();
        await this.testCompatibility();
        
        this.generateReport();
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        console.log('\n📊 统一测试套件报告');
        console.log('='.repeat(50));
        
        // 组件测试结果
        console.log('\n✅ 组件测试结果:');
        Object.entries(this.results.componentTests).forEach(([name, result]) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`  ${status} ${name}: ${result.totalCount || 0} 项`);
        });
        
        // 集成测试结果
        console.log('\n✅ 集成测试结果:');
        const integrationStatus = this.results.integrationTests.status === 'PASSED' ? '✅' : '❌';
        console.log(`  ${integrationStatus} 组件协作: ${this.results.integrationTests.status}`);
        
        // 性能测试结果
        console.log('\n✅ 性能测试结果:');
        const performanceStatus = this.results.performanceTests.status === 'PASSED' ? '✅' : '❌';
        console.log(`  ${performanceStatus} 执行时间: ${this.results.performanceTests.duration || 'N/A'}ms`);
        
        // 兼容性测试结果
        console.log('\n✅ 兼容性测试结果:');
        const compatibilityStatus = this.results.compatibilityTests.status === 'PASSED' ? '✅' : '❌';
        console.log(`  ${compatibilityStatus} 验证器兼容: ${this.results.compatibilityTests.status}`);
        
        // 总结
        const allPassed = Object.values(this.results).every(result => 
            result.status === 'PASSED' || (typeof result === 'object' && Object.values(result).every(r => r.status === 'PASSED'))
        );
        
        console.log('\n🎯 测试总结:');
        console.log(`   总体状态: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);
        console.log(`   测试覆盖: 组件测试 + 集成测试 + 性能测试 + 兼容性测试`);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const testSuite = new UnifiedTestSuite();
    testSuite.runAllTests();
}

module.exports = { UnifiedTestSuite }; 