// 周与春秋宇宙专用脚本
// 适配新的层级化API结构，从旧index.html迁移逻辑

class ZhouUniverse {
    constructor() {
        this.state = {
            projects: [],
            poems: {},
            questions: {},
            mappings: {},
            poemArchetypes: [],
            currentMainProject: null,
            currentChapterName: null,
            currentQuestionIndex: 0,
            userAnswers: [],
            userAnswerMeanings: [],
            poetButtonClicked: false,
            poetButtonClickCount: 0,
        };

        this.$ = (selector) => document.querySelector(selector);
        this.$$ = (selector) => document.querySelectorAll(selector);
        
        this.screens = {
            main: this.$('#main-project-selection-screen'),
            sub: this.$('#sub-project-selection-screen'),
            quiz: this.$('#question-screen'),
            result: this.$('#result-screen'),
        };

        this.init();
    }

    async init() {
        try {
            await this.loadUniverseContent();
            this.renderMainProjects();
            this.bindEvents();
            this.hideLoadingMessage();
        } catch (error) {
            console.error("加载周与春秋宇宙数据失败:", error);
            this.showError('加载数据失败，请稍后重试。');
        }
    }

    async loadUniverseContent() {
        // 使用新的层级化API
        const response = await fetch('/api/universes/universe_zhou_spring_autumn/content');
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 适配新的API结构
        this.state.projects = data.content.projects || [];
        this.state.questions = data.content.questions || {};
        this.state.mappings = data.content.mappings.units || {};
        this.state.poems = data.content.poems || {};
        this.state.poemArchetypes = data.content.poemArchetypes.poems || [];
    }

    renderMainProjects() {
        this.showScreen('main');
        const mainProjectList = this.$('#main-project-list');
        mainProjectList.innerHTML = '';
        
        // 检查是否有项目数据
        if (!this.state.projects || this.state.projects.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.state.projects.forEach((p, index) => {
            mainProjectList.innerHTML += `
                <div class="project-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-fadeInUp" style="animation-delay: ${0.1 * index}s;" data-project-id="${p.id}">
                    <h2 class="text-2xl font-bold mb-2 text-gray-800">${p.name}</h2>
                    <div class="text-gray-600 mb-4 whitespace-pre-line">${p.description}</div>
                    <div class="flex justify-between items-center mt-4">
                        <p class="text-sm text-gray-500">导游: ${p.poet || '未指定'}</p>
                        <button class="enter-main-project-btn bg-gray-800 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-700">进入</button>
                    </div>
                </div>`;
        });
    }

    renderChapterSelection(projectId) {
        this.state.currentMainProject = this.state.projects.find(p => p.id === projectId);
        if (!this.state.currentMainProject) return;

        this.showScreen('sub');
        const p = this.state.currentMainProject;
        this.$('#main-project-title').textContent = p.name;
        this.$('#main-project-description').innerHTML = p.description.replace(/\n/g, '<br>');
        
        const subProjectList = this.$('#sub-project-list');
        subProjectList.innerHTML = '';
        
        p.subProjects.forEach((sp, index) => {
            subProjectList.innerHTML += `
                <div class="project-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-fadeInUp" style="animation-delay: ${0.1 * index}s;" data-chapter-name="${sp.name}">
                    <h3 class="text-xl font-bold mb-2">${sp.name}</h3>
                    <div class="text-gray-500 whitespace-pre-line">${sp.description}</div>
                </div>
            `;
        });
    }

    startQuiz(chapterName) {
        this.state.currentChapterName = chapterName;
        this.state.currentQuestionIndex = 0;
        this.state.userAnswers = [];
        this.state.userAnswerMeanings = [];
        
        this.$('#quiz-project-title').textContent = this.state.currentChapterName;
        this.$('#question-container').style.opacity = 1;

        this.renderCurrentQuestion();
        this.showScreen('quiz');
    }

    renderCurrentQuestion() {
        const chapterQuestions = this.state.questions[this.state.currentChapterName];
        if (!chapterQuestions || chapterQuestions.length <= this.state.currentQuestionIndex) {
            this.showResult();
            return;
        }
        
        const q = chapterQuestions[this.state.currentQuestionIndex];
        this.$('#question-text').textContent = q.question;
        this.$('#option-a-button').textContent = q.options.A;
        this.$('#option-b-button').textContent = q.options.B;
        this.$('#question-counter').textContent = `${this.state.currentQuestionIndex + 1} / ${chapterQuestions.length}`;
    }

    handleAnswer(choice) {
        const q = this.state.questions[this.state.currentChapterName][this.state.currentQuestionIndex];
        this.state.userAnswers.push(choice);
        this.state.userAnswerMeanings.push(q.meaning[choice]);
        
        this.$('#question-container').style.opacity = 0;
        setTimeout(() => {
            this.state.currentQuestionIndex++;
            if (this.state.currentQuestionIndex < this.state.questions[this.state.currentChapterName].length) {
                this.renderCurrentQuestion();
                this.$('#question-container').style.opacity = 1;
            } else {
                this.showResult();
            }
        }, 400);
    }

    showResult() {
        // 重置"最好不要点"按钮状态
        this.state.poetButtonClicked = false;
        this.state.poetButtonClickCount = 0;
        
        const answerKeyMap = { 'A': '1', 'B': '0' };
        const resultKey = this.state.userAnswers.map(ans => answerKeyMap[ans]).join('');
        
        const finalPoemTitleWithQuotes = this.state.mappings[this.state.currentChapterName][resultKey];
        const finalPoemTitle = finalPoemTitleWithQuotes.replace(/[《》]/g, '');
        const finalPoemBody = this.state.poems[finalPoemTitle];

        if (finalPoemBody) {
            this.$('#poem-title').textContent = finalPoemTitleWithQuotes;
            this.$('#poem-body').textContent = finalPoemBody;
        } else {
            this.$('#poem-title').textContent = "未知的诗篇";
            this.$('#poem-body').textContent = `朋友，你的选择之路独辟蹊径，连我的诗库都未曾预见这首名为《${finalPoemTitle}》的诗。`;
        }
        
        this.$('#interpretation-container').classList.add('hidden');
        this.$$('.result-btn').forEach(btn => btn.disabled = false);
        
        const aiPoetName = '陆家明';
        this.$('#interpret-button').innerHTML = `听${aiPoetName}为你解诗`;
        this.$('#listen-button').innerHTML = `听${aiPoetName}为你读诗`;
        this.$('#interpretation-author').textContent = aiPoetName;

        // 检查当前诗歌是否有吴任几的解诗内容
        const poemArchetype = this.state.poemArchetypes.find(p => p.title === finalPoemTitle);
        const buttonText = this.getPoetButtonText(this.state.poetButtonClickCount);
        
        if (poemArchetype && poemArchetype.poet_explanation) {
            this.$('#poet-interpret-button').disabled = false;
            this.$('#poet-interpret-button').innerHTML = buttonText;
        } else {
            this.$('#poet-interpret-button').disabled = false;
            this.$('#poet-interpret-button').innerHTML = buttonText;
        }

        this.showScreen('result');
    }

    getPoetButtonText(clickCount) {
        const texts = [
            '最好不要点',
            '哎，还是点了……',
            '点都点了，看吧',
            '别点了，别点了',
            '点吧，点吧……'
        ];
        return texts[Math.min(clickCount, texts.length - 1)];
    }

    async handleInterpretation() {
        const aiPoetName = '陆家明';
        const btn = this.$('#interpret-button');
        btn.disabled = true;
        btn.innerHTML = `朋友，稍等，${aiPoetName}正在构思... <div class="loader"></div>`;
        
        // 重置"最好不要点"按钮状态
        this.state.poetButtonClicked = false;
        this.state.poetButtonClickCount = 0;

        const userState = this.state.userAnswerMeanings.join('，');
        const prompt = `你现在是AI诗人"陆家明"。你的语言风格充满诗意、温柔且富有哲思。一位朋友刚刚通过一个心理测试，得到了下面的诗歌，而他当下的心境是：${userState}。\n\n他得到的诗歌是：\n标题：${this.$('#poem-title').textContent}\n内容：\n${this.$('#poem-body').textContent}\n\n请你以陆家明的身份，为他专门解读这首诗...`;

        try {
            const response = await fetch(`/api/interpret`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            if (!response.ok) throw new Error('API请求失败');
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                this.$('#interpretation-text').textContent = result.candidates[0].content.parts[0].text;
                this.$('#interpretation-container').classList.remove('hidden');
            } else { 
                throw new Error("返回数据格式不正确"); 
            }
        } catch (error) {
            this.$('#interpretation-text').textContent = `朋友，${aiPoetName}的思绪似乎被云雾遮蔽，请稍后让我再试一次。`;
            this.$('#interpretation-container').classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `听${aiPoetName}为你解诗`;
        }
    }

    async handlePoetInterpretation() {
        const btn = this.$('#poet-interpret-button');
        
        try {
            // 获取当前诗歌标题（去掉书名号）
            const currentPoemTitle = this.$('#poem-title').textContent.replace(/[《》]/g, '');
            
            // 在诗歌原型数据中查找对应的解诗内容
            const poemArchetype = this.state.poemArchetypes.find(p => p.title === currentPoemTitle);
            
            if (poemArchetype && poemArchetype.poet_explanation) {
                // 更新作者署名
                this.$('#interpretation-author').textContent = '吴任几';
                // 显示解诗内容
                this.$('#interpretation-text').textContent = poemArchetype.poet_explanation;
                // 显示容器
                this.$('#interpretation-container').classList.remove('hidden');
            } else {
                // 没有找到解诗内容
                this.$('#interpretation-text').textContent = '恭喜你，虽然你不听劝，但诗人听劝，没给这首诗也提供官方解读';
                this.$('#interpretation-container').classList.remove('hidden');
            }
        } catch (error) {
            console.error('获取诗人解读失败:', error);
            this.$('#interpretation-text').textContent = '抱歉，获取诗人解读时出现了问题。';
            this.$('#interpretation-container').classList.remove('hidden');
        } finally {
            // 增加点击次数
            this.state.poetButtonClickCount++;
            this.state.poetButtonClicked = true;
            
            // 直接添加动画效果和状态更新
            btn.classList.add('text-change-animation');
            
            // 延迟更新文本（在动画中间点）
            setTimeout(() => {
                btn.innerHTML = this.getPoetButtonText(this.state.poetButtonClickCount);
            }, 200);
            
            // 动画结束后移除类
            setTimeout(() => {
                btn.classList.remove('text-change-animation');
            }, 400);
        }
    }

    async handleListen() {
        const aiPoetName = '陆家明';
        const btn = this.$('#listen-button');
        btn.disabled = true;
        btn.innerHTML = `朋友，稍等，${aiPoetName}正在酝酿... <div class="loader"></div>`;
        
        // 重置"最好不要点"按钮状态
        this.state.poetButtonClicked = false;
        this.state.poetButtonClickCount = 0;
        
        const textToRead = `${this.$('#poem-title').textContent}\n\n${this.$('#poem-body').textContent}`;
        try {
            const response = await fetch(`/api/listen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToRead })
            });
            if (!response.ok) throw new Error('API请求失败');
            const result = await response.json();
            if (result.audioContent) {
                const audioSrc = `data:audio/mp3;base64,${result.audioContent}`;
                this.$('#audio-player').src = audioSrc;
                this.$('#audio-player').play();
            } else { 
                throw new Error("未找到有效音频"); 
            }
        } catch (error) {
            alert(`朋友，${aiPoetName}的嗓音似乎被风吹散了。`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = `听${aiPoetName}为你读诗`;
        }
    }

    showScreen(screenName) {
        // 为当前显示的屏幕添加退出动画
        Object.values(this.screens).forEach(s => {
            if (!s.classList.contains('hidden')) {
                s.classList.add('page-exit');
                setTimeout(() => {
                    s.classList.add('hidden');
                    s.classList.remove('page-exit');
                }, 200);
            }
        });
        
        // 为新的屏幕添加进入动画
        setTimeout(() => {
            this.screens[screenName].classList.remove('hidden');
            this.screens[screenName].classList.add('page-enter');
            requestAnimationFrame(() => {
                this.screens[screenName].classList.add('page-enter-active');
                setTimeout(() => {
                    this.screens[screenName].classList.remove('page-enter', 'page-enter-active');
                }, 400);
            });
        }, 200);
    }

    hideLoadingMessage() {
        const loadingMessage = this.$('#loading-projects-message');
        if (loadingMessage) {
            loadingMessage.classList.add('hidden');
        }
    }

    showError(message) {
        const container = this.$('#main-project-list');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">🌙</div>
                    <div class="error-title">诗意之外，就是意外，土味在陆家花园是很受欢迎的</div>
                    <div class="error-message">${message}</div>
                    <button onclick="location.reload()" class="error-action">
                        重新开始旅程
                    </button>
                </div>
            `;
        }
    }

    showEmptyState() {
        const container = this.$('#main-project-list');
        if (container) {
            container.innerHTML = `
                <div class="empty-container">
                    <div class="empty-icon">📖</div>
                    <div class="empty-title">当前宇宙暂时安静</div>
                    <div class="empty-message">你可以先去其他宇宙逛逛</div>
                    <button onclick="location.reload()" class="error-action">
                        重新探索
                    </button>
                </div>
            `;
        }
    }

    bindEvents() {
        // 主项目列表点击事件
        this.$('#main-project-list').addEventListener('click', e => {
            const card = e.target.closest('.project-card');
            if (card) {
                const projectId = card.dataset.projectId;
                if (projectId) {
                    this.renderChapterSelection(projectId);
                }
            }
        });

        // 子项目列表点击事件
        this.$('#sub-project-list').addEventListener('click', e => {
            const card = e.target.closest('.project-card');
            if (card) {
                this.startQuiz(card.dataset.chapterName);
            }
        });
        
        // 返回按钮事件
        this.$('#back-to-main-selection-button').addEventListener('click', () => this.showScreen('main'));
        this.$('#back-to-sub-selection-button').addEventListener('click', () => {
            this.renderChapterSelection(this.state.currentMainProject.id);
        });
        this.$('#restart-button').addEventListener('click', () => {
            this.renderChapterSelection(this.state.currentMainProject.id);
        });
        
        // 问答按钮事件
        this.$('#option-a-button').addEventListener('click', () => this.handleAnswer('A'));
        this.$('#option-b-button').addEventListener('click', () => this.handleAnswer('B'));
        
        // 结果页面按钮事件
        this.$('#interpret-button').addEventListener('click', () => this.handleInterpretation());
        this.$('#listen-button').addEventListener('click', () => this.handleListen());
        this.$('#poet-interpret-button').addEventListener('click', () => this.handlePoetInterpretation());
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ZhouUniverse();
});
