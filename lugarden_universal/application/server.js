import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import session from 'express-session';
import publicRouter from './src/routes/public.js';
import adminRouter from './src/routes/admin.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPrismaClient } from './src/persistence/prismaClient.js';

// 环境变量（优先 .env.local，其次 .env）
dotenv.config({ path: '.env.local' });
dotenv.config();

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
  try {
    const { prompt } = req.body || {};
    const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`Gemini API call failed: ${response.statusText}`);
    const data = await response.json();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: '解读失败', error: String(e?.message || e) });
  }
});

app.post('/api/listen', async (req, res) => {
  try {
    const { text } = req.body || {};
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


