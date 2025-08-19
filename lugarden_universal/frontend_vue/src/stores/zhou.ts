import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type {
  UniverseContentResponse,
  ZhouProject,
  ZhouQuestion,
  ZhouPoem,
  UserAnswer,
  UniverseDataState,
  AppState,
  NavigationState,
  QuizState,
  ResultState,
  UIState
} from '../types/zhou'

export const useZhouStore = defineStore('zhou', () => {
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
  const result = reactive<ResultState>({
    selectedPoem: null,
    poemTitle: null,
    interpretationContent: null,
    interpretationLoading: false,
    audioUrl: null,
    audioPlaying: false,
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
    return ((quiz.currentQuestionIndex + 1) / quiz.totalQuestions) * 100
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
  async function loadUniverseContent(): Promise<void> {
    if (universeData.loading) return

    try {
      universeData.loading = true
      universeData.error = null
      ui.loadingMessage = '正在加载宇宙内容...'

      const response = await fetch('/api/universes/universe_zhou_spring_autumn/content')
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const data: UniverseContentResponse = await response.json()

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
      universeData.error = error instanceof Error ? error.message : '未知错误'
      ui.errorMessage = '加载数据失败，请稍后重试'
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
    
    // 更新导航历史
    navigation.navigationHistory.push('/project')
    
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
    
    appState.currentStep = 3
    navigation.navigationHistory.push('/quiz')
    
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
      } else if (previousPath === '/project') {
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
      
      // 获取诗歌内容
      const poemContent = universeData.poems[mapping.poemTitle]
      if (poemContent) {
        result.selectedPoem = {
          title: mapping.poemTitle,
          body: poemContent
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

  // 显示结果页面
  function showResult(): void {
    appState.currentStep = 5
    navigation.navigationHistory.push('/result')
  }

  // ================================
  // Actions - AI功能
  // ================================

  // 获取AI解诗
  async function getInterpretation(): Promise<void> {
    if (!result.selectedPoem) return

    try {
      result.interpretationLoading = true
      
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poem: result.selectedPoem.body,
          title: result.selectedPoem.title
        })
      })

      if (!response.ok) {
        throw new Error('解诗请求失败')
      }

      const data = await response.json()
      result.interpretationContent = data.interpretation

    } catch (error) {
      console.error('获取解诗失败:', error)
      ui.errorMessage = '获取解诗失败，请稍后重试'
    } finally {
      result.interpretationLoading = false
    }
  }

  // 播放读诗音频
  async function playPoem(): Promise<void> {
    if (!result.selectedPoem) return

    try {
      const response = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poem: result.selectedPoem.body,
          title: result.selectedPoem.title
        })
      })

      if (!response.ok) {
        throw new Error('读诗请求失败')
      }

      const data = await response.json()
      result.audioUrl = data.audioUrl
      result.audioPlaying = true

    } catch (error) {
      console.error('播放读诗失败:', error)
      ui.errorMessage = '播放音频失败，请稍后重试'
    }
  }

  // 显示诗人解读
  function showPoetExplanation(): void {
    if (!result.selectedPoem) return

    // 查找对应的诗人解读
    const archetype = universeData.poemArchetypes.find(
      p => p.title === result.selectedPoem?.title
    )

    if (archetype) {
      result.poetExplanation = archetype.poet_explanation
      result.poetButtonClicked = true
      result.poetButtonClickCount++
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
    result.audioUrl = null
    result.audioPlaying = false
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

    // 结果管理
    calculatePoemMapping,
    showResult,

    // AI功能
    getInterpretation,
    playPoem,
    showPoetExplanation,

    // UI状态
    showLoading,
    hideLoading,
    showError,
    clearError,
    resetApp,
    detectMobileDevice
  }
})
