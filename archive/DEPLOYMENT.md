# 诗歌管理系统部署指南

## 📋 部署前准备

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 最低 1GB RAM（推荐 2GB+）
- **存储**: 最低 10GB 可用空间
- **网络**: 需要开放80（HTTP）和443（HTTPS）端口

### 2. 域名准备
- 确保域名已解析到服务器IP地址
- 建议配置A记录和AAAA记录（如支持IPv6）

### 3. 安全配置
- 服务器已配置SSH密钥登录
- 已禁用root直接登录
- 已配置防火墙规则

## 🚀 快速部署

### 方法一：使用Docker（推荐）

#### 1. 安装Docker和Docker Compose

**Ubuntu/Debian:**
```bash
# 更新包索引
sudo apt update

# 安装必要依赖
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 安装Docker Compose（独立版本）
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
# 安装Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
```

#### 2. 部署应用

```bash
# 1. 克隆项目到服务器
git clone <你的仓库地址> poetry-system
cd poetry-system

# 2. 配置环境变量
cp .env .env.backup  # 备份原配置
nano .env  # 编辑配置文件

# 3. 重要配置项：
# ADMIN_USERNAME=你的管理员用户名
# ADMIN_PASSWORD=强密码123!@#
# SESSION_SECRET=随机生成的长字符串
# DOMAIN=你的域名.com

# 4. 运行部署脚本
./deploy.sh 你的域名.com

# 5. 查看服务状态
docker-compose ps
docker-compose logs -f
```

### 方法二：直接部署

#### 1. 安装Node.js

```bash
# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2. 部署应用

```bash
# 1. 克隆并进入项目目录
git clone <你的仓库地址> poetry-system
cd poetry-system

# 2. 安装依赖
npm install --production

# 3. 配置环境变量
nano .env

# 4. 使用PM2管理进程
sudo npm install -g pm2

# 5. 启动应用
pm2 start server.js --name "poetry-system"
pm2 startup
pm2 save

# 6. 配置Nginx反向代理
sudo apt install -y nginx
sudo cp nginx.conf /etc/nginx/sites-available/poetry-system
sudo ln -s /etc/nginx/sites-available/poetry-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL证书配置

### 使用Let's Encrypt（免费）

```bash
# 1. 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. 获取SSL证书
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com

# 3. 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 使用自有证书

```bash
# 1. 创建SSL目录
mkdir -p ssl

# 2. 复制证书文件
cp your-domain.com.crt ssl/
cp your-domain.com.key ssl/

# 3. 更新权限
chmod 600 ssl/your-domain.com.key
chmod 644 ssl/your-domain.com.crt

# 4. 启动带SSL的服务
docker-compose --profile production up -d
```

## 🔧 配置说明

### 环境变量配置（.env文件）

```bash
# 服务器配置
PORT=3000
NODE_ENV=production

# 管理员账号（请务必修改）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的强密码

# Session密钥（请生成随机字符串）
SESSION_SECRET=随机生成的超长字符串

# 域名配置
DOMAIN=你的域名.com

# 安全配置
RATE_LIMIT_WINDOW_MS=900000    # 15分钟
RATE_LIMIT_MAX_REQUESTS=100    # 最大请求数
```

### 防火墙配置

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 监控和维护

### 查看日志

```bash
# Docker部署
docker-compose logs -f

# 直接部署
pm2 logs poetry-system

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 备份数据

```bash
# 1. 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_${DATE}.tar.gz data/ poems/ .env
echo "备份完成: backup_${DATE}.tar.gz"
EOF

chmod +x backup.sh

# 2. 设置定时备份
crontab -e
# 添加：每天凌晨2点备份
# 0 2 * * * /path/to/your/project/backup.sh
```

### 更新应用

```bash
# Docker部署
git pull origin main
docker-compose up -d --build

# 直接部署
git pull origin main
npm install --production
pm2 restart poetry-system
```

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID号
   ```

2. **权限问题**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   chmod -R 755 /path/to/project
   ```

3. **内存不足**
   ```bash
   # 添加swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **Docker服务异常**
   ```bash
   docker-compose down
   docker system prune -f
   docker-compose up -d --build
   ```

### 性能优化

1. **启用Gzip压缩**（Nginx配置中已包含）
2. **配置静态文件缓存**（Nginx配置中已包含）
3. **数据库连接池**（如果使用数据库）
4. **CDN加速**（可选）

## 📱 移动端适配

应用已包含响应式设计，支持：
- 手机浏览器访问
- 平板设备访问
- 桌面浏览器访问

## 🔐 安全建议

1. **定期更新密码**
2. **启用SSH密钥登录**
3. **配置fail2ban防暴力破解**
4. **定期更新系统和依赖**
5. **监控访问日志**
6. **设置备份策略**

## 📞 技术支持

如遇到部署问题，请检查：
1. 服务器系统要求
2. 网络连接状态
3. 域名解析配置
4. 防火墙设置
5. 应用日志信息

---

**部署完成后，请立即修改默认管理员密码！** 