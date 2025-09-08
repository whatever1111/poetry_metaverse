#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dify API 测试脚本
目的：探索API响应结构，了解双Agent对抗博弈工作流的实际输出
"""

import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime

def load_config():
    """加载配置文件"""
    # 优先加载 .env.local，然后是 .env
    load_dotenv('.env.local', override=True)
    load_dotenv('.env', override=False)
    
    api_key = os.getenv('DIFY_API_KEY')
    if not api_key or api_key == 'app-your-api-key-here':
        raise ValueError("请在 .env.local 中设置有效的 DIFY_API_KEY")
    
    return {
        'api_key': api_key,
        'base_url': os.getenv('DIFY_BASE_URL', 'https://api.dify.ai'),
        'timeout': int(os.getenv('REQUEST_TIMEOUT', '60'))
    }

def test_basic_api_call(config, test_query="写一首关于春天的诗"):
    """测试基本API调用"""
    print("=" * 60)
    print(f"🧪 测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 测试查询: {test_query}")
    print("=" * 60)
    
    headers = {
        'Authorization': f'Bearer {config["api_key"]}',
        'Content-Type': 'application/json',
    }
    
    # 测试数据
    data = {
        "inputs": {},
        "query": test_query,
        "response_mode": "blocking",  # 使用阻塞模式获取完整结果
        "user": "api_test_user"
    }
    
    print("📤 请求数据:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("\n" + "−" * 40)
    
    try:
        # 发送API请求
        print("🚀 正在调用Dify API...")
        print("⏳ 双Agent对抗博弈进行中，这可能需要几分钟...")
        print(f"⌛ 最大等待时间: {config['timeout']}秒 ({config['timeout']//60}分钟)")
        
        # 构建正确的API URL
        api_url = f'{config["base_url"]}/chat-messages' if config["base_url"].endswith('/v1') else f'{config["base_url"]}/v1/chat-messages'
        print(f"🔗 请求URL: {api_url}")
        
        response = requests.post(
            api_url,
            headers=headers,
            json=data,
            timeout=config['timeout']
        )
        
        print(f"📊 响应状态码: {response.status_code}")
        print(f"📊 响应时间: {response.elapsed.total_seconds():.2f} 秒")
        print(f"📊 响应头: {dict(response.headers)}")
        
        # 分析响应
        if response.status_code == 200:
            print("\n✅ API调用成功!")
            analyze_success_response(response)
        else:
            print("\n❌ API调用失败!")
            analyze_error_response(response)
            
    except requests.exceptions.Timeout:
        print(f"⏰ 请求超时 (>{config['timeout']}秒)")
    except requests.exceptions.RequestException as e:
        print(f"🚫 网络错误: {e}")
    except Exception as e:
        print(f"💥 未知错误: {e}")

def analyze_success_response(response):
    """分析成功响应的详细结构"""
    try:
        result = response.json()
        
        print("\n📝 响应JSON结构:")
        print("=" * 50)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        print("\n🔍 关键字段分析:")
        print("=" * 50)
        
        # 分析主要字段
        key_fields = ['answer', 'conversation_id', 'message_id', 'created_at', 'metadata']
        for field in key_fields:
            if field in result:
                print(f"✓ {field}: {type(result[field]).__name__}")
                if field == 'answer':
                    print(f"  内容长度: {len(str(result[field]))} 字符")
                    print(f"  前200字符: {str(result[field])[:200]}...")
                elif field == 'metadata':
                    print(f"  metadata内容: {result[field]}")
                else:
                    print(f"  值: {result[field]}")
            else:
                print(f"✗ {field}: 不存在")
        
        # 检查是否有中间过程信息
        print("\n🔬 中间过程信息检查:")
        print("=" * 50)
        content = str(result)
        
        # 寻找可能的中间节点标识
        keywords = ['G1', 'G2', 'G3', 'D1', 'D2', 'P1', 'P2', '评估', '修改', '判别', '生成器']
        found_keywords = []
        for keyword in keywords:
            if keyword in content:
                found_keywords.append(keyword)
        
        if found_keywords:
            print(f"🎯 发现可能的工作流标识: {', '.join(found_keywords)}")
        else:
            print("🤷 未发现明显的中间过程标识")
            
    except json.JSONDecodeError:
        print("📄 响应原始内容 (非JSON):")
        print(response.text)

def analyze_error_response(response):
    """分析错误响应"""
    print(f"💢 错误状态码: {response.status_code}")
    try:
        error_data = response.json()
        print("📄 错误详情:")
        print(json.dumps(error_data, indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print("📄 错误响应原始内容:")
        print(response.text)

def main():
    """主函数"""
    print("🚀 Dify API 探索测试")
    print("目标: 了解双Agent对抗博弈工作流的实际API响应")
    
    try:
        # 加载配置
        config = load_config()
        print(f"✅ 配置加载成功")
        print(f"🔗 API地址: {config['base_url']}")
        print(f"🔑 API密钥: {config['api_key'][:12]}****")
        
        # 执行测试
        test_basic_api_call(config)
        
        print("\n" + "=" * 60)
        print("🎉 测试完成!")
        print("请查看上面的输出，分析API响应结构")
        
    except Exception as e:
        print(f"💥 测试失败: {e}")

if __name__ == "__main__":
    main()
