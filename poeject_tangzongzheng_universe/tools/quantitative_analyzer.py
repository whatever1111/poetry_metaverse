#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
李尤台诗歌风格量化分析器 (Quantitative Style Analyzer for Li Youtai)

基于《李尤台诗歌风格量化定义书》，对诗歌语料进行8个核心指标的自动化计算：
1. SVUR - 高频感官词库使用率
2. PVUR - 高频心理词库使用率  
3. SPS - 情感极性得分
4. MSL - 平均句长
5. SFI - 句法碎片化指数
6. FPPF - 第一人称代词频率
7. PND - 专有名词密度
8. SDS - 思辨度评分

作者: AI Assistant
创建时间: 2025年
"""

import json
import os
import re
import csv
from collections import Counter
import jieba
import jieba.posseg as pseg
from snownlp import SnowNLP

# --- 配置区 ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_JSON_PATH = os.path.join(SCRIPT_DIR, '..', 'tangzongzheng-poems.json')
OUTPUT_CSV_PATH = os.path.join(SCRIPT_DIR, '..', 'data', 'quantitative_analysis_results.csv')
USER_DICT_PATH = os.path.join(SCRIPT_DIR, 'user_dict.txt')

# --- 词库定义 (基于语料分析报告) ---

# 高频感官词库 (源自Top 20名词列表)
SENSORY_VOCAB = {
    '人', '偶记', '时', '东西', '身体', '世界', '事情', '声音', 
    '感觉', '手', '时间', '地方', '北京', '君子', '力量', '屏幕', 
    '女子', '手指', '风', '照片'
}

# 高频心理词库 (源自Top 20形容词列表)
PSYCHOLOGICAL_VOCAB = {
    '好', '大', '充满', '快乐', '红', '小', '完全', '无聊', 
    '巨大', '最', '全', '老', '绿', '均匀', '紧张', '痛苦', 
    '累', '幸福', '恐怖', '粗糙'
}

# 思辨词库 (源自量化定义书)
SPECULATIVE_VOCAB = {
    '存在', '虚无', '意义', '结构', '自由', '道德', '真理', 
    '永恒', '秩序', '经验', '历史', '哲学', '本质', '现象', 
    '认识', '理性', '感性', '精神', '物质', '时空'
}

# 句子分隔符
SENTENCE_DELIMITERS = re.compile(r'[。！？，；]')

# 停用词和符号 (过滤用)
STOP_SYMBOLS = {'，', '。', '、', '：', '；', '？', '！', '"', '"', ''', ''', 
                '（', '）', '《', '》', '【', '】', '…', '—', ' ', '\n', '\t'}

# --- 工具函数区 ---

def load_poems_data(file_path):
    """加载诗歌数据"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        poems_data = data.get('poems', [])
        if not poems_data:
            print("警告: 在JSON文件中没有找到 'poems' 列表或列表为空。")
            return []
        
        print(f"成功加载 {len(poems_data)} 首诗歌")
        return poems_data
    
    except FileNotFoundError:
        print(f"错误: 输入文件未找到 at '{file_path}'")
        return []
    except json.JSONDecodeError:
        print(f"错误: JSON文件格式错误 at '{file_path}'")
        return []

def clean_and_tokenize(text):
    """清理文本并分词"""
    # 加载自定义词典
    jieba.load_userdict(USER_DICT_PATH)
    
    # 移除换行符和多余空格
    text = re.sub(r'\s+', '', text)
    
    # 使用jieba进行精确分词
    words = list(jieba.cut(text, cut_all=False))
    
    # 过滤停用符号
    words = [w for w in words if w not in STOP_SYMBOLS and w.strip()]
    
    return words

def split_sentences(text):
    """将文本切分为句子"""
    # 根据标点符号切分句子
    sentences = SENTENCE_DELIMITERS.split(text)
    # 过滤空句子
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences

# --- 指标计算函数区 ---

def calculate_svur(words):
    """计算高频感官词库使用率 (SVUR)"""
    if not words:
        return 0.0
    
    sensory_count = sum(1 for word in words if word in SENSORY_VOCAB)
    return (sensory_count / len(words)) * 100

def calculate_pvur(words):
    """计算高频心理词库使用率 (PVUR)"""
    if not words:
        return 0.0
    
    psychological_count = sum(1 for word in words if word in PSYCHOLOGICAL_VOCAB)
    return (psychological_count / len(words)) * 100

def calculate_sps(text):
    """计算情感极性得分 (SPS)"""
    try:
        s = SnowNLP(text)
        # SnowNLP返回0-1的值，转换为-1到1的范围
        # 0.5为中性，<0.5为负向，>0.5为正向
        polarity = (s.sentiments - 0.5) * 2
        return round(polarity, 3)
    except:
        # 如果分析失败，返回中性值
        return 0.0

def calculate_msl(text):
    """计算平均句长 (MSL)"""
    sentences = split_sentences(text)
    if not sentences:
        return 0.0
    
    total_words = 0
    for sentence in sentences:
        words = clean_and_tokenize(sentence)
        total_words += len(words)
    
    return round(total_words / len(sentences), 2)

def calculate_sfi(text):
    """计算句法碎片化指数 (SFI)"""
    sentences = split_sentences(text)
    if not sentences:
        return 0.0
    
    # 统计词数<=5的碎片句
    fragment_count = 0
    for sentence in sentences:
        words = clean_and_tokenize(sentence)
        if len(words) <= 5:
            fragment_count += 1
    
    return round((fragment_count / len(sentences)) * 100, 2)

def calculate_fppf(words):
    """计算第一人称代词频率 (FPPF)"""
    if not words:
        return 0.0
    
    wo_count = sum(1 for word in words if word == '我')
    return round((wo_count / len(words)) * 1000, 2)

def calculate_pnd(text):
    """计算专有名词密度 (PND)"""
    words = clean_and_tokenize(text)
    if not words:
        return 0.0
    
    # 使用jieba词性标注识别专有名词
    proper_noun_count = 0
    word_pairs = pseg.cut(text)
    
    for word, flag in word_pairs:
        # nr: 人名, ns: 地名, nt: 机构名, nz: 其他专名
        if flag in ['nr', 'ns', 'nt', 'nz']:
            proper_noun_count += 1
    
    return round((proper_noun_count / len(words)) * 1000, 2)

def calculate_sds(words):
    """计算思辨度评分 (SDS)"""
    if not words:
        return 0.0
    
    speculative_count = sum(1 for word in words if word in SPECULATIVE_VOCAB)
    return round((speculative_count / len(words)) * 1000, 2)

def analyze_single_poem(poem):
    """分析单首诗歌，返回所有指标"""
    poem_id = poem.get('id', 'unknown')
    title = poem.get('title', 'unknown')
    body = poem.get('body', '')
    
    if not body:
        print(f"警告: 诗歌 {poem_id} 内容为空")
        return None
    
    # 分词处理
    words = clean_and_tokenize(body)
    
    # 计算所有8个指标
    metrics = {
        'poem_id': poem_id,
        'title': title,
        'svur': round(calculate_svur(words), 2),
        'pvur': round(calculate_pvur(words), 2),
        'sps': calculate_sps(body),
        'msl': calculate_msl(body),
        'sfi': calculate_sfi(body),
        'fppf': calculate_fppf(words),
        'pnd': calculate_pnd(body),
        'sds': calculate_sds(words)
    }
    
    return metrics

def generate_csv_report(results, output_path):
    """生成CSV格式的分析报告"""
    if not results:
        print("错误: 没有数据可以写入CSV文件")
        return
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # CSV表头
    fieldnames = ['poem_id', 'title', 'svur', 'pvur', 'sps', 'msl', 'sfi', 'fppf', 'pnd', 'sds']
    
    try:
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # 写入表头
            writer.writeheader()
            
            # 写入数据
            for result in results:
                writer.writerow(result)
        
        print(f"CSV报告已成功生成: {output_path}")
        print(f"共分析 {len(results)} 首诗歌")
        
    except IOError as e:
        print(f"错误: 无法写入CSV文件 '{output_path}'. 原因: {e}")

def print_sample_results(results, sample_count=3):
    """打印样本结果用于人工验证"""
    print(f"\n=== 样本结果展示 (前 {sample_count} 首) ===")
    
    for i, result in enumerate(results[:sample_count]):
        print(f"\n第 {i+1} 首: {result['title']} (ID: {result['poem_id']})")
        print(f"  SVUR: {result['svur']}%")
        print(f"  PVUR: {result['pvur']}%") 
        print(f"  SPS:  {result['sps']}")
        print(f"  MSL:  {result['msl']}")
        print(f"  SFI:  {result['sfi']}%")
        print(f"  FPPF: {result['fppf']}")
        print(f"  PND:  {result['pnd']}")
        print(f"  SDS:  {result['sds']}")

# --- 主程序区 ---

def main():
    """主执行函数"""
    print("开始执行李尤台诗歌风格量化分析...")
    
    # 1. 加载诗歌数据
    poems_data = load_poems_data(INPUT_JSON_PATH)
    if not poems_data:
        print("错误: 无法加载诗歌数据，程序退出")
        return
    
    # 2. 逐首分析诗歌
    print("正在进行量化分析...")
    results = []
    
    for i, poem in enumerate(poems_data, 1):
        print(f"处理第 {i}/{len(poems_data)} 首: {poem.get('title', 'unknown')}")
        
        metrics = analyze_single_poem(poem)
        if metrics:
            results.append(metrics)
    
    # 3. 生成CSV报告
    print("\n正在生成CSV报告...")
    generate_csv_report(results, OUTPUT_CSV_PATH)
    
    # 4. 展示样本结果
    print_sample_results(results)
    
    print(f"\n=== 分析完成 ===")
    print(f"成功分析了 {len(results)} 首诗歌")
    print(f"结果已保存到: {OUTPUT_CSV_PATH}")

if __name__ == "__main__":
    main()
