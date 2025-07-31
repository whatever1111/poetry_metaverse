# 修复401权限错误问题

## 问题描述
- 主页加载时出现401错误：`HTTP error! status: 401`
- Admin页面显示"加载问题失败"和"HTTP error when loading mappings! status: 401"
- 数据加载失败，提示检查服务器连接或刷新页面

## 问题原因
主页(`index.html`)在加载时需要调用以下API接口：
1. `/api/mappings` - 获取诗歌映射关系
2. `/api/questions` - 获取问题列表

但这些接口在服务器端被`requireAuth`中间件保护，需要登录认证才能访问。主页是公开页面，用户未登录就无法获取数据。

## 解决方案
将主页需要的API接口改为公开访问，保持管理功能的API需要认证：

### 修改内容

1. **修改 `/api/questions` GET接口** (第437行)
   ```javascript
   // 从：
   app.get('/api/questions', requireAuth, async (req, res) => {
   
   // 改为：
   app.get('/api/questions', async (req, res) => {
   ```

2. **修改 `/api/mappings` GET接口** (第499行)
   ```javascript
   // 从：
   app.get('/api/mappings', requireAuth, async (req, res) => {
   
   // 改为：
   app.get('/api/mappings', async (req, res) => {
   ```

3. **保持管理功能需要认证**
   - PUT `/api/questions` - 更新问题（仍需认证）
   - PUT `/api/mappings` - 更新映射（仍需认证）
   - 所有诗歌管理API（仍需认证）

## 安全考虑
- 只有读取操作被设为公开访问
- 所有写入/修改操作仍需要管理员认证
- 这样既解决了主页访问问题，又保持了管理功能的安全性

## 部署说明
修改完成后需要重新启动服务器：

```bash
# 如果使用Docker
docker-compose down
docker-compose up -d --build

# 如果直接运行Node.js
pkill -f "node server.js"
node server.js
```

## 验证修复
1. 访问主页应该能正常加载，不再出现401错误
2. 问卷功能应该正常工作
3. Admin页面登录后应该能正常管理内容
