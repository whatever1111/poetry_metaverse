import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import session from 'express-session';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import publicRouter from './src/routes/public.js';
import adminRouter from './src/routes/admin.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPrismaClient } from './src/persistence/prismaClient.js';

// 环境变量（优先 .env.local，其次 .env）
dotenv.config({ path: '.env.local' });
dotenv.config();

// 全局代理设置
if (process.env.HTTPS_PROXY) {
  const proxyAgent = new ProxyAgent(process.env.HTTPS_PROXY);
  setGlobalDispatcher(proxyAgent);
  console.log(`[Proxy] 已启用全局代理: ${process.env.HTTPS_PROXY}`);
}

// API 客户端初始化
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// 基础初始化
const app = express();
const PORT = process.env.PORT || 3000;

// 目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// 会话
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'replace-me-in-env',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// 简易鉴权中间件（页面用）
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) return next();
  if (req.path.startsWith('/api/admin')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '需要认证' } });
  }
  return res.redirect('/login.html');
};

// 登录/注销
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    return req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: '会话保存失败' });
      return res.json({ success: true, message: '登录成功' });
    });
  }
  return res.status(401).json({ success: false, message: '密码错误' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: '注销失败' });
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: '注销成功' });
  });
});

// 管理页面
app.get('/admin', requireAuth, (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// 第三方代理
app.post('/api/interpret', async (req, res) => {
  console.log('[/api/interpret] 接到请求:', req.body);
  try {
    const { poem, title, combination, chapter } = req.body || {}; // 假设前端也会传递 chapter
    const prisma = getPrismaClient();

    // 1. 根据 combination 和 chapter 从数据库查询 meaning
    let contextText = '';
    if (combination && chapter) {
      console.log(`[/api/interpret] 正在查询数据库: chapter="${chapter}", combination="${combination}"`);
      const mapping = await prisma.zhouMapping.findUnique({
        where: {
          universeId_chapter_combination: {
            universeId: 'universe_zhou_spring_autumn', // 硬编码或从配置中获取
            chapter: chapter,
            combination: combination,
          }
        }
      });
      console.log('[/api/interpret] 数据库查询结果:', mapping);
      if (mapping && mapping.meaning) {
        contextText = mapping.meaning;
      }
    }
    
    // 2. 构建增强型 Prompt
    const prompt = `你是AI诗人陆家明。你的任务不是写一篇标准的诗歌赏析，而是要成为一面镜子，通过解读诗歌，来深度剖析和回应用户的个人特质。

用户的个人特质是：【${contextText}】

他/她此刻遇到的诗歌是《${title}》：
【${poem}】

现在，请你开口。你的解读必须遵循以下所有铁则：
1. 焦点是人，不是诗：诗歌是你的工具，用户特质才是你回应的核心。你的每一句话，都必须最终指向用户的内心世界、困惑或信念。
2. 语言风格：像一个真正的诗人一样说话。语言要凝练、富有象征性、充满美感，但绝不能晦涩。避免使用“首先”、“其次”、“因此”这类呆板的逻辑词。
3. 格式禁令：绝对禁止使用任何Markdown格式，比如\`**\`、\`*\`、\`-\`等。你的回答必须是纯文本。
4. 长度控制：你的回答必须像一首短诗或一段箴言，点到为止。总长度严格控制在200字以内。

直接开始你的解读，不要有任何开场白。`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 300,
      },
    });

    console.log('[/api/interpret] 正在调用 Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('[/api/interpret] 已收到 Gemini API 的响应');

    return res.json({ interpretation: text });
  } catch (e) {
    console.error('[/api/interpret] 发生错误:', e);
    return res.status(500).json({ message: '解读失败', error: String(e?.message || e) });
  }
});

app.post('/api/listen', async (req, res) => {
  try {
    const { poem, title } = req.body || {};
    // 使用诗歌内容作为朗读文本
    const text = poem || '';
    const payload = {
      input: { text },
      voice: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-B' },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (!ttsResponse.ok) throw new Error(`Google TTS API call failed: ${ttsResponse.statusText}`);
    const data = await ttsResponse.json();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: '朗读失败', error: String(e?.message || e) });
  }
});

// 路由挂载（仅 DB）
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);

// 健康检查（仅 DB）
app.get('/api/health', async (_req, res) => {
  try {
    const prisma = getPrismaClient();
    const [projects, poems, qa] = await Promise.all([
      prisma.zhouProject.count().catch(() => -1),
      prisma.zhouPoem.count().catch(() => -1),
      prisma.zhouQA.count().catch(() => -1),
    ]);
    const ok = projects >= 0 && poems >= 0 && qa >= 0;
    return res.json({ ok, db: ok ? 'ready' : 'error', counts: { projects, poems, qa }, fallbackToFs: false });
  } catch (e) {
    return res.status(500).json({ ok: false, db: 'error', error: String(e), fallbackToFs: false });
  }
});

// 启动
app.listen(PORT, () => {
  console.log(`🚀 “陆家花园”已在 http://localhost:${PORT} 盛开`);
  console.log(`🔑 后台管理入口: http://localhost:${PORT}/admin`);
});

// 全局错误处理
app.use(errorHandler);


