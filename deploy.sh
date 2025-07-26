#!/bin/bash

# 诗歌管理系统部署脚本
# 使用方法: ./deploy.sh [your-domain.com]

set -e

DOMAIN=${1:-your-domain.com}
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

echo "🚀 开始部署诗歌管理系统..."
echo "📡 域名: $DOMAIN"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查.env文件
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env文件不存在，请先创建环境配置文件"
    exit 1
fi

# 更新域名配置
echo "🔧 更新域名配置..."
sed -i "s/your-domain\.com/$DOMAIN/g" nginx.conf
sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env

# 确保必要目录存在
echo "📁 创建必要目录..."
mkdir -p data poems ssl

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down 2>/dev/null || true

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   主页: http://$DOMAIN"
    echo "   管理后台: http://$DOMAIN/admin"
    echo ""
    echo "👤 管理员账号:"
    echo "   用户名: $(grep ADMIN_USERNAME .env | cut -d'=' -f2)"
    echo "   密码: $(grep ADMIN_PASSWORD .env | cut -d'=' -f2)"
    echo ""
    echo "⚠️  重要提醒:"
    echo "   1. 请立即为域名 $DOMAIN 配置SSL证书"
    echo "   2. 请修改管理员密码（在.env文件中）"
    echo "   3. 请确保防火墙已开放80和443端口"
    echo "   4. 生产环境建议使用: docker-compose --profile production up -d"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker-compose logs
    exit 1
fi

echo ""
echo "📝 其他有用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   重启服务: docker-compose restart"
echo "   停止服务: docker-compose down"
echo "   更新服务: docker-compose up -d --build" 