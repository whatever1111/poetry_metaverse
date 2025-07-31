const fs = require('fs/promises');
const path = require('path');

/**
 * 此脚本用于将 '毛小豆宇宙/data' 文件夹下拆分的多个JSON文件合并回单一的结构化知识库文件。
 * 它将拆分后的文件作为唯一真实数据源，自动生成聚合文件，以确保数据的一致性。
 * 
 * 使用方法:
 * 在终端中，首先 cd 到 '毛小豆宇宙' 文件夹, 然后运行 `node merge_files.js`
 */

// 定义源数据目录和目标文件路径
// 脚本位于 '毛小豆宇宙' 根目录, 数据文件位于其下的 'data' 文件夹
const dataDir = path.join(__dirname, 'data');
const sourceFilePaths = {
    metadata: path.join(dataDir, 'metadata.json'),
    characters: path.join(dataDir, 'characters.json'),
    poems: path.join(dataDir, 'poems.json'),
    themesAndMore: path.join(dataDir, 'themes.json'), // 此文件包含 themes, terminology, symbols, 和 timeline
    mappings: path.join(dataDir, 'mappings.json')
};
const outputFile = path.join(dataDir, '毛小豆宇宙_结构化知识库_v2.0.json');

async function mergeJsonFiles() {
    try {
        console.log("🚀 开始合并JSON文件...");
        console.log(`读取源目录: ${dataDir}`);

        // 1. 并行读取所有拆分后的JSON文件内容
        const [
            metadataContent,
            charactersContent,
            poemsContent,
            themesAndMoreContent,
            mappingsContent
        ] = await Promise.all([
            fs.readFile(sourceFilePaths.metadata, 'utf-8'),
            fs.readFile(sourceFilePaths.characters, 'utf-8'),
            fs.readFile(sourceFilePaths.poems, 'utf-8'),
            fs.readFile(sourceFilePaths.themesAndMore, 'utf-8'),
            fs.readFile(sourceFilePaths.mappings, 'utf-8')
        ]);

        console.log('✅ 所有源文件读取成功。');

        // 2. 解析JSON内容
        const metadata = JSON.parse(metadataContent);
        const characters = JSON.parse(charactersContent);
        const poems = JSON.parse(poemsContent);
        const themesAndMore = JSON.parse(themesAndMoreContent);
        const mappings = JSON.parse(mappingsContent);


        // 3. 构建最终的聚合对象结构
        const mergedData = {
            metadata: metadata,
            characters: characters,
            poems: poems,
            themes: themesAndMore.themes,
            terminology: themesAndMore.terminology,
            symbols: themesAndMore.symbols,
            timeline: themesAndMore.timeline,
            mappings: mappings
        };

        console.log('🧩 数据结构合并完成。');

        // 4. 将聚合对象格式化并写入目标文件
        await fs.writeFile(outputFile, JSON.stringify(mergedData, null, 2), 'utf-8');

        console.log(`\n🎉 合并成功！`);
        console.log(`聚合文件已生成/更新: ${path.relative(__dirname, outputFile)}`);

    } catch (error) {
        console.error('❌ 合并过程中发生错误:', error);
        process.exit(1); // 以错误码退出进程
    }
}

// 执行合并功能
mergeJsonFiles();
