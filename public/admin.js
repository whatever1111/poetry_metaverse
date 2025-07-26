document.addEventListener('DOMContentLoaded', () => {
    // ===============================
    // Global State and API Functions
    // ===============================
    let currentTab = 'poems';
    let currentFile = null;
    let questions = [];
    let mappings = {};
    let currentUnit = '观我生';
    let defaultUnit = '观我生';
    let poems = [];
    let answerCombinations = [];
    let expandedFolders = new Set(); // 跟踪展开的文件夹

    // API wrapper
    const api = {
        async fetchTree() {
            const response = await fetch('/api/poems-tree');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        },

        async fetchFile(path) {
            const response = await fetch(`/api/poem?path=${encodeURIComponent(path)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        },

        async saveFile(path, content) {
            const response = await fetch('/api/poem', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, content })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        },

        async createItem(path, content = '', isFolder = false) {
            const response = await fetch('/api/poem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, content, isFolder })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        },

        async deleteItem(path) {
            const response = await fetch('/api/poem', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        },

        async moveItem(oldPath, newPath, overwrite = false) {
            const response = await fetch('/api/item/move', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPath, newPath, overwrite })
            });
            if (!response.ok) {
                if (response.status === 409) {
                    const confirmed = confirm('目标位置已存在同名文件，是否覆盖？');
                    if (confirmed) {
                        return this.moveItem(oldPath, newPath, true);
                    } else {
                        throw new Error('用户取消了覆盖操作');
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        },

        async fetchQuestions() {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        },

        async saveQuestions(questionsData) {
            const response = await fetch('/api/questions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionsData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        },

        async fetchMappings() {
            const response = await fetch('/api/mappings');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        },

        async saveMappings(mappingsData) {
            const response = await fetch('/api/mappings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mappingsData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        }
    };

    // ===============================
    // Tab Management
    // ===============================
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabName) {
        currentTab = tabName;
        
        // Update button states
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `tab-${tabName}`) {
                btn.classList.add('active');
            }
        });

        // Update content visibility
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `content-${tabName}`) {
                content.classList.add('active');
            }
        });

        // Initialize the active tab
        if (tabName === 'poems') {
            initPoemsTab();
        } else if (tabName === 'questions') {
            initQuestionsTab();
        } else if (tabName === 'mapping') {
            initMappingTab();
        }
    }

    // Add event listeners for tab buttons
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.id.replace('tab-', '');
            switchTab(tabName);
        });
    });

    // ===============================
    // Poems Management Module
    // ===============================
    let sortableInstance = null;

    async function initPoemsTab() {
        await loadFileTree();
        setupContextMenu();
    }

    async function loadFileTree() {
        try {
            const tree = await api.fetchTree();
            renderTree(tree);
        } catch (error) {
            console.error('Error loading file tree:', error);
            alert('加载文件树失败: ' + error.message);
        }
    }

    function renderTree(tree, container = document.getElementById('file-tree'), depth = 0) {
        if (depth === 0) {
            container.innerHTML = '';
        }
        
        tree.forEach(item => {
            const itemContainer = document.createElement('div');
            
            // Create tree item
            const treeItem = document.createElement('div');
            treeItem.className = 'tree-item';
            treeItem.dataset.path = item.path;
            treeItem.dataset.type = item.type;
            treeItem.dataset.name = item.name;
            
            // Add indentation
            for (let i = 0; i < depth; i++) {
                const indent = document.createElement('span');
                indent.className = 'tree-indent';
                treeItem.appendChild(indent);
            }
            
            // Add expand/collapse button for folders
            const expandBtn = document.createElement('span');
            expandBtn.className = 'tree-expand';
            
            if (item.type === 'folder') {
                if (item.children && item.children.length > 0) {
                    expandBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    const isExpanded = expandedFolders.has(item.path);
                    if (isExpanded) {
                        expandBtn.classList.add('expanded');
                    }
                } else {
                    expandBtn.classList.add('empty');
                }
            } else {
                expandBtn.classList.add('empty');
            }
            
            treeItem.appendChild(expandBtn);
            
            // Add icon
            const icon = document.createElement('i');
            icon.className = 'tree-icon fas';
            if (item.type === 'folder') {
                icon.classList.add('fa-folder', 'folder-icon');
                if (expandedFolders.has(item.path)) {
                    icon.classList.add('open');
                }
            } else {
                icon.classList.add('fa-file-alt', 'file-icon');
            }
            treeItem.appendChild(icon);
            
            // Add label
            const label = document.createElement('span');
            label.className = 'tree-label';
            label.textContent = item.name;
            treeItem.appendChild(label);
            
            // Add click event
            treeItem.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.type === 'file') {
                    selectFile(item.path, item.name);
                } else {
                    toggleFolder(item.path, itemContainer);
                }
            });
            
            // Add right-click event
            treeItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, item);
            });
            
            itemContainer.appendChild(treeItem);
            
            // Add children container for folders
            if (item.type === 'folder' && item.children) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                
                if (expandedFolders.has(item.path)) {
                    childrenContainer.classList.add('expanded');
                }
                
                renderTree(item.children, childrenContainer, depth + 1);
                itemContainer.appendChild(childrenContainer);
            }
            
            container.appendChild(itemContainer);
        });
    }

    function toggleFolder(folderPath, itemContainer) {
        const expandBtn = itemContainer.querySelector('.tree-expand');
        const childrenContainer = itemContainer.querySelector('.tree-children');
        const icon = itemContainer.querySelector('.tree-icon');
        
        if (expandedFolders.has(folderPath)) {
            // Collapse
            expandedFolders.delete(folderPath);
            expandBtn.classList.remove('expanded');
            icon.classList.remove('open');
            if (childrenContainer) {
                childrenContainer.classList.remove('expanded');
            }
        } else {
            // Expand
            expandedFolders.add(folderPath);
            expandBtn.classList.add('expanded');
            icon.classList.add('open');
            if (childrenContainer) {
                childrenContainer.classList.add('expanded');
            }
        }
    }

    async function selectFile(path, name) {
        try {
            // Remove previous selection
            document.querySelectorAll('.tree-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selection to current item
            document.querySelector(`[data-path="${path}"]`).classList.add('selected');
            
            const content = await api.fetchFile(path);
            const editor = document.getElementById('poem-editor');
            const title = document.getElementById('editor-title');
            const status = document.getElementById('editor-status');
            
            editor.value = content;
            editor.disabled = false;
            title.innerHTML = `<i class="fas fa-file-alt mr-2 text-blue-500"></i>${name}`;
            document.getElementById('save-btn').disabled = false;
            document.getElementById('delete-btn').disabled = false;
            
            // Update status
            const lines = content.split('\n').length;
            const chars = content.length;
            status.textContent = `${lines} 行, ${chars} 字符`;
            
            currentFile = { path, name };
        } catch (error) {
            console.error('Error loading file:', error);
            alert('加载文件失败: ' + error.message);
        }
    }

    // Context Menu
    function setupContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        
        // Hide context menu when clicking elsewhere
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });
        
        // Handle context menu actions
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                handleContextAction(action);
                contextMenu.style.display = 'none';
            }
        });
    }
    
    let contextTarget = null;
    
    function showContextMenu(e, item) {
        const contextMenu = document.getElementById('context-menu');
        contextTarget = item;
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        
        // Adjust position if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (e.pageX - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (e.pageY - rect.height) + 'px';
        }
    }
    
    async function handleContextAction(action) {
        switch (action) {
            case 'new-file':
                await createNewFile();
                break;
            case 'new-folder':
                await createNewFolder();
                break;
            case 'rename':
                await renameItem();
                break;
            case 'delete':
                await deleteItem();
                break;
            case 'refresh':
                await loadFileTree();
                break;
        }
    }

    // File operations
    async function createNewFile(parentPath = '') {
        const fileName = prompt('请输入文件名（不需要.txt后缀）:');
        if (!fileName) return;
        
        const path = parentPath ? `${parentPath}/${fileName}.txt` : `${fileName}.txt`;
        try {
            await api.createItem(path, '');
            await loadFileTree();
            selectFile(path, `${fileName}.txt`);
        } catch (error) {
            console.error('Error creating file:', error);
            alert('创建文件失败: ' + error.message);
        }
    }

    async function createNewFolder(parentPath = '') {
        const folderName = prompt('请输入文件夹名称:');
        if (!folderName) return;
        
        const path = parentPath ? `${parentPath}/${folderName}` : folderName;
        try {
            await api.createItem(path, '', true);
            expandedFolders.add(parentPath || 'root'); // 展开父文件夹
            await loadFileTree();
        } catch (error) {
            console.error('Error creating folder:', error);
            alert('创建文件夹失败: ' + error.message);
        }
    }

    async function renameItem() {
        if (!contextTarget) return;
        
        const oldName = contextTarget.name;
        const newName = prompt('请输入新名称:', oldName);
        if (!newName || newName === oldName) return;
        
        const pathParts = contextTarget.path.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');
        
        try {
            await api.moveItem(contextTarget.path, newPath);
            await loadFileTree();
            if (currentFile && currentFile.path === contextTarget.path) {
                currentFile = null;
                document.getElementById('poem-editor').value = '';
                document.getElementById('poem-editor').disabled = true;
                document.getElementById('editor-title').innerHTML = '<i class="fas fa-edit mr-2 text-gray-400"></i>选择一个文件进行编辑';
                document.getElementById('save-btn').disabled = true;
                document.getElementById('delete-btn').disabled = true;
            }
        } catch (error) {
            console.error('Error renaming item:', error);
            alert('重命名失败: ' + error.message);
        }
    }

    async function deleteItem() {
        if (!contextTarget) return;
        
        const itemType = contextTarget.type === 'folder' ? '文件夹' : '文件';
        if (!confirm(`确定要删除${itemType} "${contextTarget.name}" 吗？`)) return;
        
        try {
            await api.deleteItem(contextTarget.path);
            await loadFileTree();
            if (currentFile && currentFile.path === contextTarget.path) {
                currentFile = null;
                document.getElementById('poem-editor').value = '';
                document.getElementById('poem-editor').disabled = true;
                document.getElementById('editor-title').innerHTML = '<i class="fas fa-edit mr-2 text-gray-400"></i>选择一个文件进行编辑';
                document.getElementById('save-btn').disabled = true;
                document.getElementById('delete-btn').disabled = true;
                document.getElementById('editor-status').textContent = '';
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('删除失败: ' + error.message);
        }
    }

    // Button event listeners
    document.getElementById('new-file-btn').addEventListener('click', () => createNewFile());
    document.getElementById('new-folder-btn').addEventListener('click', () => createNewFolder());
    document.getElementById('refresh-tree-btn').addEventListener('click', loadFileTree);

    document.getElementById('save-btn').addEventListener('click', async () => {
        if (!currentFile) return;
        
        const content = document.getElementById('poem-editor').value;
        try {
            await api.saveFile(currentFile.path, content);
            
            // Update status
            const lines = content.split('\n').length;
            const chars = content.length;
            document.getElementById('editor-status').textContent = `${lines} 行, ${chars} 字符 - 已保存`;
            
            setTimeout(() => {
                const lines = content.split('\n').length;
                const chars = content.length;
                document.getElementById('editor-status').textContent = `${lines} 行, ${chars} 字符`;
            }, 2000);
        } catch (error) {
            console.error('Error saving file:', error);
            alert('保存失败: ' + error.message);
        }
    });

    document.getElementById('delete-btn').addEventListener('click', async () => {
        if (!currentFile) return;
        
        if (confirm(`确定要删除 "${currentFile.name}" 吗？`)) {
            try {
                await api.deleteItem(currentFile.path);
                await loadFileTree();
                document.getElementById('poem-editor').value = '';
                document.getElementById('poem-editor').disabled = true;
                document.getElementById('editor-title').innerHTML = '<i class="fas fa-edit mr-2 text-gray-400"></i>选择一个文件进行编辑';
                document.getElementById('save-btn').disabled = true;
                document.getElementById('delete-btn').disabled = true;
                document.getElementById('editor-status').textContent = '';
                currentFile = null;
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('删除失败: ' + error.message);
            }
        }
    });

    // Real-time character count
    document.getElementById('poem-editor').addEventListener('input', (e) => {
        const content = e.target.value;
        const lines = content.split('\n').length;
        const chars = content.length;
        document.getElementById('editor-status').textContent = `${lines} 行, ${chars} 字符`;
    });

    // ===============================
    // Questions Management Module
    // ===============================
    async function initQuestionsTab() {
        await fetchQuestions();
        renderQuestions();
    }

    async function fetchQuestions() {
        try {
            questions = await api.fetchQuestions();
        } catch (error) {
            console.error('Error fetching questions:', error);
            alert('加载问题失败: ' + error.message);
        }
    }

    function renderQuestions() {
        const container = document.getElementById('questions-container');
        const template = document.getElementById('question-template');
        
        container.innerHTML = '';
        
        questions.forEach((question, index) => {
            const questionCard = template.content.cloneNode(true);
            
            questionCard.querySelector('.question-id').value = question.id || `question${index + 1}`;
            questionCard.querySelector('.question-text').value = question.question || '';
            questionCard.querySelector('.option-a').value = question.options?.A || '';
            questionCard.querySelector('.option-b').value = question.options?.B || '';
            questionCard.querySelector('.meaning-a').value = question.meaning?.A || '';
            questionCard.querySelector('.meaning-b').value = question.meaning?.B || '';
            
            questionCard.querySelector('.delete-question-btn').addEventListener('click', () => {
                if (confirm('确定要删除这个问题吗？')) {
                    questions.splice(index, 1);
                    renderQuestions();
                }
            });
            
            container.appendChild(questionCard);
        });
    }

    document.getElementById('add-question-btn').addEventListener('click', () => {
        const newQuestion = {
            id: `question${questions.length + 1}`,
            question: '',
            options: { A: '', B: '' },
            meaning: { A: '', B: '' }
        };
        questions.push(newQuestion);
        renderQuestions();
        
        setTimeout(() => {
            const container = document.getElementById('questions-container');
            const newQuestionEl = container.lastElementChild;
            newQuestionEl.scrollIntoView({ behavior: 'smooth' });
            newQuestionEl.querySelector('.question-text').focus();
        }, 100);
    });

    document.getElementById('save-questions-btn').addEventListener('click', async () => {
        try {
            const container = document.getElementById('questions-container');
            const updatedQuestions = Array.from(container.children).map(card => {
                return {
                    id: card.querySelector('.question-id').value,
                    question: card.querySelector('.question-text').value,
                    options: {
                        A: card.querySelector('.option-a').value,
                        B: card.querySelector('.option-b').value
                    },
                    meaning: {
                        A: card.querySelector('.meaning-a').value,
                        B: card.querySelector('.meaning-b').value
                    }
                };
            });
            
            const invalidQuestions = updatedQuestions.filter(q => 
                !q.question || !q.options.A || !q.options.B || !q.meaning.A || !q.meaning.B
            );
            
            if (invalidQuestions.length > 0) {
                alert('请填写所有问题和选项内容。');
                return;
            }
            
            await api.saveQuestions(updatedQuestions);
            alert('问题保存成功！');
            questions = updatedQuestions;
            renderQuestions();
        } catch (error) {
            console.error('Error saving questions:', error);
            alert('保存失败: ' + error.message);
        }
    });

    // ===============================
    // Mapping Management Module
    // ===============================
    async function initMappingTab() {
        await Promise.all([
            fetchMappings(),
            fetchQuestions(),
            fetchPoems()
        ]);
        generateAnswerCombinations();
        populateUnitSelect();
        renderMappingTable();
    }

    async function fetchMappings() {
        try {
            const data = await api.fetchMappings();
            mappings = data.units || { '观我生': {} };
            defaultUnit = data.defaultUnit || '观我生';
            currentUnit = defaultUnit;
            
            document.getElementById('unit-select').value = currentUnit;
            document.getElementById('default-unit-checkbox').checked = currentUnit === defaultUnit;
        } catch (error) {
            console.error('Error fetching mappings:', error);
            alert('加载映射关系失败: ' + error.message);
        }
    }

    async function fetchPoems() {
        try {
            const tree = await api.fetchTree();
            poems = extractPoemTitles(tree);
        } catch (error) {
            console.error('Error fetching poems:', error);
            alert('加载诗歌失败: ' + error.message);
        }
    }

    function extractPoemTitles(tree) {
        let titles = [];
        
        const processNode = (node) => {
            if (node.type === 'file' && node.name.endsWith('.txt')) {
                titles.push(node.name.replace('.txt', ''));
            } else if (node.type === 'folder' && node.children) {
                node.children.forEach(processNode);
            }
        };
        
        tree.forEach(processNode);
        return titles;
    }

    function generateAnswerCombinations() {
        const n = questions.length;
        answerCombinations = [];
        
        const generateCombination = (index, current) => {
            if (index === n) {
                answerCombinations.push(current);
                return;
            }
            generateCombination(index + 1, current + 'A');
            generateCombination(index + 1, current + 'B');
        };
        
        if (n > 0) {
            generateCombination(0, '');
        }
    }

    function populateUnitSelect() {
        const unitSelect = document.getElementById('unit-select');
        unitSelect.innerHTML = '';
        Object.keys(mappings).forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            unitSelect.appendChild(option);
        });
    }

    function renderMappingTable() {
        if (!answerCombinations.length || !poems.length) return;
        
        const mappingTable = document.getElementById('mapping-table');
        
        // Create header row with answer combinations
        const headerRow = mappingTable.querySelector('thead tr');
        headerRow.innerHTML = '<th>诗歌标题</th>';
        answerCombinations.forEach(combo => {
            const th = document.createElement('th');
            th.textContent = combo;
            th.className = 'combo-header';
            th.title = `答案组合: ${combo}`;
            headerRow.appendChild(th);
        });
        
        // Create body rows with poems
        const tbody = mappingTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        poems.forEach(poem => {
            const tr = document.createElement('tr');
            
            // Add poem title cell
            const titleCell = document.createElement('td');
            titleCell.textContent = poem;
            titleCell.title = poem;
            tr.appendChild(titleCell);
            
            // Add cells for each answer combination
            answerCombinations.forEach(combo => {
                const td = document.createElement('td');
                td.className = 'mapping-cell';
                td.dataset.poem = poem;
                td.dataset.combo = combo;
                td.title = `${poem} ← ${combo}`;
                
                // Add check icon
                const checkIcon = document.createElement('i');
                checkIcon.className = 'fas fa-check check-icon';
                td.appendChild(checkIcon);
                
                // Check if this combination is mapped to this poem
                const currentMapping = mappings[currentUnit] || {};
                if (currentMapping[combo] === poem) {
                    td.classList.add('selected');
                }
                
                // Add click event to select/deselect
                td.addEventListener('click', () => {
                    // Deselect all cells in this column
                    document.querySelectorAll(`td[data-combo="${combo}"]`).forEach(cell => {
                        cell.classList.remove('selected');
                    });
                    
                    // Select this cell
                    td.classList.add('selected');
                    
                    // Update mapping in memory
                    if (!mappings[currentUnit]) {
                        mappings[currentUnit] = {};
                    }
                    mappings[currentUnit][combo] = poem;
                    
                    // Update statistics
                    updateMappingStats();
                });
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        // Update statistics
        updateMappingStats();
        setupPoemSearch();
    }

    // Update mapping statistics
    function updateMappingStats() {
        const totalPoems = poems.length;
        const totalCombinations = answerCombinations.length;
        const currentMapping = mappings[currentUnit] || {};
        const mappedCount = Object.keys(currentMapping).length;
        const unmappedCount = totalCombinations - mappedCount;
        const completionRate = totalCombinations > 0 ? Math.round((mappedCount / totalCombinations) * 100) : 0;
        
        document.getElementById('total-poems').textContent = totalPoems;
        document.getElementById('total-combinations').textContent = totalCombinations;
        document.getElementById('mapped-count').textContent = mappedCount;
        document.getElementById('unmapped-count').textContent = unmappedCount;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        
        // Update completion rate color
        const completionElement = document.getElementById('completion-rate');
        if (completionRate === 100) {
            completionElement.className = 'stat-badge completed';
        } else if (completionRate > 0) {
            completionElement.className = 'stat-badge pending';
        } else {
            completionElement.className = 'stat-badge';
        }
    }

    // Setup poem search functionality
    function setupPoemSearch() {
        const searchInput = document.getElementById('poem-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#mapping-table tbody tr');
            
            rows.forEach(row => {
                const poemTitle = row.querySelector('td:first-child').textContent.toLowerCase();
                if (poemTitle.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Auto mapping functionality
    function autoMapCombinations() {
        if (!answerCombinations.length || !poems.length) {
            alert('没有可用的诗歌或答案组合进行自动映射。');
            return;
        }
        
        const currentMapping = mappings[currentUnit] || {};
        const unmappedCombinations = answerCombinations.filter(combo => !currentMapping[combo]);
        
        if (unmappedCombinations.length === 0) {
            alert('所有答案组合都已映射完成。');
            return;
        }
        
        if (!confirm(`将自动为 ${unmappedCombinations.length} 个未映射的答案组合分配诗歌。是否继续？`)) {
            return;
        }
        
        // Auto assign poems to unmapped combinations
        unmappedCombinations.forEach((combo, index) => {
            const poemIndex = index % poems.length;
            currentMapping[combo] = poems[poemIndex];
        });
        
        mappings[currentUnit] = currentMapping;
        renderMappingTable();
        alert(`自动映射完成！已为 ${unmappedCombinations.length} 个答案组合分配诗歌。`);
    }

    // Clear all mappings
    function clearAllMappings() {
        const currentMapping = mappings[currentUnit] || {};
        const mappedCount = Object.keys(currentMapping).length;
        
        if (mappedCount === 0) {
            alert('当前没有任何映射需要清除。');
            return;
        }
        
        if (!confirm(`确定要清除当前单元的所有 ${mappedCount} 个映射关系吗？`)) {
            return;
        }
        
        mappings[currentUnit] = {};
        renderMappingTable();
        alert('所有映射关系已清除。');
    }

    // Unit management
    document.getElementById('unit-select').addEventListener('change', () => {
        currentUnit = document.getElementById('unit-select').value;
        document.getElementById('default-unit-checkbox').checked = currentUnit === defaultUnit;
        renderMappingTable();
    });

    document.getElementById('default-unit-checkbox').addEventListener('change', () => {
        if (document.getElementById('default-unit-checkbox').checked) {
            defaultUnit = currentUnit;
        }
    });

    document.getElementById('add-unit-btn').addEventListener('click', () => {
        const unitName = prompt('请输入新单元名称:');
        if (!unitName) return;
        
        if (mappings[unitName]) {
            alert('该单元名称已存在！');
            return;
        }
        
        mappings[unitName] = {};
        currentUnit = unitName;
        populateUnitSelect();
        document.getElementById('unit-select').value = currentUnit;
        renderMappingTable();
    });

    document.getElementById('delete-unit-btn').addEventListener('click', () => {
        if (Object.keys(mappings).length <= 1) {
            alert('至少需要保留一个单元！');
            return;
        }
        
        if (confirm(`确定要删除单元 "${currentUnit}" 吗？`)) {
            delete mappings[currentUnit];
            currentUnit = Object.keys(mappings)[0];
            if (defaultUnit === currentUnit) {
                defaultUnit = currentUnit;
            }
            populateUnitSelect();
            document.getElementById('unit-select').value = currentUnit;
            document.getElementById('default-unit-checkbox').checked = currentUnit === defaultUnit;
            renderMappingTable();
        }
    });

    // Invert selection functionality
    document.getElementById('invert-selection-btn').addEventListener('click', () => {
        const currentMapping = mappings[currentUnit] || {};
        const selectedCells = document.querySelectorAll('.selected');
        
        if (selectedCells.length === 0) {
            alert('当前没有任何选择可以反选。');
            return;
        }
        
        if (confirm('确定要反选所有当前选择吗？这将清除所有已选择的映射。')) {
            // Clear all selected cells
            selectedCells.forEach(cell => {
                cell.classList.remove('selected');
            });
            
            // Clear mappings in memory
            mappings[currentUnit] = {};
            
            // Update statistics
            updateMappingStats();
            
            alert('已清除所有选择。');
        }
    });

    // Auto mapping functionality
    document.getElementById('auto-map-btn').addEventListener('click', autoMapCombinations);

    // Clear all mappings functionality
    document.getElementById('clear-all-btn').addEventListener('click', clearAllMappings);

    document.getElementById('refresh-poems-btn').addEventListener('click', async () => {
        await fetchPoems();
        renderMappingTable();
    });

    document.getElementById('save-mapping-btn').addEventListener('click', async () => {
        const currentMapping = mappings[currentUnit] || {};
        const missingCombinations = answerCombinations.filter(combo => !currentMapping[combo]);
        
        if (missingCombinations.length > 0) {
            alert(`以下答案组合尚未映射到诗歌: ${missingCombinations.join(', ')}`);
            return;
        }
        
        try {
            await api.saveMappings({
                defaultUnit,
                units: mappings
            });
            alert('映射关系保存成功！');
        } catch (error) {
            console.error('Error saving mappings:', error);
            alert('保存失败: ' + error.message);
        }
    });

    // ===============================
    // Initialize Application
    // ===============================
    // Initialize with poems tab
    switchTab('poems');
}); 