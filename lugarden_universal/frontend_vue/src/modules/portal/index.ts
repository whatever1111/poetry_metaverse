/**
 * Portal模块统一导出
 * 陆家花园宇宙门户模块的完整导出文件，提供所有组件、视图、状态管理和类型的统一入口
 */

// 组件导出
export * from './components'

// 视图导出  
export * from './views'

// 状态管理导出
export * from './stores'

// 类型定义导出
export * from './types'

// 默认导出模块信息
export default {
  name: 'Portal模块',
  description: '陆家花园宇宙门户 - 诗歌宇宙项目的统一入口和导航中心',
  version: '1.0.0',
  components: [
    'UniverseCard'
  ],
  views: [
    'UniversePortal'
  ],
  stores: [
    // 'portal'
  ],
  types: [
    'portal'
  ]
}
