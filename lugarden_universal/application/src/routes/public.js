// 占位路由模块（不改变现有行为）
// 后续 C-2 才会接入 DB 读取与文件回退逻辑

import { Router } from 'express';

const router = Router();

// 先占位，不挂实际处理，待 C-2 逐步替换
// 由 server.js 在合适时机挂载，当前阶段不启用

export default router;


