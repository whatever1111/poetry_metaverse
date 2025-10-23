import json
from collections import Counter
import jieba
import jieba.posseg as pseg
import os

# --- 配置区 ---
# 获取脚本所在目录的绝对路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# 定义自定义词典路径
USER_DICT_PATH = os.path.join(SCRIPT_DIR, 'user_dict.txt')

# 定义文件路径 (使用绝对路径)
INPUT_JSON_PATH = os.path.join(SCRIPT_DIR, '..', 'tangzongzheng-poems.json')
OUTPUT_REPORT_PATH = os.path.join(SCRIPT_DIR, '..', 'tangzongzheng_corpus_analysis_report.md')
# 定义停用词和符号
STOP_WORDS = set(['的', '了', '在', '是', '它',
                    '一个', '一种', '一些', '这个', '那个', '这里', '那里', '什么', '怎么', '为什么',
                    '也', '和', '与', '或', '但', '然而', '所以', '因此', '因为', '由于',
                    '地', '得', '着', '过', '吧', '吗', '呢', '啊', '哦', '嗯', '哎'])
STOP_SYMBOLS = set(['，', '。', '、', '：', '；', '？', '！', '“', '”', '‘', '’', '（', '）', '《', '》',
                      '【', '】', '…', '—', ' ', '\n', '\t'])

# --- 函数定义区 ---

def load_corpus(file_path):
    """从JSON文件中加载诗歌数据，并合并成一个大的语料库字符串。"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 修正: 从顶层字典中获取 'poems' 列表
        poems_data = data.get('poems', [])
        if not poems_data:
            print("警告: 在JSON文件中没有找到 'poems' 列表或列表为空。")
            return ""

        corpus = ""
        for poem in poems_data:
            # 确保poem是字典
            if not isinstance(poem, dict):
                continue
            
            corpus += poem.get('title', '') + '\n'
            # 修正: 使用 'body' 键，并将其作为一个整体添加
            corpus += poem.get('body', '') + '\n'
        return corpus
    except FileNotFoundError:
        print(f"错误: 输入文件未找到 at '{file_path}'")
        return ""
    except json.JSONDecodeError:
        print(f"错误: JSON文件格式错误 at '{file_path}'")
        return ""

def analyze_corpus(corpus):
    """对语料库进行分词、词性标注和词频统计。"""
    # 加载自定义词典
    jieba.load_userdict(USER_DICT_PATH)

    words = []
    pos_words = {'n': [], 'v': [], 'a': []}  # n:名词, v:动词, a:形容词

    # 使用精确模式进行分词和词性标注
    word_pairs = pseg.cut(corpus)

    for word, flag in word_pairs:
        # 过滤停用词和符号
        if word in STOP_WORDS or word in STOP_SYMBOLS:
            continue
        
        words.append(word)
        
        # 按词性分类
        if flag.startswith('n'): # 名词 (n, nr, ns, nt, nz...)
            pos_words['n'].append(word)
        elif flag.startswith('v'): # 动词 (v, vd, vn...)
            pos_words['v'].append(word)
        elif flag.startswith('a'): # 形容词 (a, ad, an...)
            pos_words['a'].append(word)
            
    # 统计词频
    total_word_counts = Counter(words)
    noun_counts = Counter(pos_words['n'])
    verb_counts = Counter(pos_words['v'])
    adj_counts = Counter(pos_words['a'])
    
    return total_word_counts, noun_counts, verb_counts, adj_counts

def generate_report(total_counts, noun_counts, verb_counts, adj_counts, output_path):
    """生成Markdown格式的分析报告。"""
    report_content = "# 李尤台诗歌语料分析报告\n\n"
    report_content += "> 本报告由`corpus_analyzer.py`脚本自动生成，旨在为《风格量化定义书》提供客观、可复现的数据基础。\n\n"
    report_content += "## 1. 语料库总览\n\n"
    report_content += f"- **总词数 (Total Words)**: {sum(total_counts.values())}\n"
    report_content += f"- **独立词汇量 (Unique Words)**: {len(total_counts)}\n\n"
    report_content += "---\n\n"
    
    # --- 生成各类别Top N列表 ---
    def format_top_list(title, counter, n=20):
        content = f"### {title}\n\n"
        content += "| 排名 | 词语 | 频率 |\n"
        content += "|:----:|:----:|:----:|\n"
        for i, (word, count) in enumerate(counter.most_common(n), 1):
            content += f"| {i} | {word} | {count} |\n"
        return content + "\n"

    report_content += "## 2. 高频词统计\n\n"
    report_content += format_top_list("2.1 Top 30 总高频词", total_counts, 30)
    report_content += format_top_list("2.2 Top 20 名词 (Nouns)", noun_counts, 20)
    report_content += format_top_list("2.3 Top 20 动词 (Verbs)", verb_counts, 20)
    report_content += format_top_list("2.4 Top 20 形容词 (Adjectives)", adj_counts, 20)
    
    # 写入文件
    try:
        # 确保目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        print(f"报告已成功生成: {output_path}")
    except IOError as e:
        print(f"错误: 无法写入报告文件 '{output_path}'. 原因: {e}")

# --- 主程序区 ---

if __name__ == "__main__":
    print("开始执行语料分析脚本...")
    
    # 1. 加载语料
    corpus_text = load_corpus(INPUT_JSON_PATH)
    
    if corpus_text:
        # 2. 分析语料
        print("语料加载成功，正在进行分析...")
        total, nouns, verbs, adjs = analyze_corpus(corpus_text)
        
        # 3. 生成报告
        print("分析完成，正在生成报告...")
        generate_report(total, nouns, verbs, adjs, OUTPUT_REPORT_PATH)
    
    print("脚本执行完毕。")
