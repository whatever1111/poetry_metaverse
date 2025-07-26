document.addEventListener('DOMContentLoaded', () => {
    const fileTreeEl = document.getElementById('file-tree');
    const editorEl = document.getElementById('editor');
    const currentFilePathEl = document.getElementById('current-file-path');
    const saveBtn = document.getElementById('save-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const newFileBtn = document.getElementById('new-file-btn');
    const newFolderBtn = document.getElementById('new-folder-btn');

    let state = {
        selectedPath: null,
        isNewFile: false,
    };

    // --- API Communication ---
    const api = {
        getTree: () => fetch('/api/poems-tree').then(res => res.json()),
        getFile: (path) => fetch(`/api/poem?path=${encodeURIComponent(path)}`).then(res => res.text()),
        saveFile: (path, content) => fetch('/api/poem', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, content }),
        }),
        createItem: (path, content = null, isFolder = false) => fetch('/api/poem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, content: isFolder ? undefined : content, isFolder }),
        }),
        deleteItem: (path) => fetch('/api/poem', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
        }),
        moveItem: (oldPath, newPath, overwrite = false) => fetch('/api/item/move', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPath, newPath, overwrite }),
        }),
    };

    // --- UI Rendering ---
    const renderTree = (items, parentEl) => {
        parentEl.innerHTML = '';
        // Add a class to the root to make it a dropzone
        parentEl.classList.add('dropzone');

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.dataset.path = item.path;
            
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'p-1 rounded cursor-pointer flex items-center';

            const icon = document.createElement('i');
            icon.className = `fa-fw mr-2 fas ${item.type === 'folder' ? 'fa-folder' : 'fa-file-alt'}`;
            contentWrapper.appendChild(icon);

            const name = document.createElement('span');
            name.textContent = item.name;
            contentWrapper.appendChild(name);
            
            if (item.type === 'folder') {
                contentWrapper.classList.add('folder-item', 'font-semibold');
                itemEl.appendChild(contentWrapper);
                
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'ml-4 dropzone';
                childrenContainer.dataset.path = item.path;
                itemEl.appendChild(childrenContainer);

                parentEl.appendChild(itemEl);
                if (item.children) {
                    renderTree(item.children, childrenContainer);
                }
            } else {
                contentWrapper.classList.add('file-item');
                itemEl.appendChild(contentWrapper);
                parentEl.appendChild(itemEl);
            }
        });
        
        makeSortable();
    };

    const updateUI = () => {
        currentFilePathEl.textContent = state.selectedPath || '未选择文件';
        saveBtn.disabled = !state.selectedPath;
        deleteBtn.disabled = !state.selectedPath;
        
        document.querySelectorAll('.file-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.path === state.selectedPath);
        });
    };
    
    // --- Drag and Drop ---
    const makeSortable = () => {
        const dropzones = document.querySelectorAll('.dropzone');
        dropzones.forEach(zone => {
            new Sortable(zone, {
                group: 'shared',
                animation: 150,
                onEnd: async (evt) => {
                    const itemEl = evt.item;
                    const fromPath = itemEl.dataset.path;
                    const toFolderEl = evt.to;
                    const toFolderPath = toFolderEl.dataset.path || '';
                    
                    // Correctly join path segments
                    const fileName = fromPath.split(/[\\/]/).pop();
                    const newPath = toFolderPath ? `${toFolderPath}/${fileName}` : fileName;


                    if (fromPath === newPath) return; // No change

                    try {
                        let res = await api.moveItem(fromPath, newPath);

                        if (res.status === 409) { // Conflict: item exists
                            const shouldOverwrite = confirm(`'${newPath}' 已存在。要覆盖它吗？`);
                            if (shouldOverwrite) {
                                res = await api.moveItem(fromPath, newPath, true); // Retry with overwrite flag
                            } else {
                                // If user cancels, revert the drag-and-drop visually
                                loadTree(); 
                                return;
                            }
                        }

                        if (!res.ok) throw new Error(await res.text());
                        
                        // Optimistically update UI, then reload full tree
                        itemEl.dataset.path = newPath;
                        await loadTree();
                        // re-select the moved item if it was selected
                        if(state.selectedPath === fromPath) {
                            state.selectedPath = newPath;
                            updateUI();
                        }

                    } catch (error) {
                         console.error('Failed to move item:', error);
                         alert(`移动失败: ${error.message}`);
                         // Revert view if API call fails
                         loadTree();
                    }
                }
            });
        });
    };

    // --- Core Logic ---
    const loadTree = async () => {
        try {
            const tree = await api.getTree();
            renderTree(tree, fileTreeEl);
        } catch (error) {
            console.error('Failed to load file tree:', error);
            alert('无法加载文件列表。');
        }
    };
    
    const loadFile = async (path) => {
        try {
            const content = await api.getFile(path);
            editorEl.value = content;
            state.selectedPath = path;
            state.isNewFile = false;
            updateUI();
        } catch (error) {
            console.error(`Failed to load file ${path}:`, error);
            alert('无法加载文件内容。');
        }
    };

    const saveFile = async () => {
        if (!state.selectedPath) return;
        
        const method = state.isNewFile ? api.createItem : api.saveFile;
        try {
            const res = await method(state.selectedPath, editorEl.value);
            if (!res.ok) throw new Error(await res.text());
            
            alert('保存成功!');
            state.isNewFile = false;
            await loadTree(); // Refresh tree to show new file
            updateUI();
        } catch (error) {
            console.error('Failed to save file:', error);
            alert(`保存失败: ${error.message}`);
        }
    };

    const deleteItem = async () => {
        if (!state.selectedPath) return;

        const isFile = state.selectedPath.endsWith('.txt');
        const itemType = isFile ? '文件' : '文件夹';
        
        if (!confirm(`确定要删除这个${itemType}吗？\n${state.selectedPath}\n此操作无法撤销。`)) return;

        try {
            const res = await api.deleteItem(state.selectedPath);
            if (!res.ok) throw new Error(await res.text());
            
            alert(`${itemType}删除成功!`);
            state.selectedPath = null;
            editorEl.value = '';
            await loadTree();
            updateUI();
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert(`删除失败: ${error.message}`);
        }
    };
    
    const createNewItem = async (isFolder) => {
        const itemType = isFolder ? '文件夹' : '文件';
        const extension = isFolder ? '' : '.txt';
        let path = prompt(`请输入新的${itemType}名称 (包含相对路径，如 '子目录/新诗歌')${isFolder ? '' : '，无需输入.txt后缀'}:`);

        if (!path) return;
        
        if (!isFolder && !path.endsWith('.txt')) {
            path += '.txt';
        }

        try {
            const res = await api.createItem(path, '', isFolder);
            if (!res.ok) throw new Error(await res.text());
            
            alert(`${itemType}创建成功!`);
            await loadTree();

            if (!isFolder) {
                await loadFile(path);
                state.isNewFile = true;
            }
        } catch(error) {
             console.error(`Failed to create ${itemType}:`, error);
             alert(`创建失败: ${error.message}`);
        }
    };

    // --- Event Listeners ---
    fileTreeEl.addEventListener('click', (e) => {
        const target = e.target.closest('.file-item, .folder-item');
        if (target) {
            // Find the actual element with the dataset path, which might be a parent
            const itemNode = target.closest('[data-path]');
            const path = itemNode.dataset.path;
            if (target.classList.contains('file-item')) {
                 loadFile(path);
            } else {
                // Optional: Handle folder click (e.g., expand/collapse)
                console.log('Clicked folder:', path);
            }
        }
    });

    saveBtn.addEventListener('click', saveFile);
    deleteBtn.addEventListener('click', deleteItem);
    newFileBtn.addEventListener('click', () => createNewItem(false));
    newFolderBtn.addEventListener('click', () => createNewItem(true));
    
    editorEl.addEventListener('input', () => {
        // Could add dirty checking here if needed
    });

    // --- Initialization ---
    loadTree();
    updateUI();
}); 