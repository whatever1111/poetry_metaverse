const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 目录配置
const POEMS_DIR = path.join(__dirname, 'poems');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// 速率限制
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100个请求
    message: {
        error: '请求过于频繁，请稍后再试'
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 限制登录尝试次数
    message: {
        error: '登录尝试次数过多，请15分钟后再试'
    },
    skipSuccessfulRequests: true
});

app.use('/api/login', loginLimiter);
app.use(limiter);

// 基础中间件
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [`https://${process.env.DOMAIN}`, `http://${process.env.DOMAIN}`]
        : ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Session 配置
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    },
    name: 'poetry.sid' // 自定义session名称
}));

// 静态文件服务
app.use(express.static(PUBLIC_DIR));

// 认证中间件
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        return res.status(401).json({ error: '需要登录' });
    }
}

// 确保必要目录存在
async function ensureDirectories() {
    try {
        await fs.access(POEMS_DIR);
    } catch {
        await fs.mkdir(POEMS_DIR, { recursive: true });
    }
    
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// ============ 认证 API ============

// 登录接口
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名和密码不能为空' 
            });
        }
        
        // 验证用户名和密码
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (username === adminUsername && password === adminPassword) {
            req.session.isAuthenticated = true;
            req.session.username = username;
            
            res.json({ 
                success: true, 
                message: '登录成功',
                user: { username }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误' 
        });
    }
});

// 注销接口
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: '注销失败' 
            });
        }
        res.clearCookie('poetry.sid');
        res.json({ 
            success: true, 
            message: '注销成功' 
        });
    });
});

// 检查认证状态
app.get('/api/auth/status', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.json({ 
            authenticated: true, 
            user: { username: req.session.username }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// ============ 受保护的路由 ============

// 保护admin.html页面
app.get('/admin.html', requireAuth, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// 重定向到登录页面
app.get('/admin', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.redirect('/admin.html');
    } else {
        res.redirect('/login.html');
    }
});

// ============ 诗歌管理 API（需要认证）============

// Helper function to recursively get all .txt files from a directory
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
        console.error('Error reading directory:', error);
        return arrayOfFiles;
    }
};

// Helper function to get the directory tree
const getPoemsTree = async (dirPath) => {
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        const tree = [];
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            const relativePath = path.relative(POEMS_DIR, itemPath);
            
            if (item.isDirectory()) {
                tree.push({
                    name: item.name,
                    type: 'folder',
                    path: relativePath,
                    children: await getPoemsTree(itemPath)
                });
            } else {
                tree.push({
                    name: item.name,
                    type: 'file',
                    path: relativePath
                });
            }
        }
        
        // Sort so folders appear before files
        return tree.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error('Error getting tree:', error);
        return [];
    }
};

// 1. Get all poems for the main quiz app (公开接口)
app.get('/api/poems-all', async (req, res) => {
    try {
        const poemFiles = await getAllPoemFiles(POEMS_DIR);
        const poems = {};
        
        for (const filePath of poemFiles) {
            const content = await fs.readFile(filePath, 'utf8');
            const fileName = path.basename(filePath, '.txt');
            poems[fileName] = content;
        }
        
        res.json(poems);
    } catch (error) {
        console.error('Error reading poems:', error);
        res.status(500).json({ error: 'Failed to read poems' });
    }
});

// 2. Get the poems directory tree (需要认证)
app.get('/api/poems-tree', requireAuth, async (req, res) => {
    try {
        const tree = await getPoemsTree(POEMS_DIR);
        res.json(tree);
    } catch (error) {
        console.error('Error getting poems tree:', error);
        res.status(500).json({ error: 'Failed to get poems tree' });
    }
});

// 3. Get, create, update, or delete a specific poem (需要认证)
app.get('/api/poem', requireAuth, async (req, res) => {
    try {
        const { path: poemPath } = req.query;
        if (!poemPath) {
            return res.status(400).json({ error: 'Path parameter is required' });
        }
        
        const fullPath = path.join(POEMS_DIR, poemPath);
        
        // Security check: ensure the path is within POEMS_DIR
        if (!fullPath.startsWith(POEMS_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const content = await fs.readFile(fullPath, 'utf8');
        res.send(content);
    } catch (error) {
        console.error('Error reading poem:', error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Poem not found' });
        } else {
            res.status(500).json({ error: 'Failed to read poem' });
        }
    }
});

app.post('/api/poem', requireAuth, async (req, res) => {
    try {
        const { path: poemPath, content = '', isFolder = false } = req.body;
        if (!poemPath) {
            return res.status(400).json({ error: 'Path is required' });
        }
        
        const fullPath = path.join(POEMS_DIR, poemPath);
        
        // Security check
        if (!fullPath.startsWith(POEMS_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (isFolder) {
            await fs.mkdir(fullPath, { recursive: true });
            res.send('Folder created successfully');
        } else {
            // Ensure parent directory exists
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            
            await fs.writeFile(fullPath, content, 'utf8');
            res.send('Poem created successfully');
        }
    } catch (error) {
        console.error('Error creating poem/folder:', error);
        res.status(500).json({ error: 'Failed to create poem/folder' });
    }
});

app.put('/api/poem', requireAuth, async (req, res) => {
    try {
        const { path: poemPath, content } = req.body;
        if (!poemPath || content === undefined) {
            return res.status(400).json({ error: 'Path and content are required' });
        }
        
        const fullPath = path.join(POEMS_DIR, poemPath);
        
        // Security check
        if (!fullPath.startsWith(POEMS_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        await fs.writeFile(fullPath, content, 'utf8');
        res.send('Poem updated successfully');
    } catch (error) {
        console.error('Error updating poem:', error);
        res.status(500).json({ error: 'Failed to update poem' });
    }
});

app.delete('/api/poem', requireAuth, async (req, res) => {
    try {
        const { path: poemPath } = req.body;
        if (!poemPath) {
            return res.status(400).json({ error: 'Path is required' });
        }
        
        const fullPath = path.join(POEMS_DIR, poemPath);
        
        // Security check
        if (!fullPath.startsWith(POEMS_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Check if it's a file or directory
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
            await fs.rmdir(fullPath);
        } else {
            await fs.unlink(fullPath);
        }
        
        res.send('Poem/folder deleted successfully');
    } catch (error) {
        console.error('Error deleting poem/folder:', error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Poem/folder not found' });
        } else if (error.code === 'ENOTEMPTY') {
            res.status(400).json({ error: 'Directory is not empty' });
        } else {
            res.status(500).json({ error: 'Failed to delete poem/folder' });
        }
    }
});

// 4. Move/rename a poem or folder (需要认证)
app.put('/api/item/move', requireAuth, async (req, res) => {
    try {
        const { oldPath, newPath, overwrite = false } = req.body;
        if (!oldPath || !newPath) {
            return res.status(400).json({ error: 'Both oldPath and newPath are required' });
        }
        
        const fullOldPath = path.join(POEMS_DIR, oldPath);
        const fullNewPath = path.join(POEMS_DIR, newPath);
        
        // Security check
        if (!fullOldPath.startsWith(POEMS_DIR) || !fullNewPath.startsWith(POEMS_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Check if destination exists
        try {
            await fs.access(fullNewPath);
            if (!overwrite) {
                return res.status(409).json({ error: 'An item with the same name already exists in the destination folder.' });
            }
        } catch {
            // File doesn't exist, which is fine
        }
        
        // Ensure destination directory exists
        const destDir = path.dirname(fullNewPath);
        await fs.mkdir(destDir, { recursive: true });
        
        await fs.rename(fullOldPath, fullNewPath);
        res.send('Item moved successfully');
    } catch (error) {
        console.error('Error moving item:', error);
        res.status(500).json({ error: 'Failed to move item' });
    }
});

// ============ 问题管理 API（需要认证）============

// Get questions
app.get('/api/questions', requireAuth, async (req, res) => {
    try {
        const questionsPath = path.join(DATA_DIR, 'questions.json');
        try {
            const data = await fs.readFile(questionsPath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, return default questions
                const defaultQuestions = [
                    {
                        id: "question1",
                        question: "你认为自己是个理想主义者吗？",
                        options: { A: "是的", B: "不是" },
                        meaning: { A: "倾向于追求完美和崇高理想", B: "更注重现实和实用性" }
                    },
                    {
                        id: "question2", 
                        question: "面对困难时，你的第一反应是？",
                        options: { A: "迎难而上", B: "寻求帮助" },
                        meaning: { A: "具有坚强的意志和独立性", B: "重视合作和人际关系" }
                    },
                    {
                        id: "question3",
                        question: "你更喜欢什么样的生活节奏？",
                        options: { A: "忙碌充实", B: "平静安逸" },
                        meaning: { A: "追求刺激和成就感", B: "重视安全感和稳定性" }
                    },
                    {
                        id: "question4",
                        question: "对于失败，你的态度是？",
                        options: { A: "学习机会", B: "痛苦经历" },
                        meaning: { A: "乐观积极，善于反思", B: "敏感细腻，容易受挫" }
                    }
                ];
                await fs.writeFile(questionsPath, JSON.stringify(defaultQuestions, null, 2));
                res.json(defaultQuestions);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error reading questions:', error);
        res.status(500).json({ error: 'Failed to read questions' });
    }
});

// Update questions
app.put('/api/questions', requireAuth, async (req, res) => {
    try {
        const questionsPath = path.join(DATA_DIR, 'questions.json');
        await fs.writeFile(questionsPath, JSON.stringify(req.body, null, 2));
        res.send('Questions updated successfully');
    } catch (error) {
        console.error('Error updating questions:', error);
        res.status(500).json({ error: 'Failed to update questions' });
    }
});

// ============ 映射管理 API（需要认证）============

// Get mappings
app.get('/api/mappings', requireAuth, async (req, res) => {
    try {
        const mappingsPath = path.join(DATA_DIR, 'mappings.json');
        try {
            const data = await fs.readFile(mappingsPath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, return default mappings
                const defaultMappings = {
                    defaultUnit: "观我生",
                    units: {
                        "观我生": {
                            "AAAA": "《论保持希望》",
                            "AAAB": "《论从不足中知足》",
                            "AABA": "《论学会忍受虚无》",
                            "AABB": "《论不完全只有坏事》",
                            "ABAA": "《论坡脚时》",
                            "ABAB": "《论内求比读诗重要》",
                            "ABBA": "《论接纳混乱》",
                            "ABBB": "《论假装状态良好》",
                            "BAAA": "《论钝感力》",
                            "BAAB": "《论义务》",
                            "BABA": "《论从义务中获得力量》",
                            "BABB": "《论发生奇怪事情时》",
                            "BBAA": "《论我们的连结》",
                            "BBAB": "《论慢一点但稳一点》",
                            "BBBA": "《论不要带着偏见》",
                            "BBBB": "《论看待别人》"
                        }
                    }
                };
                await fs.writeFile(mappingsPath, JSON.stringify(defaultMappings, null, 2));
                res.json(defaultMappings);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error reading mappings:', error);
        res.status(500).json({ error: 'Failed to read mappings' });
    }
});

// Update mappings
app.put('/api/mappings', requireAuth, async (req, res) => {
    try {
        const mappingsPath = path.join(DATA_DIR, 'mappings.json');
        await fs.writeFile(mappingsPath, JSON.stringify(req.body, null, 2));
        res.send('Mappings updated successfully');
    } catch (error) {
        console.error('Error updating mappings:', error);
        res.status(500).json({ error: 'Failed to update mappings' });
    }
});

// ============ 启动服务器 ============

async function startServer() {
    try {
        await ensureDirectories();
        
        app.listen(PORT, () => {
            console.log(`🚀 服务器已启动:`);
            console.log(`   - 本地地址: http://localhost:${PORT}`);
            console.log(`   - 主页: http://localhost:${PORT}/`);
            console.log(`   - 管理后台: http://localhost:${PORT}/admin`);
            console.log(`   - 环境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📝 管理员账号: ${process.env.ADMIN_USERNAME || 'admin'}`);
            console.log(`🔒 请确保已在 .env 文件中设置安全的密码和Session密钥`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 