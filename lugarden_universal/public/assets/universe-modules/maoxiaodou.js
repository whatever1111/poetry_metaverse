// 毛小豆宇宙管理模块
// 版本: 1.0.0
// 描述: 毛小豆宇宙的管理功能（占位符版本）

export default class MaoxiaodouModule {
    constructor(adminCore, universeId) {
        this.adminCore = adminCore;
        this.universeId = universeId;
        this.state = {
            // 毛小豆宇宙特有的状态
            characters: [],
            scenes: [],
            poems: [],
            themes: []
        };
        
        this.elements = {};
        this.init();
    }

    async init() {
        try {
            // 初始化UI
            this.initUI();
            
            // 加载数据
            await this.loadInitialData();
            
            // 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('毛小豆模块初始化失败:', error);
            this.adminCore.showError('模块初始化失败，请刷新页面重试');
        }
    }

    initUI() {
        const moduleSection = document.getElementById('module-content-section');
        if (!moduleSection) {
            console.error('找不到模块内容区域');
            return;
        }

        // 创建毛小豆宇宙的UI
        moduleSection.innerHTML = `
            <div class="mb-6">
                <button id="back-to-dashboard-btn" class="btn btn-secondary">&larr; 返回宇宙仪表盘</button>
            </div>
            
            <div class="mb-6">
                <h2 class="text-3xl font-bold">毛小豆宇宙管理</h2>
                <p class="text-gray-600">管理角色、场景、诗歌和主题</p>
            </div>

            <!-- 功能导航 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-white p-6 rounded-lg shadow text-center">
                    <div class="text-3xl font-bold text-blue-600 mb-2">👥</div>
                    <h3 class="text-lg font-semibold mb-2">角色管理</h3>
                    <p class="text-sm text-gray-600 mb-4">管理毛小豆宇宙中的角色</p>
                    <button id="manage-characters-btn" class="btn btn-primary w-full">进入管理</button>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow text-center">
                    <div class="text-3xl font-bold text-green-600 mb-2">🎭</div>
                    <h3 class="text-lg font-semibold mb-2">场景管理</h3>
                    <p class="text-sm text-gray-600 mb-4">管理故事场景和背景</p>
                    <button id="manage-scenes-btn" class="btn btn-primary w-full">进入管理</button>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow text-center">
                    <div class="text-3xl font-bold text-purple-600 mb-2">📝</div>
                    <h3 class="text-lg font-semibold mb-2">诗歌管理</h3>
                    <p class="text-sm text-gray-600 mb-4">管理毛小豆的诗歌作品</p>
                    <button id="manage-poems-btn" class="btn btn-primary w-full">进入管理</button>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow text-center">
                    <div class="text-3xl font-bold text-orange-600 mb-2">🎨</div>
                    <h3 class="text-lg font-semibold mb-2">主题管理</h3>
                    <p class="text-sm text-gray-600 mb-4">管理故事主题和概念</p>
                    <button id="manage-themes-btn" class="btn btn-primary w-full">进入管理</button>
                </div>
            </div>

            <!-- 内容区域 -->
            <div id="content-section" class="hidden">
                <div class="mb-4">
                    <button id="back-to-overview-btn" class="btn btn-secondary">&larr; 返回概览</button>
                </div>
                <div id="content-area"></div>
            </div>

            <!-- 统计信息 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-blue-600" id="characters-count">0</div>
                    <div class="text-sm text-gray-600">角色数量</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-green-600" id="scenes-count">0</div>
                    <div class="text-sm text-gray-600">场景数量</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-purple-600" id="poems-count">0</div>
                    <div class="text-sm text-gray-600">诗歌数量</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-orange-600" id="themes-count">0</div>
                    <div class="text-sm text-gray-600">主题数量</div>
                </div>
            </div>
        `;

        // 缓存DOM元素
        this.elements = {
            contentSection: document.getElementById('content-section'),
            contentArea: document.getElementById('content-area'),
            charactersCount: document.getElementById('characters-count'),
            scenesCount: document.getElementById('scenes-count'),
            poemsCount: document.getElementById('poems-count'),
            themesCount: document.getElementById('themes-count'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalCancelButton: document.getElementById('modal-cancel-button'),
            modalSaveButton: document.getElementById('modal-save-button')
        };
    }

    async loadInitialData() {
        try {
            // 这里将来会加载毛小豆宇宙的实际数据
            // 目前使用模拟数据
            this.state.characters = [];
            this.state.scenes = [];
            this.state.poems = [];
            this.state.themes = [];
            
            this.updateStatistics();
        } catch (error) {
            console.error('加载毛小豆数据失败:', error);
            throw error;
        }
    }

    updateStatistics() {
        if (this.elements.charactersCount) {
            this.elements.charactersCount.textContent = this.state.characters.length;
        }
        if (this.elements.scenesCount) {
            this.elements.scenesCount.textContent = this.state.scenes.length;
        }
        if (this.elements.poemsCount) {
            this.elements.poemsCount.textContent = this.state.poems.length;
        }
        if (this.elements.themesCount) {
            this.elements.themesCount.textContent = this.state.themes.length;
        }
    }

    showContentSection() {
        if (this.elements.contentSection) {
            this.elements.contentSection.classList.remove('hidden');
        }
    }

    hideContentSection() {
        if (this.elements.contentSection) {
            this.elements.contentSection.classList.add('hidden');
        }
    }

    showCharactersManagement() {
        this.showContentSection();
        this.elements.contentArea.innerHTML = `
            <h3 class="text-2xl font-bold mb-4">角色管理</h3>
            <div class="mb-4">
                <button id="add-character-btn" class="btn btn-primary">添加新角色</button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <p class="text-gray-600">角色管理功能正在开发中...</p>
                <p class="text-sm text-gray-500 mt-2">这里将提供角色的增删改查功能</p>
            </div>
        `;
    }

    showScenesManagement() {
        this.showContentSection();
        this.elements.contentArea.innerHTML = `
            <h3 class="text-2xl font-bold mb-4">场景管理</h3>
            <div class="mb-4">
                <button id="add-scene-btn" class="btn btn-primary">添加新场景</button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <p class="text-gray-600">场景管理功能正在开发中...</p>
                <p class="text-sm text-gray-500 mt-2">这里将提供场景的增删改查功能</p>
            </div>
        `;
    }

    showPoemsManagement() {
        this.showContentSection();
        this.elements.contentArea.innerHTML = `
            <h3 class="text-2xl font-bold mb-4">诗歌管理</h3>
            <div class="mb-4">
                <button id="add-poem-btn" class="btn btn-primary">添加新诗歌</button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <p class="text-gray-600">诗歌管理功能正在开发中...</p>
                <p class="text-sm text-gray-500 mt-2">这里将提供诗歌的增删改查功能</p>
            </div>
        `;
    }

    showThemesManagement() {
        this.showContentSection();
        this.elements.contentArea.innerHTML = `
            <h3 class="text-2xl font-bold mb-4">主题管理</h3>
            <div class="mb-4">
                <button id="add-theme-btn" class="btn btn-primary">添加新主题</button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <p class="text-gray-600">主题管理功能正在开发中...</p>
                <p class="text-sm text-gray-500 mt-2">这里将提供主题的增删改查功能</p>
            </div>
        `;
    }

    bindEvents() {
        // 功能导航按钮
        document.addEventListener('click', (e) => {
            if (e.target.matches('#manage-characters-btn')) {
                this.showCharactersManagement();
            }
            if (e.target.matches('#manage-scenes-btn')) {
                this.showScenesManagement();
            }
            if (e.target.matches('#manage-poems-btn')) {
                this.showPoemsManagement();
            }
            if (e.target.matches('#manage-themes-btn')) {
                this.showThemesManagement();
            }
            if (e.target.matches('#back-to-overview-btn')) {
                this.hideContentSection();
            }
        });

        // 模态框事件
        if (this.elements.modalCancelButton) {
            this.elements.modalCancelButton.addEventListener('click', () => {
                this.elements.modal.classList.add('hidden');
            });
        }
        
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.elements.modal.classList.add('hidden');
                }
            });
        }
    }

    destroy() {
        // 清理状态
        this.state = null;
        this.elements = null;
    }
}
