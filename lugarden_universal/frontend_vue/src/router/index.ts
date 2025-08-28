import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'UniversePortal',
    component: () => import('@/modules/portal/views/UniversePortal.vue'),
    meta: {
      title: '陆家花园 - 宇宙门户',
      requiresAuth: false,
      step: 0
    }
  },
  {
    path: '/zhou',
    name: 'MainProjectSelection',
    component: () => import('@/modules/zhou/views/MainProjectSelection.vue'),
    meta: {
      title: '周与春秋 - 主项目选择',
      requiresAuth: false,
      step: 1
    }
  },
  {
    path: '/project/:projectId?',
    name: 'SubProjectSelection',
    component: () => import('@/modules/zhou/views/SubProjectSelection.vue'),
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
    component: () => import('@/modules/zhou/views/QuizScreen.vue'),
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
    component: () => import('@/modules/zhou/views/ClassicalEchoScreen.vue'),
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
    component: () => import('@/modules/zhou/views/ResultScreen.vue'),
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

  // 路由守卫逻辑：检查页面访问权限和状态
  if (to.meta.requiresProject) {
    // 检查是否已选择项目 - 如果直接访问需要项目的页面，重定向到项目选择
    const projectId = to.params.projectId
    if (!projectId) {
      console.warn('Route guard: 直接访问需要项目的页面，重定向到Zhou项目选择')
      return next('/zhou')
    }
  }
  
  if (to.meta.requiresChapter) {
    // 检查是否已选择章节 - 如果直接访问需要章节的页面，重定向到项目选择
    const chapter = to.params.chapter
    if (!chapter) {
      console.warn('Route guard: 直接访问需要章节的页面，重定向到项目选择')
      return next('/zhou')
    }
  }
  
  if (to.meta.requiresQuizComplete) {
    // 允许直接访问结果页面，由组件内部处理数据获取和验证
    // 这样用户可以直接访问结果页面URL分享
    console.log('Route guard: 允许访问结果页面，由组件处理数据验证')
  }

  next()
})

// 路由后置守卫：处理页面切换后的操作
router.afterEach((to, from) => {
  // 页面切换动画或其他后处理逻辑
  console.log(`Route changed from ${from.path} to ${to.path}`)
})

export default router
