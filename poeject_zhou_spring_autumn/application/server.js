import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import session from 'express-session';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// -- 目录与路径配置 --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_DIR = path.join(__dirname, '..', 'data', 'content');
const POEMS_DIR = path.join(__dirname, '..', 'data', 'poems');
const DATA_DRAFT_DIR = path.join(__dirname, '..', 'data', 'content_draft');
const POEMS_DRAFT_DIR = path.join(__dirname, '..', 'data', 'poems_draft');

const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.json');
const MAPPINGS_PATH = path.join(DATA_DIR, 'mappings.json');

const PROJECTS_DRAFT_PATH = path.join(DATA_DRAFT_DIR, 'projects.json');
const QUESTIONS_DRAFT_PATH = path.join(DATA_DRAFT_DIR, 'questions.json');
const MAPPINGS_DRAFT_PATH = path.join(DATA_DRAFT_DIR, 'mappings.json');

// -- 初始化函数 --
async function initializeDraftDirectories() {
    try {
        await fs.access(DATA_DRAFT_DIR);
    } catch (error) {
        console.log('正在初始化 "data_draft" 目录...');
        await fs.cp(DATA_DIR, DATA_DRAFT_DIR, { recursive: true });
        console.log('"data_draft" 目录初始化完成。');
    }

    try {
        await fs.access(POEMS_DRAFT_DIR);
    } catch (error) {
        console.log('正在初始化 "poems_draft" 目录...');
        await fs.cp(POEMS_DIR, POEMS_DRAFT_DIR, { recursive: true });
        console.log('"poems_draft" 目录初始化完成。');
    }
}

// -- 中间件 --
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Session 配置
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-secret-key-that-should-be-in-env',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: 'auto', // [修复] 自动判断 https/http
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24小时
    }
}));

// [新增] 日志中间件，用于调试Session
app.use((req, res, next) => {
    console.log('--- New Request ---');
    console.log(`Path: ${req.path}`);
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    console.log('-------------------');
    next();
});

// -- 认证中间件 --
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        // 对于API请求，返回401 JSON
        if (req.path.startsWith('/api/admin')) {
             return res.status(401).json({ error: '需要认证' });
        }
        // 对于页面请求，可以重定向到登录页
        res.redirect('/login.html');
    }
};


// ============ 认证 API ============
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        // 显式保存 session，确保在重定向前会话已写入存储
        req.session.save(err => {
            if (err) {
                return res.status(500).json({ success: false, message: '会话保存失败' });
            }
            res.json({ success: true, message: '登录成功' });
        });
    } else {
        res.status(401).json({ success: false, message: '密码错误' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: '注销失败' });
        }
        res.clearCookie('connect.sid'); // cookie名称可能需要根据实际情况修改
        res.json({ success: true, message: '注销成功' });
    });
});


// ============ 公开数据 API (基本保持不变) ============

// 获取花园的完整层级结构
app.get('/api/projects', async (req, res) => {
    try {
        const projectsData = await fs.readFile(PROJECTS_PATH, 'utf-8');
        const projectsJson = JSON.parse(projectsData);
        // [修复] 必须返回 projects 键下的数组，以匹配前端期望
        res.json(projectsJson.projects || []);
    } catch (error) {
        // 如果文件不存在（例如还未发布过），返回空数组是安全的
        if (error.code === 'ENOENT') {
            return res.json([]);
        }
        res.status(500).json({ error: '无法加载项目结构' });
    }
});

// 获取所有问题
app.get('/api/questions', async (req, res) => {
    try {
        const questionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8');
        res.json(JSON.parse(questionsData));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read questions' });
    }
});

// 获取所有映射关系
app.get('/api/mappings', async (req, res) => {
    try {
        const mappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8');
        res.json(JSON.parse(mappingsData));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read mappings' });
    }
});

// 获取所有诗歌
app.get('/api/poems-all', async (req, res) => {
    try {
        const poemFiles = await getAllPoemFiles(POEMS_DIR);
        const poems = {};
        for (const filePath of poemFiles) {
            const content = await fs.readFile(filePath, 'utf8');
            const fileName = path.basename(filePath, '.txt').replace(/[《》]/g, '');
            poems[fileName] = content;
        }
        res.json(poems);
    } catch (error) {
        console.error("Error in /api/poems-all:", error);
        res.status(500).json({ error: 'Failed to read poems' });
    }
});

// Gemini 解诗 API 代理
app.post('/api/interpret', async (req, res) => {
    try {
        const { prompt } = req.body;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Gemini API call failed: ${response.statusText}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: '解读失败', error: error.message });
    }
});

// Gemini 读诗 API 代理
app.post('/api/listen', async (req, res) => {
    try {
        const { text } = req.body;
        const payload = {
            input: { text },
            voice: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-B' },
            audioConfig: { audioEncoding: 'MP3' }
        };
        const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!ttsResponse.ok) throw new Error(`Google TTS API call failed: ${ttsResponse.statusText}`);
        const data = await ttsResponse.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: '朗读失败', error: error.message });
    }
});

// ============ 管理页面路由 ============
// 当访问 /admin 时，先检查认证，如果通过，则发送 admin.html
app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// ============ 管理 API (/api/admin) ============
const adminRouter = express.Router();
adminRouter.use(requireAuth); // 整个 adminRouter 都需要认证

// --- 主项目管理 (草稿) ---
adminRouter.get('/projects', async (req, res) => {
    try {
        const projectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        const projectsJson = JSON.parse(projectsData);
        // [修复] 确保返回的是 projects 键下的数组
        res.json(projectsJson.projects || []);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            res.status(500).json({ message: '读取草稿项目失败', error: error.message });
        }
    }
});

adminRouter.post('/projects', async (req, res) => {
    const { name, description, poet } = req.body;
    if (!name) {
        return res.status(400).json({ message: '项目名称不能为空' });
    }
    try {
        let projectsJson = { projects: [] };
        try {
            const projectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
            projectsJson = JSON.parse(projectsData);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        const newProject = {
            id: uuidv4(),
            name,
            description,
            poet,
            status: 'draft', // [新增] 默认状态为草稿
            subProjects: []
        };
        projectsJson.projects.push(newProject);
        await fs.writeFile(PROJECTS_DRAFT_PATH, JSON.stringify(projectsJson, null, 4));
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: '创建草稿项目失败', error: error.message });
    }
});

adminRouter.put('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const { name, description, poet } = req.body;
    if (!name) {
        return res.status(400).json({ message: '项目名称不能为空' });
    }
    try {
        const projectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        let projectsJson = JSON.parse(projectsData);
        const projectIndex = projectsJson.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            return res.status(404).json({ message: '未找到项目' });
        }
        projectsJson.projects[projectIndex] = { ...projectsJson.projects[projectIndex], name, description, poet };
        await fs.writeFile(PROJECTS_DRAFT_PATH, JSON.stringify(projectsJson, null, 4));
        res.json(projectsJson.projects[projectIndex]);
    } catch (error) {
        res.status(500).json({ message: '更新草稿项目失败', error: error.message });
    }
});

// [重构] 切换项目上架/下架状态 (现在包含文件操作)
adminRouter.put('/projects/:projectId/status', async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!status || !['draft', 'published'].includes(status)) {
        return res.status(400).json({ message: '无效的状态值' });
    }

    try {
        // --- 1. 更新草稿区状态 ---
        const draftProjectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        let draftProjectsJson = JSON.parse(draftProjectsData);
        const projectIndex = draftProjectsJson.projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) {
            return res.status(404).json({ message: '未找到项目' });
        }
        
        const projectToChange = { ...draftProjectsJson.projects[projectIndex], status: status };
        draftProjectsJson.projects[projectIndex] = projectToChange;
        
        // --- 2. 同步修改线上文件 ---
        const liveProjectsData = await fs.readFile(PROJECTS_PATH, 'utf-8').catch(() => '{"projects":[]}');
        let liveProjectsJson = JSON.parse(liveProjectsData);
        
        const liveQuestionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8').catch(() => '{}');
        let liveQuestions = JSON.parse(liveQuestionsData);

        const liveMappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8').catch(() => '{}');
        let liveMappings = JSON.parse(liveMappingsData);

        const draftQuestionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        const draftQuestions = JSON.parse(draftQuestionsData);

        const draftMappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        const draftMappingsJson = JSON.parse(draftMappingsData);
        const draftMappings = draftMappingsJson.units || {}; // [修复] 从 units 字段获取

        if (status === 'published') { // 上架操作
            // 确保线上项目列表中没有这个项目，然后添加
            const liveProjectIndex = liveProjectsJson.projects.findIndex(p => p.id === projectId);
            if (liveProjectIndex !== -1) {
                liveProjectsJson.projects[liveProjectIndex] = projectToChange; // 如果已存在（例如通过“更新”），则覆盖
            } else {
                liveProjectsJson.projects.push(projectToChange); // 否则，添加
            }
            
            // [修复] 同步所有子项目的 questions, mappings 和 poems
            for (const sub of projectToChange.subProjects) {
                // 如果草稿中有该子项目的数据，就同步到线上
                if (draftQuestions.hasOwnProperty(sub.name)) {
                    liveQuestions[sub.name] = draftQuestions[sub.name];
                }
                if (draftMappings.hasOwnProperty(sub.name)) {
                    if (!liveMappings.units) liveMappings.units = {}; // 确保线上存在 units 对象
                    liveMappings.units[sub.name] = draftMappings[sub.name];
                }

                // 复制诗歌文件夹
                const draftPoemPath = path.join(POEMS_DRAFT_DIR, sub.name);
                const livePoemPath = path.join(POEMS_DIR, sub.name);
                try {
                    // 使用 cp 命令，它可以处理源不存在的情况
                    await fs.cp(draftPoemPath, livePoemPath, { recursive: true, force: true });
                } catch (cpError) {
                    if (cpError.code !== 'ENOENT') { // 仅忽略“源文件不存在”的错误
                        console.error(`复制诗歌目录失败: 从 ${draftPoemPath} 到 ${livePoemPath}`, cpError);
                    }
                }
            }
        } else { // 下架操作
            liveProjectsJson.projects = liveProjectsJson.projects.filter(p => p.id !== projectId);
            for (const sub of projectToChange.subProjects) {
                delete liveQuestions[sub.name];
                if (liveMappings.units) { // [修复] 从 units 字段删除
                    delete liveMappings.units[sub.name];
                }
                const livePoemPath = path.join(POEMS_DIR, sub.name);
                await fs.rm(livePoemPath, { recursive: true, force: true });
            }
        }

        // --- 3. 写回所有文件 ---
        await fs.writeFile(PROJECTS_DRAFT_PATH, JSON.stringify(draftProjectsJson, null, 4));
        await fs.writeFile(PROJECTS_PATH, JSON.stringify(liveProjectsJson, null, 4));
        await fs.writeFile(QUESTIONS_PATH, JSON.stringify(liveQuestions, null, 4));
        await fs.writeFile(MAPPINGS_PATH, JSON.stringify(liveMappings, null, 4));

        res.json(projectToChange);
    } catch (error) {
        console.error("更新状态失败:", error);
        res.status(500).json({ message: '更新项目状态失败', error: error.message });
    }
});

// [新增] 独立更新单个已上架项目
adminRouter.post('/projects/:projectId/update', async (req, res) => {
    const { projectId } = req.params;
    try {
        // "更新"逻辑本质上与"上架"相同：用草稿区的版本覆盖线上的版本
        // 为了代码复用，我们可以直接调用 status 接口的逻辑，但这会耦合，所以重新实现更清晰

        const draftProjectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        const draftProjectsJson = JSON.parse(draftProjectsData);
        const projectToUpdate = draftProjectsJson.projects.find(p => p.id === projectId);

        if (!projectToUpdate || projectToUpdate.status !== 'published') {
            return res.status(400).json({ message: '项目不是已上架状态，无法独立更新' });
        }
        
        // 读取所有相关文件
        const liveProjectsData = await fs.readFile(PROJECTS_PATH, 'utf-8').catch(() => '{"projects":[]}');
        let liveProjectsJson = JSON.parse(liveProjectsData);
        const liveQuestionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8').catch(() => '{}');
        let liveQuestions = JSON.parse(liveQuestionsData);
        const liveMappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8').catch(() => '{}');
        let liveMappings = JSON.parse(liveMappingsData);
        const draftQuestionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        const draftQuestions = JSON.parse(draftQuestionsData);
        const draftMappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        const draftMappingsJson = JSON.parse(draftMappingsData);
        const draftMappings = draftMappingsJson.units || {}; // [修复]

        // 更新线上项目信息
        const liveProjectIndex = liveProjectsJson.projects.findIndex(p => p.id === projectId);
        if (liveProjectIndex !== -1) {
            liveProjectsJson.projects[liveProjectIndex] = projectToUpdate;
        } else {
            liveProjectsJson.projects.push(projectToUpdate); // 如果线上因某种原因没有，则添加
        }

        // 更新问题、映射、诗歌
        for (const sub of projectToUpdate.subProjects) {
            liveQuestions[sub.name] = draftQuestions[sub.name] || [];
            if (draftMappings.hasOwnProperty(sub.name)) { // [修复]
                if (!liveMappings.units) liveMappings.units = {};
                liveMappings.units[sub.name] = draftMappings[sub.name];
            }
            const draftPoemPath = path.join(POEMS_DRAFT_DIR, sub.name);
            const livePoemPath = path.join(POEMS_DIR, sub.name);
            await fs.rm(livePoemPath, { recursive: true, force: true }); // 先删除旧的
            await fs.cp(draftPoemPath, livePoemPath, { recursive: true, force: true }); // 再复制新的
        }

        await fs.writeFile(PROJECTS_PATH, JSON.stringify(liveProjectsJson, null, 4));
        await fs.writeFile(QUESTIONS_PATH, JSON.stringify(liveQuestions, null, 4));
        await fs.writeFile(MAPPINGS_PATH, JSON.stringify(liveMappings, null, 4));

        res.json({ message: `项目 "${projectToUpdate.name}" 已成功更新到线上` });
    } catch (error) {
        console.error("独立更新项目失败:", error);
        res.status(500).json({ message: '独立更新项目失败', error: error.message });
    }
});


adminRouter.delete('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    try {
        const projectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        let projectsJson = JSON.parse(projectsData);
        
        const projectToDelete = projectsJson.projects.find(p => p.id === projectId);
        if (!projectToDelete) {
            // 如果草稿中没有，直接返回成功，避免前端错误
            return res.status(204).send();
        }

        // [重构] 如果项目已上架，先执行下架逻辑从线上移除
        if (projectToDelete.status === 'published') {
            const liveProjectsData = await fs.readFile(PROJECTS_PATH, 'utf-8').catch(() => '{"projects":[]}');
            let liveProjectsJson = JSON.parse(liveProjectsData);
            const liveQuestionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8').catch(() => '{}');
            let liveQuestions = JSON.parse(liveQuestionsData);
            const liveMappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8').catch(() => '{}');
            let liveMappings = JSON.parse(liveMappingsData);
            
            liveProjectsJson.projects = liveProjectsJson.projects.filter(p => p.id !== projectId);
            for (const sub of projectToDelete.subProjects) {
                delete liveQuestions[sub.name];
                if (liveMappings.units) { // [修复]
                    delete liveMappings.units[sub.name];
                }
                const livePoemPath = path.join(POEMS_DIR, sub.name);
                await fs.rm(livePoemPath, { recursive: true, force: true });
            }
            await fs.writeFile(PROJECTS_PATH, JSON.stringify(liveProjectsJson, null, 4));
            await fs.writeFile(QUESTIONS_PATH, JSON.stringify(liveQuestions, null, 4));
            await fs.writeFile(MAPPINGS_PATH, JSON.stringify(liveMappings, null, 4));
        }
        
        // 从草稿区删除
        projectsJson.projects = projectsJson.projects.filter(p => p.id !== projectId);
        await fs.writeFile(PROJECTS_DRAFT_PATH, JSON.stringify(projectsJson, null, 4));
        
        // 级联删除草稿区相关文件 (问题和映射保留在主文件里，诗歌文件夹需要删除)
        const questionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        let questions = JSON.parse(questionsData);
        const mappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        let mappings = JSON.parse(mappingsData);

        for (const subProject of projectToDelete.subProjects) {
            // 注意：我们不从草稿的 questions/mappings JSON中删除条目，因为可能只是项目本身被删除，内容想保留
            // 但诗歌文件夹这种强关联的可以删除
            const subProjectPoemsDir = path.join(POEMS_DRAFT_DIR, subProject.name);
            try {
                await fs.rm(subProjectPoemsDir, { recursive: true, force: true });
            } catch (dirError) {
                console.error(`删除草稿诗歌目录失败: ${subProjectPoemsDir}`, dirError);
            }
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '删除草稿项目失败', error: error.message });
    }
});


// --- 子项目管理 (草稿) ---
adminRouter.post('/projects/:projectId/sub', async (req, res) => {
    const { projectId } = req.params;
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: '子项目名称不能为空' });
    }
    try {
        const projectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        let projectsJson = JSON.parse(projectsData);
        const projectIndex = projectsJson.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            return res.status(404).json({ message: '未找到主项目' });
        }

        const newSubProject = { name, description };
        projectsJson.projects[projectIndex].subProjects.push(newSubProject);
        
        // 创建对应的草稿文件夹和默认条目
        const subProjectPoemsDir = path.join(POEMS_DRAFT_DIR, name);
        await fs.mkdir(subProjectPoemsDir, { recursive: true });

        const questionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        let questions = JSON.parse(questionsData);
        questions[name] = []; // 默认空问题列表
        
        const mappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        let mappings = JSON.parse(mappingsData);
        mappings[name] = {}; // 默认空映射

        await fs.writeFile(PROJECTS_DRAFT_PATH, JSON.stringify(projectsJson, null, 4));
        await fs.writeFile(QUESTIONS_DRAFT_PATH, JSON.stringify(questions, null, 4));
        await fs.writeFile(MAPPINGS_DRAFT_PATH, JSON.stringify(mappings, null, 4));
        
        res.status(201).json(newSubProject);
    } catch (error) {
        res.status(500).json({ message: '创建草稿子项目失败', error: error.message });
    }
});


adminRouter.get('/projects/:projectId/sub/:subProjectName', async (req, res) => {
    const { subProjectName } = req.params;
    try {
        // 从草稿文件读取
        const questionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        const questions = JSON.parse(questionsData)[subProjectName] || [];

        const mappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        const resultMap = JSON.parse(mappingsData)[subProjectName] || {};
        
        // 从草稿目录读取诗歌
        const subProjectPoemsDir = path.join(POEMS_DRAFT_DIR, subProjectName);
        let poems = [];
        try {
            const files = await fs.readdir(subProjectPoemsDir);
            for (const file of files) {
                if (path.extname(file) === '.txt') {
                    const filePath = path.join(subProjectPoemsDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    poems.push({
                        id: path.basename(file, '.txt'),
                        title: path.basename(file, '.txt'), 
                        body: content
                    });
                }
            }
        } catch (dirError) {
            if (dirError.code !== 'ENOENT') throw dirError;
        }

        res.json({
            name: subProjectName,
            questions,
            resultMap,
            poems
        });
    } catch (error) {
        res.status(500).json({ message: '获取草稿子项目数据失败', error: error.message });
    }
});

adminRouter.put('/projects/:projectId/sub/:subProjectName/questions', async (req, res) => {
    const { subProjectName } = req.params;
    const { questions: newQuestions } = req.body;
    try {
        const questionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        let allQuestions = JSON.parse(questionsData);
        allQuestions[subProjectName] = newQuestions;
        await fs.writeFile(QUESTIONS_DRAFT_PATH, JSON.stringify(allQuestions, null, 4));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '更新草稿问题失败', error: error.message });
    }
});

adminRouter.put('/projects/:projectId/sub/:subProjectName/resultMap', async (req, res) => {
    const { subProjectName } = req.params;
    const { resultMap: newResultMap } = req.body;
    try {
        const mappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        let allMappings = JSON.parse(mappingsData);
        allMappings[subProjectName] = newResultMap;
        await fs.writeFile(MAPPINGS_DRAFT_PATH, JSON.stringify(allMappings, null, 4));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '更新草稿映射失败', error: error.message });
    }
});

// --- 诗歌管理 (草稿) ---
adminRouter.post('/projects/:projectId/sub/:subProjectName/poems', async (req, res) => {
    const { subProjectName } = req.params;
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ message: '诗歌标题和内容不能为空' });
    }
    try {
        const poemPath = path.join(POEMS_DRAFT_DIR, subProjectName, `${title}.txt`);
        await fs.writeFile(poemPath, body, 'utf-8');
        res.status(201).json({ id: title, title, body });
    } catch (error) {
        res.status(500).json({ message: '创建草稿诗歌文件失败', error: error.message });
    }
});

adminRouter.put('/projects/:projectId/sub/:subProjectName/poems/:poemId', async (req, res) => {
    const { subProjectName, poemId } = req.params;
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ message: '诗歌标题和内容不能为空' });
    }
    try {
        const oldPoemPath = path.join(POEMS_DRAFT_DIR, subProjectName, `${poemId}.txt`);
        const newPoemPath = path.join(POEMS_DRAFT_DIR, subProjectName, `${title}.txt`);

        if (poemId !== title) {
            await fs.rename(oldPoemPath, newPoemPath);
        }
        await fs.writeFile(newPoemPath, body, 'utf-8');
        
        res.json({ id: title, title, body });
    } catch (error) {
        res.status(500).json({ message: '更新草稿诗歌文件失败', error: error.message });
    }
});

adminRouter.delete('/projects/:projectId/sub/:subProjectName/poems/:poemId', async (req, res) => {
    const { subProjectName, poemId } = req.params;
    try {
        const poemPath = path.join(POEMS_DRAFT_DIR, subProjectName, `${poemId}.txt`);
        await fs.unlink(poemPath);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: '未找到要删除的诗歌文件' });
        }
        res.status(500).json({ message: '删除草稿诗歌文件失败', error: error.message });
    }
});

// --- 发布功能 ---
adminRouter.post('/publish-all', async (req, res) => {
    console.log('接收到精细化发布请求...');
    try {
        // 1. 读取草稿区的项目、问题、映射数据
        const projectsDraftData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
        const allProjectsJson = JSON.parse(projectsDraftData);

        const questionsDraftData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
        const allQuestions = JSON.parse(questionsDraftData);

        const mappingsDraftData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
        const allMappingsJson = JSON.parse(mappingsDraftData);
        const allMappings = allMappingsJson.units || {}; // [修复]

        // 2. 筛选出所有“已上架”的项目
        const publishedProjects = allProjectsJson.projects.filter(p => p.status === 'published');
        console.log(`找到 ${publishedProjects.length} 个已上架项目待发布。`);

        // 3. 构建新的线上数据
        const liveProjectsJson = { projects: publishedProjects };
        const liveQuestions = {};
        const liveMappings = { units: {} }; // [修复] 初始化为带 units 的结构
        const livePoemFolders = [];

        for (const project of publishedProjects) {
            for (const subProject of project.subProjects) {
                const subProjectName = subProject.name;
                if (allQuestions[subProjectName]) {
                    liveQuestions[subProjectName] = allQuestions[subProjectName];
                }
                if (allMappings[subProjectName]) {
                    liveMappings.units[subProjectName] = allMappings[subProjectName]; // [修复]
                }
                livePoemFolders.push(subProjectName);
            }
        }

        // 4. 清理旧的线上目录
        console.log('正在清理线上目录: data, poems');
        await fs.rm(DATA_DIR, { recursive: true, force: true });
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.rm(POEMS_DIR, { recursive: true, force: true });
        await fs.mkdir(POEMS_DIR, { recursive: true });
        console.log('线上目录已清理。');

        // 5. 写入新的线上数据
        console.log('正在写入新的线上数据...');
        await fs.writeFile(PROJECTS_PATH, JSON.stringify(liveProjectsJson, null, 4));
        await fs.writeFile(QUESTIONS_PATH, JSON.stringify(liveQuestions, null, 4));
        await fs.writeFile(MAPPINGS_PATH, JSON.stringify(liveMappings, null, 4));

        for (const folderName of livePoemFolders) {
            const draftPath = path.join(POEMS_DRAFT_DIR, folderName);
            const livePath = path.join(POEMS_DIR, folderName);
            try {
                await fs.cp(draftPath, livePath, { recursive: true });
            } catch (cpError) {
                // 如果草稿目录中没有对应的诗歌文件夹，这是一个正常情况，忽略即可
                if (cpError.code !== 'ENOENT') {
                    throw cpError;
                }
            }
        }
        console.log('新的线上数据写入完成。');

        console.log('精细化发布流程成功完成！');
        res.status(200).json({ message: '所有已上架项目已成功发布到线上！' });
    } catch (error) {
        console.error('发布过程中发生严重错误:', error);
        res.status(500).json({ message: '发布失败，服务器发生内部错误。请检查服务器日志。', error: error.message });
    }
});


app.use('/api/admin', adminRouter);


// ============ 辅助函数 ============
const getAllPoemFiles = async (dirPath, arrayOfFiles = []) => {
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            if (item.isDirectory()) {
                await getAllPoemFiles(fullPath, arrayOfFiles);
            } else if (item.name.endsWith('.txt')) {
                arrayOfFiles.push(fullPath);
            }
        }
        return arrayOfFiles;
    } catch (error) {
        // 如果目录不存在等，返回空数组是合理的
        console.error(`Error reading directory ${dirPath}:`, error);
        return arrayOfFiles;
    }
};

// ============ 启动服务器 ============
app.listen(PORT, async () => {
    await initializeDraftDirectories();
    console.log(`🚀 “陆家花园”已在 http://localhost:${PORT} 盛开`);
    console.log(`🔑 后台管理入口: http://localhost:${PORT}/admin`);
});
