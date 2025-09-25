# 唐宗正宇宙量化分析 TODO - 阶段B文档

> **🤖 AI 助手注意 (AI Assistant Attention)**
> 在执行本文件中的任何任务前，你必须首先阅读并严格遵守位于 `documentation/ai-collaboration-guide.md` 的全局协作指南。

## 目标
**唐宗正宇宙量化分析（阶段B）**：基于《李尤台诗歌深读分析报告v2.txt》中提出的可量化指标，为李尤台的诗歌风格构建一个数据驱动的、可测量的分析模型。本阶段的核心任务是从定性分析**升级**到定量分析，为AI生成工作流提供精确、科学的“风格配方”，从根本上解决“创造性窒息”问题。

**核心价值**：
- **建立实证基础**：通过对原始语料的自动化统计分析，为核心词库等关键指标提供可复现的、数据驱动的证据。
- **建立风格量化模型**：将诗歌风格拆解为一系列可测量、可比较的数字指纹。
- **驱动AI工作流进化**：为下一阶段的AI生成策略提供精确的、量化的优化目标。

## 范围与约束

- **数据源**: `poeject_tangzongzheng_universe/tangzongzheng-poems.json`。
- **核心约束**: 所有量化指标的定义，特别是核心词库，必须源自对原始语料的自动化统计分析结果。
- **工作边界**: 本阶段专注于**语料分析、指标定义、模型构建和理论设计**。不包含对Dify应用的直接修改。

## 任务列表

---

### **阶段B：风格量化模型构建**

#### - [x] 任务B.1：词频与词性分析脚本开发及报告生成
- **核心思想**: 在定义任何指标前，首先通过开发一个自动化脚本对全部99首诗歌语料进行基础的NLP分析（分词、词性标注、词频统计），生成一份客观的、数据驱动的语料分析报告，作为所有后续工作无可争议的实证基础。
- **交付物**:
  - [x] `poeject_tangzongzheng_universe/tools/corpus_analyzer.py`: 实现语料分析逻辑的Python脚本。
  - [x] `documentation/tangzongzheng_corpus_analysis_report.md`: 自动生成的语料分析报告，包含高频词、不同词性的高频词列表等。
- **验收标准**:
  - [x] 脚本能够成功读取 `tangzongzheng-poems.json` 并生成一份结构清晰的Markdown格式报告。
  - [x] 报告中应至少包含Top 30总高频词、Top 20名词、Top 20形容词、Top 20动词列表。
  - [x] 脚本代码清晰，有必要的注释。
- **风险评估**: 低风险 - 为标准化NLP任务，现有库支持良好。
- **预期改动文件（预判）**:
  - `poeject_tangzongzheng_universe/tools/corpus_analyzer.py`
  - `documentation/tangzongzheng_corpus_analysis_report.md`
- **实际改动文件**: [`poeject_tangzongzheng_universe/tools/corpus_analyzer.py`, `poeject_tangzongzheng_universe/tools/user_dict.txt`, `poeject_tangzongzheng_universe/tangzongzheng_corpus_analysis_report.md`]
- **完成状态**: ✅ 已完成

#### - [x] 任务B.2：《风格量化定义书》修订与定稿
- **核心思想**: **严格基于B.1产出的《语料分析报告》**，重新审查并最终确定《风格量化定义书》中的8个核心指标。特别是高频感官/心理词库，必须从B.1的报告中选取，确保其数据来源的客观性。
- **交付物**:
  - [x] `poeject_tangzongzheng_universe/tangzongzheng_quantitative_metrics.md`: 一份经过数据验证并最终定稿的指标定义文档。
- **验收标准**:
  - [x] 文档中用于计算SVUR、PVUR、SDS的核心词库，必须明确注明其源自B.1的分析报告。
  - [x] 所有8个核心指标都有明确的、无歧义的、且经过数据验证的定义和计算方法。
- **风险评估**: 低风险 - 主要为理论和定义工作，但有了数据基础。
- **预期改动文件（预判）**:
  - `documentation/tangzongzheng_quantitative_metrics.md`
- **实际改动文件**: [`poeject_tangzongzheng_universe/tangzongzheng_quantitative_metrics.md`]
- **完成状态**: ✅ 已完成

#### - [x] 任务B.3："风格计算器"自动化分析脚本开发
- **核心思想**: 开发一个自动化的Python脚本，该脚本能够读取 `tangzongzheng-poems.json`，并**根据B.2中最终定稿的《风格量化定义书》**，为每首诗计算出全部8个核心指标，生成一份"风格体检报告"。
- **交付物**:
  - [x] `poeject_tangzongzheng_universe/tools/quantitative_analyzer.py`: 实现量化分析逻辑的Python脚本。
  - [x] `poeject_tangzongzheng_universe/data/quantitative_analysis_results.csv`: 包含99首诗歌及其对应8个量化指标的最终数据文件。
- **验收标准**:
  - [x] 脚本能够成功读取 `tangzongzheng-poems.json` 并为全部99首诗歌生成CSV输出。
  - [x] 输出的CSV文件包含99条记录，每条记录都有诗歌ID和8个完整的、格式正确的指标数据。
  - [x] 对脚本产出的数据进行3-5首诗歌的抽样人工核对，结果与预期一致。
- **风险评估**: 中风险 - SFI（句法碎片化指数）等自定义指标的算法实现可能需要调试。
- **预期改动文件（预判）**:
  - `poeject_tangzongzheng_universe/tools/quantitative_analyzer.py`
  - `poeject_tangzongzheng_universe/data/quantitative_analysis_results.csv`
- **实际改动文件**: [`poeject_tangzongzheng_universe/tools/quantitative_analyzer.py`, `poeject_tangzongzheng_universe/data/quantitative_analysis_results.csv`]
- **完成状态**: ✅ 已完成

#### - [x] 任务B.4："数据驱动"的AI生成策略与提示词V3设计
- **核心思想**: 基于B.3产出的量化数据，设计一套全新的、以达成可测量指标为目标的AI生成策略。将提示词从"风格模仿请求"重构为"量化目标指令"，让RAG知识库成为达成目标的"工具箱"而非模仿的唯一模板。
- **交付物**:
  - [x] `documentation/prompts/tangzongzheng_g1_prompt_v3.md`: 一份详细的G1节点提示词V3设计草案，清晰描述"目标指令"和"工具箱"的逻辑。
- **验收标准**:
  - [x] V3提示词草案明确包含接收"量化目标"作为输入的机制。
  - [x] 草案清晰地区分了作为"强制目标"的量化指标和作为"参考素材"的RAG知识库的角色。
- **风险评估**: 低风险 - 主要为理论和设计工作，为阶段C的实现做准备。
- **预期改动文件（预判）**:
  - `documentation/prompts/tangzongzheng_g1_prompt_v3.md`
- **实际改动文件**: [`documentation/prompts/tangzongzheng_g1_prompt_v3.md`]
- **完成状态**: ✅ 已完成

---
*本TODO基于陆家花园项目"数据治理优先，质量第一"的开发理念创建*
