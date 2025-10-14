#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修正版异步测试脚本
基于真正的完成标准：检查messages的answer字段内容而非conversation status

核心修正：
- conversation.status总是'normal'，不是真正的完成指示器
- 真正完成标准：message.answer字段有实际内容（长度>0）
"""

import requests
import json
import time
from datetime import datetime
from dotenv import load_dotenv
import os

def load_config():
    """加载配置"""
    load_dotenv('.env.local', override=True)
    load_dotenv('.env', override=False)
    
    api_key = os.getenv('DIFY_API_KEY')
    if not api_key or api_key == 'app-your-api-key-here':
        raise ValueError("请在 .env.local 中设置有效的 DIFY_API_KEY")
    
    return {
        'api_key': api_key,
        'base_url': os.getenv('DIFY_BASE_URL', 'https://api.dify.ai'),
        'timeout': int(os.getenv('REQUEST_TIMEOUT', '300'))
    }

def build_url(config, endpoint):
    """统一URL构建逻辑"""
    base_url = config['base_url']
    if base_url.endswith('/v1'):
        return f"{base_url}{endpoint}"
    else:
        return f"{base_url}/v1{endpoint}"

def send_chat_request(config, query, short_timeout=20):
    """发送chat请求"""
    print(f"📤 **步骤1: 发送chat请求**")
    print(f"Query: {query}")
    print(f"超时设置: {short_timeout}秒")
    print("-" * 50)
    
    headers = {
        'Authorization': f"Bearer {config['api_key']}",
        'Content-Type': 'application/json'
    }
    
    payload = {
        "inputs": {},
        "query": query,
        "response_mode": "blocking",
        "conversation_id": "",
        "user": "XiEr",
        "auto_generate_name": False
    }
    
    url = build_url(config, "/chat-messages")
    request_start_time = datetime.now()
    
    print(f"🕐 请求发送时间: {request_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=short_timeout
        )
        
        if response.status_code == 200:
            print(f"✅ **请求直接成功**")
            data = response.json()
            conversation_id = data.get('conversation_id')
            print(f"🎯 获得conversation_id: {conversation_id}")
            return {
                'success': True,
                'data': data,
                'conversation_id': conversation_id,
                'request_time': request_start_time
            }
        elif response.status_code == 504:
            print(f"⏰ **504超时** - 开始异步追踪")
        else:
            print(f"❌ **HTTP错误**: {response.status_code}")
            print(f"响应: {response.text[:200]}...")
            
    except requests.exceptions.Timeout:
        print(f"⏰ **客户端超时** - 开始异步追踪")
    except Exception as e:
        print(f"❌ **请求异常**: {e}")
        return {'success': False, 'error': str(e)}
    
    # 如果到这里，说明需要异步追踪
    return {
        'success': False,
        'timeout': True,
        'request_time': request_start_time
    }

def find_conversation_by_query(config, query, request_time, max_attempts=10):
    """通过query匹配找到conversation ID"""
    print(f"\n🔍 **步骤2: 查找对应的conversation**")
    print(f"匹配Query: {query}")
    print(f"请求时间: {request_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    headers = {
        'Authorization': f"Bearer {config['api_key']}",
        'Content-Type': 'application/json'
    }
    
    url = build_url(config, "/conversations")
    params = {
        'user': 'XiEr',
        'limit': 20,  # 增加查询范围
        'last_id': ''
    }
    
    # 准备匹配关键词
    query_keywords = query[:20]  # 前20个字符作为匹配关键词
    
    for attempt in range(max_attempts):
        print(f"🧪 **尝试 {attempt + 1}/{max_attempts}**")
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                conversations = data.get('data', [])
                
                print(f"📊 获取到 {len(conversations)} 个会话")
                
                # 寻找匹配的会话（conversations已按created_at降序排列，最新在前）
                for conv in conversations:
                    conv_name = conv.get('name', '')
                    conv_id = conv.get('id')
                    conv_created = conv.get('created_at')
                    
                    # 通过name字段匹配（name是query的截断版本）
                    # 串行设计保证：第一个匹配的就是我们刚发送的请求
                    if query_keywords in conv_name or conv_name in query:
                        print(f"✅ **找到匹配会话!**")
                        print(f"   ID: {conv_id}")
                        print(f"   Name: {conv_name}")
                        print(f"   Created: {conv_created}")
                        print(f"   🎯 串行设计确保这是最新的匹配会话")
                        return {
                            'found': True,
                            'conversation_id': conv_id,
                            'name': conv_name
                        }
                
                print(f"⚠️  第{attempt + 1}次未找到匹配，等待5秒后重试...")
                time.sleep(5)
                
            else:
                print(f"❌ 查询失败: {response.status_code}")
                time.sleep(3)
                
        except Exception as e:
            print(f"❌ 查询异常: {e}")
            time.sleep(3)
    
    print(f"❌ **未找到匹配的conversation**")
    return {'found': False}

def poll_message_content(config, conversation_id, max_wait_time=300):
    """轮询消息内容直到answer字段有内容"""
    print(f"\n⏱️  **步骤3: 轮询消息内容直到完成**")
    print(f"Conversation ID: {conversation_id}")
    print(f"判断标准: message.answer字段长度 > 0")
    print(f"最大等待时间: {max_wait_time}秒")
    print("-" * 50)
    
    headers = {
        'Authorization': f"Bearer {config['api_key']}",
        'Content-Type': 'application/json'
    }
    
    url = build_url(config, "/messages")
    params = {
        'conversation_id': conversation_id,
        'user': 'XiEr',
        'limit': 1
    }
    
    start_time = time.time()
    poll_interval = 10  # 每10秒查询一次
    attempt = 1
    
    while time.time() - start_time < max_wait_time:
        elapsed = int(time.time() - start_time)
        print(f"[{elapsed:3d}s] 第{attempt}次检查...")
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                messages = data.get('data', [])
                
                if messages:
                    message = messages[0]
                    answer = message.get('answer', '')
                    answer_length = len(answer)
                    
                    print(f"        📊 Answer长度: {answer_length}")
                    
                    if answer_length > 0:
                        print(f"✅ **任务完成！Answer字段有内容**")
                        print(f"📄 完整Answer内容:")
                        print("-" * 60)
                        print(answer)
                        print("-" * 60)
                        return {
                            'completed': True,
                            'message': message,
                            'answer': answer
                        }
                    else:
                        print(f"        ⏳ Answer仍为空，继续等待...")
                else:
                    print(f"        ⏳ 暂无消息，继续等待...")
            else:
                print(f"        ❌ 查询失败: {response.status_code}")
                
        except Exception as e:
            print(f"        ❌ 查询异常: {e}")
        
        attempt += 1
        time.sleep(poll_interval)
    
    print(f"⏰ **轮询超时，超过{max_wait_time}秒**")
    return {'completed': False, 'timeout': True}

def main():
    """主测试函数"""
    print("🚀 **修正版异步测试 - 基于Answer内容判断完成**")
    print("=" * 70)
    print(f"🕐 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        # 加载配置
        config = load_config()
        print(f"✅ 配置加载成功")
        print(f"🔗 API基础URL: {config['base_url']}")
        print()
        
        # 测试query - 使用真实的诗歌创作请求格式，不污染输入内容
        test_query = "今天测试异步功能，心情忐忑但充满期待，技术与诗歌在此刻相遇"
        
        # 步骤1: 发送请求
        chat_result = send_chat_request(config, test_query, short_timeout=20)
        
        conversation_id = None
        
        if chat_result['success']:
            # 直接成功
            conversation_id = chat_result['conversation_id']
            print(f"🎯 直接获得conversation_id: {conversation_id}")
            
            # 即使直接成功，也要检查answer内容
            poll_result = poll_message_content(config, conversation_id, max_wait_time=60)
            
            if poll_result['completed']:
                answer = poll_result['answer']
                print(f"\n🎉 **测试成功完成！**")
                print(f"📊 总结:")
                print(f"   - 请求方式: 直接成功")
                print(f"   - Conversation ID: {conversation_id}")
                print(f"   - Answer长度: {len(answer)}字符")
                print(f"   - Answer预览:\n {answer}")
            else:
                print(f"❌ 虽然请求成功，但Answer内容轮询失败")
                
        else:
            # 需要异步追踪
            if chat_result.get('timeout'):
                print(f"⏰ 请求超时，开始异步追踪...")
                
                # 步骤2: 查找conversation
                find_result = find_conversation_by_query(config, test_query, chat_result['request_time'])
                
                if find_result['found']:
                    conversation_id = find_result['conversation_id']
                    print(f"🎯 找到conversation_id: {conversation_id}")
                    
                    # 步骤3: 轮询消息内容
                    poll_result = poll_message_content(config, conversation_id)
                    
                    if poll_result['completed']:
                        answer = poll_result['answer']
                        print(f"\n🎉 **异步追踪成功完成！**")
                        print(f"📊 总结:")
                        print(f"   - 请求方式: 异步追踪")
                        print(f"   - Conversation ID: {conversation_id}")
                        print(f"   - Answer长度: {len(answer)}字符")
                        print(f"   - Answer预览:\n {answer}")
                        print(f"   - 验证了完整的504超时恢复流程")
                    else:
                        print(f"❌ 消息内容轮询失败或超时")
                else:
                    print(f"❌ 未找到对应的conversation")
            else:
                print(f"❌ 请求失败: {chat_result.get('error', '未知错误')}")
        
    except Exception as e:
        print(f"❌ 测试过程出错: {e}")
        import traceback
        print(f"详细错误: {traceback.format_exc()}")

if __name__ == "__main__":
    main()
