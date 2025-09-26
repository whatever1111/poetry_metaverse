# 统一 API 网关与数据服务（阶段 C）完成事项

## 完成范围
- C-0 路由契约冻结与对齐（契约样例、错误 envelope）
- C-1 基础骨架（路由分层、错误处理、鉴权中间件、Prisma 单例）
- C-2 公开接口 DB 优先 + 文件回退，映射层适配
- C-3 管理端读接口 DB 优先 + 文件回退
- C-4 管理端写接口落库（事务）与缓存失效
- C-5 发布机制切换为 status，/api/admin/publish-all 置为 no-op
- C-6 基础缓存与 ?refresh=true
- C-7 自动化测试（公开/管理/鉴权契约）

## 关键产物
- 文档：
  - documentation/backend/api-contracts.md（契约样例与弃用说明）
  - documentation/backend/field-mapping.md（字段映射）
  - documentation/backend/migration-notes.md（发布机制切换说明）
- 代码：
  - src/routes/public.js、src/routes/admin.js、src/services/mappers.js
  - src/persistence/prismaClient.js（惰性加载）
  - src/middlewares/errorHandler.js、src/utils/cache.js
- 测试：
  - tests/public-api.contract.test.js
  - tests/admin-api.contract.test.js
  - tests/admin-auth.contract.test.js

## 验收要点（已满足）
- 前端零改动，契约一致；公开/管理读接口回归测试绿
- 未鉴权返回统一 401 envelope
- 发布由 status 控制；公开接口仅返回 published
- 写后相关只读缓存键失效；?refresh=true 可手动刷新
