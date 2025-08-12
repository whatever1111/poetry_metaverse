# 字段映射（DB → 前端契约）

> 目标：保持前端零改动，后端通过映射产出既有结构。

- ZhouProject → projects[]
  - id → id
  - name → name
  - description → description
  - poet → poet
  - status → status
  - subProjects[].name → subProjects[].name
  - subProjects[].description → subProjects[].description

- ZhouQA → questions
  - chapter → 键名（章节名）
  - question, optionA, optionB, meaningA, meaningB → {question, options:{A,B}, meaning:{A,B}}

- ZhouMapping → mappings
  - chapter + combination + poemTitle → units[chapter][combination] = poemTitle
  - defaultUnit 由配置或项目首选章生成

- ZhouPoem → poems-all
  - title（去书名号）→ 键名
  - body → 值

- ZhouPoem.poetExplanation → poem-archetypes
  - { poems: [{ title, poet_explanation }] }

> 注：后续根据现网数据快照补充细节。


