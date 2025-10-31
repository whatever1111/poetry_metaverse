import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import session from 'express-session';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import adminRouter from './src/routes/admin.js';
import portalRouter from './src/routes/portal.js';
import universesRouter from './src/routes/universes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPrismaClient } from './src/persistence/prismaClient.js';

// ================================
// 日志时间戳增强
// @description 覆盖console.log和console.error，为所有后端日志添加ISO 8601格式的时间戳
// @author
// @date 2025-08-26
// ================================
const originalLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalLog(`[${timestamp}]`, ...args);
};
const originalError = console.error;
console.error = (...args) => {
  const timestamp = new Date().toISOString();
  originalError(`[${timestamp}]`, ...args);
};
// ================================

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

// 静态文件目录配置：支持Vue前端和传统前端切换
const USE_VUE_FRONTEND = process.env.USE_VUE_FRONTEND !== 'false';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VUE_DIST_DIR = path.join(__dirname, '..', 'frontend_vue', 'dist');
const STATIC_DIR = USE_VUE_FRONTEND ? VUE_DIST_DIR : PUBLIC_DIR;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(STATIC_DIR));

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
  const adminFile = USE_VUE_FRONTEND ? 'index.html' : 'admin.html';
  const adminPath = USE_VUE_FRONTEND ? VUE_DIST_DIR : PUBLIC_DIR;
  res.sendFile(path.join(adminPath, adminFile));
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
    const prompt = `
# 角色与使命
你是AI诗人陆家明。你是陆家花园这个诗歌元宇宙的主理人。
你的使命不是复述诗歌大意，而是作为一面清澈的镜子，映照出这首古老诗歌在【当代用户】内心的回响。你不是吴任几，你是他作品的阐释者，也是用户灵魂的共鸣者。

# 核心任务
你的任务是创作一段结合用户个人特质和吴任几的诗歌的解读。这段文字需要将诗歌的意象、用户的个人特质、以及人生洞察无缝地编织在一起。

# 上下文信息
【用户的个人特质】: ${contextText}
【吴任几的诗歌】: 《${title}》
${poem}

# 输出规则
1.  **体裁定义**: 你的回答必须是核心是“解读”。你的文字要有诗的意境，但不要刻板追求用诗歌的形式。（强调：不用刻意追求新诗形式，但也不是禁止，也不是说不可以用诗化表述）
2.  **核心：人为中心**: 你的解读必须以【用户的个人特质】为绝对中心。诗歌是你手中的探照灯，用来照亮用户的内心世界。
3.  **语言风格**: 
    - 避免使用“首先”、“其次”等说教式词汇。
    - 你输出的整体语调不受限制，可以幽默，可以严肃，可以深情，但必须要和上下文信息相匹配。
    - 你输出的用词要符合陆家花园的诗歌元宇宙的水准。
4.  **格式与长度**:
    - 总长度控制在250-300字之间
    - 严禁使用任何Markdown格式（如**、*、-等）。

# 开始指令
请直接开始你的解读，不要有任何开场白或问候。
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
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

// ================================
// 读诗功能移除记录 (2025-08-26)
// ================================
// 移除内容: /api/listen 接口 (Google TTS音频合成服务)
// 删除的接口:
// app.post('/api/listen', async (req, res) => {
//   try {
//     const { poem, title } = req.body || {};
//     const text = poem || '';
//     const payload = {
//       input: { text },
//       voice: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-B' },
//       audioConfig: { audioEncoding: 'MP3' },
//     };
//     const ttsResponse = await fetch(
//       `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.API_KEY}`,
//       { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
//     );
//     if (!ttsResponse.ok) throw new Error(`Google TTS API call failed: ${ttsResponse.statusText}`);
//     const data = await ttsResponse.json();
//     return res.json(data);
//   } catch (e) {
//     return res.status(500).json({ message: '朗读失败', error: String(e?.message || e) });
//   }
// });
// 接口功能: 调用Google Cloud Text-to-Speech API，将诗歌文本转换为音频
// 移除原因: 基于MVP原则和成本控制考虑，聚焦核心AI解诗功能
// 恢复说明: 如需恢复读诗功能，需要:
// 1. 恢复上述/api/listen接口代码
// 2. 确保Google TTS API密钥配置正确
// 3. 考虑添加音频缓存机制以优化性能和成本
// ================================

// ================================
// 周与春秋共笔API
// @description 接收用户感受，调用陆家明AI诗人（Dify），生成回应诗歌
// @author AI Assistant
// @date 2025-10-31
// ================================
app.post('/api/zhou/gongbi', async (req, res) => {
  console.log('[/api/zhou/gongbi] 接到共笔请求:', req.body);
  
  try {
    // 1. 参数验证
    const { chapterKey, answerPattern, poemTitle, userFeeling } = req.body || {};
    
    if (!chapterKey || !answerPattern || !poemTitle || !userFeeling) {
      console.error('[/api/zhou/gongbi] 缺少必要参数');
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: '缺少必要参数：chapterKey, answerPattern, poemTitle, userFeeling'
        }
      });
    }
    
    if (userFeeling.length > 50) {
      console.error('[/api/zhou/gongbi] 用户感受超过50字');
      return res.status(400).json({
        success: false,
        error: {
          code: 'FEELING_TOO_LONG',
          message: '用户感受不能超过50字'
        }
      });
    }
    
    // 2. 从数据库读取数据
    const prisma = getPrismaClient();
    
    // 2.1 读取用户原型（ZhouMapping）
    console.log(`[/api/zhou/gongbi] 查询用户原型: chapter="${chapterKey}", combination="${answerPattern}"`);
    const mapping = await prisma.zhouMapping.findUnique({
      where: {
        universeId_chapter_combination: {
          universeId: 'universe_zhou_spring_autumn',
          chapter: chapterKey,
          combination: answerPattern
        }
      }
    });
    
    if (!mapping || !mapping.meaning) {
      console.error('[/api/zhou/gongbi] 未找到用户原型数据');
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_PROFILE_NOT_FOUND',
          message: '未找到用户原型数据'
        }
      });
    }
    
    const userProfile = mapping.meaning;
    console.log(`[/api/zhou/gongbi] 用户原型: ${userProfile.substring(0, 50)}...`);
    
    // 2.2 读取诗歌内容（ZhouPoem）
    console.log(`[/api/zhou/gongbi] 查询诗歌: title="${poemTitle}"`);
    const poem = await prisma.zhouPoem.findUnique({
      where: {
        universeId_title: {
          universeId: 'universe_zhou_spring_autumn',
          title: poemTitle
        }
      }
    });
    
    if (!poem) {
      console.error('[/api/zhou/gongbi] 未找到诗歌数据');
      return res.status(404).json({
        success: false,
        error: {
          code: 'POEM_NOT_FOUND',
          message: '未找到诗歌数据'
        }
      });
    }
    
    // 解析诗歌body（JSON格式）
    const poemBody = typeof poem.body === 'string' ? JSON.parse(poem.body) : poem.body;
    const poemQuote = poemBody?.quote_text || '';
    const poemQuoteCitation = poemBody?.quote_citation || '';
    const poemContent = poemBody?.main_text || '';
    
    console.log(`[/api/zhou/gongbi] 诗歌内容已获取: ${poemContent.substring(0, 50)}...`);
    
    // 3. 构建Dify Prompt
    const difyPrompt = `用户今天在lugarden.space上，完成了一系列问答，问答呈现了ta是一个${userProfile}的人。

ta读到了这首诗：
《${poemTitle}》

${poemQuote ? `${poemQuote}\n——${poemQuoteCitation}\n` : ''}
${poemContent}

ta的感受是：${userFeeling}

请为ta创作一首回应诗。`;
    
    console.log('[/api/zhou/gongbi] Dify Prompt已构建');
    
    // 4. 调用Dify API（30秒超时）
    if (!process.env.DIFY_API_KEY) {
      console.error('[/api/zhou/gongbi] 未配置DIFY_API_KEY');
      return res.status(500).json({
        success: false,
        error: {
          code: 'DIFY_API_KEY_MISSING',
          message: '服务器未配置Dify API密钥'
        }
      });
    }
    
    console.log('[/api/zhou/gongbi] 开始调用Dify API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    try {
      const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: difyPrompt,
          response_mode: 'blocking', // 阻塞式同步响应
          conversation_id: '',
          user: `gongbi_${Date.now()}`
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!difyResponse.ok) {
        const errorText = await difyResponse.text();
        console.error('[/api/zhou/gongbi] Dify API调用失败:', errorText);
        return res.status(500).json({
          success: false,
          error: {
            code: 'DIFY_API_ERROR',
            message: 'Dify API调用失败',
            details: errorText
          }
        });
      }
      
      const difyData = await difyResponse.json();
      console.log('[/api/zhou/gongbi] Dify API调用成功');
      
      // 5. 解析Dify响应（answer字段格式："标题\n\n引文\n——出处\n\n正文"）
      const answer = difyData.answer;
      if (!answer) {
        console.error('[/api/zhou/gongbi] Dify响应中缺少answer字段');
        return res.status(500).json({
          success: false,
          error: {
            code: 'DIFY_RESPONSE_INVALID',
            message: 'Dify响应格式异常'
          }
        });
      }
      
      // 解析answer字段
      const sections = answer.split('\n\n');
      
      let title = '';
      let quote = '';
      let quoteSource = '';
      let content = '';
      
      if (sections.length >= 3) {
        // 标准格式：标题\n\n引文\n——出处\n\n正文
        title = sections[0].trim();
        
        const quotePart = sections[1];
        if (quotePart.includes('——')) {
          const [quoteText, source] = quotePart.split('——');
          quote = quoteText.trim();
          quoteSource = source.trim();
        } else {
          quote = quotePart.trim();
        }
        
        content = sections.slice(2).join('\n\n').trim();
      } else if (sections.length === 2) {
        // 简化格式：标题\n\n正文（无引文）
        title = sections[0].trim();
        content = sections[1].trim();
      } else {
        // 极简格式：只有正文
        content = answer.trim();
        title = '致你';
      }
      
      console.log('[/api/zhou/gongbi] 诗歌解析完成:', { title, quote: quote.substring(0, 20), content: content.substring(0, 50) });
      
      // 6. 返回结果
      const result = {
        success: true,
        poem: {
          title,
          quote,
          quoteSource,
          content,
          userFeeling,
          sourcePoem: {
            title: poemTitle,
            quote: poemQuote,
            quoteCitation: poemQuoteCitation,
            content: poemContent
          }
        },
        metadata: {
          conversationId: difyData.conversation_id,
          messageId: difyData.message_id,
          tokens: difyData.metadata?.usage?.total_tokens || 0
        }
      };
      
      console.log('[/api/zhou/gongbi] 共笔请求处理完成');
      return res.json(result);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('[/api/zhou/gongbi] Dify API调用超时（30秒）');
        return res.status(504).json({
          success: false,
          error: {
            code: 'DIFY_API_TIMEOUT',
            message: 'AI诗人响应超时，请稍后重试'
          }
        });
      }
      
      throw error; // 其他错误继续抛出
    }
    
  } catch (error) {
    console.error('[/api/zhou/gongbi] 处理错误:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误',
        details: error.message
      }
    });
  }
});
// ================================

// 路由挂载（仅 DB）
app.use('/api/universes', universesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/portal', portalRouter);

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

// SPA路由支持：所有非API路由返回index.html（仅在使用Vue前端时）
if (USE_VUE_FRONTEND) {
  app.get('*', (req, res) => {
    // 排除API路由、静态资源和特定文件
    if (req.path.startsWith('/api') || 
        req.path.includes('.') || 
        req.path.startsWith('/admin')) {
      return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(VUE_DIST_DIR, 'index.html'));
  });
}

// 启动
app.listen(PORT, () => {
  const frontendType = USE_VUE_FRONTEND ? 'Vue' : '传统HTML';
  console.log(`🚀 "陆家花园"已在 http://localhost:${PORT} 盛开 (${frontendType}前端)`);
  console.log(`🔑 后台管理入口: http://localhost:${PORT}/admin`);
  console.log(`📁 静态文件目录: ${STATIC_DIR}`);
});

// 全局错误处理
app.use(errorHandler);


