# 陆家花园 - 周春秋诗歌管理系统启动说明

## 🚀 快速启动

### 方法一：使用批处理脚本（推荐）

#### 1. 生产模式启动
双击运行 `start.bat` 文件
- 自动安装依赖包
- 启动服务器
- 适合日常使用

#### 2. 开发模式启动
双击运行 `start-dev.bat` 文件
- 自动安装依赖包
- 使用 nodemon 启动（文件修改后自动重启）
- 适合开发调试

#### 3. 停止服务器
双击运行 `stop.bat` 文件
- 自动停止所有 Node.js 进程
- 释放端口 3000

### 方法二：手动启动

```bash
# 1. 切换到应用目录
cd poeject_zhou_spring_autumn/application

# 2. 安装依赖（首次运行）
npm install

# 3. 启动服务器
npm start          # 生产模式
npm run dev        # 开发模式
```

## 🌐 访问地址

- **主页**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin
  - 用户名: admin
  - 密码: 19951016（在 .env.local 中配置）

## ⚙️ 环境配置

### 必需文件
- `.env` - 基础配置模板（已包含在版本控制中）
- `.env.local` - 个人配置（包含敏感信息，不会被提交）

### 配置项
```bash
# 服务器配置
PORT=3000

# 会话配置
SESSION_SECRET=your-session-secret

# 管理员密码
ADMIN_PASSWORD=your-admin-password

# Google API密钥（用于AI功能）
API_KEY=your-google-api-key
```

## 🔧 故障排除

### 1. 端口被占用
```bash
# 查看端口占用
netstat -an | findstr :3000

# 停止占用进程
taskkill /f /im node.exe
```

### 2. 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 3. 环境变量问题
- 确保 `.env.local` 文件存在
- 检查环境变量格式是否正确
- 重启服务器使配置生效

## 📝 注意事项

1. **首次运行**：会自动安装依赖包，可能需要几分钟
2. **开发模式**：文件修改后会自动重启服务器
3. **停止服务**：按 `Ctrl+C` 或运行 `stop.bat`
4. **API密钥**：需要在 `.env.local` 中配置真实的 Google API 密钥才能使用 AI 功能

## 🎯 功能特性

- ✅ 诗歌问答系统
- ✅ 后台内容管理
- ✅ AI 解诗功能
- ✅ 文本转语音
- ✅ 多项目架构
- ✅ 草稿与发布系统
