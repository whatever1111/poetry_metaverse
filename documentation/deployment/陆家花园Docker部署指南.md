# 陆家花园 Docker 部署完整指南（零基础版）

> **文档目标**：让零 Docker 基础的网络架构师能够通过第一性原理理解并完成陆家花园项目的容器化部署

---

## 目录

- [第零部分：前置说明与环境准备](#第零部分前置说明与环境准备)
- [第一部分：Docker基础概念（零基础）](#第一部分docker基础概念零基础)
- [第二部分：分析陆家花园代码](#第二部分分析陆家花园代码)
- [第三部分：设计Dockerfile（逐步推导）](#第三部分设计dockerfile逐步推导)
- [第四部分：设计docker-compose.yml（逐步推导）](#第四部分设计docker-composeyml逐步推导)
- [第五部分：实战部署（完整流程）](#第五部分实战部署完整流程)
- [第六部分：跨版本适配指南](#第六部分跨版本适配指南)
- [第七部分：故障排查与常用命令](#第七部分故障排查与常用命令)

---

## 第零部分：前置说明与环境准备

### 文档定位

本文档是为具备网络架构背景但零编程经验的技术人员设计的**生产级Docker部署完整指南**。文档遵循以下原则：

1. **第一性原理驱动**：从"为什么需要容器化"的底层逻辑出发，逐层推导到具体实现
2. **架构思维贯穿**：将Docker概念映射到网络架构中的对应物（如：容器≈虚拟机，网络≈VLAN）
3. **零代码假设**：不假设你熟悉Node.js/npm/Prisma，所有涉及的技术栈都会从原理解释
4. **生产级标准**：所有配置都面向真实部署场景，包含安全、性能、可维护性考量

### 版本锚定

本文档基于项目的以下快照（commit `0c19db8`）：

```
陆家花园项目结构:
lu_garden_lab/
├── lugarden_universal/
│   ├── application/          # Node.js后端（Express + Prisma）
│   │   ├── package.json      # 依赖声明
│   │   ├── server.js         # 入口文件
│   │   └── prisma/
│   │       └── schema.prisma # 数据库模式
│   └── frontend_vue/         # Vue3前端
│       └── dist/             # 构建产物
├── poeject_maoxiaodou_universe/  # 数据源1
└── poeject_zhou_spring_autumn/   # 数据源2
```

### Linux基础命令速查（网络工程师友好版）

| 命令 | 功能 | 网络类比 |
|------|------|----------|
| `cd /path` | 切换目录 | 切换到交换机的特定接口配置模式 |
| `ls -la` | 列出文件（含隐藏） | `show running-config` |
| `cat file` | 查看文件内容 | `show` 命令 |
| `mkdir -p dir` | 创建目录（递归） | 创建VLAN |
| `chmod +x script.sh` | 赋予执行权限 | 启用端口 |
| `ps aux \| grep app` | 查看进程 | `show process` |
| `netstat -tuln` | 查看端口占用 | `show ip interface brief` |

### 读者要求

- **必需**：理解OSI七层模型、TCP/IP协议栈、基本的Linux文件系统概念
- **推荐**：有虚拟化技术（VMware/KVM）使用经验
- **无需**：编程经验、前端/后端开发背景

---

## 第一部分：Docker基础概念（零基础）

### 什么是Docker？

#### 本质定义
Docker是一个**操作系统级虚拟化**技术，它通过Linux内核的`cgroups`（资源隔离）和`namespace`（环境隔离）机制，在同一个操作系统上创建多个相互隔离的用户空间实例。

#### 与虚拟机的区别（架构师视角）

```
传统虚拟机架构：
┌─────────────────────────────────────┐
│   App A   │   App B   │   App C    │  ← 应用层
├───────────┼───────────┼────────────┤
│  Guest OS │  Guest OS │  Guest OS  │  ← 完整操作系统（各几GB）
├───────────┴───────────┴────────────┤
│        Hypervisor (ESXi/KVM)       │  ← 虚拟化层
├────────────────────────────────────┤
│          Host OS (Linux)           │  ← 宿主机OS
└────────────────────────────────────┘
资源开销：3个完整OS + Hypervisor开销 = 重量级

Docker容器架构：
┌─────────────────────────────────────┐
│   App A   │   App B   │   App C    │  ← 应用层
├───────────┼───────────┼────────────┤
│ Container │ Container │ Container  │  ← 容器（共享内核）
├───────────┴───────────┴────────────┤
│          Docker Engine             │  ← 容器引擎
├────────────────────────────────────┤
│          Host OS (Linux)           │  ← 唯一的OS
└────────────────────────────────────┘
资源开销：1个OS + 轻量级容器 = 轻量级
```

**核心优势**：
- **启动速度**：容器启动时间以秒计（vs 虚拟机的分钟级）
- **资源占用**：容器仅包含应用及其依赖（MB级 vs GB级）
- **一致性保证**：容器镜像是不可变的，"在我机器上能跑"问题彻底解决

### 三个核心概念

#### 1. 镜像（Image）：静态的"虚拟机模板"

**定义**：镜像是一个只读的文件系统快照，包含应用运行所需的所有文件（代码、运行时、依赖、配置）。

**类比**：
- **网络设备**：相当于交换机的IOS镜像文件
- **虚拟化**：相当于VMware的OVA模板
- **软件**：相当于Windows的ISO安装镜像

**技术细节**：镜像采用**分层存储**（Union File System）：

```
镜像分层示例：
┌─────────────────────────────┐
│ Layer 4: 应用代码 (10MB)    │  ← 你的server.js
├─────────────────────────────┤
│ Layer 3: npm依赖 (50MB)     │  ← node_modules
├─────────────────────────────┤
│ Layer 2: Node.js (80MB)     │  ← Node运行时
├─────────────────────────────┤
│ Layer 1: Alpine Linux (5MB) │  ← 基础操作系统
└─────────────────────────────┘
总大小：145MB（但只有修改的层会重新下载）
```

**为什么分层？**
- **缓存复用**：如果Layer 1-3没变，只重新构建Layer 4
- **存储高效**：多个容器可以共享相同的底层

#### 2. 容器（Container）：运行中的"虚拟机实例"

**定义**：容器是镜像的运行时实例，它在镜像之上添加了一个**可写层**（Writable Layer）。

**类比**：
- **网络设备**：相当于加载了IOS镜像后运行中的路由器实例
- **虚拟化**：相当于从模板创建的正在运行的VM
- **进程**：本质上是一个被隔离的进程组

**关键特性**：
- **隔离性**：每个容器有独立的文件系统、网络栈、进程空间
- **临时性**：容器删除后，写入的数据会丢失（除非使用Volume持久化）
- **轻量性**：一台服务器可以运行数百个容器

#### 3. 仓库（Registry）：镜像的"集中存储系统"

**定义**：存储和分发Docker镜像的中心化服务。

**类比**：
- **软件**：相当于npm仓库、Maven中央仓库
- **网络**：相当于思科的Software Download中心

**公共仓库**：
- **Docker Hub**：官方公共仓库（`docker pull nginx` 从这里下载）
- **阿里云/腾讯云镜像站**：国内加速镜像

### Docker Compose：多容器编排工具

#### 问题场景
现代应用通常是**多组件架构**：
- 陆家花园项目 = Node.js应用 + Nginx反向代理 + SQLite数据库（通过Volume挂载）

**手动管理的痛点**：
```bash
# 手动启动需要记住一堆参数
docker run -d -p 3000:3000 --name app \
  -e NODE_ENV=production \
  -v ./data:/app/data \
  lugarden-app

docker run -d -p 80:80 --name nginx \
  --link app:app \
  -v ./nginx.conf:/etc/nginx/nginx.conf \
  nginx:alpine
```

#### Compose的解决方案

**一个配置文件管理所有容器**：

```yaml
# docker-compose.yml
services:
  app:
    build: ./application
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
  
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    depends_on: [app]
```

**一条命令启动全部**：
```bash
docker-compose up -d
```

**类比**：
- **网络**：相当于Ansible/Puppet自动化配置管理工具
- **虚拟化**：相当于vSphere的虚拟机编排

### 为什么需要Docker？

#### 对陆家花园项目的具体价值

| 痛点 | Docker解决方案 |
|------|---------------|
| **环境不一致** "在我电脑能跑" | 镜像封装所有依赖，环境完全一致 |
| **部署复杂** 需要手动安装Node.js、配置Nginx、设置环境变量 | `docker-compose up`一键部署 |
| **资源隔离不足** 多个项目的npm包冲突 | 每个项目独立容器，互不干扰 |
| **服务器迁移困难** 换服务器需要重新配置环境 | 导出镜像，新服务器直接运行 |
| **版本回滚风险高** 代码回滚后环境可能不匹配 | 镜像版本管理，代码和环境原子回滚 |
| **生产环境调试难** 无法复现线上环境 | 本地用完全相同的容器测试 |

---

## 第二部分：分析陆家花园代码

> **方法论**：在编写Dockerfile之前，必须通过逆向工程理解项目的运行依赖。我们将从配置文件中提取所有隐含的需求。

### 项目结构分析

```
lugarden_universal/application/  ← 我们的容器化目标
├── package.json        # npm依赖声明（关键）
├── server.js          # 应用入口（关键）
├── prisma/
│   └── schema.prisma  # 数据库定义（关键）
├── data/
│   └── lugarden.db    # SQLite数据库文件（需持久化）
└── src/
    ├── routes/        # 路由模块
    └── middlewares/   # 中间件
```

### 从package.json推导环境需求

**文件位置**：`lugarden_universal/application/package.json`

**关键信息提取**：

```json
{
  "type": "module",              // ← ES Module模式，需要Node.js >= 14
  "main": "server.js",
  "scripts": {
    "start": "node server.js",   // ← 启动命令
    "db:generate": "prisma generate" // ← Prisma需要生成客户端
  },
  "dependencies": {
    "@prisma/client": "^6.13.0", // ← 数据库ORM
    "express": "^4.18.2",        // ← Web框架
    "dotenv": "^16.0.3"          // ← 环境变量管理
  },
  "devDependencies": {
    "prisma": "^6.13.0"          // ← Prisma CLI工具
  }
}
```

**推导出的需求**：

1. **Node.js版本**：
   - `"type": "module"` 需要 Node.js >= 14
   - Prisma 6.x 官方推荐 Node.js 18+
   - **结论**：使用 `node:20-alpine` 镜像（Alpine = 轻量级Linux，5MB基础大小）

2. **依赖安装**：
   - 生产环境只需 `dependencies`，不需要 `devDependencies`
   - 但Prisma的 `prisma generate` 需要 `prisma` CLI（devDependency）
   - **结论**：构建时需要完整依赖，运行时只保留生产依赖

3. **Prisma工作流**：
   ```bash
   npm install           # 安装依赖
   prisma generate       # 生成Prisma Client
   node server.js        # 启动应用
   ```

### 从prisma/schema.prisma推导数据库需求

**文件位置**：`lugarden_universal/application/prisma/schema.prisma`

**关键配置**：

```prisma
datasource db {
  provider = "sqlite"                    // ← 数据库类型：SQLite
  url      = env("DATABASE_URL")         // ← 从环境变量读取路径
}

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"       // ← 生成的代码位置
}
```

**推导出的需求**：

1. **数据库文件位置**：
   - 环境变量 `DATABASE_URL` 必须指向SQLite文件路径
   - 示例：`DATABASE_URL=file:/app/data/lugarden.db`

2. **持久化需求**：
   - SQLite是文件数据库，`lugarden.db` 必须持久化
   - **解决方案**：使用Docker Volume将 `./data` 目录挂载到容器的 `/app/data`

3. **权限需求**：
   - SQLite文件需要读写权限
   - 容器内的Node.js进程必须能够写入 `/app/data/`

### 从server.js推导启动需求

**文件位置**：`lugarden_universal/application/server.js`

**关键逻辑分析**：

```javascript
// 第1行-36行：环境变量加载
dotenv.config({ path: '.env.local' });  // ← 优先加载.env.local
dotenv.config();                         // ← 其次加载.env

// 第46行：API密钥初始化
const genAI = new GoogleGenerativeAI(process.env.API_KEY); // ← 必需环境变量

// 第50行：端口配置
const PORT = process.env.PORT || 3000;   // ← 默认3000端口

// 第56-60行：前端切换逻辑
const USE_VUE_FRONTEND = process.env.USE_VUE_FRONTEND !== 'false';
const VUE_DIST_DIR = path.join(__dirname, '..', 'frontend_vue', 'dist');

// 第68-79行：会话管理
app.use(session({
  secret: process.env.SESSION_SECRET || 'replace-me-in-env', // ← 安全敏感
  cookie: { secure: 'auto', httpOnly: true }
}));
```

**推导出的需求**：

1. **必需环境变量**：
   ```bash
   API_KEY=<Google Gemini API密钥>           # 用于AI解诗功能
   SESSION_SECRET=<随机生成的安全密钥>       # 用于会话加密
   DATABASE_URL=file:/app/data/lugarden.db   # SQLite路径
   ```

2. **可选环境变量**：
   ```bash
   PORT=3000                      # 监听端口
   NODE_ENV=production            # 运行模式
   USE_VUE_FRONTEND=true          # 前端类型
   ADMIN_PASSWORD=<管理密码>      # 后台登录密码
   ```

3. **文件系统依赖**：
   - 需要访问 `../frontend_vue/dist/`（Vue构建产物）
   - 需要访问 `../poeject_maoxiaodou_universe/`（数据源1）
   - 需要访问 `../poeject_zhou_spring_autumn/`（数据源2）

### 从nginx.conf推导反向代理需求

**文件位置**：`nginx/nginx.conf`

**关键配置分析**：

```nginx
# 第57-60行：上游服务器定义
upstream app_upstream {
    server app:3000 max_fails=3 fail_timeout=30s;
    # ↑ 这里的"app"是Docker Compose中的服务名
    keepalive 32;
}

# 第83-99行：API代理规则
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://app_upstream;           # ← 反向代理到Node.js应用
    proxy_set_header Host $host;
    proxy_connect_timeout 5s;                 # ← 5秒连接超时
    proxy_read_timeout 10s;                   # ← 10秒读取超时
}

# 第108-112行：SPA路由支持
location / {
    try_files $uri $uri/ /index.html;         # ← Vue Router的history模式
}
```

**推导出的需求**：

1. **服务依赖关系**：
   - Nginx容器必须能够访问Node.js容器
   - Docker Compose会自动创建 `app` 主机名解析到Node.js容器

2. **网络配置**：
   - Nginx监听80端口（HTTP）和443端口（HTTPS）
   - Nginx将 `/api/*` 请求转发到 `http://app:3000`
   - 静态文件（JS/CSS）直接由Nginx提供

3. **Volume需求**：
   - Nginx需要访问Vue构建产物（`frontend_vue/dist/`）
   - 挂载为只读（`:ro`），避免Nginx误修改文件

### 综合需求汇总

| 需求类型 | 具体需求 | 实现方式 |
|---------|---------|---------|
| **基础镜像** | Node.js 20 + Alpine Linux | `FROM node:20-alpine` |
| **系统依赖** | SQLite运行库 | `apk add sqlite` |
| **应用依赖** | npm packages | `npm ci --production` |
| **数据持久化** | SQLite数据库文件 | Docker Volume挂载 `./data:/app/data` |
| **静态文件** | Vue构建产物 + 数据源目录 | 多个Volume挂载（只读） |
| **环境变量** | API密钥、数据库路径等 | docker-compose.yml的`environment` |
| **网络通信** | Nginx ↔ Node.js | Docker Compose网络 |
| **启动顺序** | Nginx必须等Node.js健康检查通过 | `depends_on`的`service_healthy`条件 |

---

## 第三部分：设计Dockerfile（逐步推导）

> **设计哲学**：Dockerfile是一个**声明式的构建脚本**，每一条指令都会创建一个新的镜像层。我们的目标是构建一个**最小化、单一职责、生产级**的镜像。

### 选择基础镜像

#### 候选方案对比

| 镜像 | 大小 | 优势 | 劣势 |
|------|------|------|------|
| `node:20` | ~1GB | 完整系统工具（bash/curl/git） | 臃肿，安全攻击面大 |
| `node:20-slim` | ~200MB | 精简但保留常用工具 | 仍然偏大 |
| `node:20-alpine` | ~120MB | 极致轻量（基于Alpine Linux） | 某些C扩展兼容性差 |

**选择**：`node:20-alpine`

**理由**：
1. **体积优势**：减少90%镜像大小，加快拉取和启动速度
2. **安全性**：Alpine使用musl libc，攻击面更小
3. **兼容性验证**：Prisma官方支持Alpine，项目无C扩展依赖

### 安装依赖

#### 问题：为什么Prisma需要特殊处理？

Prisma的工作流程：

```
安装阶段            生成阶段              运行阶段
┌─────────────┐   ┌──────────────┐    ┌──────────────┐
│ npm install │──>│ prisma       │───>│ node server  │
│             │   │ generate     │    │ (使用生成的  │
│ 安装prisma  │   │              │    │  Prisma      │
│ CLI工具     │   │ 生成         │    │  Client)     │
│             │   │ @prisma/     │    │              │
│             │   │ client       │    │              │
└─────────────┘   └──────────────┘    └──────────────┘
     ↓                   ↓                   ↓
需要devDeps        需要schema.prisma    只需生成的代码
```

**策略**：
1. 构建时安装全部依赖（含dev）用于生成Prisma Client
2. 生成完成后删除devDependencies，保留生产依赖

### 优化构建缓存

#### Docker的缓存机制

Docker会缓存每一层，只有当该层的**输入发生变化**时才重新构建：

```dockerfile
FROM node:20-alpine
WORKDIR /app

# ❌ 错误做法：先复制所有文件
COPY . .
RUN npm install
# 问题：代码任何改动都会导致npm install重新执行

# ✅ 正确做法：先复制依赖声明文件
COPY package*.json ./
RUN npm install       # 只有依赖变化时才重新执行
COPY . .             # 代码改动不影响上层缓存
```

**缓存规则**：
1. **依赖层**（package.json/package-lock.json）：变动频率低，应单独一层
2. **代码层**（server.js等）：变动频率高，放在最后

### 完整Dockerfile + 详细注释

**文件位置**：`lugarden_universal/application/Dockerfile`

```dockerfile
# ============================================
# 第一阶段：构建阶段（Builder Stage）
# 目标：安装所有依赖并生成Prisma Client
# ============================================
FROM node:20-alpine AS builder

# 设置工作目录（容器内的/app目录）
WORKDIR /app

# 安装系统级依赖
# - sqlite：SQLite运行库（Prisma需要）
# - openssl：加密库（Prisma需要）
# - bash：方便调试（可选，生产环境可移除）
RUN apk add --no-cache sqlite openssl bash

# 优化1：先复制依赖声明文件，利用Docker缓存
# 只有package.json或package-lock.json变化时才重新执行npm install
COPY package*.json ./

# 安装完整依赖（包括devDependencies）
# --frozen-lockfile：确保安装的版本与package-lock.json完全一致
RUN npm ci --include=dev

# 复制Prisma Schema文件
COPY prisma ./prisma

# 生成Prisma Client
# 这会在 ../generated/prisma/ 目录生成代码
RUN npx prisma generate

# 复制应用源代码
COPY . .

# ============================================
# 第二阶段：生产运行阶段（Production Stage）
# 目标：创建最小化的生产镜像
# ============================================
FROM node:20-alpine

# 创建非root用户（安全最佳实践）
# - node用户由node镜像预创建
# - UID 1000是Linux标准的第一个普通用户ID
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# 从builder阶段复制系统依赖
RUN apk add --no-cache sqlite openssl

# 从builder阶段复制node_modules（仅生产依赖）
# 技巧：先复制package.json，然后npm prune删除devDependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 复制生成的Prisma Client
COPY --from=builder /app/generated ./generated

# 复制应用代码
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# 创建数据目录并设置权限
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口（文档作用，实际端口由docker-compose映射）
EXPOSE 3000

# 健康检查：每30秒检查一次/api/health接口
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动命令
CMD ["node", "server.js"]
```

### 关键设计决策解释

#### 1. 多阶段构建（Multi-stage Build）

**问题**：
- 构建时需要devDependencies（体积~100MB）
- 运行时只需生产依赖（体积~50MB）

**解决方案**：
```
builder阶段：安装全部依赖 + 生成Prisma Client
             ↓
production阶段：只复制必要文件（node_modules + 生成的代码 + 应用代码）
```

**效果**：最终镜像体积减少50MB+

#### 2. 非root用户运行

**安全原则**：容器内的进程不应以root身份运行

**攻击场景**：
```
假设攻击者通过代码注入获得容器内shell：
- 以root运行 → 攻击者可以修改/etc/passwd，安装后门
- 以nodejs运行 → 攻击者权限受限，无法提权
```

**实现**：
```dockerfile
USER nodejs  # 切换到UID 1000的nodejs用户
```

#### 3. 健康检查（HEALTHCHECK）

**作用**：
- Docker会定期执行健康检查命令
- 如果连续3次失败（retries=3），标记容器为`unhealthy`
- Nginx的`depends_on.service_healthy`会等待此状态为`healthy`

**检查逻辑**：
```javascript
require('http').get('http://localhost:3000/api/health', (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1)  // 200返回0（成功），否则返回1（失败）
})
```

---

## 第四部分：设计docker-compose.yml（逐步推导）

> **设计哲学**：docker-compose.yml是**多容器应用的编排声明**，它定义了服务之间的依赖、网络拓扑和资源约束。我们将从最简单的单服务配置逐步推导到完整的三服务架构。

### 服务架构

#### 陆家花园的服务拓扑

```
外部用户
   ↓
┌──────────────────────────────────────┐
│  Nginx容器 (lugarden-nginx)          │
│  - 端口: 80/443                      │
│  - 职责: 静态文件服务 + 反向代理     │
└───────────┬──────────────────────────┘
            │ http://app:3000/api/*
            ↓
┌──────────────────────────────────────┐
│  Node.js容器 (lugarden-app)          │
│  - 端口: 3000（仅内网访问）          │
│  - 职责: API服务 + 业务逻辑          │
└───────────┬──────────────────────────┘
            │
            ↓
┌──────────────────────────────────────┐
│  SQLite数据库文件                     │
│  - 路径: ./data/lugarden.db          │
│  - 通过Volume持久化                   │
└──────────────────────────────────────┘

辅助服务（一次性构建任务）：
┌──────────────────────────────────────┐
│  Vue构建容器 (lugarden-frontend-vue)  │
│  - 职责: npm run build               │
│  - 产物: ./frontend_vue/dist/        │
│  - 运行后自动退出                     │
└──────────────────────────────────────┘
```

**设计要点**：
1. **网络隔离**：Node.js的3000端口不对外暴露，只能通过Nginx访问
2. **依赖顺序**：Nginx必须等Node.js健康检查通过后才启动
3. **数据持久化**：数据库、Vue构建产物、配置文件都通过Volume挂载

### app服务配置详解

#### 最小化配置（第一版）

```yaml
services:
  app:
    build: ./lugarden_universal/application  # Dockerfile所在目录
    container_name: lugarden-app
    ports:
      - "3000:3000"  # 宿主机端口:容器端口
```

**问题**：
- ❌ 没有环境变量，应用无法启动
- ❌ 没有Volume，数据库会丢失
- ❌ 容器重启策略缺失

#### 添加环境变量（第二版）

```yaml
services:
  app:
    build: ./lugarden_universal/application
    container_name: lugarden-app
    ports:
      - "3000:3000"
    environment:                              # ← 新增
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:/app/data/lugarden.db
      - SESSION_SECRET=${SESSION_SECRET:-default-secret}  # ← 从宿主机环境变量读取
      - API_KEY=${API_KEY}
```

**环境变量语法解释**：
- `VAR=value`：硬编码值
- `VAR=${HOST_VAR}`：从宿主机环境变量读取
- `VAR=${HOST_VAR:-default}`：如果宿主机未设置，使用默认值

**安全考虑**：
- `SESSION_SECRET`不应硬编码在docker-compose.yml中
- 应在宿主机创建`.env`文件：
  ```bash
  # .env
  SESSION_SECRET=your-super-secure-random-key-here
  API_KEY=your-google-gemini-api-key
  ```
- docker-compose会自动读取同目录下的`.env`文件

#### 添加Volume持久化（第三版）

```yaml
services:
  app:
    build: ./lugarden_universal/application
    container_name: lugarden-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/lugarden.db
    volumes:                                   # ← 新增
      - ./lugarden_universal/application/data:/app/data
      # 语法：宿主机路径:容器路径[:权限]
      
      - ./lugarden_universal/frontend_vue/dist:/frontend_vue/dist:ro
      # :ro = read-only（只读），防止容器误修改
      
      - ./poeject_maoxiaodou_universe:/poeject_maoxiaodou_universe:ro
      - ./poeject_zhou_spring_autumn:/poeject_zhou_spring_autumn:ro
```

**Volume类型对比**：

| 类型 | 语法示例 | 特点 | 适用场景 |
|------|---------|------|---------|
| **命名Volume** | `db_data:/app/data` | Docker管理，自动备份 | 数据库、日志等 |
| **绑定挂载** | `./data:/app/data` | 宿主机路径直接挂载 | 配置文件、开发调试 |
| **临时Volume** | `/app/temp` | 容器删除即消失 | 临时缓存 |

**陆家花园选择绑定挂载的原因**：
- 数据库文件需要方便备份（直接复制`./data/`目录）
- 数据源目录（诗歌文件）在git仓库中，应使用绑定挂载

#### 添加健康检查和重启策略（完整版）

```yaml
services:
  app:
    build:
      context: ./lugarden_universal/application
      dockerfile: Dockerfile
    container_name: lugarden-app
    restart: unless-stopped              # ← 重启策略
    ports:
      - "127.0.0.1:3000:3000"            # ← 安全优化：只监听本地回环
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:/app/data/lugarden.db
      - SESSION_SECRET=${SESSION_SECRET:-your-super-secure-session-secret-key-here-change-this-in-production}
      - API_KEY=${API_KEY}
    volumes:
      - ./lugarden_universal/application/data:/app/data
      - ./lugarden_universal/frontend_vue/dist:/frontend_vue/dist:ro
      - ./poeject_maoxiaodou_universe:/poeject_maoxiaodou_universe:ro
      - ./poeject_zhou_spring_autumn:/poeject_zhou_spring_autumn:ro
    healthcheck:                          # ← 健康检查（与Dockerfile中一致）
      test: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })\""]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:                             # ← 加入自定义网络
      - web
    deploy:                               # ← 资源限制
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**配置项深度解析**：

1. **restart策略**：
   - `no`：从不自动重启（默认）
   - `always`：总是重启，即使手动停止
   - `on-failure`：仅当退出码非0时重启
   - `unless-stopped`：除非手动stop，否则总是重启（**推荐**）

2. **端口绑定的安全性**：
   ```yaml
   ports:
     - "3000:3000"              # ❌ 暴露到所有网络接口（0.0.0.0:3000）
     - "127.0.0.1:3000:3000"    # ✅ 仅暴露到本地回环（只能localhost访问）
   ```
   **原理**：陆家花园由Nginx提供公网访问，Node.js不应直接暴露

3. **内存限制**：
   - `limits.memory=512M`：硬限制，超过会被OOM killer杀死
   - `reservations.memory=256M`：保证至少分配256MB

### nginx服务配置详解

#### 基础配置（第一版）

```yaml
services:
  nginx:
    image: nginx:1.27-alpine      # 使用官方轻量级镜像
    container_name: lugarden-nginx
    ports:
      - "80:80"                   # HTTP
      - "443:443"                 # HTTPS（需配置SSL证书）
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./lugarden_universal/frontend_vue/dist:/usr/share/nginx/html:ro
```

#### 添加依赖关系（完整版）

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    container_name: lugarden-nginx
    restart: unless-stopped
    depends_on:                   # ← 依赖声明
      app:
        condition: service_healthy  # ← 等待app健康检查通过
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./lugarden_universal/frontend_vue/dist:/usr/share/nginx/html:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro  # SSL证书目录
    networks:
      - web
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
```

**depends_on的两种模式**：

```yaml
# 模式1：简单依赖（仅保证启动顺序）
depends_on:
  - app
# 问题：Nginx可能在Node.js完全启动前就开始转发请求，导致502错误

# 模式2：健康检查依赖（等待服务ready）
depends_on:
  app:
    condition: service_healthy
# 优势：确保Node.js的/api/health返回200后才启动Nginx
```

### frontend_vue服务配置详解

#### 服务设计思路

**问题**：Vue项目需要构建吗？

```
开发阶段（npm run dev）：
- Vite开发服务器 → 实时编译 → 无需构建

生产阶段（npm run build）：
- 生成优化后的静态文件 → dist/目录 → Nginx提供服务
```

**Docker中的挑战**：
1. 本地已有`dist/`目录 → 直接用即可
2. 部署到新服务器 → `dist/`不存在 → 需要构建

**解决方案**：使用一次性容器执行构建任务

#### 完整配置

```yaml
services:
  frontend_vue:
    image: node:20-alpine           # 使用官方Node镜像（无需自定义Dockerfile）
    container_name: lugarden-frontend-vue
    working_dir: /app
    restart: "no"                   # ← 构建任务完成后不重启
    environment:
      - NPM_CONFIG_PRODUCTION=false # ← 需要安装devDependencies
    volumes:
      - ./lugarden_universal/frontend_vue:/app
      - ./lugarden_universal/frontend_vue/node_modules:/app/node_modules
    command: sh -lc "npm ci --include=dev && npm run build"
    # 命令拆解：
    # sh -lc：使用login shell执行（加载完整环境变量）
    # npm ci --include=dev：安装全部依赖（devDependencies包含构建工具）
    # npm run build：执行构建（生成dist/目录）
    networks:
      - web
```

**为什么使用`npm ci`而非`npm install`？**

| 命令 | 行为 | 适用场景 |
|------|------|---------|
| `npm install` | 根据package.json安装，可能更新package-lock.json | 本地开发 |
| `npm ci` | 严格按照package-lock.json安装，不修改任何文件 | CI/CD、生产构建 |

**容器生命周期**：
```
启动 → npm ci（2-3分钟）→ npm run build（1-2分钟）→ 退出（exit 0）
       ↓                      ↓
   安装依赖到             生成./dist/目录
   node_modules/         （Nginx和app通过Volume访问）
```

### 网络配置

#### 默认网络 vs 自定义网络

```yaml
# docker-compose默认行为（无networks配置）：
# - 自动创建名为"项目名_default"的bridge网络
# - 所有服务加入此网络
# - 服务间可通过服务名互相访问（DNS自动解析）

# 自定义网络（显式配置）：
networks:
  web:
    driver: bridge
```

**为什么需要自定义？**
1. **明确性**：显式声明服务间的网络关系
2. **扩展性**：未来可能添加多个网络（如frontend/backend分离）
3. **调试友好**：`docker network ls`可以看到清晰的网络名

**网络类型对比**：

| Driver | 特点 | 适用场景 |
|--------|------|---------|
| `bridge` | 同主机容器间通信 | 单机部署（陆家花园） |
| `overlay` | 跨主机容器通信 | Docker Swarm集群 |
| `host` | 容器直接使用宿主机网络 | 高性能网络应用 |

### 完整docker-compose.yml + 详细注释

**文件位置**：项目根目录 `docker-compose.yml`

```yaml
# ============================================
# 陆家花园 Docker Compose 配置
# 版本：3.9（Compose文件格式版本）
# ============================================
version: "3.9"

services:
  # ==========================================
  # 服务1: Node.js后端应用
  # ==========================================
  app:
    build: 
      context: ./lugarden_universal/application
      dockerfile: Dockerfile
    container_name: lugarden-app
    restart: unless-stopped
    
    # 端口映射（仅本地回环，不对外暴露）
    ports:
      - "127.0.0.1:3000:3000"
    
    # 环境变量
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:/app/data/lugarden.db
      
      # 安全相关（从宿主机.env文件读取，必须配置）
      - SESSION_SECRET=${SESSION_SECRET:?ERROR: SESSION_SECRET未设置}
      - API_KEY=${API_KEY:?ERROR: API_KEY未设置}
      
      # 功能开关
      - CORS_ORIGIN=*
      - RATE_LIMIT_WINDOW_MS=900000
      - RATE_LIMIT_MAX_REQUESTS=100
      - LOG_LEVEL=info
      - HEALTH_CHECK_ENABLED=true
      - USE_VUE_FRONTEND=true
    
    # 数据卷挂载
    volumes:
      # 数据库文件（读写）
      - ./lugarden_universal/application/data:/app/data
      
      # Vue构建产物（只读）
      - ./lugarden_universal/frontend_vue/dist:/frontend_vue/dist:ro
      
      # 数据源（只读）
      - ./poeject_maoxiaodou_universe:/poeject_maoxiaodou_universe:ro
      - ./poeject_zhou_spring_autumn:/poeject_zhou_spring_autumn:ro
    
    # 健康检查
    healthcheck:
      test: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })\""]
      interval: 30s        # 每30秒检查一次
      timeout: 10s         # 单次检查超时时间
      retries: 3           # 连续3次失败才标记为unhealthy
      start_period: 40s    # 容器启动后40秒内的失败不计入retries
    
    # 网络配置
    networks:
      - web
    
    # 资源限制
    deploy:
      resources:
        limits:
          memory: 512M     # 最大内存512MB
        reservations:
          memory: 256M     # 保证至少256MB

  # ==========================================
  # 服务2: Nginx反向代理
  # ==========================================
  nginx:
    image: nginx:1.27-alpine
    container_name: lugarden-nginx
    restart: unless-stopped
    
    # 依赖声明：等待app服务健康检查通过
    depends_on:
      app:
        condition: service_healthy
    
    # 端口映射（对外暴露）
    ports:
      - "80:80"      # HTTP
      - "443:443"    # HTTPS
    
    # 数据卷挂载
    volumes:
      # Nginx配置文件（只读）
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      
      # Vue静态文件（只读）
      - ./lugarden_universal/frontend_vue/dist:/usr/share/nginx/html:ro
      
      # SSL证书（只读，如需HTTPS）
      - ./nginx/ssl:/etc/nginx/ssl:ro
    
    # 网络配置
    networks:
      - web
    
    # 资源限制
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M

  # ==========================================
  # 服务3: Vue前端构建（一次性任务）
  # ==========================================
  frontend_vue:
    image: node:20-alpine
    container_name: lugarden-frontend-vue
    working_dir: /app
    restart: "no"
    
    # 环境变量
    environment:
      - NPM_CONFIG_PRODUCTION=false  # 需要devDependencies
    
    # 数据卷挂载
    volumes:
      # 整个前端项目目录
      - ./lugarden_universal/frontend_vue:/app
      
      # node_modules目录（避免与宿主机冲突）
      - ./lugarden_universal/frontend_vue/node_modules:/app/node_modules
    
    # 构建命令
    command: sh -lc "npm ci --include=dev && npm run build"
    # 说明：
    # - npm ci: 严格按照package-lock.json安装依赖
    # - npm run build: 执行vite build，生成dist/目录
    # - 构建完成后容器自动退出
    
    # 网络配置（可选，构建任务不需要网络通信）
    networks:
      - web

# ==========================================
# 网络配置
# ==========================================
networks:
  web:
    driver: bridge
    # bridge网络特点：
    # 1. 同一网络内的容器可通过服务名互相访问
    # 2. Docker自动提供DNS解析（nginx容器内可ping app）
    # 3. 容器与宿主机网络隔离，需通过端口映射暴露服务
```

### 关键设计决策总结

| 设计点 | 决策 | 理由 |
|--------|------|------|
| **app端口绑定** | `127.0.0.1:3000:3000` | 安全：Node.js不直接暴露公网 |
| **nginx依赖** | `service_healthy` | 可靠性：避免502错误 |
| **Volume权限** | `:ro`（只读） | 安全：防止容器误修改源文件 |
| **重启策略** | `unless-stopped` | 高可用：自动恢复，但尊重手动stop |
| **内存限制** | app=512M, nginx=128M | 资源管理：防止单容器耗尽内存 |
| **健康检查** | 30s间隔，3次重试 | 平衡：及时发现故障，避免误判 |
| **Vue构建** | 独立容器一次性任务 | 解耦：构建逻辑与运行时分离 |

---

## 第五部分：实战部署（完整流程）

> **目标**：将陆家花园项目从代码仓库完整部署到海外VPS，实现生产级运行。本章节提供可直接执行的命令和完整的故障预防措施。

### 服务器准备

#### 系统要求

| 项目 | 最低配置 | 推荐配置 | 说明 |
|------|---------|---------|------|
| **CPU** | 1核 | 2核+ | 构建阶段CPU密集 |
| **内存** | 1GB | 2GB+ | Docker需要512MB+Node.js 512MB+Nginx 128MB |
| **磁盘** | 10GB | 20GB+ | Docker镜像~2GB，数据库<100MB，日志预留 |
| **系统** | Ubuntu 20.04+ / Debian 11+ / CentOS 8+ | Ubuntu 22.04 LTS | 推荐长期支持版本 |
| **网络** | 公网IP + 开放80/443端口 | - | 需要DNS解析 |

#### 安装Docker和Docker Compose

**方法1：官方安装脚本（推荐，适用于Ubuntu/Debian）**

```bash
# 1. 更新系统包索引
sudo apt update && sudo apt upgrade -y

# 2. 安装依赖
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. 设置Docker稳定版仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. 验证安装
docker --version                # 应输出：Docker version 24.x.x
docker compose version          # 应输出：Docker Compose version v2.x.x

# 7. 将当前用户加入docker组（避免每次sudo）
sudo usermod -aG docker $USER
# 注意：需要注销并重新登录才能生效

# 8. 测试Docker
docker run hello-world          # 应输出：Hello from Docker!
```

**方法2：国内服务器（使用阿里云镜像加速）**

```bash
# 安装Docker（同上述步骤1-6）

# 配置镜像加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 重启Docker服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证镜像加速器
docker info | grep "Registry Mirrors" -A 3
```

#### 防火墙配置

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp          # HTTP
sudo ufw allow 443/tcp         # HTTPS
sudo ufw allow 22/tcp          # SSH（确保不被锁定）
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 创建配置文件

#### 第1步：克隆项目代码

```bash
# 切换到合适的工作目录
cd ~

# 克隆仓库（替换为你的实际仓库地址）
git clone https://github.com/your-username/lu_garden_lab.git
cd lu_garden_lab

# 验证目录结构
ls -la
# 应看到：docker-compose.yml, lugarden_universal/, nginx/, poeject_*等
```

#### 第2步：创建Dockerfile

```bash
# 切换到应用目录
cd lugarden_universal/application

# 创建Dockerfile（将第三部分的完整Dockerfile复制到此）
cat > Dockerfile << 'EOF'
# ============================================
# 第一阶段：构建阶段（Builder Stage）
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache sqlite openssl bash

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# ============================================
# 第二阶段：生产运行阶段
# ============================================
FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

RUN apk add --no-cache sqlite openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/data && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "server.js"]
EOF

# 返回项目根目录
cd ../..
```

#### 第3步：创建环境变量文件

```bash
# 在项目根目录创建.env文件
cat > .env << 'EOF'
# 陆家花园环境变量配置

# === 安全配置 ===
# 会话密钥（务必替换为随机字符串，可用命令生成：openssl rand -base64 32）
SESSION_SECRET=请替换为至少32字符的随机字符串

# 管理员密码
ADMIN_PASSWORD=请设置一个强密码

# === API配置 ===
# Google Gemini API密钥（从https://makersuite.google.com/app/apikey获取）
API_KEY=请替换为你的Gemini API密钥

# === 可选配置 ===
# 如果服务器在中国大陆，可能需要配置代理
# HTTPS_PROXY=http://your-proxy-server:port
EOF

# 生成安全密钥（自动化脚本）
echo "正在生成安全密钥..."
SESSION_SECRET=$(openssl rand -base64 32)
sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=${SESSION_SECRET}|" .env

echo "========================================="
echo "环境变量文件已创建：.env"
echo "请手动编辑以下配置："
echo "1. ADMIN_PASSWORD（管理员密码）"
echo "2. API_KEY（Gemini API密钥）"
echo "========================================="

# 安全提示：设置文件权限（仅当前用户可读写）
chmod 600 .env
```

#### 第4步：创建必要的目录

```bash
# 创建数据目录
mkdir -p lugarden_universal/application/data

# 创建Nginx SSL目录（如需HTTPS）
mkdir -p nginx/ssl

# 验证目录结构
tree -L 2 -d
# 应输出：
# .
# ├── lugarden_universal
# │   ├── application
# │   └── frontend_vue
# ├── nginx
# │   └── ssl
# ├── poeject_maoxiaodou_universe
# └── poeject_zhou_spring_autumn
```

#### 第5步：初始化数据库

```bash
# 切换到应用目录
cd lugarden_universal/application

# 临时安装依赖（仅首次需要）
npm ci

# 运行Prisma迁移（创建数据库表结构）
npx prisma migrate deploy

# 如果需要填充初始数据（根据你的项目具体情况）
# node scripts/seed.js

# 验证数据库文件
ls -lh data/lugarden.db
# 应输出：lugarden.db文件（大小根据实际数据而定）

# 返回项目根目录
cd ../..
```

### 构建和部署

#### 完整部署命令

```bash
# 确保在项目根目录
cd ~/lu_garden_lab

# 1. 构建镜像（首次部署或Dockerfile变更后需执行）
docker compose build --no-cache
# --no-cache：不使用缓存，确保使用最新依赖
# 预计耗时：5-10分钟（取决于网络速度）

# 2. 启动所有服务
docker compose up -d
# -d：后台运行（detached模式）
# 预计耗时：2-3分钟（包含Vue构建）

# 3. 查看启动日志
docker compose logs -f
# -f：实时跟踪日志（Ctrl+C退出）
# 正常情况应看到：
# - lugarden-frontend-vue: "build complete"
# - lugarden-app: "陆家花园已在 http://localhost:3000 盛开"
# - lugarden-nginx: "start worker process"

# 4. 检查服务状态
docker compose ps
# 应输出：
# NAME                      STATUS              PORTS
# lugarden-app              Up (healthy)        127.0.0.1:3000->3000/tcp
# lugarden-nginx            Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# lugarden-frontend-vue     Exited (0)          （构建完成后正常退出）
```

#### 启动过程解析

```
时间轴                    服务                  状态
0s    ┌─────────────────────────────────────┐
      │ docker compose up -d                │
      └─────────────────────────────────────┘
1s    ┌─────────────────────────────────────┐
      │ frontend_vue容器启动                 │
      │ → npm ci (2-3分钟)                   │
      │ → npm run build (1-2分钟)           │
      └─────────────────────────────────────┘
      ┌─────────────────────────────────────┐
      │ app容器启动                          │
      │ → 健康检查开始（40秒初始等待）      │
      └─────────────────────────────────────┘
180s  ┌─────────────────────────────────────┐
      │ frontend_vue构建完成 → Exited(0)    │
      │ dist/目录生成完毕                    │
      └─────────────────────────────────────┘
210s  ┌─────────────────────────────────────┐
      │ app容器健康检查通过 → healthy       │
      └─────────────────────────────────────┘
211s  ┌─────────────────────────────────────┐
      │ nginx容器启动（depends_on触发）     │
      │ → 立即可以处理HTTP请求               │
      └─────────────────────────────────────┘
```

### 验证和测试

#### 第1步：本地健康检查

```bash
# 检查Node.js健康状态
curl http://localhost:3000/api/health
# 应返回：{"ok":true,"db":"ready",...}

# 检查Nginx代理
curl http://localhost/api/health
# 应返回相同的JSON响应

# 检查Vue前端
curl -I http://localhost/
# 应返回：HTTP/1.1 200 OK
```

#### 第2步：浏览器测试

```bash
# 获取服务器公网IP
curl ifconfig.me
# 假设输出：123.45.67.89

# 在本地浏览器访问：http://123.45.67.89
# 应看到：陆家花园首页

# 测试后台管理：http://123.45.67.89/admin
# 应重定向到登录页面

# 测试API：http://123.45.67.89/api/health
# 应返回健康检查JSON
```

#### 第3步：功能完整性测试

**测试清单**：

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| **首页加载** | 访问根路径 | 显示宇宙门户选择 |
| **周与春秋** | 进入周宇宙 → 答题 | 正常显示诗歌和选项 |
| **AI解诗** | 完成答题 → 点击"解读"按钮 | 生成个性化解读文本 |
| **后台登录** | /admin → 输入密码 | 成功进入管理界面 |
| **数据持久化** | 后台修改数据 → 重启容器 | 数据不丢失 |

**数据持久化测试**：

```bash
# 1. 记录当前数据库大小
ls -lh lugarden_universal/application/data/lugarden.db

# 2. 重启容器
docker compose restart app

# 3. 验证数据库文件未变
ls -lh lugarden_universal/application/data/lugarden.db
# 文件大小和修改时间应保持一致

# 4. 浏览器测试
# 重新访问网站，之前的数据应仍然存在
```

#### 第4步：性能基准测试

```bash
# 安装Apache Bench（如未安装）
sudo apt install -y apache2-utils

# 测试Nginx静态文件性能
ab -n 1000 -c 10 http://localhost/
# -n 1000：总请求数
# -c 10：并发数

# 预期结果：
# - Requests per second: 500-1000+ (取决于服务器配置)
# - Failed requests: 0

# 测试API性能
ab -n 100 -c 5 http://localhost/api/health
# 预期结果：
# - Requests per second: 100-200+
# - Failed requests: 0
```

### 日志管理

#### 实时查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f app          # Node.js应用
docker compose logs -f nginx        # Nginx
docker compose logs -f frontend_vue # Vue构建（一般已退出）

# 查看最近N行日志
docker compose logs --tail=100 app

# 查看特定时间段日志
docker compose logs --since="2025-10-19T10:00:00" app
```

#### 日志分析

**正常日志示例**：

```
lugarden-app | [2025-10-19T14:30:25.123Z] 🚀 "陆家花园"已在 http://localhost:3000 盛开 (Vue前端)
lugarden-app | [2025-10-19T14:30:25.456Z] 📁 静态文件目录: /frontend_vue/dist
lugarden-nginx | 2025/10/19 14:30:26 [notice] 1#1: start worker process 8
```

**异常日志示例及处理**：

| 异常日志 | 可能原因 | 处理方案 |
|---------|---------|---------|
| `EADDRINUSE: address already in use` | 端口被占用 | `sudo lsof -i:3000` 查找占用进程并kill |
| `ECONNREFUSED` | 数据库连接失败 | 检查DATABASE_URL环境变量，确认data目录权限 |
| `EPERM: operation not permitted` | 权限问题 | 检查Volume挂载目录的所有者（应为UID 1001） |
| `502 Bad Gateway`（Nginx日志） | Node.js未启动或健康检查失败 | `docker compose logs app` 查看app日志 |

### 常用运维命令

#### 启动/停止/重启

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务（保留容器）
docker compose stop

# 停止并删除容器（保留数据和镜像）
docker compose down

# 停止并删除所有（包括数据卷，谨慎！）
docker compose down -v

# 重启特定服务
docker compose restart app
docker compose restart nginx

# 重新构建并启动
docker compose up -d --build
```

#### 更新部署

```bash
# 场景1：代码更新（不涉及依赖变更）
git pull                            # 拉取最新代码
docker compose restart app          # 重启应用（不重新构建）

# 场景2：依赖更新（package.json变更）
git pull
docker compose build app            # 重新构建镜像
docker compose up -d app            # 重新创建容器

# 场景3：配置更新（docker-compose.yml或nginx.conf变更）
git pull
docker compose up -d --force-recreate
# --force-recreate：强制重新创建容器（即使配置未变）

# 场景4：Vue前端更新
git pull
docker compose up -d frontend_vue   # 重新执行构建
docker compose restart nginx        # 重启Nginx重新加载静态文件
```

#### 备份与恢复

**数据库备份**：

```bash
# 创建备份目录
mkdir -p ~/backups

# 备份数据库文件
cp lugarden_universal/application/data/lugarden.db \
   ~/backups/lugarden_$(date +%Y%m%d_%H%M%S).db

# 自动化备份脚本（每天凌晨3点）
cat > ~/backup_lugarden.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DB_PATH=~/lu_garden_lab/lugarden_universal/application/data/lugarden.db
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/lugarden_${TIMESTAMP}.db

# 保留最近7天的备份
find $BACKUP_DIR -name "lugarden_*.db" -mtime +7 -delete

echo "[$(date)] 备份完成：lugarden_${TIMESTAMP}.db"
EOF

chmod +x ~/backup_lugarden.sh

# 添加到crontab
(crontab -l 2>/dev/null; echo "0 3 * * * ~/backup_lugarden.sh") | crontab -
```

**数据库恢复**：

```bash
# 停止应用
docker compose stop app

# 恢复备份
cp ~/backups/lugarden_20251019_030000.db \
   lugarden_universal/application/data/lugarden.db

# 重启应用
docker compose start app
```

### HTTPS配置（可选）

#### 使用Let's Encrypt免费SSL证书

```bash
# 1. 安装Certbot
sudo apt install -y certbot

# 2. 获取证书（替换example.com为你的域名）
sudo certbot certonly --standalone \
  -d lugarden.example.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# 证书文件位置：
# /etc/letsencrypt/live/lugarden.example.com/fullchain.pem
# /etc/letsencrypt/live/lugarden.example.com/privkey.pem

# 3. 复制证书到nginx/ssl目录
sudo cp /etc/letsencrypt/live/lugarden.example.com/fullchain.pem \
        nginx/ssl/
sudo cp /etc/letsencrypt/live/lugarden.example.com/privkey.pem \
        nginx/ssl/

# 4. 修改nginx.conf添加HTTPS配置
# （在http块中添加server块）
cat >> nginx/nginx.conf << 'EOF'

    # HTTPS服务器配置
    server {
        listen       443 ssl http2;
        server_name  lugarden.example.com;

        ssl_certificate      /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key  /etc/nginx/ssl/privkey.pem;

        # SSL优化配置
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 其他配置与HTTP server块相同
        root /usr/share/nginx/html;
        index index.html;

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app_upstream;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            try_files $uri $uri/ /index.html;
        }
    }

    # HTTP自动跳转HTTPS
    server {
        listen       80;
        server_name  lugarden.example.com;
        return 301 https://$server_name$request_uri;
    }
EOF

# 5. 重启Nginx
docker compose restart nginx

# 6. 测试HTTPS
curl -I https://lugarden.example.com
# 应返回：HTTP/2 200
```

#### 证书自动续期

```bash
# 添加续期任务到crontab（每月1日执行）
(crontab -l 2>/dev/null; echo "0 2 1 * * certbot renew --quiet && \
  cp /etc/letsencrypt/live/lugarden.example.com/*.pem ~/lu_garden_lab/nginx/ssl/ && \
  docker compose restart nginx") | crontab -
```

---

## 第六部分：跨版本适配指南

> **核心问题**：Docker配置是针对特定代码版本（commit `0c19db8`）设计的。当项目演进时，如何判断Docker配置是否需要更新？本章提供系统化的判断方法和应对策略。

### 判断是否需要更新Docker配置

#### 决策树

```
代码变更
   ↓
┌────────────────────────────────────────────┐
│ 第1步：检查package.json是否变更？          │
└─────────────┬──────────────────────────────┘
              ↓
         是 / 否
        /         \
    需要更新      ┌────────────────────────────────────┐
    Dockerfile    │ 第2步：检查prisma/schema.prisma？  │
                  └─────────────┬──────────────────────┘
                                ↓
                           是 / 否
                          /         \
                     需要更新      ┌──────────────────────────────┐
                     数据库迁移    │ 第3步：检查server.js环境变量？│
                                   └─────────────┬────────────────┘
                                                 ↓
                                            是 / 否
                                           /         \
                                      需要更新      ┌─────────────────────┐
                                      .env和        │ 第4步：检查nginx.conf│
                                      docker-       │ 路由规则？           │
                                      compose.yml   └─────────┬───────────┘
                                                              ↓
                                                         是 / 否
                                                        /         \
                                                  需要更新      无需更新
                                                  nginx.conf    Docker配置
```

### 常见变更应对策略

#### 变更类型1：新增npm依赖

**场景示例**：

```diff
// package.json
{
  "dependencies": {
    "express": "^4.18.2",
+   "winston": "^3.8.0"  // 新增日志库
  }
}
```

**影响分析**：
- ✅ Dockerfile无需修改（`npm ci`会自动安装新依赖）
- ✅ docker-compose.yml无需修改
- ⚠️ 需要重新构建镜像

**操作步骤**：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker compose build app

# 3. 重新创建容器
docker compose up -d app

# 4. 验证新依赖可用
docker compose exec app npm list winston
# 应输出：winston@3.8.0
```

#### 变更类型2：更新Node.js版本

**场景示例**：

```diff
// package.json
{
  "engines": {
-   "node": ">=18.0.0"
+   "node": ">=20.0.0"
  }
}
```

**影响分析**：
- ❌ Dockerfile需要修改（更新基础镜像）
- ✅ docker-compose.yml无需修改

**操作步骤**：

```bash
# 1. 修改Dockerfile
sed -i 's/FROM node:20-alpine/FROM node:22-alpine/g' \
    lugarden_universal/application/Dockerfile

# 2. 修改frontend_vue服务的镜像
sed -i 's/image: node:20-alpine/image: node:22-alpine/g' \
    docker-compose.yml

# 3. 重新构建
docker compose build --no-cache app

# 4. 重新部署
docker compose up -d
```

#### 变更类型3：数据库模式变更

**场景示例**：

```diff
// prisma/schema.prisma
model ZhouPoem {
  id String @id
  title String
+ author String?  // 新增字段
}
```

**影响分析**：
- ✅ Dockerfile无需修改（Prisma会自动生成新Client）
- ⚠️ 需要执行数据库迁移
- ⚠️ 需要重新构建镜像

**操作步骤**：

```bash
# 1. 在本地创建迁移文件
cd lugarden_universal/application
npx prisma migrate dev --name add_author_to_poem
# 这会生成 prisma/migrations/xxx_add_author_to_poem/migration.sql

# 2. 提交迁移文件到git
git add prisma/migrations/
git commit -m "feat: 为ZhouPoem添加author字段"
git push

# 3. 在服务器上拉取代码
cd ~/lu_garden_lab
git pull

# 4. 重新构建镜像
docker compose build app

# 5. 停止应用（避免数据库锁定）
docker compose stop app

# 6. 执行迁移
cd lugarden_universal/application
npx prisma migrate deploy

# 7. 重启应用
docker compose up -d app
```

**生产环境数据库迁移最佳实践**：

```bash
# 方法1：宿主机执行（推荐）
cd lugarden_universal/application
npm ci
npx prisma migrate deploy

# 方法2：容器内执行
docker compose exec app npx prisma migrate deploy

# 方法3：自动化迁移（修改Dockerfile）
# 在CMD前添加：
# RUN npx prisma migrate deploy && node server.js
# ⚠️ 注意：这会导致每次容器重启都执行迁移，仅适用于开发环境
```

#### 变更类型4：新增环境变量

**场景示例**：

```diff
// server.js
- const genAI = new GoogleGenerativeAI(process.env.API_KEY);
+ const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);  // 重命名
+ const ttsKey = process.env.TTS_API_KEY;  // 新增TTS功能
```

**影响分析**：
- ✅ Dockerfile无需修改
- ❌ docker-compose.yml需要修改（添加新环境变量）
- ❌ .env文件需要修改

**操作步骤**：

```bash
# 1. 修改docker-compose.yml
cat >> docker-compose.yml << 'EOF'
    environment:
      # 原有变量...
      - GEMINI_API_KEY=${GEMINI_API_KEY}  # 重命名
      - TTS_API_KEY=${TTS_API_KEY}        # 新增
EOF

# 2. 修改.env文件
echo "GEMINI_API_KEY=${API_KEY}" >> .env  # 使用旧值
echo "TTS_API_KEY=your-tts-key-here" >> .env

# 3. 重新创建容器（无需重新构建）
docker compose up -d --force-recreate app

# 4. 验证环境变量
docker compose exec app env | grep -E "GEMINI|TTS"
```

#### 变更类型5：新增API路由

**场景示例**：

```diff
// server.js
app.use('/api/admin', adminRouter);
app.use('/api/portal', portalRouter);
+ app.use('/api/export', exportRouter);  // 新增导出功能
```

**影响分析**：
- ✅ Dockerfile无需修改
- ⚠️ nginx.conf可能需要修改（如果需要特殊限流/缓存策略）
- ⚠️ 需要重新构建镜像

**判断nginx.conf是否需要修改**：

| 新路由特性 | 是否需要修改nginx.conf |
|-----------|----------------------|
| 普通API（与现有API行为一致） | ❌ 无需（`location /api/`已覆盖） |
| 文件下载（大文件响应） | ✅ 需要（增加`proxy_read_timeout`） |
| Webhook（长连接） | ✅ 需要（增加`proxy_buffering off`） |
| 公开API（不需要登录） | ⚠️ 可选（可添加单独的限流规则） |

**nginx.conf修改示例（大文件下载）**：

```nginx
# 在nginx.conf的http块中添加
location /api/export/ {
    limit_req zone=api burst=5 nodelay;  # 降低并发限制
    
    proxy_pass http://app_upstream;
    proxy_set_header Host $host;
    
    # 关键配置：支持大文件下载
    proxy_read_timeout 300s;      # 5分钟超时
    proxy_buffering off;          # 禁用缓冲，流式传输
    proxy_request_buffering off;  # 禁用请求缓冲
}
```

#### 变更类型6：前端路由变更

**场景示例**：

```diff
// Vue Router配置
const routes = [
  { path: '/', component: Home },
  { path: '/zhou', component: Zhou },
+ { path: '/tools/export', component: Export }  // 新增工具页面
]
```

**影响分析**：
- ✅ Dockerfile无需修改
- ✅ docker-compose.yml无需修改
- ⚠️ 需要重新构建Vue前端

**操作步骤**：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建Vue前端
docker compose up -d frontend_vue

# 3. 等待构建完成
docker compose logs -f frontend_vue
# 看到"build complete"后Ctrl+C退出

# 4. 重启Nginx（重新加载静态文件）
docker compose restart nginx

# 5. 测试新路由
curl -I http://localhost/tools/export
# 应返回：HTTP/1.1 200 OK（而非404）
```

### 版本兼容性自检清单

#### 在升级Docker配置前，逐项检查：

| 检查项 | 命令 | 预期结果 |
|--------|------|---------|
| **代码同步** | `git status` | `nothing to commit, working tree clean` |
| **依赖一致性** | `npm ci && npm run build` | 本地构建成功 |
| **数据库迁移** | `npx prisma migrate status` | `Database is up to date` |
| **环境变量完整** | `grep -v '^#' .env \| grep '=$'` | 无输出（所有变量已赋值） |
| **Docker镜像清理** | `docker images -f "dangling=true"` | 定期清理悬空镜像 |

#### 升级后验证清单：

```bash
# 1. 容器健康状态
docker compose ps | grep "Up (healthy)"
# 应看到app服务为健康状态

# 2. API可用性
curl -f http://localhost/api/health || echo "❌ 健康检查失败"

# 3. 前端路由
curl -f http://localhost/ || echo "❌ 首页加载失败"

# 4. 数据库连接
docker compose exec app node -e "
const { getPrismaClient } = require('./src/persistence/prismaClient.js');
getPrismaClient().zhouPoem.count().then(c => console.log('诗歌数量:', c));
" || echo "❌ 数据库连接失败"

# 5. 日志无错误
docker compose logs --tail=50 app | grep -i error
# 应无输出或仅有预期错误
```

### 回滚策略

#### 场景：升级后发现问题

**快速回滚流程**：

```bash
# 1. 记录当前版本
docker compose ps > /tmp/docker_state_before_rollback.txt

# 2. 停止当前服务
docker compose down

# 3. 回滚代码到上一个稳定版本
git log --oneline -5  # 查看最近5次提交
git checkout <上一个稳定版本的commit-hash>

# 4. 恢复数据库（如果有数据库迁移）
cd lugarden_universal/application
npx prisma migrate resolve --rolled-back <迁移名称>
# 然后手动运行回滚SQL：
sqlite3 data/lugarden.db < prisma/migrations/<迁移目录>/down.sql

# 5. 重新构建并启动
docker compose build --no-cache
docker compose up -d

# 6. 验证回滚成功
curl http://localhost/api/health
```

**紧急止血方案**（极端情况）：

```bash
# 如果Docker配置完全损坏，使用宿主机直接运行
cd ~/lu_garden_lab/lugarden_universal/application

# 安装依赖
npm ci

# 启动应用（临时方案）
npm start

# 应用现在运行在http://localhost:3000
# 可以暂时绕过Docker，争取修复时间
```

---

## 第七部分：故障排查与常用命令

> **目标**：提供系统化的故障诊断方法论和速查命令手册，让你能够快速定位和解决90%的常见问题。

### 故障排查方法论

#### 分层诊断模型

```
┌─────────────────────────────────────────────┐
│ 第7层：应用层（业务逻辑错误）               │  ← 检查应用日志
├─────────────────────────────────────────────┤
│ 第6层：API层（路由/中间件错误）             │  ← 检查server.js逻辑
├─────────────────────────────────────────────┤
│ 第5层：数据层（数据库查询失败）             │  ← 检查Prisma日志
├─────────────────────────────────────────────┤
│ 第4层：容器层（容器启动失败/资源不足）     │  ← docker compose ps
├─────────────────────────────────────────────┤
│ 第3层：镜像层（构建失败/依赖缺失）          │  ← docker compose build
├─────────────────────────────────────────────┤
│ 第2层：网络层（端口冲突/DNS解析失败）      │  ← netstat/dig
├─────────────────────────────────────────────┤
│ 第1层：系统层（磁盘满/内存不足）            │  ← df/free
└─────────────────────────────────────────────┘
```

**诊断顺序**：自下而上（先确认底层基础设施正常，再排查上层应用问题）

### 常见问题解决

#### 问题1：`docker compose up`卡住不动

**症状**：

```bash
$ docker compose up -d
Creating network "lu_garden_lab_web" ... done
Creating lugarden-app ... 
（长时间无响应）
```

**诊断步骤**：

```bash
# 1. 检查Docker守护进程状态
sudo systemctl status docker
# 如果显示"inactive"，重启Docker
sudo systemctl restart docker

# 2. 检查磁盘空间（Docker需要足够空间拉取镜像）
df -h /var/lib/docker
# 如果使用率>90%，清理旧镜像
docker system prune -a

# 3. 检查网络连接（拉取镜像需要网络）
ping -c 3 registry-1.docker.io
# 如果无法连接，检查防火墙或配置镜像加速器

# 4. 查看详细日志
docker compose up --verbose
# 查看具体卡在哪个步骤
```

**解决方案汇总**：

| 原因 | 解决方案 |
|------|---------|
| Docker守护进程挂起 | `sudo systemctl restart docker` |
| 磁盘空间不足 | `docker system prune -a` |
| 网络超时 | 配置镜像加速器（见第五部分） |
| 端口被占用 | `sudo lsof -i:80` 并kill占用进程 |

#### 问题2：app容器一直重启

**症状**：

```bash
$ docker compose ps
NAME          STATUS                  PORTS
lugarden-app  Restarting (1) 10s ago  
```

**诊断步骤**：

```bash
# 1. 查看容器退出原因
docker compose logs --tail=50 app
# 关注最后的错误信息

# 2. 检查容器退出码
docker inspect lugarden-app | grep -A 5 "ExitCode"
# 常见退出码：
# - 0: 正常退出（但被restart策略重启，异常）
# - 1: 应用错误（检查代码逻辑）
# - 137: 内存不足被OOM杀死（增加内存限制）
# - 139: 段错误（通常是C扩展问题）

# 3. 进入容器调试（如果容器能短暂启动）
docker compose run --rm app sh
# 手动执行启动命令，观察错误
node server.js
```

**常见错误及解决方案**：

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `EADDRINUSE: address already in use` | 端口冲突 | 修改docker-compose.yml的端口映射 |
| `Cannot find module './src/...'` | 代码未完整复制到容器 | 检查Dockerfile的COPY指令 |
| `Prisma Client未生成` | `prisma generate`未执行 | 确认Dockerfile中有`RUN npx prisma generate` |
| `DATABASE_URL未定义` | 环境变量缺失 | 检查.env文件和docker-compose.yml |
| `Error: 137`（日志无详细信息） | OOM Killer | 增加`memory`限制到1GB |

#### 问题3：502 Bad Gateway（Nginx报错）

**症状**：

```bash
$ curl http://localhost/api/health
<html>
<head><title>502 Bad Gateway</title></head>
<body><h1>502 Bad Gateway</h1></body>
</html>
```

**诊断步骤**：

```bash
# 1. 检查Nginx错误日志
docker compose logs nginx | grep error
# 典型错误："connect() failed (111: Connection refused) while connecting to upstream"

# 2. 检查app容器状态
docker compose ps app
# 如果STATUS不是"Up (healthy)"，优先修复app容器

# 3. 测试app容器直接访问
docker compose exec app curl http://localhost:3000/api/health
# 如果这个成功，说明app正常，问题在Nginx配置

# 4. 检查Nginx上游配置
docker compose exec nginx cat /etc/nginx/nginx.conf | grep -A 3 "upstream app_upstream"
# 确认server地址是"app:3000"而非"localhost:3000"
```

**解决方案**：

```bash
# 场景1：app容器未启动
docker compose up -d app
docker compose logs -f app  # 等待健康检查通过

# 场景2：Nginx配置错误
# 修改nginx.conf中的upstream地址
upstream app_upstream {
    server app:3000;  # ✅ 使用服务名
    # server localhost:3000;  # ❌ 错误：localhost在Nginx容器内部
}

# 重启Nginx
docker compose restart nginx

# 场景3：网络问题
docker network inspect lu_garden_lab_web
# 确认app和nginx都在同一网络中
```

#### 问题4：Vue前端白屏（404错误）

**症状**：

```bash
$ curl -I http://localhost/
HTTP/1.1 404 Not Found
```

**诊断步骤**：

```bash
# 1. 检查dist目录是否存在
ls -la lugarden_universal/frontend_vue/dist/
# 如果目录为空或不存在，说明构建失败

# 2. 检查frontend_vue容器日志
docker compose logs frontend_vue | grep -i error
# 查看构建过程中的错误

# 3. 检查Nginx Volume挂载
docker compose exec nginx ls -la /usr/share/nginx/html/
# 应该看到index.html、assets/等文件

# 4. 检查Nginx配置
docker compose exec nginx cat /etc/nginx/nginx.conf | grep -A 5 "root"
# 确认root指向/usr/share/nginx/html
```

**解决方案**：

```bash
# 场景1：构建未执行
docker compose up -d frontend_vue
docker compose logs -f frontend_vue  # 等待构建完成
docker compose restart nginx

# 场景2：构建失败（依赖问题）
# 本地测试构建
cd lugarden_universal/frontend_vue
npm ci
npm run build
# 如果本地失败，修复代码后再容器构建

# 场景3：Volume挂载错误
# 检查docker-compose.yml中的volumes配置
volumes:
  - ./lugarden_universal/frontend_vue/dist:/usr/share/nginx/html:ro
# 确认路径正确且:ro权限存在
```

#### 问题5：API请求慢（超过5秒）

**症状**：

```bash
$ time curl http://localhost/api/health
{"ok":true,...}
real    0m8.234s  # ❌ 响应时间过长
```

**诊断步骤**：

```bash
# 1. 检查容器资源使用
docker stats --no-stream lugarden-app
# 查看CPU%和MEM%，如果接近限制，增加资源

# 2. 检查数据库查询性能
docker compose exec app node -e "
const { getPrismaClient } = require('./src/persistence/prismaClient.js');
console.time('query');
getPrismaClient().zhouPoem.findMany().then(() => console.timeEnd('query'));
"
# 如果查询超过1秒，可能需要添加索引

# 3. 检查网络延迟
docker compose exec nginx ping -c 3 app
# 容器间延迟应<1ms

# 4. 启用详细日志
# 修改docker-compose.yml，添加环境变量
LOG_LEVEL=debug
# 重启容器后查看日志
docker compose logs -f app | grep -E "query|duration"
```

**优化方案**：

| 瓶颈位置 | 优化方案 |
|---------|---------|
| 数据库查询慢 | 添加索引、使用`select`减少字段 |
| 容器CPU不足 | 增加`cpus`限制或升级服务器 |
| 容器内存不足 | 增加`memory`限制到1GB+ |
| 外部API调用慢 | 添加缓存、使用代理 |
| Nginx反向代理开销 | 调整`keepalive`、`worker_connections` |

### Linux常用命令速查

#### 文件操作

```bash
# 查看文件内容
cat file.txt                    # 全文显示
head -n 20 file.txt             # 前20行
tail -n 20 file.txt             # 后20行
tail -f file.txt                # 实时追踪（类似docker logs -f）

# 文件查找
find . -name "*.log"            # 查找所有.log文件
grep -r "ERROR" logs/           # 递归搜索包含ERROR的文件
grep -E "error|fail" app.log    # 使用正则表达式

# 磁盘空间
df -h                           # 查看磁盘使用率
du -sh lugarden_universal/      # 查看目录大小
du -h --max-depth=1 | sort -hr  # 排序显示子目录大小

# 文件权限
ls -la                          # 查看详细权限
chmod 600 .env                  # 设置文件权限（仅所有者可读写）
chown nodejs:nodejs data/       # 修改所有者
```

#### 进程管理

```bash
# 查看进程
ps aux | grep node              # 查找Node.js进程
top                             # 实时监控CPU/内存
htop                            # 更友好的top（需安装）

# 端口占用
sudo lsof -i:3000               # 查看3000端口被哪个进程占用
sudo netstat -tuln | grep 3000  # 查看端口监听状态
ss -tuln | grep 3000            # netstat的现代替代品

# 杀死进程
kill <PID>                      # 优雅终止
kill -9 <PID>                   # 强制终止（谨慎使用）
pkill -f "node server"          # 按名称终止进程
```

#### 网络调试

```bash
# 连通性测试
ping -c 3 google.com            # ICMP测试
curl -I http://example.com      # HTTP头测试
wget -O - http://example.com    # 下载内容到标准输出

# DNS解析
dig example.com                 # 详细DNS查询
nslookup example.com            # 简单DNS查询
host example.com                # 快速查询

# 防火墙
sudo ufw status                 # 查看防火墙状态
sudo ufw allow 80/tcp           # 开放端口
sudo iptables -L -n             # 查看iptables规则
```

### Docker常用命令速查

#### 容器操作

```bash
# 启动/停止
docker compose up -d                      # 后台启动所有服务
docker compose up -d app nginx            # 启动指定服务
docker compose stop                       # 停止所有服务
docker compose stop app                   # 停止指定服务
docker compose restart app                # 重启服务

# 查看状态
docker compose ps                         # 查看服务状态
docker compose ps -a                      # 包含已停止的容器
docker compose top                        # 查看容器内进程

# 日志
docker compose logs -f app                # 实时查看日志
docker compose logs --tail=100 app        # 查看最近100行
docker compose logs --since="2h" app      # 查看最近2小时日志

# 进入容器
docker compose exec app sh                # 进入运行中的容器
docker compose run --rm app sh            # 创建新容器并进入
```

#### 镜像操作

```bash
# 构建
docker compose build                      # 构建所有服务
docker compose build --no-cache app       # 无缓存构建
docker compose build --pull app           # 拉取最新基础镜像

# 查看镜像
docker images                             # 列出所有镜像
docker images | grep lugarden             # 筛选项目镜像
docker image inspect <镜像ID>             # 查看镜像详情

# 清理
docker image prune                        # 删除悬空镜像
docker image prune -a                     # 删除所有未使用的镜像
docker system prune -a --volumes          # 完全清理（谨慎！）
```

#### 网络操作

```bash
# 查看网络
docker network ls                         # 列出所有网络
docker network inspect lu_garden_lab_web  # 查看网络详情

# 调试网络连通性
docker compose exec app ping nginx        # 容器间ping测试
docker compose exec app nslookup app      # DNS解析测试
docker compose exec nginx curl app:3000/api/health  # HTTP测试
```

#### 资源监控

```bash
# 实时监控
docker stats                              # 所有容器资源使用
docker stats lugarden-app lugarden-nginx  # 指定容器
docker stats --no-stream                  # 只显示一次快照

# 查看资源限制
docker inspect lugarden-app | grep -A 10 Memory
# 输出：MemoryLimit, MemoryReservation等
```

### 快速诊断脚本

**创建一键诊断脚本**：

```bash
cat > ~/diagnose_lugarden.sh << 'EOF'
#!/bin/bash

echo "========================================="
echo "陆家花园 Docker 健康诊断工具"
echo "========================================="

# 1. 系统资源
echo -e "\n[1/6] 系统资源状态"
df -h / | awk 'NR==2 {print "磁盘使用: " $5}'
free -h | awk 'NR==2 {print "内存使用: " $3 "/" $2}'

# 2. Docker服务
echo -e "\n[2/6] Docker服务状态"
systemctl is-active docker && echo "✅ Docker运行中" || echo "❌ Docker未运行"

# 3. 容器状态
echo -e "\n[3/6] 容器状态"
cd ~/lu_garden_lab 2>/dev/null || { echo "❌ 项目目录不存在"; exit 1; }
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# 4. 健康检查
echo -e "\n[4/6] API健康检查"
curl -f -s http://localhost/api/health > /dev/null && echo "✅ API正常" || echo "❌ API异常"

# 5. 磁盘空间（Docker专用）
echo -e "\n[5/6] Docker磁盘使用"
docker system df

# 6. 最近错误日志
echo -e "\n[6/6] 最近错误日志（最近10条）"
docker compose logs --tail=100 app | grep -i error | tail -10 || echo "无错误日志"

echo -e "\n========================================="
echo "诊断完成！如有异常，请查看详细日志："
echo "  docker compose logs -f app"
echo "========================================="
EOF

chmod +x ~/diagnose_lugarden.sh
```

**使用方式**：

```bash
# 快速诊断
~/diagnose_lugarden.sh

# 定期检查（每小时）
(crontab -l 2>/dev/null; echo "0 * * * * ~/diagnose_lugarden.sh >> ~/lugarden_health.log") | crontab -
```

---

## 结语

### 文档总结

本指南从**第一性原理**出发，系统性地解决了零Docker基础的网络架构师面临的容器化部署挑战：

1. **第零部分**：明确了文档定位、版本锚定和读者要求
2. **第一部分**：建立了Docker核心概念的深刻理解（镜像、容器、仓库、编排）
3. **第二部分**：通过逆向工程分析代码，提取了所有运行依赖
4. **第三部分**：基于需求分析设计了生产级Dockerfile
5. **第四部分**：逐步推导出完整的docker-compose.yml配置
6. **第五部分**：提供了从零开始的完整部署实战流程
7. **第六部分**：建立了跨版本适配的系统化方法论
8. **第七部分**：构建了故障排查知识体系和命令速查手册

### 核心设计哲学

- **架构驱动**：所有技术选择都有明确的架构考量
- **安全第一**：非root用户、只读挂载、端口隔离等最佳实践
- **生产就绪**：健康检查、资源限制、日志管理、备份恢复
- **可维护性**：详尽注释、分层设计、清晰的依赖关系

### 下一步行动建议

1. **立即行动**：按照第五部分的流程完成首次部署
2. **深化理解**：阅读官方文档补充理论知识
   - Docker官方文档：https://docs.docker.com/
   - Docker Compose文档：https://docs.docker.com/compose/
3. **实践验证**：在本地环境和生产环境分别部署，对比差异
4. **建立监控**：集成Prometheus/Grafana监控容器指标
5. **CI/CD集成**：使用GitHub Actions自动构建和部署

### 技术债务与未来优化方向

**当前方案的已知限制**：

| 限制 | 当前方案 | 优化方向 |
|------|---------|---------|
| 单机部署 | 所有容器在一台服务器 | 使用Docker Swarm或Kubernetes实现多节点 |
| SQLite局限 | 单文件数据库，并发受限 | 迁移到PostgreSQL/MySQL |
| 无自动扩容 | 固定资源分配 | 实现基于负载的水平扩容 |
| 日志分散 | 各容器独立日志 | 集成ELK或Loki统一日志系统 |
| 无监控告警 | 依赖手动巡检 | 集成Prometheus+Alertmanager |

### 致谢与反馈

本文档是**人机协作**的产物，体现了：
- **人类**：架构设计、需求定义、质量标准
- **AI**：知识整合、细节推导、文档生成

如有任何技术疑问或改进建议，请通过以下方式反馈：
- 项目Issue：https://github.com/your-repo/lu_garden_lab/issues
- 技术讨论：在项目README.md中查找联系方式

---

**文档元数据**：
- 版本：v1.0
- 基于代码版本：commit `0c19db8`
- 创建日期：2025-10-19
- 目标读者：零Docker基础的网络架构师
- 预期学习曲线：理论1天 + 实践1天 = 完全掌握