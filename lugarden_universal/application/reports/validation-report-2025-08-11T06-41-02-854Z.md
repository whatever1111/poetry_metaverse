# 陆家花园数据库验证报告

**生成时间**: 2025/8/11 14:41:02
**验证状态**: ❌ 发现问题

## 总体统计

- **总检查数**: 13
- **通过检查**: 11
- **失败检查**: 2
- **发现问题**: 15

## 详细结果

### 1. 数据完整性检查

- **总表数**: 22
- **总记录数**: 482
- **发现问题**: 7

**发现的问题**:
1. [ERROR] UniverseTheme -> Universe.FOREIGN_KEY_CHECK: 
Invalid `prisma.universeTheme.findMany()` invocation in
C:\Users\C2\Desktop\三号线诗聚\lu_garden_lab\lugarden_universal\application\scripts\validation\check-integrity.cjs:119:53

  116 {
  117   name: 'UniverseTheme -> Universe',
  118   check: async () => {
→ 119     const orphaned = await prisma.universeTheme.findMany({
            where: {
          +   universe: {
          +     is: UniverseWhereInput,
          +     isNot: UniverseWhereInput
          +   }
            }
          })

Argument `universe` must not be null.
2. [ERROR] UniverseTheme -> Theme.FOREIGN_KEY_CHECK: 
Invalid `prisma.universeTheme.findMany()` invocation in
C:\Users\C2\Desktop\三号线诗聚\lu_garden_lab\lugarden_universal\application\scripts\validation\check-integrity.cjs:130:53

  127 {
  128   name: 'UniverseTheme -> Theme',
  129   check: async () => {
→ 130     const orphaned = await prisma.universeTheme.findMany({
            where: {
          +   theme: {
          +     is: ThemeWhereInput,
          +     isNot: ThemeWhereInput
          +   }
            }
          })

Argument `theme` must not be null.
3. [ERROR] UniverseEmotion -> Universe.FOREIGN_KEY_CHECK: 
Invalid `prisma.universeEmotion.findMany()` invocation in
C:\Users\C2\Desktop\三号线诗聚\lu_garden_lab\lugarden_universal\application\scripts\validation\check-integrity.cjs:141:55

  138 {
  139   name: 'UniverseEmotion -> Universe',
  140   check: async () => {
→ 141     const orphaned = await prisma.universeEmotion.findMany({
            where: {
          +   universe: {
          +     is: UniverseWhereInput,
          +     isNot: UniverseWhereInput
          +   }
            }
          })

Argument `universe` must not be null.
4. [ERROR] UniverseEmotion -> Emotion.FOREIGN_KEY_CHECK: 
Invalid `prisma.universeEmotion.findMany()` invocation in
C:\Users\C2\Desktop\三号线诗聚\lu_garden_lab\lugarden_universal\application\scripts\validation\check-integrity.cjs:152:55

  149 {
  150   name: 'UniverseEmotion -> Emotion',
  151   check: async () => {
→ 152     const orphaned = await prisma.universeEmotion.findMany({
            where: {
          +   emotion: {
          +     is: EmotionWhereInput,
          +     isNot: EmotionWhereInput
          +   }
            }
          })

Argument `emotion` must not be null.
5. [ERROR] ZhouPoem -> Universe.FOREIGN_KEY_CHECK: 
Invalid `prisma.zhouPoem.findMany()` invocation in
C:\Users\C2\Desktop\三号线诗聚\lu_garden_lab\lugarden_universal\application\scripts\validation\check-integrity.cjs:163:48

  160 {
  161   name: 'ZhouPoem -> Universe',
  162   check: async () => {
→ 163     const orphaned = await prisma.zhouPoem.findMany({
            where: {
          +   universe: {
          +     is: UniverseWhereInput,
          +     isNot: UniverseWhereInput
          +   }
            }
          })

Argument `universe` must not be null.
6. [ERROR] MaoxiaodouPoem -> Universe.FOREIGN_KEY_CHECK: 
Invalid `prisma.maoxiaodouPoem.findMany()` invocation in
C:\Users\C2\Desktop\三号线诗聚\lu_garden_lab\lugarden_universal\application\scripts\validation\check-integrity.cjs:174:54

  171 {
  172   name: 'MaoxiaodouPoem -> Universe',
  173   check: async () => {
→ 174     const orphaned = await prisma.maoxiaodouPoem.findMany({
            where: {
          +   universe: {
          +     is: UniverseWhereInput,
          +     isNot: UniverseWhereInput
          +   }
            }
          })

Argument `universe` must not be null.
7. [NULL_VALUE] MaoxiaodouPoem.body.NULL_CHECK: 2 条空值记录

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

1. 数据完整性存在问题，建议检查外键关联和唯一性约束
2. 数据一致性存在问题，建议检查数据格式和类型
3. 发现较多问题，建议系统性地修复数据质量问题

## 结论

⚠️ 发现了一些数据质量问题，建议按照上述建议进行修复后再继续开发。

---
*本报告由陆家花园项目验证系统自动生成*
