#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
唐宗正宇宙诗歌数据JSON转CSV工具
将 tangzongzheng-poems.json 转换为 CSV 格式
"""

import json
import csv
import os
from datetime import datetime


def convert_json_to_csv(json_file_path, csv_file_path):
    """
    将JSON格式的诗歌数据转换为CSV格式
    
    Args:
        json_file_path (str): 输入的JSON文件路径
        csv_file_path (str): 输出的CSV文件路径
    """
    
    # 读取JSON文件
    print(f"正在读取JSON文件: {json_file_path}")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 提取诗歌数据
    poems = data.get('poems', [])
    metadata = data.get('metadata', {})
    
    print(f"发现 {len(poems)} 首诗歌")
    print(f"数据源: {metadata.get('data_source', 'N/A')}")
    print(f"版本: {metadata.get('version', 'N/A')}")
    
    # 定义CSV列名
    fieldnames = [
        'id',
        'title', 
        'author',
        'collection',
        'section',
        'sectionNumber',
        'sequence',
        'date',
        'body'
    ]
    
    # 写入CSV文件
    print(f"正在写入CSV文件: {csv_file_path}")
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        # 写入表头
        writer.writeheader()
        
        # 写入数据行
        for poem in poems:
            # 处理诗歌正文中的换行符，将\r\n转换为空格或保持原样
            body = poem.get('body', '').replace('\r\n', '\n')
            
            row = {
                'id': poem.get('id', ''),
                'title': poem.get('title', ''),
                'author': poem.get('author', ''),
                'collection': poem.get('collection', ''),
                'section': poem.get('section', ''),
                'sectionNumber': poem.get('sectionNumber', ''),
                'sequence': poem.get('sequence', ''),
                'date': poem.get('date', ''),
                'body': body
            }
            writer.writerow(row)
    
    print(f"转换完成！CSV文件已保存至: {csv_file_path}")
    
    # 打印统计信息
    print("\n=== 转换统计 ===")
    print(f"总诗歌数: {len(poems)}")
    
    # 按诗集统计
    collections = {}
    sections = {}
    for poem in poems:
        collection = poem.get('collection', 'Unknown')
        section = poem.get('section', 'Unknown')
        
        collections[collection] = collections.get(collection, 0) + 1
        sections[section] = sections.get(section, 0) + 1
    
    print(f"诗集分布:")
    for collection, count in collections.items():
        print(f"  {collection}: {count} 首")
    
    print(f"章节分布:")
    for section, count in sections.items():
        print(f"  {section}: {count} 首")


def main():
    """主函数"""
    # 文件路径
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_file = os.path.join(current_dir, 'tangzongzheng-poems.json')
    
    # 生成CSV文件名（带时间戳）
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    csv_file = os.path.join(current_dir, f'tangzongzheng-poems_{timestamp}.csv')
    
    # 检查JSON文件是否存在
    if not os.path.exists(json_file):
        print(f"错误: JSON文件不存在: {json_file}")
        return
    
    try:
        convert_json_to_csv(json_file, csv_file)
        print(f"\n✅ 成功完成JSON到CSV的转换!")
        
    except Exception as e:
        print(f"❌ 转换过程中发生错误: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

