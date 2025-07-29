// =================================================================
// “陆家花园”诗歌文件自动生成脚本
// 作者: 陆家明
// 版本: 2.0
//
// 功能:
//   - 读取我们 v2.0 版本的 database.json 文件。
//   - 自动在当前目录下创建一个 "poems" 文件夹。
//   - 根据 database.json 的结构，在 "poems" 内创建对应的子文件夹 (观我生, 雨，木冰, 是折枝)。
//   - 将每个子项目中的所有诗歌，逐一生成为独立的 .txt 文件，并放入相应的子文件夹中。
//   - 文件名会自动去除书名号《》，以匹配新系统的读取规则。
//
// 使用方法:
//   1. 将此文件另存为 "generate_poem_files.js"。
//   2. 确保 "database.json" (我们 v2.0 版本的存档) 与此脚本放置在同一个文件夹下。
//   3. 在你的命令行工具中，进入这个文件夹，然后运行命令: node generate_poem_files.js
//   4. 脚本会自动完成所有文件的生成工作。
// =================================================================

import fs from 'fs/promises';
import path from 'path';

// --- 配置区 ---
const DATABASE_PATH = './database.json'; // 我们的数据源文件
const OUTPUT_DIR = './poems';             // 目标输出文件夹

async function generatePoemFiles() {
  console.log('>>> 开始生成诗歌文件...');

  try {
    // 1. 读取并解析我们的核心数据库文件
    console.log(`[1/4] 正在读取数据源: ${DATABASE_PATH}`);
    const dbContent = await fs.readFile(DATABASE_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // 2. 清理并重建目标输出文件夹
    console.log(`[2/4] 正在准备输出目录: ${OUTPUT_DIR}`);
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    let fileCount = 0;

    // 3. 遍历所有项目和子项目
    for (const mainProject of db.projects) {
      if (mainProject.subProjects && mainProject.subProjects.length > 0) {
        for (const subProject of mainProject.subProjects) {
          const subProjectDir = path.join(OUTPUT_DIR, subProject.name);
          console.log(`[3/4] 正在创建篇章文件夹: ${subProjectDir}`);
          await fs.mkdir(subProjectDir, { recursive: true });

          // 4. 遍历诗歌并生成 .txt 文件
          if (subProject.poems && subProject.poems.length > 0) {
            for (const poem of subProject.poems) {
              // 文件名去除书名号《》，以匹配新系统的读取规则
              const fileName = `${poem.title.replace(/[《》]/g, '')}.txt`;
              const filePath = path.join(subProjectDir, fileName);
              
              await fs.writeFile(filePath, poem.body, 'utf-8');
              console.log(`      - 已生成: ${fileName}`);
              fileCount++;
            }
          }
        }
      }
    }

    console.log(`\n[4/4] ✨ 任务完成！`);
    console.log(`>>> 成功生成了 ${fileCount} 个诗歌文件。`);

  } catch (error) {
    console.error('\n❌ 操作过程中发生错误:');
    console.error(error);
    process.exit(1); // 出现错误时退出
  }
}

// 执行主函数
generatePoemFiles();
