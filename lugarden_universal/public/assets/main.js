// 宇宙门户主脚本
// 负责加载和渲染宇宙列表，提供统一的宇宙入口

class UniversePortal {
    constructor() {
        this.universes = [];
        this.init();
    }

    async init() {
        try {
            await this.loadUniverses();
            this.renderUniverseCards();
        } catch (error) {
            console.error('初始化宇宙门户失败:', error);
            this.showError('加载宇宙列表失败，请稍后重试。');
        }
    }

    async loadUniverses() {
        const response = await fetch('/api/universes');
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        this.universes = await response.json();
    }

    renderUniverseCards() {
        const container = document.getElementById('universe-list');
        const loadingElement = document.getElementById('loading-universes');
        
        if (!container) {
            console.error('未找到宇宙列表容器');
            return;
        }

        // 移除加载状态元素（无论是否有数据）
        if (loadingElement) {
            loadingElement.remove();
        }

        if (this.universes.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-12">
                    <p class="text-lg">暂无可访问的宇宙</p>
                    <p class="text-sm mt-2">请稍后再来探索</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.universes.map((universe, index) => `
            <div class="universe-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-fadeInUp" 
                 style="animation-delay: ${0.1 * index}s;" 
                 data-universe-code="${universe.code}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h2 class="text-xl sm:text-2xl font-bold mb-2 text-gray-800">${universe.name}</h2>
                        <p class="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed">${universe.description || '暂无描述'}</p>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                ${this.getUniverseTypeLabel(universe.type)}
                            </span>
                            <span class="text-xs text-gray-500">
                                创建于 ${new Date(universe.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                    <div class="text-sm text-gray-500">
                        <span class="font-medium">状态:</span> 
                        <span class="text-green-600">${universe.status === 'published' ? '已发布' : '草稿'}</span>
                    </div>
                    <button class="enter-universe-btn bg-gray-800 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-700 transition-colors text-sm sm:text-base">
                        进入宇宙
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定点击事件
        this.bindEvents();
    }

    getUniverseTypeLabel(type) {
        const typeLabels = {
            'zhou_spring_autumn': '诗歌问答',
            'maoxiaodou': '故事演绎',
            'default': '未知类型'
        };
        return typeLabels[type] || typeLabels.default;
    }

    bindEvents() {
        const container = document.getElementById('universe-list');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const card = e.target.closest('.universe-card');
            if (!card) return;

            const universeCode = card.dataset.universeCode;
            if (universeCode) {
                this.enterUniverse(universeCode);
            }
        });
    }

    enterUniverse(universeCode) {
        // 根据宇宙类型跳转到对应的体验页面
        const universe = this.universes.find(u => u.code === universeCode);
        if (!universe) {
            console.error('未找到宇宙:', universeCode);
            return;
        }

        let targetUrl;
        switch (universe.type) {
            case 'zhou_spring_autumn':
                targetUrl = '/zhou.html';
                break;
            case 'maoxiaodou':
                targetUrl = '/maoxiaodou.html';
                break;
            default:
                console.error('未知的宇宙类型:', universe.type);
                this.showError('该宇宙类型暂不支持访问');
                return;
        }

        // 添加过渡动画
        this.showTransitionAnimation(() => {
            window.location.href = targetUrl;
        });
    }

    showTransitionAnimation(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300';
        overlay.innerHTML = `
            <div class="text-white text-center">
                <div class="loader mb-4"></div>
                <p>正在进入宇宙...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
                callback();
            }, 300);
        }, 500);
    }

    showError(message) {
        const container = document.getElementById('universe-list');
        const loadingElement = document.getElementById('loading-universes');
        
        // 移除加载状态元素
        if (loadingElement) {
            loadingElement.remove();
        }
        
        if (container) {
            container.innerHTML = `
                <div class="text-center text-red-500 py-12">
                    <p class="text-lg">${message}</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        重新加载
                    </button>
                </div>
            `;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new UniversePortal();
});

