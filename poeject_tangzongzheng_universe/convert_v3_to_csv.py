#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
李尤台知识库v3版本转CSV脚本
基于v3重排序版本MD文件生成CSV格式，包含ID、序号、标题分离字段
"""

import pandas as pd
import re
import os
from typing import List, Dict

def parse_v3_perception_patterns(file_path: str) -> List[Dict]:
    """解析v3版感知流模式知识库"""
    print(f"📖 正在解析: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    patterns = []
    
    # 提取所有感知流模式条目
    pattern_blocks = re.findall(r'### 感知流模式\d+\n\n(.*?)(?=\n---|\n### |$)', content, re.DOTALL)
    
    for block in pattern_blocks:
        # 提取各字段
        id_match = re.search(r'\*\*ID\*\*: (.+)', block)
        poem_collection = re.search(r'\*\*诗集名称\*\*: (.+)', block)
        section = re.search(r'\*\*辑名\*\*: (.+)', block)
        sequence = re.search(r'\*\*序号\*\*: (.+)', block)
        title = re.search(r'\*\*标题\*\*: (.+)', block)
        dominant_senses = re.search(r'\*\*主导感官\*\*: (.+)', block)
        perception_flow = re.search(r'\*\*感知流动模式\*\*: (.+)', block)
        imagery_sequence = re.search(r'\*\*关键意象序列\*\*: (.+)', block)
        
        if all([id_match, poem_collection, section, sequence, title, dominant_senses, perception_flow, imagery_sequence]):
            patterns.append({
                'ID': id_match.group(1).strip(),
                '诗集名称': poem_collection.group(1).strip(),
                '辑名': section.group(1).strip(),
                '序号': sequence.group(1).strip(),
                '标题': title.group(1).strip(),
                '主导感官': dominant_senses.group(1).strip(),
                '感知流动模式': perception_flow.group(1).strip(),
                '关键意象序列': imagery_sequence.group(1).strip()
            })
    
    print(f"   ✅ 提取到 {len(patterns)} 条感知流模式")
    return patterns

def parse_v3_ironic_mechanisms(file_path: str) -> List[Dict]:
    """解析v3版反讽解构机制知识库"""
    print(f"📖 正在解析: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    mechanisms = []
    
    # 提取所有解构机制条目
    mechanism_blocks = re.findall(r'### 解构机制\d+\n\n(.*?)(?=\n---|\n### |$)', content, re.DOTALL)
    
    for block in mechanism_blocks:
        # 提取各字段
        id_match = re.search(r'\*\*ID\*\*: (.+)', block)
        poem_collection = re.search(r'\*\*诗集名称\*\*: (.+)', block)
        section = re.search(r'\*\*辑名\*\*: (.+)', block)
        sequence = re.search(r'\*\*序号\*\*: (.+)', block)
        title = re.search(r'\*\*标题\*\*: (.+)', block)
        emotional_tone = re.search(r'\*\*核心情感基调\*\*: (.+)', block)
        polarity_score = re.search(r'\*\*情感极性评分\*\*: (.+)', block)
        related_themes = re.search(r'\*\*关联主题\*\*: (.+)', block)
        role_function = re.search(r'\*\*我的功能角色\*\*: (.+)', block)
        
        if all([id_match, poem_collection, section, sequence, title, emotional_tone, polarity_score, related_themes, role_function]):
            mechanisms.append({
                'ID': id_match.group(1).strip(),
                '诗集名称': poem_collection.group(1).strip(),
                '辑名': section.group(1).strip(),
                '序号': sequence.group(1).strip(),
                '标题': title.group(1).strip(),
                '核心情感基调': emotional_tone.group(1).strip(),
                '情感极性评分': polarity_score.group(1).strip(),
                '关联主题': related_themes.group(1).strip(),
                '我的功能角色': role_function.group(1).strip()
            })
    
    print(f"   ✅ 提取到 {len(mechanisms)} 条解构机制")
    return mechanisms

def parse_v3_juxtaposition_logic(file_path: str) -> List[Dict]:
    """解析v3版意象并置逻辑知识库"""
    print(f"📖 正在解析: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    logics = []
    
    # 提取所有并置逻辑条目
    logic_blocks = re.findall(r'### 并置逻辑\d+\n\n(.*?)(?=\n---|\n### |$)', content, re.DOTALL)
    
    for block in logic_blocks:
        # 提取各字段
        id_match = re.search(r'\*\*ID\*\*: (.+)', block)
        poem_collection = re.search(r'\*\*诗集名称\*\*: (.+)', block)
        section = re.search(r'\*\*辑名\*\*: (.+)', block)
        sequence = re.search(r'\*\*序号\*\*: (.+)', block)
        title = re.search(r'\*\*标题\*\*: (.+)', block)
        triggers = re.search(r'\*\*潜在触发器\*\*: (.+)', block)
        
        # 生成逻辑链可能是多行的，需要特殊处理
        logic_chain_match = re.search(r'\*\*生成逻辑链\*\*: (.+?)(?=\n\*\*|$)', block, re.DOTALL)
        logic_chain = logic_chain_match.group(1).strip().replace('\n', ' ') if logic_chain_match else ''
        
        disabled_elements = re.search(r'\*\*禁用元素\*\*: (.+)', block)
        vocabulary = re.search(r'\*\*核心词汇库\*\*: (.+)', block)
        
        if all([id_match, poem_collection, section, sequence, title, triggers, logic_chain, disabled_elements, vocabulary]):
            logics.append({
                'ID': id_match.group(1).strip(),
                '诗集名称': poem_collection.group(1).strip(),
                '辑名': section.group(1).strip(),
                '序号': sequence.group(1).strip(),
                '标题': title.group(1).strip(),
                '潜在触发器': triggers.group(1).strip(),
                '生成逻辑链': logic_chain,
                '禁用元素': disabled_elements.group(1).strip(),
                '核心词汇库': vocabulary.group(1).strip()
            })
    
    print(f"   ✅ 提取到 {len(logics)} 条并置逻辑")
    return logics

def main():
    """主函数"""
    print("🚀 李尤台知识库v3版本转CSV脚本启动...")
    
    # 定义文件路径
    files_config = [
        {
            'input': '李尤台感知流模式知识库_v3.md',
            'output': '李尤台感知流模式知识库_v3.csv',
            'parser': parse_v3_perception_patterns,
            'name': '感知流模式'
        },
        {
            'input': '李尤台反讽解构机制知识库_v3.md',
            'output': '李尤台反讽解构机制知识库_v3.csv', 
            'parser': parse_v3_ironic_mechanisms,
            'name': '反讽解构机制'
        }
    ]
    
    # 检查意象并置逻辑v3文件是否存在
    if os.path.exists('李尤台意象并置逻辑知识库_v3.md'):
        files_config.append({
            'input': '李尤台意象并置逻辑知识库_v3.md',
            'output': '李尤台意象并置逻辑知识库_v3.csv',
            'parser': parse_v3_juxtaposition_logic,
            'name': '意象并置逻辑'
        })
    else:
        print("⚠️  意象并置逻辑知识库_v3.md 文件不存在，跳过处理")
    
    total_records = 0
    
    # 处理每个文件
    for config in files_config:
        if os.path.exists(config['input']):
            try:
                # 解析数据
                data = config['parser'](config['input'])
                
                # 转换为DataFrame
                df = pd.DataFrame(data)
                
                # 保存为CSV
                df.to_csv(config['output'], index=False, encoding='utf-8-sig')
                
                print(f"✅ {config['name']}知识库v3版CSV生成完成: {len(data)} 条记录")
                print(f"   📁 文件: {config['output']}")
                
                total_records += len(data)
                
            except Exception as e:
                print(f"❌ 处理 {config['input']} 时出错: {e}")
        else:
            print(f"⚠️  文件不存在: {config['input']}")
    
    print("\n" + "="*60)
    print("📊 v3版本CSV转换完成统计")
    print("="*60)
    print(f"生成CSV文件: {len([c for c in files_config if os.path.exists(c['input'])])} 个")
    print(f"总记录数: {total_records} 条")
    print("🎯 v3版本特性: 全局ID字段 + 序号标题分离 + ID统一排序")
    print("✅ 所有v3版CSV文件已生成，可直接导入DIFY平台！")

if __name__ == "__main__":
    main()
