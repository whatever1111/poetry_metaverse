# D节点输出JSON Schema设计方案

> **设计版本**: v1.1 (修正版)  
> **目标模型**: GEMINI 2.5 Pro  
> **设计日期**: 2025-09-05  
> **适用场景**: 双Agent对抗博弈系统中的诗歌评估输出结构化  
> **优化目标**: 确保P节点能够可靠解析D节点的评估结果  
> **修正内容**: 将错误码空字符串改为NO_ERROR，解决GEMINI API限制

## 🚀 快速使用指南

**当前D节点存在的问题**：错误码字段为开放string类型，P节点无法可靠解析。

**优化方案**：将错误码改为枚举类型，确保输出的可预测性。

在Dify中更新D1/D2节点时，请使用以下优化后的JSON Schema。

## 🎯 设计目标

优化D节点的结构化输出，确保：
1. 错误码输出可预测（枚举约束）
2. P节点能够可靠解析所有字段
3. 保持与现有系统的兼容性

## 📋 D节点优化JSON Schema

### **优化后Schema（JSON格式）**
在Dify界面中填入Schema配置框时，请直接复制以下JSON内容：

```json
{
  "type": "object",
  "properties": {
    "最终裁决": {
      "type": "string",
      "description": "基于所有评估维度的最终裁决",
      "enum": ["发表", "驳回"]
    },
    "结构完整性": {
      "type": "string",
      "description": "标题格式、首句规则、篇幅控制的整体检查结果",
      "enum": ["合规", "不合规"]
    },
    "引文验证状态": {
      "type": "string",
      "description": "引文格式、出处匹配、真实性核验结果",
      "enum": ["通过", "失败", "无引文"]
    },
    "风格保真度": {
      "type": "number",
      "description": "与系列基线的风格相似度评分，取值范围0-1",
      "minimum": 0,
      "maximum": 1
    },
    "证据充足度": {
      "type": "string",
      "description": "知识库支撑和论证逻辑的充分程度",
      "enum": ["高", "中", "低"]
    },
    "错误码": {
      "type": "string",
      "description": "具体的错误类型，无错误时为NO_ERROR",
      "enum": [
        "NO_ERROR",
        "TITLE_FORMAT_INVALID",
        "CHAPTER_NAME_INVALID", 
        "FIRST_LINE_CONFLICT",
        "LENGTH_EXCEEDS",
        "CITATION_FORMAT_INVALID",
        "CITATION_NOT_FOUND_IN_CANON",
        "CITATION_SOURCE_MISMATCH",
        "STYLE_FAITHFULNESS_LOW"
      ]
    },
    "改进建议": {
      "type": "string",
      "description": "具体可操作的改进建议，无问题时为空字符串"
    }
  },
  "required": [
    "最终裁决",
    "结构完整性", 
    "引文验证状态",
    "风格保真度",
    "证据充足度",
    "错误码",
    "改进建议"
  ],
  "additionalProperties": false
}
```

## 🔧 关键优化点

### **1. 错误码枚举化**
**问题**：当前错误码为开放string，P节点无法可靠解析
```yaml
# 当前（有问题）
错误码:
  type: string
  description: 逗号分隔的错误码列表，无错误时为空字符串
```

**优化**：改为枚举类型，确保可预测性
```json
"错误码": {
  "type": "string",
  "enum": ["", "TITLE_FORMAT_INVALID", "CHAPTER_NAME_INVALID", ...]
}
```

### **2. 单一错误码原则**
**变更**：从"逗号分隔的错误码列表"改为"单一错误码"
**理由**：
- 简化P节点的解析逻辑
- 避免多个错误码的优先级问题
- 确保转换逻辑的确定性

### **3. 兼容性考虑**
- 保持所有现有字段不变
- 保持字段类型基本不变（仅错误码优化）
- 保持required字段列表不变

## 📊 优化前后对比

### **错误码字段对比**
| 版本 | 类型 | 描述 | 可预测性 |
|------|------|------|----------|
| 当前 | string | 逗号分隔列表 | ❌ 不可预测 |
| 优化 | string + enum | 单一枚举值 | ✅ 完全可预测 |

### **对P节点的影响**
| 场景 | 当前情况 | 优化后 |
|------|----------|--------|
| 错误码解析 | ❌ 需要复杂的字符串解析 | ✅ 直接枚举匹配 |
| 转换逻辑 | ❌ 不确定性高 | ✅ 确定性转换 |
| 维护成本 | ❌ 高（需要处理各种异常） | ✅ 低（预定义枚举） |

## 🎯 错误码详细说明

| 错误码 | 触发条件 | P节点转换逻辑 |
|--------|----------|--------------|
| `NO_ERROR` | 无错误 | 生成最小化修改指导 |
| `TITLE_FORMAT_INVALID` | 标题格式错误 | 聚焦标题格式修正 |
| `CHAPTER_NAME_INVALID` | 篇章名不规范 | 聚焦篇章名修正 |
| `FIRST_LINE_CONFLICT` | 首句规则冲突 | 聚焦首句规则修正 |
| `LENGTH_EXCEEDS` | 字数超限 | 聚焦内容精简 |
| `CITATION_FORMAT_INVALID` | 引文格式错误 | 聚焦引文格式修正 |
| `CITATION_NOT_FOUND_IN_CANON` | 引文未找到 | 聚焦引文替换 |
| `CITATION_SOURCE_MISMATCH` | 引文出处不匹配 | 聚焦引文源匹配 |
| `STYLE_FAITHFULNESS_LOW` | 风格保真度低 | 聚焦风格调整 |

## ⚡ 实施建议

### **更新步骤**
1. **备份当前配置**：导出现有D1/D2节点配置
2. **逐个更新**：先更新D1，测试后更新D2
3. **验证测试**：确保输出符合新Schema
4. **P节点适配**：基于新Schema优化P节点解析逻辑

### **风险控制**
- **向后兼容**：新Schema与现有字段完全兼容
- **渐进部署**：可以先在测试环境验证
- **快速回滚**：保留原配置以便快速恢复

### **验证方法**
```json
// 测试用例：确保D节点输出符合新Schema
{
  "最终裁决": "驳回",
  "结构完整性": "不合规", 
  "引文验证状态": "通过",
  "风格保真度": 0.25,
  "证据充足度": "中",
  "错误码": "STYLE_FAITHFULNESS_LOW",
  "改进建议": "诗歌风格需要更贴近参考样本"
}
```

---

*基于双Agent对抗博弈系统的深度分析，确保D→P数据传递的可靠性*
*文档版本: v1.1 | 创建时间: 2025-09-05 | 修正GEMINI API兼容性问题*
