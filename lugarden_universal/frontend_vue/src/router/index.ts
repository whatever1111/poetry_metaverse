import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainProjectSelection',
    component: () => import('../views/MainProjectSelection.vue'),
    meta: {
      title: '周与春秋 - 主项目选择',
      requiresAuth: false,
      step: 1
    }
  },
  {
    path: '/project/:projectId?',
    name: 'SubProjectSelection',
    component: () => import('../views/SubProjectSelection.vue'),
    meta: {
      title: '子项目选择',
      requiresAuth: false,
      step: 2,
      requiresProject: true
    }
  },
  {
    path: '/quiz/:chapter?',
    name: 'QuizScreen',
    component: () => import('../views/QuizScreen.vue'),
    meta: {
      title: '问答测试',
      requiresAuth: false,
      step: 3,
      requiresProject: true,
      requiresChapter: true
    }
  },
  {
    path: '/classical-echo',
    name: 'ClassicalEchoScreen',
    component: () => import('../views/ClassicalEchoScreen.vue'),
    meta: {
      title: '古典回响',
      requiresAuth: false,
      step: 4,
      requiresQuizComplete: true
    }
  },
  {
    path: '/result',
    name: 'ResultScreen',
    component: () => import('../views/ResultScreen.vue'),
    meta: {
      title: '您的诗歌',
      requiresAuth: false,
      step: 5,
      requiresQuizComplete: true
    }
  },
  // 404 重定向
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 滚动行为：切换路由时滚动到顶部
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫：处理页面访问权限和状态
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // TODO: 根据实际需求实现更复杂的路由守卫逻辑
  // 例如：检查是否已选择项目、是否已完成问答等
  
  // 示例路由守卫逻辑（后续在状态管理中完善）
  if (to.meta.requiresProject) {
    // 检查是否已选择项目
    console.log('Route guard: checking project selection for', to.path)
  }
  
  if (to.meta.requiresChapter) {
    // 检查是否已选择章节
    console.log('Route guard: checking chapter selection for', to.path)
  }
  
  if (to.meta.requiresQuizComplete) {
    // 检查是否已完成问答
    console.log('Route guard: checking quiz completion for', to.path)
  }

  next()
})

// 路由后置守卫：处理页面切换后的操作
router.afterEach((to, from) => {
  // 页面切换动画或其他后处理逻辑
  console.log(`Route changed from ${from.path} to ${to.path}`)
})

export default router
