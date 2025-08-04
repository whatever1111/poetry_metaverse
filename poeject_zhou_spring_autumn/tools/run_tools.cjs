#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const tools = {
    'validate': {
        script: 'validate_data_consistency.cjs',
        description: '数据一致性检查',
        usage: 'node tools/run_tools.cjs validate'
    },
    'generate-poems': {
        script: 'generate_poem_files.js',
        description: '生成诗歌文件',
        usage: 'node tools/run_tools.cjs generate-poems'
    },
    'tree': {
        script: 'generate_tree.bat',
        description: '生成目录树',
        usage: 'node tools/run_tools.cjs tree'
    }
};

function showHelp() {
    console.log('🔧 项目工具集\n');
    console.log('使用方法: node tools/run_tools.cjs <工具名>\n');
    console.log('可用工具:');
    
    Object.entries(tools).forEach(([name, tool]) => {
        console.log(`  ${name.padEnd(15)} - ${tool.description}`);
        console.log(`    ${tool.usage}`);
        console.log('');
    });
    
    console.log('示例:');
    console.log('  node tools/run_tools.cjs validate    # 运行数据一致性检查');
    console.log('  node tools/run_tools.cjs help        # 显示此帮助信息');
}

function runTool(toolName) {
    const tool = tools[toolName];
    
    if (!tool) {
        console.error(`❌ 未知工具: ${toolName}`);
        console.log('使用 "node tools/run_tools.cjs help" 查看可用工具');
        process.exit(1);
    }
    
    const scriptPath = path.join(__dirname, tool.script);
    console.log(`🚀 运行工具: ${tool.description}`);
    console.log(`📁 脚本路径: ${scriptPath}\n`);
    
    const child = spawn('node', [scriptPath], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });
    
    child.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ 工具执行完成');
        } else {
            console.log(`\n❌ 工具执行失败，退出码: ${code}`);
            process.exit(code);
        }
    });
    
    child.on('error', (error) => {
        console.error(`❌ 启动工具失败: ${error.message}`);
        process.exit(1);
    });
}

// 主程序
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
} else {
    runTool(command);
} 