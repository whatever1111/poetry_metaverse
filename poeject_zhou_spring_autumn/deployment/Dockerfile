# 使用官方Node.js运行时作为父镜像
FROM docker.xuanyuan.run/node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装应用依赖
RUN npm ci --only=production

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 复制应用源代码
COPY application/ .

# 确保数据目录存在并设置权限
RUN mkdir -p data public && \
    chown -R nodejs:nodejs /usr/src/app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3889

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3889/ || exit 1

# 启动应用
CMD ["node", "server.js"] 