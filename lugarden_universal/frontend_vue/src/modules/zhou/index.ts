/**
 * Zhou模块统一导出
 * 周与春秋宇宙模块的完整导出文件，提供所有组件、视图、状态管理和类型的统一入口
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
  name: 'Zhou模块',
  description: '周与春秋练习宇宙 - 基于吴任几《周与春秋练习》系列诗歌的互动体验模块',
  version: '1.0.0',
  components: [
    'QuestionCard',
    'PoemViewer', 
    'ClassicalEchoDisplay',
    'InterpretationDisplay',
    'ControlButtons'
  ],
  views: [
    'MainProjectSelection',
    'SubProjectSelection', 
    'QuizScreen',
    'ClassicalEchoScreen',
    'ResultScreen'
  ],
  stores: ['zhou'],
  types: ['zhou']
}
