const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const POEMS_DIR = path.join(__dirname, 'poems');
const DATA_DIR = path.join(__dirname, 'data');

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from the 'public' directory

// Ensure the poems directory exists
if (!fs.existsSync(POEMS_DIR)) {
    fs.mkdirSync(POEMS_DIR, { recursive: true });
}

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Helper Functions ---

// Helper function to recursively get all .txt files from a directory
const getAllPoemFiles = (dirPath, arrayOfFiles = []) => {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach(item => {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            arrayOfFiles = getAllPoemFiles(fullPath, arrayOfFiles);
        } else if (item.name.endsWith('.txt')) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
};

// Helper function to get the directory tree
const getPoemsTree = (dirPath) => {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const tree = items.map(item => {
        const itemPath = path.join(dirPath, item.name);
        const relativePath = path.relative(POEMS_DIR, itemPath);
        if (item.isDirectory()) {
            return {
                name: item.name,
                type: 'folder',
                path: relativePath,
                children: getPoemsTree(itemPath)
            };
        } else {
            return {
                name: item.name,
                type: 'file',
                path: relativePath
            };
        }
    });
    // Sort so folders appear before files
    return tree.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    });
};

// --- API Endpoints ---

// 1. Get all poems for the main quiz app (now recursive)
app.get('/api/poems-all', (req, res) => {
    try {
        const poems = {};
        const files = getAllPoemFiles(POEMS_DIR);

        for (const filePath of files) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const title = path.basename(filePath, '.txt');
            poems[title] = content;
        }
        res.json(poems);
    } catch (error) {
        console.error('Error getting all poems:', error);
        res.status(500).send('Server error');
    }
});

// 2. Get the directory tree for the admin panel
app.get('/api/poems-tree', (req, res) => {
    try {
        const tree = getPoemsTree(POEMS_DIR);
        res.json(tree);
    } catch (error) {
        console.error('Error getting poems tree:', error);
        res.status(500).send('Server error');
    }
});

// 3. Get a single poem's content
app.get('/api/poem', (req, res) => {
    try {
        const poemPath = req.query.path;
        if (!poemPath) {
            return res.status(400).send('File path is required');
        }
        const fullPath = path.join(POEMS_DIR, poemPath);
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            res.send(content);
        } else {
            res.status(404).send('Poem not found');
        }
    } catch (error) {
        console.error('Error getting poem:', error);
        res.status(500).send('Server error');
    }
});

// 4. Create a new poem or folder
app.post('/api/poem', (req, res) => {
    try {
        const { path: newPath, content = '', isFolder = false } = req.body;
        if (!newPath) {
            return res.status(400).send('Path is required');
        }

        const fullPath = path.join(POEMS_DIR, newPath);

        // Prevent directory traversal
        if (path.relative(POEMS_DIR, fullPath).startsWith('..')) {
            return res.status(403).send('Forbidden path');
        }
        
        const dirName = path.dirname(fullPath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        if (isFolder) {
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
                res.status(201).send('Folder created successfully');
            } else {
                res.status(409).send('Folder already exists');
            }
        } else {
             if (fs.existsSync(fullPath)) {
                return res.status(409).send('File already exists');
            }
            fs.writeFileSync(fullPath, content, 'utf-8');
            res.status(201).send('Poem created successfully');
        }
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).send('Server error');
    }
});


// 5. Update a poem
app.put('/api/poem', (req, res) => {
    try {
        const { path: poemPath, content } = req.body;
        if (!poemPath || content === undefined) {
            return res.status(400).send('Path and content are required');
        }
        const fullPath = path.join(POEMS_DIR, poemPath);
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            res.send('Poem updated successfully');
        } else {
            res.status(404).send('Poem not found');
        }
    } catch (error) {
        console.error('Error updating poem:', error);
        res.status(500).send('Server error');
    }
});

// 6. Delete a poem or folder
app.delete('/api/poem', (req, res) => {
    try {
        const { path: itemPath } = req.body;
        if (!itemPath) {
            return res.status(400).send('Path is required');
        }
        const fullPath = path.join(POEMS_DIR, itemPath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).send('Item not found');
        }

        const stats = fs.lstatSync(fullPath);
        if (stats.isDirectory()) {
            // Only delete empty directories for safety
            if (fs.readdirSync(fullPath).length === 0) {
                fs.rmdirSync(fullPath);
                res.send('Folder deleted successfully');
            } else {
                res.status(400).send('Directory is not empty');
            }
        } else if (stats.isFile()) {
            fs.unlinkSync(fullPath);
            res.send('Poem deleted successfully');
        } else {
            res.status(400).send('Path is not a file or directory');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Server error');
    }
});

// 7. Move a poem or folder
app.put('/api/item/move', (req, res) => {
    try {
        const { oldPath, newPath, overwrite = false } = req.body;
        if (!oldPath || !newPath) {
            return res.status(400).send('Old and new paths are required');
        }

        const fullOldPath = path.join(POEMS_DIR, oldPath);
        const fullNewPath = path.join(POEMS_DIR, newPath);

        // Security check to prevent path traversal
        if (path.relative(POEMS_DIR, fullOldPath).startsWith('..') || path.relative(POEMS_DIR, fullNewPath).startsWith('..')) {
            return res.status(403).send('Forbidden path');
        }

        if (!fs.existsSync(fullOldPath)) {
            return res.status(404).send('Source item not found');
        }

        if (fs.existsSync(fullNewPath)) {
            if (!overwrite) {
                return res.status(409).send('An item with the same name already exists in the destination folder.');
            }

            // When overwriting, prevent file/directory type conflicts
            const oldStats = fs.statSync(fullOldPath);
            const newStats = fs.statSync(fullNewPath);

            if (oldStats.isFile() && newStats.isDirectory()) {
                return res.status(400).send('Cannot overwrite a directory with a file.');
            }
            if (oldStats.isDirectory() && newStats.isFile()) {
                return res.status(400).send('Cannot overwrite a file with a directory.');
            }
        }

        // Ensure parent directory of the new path exists
        const newDir = path.dirname(fullNewPath);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }

        fs.renameSync(fullOldPath, fullNewPath);
        res.send('Item moved successfully');
    } catch (error) {
        console.error('Error moving item:', error);
        // Provide more specific error for non-empty directory overwrite attempt
        if (error.code === 'ENOTEMPTY' || error.code === 'EPERM') {
             return res.status(400).send('Cannot overwrite a non-empty directory.');
        }
        res.status(500).send('Server error');
    }
});

// 8. Get all questions
app.get('/api/questions', (req, res) => {
    try {
        const questionsPath = path.join(DATA_DIR, 'questions.json');
        if (fs.existsSync(questionsPath)) {
            const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
            res.json(questions);
        } else {
            res.status(404).send('Questions file not found');
        }
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).send('Server error');
    }
});

// 9. Update questions
app.put('/api/questions', (req, res) => {
    try {
        const questions = req.body;
        if (!Array.isArray(questions)) {
            return res.status(400).send('Questions must be an array');
        }
        const questionsPath = path.join(DATA_DIR, 'questions.json');
        fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
        res.send('Questions updated successfully');
    } catch (error) {
        console.error('Error updating questions:', error);
        res.status(500).send('Server error');
    }
});

// 10. Get mappings
app.get('/api/mappings', (req, res) => {
    try {
        const mappingsPath = path.join(DATA_DIR, 'mappings.json');
        if (fs.existsSync(mappingsPath)) {
            const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));
            res.json(mappings);
        } else {
            res.status(404).send('Mappings file not found');
        }
    } catch (error) {
        console.error('Error getting mappings:', error);
        res.status(500).send('Server error');
    }
});

// 11. Update mappings
app.put('/api/mappings', (req, res) => {
    try {
        const mappings = req.body;
        if (!mappings || typeof mappings !== 'object') {
            return res.status(400).send('Mappings must be an object');
        }
        const mappingsPath = path.join(DATA_DIR, 'mappings.json');
        fs.writeFileSync(mappingsPath, JSON.stringify(mappings, null, 2), 'utf-8');
        res.send('Mappings updated successfully');
    } catch (error) {
        console.error('Error updating mappings:', error);
        res.status(500).send('Server error');
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 