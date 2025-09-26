# 陆家花园数据库验证报告

**生成时间**: 2025/8/11 14:49:22
**验证状态**: ❌ 发现问题

## 总体统计

- **总检查数**: 13
- **通过检查**: 11
- **失败检查**: 2
- **发现问题**: 8

## 详细结果

### 1. 数据完整性检查

- **总表数**: 22
- **总记录数**: 482
- **发现问题**: 0

### 2. 关联关系验证

- **总检查数**: 5
- **通过检查**: 5
- **失败检查**: 0
- **发现问题**: 0

### 3. 数据一致性检查

- **总检查数**: 8
- **通过检查**: 6
- **失败检查**: 2
- **发现问题**: 8

**发现的问题**:
1. [DATA_TYPE] Universe ID 格式一致性: Universe Code 格式错误: maoxiaodou 应该以 'universe_' 开头
2. [DATA_TYPE] Universe ID 格式一致性: Universe Code 格式错误: zhou_spring_autumn 应该以 'universe_' 开头
3. [DATA_TYPE] Theme ID 格式一致性: Theme ID 格式错误: male_community 应该以 'theme_' 开头
4. [DATA_TYPE] Theme ID 格式一致性: Theme ID 格式错误: identity_anxiety 应该以 'theme_' 开头
5. [DATA_TYPE] Theme ID 格式一致性: Theme ID 格式错误: microphysics_of_power 应该以 'theme_' 开头
6. [DATA_TYPE] Theme ID 格式一致性: Theme ID 格式错误: ugly_feelings 应该以 'theme_' 开头
7. [DATA_TYPE] Theme ID 格式一致性: Theme ID 格式错误: consumerism 应该以 'theme_' 开头
8. [DATA_TYPE] Theme ID 格式一致性: Theme ID 格式错误: time_and_stagnation 应该以 'theme_' 开头

## 建议

1. 数据一致性存在问题，建议检查数据格式和类型
2. 发现较多问题，建议系统性地修复数据质量问题

## 结论

⚠️ 发现了一些数据质量问题，建议按照上述建议进行修复后再继续开发。

---
*本报告由陆家花园项目验证系统自动生成*
