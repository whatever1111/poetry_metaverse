# 陆家明AI诗人 - 基线LLM D节点分析

## 📝 D节点概览

**D节点（判别器）共2个**:
- **D1**: 评审G1的初次创作
- **D2**: 评审G2的修改结果

---

## ⚖️ D1节点 (1756701800237)

### 模型设置
```yaml
model:
  completion_params: {}
  mode: chat
  name: gemini-2.5-pro
  provider: langgenius/gemini/google
```

### 提示词配置
**System提示词**:
```
你是AI文学批评家"判官"，专门负责诗歌评审环节。你需要基于检索到的评审标准对诗歌进行严格评估。


知识库参考：

{{#1756965762105.output#}}

{{#1756965735142.output#}}

规则格式参考：

{{#1756963597193.output#}}


评估任务：

1. 检查结构完整性（标题格式、首句规则、篇幅控制）

2. 验证引文真实性（引文格式、出处匹配、内容核实）  

3. 评估风格保真度（与系列基线的相似度）

4. 判断证据充足度（知识库支撑程度）

5. 生成错误码（如发现问题）

6. 提供改进建议（针对性指导）



评估标准：

硬门禁检查（必须全部通过）：

- 标题格式：严格遵循系列格式要求

- 系列首句：特殊首句规则 

- 正文篇幅：≤80字（不含标题和引文）

- 引文验证：格式正确、出处匹配、内容真实



软指标评估：

- 风格保真度：0.00-1.00，≥0.40为合格

- 证据充足度：高/中/低



裁决逻辑：

发表条件：所有硬门禁通过 且 风格保真度≥0.40

驳回条件：任一硬门禁失败 或 风格保真度<0.40



错误码系统：

TITLE_FORMAT_INVALID：标题格式错误

CHAPTER_NAME_INVALID：篇章名不在允许范围  

FIRST_LINE_CONFLICT：系列首句互斥失败

LENGTH_EXCEEDS：正文字数超出80字限制

CITATION_FORMAT_INVALID：引文格式错误

CITATION_NOT_FOUND_IN_CANON：引文在正典域未找到

CITATION_SOURCE_MISMATCH：引文出处与系列不匹配

STYLE_FAITHFULNESS_LOW：风格保真度过低



改进建议原则：

1. 具体可操作，明确指出问题所在

2. 避免触发词，不在建议中使用"发表"或"驳回"等路由关键词

3. 建设性指导，重点提升而非纯粹批评

4. 基于检索到的评审标准提供针对性修改方向



直接输出JSON格式评估结果，无需解释过程。
```

**User提示词**:
```
{{#1756699910424.text#}}
```

### Jinja2变量配置
```yaml
prompt_config:
  jinja2_variables:
  - value_selector:
    - '1756699728276'
    - result
    variable: result
```

### 结构化输出配置
```yaml
structured_output:
  schema:
    properties:
      引文验证状态:
        description: 引文格式、出处匹配、真实性核验结果
        enum:
        - 通过
        - 失败
        - 无引文
        type: string
      改进建议:
        description: 具体可操作的改进建议，无问题时为空字符串
        type: string
      最终裁决:
        description: 基于所有评估维度的最终裁决
        enum:
        - 发表
        - 驳回
        type: string
      结构完整性:
        description: 标题格式、首句规则、篇幅控制的整体检查结果
        enum:
        - 合规
        - 不合规
        type: string
      证据充足度:
        description: 知识库支撑和论证逻辑的充分程度
        enum:
        - 高
        - 中
        - 低
        type: string
      错误码:
        description: 逗号分隔的错误码列表，无错误时为空字符串
        type: string
      风格保真度:
        description: 与系列基线的风格相似度评分，取值范围0-1
        maximum: 1
        minimum: 0
        type: number
    required:
    - 最终裁决
    - 结构完整性
    - 引文验证状态
    - 风格保真度
    - 证据充足度
    - 错误码
    - 改进建议
    type: object
  structured_output_enabled: true
```

### 其他配置
- **上下文**: 未启用
- **视觉**: 未启用
- **变量**: 无自定义变量

---

## ⚖️ D2节点 (17569676735610)

### 模型设置
```yaml
model:
  completion_params: {}
  mode: chat
  name: gemini-2.5-pro
  provider: langgenius/gemini/google
```

### 提示词配置
**System提示词**:
```
你是AI文学批评家"判官"，专门负责诗歌评审环节。你需要基于检索到的评审标准对诗歌进行严格评估。


知识库参考：

{{#1756965762105.output#}}

{{#1756965735142.output#}}

规则格式参考：

{{#1756963597193.output#}}


评估任务：

1. 检查结构完整性（标题格式、首句规则、篇幅控制）

2. 验证引文真实性（引文格式、出处匹配、内容核实）  

3. 评估风格保真度（与系列基线的相似度）

4. 判断证据充足度（知识库支撑程度）

5. 生成错误码（如发现问题）

6. 提供改进建议（针对性指导）



评估标准：

硬门禁检查（必须全部通过）：

- 标题格式：严格遵循系列格式要求

- 系列首句：特殊首句规则 

- 正文篇幅：≤80字（不含标题和引文）

- 引文验证：格式正确、出处匹配、内容真实



软指标评估：

- 风格保真度：0.00-1.00，≥0.40为合格

- 证据充足度：高/中/低



裁决逻辑：

发表条件：所有硬门禁通过 且 风格保真度≥0.40

驳回条件：任一硬门禁失败 或 风格保真度<0.40



错误码系统：

TITLE_FORMAT_INVALID：标题格式错误

CHAPTER_NAME_INVALID：篇章名不在允许范围  

FIRST_LINE_CONFLICT：系列首句互斥失败

LENGTH_EXCEEDS：正文字数超出80字限制

CITATION_FORMAT_INVALID：引文格式错误

CITATION_NOT_FOUND_IN_CANON：引文在正典域未找到

CITATION_SOURCE_MISMATCH：引文出处与系列不匹配

STYLE_FAITHFULNESS_LOW：风格保真度过低



改进建议原则：

1. 具体可操作，明确指出问题所在

2. 避免触发词，不在建议中使用"发表"或"驳回"等路由关键词

3. 建设性指导，重点提升而非纯粹批评

4. 基于检索到的评审标准提供针对性修改方向



直接输出JSON格式评估结果，无需解释过程。
```

**User提示词**:
```
{{#17569669412190.text#}}
```

### Jinja2变量配置
```yaml
prompt_config:
  jinja2_variables:
  - value_selector:
    - '1756699728276'
    - result
    variable: result
```

### 结构化输出配置
```yaml
structured_output:
  schema:
    properties:
      引文验证状态:
        description: 引文格式、出处匹配、真实性核验结果
        enum:
        - 通过
        - 失败
        - 无引文
        type: string
      改进建议:
        description: 具体可操作的改进建议，无问题时为空字符串
        type: string
      最终裁决:
        description: 基于所有评估维度的最终裁决
        enum:
        - 发表
        - 驳回
        type: string
      结构完整性:
        description: 标题格式、首句规则、篇幅控制的整体检查结果
        enum:
        - 合规
        - 不合规
        type: string
      证据充足度:
        description: 知识库支撑和论证逻辑的充分程度
        enum:
        - 高
        - 中
        - 低
        type: string
      错误码:
        description: 逗号分隔的错误码列表，无错误时为空字符串
        type: string
      风格保真度:
        description: 与系列基线的风格相似度评分，取值范围0-1
        maximum: 1
        minimum: 0
        type: number
    required:
    - 最终裁决
    - 结构完整性
    - 引文验证状态
    - 风格保真度
    - 证据充足度
    - 错误码
    - 改进建议
    type: object
  structured_output_enabled: true
```

### 其他配置
- **上下文**: 未启用
- **视觉**: 未启用
- **变量**: 无自定义变量

---

## 🔀 D节点变量引用汇总

### 共同引用变量（System）
- `{{#1756965762105.output#}}` - 正典域转换输出
- `{{#1756965735142.output#}}` - 风格域转换输出
- `{{#1756963597193.output#}}` - 规则转换输出

### D1专用变量（User）
- `{{#1756699910424.text#}}` - G1的诗歌创作输出

### D2专用变量（User）
- `{{#17569669412190.text#}}` - G2的诗歌创作输出

### Jinja2变量（两个D节点相同）
- `result` - 来自风格域知识库检索结果 `{{1756699728276.result}}`

---

## 🎯 路由条件配置

### 条件分支1 (针对D1)
```yaml
cases:
- case_id: 'true'
  conditions:
  - comparison_operator: is
    value: 发表
    varType: string
    variable_selector:
    - '1756701800237'
    - structured_output
    - 最终裁决
```

### 条件分支2 (针对D2)
```yaml
cases:
- case_id: 'true'
  conditions:
  - comparison_operator: is
    value: 发表
    varType: string
    variable_selector:
    - '17569676735610'
    - structured_output
    - 最终裁决
```

---

## 📊 D节点配置对比

| 节点 | 模型 | 输入来源 | 结构化输出 | 路由条件 |
|------|------|----------|------------|----------|
| D1 | gemini-2.5-pro | G1的输出 | 7个必填字段 | 最终裁决=="发表" |
| D2 | gemini-2.5-pro | G2的输出 | 7个必填字段 | 最终裁决=="发表" |

### 结构化输出字段说明
1. **最终裁决**: "发表" 或 "驳回" (路由关键字段)
2. **结构完整性**: "合规" 或 "不合规"
3. **引文验证状态**: "通过" 或 "失败" 或 "无引文"
4. **风格保真度**: 0.00-1.00 的数值评分
5. **证据充足度**: "高" 或 "中" 或 "低"
6. **错误码**: 逗号分隔的错误码列表
7. **改进建议**: 具体的修改建议文本

---
*生成时间: 2025-01-11*
*基于YML版本: 0.4.0*
