// 陆家花园后台管理系统 - 核心模块加载器
// 版本: 2.0.0
// 描述: 基于"多宇宙"模型的动态模块加载架构

class AdminCore {
    constructor() {
        this.state = {
            universes: [],
            currentUniverse: null,
            currentModule: null,
            isAuthenticated: false
        };
        
        this.modules = new Map();
        this.init();
    }

    async init() {
        try {
            // 检查认证状态
            await this.checkAuth();
            
            // 初始化基础UI
            this.initBaseUI();
            
            // 加载初始数据
            await this.loadInitialData();
            
            // 绑定基础事件
            this.bindBaseEvents();
            
        } catch (error) {
            console.error('AdminCore初始化失败:', error);
            this.showError('系统初始化失败，请刷新页面重试');
        }
    }

    async checkAuth() {
        try {
            // 暂时跳过认证检查，因为后端可能还没有实现这个接口
            // 在实际部署时，这里应该检查认证状态
            this.state.isAuthenticated = true;
            
            // 如果后端实现了认证检查，可以使用以下代码：
            /*
            const response = await fetch('/api/admin/auth/check', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                window.location.href = '/login.html';
                return;
            }
            
            this.state.isAuthenticated = true;
            */
        } catch (error) {
            console.error('认证检查失败:', error);
            // 暂时不跳转到登录页面，允许继续使用
            this.state.isAuthenticated = true;
        }
    }

    initBaseUI() {
        // 确保基础UI元素存在
        this.ensureBaseUIElements();
        
        // 显示宇宙仪表盘
        this.showUniverseDashboard();
    }

    ensureBaseUIElements() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('找不到main-content元素');
            return;
        }

        // 确保宇宙仪表盘区域存在
        if (!document.getElementById('universe-dashboard-section')) {
            const dashboardSection = document.createElement('div');
            dashboardSection.id = 'universe-dashboard-section';
            dashboardSection.className = 'mb-8';
            dashboardSection.innerHTML = `
                <h2 class="text-2xl font-bold mb-4">宇宙仪表盘</h2>
                <div class="mb-4">
                    <button id="create-universe-btn" class="btn btn-primary">创建新宇宙</button>
                </div>
                <div id="universe-list" class="space-y-3"></div>
            `;
            mainContent.insertBefore(dashboardSection, mainContent.firstChild);
        }

        // 确保模块内容区域存在
        if (!document.getElementById('module-content-section')) {
            const moduleSection = document.createElement('div');
            moduleSection.id = 'module-content-section';
            moduleSection.className = 'hidden';
            mainContent.appendChild(moduleSection);
        }
    }

    async loadInitialData() {
        try {
            await this.loadUniverses();
        } catch (error) {
            console.error('加载初始数据失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        }
    }

    async loadUniverses() {
        try {
            const response = await this.apiRequest('/api/admin/universes', 'GET');
            this.state.universes = response;
            this.renderUniverseList();
        } catch (error) {
            console.error('加载宇宙列表失败:', error);
            throw error;
        }
    }

    renderUniverseList() {
        const universeList = document.getElementById('universe-list');
        if (!universeList) return;

        universeList.innerHTML = this.state.universes.map(universe => `
            <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold">${universe.name}</h3>
                        <p class="text-gray-600 text-sm">${universe.description || '暂无描述'}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="px-2 py-1 text-xs rounded-full ${universe.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                ${universe.status === 'published' ? '已发布' : '草稿'}
                            </span>
                            <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                ${universe.type}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-primary universe-manage-btn" data-id="${universe.id}" data-type="${universe.type}">
                            管理
                        </button>
                        <button class="btn btn-secondary universe-edit-btn" data-id="${universe.id}">
                            编辑
                        </button>
                        <button class="btn btn-danger universe-delete-btn" data-id="${universe.id}">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    bindBaseEvents() {
        // 宇宙管理按钮
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.universe-manage-btn')) {
                const universeId = e.target.dataset.id;
                const universeType = e.target.dataset.type;
                await this.loadUniverseModule(universeId, universeType);
            }
            
            if (e.target.matches('.universe-edit-btn')) {
                const universeId = e.target.dataset.id;
                const universe = this.state.universes.find(u => u.id === universeId);
                if (universe) {
                    this.openUniverseModal(universe);
                }
            }
            
            if (e.target.matches('.universe-delete-btn')) {
                const universeId = e.target.dataset.id;
                await this.deleteUniverse(universeId);
            }
        });

        // 创建宇宙按钮
        const createUniverseBtn = document.getElementById('create-universe-btn');
        if (createUniverseBtn) {
            createUniverseBtn.addEventListener('click', () => this.openUniverseModal());
        }

        // 返回仪表盘按钮
        document.addEventListener('click', (e) => {
            if (e.target.matches('#back-to-dashboard-btn')) {
                this.showUniverseDashboard();
            }
        });
    }

    async loadUniverseModule(universeId, universeType) {
        try {
            // 设置当前宇宙
            this.state.currentUniverse = this.state.universes.find(u => u.id === universeId);
            
            // 隐藏仪表盘，显示模块内容区域
            this.hideUniverseDashboard();
            this.showModuleContent();
            
            // 动态加载对应的模块
            const modulePath = `/assets/universe-modules/${universeType}.js`;
            
            if (!this.modules.has(universeType)) {
                // 加载模块
                const module = await this.dynamicImport(modulePath);
                this.modules.set(universeType, module);
            }
            
            const module = this.modules.get(universeType);
            if (module && module.default) {
                this.state.currentModule = new module.default(this, universeId);
                await this.state.currentModule.init();
            } else {
                throw new Error(`模块 ${universeType} 加载失败`);
            }
            
        } catch (error) {
            console.error('加载宇宙模块失败:', error);
            this.showError(`加载宇宙模块失败: ${error.message}`);
            this.showUniverseDashboard();
        }
    }

    async dynamicImport(modulePath) {
        try {
            const module = await import(modulePath);
            return module;
        } catch (error) {
            console.error(`动态导入模块失败 ${modulePath}:`, error);
            throw new Error(`模块文件不存在或加载失败: ${modulePath}`);
        }
    }

    showUniverseDashboard() {
        const dashboardSection = document.getElementById('universe-dashboard-section');
        const moduleSection = document.getElementById('module-content-section');
        
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (moduleSection) moduleSection.classList.add('hidden');
        
        // 清理当前模块状态
        if (this.state.currentModule) {
            this.state.currentModule.destroy?.();
            this.state.currentModule = null;
        }
        this.state.currentUniverse = null;
    }

    hideUniverseDashboard() {
        const dashboardSection = document.getElementById('universe-dashboard-section');
        if (dashboardSection) dashboardSection.classList.add('hidden');
    }

    showModuleContent() {
        const moduleSection = document.getElementById('module-content-section');
        if (moduleSection) moduleSection.classList.remove('hidden');
    }

    async deleteUniverse(universeId) {
        if (!confirm('确认删除该宇宙？此操作不可恢复。')) {
            return;
        }
        
        try {
            await this.apiRequest(`/api/admin/universes/${universeId}`, 'DELETE');
            await this.loadUniverses();
            this.showSuccess('宇宙删除成功');
        } catch (error) {
            console.error('删除宇宙失败:', error);
            this.showError(`删除失败: ${error.message}`);
        }
    }

    openUniverseModal(universe = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalSaveBtn = document.getElementById('modal-save-button');
        
        if (!modal || !modalTitle || !modalBody || !modalSaveBtn) {
            console.error('模态框元素不存在');
            return;
        }
        
        modalTitle.textContent = universe ? '编辑宇宙' : '创建新宇宙';
        
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">宇宙名称 *</label>
                    <input type="text" id="universe-name" class="form-input" value="${universe?.name || ''}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">宇宙代码 *</label>
                    <input type="text" id="universe-code" class="form-input" value="${universe?.code || ''}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">宇宙类型 *</label>
                    <select id="universe-type" class="form-input" required>
                        <option value="">请选择类型</option>
                        <option value="zhou_spring_autumn" ${universe?.type === 'zhou_spring_autumn' ? 'selected' : ''}>周与春秋</option>
                        <option value="maoxiaodou" ${universe?.type === 'maoxiaodou' ? 'selected' : ''}>毛小豆</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea id="universe-description" class="form-textarea">${universe?.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select id="universe-status" class="form-input">
                        <option value="draft" ${universe?.status === 'draft' ? 'selected' : ''}>草稿</option>
                        <option value="published" ${universe?.status === 'published' ? 'selected' : ''}>已发布</option>
                    </select>
                </div>
            </div>
        `;
        
        // 绑定保存事件
        const originalSaveHandler = modalSaveBtn.onclick;
        modalSaveBtn.onclick = async () => {
            try {
                const formData = {
                    name: document.getElementById('universe-name').value.trim(),
                    code: document.getElementById('universe-code').value.trim(),
                    type: document.getElementById('universe-type').value,
                    description: document.getElementById('universe-description').value.trim(),
                    status: document.getElementById('universe-status').value
                };
                
                if (!formData.name || !formData.code || !formData.type) {
                    this.showError('请填写必填字段');
                    return;
                }
                
                if (universe) {
                    // 编辑
                    await this.apiRequest(`/api/admin/universes/${universe.id}`, 'PUT', formData);
                    this.showSuccess('宇宙更新成功');
                } else {
                    // 创建
                    await this.apiRequest('/api/admin/universes', 'POST', formData);
                    this.showSuccess('宇宙创建成功');
                }
                
                modal.classList.add('hidden');
                await this.loadUniverses();
                
            } catch (error) {
                console.error('保存宇宙失败:', error);
                this.showError(`保存失败: ${error.message}`);
            } finally {
                // 恢复原始事件处理器
                modalSaveBtn.onclick = originalSaveHandler;
            }
        };
        
        modal.classList.remove('hidden');
    }

    // 通用API请求方法
    async apiRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        if (response.status === 204) {
            return null; // DELETE操作通常返回204
        }
        
        return await response.json();
    }

    // 通用UI反馈方法
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// 全局管理实例
let adminCore;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    adminCore = new AdminCore();
});

// 导出给其他模块使用
window.AdminCore = AdminCore;
window.adminCore = adminCore;
