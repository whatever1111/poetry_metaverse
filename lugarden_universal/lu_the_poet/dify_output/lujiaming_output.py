#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
陆家明AI诗人创作工具
基于Dify双Agent对抗博弈系统 + YAML metadata自动保存

依赖要求:
- pip install aiohttp python-dotenv pyyaml requests

功能特性:
- 支持单次创作和批量创作
- 5路并发模式，显著提升批量创作效率
- YYMMDD_HHMMSS精确时间戳，避免文件名冲突
- 完整的YAML metadata保存
- 智能响应解析和D节点评估数据提取
"""

import re
import json
import yaml
import os
import asyncio
import aiohttp
import time
from datetime import datetime
from dotenv import load_dotenv
import requests

def load_configuration():
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
        'timeout': int(os.getenv('REQUEST_TIMEOUT', '600')),
        'output_dir': os.getenv('OUTPUT_DIR', './daily_output')
    }

def parse_dify_response(api_response, user_query=""):
    """
    解析Dify API响应，分离诗歌内容和评估数据
    
    Args:
        api_response: 从Dify API获取的完整响应
        user_query: 用户的原始查询
    
    Returns:
        dict: 包含poetry, metadata, raw_evaluation的解析结果
    """
    answer = api_response.get('answer', '')
    metadata = api_response.get('metadata', {})
    
    print("🔍 开始解析API响应...")
    print(f"📝 原始answer长度: {len(answer)} 字符")
    
    # 1. 分离诗歌内容和D节点JSON
    # 匹配最终裁决开始的JSON结构
    json_pattern = r'\{\s*"最终裁决"[^}]*\}'
    match = re.search(json_pattern, answer, re.DOTALL | re.MULTILINE)
    
    if match:
        poetry_content = answer[:match.start()].strip()
        json_str = match.group()
        print(f"✅ 找到D节点评估数据: {json_str[:50]}...")
        
        try:
            d_evaluation = json.loads(json_str)
            print("✅ D节点JSON解析成功")
        except json.JSONDecodeError as e:
            print(f"❌ D节点JSON解析失败: {e}")
            d_evaluation = {}
    else:
        print("⚠️  未找到D节点评估数据，使用全部内容作为诗歌")
        poetry_content = answer
        d_evaluation = {}
    
    # 2. 提取经典引文信息（如果存在）
    citation_pattern = r'"([^"]+)"\s*—— 《([^》]+)》'
    citation_match = re.search(citation_pattern, poetry_content)
    classic_quote = citation_match.group(1) if citation_match else ""
    classic_source = citation_match.group(2) if citation_match else ""
    
    # 3. 构建YAML metadata
    timestamp = datetime.now()
    yaml_meta = {
        'creation_id': f"creation_{timestamp.strftime('%y%m%d_%H%M%S')}",
        'timestamp': timestamp.isoformat(),
        'conversation_id': api_response.get('conversation_id', ''),
        'message_id': api_response.get('message_id', ''),
        
        'evaluation': {
            'final_decision': d_evaluation.get('最终裁决', ''),
            'structural_integrity': d_evaluation.get('结构完整性', ''),
            'citation_verification': d_evaluation.get('引文验证状态', ''),
            'style_fidelity': d_evaluation.get('风格保真度', 0),
            'evidence_sufficiency': d_evaluation.get('证据充足度', ''),
            'error_code': d_evaluation.get('错误码', ''),
            'improvement_suggestions': d_evaluation.get('改进建议', '')
        },
        
        'performance': {
            'usage': metadata.get('usage', {}),
            'retrieval_count': metadata.get('retrieval_count', 0)
        },
        
        'creation_meta': {
            'user_query': user_query,
            'classic_quote': classic_quote,
            'classic_source': classic_source,
            'workflow_version': '0908',
            'generation_round': 'G1',  # 目前只能检测到G1
            'api_model': 'gemini-2.0-flash-thinking-exp'
        }
    }
    
    print(f"📊 解析完成:")
    print(f"   - 诗歌内容: {len(poetry_content)} 字符")
    print(f"   - 经典出处: {classic_source}")
    print(f"   - D节点评估: {'有' if d_evaluation else '无'}")
    
    return {
        'poetry': poetry_content,
        'metadata': yaml_meta,
        'raw_evaluation': d_evaluation
    }

def extract_title_info(poetry_content):
    """
    从诗歌内容中提取标题和系列名
    
    Args:
        poetry_content: 诗歌文本内容
    
    Returns:
        tuple: (series_name, title)
    """
    lines = poetry_content.strip().split('\n')
    if not lines:
        return "陆家明", "无题"
    
    first_line = lines[0].strip()
    
    # 解析格式：何陋有 · 关于朋友的清谈
    if '·' in first_line:
        parts = first_line.split('·', 1)
        series_name = parts[0].strip()
        title = parts[1].strip()
        
        # 清理标题中的特殊字符，保留中文、英文、数字
        title = re.sub(r'[^\w\u4e00-\u9fff]', '', title)
        
        return series_name, title
    else:
        # 如果没有系列名，使用默认
        title = re.sub(r'[^\w\u4e00-\u9fff]', '', first_line)
        return "陆家明", title if title else "无题"

def clean_filename(text):
    """
    清理文件名/目录名中的特殊字符
    
    Args:
        text: 原始文本
    
    Returns:
        str: 清理后的安全文件名
    """
    # 移除Windows不允许的字符
    invalid_chars = r'<>:"/\\|?*'
    for char in invalid_chars:
        text = text.replace(char, '')
    
    # 移除其他特殊字符，保留中文、英文、数字、常见标点
    import re
    text = re.sub(r'[^\w\u4e00-\u9fff\s\-_，。？！]', '', text)
    
    # 去除多余空格并用下划线替换空格
    text = re.sub(r'\s+', '_', text.strip())
    
    # 限制长度（Windows目录名限制）
    if len(text) > 100:
        text = text[:100]
    
    return text

def create_output_directory(user_query, base_dir="../corpus/lujiaming/"):
    """
    根据日期和提问内容创建输出目录
    格式: YYMMDD_提问内容
    
    Args:
        user_query: 用户查询内容
        base_dir: 基础目录
    
    Returns:
        str: 创建的目录路径
    """
    # 生成日期前缀
    date_prefix = datetime.now().strftime('%y%m%d')
    
    # 清理提问内容
    clean_query = clean_filename(user_query)
    
    # 组合目录名
    dir_name = f"{date_prefix}_{clean_query}"
    
    # 创建完整路径
    output_dir = os.path.join(base_dir, dir_name)
    
    # 确保目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    return output_dir

def save_poetry_with_metadata(parsed_data, user_query, base_dir="../corpus/lujiaming/"):
    """
    保存带YAML metadata的诗歌文件
    文件命名格式: YYMMDD_HHMMSS_系列名_标题.md
    目录格式: YYMMDD_提问内容/
    
    Args:
        parsed_data: parse_dify_response的返回结果
        user_query: 用户查询内容（用于创建目录）
        base_dir: 基础目录
    
    Returns:
        str: 保存的文件路径
    """
    # 创建动态输出目录
    output_dir = create_output_directory(user_query, base_dir)
    
    # 提取标题信息
    series_name, title = extract_title_info(parsed_data['poetry'])
    
    # 生成时间戳 (YYMMDD_HHMMSS)
    timestamp = datetime.now().strftime('%y%m%d_%H%M%S')
    
    # 构建文件名: YYMMDD_HHMMSS_系列名_标题.md
    filename = f"{timestamp}_{series_name}_{title}.md"
    
    # 确保文件名不会太长 (Windows文件名限制)
    if len(filename) > 100:
        title = title[:30] + "..."
        filename = f"{timestamp}_{series_name}_{title}.md"
    
    filepath = os.path.join(output_dir, filename)
    
    print(f"💾 准备保存到: {filename}")
    print(f"   📅 时间: {timestamp}")
    print(f"   📚 系列: {series_name}")
    print(f"   📝 标题: {title}")
    
    # 构建YAML front matter
    yaml_header = yaml.dump(
        parsed_data['metadata'], 
        allow_unicode=True, 
        default_flow_style=False,
        indent=2,
        width=80
    )
    
    # 构建完整内容
    full_content = f"""---
{yaml_header}---

{parsed_data['poetry']}
"""
    
    # 保存文件
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)
        print(f"✅ 文件保存成功: {filename}")
        return filepath
    except Exception as e:
        print(f"❌ 文件保存失败: {e}")
        return None

def create_single_poetry(user_query, config):
    """创建单首诗歌（同步版本）"""
    try:
        # 发送API请求
        api_url = f'{config["base_url"]}/chat-messages' if config["base_url"].endswith('/v1') else f'{config["base_url"]}/v1/chat-messages'
        
        headers = {
            'Authorization': f'Bearer {config["api_key"]}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "inputs": {},
            "query": user_query,
            "response_mode": "blocking",
            "conversation_id": "",
            "user": "XiEr",
            "auto_generate_name": False
        }
        
        # 记录请求发送时间
        request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"📤 发送请求: {user_query} (时间: {request_time})")
        
        # 发送API请求
        try:
            response = requests.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=config['timeout']
            )
            
            if response.status_code == 200:
                pass  # 成功，继续处理
            elif response.status_code == 504:
                print(f"❌ 504超时 - Dify后台仍在处理，但客户端超时")
                print(f"🕐 请求发送时间: {request_time} (请用此时间在Dify网页端查询结果)")
                return None
            else:
                print(f"❌ API请求失败: {response.status_code} - {response.text}")
                return None
        except requests.exceptions.Timeout:
            print(f"❌ 请求超时")
            print(f"🕐 请求发送时间: {request_time} (请用此时间在Dify网页端查询结果)")
            return None
        
        if response.status_code == 200:
            api_response = response.json()
            print("✅ API请求成功")
            
            # 解析响应
            parsed_data = parse_dify_response(api_response, user_query)
            
            # 保存文件
            filepath = save_poetry_with_metadata(parsed_data, user_query)
            
            if filepath:
                print(f"✅ 文件已保存: {os.path.basename(filepath)}")
                return {'success': True, 'filepath': filepath, 'parsed_data': parsed_data}
            else:
                print("❌ 文件保存失败")
                return {'success': False, 'error': '文件保存失败'}
                
        else:
            error_msg = f"API请求失败: {response.status_code} - {response.text}"
            print(f"❌ {error_msg}")
            return {'success': False, 'error': error_msg}
            
    except Exception as e:
        error_msg = f"创作过程出错: {e}"
        print(f"❌ {error_msg}")
        return {'success': False, 'error': error_msg}

async def create_single_poetry_async_sequential(session, user_query, config, task_id):
    """创建单首诗歌（异步顺序版本，无并发控制）"""
    try:
        # 发送API请求
        api_url = f'{config["base_url"]}/chat-messages' if config["base_url"].endswith('/v1') else f'{config["base_url"]}/v1/chat-messages'
        
        headers = {
            'Authorization': f'Bearer {config["api_key"]}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "inputs": {},
            "query": user_query,
            "response_mode": "blocking",
            "conversation_id": "",
            "user": "XiEr",
            "auto_generate_name": False
        }
        
        # 记录请求发送时间
        request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"📤 [{task_id}] 发送请求: {user_query} (时间: {request_time})")
        
        # 发送API请求
        try:
            async with session.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=config['timeout'])
            ) as response:
            
                if response.status == 200:
                    api_response = await response.json()
                    print(f"✅ [{task_id}] API请求成功")
                    
                    # 解析响应
                    parsed_data = parse_dify_response(api_response, user_query)
                    
                    # 保存文件
                    filepath = save_poetry_with_metadata(parsed_data, user_query)
                    
                    if filepath:
                        print(f"✅ [{task_id}] 文件已保存: {os.path.basename(filepath)}")
                        return {'success': True, 'filepath': filepath, 'parsed_data': parsed_data, 'task_id': task_id}
                    else:
                        print(f"❌ [{task_id}] 文件保存失败")
                        return {'success': False, 'error': '文件保存失败', 'task_id': task_id}
                        
                elif response.status == 504:
                    error_msg = f"504超时 - Dify后台仍在处理，但客户端超时"
                    print(f"❌ [{task_id}] {error_msg}")
                    print(f"🕐 [{task_id}] 请求发送时间: {request_time} (请用此时间在Dify网页端查询结果)")
                    return {'success': False, 'error': error_msg, 'task_id': task_id, 'request_time': request_time}
                else:
                    response_text = await response.text()
                    error_msg = f"API请求失败: {response.status} - {response_text}"
                    print(f"❌ [{task_id}] {error_msg}")
                    return {'success': False, 'error': error_msg, 'task_id': task_id}
                    
        except asyncio.TimeoutError:
            error_msg = f"请求超时"
            print(f"❌ [{task_id}] {error_msg}")
            print(f"🕐 [{task_id}] 请求发送时间: {request_time} (请用此时间在Dify网页端查询结果)")
            return {'success': False, 'error': error_msg, 'task_id': task_id, 'request_time': request_time}
                
    except Exception as e:
        error_msg = f"创作过程出错: {e}"
        print(f"❌ [{task_id}] {error_msg}")
        return {'success': False, 'error': error_msg, 'task_id': task_id}

async def create_single_poetry_async(session, user_query, config, task_id, semaphore):
    """创建单首诗歌（异步版本）"""
    async with semaphore:  # 控制并发数量
        try:
            # 发送API请求
            api_url = f'{config["base_url"]}/chat-messages' if config["base_url"].endswith('/v1') else f'{config["base_url"]}/v1/chat-messages'
            
            headers = {
                'Authorization': f'Bearer {config["api_key"]}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "inputs": {},
                "query": user_query,
                "response_mode": "blocking",
                "conversation_id": "",
                "user": "XiEr",
                "auto_generate_name": False
            }
            
            print(f"📤 [{task_id}] 发送请求: {user_query}")
            
            async with session.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=config['timeout'])
            ) as response:
                
                if response.status == 200:
                    api_response = await response.json()
                    print(f"✅ [{task_id}] API请求成功")
                    
                    # 解析响应
                    parsed_data = parse_dify_response(api_response, user_query)
                    
                    # 保存文件
                    filepath = save_poetry_with_metadata(parsed_data, user_query)
                    
                    if filepath:
                        print(f"✅ [{task_id}] 文件已保存: {os.path.basename(filepath)}")
                        return {'success': True, 'filepath': filepath, 'parsed_data': parsed_data, 'task_id': task_id}
                    else:
                        print(f"❌ [{task_id}] 文件保存失败")
                        return {'success': False, 'error': '文件保存失败', 'task_id': task_id}
                        
                else:
                    # 简化错误信息显示，避免冗长的HTML
                    if response.status == 504:
                        error_msg = f"API请求超时: {response.status} Gateway Timeout (服务器繁忙)"
                    else:
                        response_text = await response.text()
                        if len(response_text) > 200:
                            error_msg = f"API请求失败: {response.status} - {response_text[:200]}..."
                        else:
                            error_msg = f"API请求失败: {response.status} - {response_text}"
                    print(f"❌ [{task_id}] {error_msg}")
                    return {'success': False, 'error': error_msg, 'task_id': task_id}
                    
        except Exception as e:
            error_msg = f"创作过程出错: {e}"
            print(f"❌ [{task_id}] {error_msg}")
            return {'success': False, 'error': error_msg, 'task_id': task_id}

def batch_create_poetry():
    """批量创作诗歌"""
    print("🚀 批量诗歌创作模式")
    print("=" * 60)
    
    try:
        # 1. 加载配置
        config = load_configuration()
        print("✅ 配置加载成功")
        
        # 2. 获取用户输入
        print("\n📝 请输入创作需求:")
        user_query = input(">>> ").strip()
        
        if not user_query:
            print("❌ 输入不能为空")
            return
        
        print(f"\n🔢 请输入创作次数 (1-10):")
        try:
            batch_count = int(input(">>> ").strip())
            if batch_count < 1 or batch_count > 10:
                print("❌ 创作次数必须在1-10之间")
                return
        except ValueError:
            print("❌ 请输入有效的数字")
            return
        
        # 3. 选择创作模式
        print(f"\n⚡ 请选择创作模式:")
        print("1. 🐌 串行模式 - 逐个创作，稳定可靠")
        print("2. 🚀 交错并发模式 - 每3秒发送一个请求，5个一组并发处理")
        
        mode_choice = input("请输入选择 (1-2): ").strip()
        use_concurrent = mode_choice == "2"
        
        # 4. 确认批量创作
        mode_desc = "交错并发模式" if use_concurrent else "串行模式 (间隔3秒)"
        estimated_time = batch_count * 8 if use_concurrent else batch_count * 40
        
        print(f"\n🎯 准备创作设置:")
        print(f"   📝 创作需求: {user_query}")
        print(f"   🔢 创作次数: {batch_count}")
        print(f"   ⚡ 创作模式: {mode_desc}")
        # 预览保存目录
        preview_dir = create_output_directory(user_query)
        print(f"   📁 保存目录: {preview_dir}")
        print(f"   ⏱️  预估耗时: {estimated_time} 秒")
        
        confirm = input(f"\n确认开始批量创作？(y/N): ").strip().lower()
        if confirm != 'y':
            print("❌ 用户取消操作")
            return
        
        # 5. 执行批量创作
        if use_concurrent:
            return asyncio.run(batch_create_poetry_concurrent(user_query, batch_count, config))
        else:
            return batch_create_poetry_serial(user_query, batch_count, config)
        
    except Exception as e:
        print(f"❌ 批量创作过程出错: {e}")
        return None

def batch_create_poetry_serial(user_query, batch_count, config):
    """串行批量创作"""
    print(f"\n🎨 开始串行批量创作 ({batch_count} 首)...")
    print("=" * 60)
    
    results = []
    successful_count = 0
    
    for i in range(batch_count):
        print(f"\n🔄 第 {i+1}/{batch_count} 首创作中...")
        
        result = create_single_poetry(user_query, config)
        results.append(result)
        
        if result['success']:
            successful_count += 1
            print(f"✅ 第 {i+1} 首创作完成")
        else:
            print(f"❌ 第 {i+1} 首创作失败: {result.get('error', '未知错误')}")
        
        # 如果不是最后一次，稍作等待
        if i < batch_count - 1:
            print("⏳ 等待 3 秒后继续...")
            time.sleep(3)
    
    # 显示批量创作总结
    preview_dir = create_output_directory(user_query)
    display_batch_summary(results, successful_count, batch_count, preview_dir)
    return results

async def batch_create_poetry_concurrent(user_query, batch_count, config):
    """交错并发创作（每3秒发送一个请求，5个一组并发处理）"""
    print(f"\n🚀 开始交错并发批量创作 ({batch_count} 首，每3秒发送一个请求)...")
    print("=" * 60)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # 分批次处理，每批次最多5个
        for batch_start in range(0, batch_count, 5):
            batch_end = min(batch_start + 5, batch_count)
            batch_tasks = []
            
            print(f"\n🔄 开始第 {batch_start//5 + 1} 批次 ({batch_start+1}-{batch_end})...")
            
            # 交错发送请求：每3秒启动一个任务，但不等待完成
            for i in range(batch_start, batch_end):
                task_id = f"T{i+1:02d}"
                print(f"📤 [{task_id}] 发送请求 (不等待回复)")
                
                # 创建任务但不await，让它在后台运行
                task = asyncio.create_task(
                    create_single_poetry_async_sequential(session, user_query, config, task_id)
                )
                batch_tasks.append(task)
                
                # 如果不是批次内最后一个，等待3秒再发送下一个
                if i < batch_end - 1:
                    print(f"⏳ 等待 3 秒发送下一个请求...")
                    await asyncio.sleep(3)
            
            # 现在等待当前批次的所有任务完成（并发处理回复）
            print(f"🚀 等待 {len(batch_tasks)} 个请求的回复 (并发处理中)...")
            try:
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                # 处理批次结果
                for result in batch_results:
                    if isinstance(result, Exception):
                        print(f"❌ 任务执行异常: {result}")
                        results.append({'success': False, 'error': str(result)})
                    else:
                        results.append(result)
                        if result.get('success'):
                            print(f"✅ [{result['task_id']}] 创作完成")
                        else:
                            print(f"❌ [{result['task_id']}] 创作失败: {result.get('error', '未知错误')}")
                
            except Exception as e:
                print(f"❌ 批次执行异常: {e}")
                # 为失败的批次添加错误记录
                for i in range(batch_start, batch_end):
                    results.append({'success': False, 'error': str(e)})
            
            # 如果不是最后一批次，等待3秒再开始下一批次
            if batch_end < batch_count:
                print("⏳ 等待 3 秒后开始下一批次...")
                await asyncio.sleep(3)
    
    # 统计结果
    successful_count = sum(1 for r in results if r.get('success'))
    
    # 显示批量创作总结
    print(f"\n🎉 并发批量创作完成!")
    print(f"📊 成功: {successful_count}/{batch_count}")
    preview_dir = create_output_directory(user_query)
    print(f"📁 文件保存位置: {preview_dir}")
    
    # 显示最新作品预览
    if successful_count > 0:
        print(f"\n📖 最新作品预览:")
        print("-" * 40)
        # 找到最后一个成功的作品
        for result in reversed(results):
            if result.get('success') and 'filepath' in result:
                try:
                    with open(result['filepath'], 'r', encoding='utf-8') as f:
                        content = f.read()
                        # 只显示诗歌内容部分（跳过YAML front matter）
                        lines = content.split('\n')
                        poetry_start = None
                        for idx, line in enumerate(lines):
                            if line.strip() == '---' and idx > 0:
                                poetry_start = idx + 1
                                break
                        
                        if poetry_start:
                            poetry_content = '\n'.join(lines[poetry_start:poetry_start+10])
                            print(poetry_content)
                        else:
                            print(content[:300] + "...")
                        break
                except Exception as e:
                    print(f"预览文件时出错: {e}")
    
    return results

def display_batch_summary(results, successful_count, batch_count, output_dir):
    """显示批量创作总结"""
    print("\n" + "=" * 60)
    print("🎉 批量创作完成!")
    print(f"📊 成功: {successful_count}/{batch_count}")
    print(f"📁 文件保存位置: {output_dir}")
    
    if successful_count > 0:
        print(f"\n📖 最新作品预览:")
        print("-" * 40)
        # 显示最后一首成功作品的内容
        for result in reversed(results):
            if result['success']:
                filepath = result['filepath']
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # 只显示诗歌内容部分（跳过YAML front matter）
                        lines = content.split('\n')
                        poetry_start = None
                        for idx, line in enumerate(lines):
                            if line.strip() == '---' and idx > 0:
                                poetry_start = idx + 1
                                break
                        
                        if poetry_start:
                            poetry_content = '\n'.join(lines[poetry_start:poetry_start+10])
                            print(poetry_content)
                        else:
                            print(content[:300] + "...")
                    break
                except Exception as e:
                    print(f"预览文件时出错: {e}")

def test_with_sample_api():
    """单次测试模式"""
    print("🧪 单次API测试模式")
    print("=" * 60)
    
    try:
        # 1. 加载配置
        config = load_configuration()
        print("✅ 配置加载成功")
        
        # 2. 获取用户输入
        print("\n📝 请输入测试查询:")
        user_query = input(">>> ").strip()
        
        if not user_query:
            print("❌ 输入不能为空")
            return
        
        # 3. 执行单次创作
        print(f"\n🎯 开始测试创作...")
        result = create_single_poetry(user_query, config)
        
        if result['success']:
            print("\n" + "=" * 60)
            print("🎉 测试创作成功!")
            print(f"📁 文件已保存: {result['filepath']}")
            
            # 预览文件内容
            print("\n📖 文件内容预览:")
            print("-" * 40)
            with open(result['filepath'], 'r', encoding='utf-8') as f:
                content = f.read()
                preview = content[:500] + "..." if len(content) > 500 else content
                print(preview)
            
            return result['filepath']
        else:
            print(f"❌ 测试失败: {result.get('error', '未知错误')}")
            return None
            
    except Exception as e:
        print(f"❌ 测试过程出错: {e}")
        return None

def main():
    """主函数 - 陆家明AI诗人创作工具"""
    print("🎨 陆家明AI诗人创作工具")
    print("基于Dify双Agent对抗博弈系统 + YAML metadata自动保存")
    print("=" * 60)
    
    while True:
        print("\n📋 请选择功能模式:")
        print("1. 🎯 单次创作 - 输入查询，创作一首诗")
        print("2. 🚀 批量创作 - 支持串行/交错并发模式")
        print("3. 👋 退出")
        
        choice = input("\n请输入选择 (1-3): ").strip()
        
        if choice == "1":
            test_with_sample_api()
        elif choice == "2":
            batch_create_poetry()
        elif choice == "3":
            print("👋 感谢使用陆家明AI诗人创作工具！")
            break
        else:
            print("❌ 无效选择，请重新输入")
        
        # 每次操作后询问是否继续
        if choice in ["1", "2"]:
            print("\n" + "=" * 60)
            continue_choice = input("继续使用？(Y/n): ").strip().lower()
            if continue_choice == 'n':
                print("👋 感谢使用陆家明AI诗人创作工具！")
                break

if __name__ == "__main__":
    main()
