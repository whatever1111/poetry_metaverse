// 周与春秋 TypeScript 类型定义
// 基于现有API结构和业务需求

// 基础数据类型
export interface ZhouProject {
  id: string
  name: string
  description: string
  poet: string
  status: string
  subProjects: ZhouSubProject[]
}

export interface ZhouSubProject {
  name: string
  description: string
}

export interface ZhouQuestion {
  question: string
  options: {
    A: string
    B: string
  }
  meaning: {
    A?: string
    B?: string
  }
}

export interface ZhouMapping {
  poemTitle: string
  meaning?: string
}

export interface ZhouPoem {
  title: string
  body: string | {
    quote_text?: string
    quote_citation?: string
    main_text?: string
  }
}

// 结构化诗歌内容类型（用于Vue版本API响应）
export interface StructuredPoemContent {
  quote_text: string
  quote_citation: string
  main_text: string
}

export interface ZhouPoemArchetype {
  title: string
  poet_explanation: string
  classicalEcho: string
  coreTheme: string
  problemSolved: string
  spiritualConsolation: string
  chapter: string
  body: string
}

// API响应类型
export interface UniverseContentResponse {
  universe: {
    id: string
    code: string
    name: string
    type: string
    description: string
    createdAt: string
    updatedAt: string
  }
  content: {
    projects: ZhouProject[]
    questions: Record<string, ZhouQuestion[]>
    mappings: {
      defaultUnit: string
      units: Record<string, Record<string, ZhouMapping>>
    }
    poems: Record<string, StructuredPoemContent>
    poemArchetypes: {
      poems: ZhouPoemArchetype[]
    }
  }
}

// 用户答案类型
export interface UserAnswer {
  questionIndex: number
  selectedOption: 'A' | 'B'
  questionText: string
  selectedText: string
}

// 路由参数类型
export interface RouteParams {
  projectId?: string
  chapter?: string
}

// 组件Props类型
export interface ProjectCardProps {
  project: ZhouProject
  index: number
}

export interface QuestionCardProps {
  question: ZhouQuestion
  questionIndex: number
  onAnswer: (option: 'A' | 'B') => void
}

export interface PoemViewerProps {
  poemTitle?: string | null
  quoteText?: string | null      // 引文内容
  quoteCitation?: string | null  // 引文出处
  mainText?: string | null       // 诗歌原文
  poemBody?: string | null       // 兼容原有格式（仅支持string）
  author?: string
  additionalInfo?: string
  animationDelay?: string
  showActions?: boolean
  showDownload?: boolean
}

// 状态域接口定义
export interface UniverseDataState {
  projects: ZhouProject[]
  poems: Record<string, StructuredPoemContent>
  questions: Record<string, ZhouQuestion[]>
  mappings: {
    defaultUnit: string
    units: Record<string, Record<string, ZhouMapping>>
  }
  poemArchetypes: ZhouPoemArchetype[]
  loading: boolean
  error: string | null
  lastFetchTime: number | null
}

export interface AppState {
  initialized: boolean
  currentStep: number
  previousStep: number
  isTransitioning: boolean
  theme: 'light' | 'dark'
}

export interface NavigationState {
  currentMainProject: ZhouProject | null
  currentChapterName: string | null
  canGoBack: boolean
  navigationHistory: string[]
}

export interface QuizState {
  currentQuestionIndex: number
  totalQuestions: number
  userAnswers: UserAnswer[]
  userAnswerMeanings: string[]
  isQuizComplete: boolean
  quizStartTime: number | null
  quizEndTime: number | null
}

export interface ResultState {
  selectedPoem: ZhouPoem | null
  poemTitle: string | null
  interpretationContent: string | null
  interpretationLoading: boolean
  audioUrl: string | null
  audioPlaying: boolean
  audioLoading: boolean
  audioElement: HTMLAudioElement | null
  audioError: string | null
  poetExplanation: string | null
  poetButtonClicked: boolean
  poetButtonClickCount: number
}

export interface UIState {
  showLoadingScreen: boolean
  animationsEnabled: boolean
  loadingMessage: string
  errorMessage: string | null
  modalVisible: boolean
  modalContent: string | null
  isMobileDevice: boolean
}
