// 周与春秋宇宙管理模块
// 版本: 1.0.0
// 描述: 封装"周与春秋"宇宙的项目管理功能

export default class ZhouSpringAutumnModule {
    constructor(adminCore, universeId) {
        this.adminCore = adminCore;
        this.universeId = universeId;
        this.state = {
            mainProjects: [],
            currentMainProjectId: null,
            currentSubProject: null,
            get currentMainProject() {
                return this.mainProjects.find(p => p.id === this.currentMainProjectId);
            }
        };
        
        this.elements = {};
        this.init();
    }

    async init() {
        try {
            // 初始化UI
            this.initUI();
            
            // 加载数据
            await this.loadMainProjects();
            
            // 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('周与春秋模块初始化失败:', error);
            this.adminCore.showError('模块初始化失败，请刷新页面重试');
        }
    }

    initUI() {
        const moduleSection = document.getElementById('module-content-section');
        if (!moduleSection) {
            console.error('找不到模块内容区域');
            return;
        }

        // 创建模块UI
        moduleSection.innerHTML = `
            <div class="mb-6">
                <button id="back-to-dashboard-btn" class="btn btn-secondary">&larr; 返回宇宙仪表盘</button>
            </div>
            
            <div class="mb-6">
                <h2 class="text-3xl font-bold">周与春秋宇宙管理</h2>
                <p class="text-gray-600">管理诗歌项目、篇章和内容</p>
                <div class="mt-4">
                    <button id="publish-all-updates-btn" class="btn btn-danger">发布所有更新</button>
                </div>
            </div>

            <!-- 主项目列表 -->
            <div id="main-projects-list-section">
                <h3 class="text-2xl font-bold mb-4">主项目列表</h3>
                <div id="main-project-list" class="space-y-4"></div>
                <div class="mt-8 p-6 bg-white rounded-lg shadow">
                    <h4 class="text-xl font-bold mb-4">创建新主项目</h4>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" id="new-main-project-name" placeholder="新项目名称" class="form-input md:col-span-1">
                        <input type="text" id="new-main-project-desc" placeholder="新项目描述" class="form-input md:col-span-1">
                        <input type="text" id="new-main-project-poet" placeholder="导游/作者" class="form-input md:col-span-1">
                        <button id="create-main-project-btn" class="btn btn-primary w-full md:col-span-1">创建</button>
                    </div>
                </div>
            </div>

            <!-- 子项目管理界面 -->
            <div id="sub-project-management-section" class="hidden mt-8">
                <button id="back-to-main-projects-button" class="btn btn-secondary mb-6">&larr; 返回主项目列表</button>
                <h3 id="current-main-project-name" class="text-3xl font-bold"></h3>
                <p id="current-main-project-desc" class="text-gray-600 mb-6"></p>
                
                <div id="sub-project-list" class="space-y-6"></div>
                <div class="mt-8 p-6 bg-gray-50 rounded-lg border">
                    <h4 class="text-xl font-bold mb-4">创建新子项目 (篇章)</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" id="new-sub-project-name" placeholder="新篇章名称" class="form-input md:col-span-1">
                        <input type="text" id="new-sub-project-desc" placeholder="篇章描述" class="form-input md:col-span-1">
                        <button id="create-sub-project-btn" class="btn btn-primary w-full md:col-span-1">创建篇章</button>
                    </div>
                </div>
            </div>
        `;

        // 缓存DOM元素
        this.elements = {
            mainProjectsListSection: document.getElementById('main-projects-list-section'),
            mainProjectList: document.getElementById('main-project-list'),
            subProjectManagementSection: document.getElementById('sub-project-management-section'),
            backToMainProjectsButton: document.getElementById('back-to-main-projects-button'),
            currentMainProjectName: document.getElementById('current-main-project-name'),
            currentMainProjectDesc: document.getElementById('current-main-project-desc'),
            subProjectList: document.getElementById('sub-project-list'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalCancelButton: document.getElementById('modal-cancel-button'),
            modalSaveButton: document.getElementById('modal-save-button')
        };
    }

    async loadMainProjects() {
        try {
            const response = await this.adminCore.apiRequest('/api/admin/projects', 'GET');
            this.state.mainProjects = response;
            this.renderMainProjects();
        } catch (error) {
            console.error('加载主项目列表失败:', error);
            throw error;
        }
    }

    renderMainProjects() {
        if (!this.elements.mainProjectList) return;
        
        this.elements.mainProjectList.innerHTML = this.state.mainProjects.map(project => `
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="text-xl font-bold mb-2">${project.name}</h4>
                        <p class="text-gray-600 mb-4">${project.description || '暂无描述'}</p>
                        <div class="flex items-center gap-2 mb-4">
                            <span class="px-2 py-1 text-xs rounded-full ${project.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                ${project.status === 'published' ? '已发布' : '草稿'}
                            </span>
                            <span class="text-sm text-gray-500">导游: ${project.poet || '未指定'}</span>
                        </div>
                        <div class="text-sm text-gray-500">
                            创建时间: ${new Date(project.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 ml-4">
                        <button class="btn btn-primary enter-main-project-btn" data-id="${project.id}">
                            进入管理
                        </button>
                        <button class="btn btn-secondary edit-main-project-btn" data-id="${project.id}">
                            编辑信息
                        </button>
                        <button class="btn btn-success toggle-status-btn" data-id="${project.id}" data-status="${project.status === 'published' ? 'draft' : 'published'}">
                            ${project.status === 'published' ? '设为草稿' : '发布'}
                        </button>
                        <button class="btn btn-success update-project-btn" data-id="${project.id}">
                            更新项目
                        </button>
                        <button class="btn btn-danger delete-main-project-btn" data-id="${project.id}">
                            删除项目
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async createMainProject() {
        const name = document.getElementById('new-main-project-name').value.trim();
        const description = document.getElementById('new-main-project-desc').value.trim();
        const poet = document.getElementById('new-main-project-poet').value.trim();
        
        if (!name) {
            this.adminCore.showError('请输入项目名称');
            return;
        }
        
        try {
            await this.adminCore.apiRequest('/api/admin/projects', 'POST', {
                name,
                description,
                poet
            });
            
            // 清空输入框
            document.getElementById('new-main-project-name').value = '';
            document.getElementById('new-main-project-desc').value = '';
            document.getElementById('new-main-project-poet').value = '';
            
            await this.loadMainProjects();
            this.adminCore.showSuccess('主项目创建成功');
        } catch (error) {
            console.error('创建主项目失败:', error);
            this.adminCore.showError(`创建失败: ${error.message}`);
        }
    }

    openMainProjectInfoModal(projectId) {
        const project = this.state.mainProjects.find(p => p.id === projectId);
        if (!project) return;
        
        this.elements.modalTitle.textContent = '编辑主项目信息';
        
        this.elements.modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
                    <input type="text" id="project-name" class="form-input" value="${project.name}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                    <textarea id="project-description" class="form-textarea">${project.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">导游/作者</label>
                    <input type="text" id="project-poet" class="form-input" value="${project.poet || ''}">
                </div>
            </div>
        `;
        
        // 绑定保存事件
        const originalSaveHandler = this.elements.modalSaveButton.onclick;
        this.elements.modalSaveButton.onclick = async () => {
            try {
                const formData = {
                    name: document.getElementById('project-name').value.trim(),
                    description: document.getElementById('project-description').value.trim(),
                    poet: document.getElementById('project-poet').value.trim()
                };
                
                if (!formData.name) {
                    this.adminCore.showError('请输入项目名称');
                    return;
                }
                
                await this.adminCore.apiRequest(`/api/admin/projects/${projectId}`, 'PUT', formData);
                this.elements.modal.classList.add('hidden');
                await this.loadMainProjects();
                this.adminCore.showSuccess('项目信息更新成功');
                
            } catch (error) {
                console.error('更新项目信息失败:', error);
                this.adminCore.showError(`更新失败: ${error.message}`);
            } finally {
                this.elements.modalSaveButton.onclick = originalSaveHandler;
            }
        };
        
        this.elements.modal.classList.remove('hidden');
    }

    async toggleProjectStatus(projectId, newStatus) {
        try {
            await this.adminCore.apiRequest(`/api/admin/projects/${projectId}/status`, 'PUT', { status: newStatus });
            await this.loadMainProjects();
            this.adminCore.showSuccess('项目状态更新成功');
        } catch (error) {
            console.error('更新项目状态失败:', error);
            this.adminCore.showError(`更新失败: ${error.message}`);
        }
    }

    async updateSingleProject(projectId) {
        try {
            await this.adminCore.apiRequest(`/api/admin/projects/${projectId}/update`, 'POST');
            await this.loadMainProjects();
            this.adminCore.showSuccess('项目更新成功');
        } catch (error) {
            console.error('更新项目失败:', error);
            this.adminCore.showError(`更新失败: ${error.message}`);
        }
    }

    async publishAllUpdates() {
        try {
            // 获取所有草稿状态的项目
            const draftProjects = this.state.mainProjects.filter(p => p.status === 'draft');
            
            if (draftProjects.length === 0) {
                this.adminCore.showError('没有需要发布的项目');
                return;
            }

            // 确认操作
            if (!confirm(`确定要发布 ${draftProjects.length} 个草稿项目吗？`)) {
                return;
            }

            // 批量发布所有草稿项目
            for (const project of draftProjects) {
                await this.adminCore.apiRequest(`/api/admin/projects/${project.id}/status`, 'PUT', { status: 'published' });
            }

            await this.loadMainProjects();
            this.adminCore.showSuccess(`成功发布 ${draftProjects.length} 个项目`);
        } catch (error) {
            console.error('发布所有更新失败:', error);
            this.adminCore.showError(`发布失败: ${error.message}`);
        }
    }

    enterMainProject(projectId) {
        this.state.currentMainProjectId = projectId;
        this.elements.mainProjectsListSection.classList.add('hidden');
        this.elements.subProjectManagementSection.classList.remove('hidden');
        
        const project = this.state.mainProjects.find(p => p.id === projectId);
        if (project) {
            this.elements.currentMainProjectName.textContent = project.name;
            this.elements.currentMainProjectDesc.textContent = project.description || '';
        }
        
        this.loadSubProjects(projectId);
    }

    async loadSubProjects(mainProjectId) {
        try {
            const response = await this.adminCore.apiRequest(`/api/admin/projects/${mainProjectId}/sub`, 'GET');
            this.state.currentSubProject = response;
            this.renderSubProjects(response);
        } catch (error) {
            console.error('加载子项目失败:', error);
        }
    }

    renderSubProjects(subProjects) {
        if (!this.elements.subProjectList) return;
        
        this.elements.subProjectList.innerHTML = Object.entries(subProjects).map(([subName, subData]) => `
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="text-lg font-bold mb-2">${subName}</h4>
                        <p class="text-gray-600 mb-4">${subData.description || '暂无描述'}</p>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div class="text-center p-2 bg-blue-50 rounded">
                                <div class="font-semibold text-blue-800">${subData.poems?.length || 0}</div>
                                <div class="text-blue-600">诗歌</div>
                            </div>
                            <div class="text-center p-2 bg-green-50 rounded">
                                <div class="font-semibold text-green-800">${subData.questions?.length || 0}</div>
                                <div class="text-green-600">问题</div>
                            </div>
                            <div class="text-center p-2 bg-purple-50 rounded">
                                <div class="font-semibold text-purple-800">${subData.mappings?.length || 0}</div>
                                <div class="text-purple-600">映射</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 ml-4">
                        <button class="btn btn-secondary edit-sub-project-btn" data-sub-name="${subName}">
                            编辑信息
                        </button>
                        <button class="btn btn-primary manage-poems-btn" data-sub-name="${subName}">
                            管理诗歌
                        </button>
                        <button class="btn btn-primary manage-questions-btn" data-sub-name="${subName}">
                            管理问题
                        </button>
                        <button class="btn btn-primary manage-map-btn" data-sub-name="${subName}">
                            管理映射
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async createSubProject() {
        const name = document.getElementById('new-sub-project-name').value.trim();
        const description = document.getElementById('new-sub-project-desc').value.trim();
        
        if (!name) {
            this.adminCore.showError('请输入篇章名称');
            return;
        }
        
        try {
            await this.adminCore.apiRequest(`/api/admin/projects/${this.state.currentMainProjectId}/sub`, 'POST', {
                name,
                description
            });
            
            // 清空输入框
            document.getElementById('new-sub-project-name').value = '';
            document.getElementById('new-sub-project-desc').value = '';
            
            await this.loadSubProjects(this.state.currentMainProjectId);
            this.adminCore.showSuccess('子项目创建成功');
        } catch (error) {
            console.error('创建子项目失败:', error);
            this.adminCore.showError(`创建失败: ${error.message}`);
        }
    }

    openSubProjectInfoModal(subName) {
        const subProject = this.state.currentSubProject[subName];
        if (!subProject) return;
        
        this.elements.modalTitle.textContent = `编辑篇章信息: ${subName}`;
        
        this.elements.modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">篇章名称</label>
                    <input type="text" id="sub-project-name" class="form-input" value="${subName}" readonly>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">篇章描述</label>
                    <textarea id="sub-project-description" class="form-textarea">${subProject.description || ''}</textarea>
                </div>
            </div>
        `;
        
        const originalSaveHandler = this.elements.modalSaveButton.onclick;
        this.elements.modalSaveButton.onclick = async () => {
            try {
                const formData = {
                    description: document.getElementById('sub-project-description').value.trim()
                };
                
                await this.adminCore.apiRequest(`/api/admin/projects/${this.state.currentMainProjectId}/sub/${subName}`, 'PUT', formData);
                this.elements.modal.classList.add('hidden');
                await this.loadSubProjects(this.state.currentMainProjectId);
                this.adminCore.showSuccess('篇章信息更新成功');
                
            } catch (error) {
                console.error('更新篇章信息失败:', error);
                this.adminCore.showError(`更新失败: ${error.message}`);
            } finally {
                this.elements.modalSaveButton.onclick = originalSaveHandler;
            }
        };
        
        this.elements.modal.classList.remove('hidden');
    }

    openContentModal(subName, contentType) {
        const subProject = this.state.currentSubProject[subName];
        if (!subProject) return;
        
        this.elements.modalTitle.textContent = `管理${contentType === 'poems' ? '诗歌' : contentType === 'questions' ? '问题' : '映射'}: ${subName}`;
        
        let contentHtml = '';
        const content = subProject[contentType] || [];
        
        if (contentType === 'poems') {
            contentHtml = `
                <div class="mb-4">
                    <button id="add-poem-btn" class="btn btn-primary">添加新诗歌</button>
                </div>
                <div class="space-y-3">
                    ${content.map(poem => `
                        <div class="border p-3 rounded">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h4 class="font-semibold">${poem.title}</h4>
                                    <p class="text-sm text-gray-600">${poem.content.substring(0, 100)}${poem.content.length > 100 ? '...' : ''}</p>
                                </div>
                                <div class="flex gap-2 ml-4">
                                    <button class="btn btn-secondary edit-poem-btn" data-poem-id="${poem.id}">编辑</button>
                                    <button class="btn btn-danger delete-poem-btn" data-poem-id="${poem.id}">删除</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (contentType === 'questions') {
            contentHtml = `
                <div class="space-y-3">
                    ${content.map(question => `
                        <div class="border p-3 rounded">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h4 class="font-semibold">${question.question}</h4>
                                    <p class="text-sm text-gray-600">${question.answer || '暂无答案'}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (contentType === 'map') {
            contentHtml = `
                <div class="space-y-3">
                    ${content.map(mapping => `
                        <div class="border p-3 rounded">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h4 class="font-semibold">${mapping.key}</h4>
                                    <p class="text-sm text-gray-600">${mapping.value}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        this.elements.modalBody.innerHTML = contentHtml;
        this.elements.modalSaveButton.style.display = 'none';
        
        this.elements.modal.classList.remove('hidden');
    }

    openPoemEditModal(poem = null) {
        this.elements.modalTitle.textContent = poem ? '编辑诗歌' : '添加新诗歌';
        this.elements.modalSaveButton.style.display = 'block';
        
        this.elements.modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">诗歌标题 *</label>
                    <input type="text" id="poem-title" class="form-input" value="${poem?.title || ''}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">诗歌内容 *</label>
                    <textarea id="poem-content" class="form-textarea" style="min-height: 200px;" required>${poem?.content || ''}</textarea>
                </div>
            </div>
        `;
        
        const originalSaveHandler = this.elements.modalSaveButton.onclick;
        this.elements.modalSaveButton.onclick = async () => {
            try {
                const formData = {
                    title: document.getElementById('poem-title').value.trim(),
                    content: document.getElementById('poem-content').value.trim()
                };
                
                if (!formData.title || !formData.content) {
                    this.adminCore.showError('请填写必填字段');
                    return;
                }
                
                if (poem) {
                    // 编辑
                    await this.adminCore.apiRequest(`/api/admin/projects/${this.state.currentMainProjectId}/sub/${this.state.currentSubProject.name}/poems/${poem.id}`, 'PUT', formData);
                    this.adminCore.showSuccess('诗歌更新成功');
                } else {
                    // 创建
                    await this.adminCore.apiRequest(`/api/admin/projects/${this.state.currentMainProjectId}/sub/${this.state.currentSubProject.name}/poems`, 'POST', formData);
                    this.adminCore.showSuccess('诗歌创建成功');
                }
                
                this.elements.modal.classList.add('hidden');
                this.openContentModal(this.state.currentSubProject.name, 'poems');
                
            } catch (error) {
                console.error('保存诗歌失败:', error);
                this.adminCore.showError(`保存失败: ${error.message}`);
            } finally {
                this.elements.modalSaveButton.onclick = originalSaveHandler;
            }
        };
        
        this.elements.modal.classList.remove('hidden');
    }

    bindEvents() {
        // 主项目列表事件
        this.elements.mainProjectList.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const projectId = button.dataset.id;
            
            if (button.matches('.enter-main-project-btn')) {
                this.enterMainProject(projectId);
            }
            if (button.matches('.edit-main-project-btn')) {
                this.openMainProjectInfoModal(projectId);
            }
            if (button.matches('.toggle-status-btn')) {
                const newStatus = button.dataset.status;
                this.toggleProjectStatus(projectId, newStatus);
            }
            if (button.matches('.update-project-btn')) {
                this.updateSingleProject(projectId);
            }
            if (button.matches('.delete-main-project-btn')) {
                if (confirm('确定要永久删除这个项目及其所有内容吗？此操作不可逆。')) {
                    this.adminCore.apiRequest(`/api/admin/projects/${projectId}`, 'DELETE')
                        .then(() => {
                            this.adminCore.showSuccess('项目已成功删除');
                            this.loadMainProjects();
                        })
                        .catch(err => this.adminCore.showError(`删除失败: ${err.message}`));
                }
            }
        });

        // 子项目管理事件
        this.elements.subProjectManagementSection.addEventListener('click', (e) => {
            if (e.target.id === 'create-sub-project-btn') {
                this.createSubProject();
            }
        });

        this.elements.subProjectList.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const subProjectName = button.dataset.subName;
            
            if (button.matches('.edit-sub-project-btn')) {
                this.openSubProjectInfoModal(subProjectName);
            }
            if (button.matches('.manage-poems-btn')) {
                this.openContentModal(subProjectName, 'poems');
            }
            if (button.matches('.manage-questions-btn')) {
                this.openContentModal(subProjectName, 'questions');
            }
            if (button.matches('.manage-map-btn')) {
                this.openContentModal(subProjectName, 'map');
            }
        });

        // 模态框事件
        this.elements.modalCancelButton.addEventListener('click', () => {
            this.elements.modal.classList.add('hidden');
        });
        
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.elements.modal.classList.add('hidden');
            }
        });
        
        this.elements.modalBody.addEventListener('click', (e) => {
            if (e.target.matches('#add-poem-btn')) {
                this.openPoemEditModal();
            }
            if (e.target.matches('.edit-poem-btn')) {
                const poem = this.state.currentSubProject.poems.find(p => p.id === e.target.dataset.poemId);
                this.openPoemEditModal(poem);
            }
            if (e.target.matches('.delete-poem-btn')) {
                const poemId = e.target.dataset.poemId;
                if (confirm('确定要删除这首诗吗？')) {
                    this.adminCore.apiRequest(`/api/admin/projects/${this.state.currentMainProjectId}/sub/${this.state.currentSubProject.name}/poems/${poemId}`, 'DELETE')
                        .then(() => {
                            this.openContentModal(this.state.currentSubProject.name, 'poems');
                        })
                        .catch(err => this.adminCore.showError(`删除失败: ${err.message}`));
                }
            }
        });

        // 返回按钮事件
        this.elements.backToMainProjectsButton.addEventListener('click', () => {
            this.elements.subProjectManagementSection.classList.add('hidden');
            this.elements.mainProjectsListSection.classList.remove('hidden');
            this.state.currentMainProjectId = null;
        });

        // 创建主项目按钮
        document.getElementById('create-main-project-btn').addEventListener('click', () => {
            this.createMainProject();
        });

        // 发布所有更新按钮
        const publishAllBtn = document.getElementById('publish-all-updates-btn');
        if (publishAllBtn) {
            publishAllBtn.addEventListener('click', () => {
                this.publishAllUpdates();
            });
        }
    }

    destroy() {
        // 清理事件监听器
        if (this.elements.mainProjectList) {
            this.elements.mainProjectList.removeEventListener('click', this.boundMainProjectListHandler);
        }
        if (this.elements.subProjectList) {
            this.elements.subProjectList.removeEventListener('click', this.boundSubProjectListHandler);
        }
        // 清理状态
        this.state = null;
        this.elements = null;
    }
}
