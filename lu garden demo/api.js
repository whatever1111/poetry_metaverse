import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_LIVE_PATH = './database.json';
const DB_DRAFT_PATH = './database_draft.json';
const API_KEY = process.env.API_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
    if (req.headers['x-admin-password'] === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// --- Helper Functions ---
const readLiveDB = async () => JSON.parse(await fs.readFile(DB_LIVE_PATH, 'utf-8'));
const readDraftDB = async () => JSON.parse(await fs.readFile(DB_DRAFT_PATH, 'utf-8'));
const writeDraftDB = async (data) => fs.writeFile(DB_DRAFT_PATH, JSON.stringify(data, null, 2));
const writeLiveDB = async (data) => fs.writeFile(DB_LIVE_PATH, JSON.stringify(data, null, 2));


// --- Public API Routes (读取 LIVE 数据库) ---
app.get('/api/projects', async (req, res) => {
    try {
        const db = await readLiveDB();
        const projectSummaries = db.projects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            poet: p.poet,
            subProjects: p.subProjects.map(sp => ({
                id: sp.id,
                name: sp.name,
                description: sp.description
            }))
        }));
        res.json(projectSummaries);
    } catch (error) {
        res.status(500).json({ message: '获取项目列表失败', error: error.message });
    }
});

app.get('/api/projects/:projectId/sub/:subProjectId', async (req, res) => {
    try {
        const db = await readLiveDB();
        const mainProject = db.projects.find(p => p.id === req.params.projectId);
        if (!mainProject) return res.status(404).json({ message: '主项目未找到' });
        
        const subProject = mainProject.subProjects.find(sp => sp.id === req.params.subProjectId);
        if (subProject) res.json(subProject);
        else res.status(404).json({ message: '子项目未找到' });

    } catch (error) {
        res.status(500).json({ message: '获取子项目详情失败', error: error.message });
    }
});


// Gemini API proxy
app.post('/api/interpret', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
        
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API call failed: ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Interpretation Error:', error);
        res.status(500).json({ message: '解读失败', error: error.message });
    }
});

// Google TTS API proxy
app.post('/api/listen', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text is required' });

        const payload = {
            input: { text },
            voice: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-B' },
            audioConfig: { audioEncoding: 'MP3' }
        };
        
        const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!ttsResponse.ok) {
            const errorBody = await ttsResponse.text();
            throw new Error(`Google TTS API call failed: ${ttsResponse.statusText} - ${errorBody}`);
        }
        const data = await ttsResponse.json();
        res.json(data);
    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ message: '朗读失败', error: error.message });
    }
});


// --- Admin API Routes (读写 DRAFT 数据库) ---
const adminRouter = express.Router();
adminRouter.use(authMiddleware);

adminRouter.post('/publish-updates', async (req, res) => {
    try {
        const draftDb = await readDraftDB();
        const liveDb = await readLiveDB();

        const liveProjectIds = new Set(liveDb.projects.map(p => p.id));
        
        liveDb.projects = liveDb.projects.map(liveProject => {
            const draftVersion = draftDb.projects.find(p => p.id === liveProject.id);
            return draftVersion ? draftVersion : liveProject;
        });

        await writeLiveDB(liveDb);
        res.status(200).json({ message: '对已发布项目的更新已同步！' });
    } catch (error) {
        console.error('Publish Updates Error:', error);
        res.status(500).json({ message: '发布更新失败', error: error.message });
    }
});

adminRouter.post('/publish-new/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const draftDb = await readDraftDB();
        const liveDb = await readLiveDB();

        if (liveDb.projects.some(p => p.id === projectId)) {
            return res.status(400).json({ message: '项目已存在，请使用“发布更新”功能。' });
        }

        const newProject = draftDb.projects.find(p => p.id === projectId);
        if (!newProject) {
            return res.status(404).json({ message: '在草稿中未找到该项目。' });
        }

        liveDb.projects.push(newProject);
        await writeLiveDB(liveDb);
        res.status(200).json({ message: `新项目 "${newProject.name}" 已成功发布！` });
    } catch (error) {
        console.error('Publish New Error:', error);
        res.status(500).json({ message: '发布新项目失败', error: error.message });
    }
});


// Helper to find projects and subprojects
const findProjects = (db, projectId, subProjectId = null) => {
    const mainProjectIndex = db.projects.findIndex(p => p.id === projectId);
    if (mainProjectIndex === -1) return { mainProject: null, mainProjectIndex: -1, subProject: null, subProjectIndex: -1 };
    
    const mainProject = db.projects[mainProjectIndex];

    if (!subProjectId) {
        return { mainProject, mainProjectIndex, subProject: null, subProjectIndex: -1 };
    }

    const subProjectIndex = mainProject.subProjects.findIndex(sp => sp.id === subProjectId);
    const subProject = subProjectIndex > -1 ? mainProject.subProjects[subProjectIndex] : null;

    return { mainProject, mainProjectIndex, subProject, subProjectIndex };
};

adminRouter.get('/projects', async (req, res) => {
    try {
        const draftDb = await readDraftDB();
        const liveDb = await readLiveDB();
        const liveProjectIds = new Set(liveDb.projects.map(p => p.id));
        
        const projectsWithStatus = draftDb.projects.map(p => ({
            ...p,
            isPublished: liveProjectIds.has(p.id)
        }));

        res.json(projectsWithStatus);
    } catch (error) {
        res.status(500).json({ message: '获取主项目失败', error: error.message });
    }
});

// Create a new main project
adminRouter.post('/projects', async (req, res) => {
    const { name, description, poet } = req.body;
    if (!name) return res.status(400).json({ message: '项目名称不能为空' });
    
    const newMainProject = {
        id: uuidv4(),
        name,
        description: description || '',
        poet: poet || '',
        subProjects: []
    };

    try {
        const db = await readDraftDB();
        db.projects.push(newMainProject);
        await writeDraftDB(db);
        res.status(201).json(newMainProject);
    } catch (error) {
        res.status(500).json({ message: '创建主项目失败', error: error.message });
    }
});


// Get a specific main project
adminRouter.get('/projects/:projectId', async (req, res) => {
    try {
        const db = await readDraftDB();
        const { mainProject } = findProjects(db, req.params.projectId);
        if (mainProject) {
            res.json(mainProject);
        } else {
            res.status(404).json({ message: '主项目未找到' });
        }
    } catch (error) {
        res.status(500).json({ message: '获取主项目详情失败', error: error.message });
    }
});

// Update a main project's info
adminRouter.put('/projects/:projectId', async (req, res) => {
    const { name, description, poet } = req.body;
    if (!name) return res.status(400).json({ message: '项目名称不能为空' });
    try {
        const db = await readDraftDB();
        const { mainProject, mainProjectIndex } = findProjects(db, req.params.projectId);
        if (!mainProject) return res.status(404).json({ message: '主项目未找到' });

        mainProject.name = name;
        mainProject.description = description || '';
        mainProject.poet = poet || '';

        db.projects[mainProjectIndex] = mainProject;
        await writeDraftDB(db);
        res.json(mainProject);
    } catch (error) {
        res.status(500).json({ message: '更新主项目失败', error: error.message });
    }
});

// [新增] 删除一个主项目 (同时从 DRAFT 和 LIVE 中删除)
adminRouter.delete('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    try {
        // 从 DRAFT 中删除
        const draftDb = await readDraftDB();
        draftDb.projects = draftDb.projects.filter(p => p.id !== projectId);
        await writeDraftDB(draftDb);

        // 从 LIVE 中删除
        const liveDb = await readLiveDB();
        liveDb.projects = liveDb.projects.filter(p => p.id !== projectId);
        await writeLiveDB(liveDb);

        res.status(204).send(); // 成功，无内容返回
    } catch (error) {
        res.status(500).json({ message: '删除项目失败', error: error.message });
    }
});


// Create a new subproject
adminRouter.post('/projects/:projectId/sub', async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: '子项目名称不能为空' });

    try {
        const db = await readDraftDB();
        const { mainProject } = findProjects(db, req.params.projectId);
        if (!mainProject) return res.status(404).json({ message: '主项目未找到' });

        const newSubProject = {
            id: uuidv4(),
            name,
            description: description || '',
            poems: [],
            questions: [
                { id: uuidv4(), question: "新问题 1", options: { A: "选项 A", B: "选项 B" } },
                { id: uuidv4(), question: "新问题 2", options: { A: "选项 A", B: "选项 B" } },
                { id: uuidv4(), question: "新问题 3", options: { A: "选项 A", B: "选项 B" } },
                { id: uuidv4(), question: "新问题 4", options: { A: "选项 A", B: "选项 B" } }
            ],
            resultMap: {
                "0000": "", "0001": "", "0010": "", "0011": "",
                "0100": "", "0101": "", "0110": "", "0111": "",
                "1000": "", "1001": "", "1010": "", "1011": "",
                "1100": "", "1101": "", "1110": "", "1111": ""
            }
        };

        mainProject.subProjects.push(newSubProject);
        await writeDraftDB(db);
        res.status(201).json(newSubProject);
    } catch (error) {
        res.status(500).json({ message: '创建子项目失败', error: error.message });
    }
});


// Update a subproject's poem
adminRouter.put('/projects/:projectId/sub/:subProjectId/poems/:poemId', async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: '标题和正文不能为空' });
    try {
        const db = await readDraftDB();
        const { subProject } = findProjects(db, req.params.projectId, req.params.subProjectId);
        if (!subProject) return res.status(404).json({ message: '子项目未找到' });
        
        const poemIndex = subProject.poems.findIndex(p => p.id === req.params.poemId);
        if (poemIndex === -1) return res.status(404).json({ message: '诗歌未找到' });

        subProject.poems[poemIndex] = { ...subProject.poems[poemIndex], title, body };
        await writeDraftDB(db);
        res.json(subProject.poems[poemIndex]);
    } catch (error) {
        res.status(500).json({ message: '更新诗歌失败', error: error.message });
    }
});

// Add a new poem to a subproject
adminRouter.post('/projects/:projectId/sub/:subProjectId/poems', async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: '标题和正文不能为空' });
    try {
        const db = await readDraftDB();
        const { subProject } = findProjects(db, req.params.projectId, req.params.subProjectId);
        if (!subProject) return res.status(404).json({ message: '子项目未找到' });

        const newPoem = { id: uuidv4(), title, body };
        subProject.poems.push(newPoem);
        await writeDraftDB(db);
        res.status(201).json(newPoem);
    } catch (error) {
        res.status(500).json({ message: '添加诗歌失败', error: error.message });
    }
});

// Delete a poem from a subproject
adminRouter.delete('/projects/:projectId/sub/:subProjectId/poems/:poemId', async (req, res) => {
    try {
        const db = await readDraftDB();
        const { subProject } = findProjects(db, req.params.projectId, req.params.subProjectId);
        if (!subProject) return res.status(404).json({ message: '子项目未找到' });

        subProject.poems = subProject.poems.filter(p => p.id !== req.params.poemId);
        await writeDraftDB(db);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '删除诗歌失败', error: error.message });
    }
});

// Update a subproject's questions
adminRouter.put('/projects/:projectId/sub/:subProjectId/questions', async (req, res) => {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ message: '数据格式错误' });
    try {
        const db = await readDraftDB();
        const { subProject } = findProjects(db, req.params.projectId, req.params.subProjectId);
        if (!subProject) return res.status(404).json({ message: '子项目未找到' });
        
        subProject.questions = questions;
        await writeDraftDB(db);
        res.json(subProject.questions);
    } catch (error) {
        res.status(500).json({ message: '更新问题失败', error: error.message });
    }
});

// Update a subproject's result map
adminRouter.put('/projects/:projectId/sub/:subProjectId/resultMap', async (req, res) => {
    const { resultMap } = req.body;
    if (typeof resultMap !== 'object' || resultMap === null) return res.status(400).json({ message: '数据格式错误' });
    try {
        const db = await readDraftDB();
        const { subProject } = findProjects(db, req.params.projectId, req.params.subProjectId);
        if (!subProject) return res.status(404).json({ message: '子项目未找到' });

        subProject.resultMap = resultMap;
        await writeDraftDB(db);
        res.json(subProject.resultMap);
    } catch (error) {
        res.status(500).json({ message: '更新映射失败', error: error.message });
    }
});


app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`“陆家花园”的后院已在 http://localhost:${PORT} 打开`);
});
