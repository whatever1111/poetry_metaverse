import { computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getApiServices, type ApiServiceFactory } from '@/shared/services/enhancedApi'
import { isApiError, getUserFriendlyErrorMessage } from '@/shared/services/api'
import type {
  ZhouProject,
  ZhouPoem,
  UserAnswer,
  UniverseDataState,
  AppState,
  NavigationState,
  QuizState,
  ResultState,
  UIState
} from '@/modules/zhou/types/zhou'

export const useZhouStore = defineStore('zhou', () => {
  // ================================
  // API服务初始化
  // ================================
  let apiServices: ApiServiceFactory | null = null

  const initializeApiServices = () => {
    if (!apiServices) {
      apiServices = getApiServices({
        onLoadingChange: (loading: boolean) => {
          ui.showLoadingScreen = loading
        },
        onError: (error: unknown) => {
          console.error('API错误:', error)
          ui.errorMessage = getUserFriendlyErrorMessage(error)
        },
        enableLogging: true,
        enableCaching: true,
        cacheDuration: 5 * 60 * 1000 // 5分钟缓存
      })
    }
    return apiServices
  }
  // ================================
  // 状态域1: universeData - 管理宇宙数据
  // ================================
  const universeData = reactive<UniverseDataState>({
    projects: [],
    poems: {},
    questions: {},
    mappings: {
      defaultUnit: '',
      units: {}
    },
    poemArchetypes: [],
    loading: false,
    error: null,
    lastFetchTime: null
  })

  // ================================
  // 状态域2: appState - 管理应用状态和页面切换
  // ================================
  const appState = reactive<AppState>({
    initialized: false,
    currentStep: 1,
    previousStep: 0,
    isTransitioning: false,
    theme: 'light'
  })

  // ================================
  // 状态域3: navigation - 管理导航状态和项目选择
  // ================================
  const navigation = reactive<NavigationState>({
    currentMainProject: null,
    currentChapterName: null,
    canGoBack: false,
    navigationHistory: ['/']
  })

  // ================================
  // 状态域4: quiz - 管理问答流程和答案收集
  // ================================
  const quiz = reactive<QuizState>({
    currentQuestionIndex: 0,
    totalQuestions: 0,
    userAnswers: [],
    userAnswerMeanings: [],
    isQuizComplete: false,
    quizStartTime: null,
    quizEndTime: null
  })

  // ================================
  // 状态域5: result - 管理结果展示和解读内容
  // ================================
  // ================================
  // 读诗功能移除记录 (2025-08-26)
  // ================================
  // 移除内容: 音频播放相关状态和函数
  // 删除的状态属性:
  // - audioUrl: string | null
  // - audioPlaying: boolean
  // - audioLoading: boolean
  // - audioElement: HTMLAudioElement | null
  // - audioError: string | null
  // 删除的函数:
  // - playPoem, pauseAudio, stopAudio
  // - playExistingAudio, loadAndPlayNewAudio
  // - createAndSetupAudioElement
  // 恢复说明: 如需恢复读诗功能，需要:
  // 1. 在result状态中恢复上述音频相关属性
  // 2. 恢复所有音频播放控制函数
  // 3. 在resetApp函数中恢复音频状态重置逻辑
  // 4. 在导出的return对象中恢复音频相关函数的导出
  // ================================
  const result = reactive<ResultState>({
    selectedPoem: null,
    poemTitle: null,
    interpretationContent: null,
    interpretationLoading: false,
    poetExplanation: null,
    poetButtonClicked: false,
    poetButtonClickCount: 0
  })

  // ================================
  // 状态域6: ui - 管理界面状态和动画效果
  // ================================
  const ui = reactive<UIState>({
    showLoadingScreen: false,
    animationsEnabled: true,
    loadingMessage: '正在加载...',
    errorMessage: null,
    modalVisible: false,
    modalContent: null,
    isMobileDevice: false
  })

  // ================================
  // 计算属性 (Getters)
  // ================================
  
  // 当前章节的问题列表
  const currentChapterQuestions = computed(() => {
    if (!navigation.currentChapterName || !universeData.questions) {
      return []
    }
    return universeData.questions[navigation.currentChapterName] || []
  })

  // 当前问题
  const currentQuestion = computed(() => {
    const questions = currentChapterQuestions.value
    if (questions.length === 0 || quiz.currentQuestionIndex >= questions.length) {
      return null
    }
    return questions[quiz.currentQuestionIndex]
  })

  // 问答进度百分比
  const quizProgress = computed(() => {
    if (quiz.totalQuestions === 0) return 0
    return (quiz.userAnswers.length / quiz.totalQuestions) * 100
  })

  // 是否可以继续下一步
  const canProceedToNext = computed(() => {
    switch (appState.currentStep) {
      case 1: // 主项目选择
        return navigation.currentMainProject !== null
      case 2: // 子项目选择
        return navigation.currentChapterName !== null
      case 3: // 问答
        return quiz.isQuizComplete
      case 4: // 古典回响
        return true
      case 5: // 结果
        return true
      default:
        return false
    }
  })

  // 应用是否准备就绪
  const isAppReady = computed(() => {
    return appState.initialized && 
           !universeData.loading && 
           universeData.error === null &&
           universeData.projects.length > 0
  })

  // ================================
  // Actions - 数据获取和管理
  // ================================

  // 加载宇宙内容数据
  async function loadUniverseContent(refresh = false): Promise<void> {
    if (universeData.loading) return

    try {
      universeData.loading = true
      universeData.error = null
      ui.loadingMessage = '正在加载宇宙内容...'

      const api = initializeApiServices()
      const universeService = api.getUniverseService()
      
      const data = await universeService.getUniverseContent('universe_zhou_spring_autumn', refresh)

      // 更新状态
      universeData.projects = data.content.projects || []
      universeData.questions = data.content.questions || {}
      universeData.mappings = data.content.mappings || { defaultUnit: '', units: {} }
      universeData.poems = data.content.poems || {}
      universeData.poemArchetypes = data.content.poemArchetypes?.poems || []
      universeData.lastFetchTime = Date.now()

      appState.initialized = true

      console.log('宇宙内容加载成功:', {
        projects: universeData.projects.length,
        questionsChapters: Object.keys(universeData.questions).length,
        poems: Object.keys(universeData.poems).length
      })

    } catch (error) {
      console.error('加载宇宙内容失败:', error)
      
      if (isApiError(error)) {
        universeData.error = error.message
        ui.errorMessage = getUserFriendlyErrorMessage(error)
      } else {
        universeData.error = error instanceof Error ? error.message : '未知错误'
        ui.errorMessage = '加载数据失败，请稍后重试'
      }
    } finally {
      universeData.loading = false
      ui.showLoadingScreen = false
    }
  }

  // ================================
  // Actions - 导航管理
  // ================================

  // 选择主项目
  function selectMainProject(project: ZhouProject): void {
    navigation.currentMainProject = project
    navigation.canGoBack = true
    appState.currentStep = 2
    
    // 更新导航历史 - 匹配实际路由结构
    navigation.navigationHistory.push(`/project/${project.id}`)
    
    console.log('选择主项目:', project.name)
  }

  // 选择章节（子项目）
  function selectChapter(chapterName: string): void {
    navigation.currentChapterName = chapterName
    
    // 初始化问答状态
    const questions = universeData.questions[chapterName] || []
    quiz.totalQuestions = questions.length
    quiz.currentQuestionIndex = 0
    quiz.userAnswers = []
    quiz.userAnswerMeanings = []
    quiz.isQuizComplete = false
    quiz.quizStartTime = Date.now()
    
    // 尝试恢复保存的问答状态
    const restored = restoreQuizState()
    if (restored) {
      console.log('已恢复之前的问答进度')
    } else {
      console.log('开始新的问答流程')
    }
    
    appState.currentStep = 3
    navigation.navigationHistory.push(`/quiz/${chapterName}`)
    
    console.log('选择章节:', chapterName, '问题数量:', quiz.totalQuestions)
  }

  // 返回上一步
  function goBack(): void {
    if (navigation.navigationHistory.length > 1) {
      navigation.navigationHistory.pop()
      const previousPath = navigation.navigationHistory[navigation.navigationHistory.length - 1]
      
      // 根据路径更新状态
      if (previousPath === '/') {
        appState.currentStep = 1
        navigation.currentMainProject = null
        navigation.currentChapterName = null
      } else if (previousPath.startsWith('/project/')) {
        appState.currentStep = 2
        navigation.currentChapterName = null
        // 重置问答状态
        resetQuiz()
      }
    }

    navigation.canGoBack = navigation.navigationHistory.length > 1
  }

  // ================================
  // Actions - 问答流程管理
  // ================================

  // 保存问答状态到localStorage
  function saveQuizState(): void {
    if (!navigation.currentChapterName) return
    
    const quizState = {
      chapterName: navigation.currentChapterName,
      currentQuestionIndex: quiz.currentQuestionIndex,
      totalQuestions: quiz.totalQuestions,
      userAnswers: quiz.userAnswers,
      userAnswerMeanings: quiz.userAnswerMeanings,
      isQuizComplete: quiz.isQuizComplete,
      quizStartTime: quiz.quizStartTime,
      savedAt: Date.now()
    }
    
    try {
      localStorage.setItem('zhou_quiz_state', JSON.stringify(quizState))
      console.log('问答状态已保存:', quizState)
    } catch (error) {
      console.warn('保存问答状态失败:', error)
    }
  }

  // 从localStorage恢复问答状态
  function restoreQuizState(): boolean {
    try {
      const savedState = localStorage.getItem('zhou_quiz_state')
      if (!savedState) return false
      
      const state = JSON.parse(savedState)
      
      // 检查状态是否过期（24小时）
      const isExpired = Date.now() - state.savedAt > 24 * 60 * 60 * 1000
      if (isExpired) {
        localStorage.removeItem('zhou_quiz_state')
        return false
      }
      
      // 检查章节是否匹配
      if (state.chapterName !== navigation.currentChapterName) {
        return false
      }
      
      // 恢复问答状态
      quiz.currentQuestionIndex = state.currentQuestionIndex
      quiz.totalQuestions = state.totalQuestions
      quiz.userAnswers = state.userAnswers || []
      quiz.userAnswerMeanings = state.userAnswerMeanings || []
      quiz.isQuizComplete = state.isQuizComplete || false
      quiz.quizStartTime = state.quizStartTime
      
      console.log('问答状态已恢复:', {
        chapterName: state.chapterName,
        currentIndex: quiz.currentQuestionIndex,
        answersCount: quiz.userAnswers.length
      })
      
      return true
    } catch (error) {
      console.warn('恢复问答状态失败:', error)
      localStorage.removeItem('zhou_quiz_state')
      return false
    }
  }

  // 清除保存的问答状态
  function clearSavedQuizState(): void {
    try {
      localStorage.removeItem('zhou_quiz_state')
      console.log('已清除保存的问答状态')
    } catch (error) {
      console.warn('清除问答状态失败:', error)
    }
  }

  // 回答问题
  function answerQuestion(selectedOption: 'A' | 'B'): void {
    const question = currentQuestion.value
    if (!question) return

    const answer: UserAnswer = {
      questionIndex: quiz.currentQuestionIndex,
      selectedOption,
      questionText: question.question,
      selectedText: question.options[selectedOption]
    }

    quiz.userAnswers.push(answer)
    
    // 收集用户选择的意义
    const meaning = question.meaning[selectedOption]
    if (meaning) {
      quiz.userAnswerMeanings.push(meaning)
    }

    console.log('回答问题:', {
      index: quiz.currentQuestionIndex,
      option: selectedOption,
      text: answer.selectedText
    })

    // 保存问答状态
    saveQuizState()

    // 进入下一题或完成问答
    proceedToNextQuestion()
  }

  // 进入下一题
  function proceedToNextQuestion(): void {
    const questions = currentChapterQuestions.value
    
    if (quiz.currentQuestionIndex < questions.length - 1) {
      quiz.currentQuestionIndex++
    } else {
      // 完成问答
      completeQuiz()
    }
  }

  // 完成问答
  function completeQuiz(): void {
    quiz.isQuizComplete = true
    quiz.quizEndTime = Date.now()
    
    // 计算诗歌映射
    calculatePoemMapping()
    
    // 清除保存的问答状态（已完成，不需要恢复）
    clearSavedQuizState()
    
    appState.currentStep = 4
    navigation.navigationHistory.push('/classical-echo')
    
    console.log('问答完成，用户答案:', quiz.userAnswers.map(a => a.selectedOption).join(''))
  }

  // 重置问答状态
  function resetQuiz(): void {
    quiz.currentQuestionIndex = 0
    quiz.userAnswers = []
    quiz.userAnswerMeanings = []
    quiz.isQuizComplete = false
    quiz.quizStartTime = null
    quiz.quizEndTime = null
    
    // 清除保存的问答状态
    clearSavedQuizState()
  }

  // ================================
  // Actions - 结果计算和展示
  // ================================

  // 计算诗歌映射
  function calculatePoemMapping(): void {
    if (!navigation.currentChapterName || quiz.userAnswers.length === 0) {
      console.error('无法计算诗歌映射：缺少必要数据')
      return
    }

    const combination = quiz.userAnswers.map(answer => answer.selectedOption === 'A' ? '0' : '1').join('')
    const chapterMappings = universeData.mappings.units[navigation.currentChapterName]
    
    if (chapterMappings && chapterMappings[combination]) {
      const mapping = chapterMappings[combination]
      result.poemTitle = mapping.poemTitle
      
      // 获取诗歌内容 - 现在是结构化数据
      const poemContent = universeData.poems[mapping.poemTitle]
      if (poemContent) {
        result.selectedPoem = {
          title: mapping.poemTitle,
          body: poemContent // 直接使用结构化数据
        }
      }

      console.log('诗歌映射计算完成:', {
        combination,
        poemTitle: result.poemTitle
      })
    } else {
      console.error('未找到匹配的诗歌映射:', { combination, chapterName: navigation.currentChapterName })
    }
  }

  // ================================
  // B.0 无状态架构支持 (2025-10-31)
  // ================================
  // 基于URL参数加载诗歌，支持直接访问诗歌URL
  // ================================
  
  // 基于URL参数加载诗歌
  async function loadPoemByParams(
    chapterName: string, 
    answerPattern: string, 
    poemTitle: string
  ): Promise<void> {
    try {
      // 确保宇宙数据已加载
      if (!appState.initialized || universeData.projects.length === 0) {
        console.log('[loadPoemByParams] 宇宙数据未加载，先加载数据')
        await loadUniverseContent()
      }
      
      // 验证参数
      if (!chapterName || !answerPattern || !poemTitle) {
        throw new Error('URL参数不完整')
      }
      
      // 设置导航状态
      navigation.currentChapterName = chapterName
      
      // 查询映射验证
      const chapterMappings = universeData.mappings.units[chapterName]
      if (!chapterMappings || !chapterMappings[answerPattern]) {
        throw new Error(`未找到匹配的诗歌映射: chapter=${chapterName}, pattern=${answerPattern}`)
      }
      
      // 获取诗歌内容
      const poemContent = universeData.poems[poemTitle]
      if (!poemContent) {
        throw new Error(`未找到诗歌内容: ${poemTitle}`)
      }
      
      // 设置result状态
      result.poemTitle = poemTitle
      result.selectedPoem = {
        title: poemTitle,
        body: poemContent
      }
      
      console.log('[loadPoemByParams] 诗歌加载成功:', { chapterName, answerPattern, poemTitle })
      
    } catch (error) {
      console.error('[loadPoemByParams] 加载失败:', error)
      throw error
    }
  }
  
  // 基于answerPattern重构问答答案（用于解诗等功能）
  function reconstructQuizFromPattern(chapterName: string, answerPattern: string): void {
    try {
      // 获取章节问题列表
      const questions = universeData.questions[chapterName]
      if (!questions || questions.length === 0) {
        console.warn('[reconstructQuizFromPattern] 未找到问题列表:', chapterName)
        return
      }
      
      // 验证pattern长度
      if (answerPattern.length !== questions.length) {
        console.warn('[reconstructQuizFromPattern] Pattern长度与问题数量不匹配:', {
          patternLength: answerPattern.length,
          questionsCount: questions.length
        })
        return
      }
      
      // 重构userAnswers
      quiz.userAnswers = answerPattern.split('').map((char, index) => {
        const selectedOption = char === '0' ? 'A' : 'B'
        const question = questions[index]
        
        return {
          questionIndex: index,
          selectedOption: selectedOption as 'A' | 'B',
          questionText: question.question,
          selectedText: question.options[selectedOption]
        }
      })
      
      // 设置问答状态
      quiz.totalQuestions = questions.length
      quiz.currentQuestionIndex = questions.length - 1
      quiz.isQuizComplete = true
      
      console.log('[reconstructQuizFromPattern] 问答状态重构完成:', {
        chapterName,
        answerPattern,
        answersCount: quiz.userAnswers.length
      })
      
    } catch (error) {
      console.error('[reconstructQuizFromPattern] 重构失败:', error)
    }
  }

  // 显示结果页面
  function showResult(): void {
    appState.currentStep = 5
    navigation.navigationHistory.push('/result')
  }

  // ================================
  // Actions - AI功能
  // ================================

  // 构建完整的诗歌内容（用于AI服务）
  function buildFullPoemContent(poem: ZhouPoem | null): string {
    if (!poem || !poem.body) return ''
    
    // 如果body是字符串，直接返回（向后兼容）
    if (typeof poem.body === 'string') {
      return poem.body
    }
    
    // 如果body是结构化对象，拼接各部分
    if (typeof poem.body === 'object' && poem.body !== null) {
      const parts: string[] = []
      
      if (poem.body.quote_text) {
        parts.push(poem.body.quote_text)
      }
      if (poem.body.quote_citation) {
        parts.push(`——${poem.body.quote_citation}`)
      }
      if (poem.body.main_text) {
        parts.push(poem.body.main_text)
      }
      
      return parts.join('\n\n')
    }
    
    return ''
  }

  // 获取AI解诗
  async function getInterpretation(): Promise<void> {
    if (!result.selectedPoem) return

    try {
      result.interpretationLoading = true
      
      const api = initializeApiServices()
      const aiService = api.getAIService()
      
      // 使用统一的内容构建函数
      const poemContent = buildFullPoemContent(result.selectedPoem)
      const combination = quiz.userAnswers.map(answer => answer.selectedOption === 'A' ? '0' : '1').join('')
      
      const data = await aiService.interpretPoem(
        poemContent,
        result.selectedPoem.title,
        combination,
        navigation.currentChapterName || ''
      )
      
      result.interpretationContent = data.interpretation

      console.log('解诗获取成功:', {
        title: data.poem_title,
        processed_at: data.processed_at
      })

    } catch (error) {
      console.error('获取解诗失败:', error)
      
      if (isApiError(error)) {
        ui.errorMessage = getUserFriendlyErrorMessage(error)
      } else {
        ui.errorMessage = '获取解诗失败，请稍后重试'
      }
    } finally {
      result.interpretationLoading = false
    }
  }













  // 显示诗人解读
  function showPoetExplanation(): void {
    if (!result.selectedPoem) return

    // 增加点击计数
    result.poetButtonClickCount++
    result.poetButtonClicked = true

    // 查找对应的诗人解读
    const archetype = universeData.poemArchetypes.find(
      p => p.title === result.selectedPoem?.title
    )

    if (archetype && archetype.poet_explanation) {
      result.poetExplanation = archetype.poet_explanation
    } else {
      // 无解读内容时的幽默提示
      result.poetExplanation = "恭喜你，虽然你不听劝，但诗人听劝，没给这首诗也提供官方解读"
    }
  }

  // 获取诗人解读按钮文本
  function getPoetButtonText(): string {
    const count = result.poetButtonClickCount
    
    switch (count) {
      case 0:
        return "最好不要点"
      case 1:
        return "哎，还是点了……"
      case 2:
        return "点都点了，看吧"
      case 3:
        return "别点了，别点了"
      default:
        return "点吧，点吧……"
    }
  }

  // ================================
  // Actions - UI状态管理
  // ================================

  // 显示加载状态
  function showLoading(message: string = '正在加载...'): void {
    ui.showLoadingScreen = true
    ui.loadingMessage = message
  }

  // 隐藏加载状态
  function hideLoading(): void {
    ui.showLoadingScreen = false
  }

  // 显示错误信息
  function showError(message: string): void {
    ui.errorMessage = message
  }

  // 清除错误信息
  function clearError(): void {
    ui.errorMessage = null
  }

  // 重置应用状态
  function resetApp(): void {
    // 重置导航
    navigation.currentMainProject = null
    navigation.currentChapterName = null
    navigation.canGoBack = false
    navigation.navigationHistory = ['/']

    // 重置问答
    resetQuiz()

    // 重置结果
    result.selectedPoem = null
    result.poemTitle = null
    result.interpretationContent = null
    

    result.poetExplanation = null
    result.poetButtonClicked = false
    result.poetButtonClickCount = 0

    // 重置应用状态
    appState.currentStep = 1
    appState.previousStep = 0
    appState.isTransitioning = false

    // 清除UI状态
    clearError()
    hideLoading()
  }

  // 检测移动设备
  function detectMobileDevice(): void {
    ui.isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // ================================
  // 导出状态和方法
  // ================================
  return {
    // 状态域
    universeData,
    appState,
    navigation,
    quiz,
    result,
    ui,

    // 计算属性
    currentChapterQuestions,
    currentQuestion,
    quizProgress,
    canProceedToNext,
    isAppReady,

    // 数据管理
    loadUniverseContent,

    // 导航管理
    selectMainProject,
    selectChapter,
    goBack,

    // 问答流程
    answerQuestion,
    proceedToNextQuestion,
    completeQuiz,
    resetQuiz,
    saveQuizState,
    restoreQuizState,
    clearSavedQuizState,

    // 结果管理
    calculatePoemMapping,
    loadPoemByParams,
    reconstructQuizFromPattern,
    showResult,

    // AI功能
    getInterpretation,
    showPoetExplanation,
    getPoetButtonText,

    // UI状态
    showLoading,
    hideLoading,
    showError,
    clearError,
    resetApp,
    detectMobileDevice
  }
})
