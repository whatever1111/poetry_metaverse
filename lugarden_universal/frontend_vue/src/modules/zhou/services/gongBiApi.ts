/**
 * 共笔功能API服务
 * 负责与后端/api/zhou/gongbi端点通信
 */

// ================================
// TypeScript类型定义
// ================================

export interface GongBiRequest {
  chapterKey: string
  answerPattern: string
  poemTitle: string
  userFeeling: string
}

export interface GeneratedPoem {
  title: string
  quote: string
  quoteSource: string
  content: string
  userFeeling: string
  sourcePoem?: {
    title: string
    quote: string
    quoteCitation: string
    content: string
  }
}

export interface GongBiResponse {
  success: boolean
  poem?: GeneratedPoem
  error?: {
    code: string
    message: string
    details?: string
  }
  metadata?: {
    conversationId: string
    messageId: string
    tokens: number
  }
}

// ================================
// API错误类
// ================================

export class GongBiApiError extends Error {
  code: string
  details?: string

  constructor(code: string, message: string, details?: string) {
    super(message)
    this.name = 'GongBiApiError'
    this.code = code
    this.details = details
  }
}

// ================================
// API调用函数
// ================================

/**
 * 调用共笔API，生成陆家明的回应诗歌
 */
export async function createGongBi(request: GongBiRequest): Promise<GeneratedPoem> {
  try {
    console.log('[gongBiApi] 发起共笔请求:', {
      chapterKey: request.chapterKey,
      pattern: request.answerPattern,
      poemTitle: request.poemTitle,
      feelingLength: request.userFeeling.length
    })

    const response = await fetch('/api/zhou/gongbi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      // 尝试解析错误响应
      let errorData: GongBiResponse | null = null
      try {
        errorData = await response.json()
      } catch {
        throw new GongBiApiError(
          'HTTP_ERROR',
          `HTTP ${response.status}: ${response.statusText}`
        )
      }

      if (errorData && errorData.error) {
        throw new GongBiApiError(
          errorData.error.code,
          errorData.error.message,
          errorData.error.details
        )
      }

      throw new GongBiApiError(
        'UNKNOWN_ERROR',
        '请求失败，请稍后重试'
      )
    }

    const data: GongBiResponse = await response.json()

    if (!data.success || !data.poem) {
      throw new GongBiApiError(
        'INVALID_RESPONSE',
        '服务器响应格式异常'
      )
    }

    console.log('[gongBiApi] 共笔请求成功:', {
      title: data.poem.title,
      tokens: data.metadata?.tokens || 0
    })

    return data.poem

  } catch (error) {
    console.error('[gongBiApi] 共笔请求失败:', error)

    // 如果已经是GongBiApiError，直接抛出
    if (error instanceof GongBiApiError) {
      throw error
    }

    // 网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GongBiApiError(
        'NETWORK_ERROR',
        '网络连接失败，请检查网络后重试'
      )
    }

    // 未知错误
    throw new GongBiApiError(
      'UNKNOWN_ERROR',
      error instanceof Error ? error.message : '未知错误'
    )
  }
}

// ================================
// 用户友好的错误消息映射
// ================================

export function getGongBiErrorMessage(error: unknown): string {
  if (error instanceof GongBiApiError) {
    switch (error.code) {
      case 'MISSING_PARAMS':
        return '参数缺失，请返回重新尝试'
      case 'FEELING_TOO_LONG':
        return '感受文字过长，请控制在50字以内'
      case 'USER_PROFILE_NOT_FOUND':
        return '未找到用户原型数据，请重新完成问答'
      case 'POEM_NOT_FOUND':
        return '未找到诗歌数据，请返回重试'
      case 'DIFY_API_KEY_MISSING':
        return '服务器配置错误，请联系管理员'
      case 'DIFY_API_ERROR':
        return 'AI诗人服务异常，请稍后重试'
      case 'DIFY_API_TIMEOUT':
        return 'AI诗人响应超时，请稍后重试'
      case 'DIFY_RESPONSE_INVALID':
        return 'AI诗人响应格式异常，请稍后重试'
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络后重试'
      case 'HTTP_ERROR':
        return `服务器错误：${error.message}`
      case 'INVALID_RESPONSE':
        return '服务器响应格式异常，请稍后重试'
      case 'INTERNAL_ERROR':
        return '服务器内部错误，请稍后重试'
      default:
        return error.message || '未知错误，请稍后重试'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return '未知错误，请稍后重试'
}

// ================================
// 默认导出
// ================================

export default {
  createGongBi,
  getGongBiErrorMessage
}


