import { C as reactive, e as defineStore, l as computed } from "./index-B1xTxyf1.js";
import { b as getApiServices, c as getUserFriendlyErrorMessage, d as isApiError } from "./enhancedApi-9fV76Vys.js";

//#region src/modules/zhou/stores/zhou.ts
const useZhouStore = defineStore("zhou", () => {
	let apiServices = null;
	const initializeApiServices = () => {
		if (!apiServices) apiServices = getApiServices({
			onLoadingChange: (loading) => {
				ui.showLoadingScreen = loading;
			},
			onError: (error) => {
				console.error("API错误:", error);
				ui.errorMessage = getUserFriendlyErrorMessage(error);
			},
			enableLogging: true,
			enableCaching: true,
			cacheDuration: 300 * 1e3
		});
		return apiServices;
	};
	const universeData = reactive({
		projects: [],
		poems: {},
		questions: {},
		mappings: {
			defaultUnit: "",
			units: {}
		},
		poemArchetypes: [],
		loading: false,
		error: null,
		lastFetchTime: null
	});
	const appState = reactive({
		initialized: false,
		currentStep: 1,
		previousStep: 0,
		isTransitioning: false,
		theme: "light"
	});
	const navigation = reactive({
		currentMainProject: null,
		currentChapterName: null,
		canGoBack: false,
		navigationHistory: ["/"]
	});
	const quiz = reactive({
		currentQuestionIndex: 0,
		totalQuestions: 0,
		userAnswers: [],
		userAnswerMeanings: [],
		isQuizComplete: false,
		quizStartTime: null,
		quizEndTime: null
	});
	const result = reactive({
		selectedPoem: null,
		poemTitle: null,
		interpretationContent: null,
		interpretationLoading: false,
		poetExplanation: null,
		poetButtonClicked: false,
		poetButtonClickCount: 0
	});
	const ui = reactive({
		showLoadingScreen: false,
		animationsEnabled: true,
		loadingMessage: "正在加载...",
		errorMessage: null,
		modalVisible: false,
		modalContent: null,
		isMobileDevice: false
	});
	const currentChapterQuestions = computed(() => {
		if (!navigation.currentChapterName || !universeData.questions) return [];
		return universeData.questions[navigation.currentChapterName] || [];
	});
	const currentQuestion = computed(() => {
		const questions = currentChapterQuestions.value;
		if (questions.length === 0 || quiz.currentQuestionIndex >= questions.length) return null;
		return questions[quiz.currentQuestionIndex];
	});
	const quizProgress = computed(() => {
		if (quiz.totalQuestions === 0) return 0;
		return quiz.userAnswers.length / quiz.totalQuestions * 100;
	});
	const canProceedToNext = computed(() => {
		switch (appState.currentStep) {
			case 1: return navigation.currentMainProject !== null;
			case 2: return navigation.currentChapterName !== null;
			case 3: return quiz.isQuizComplete;
			case 4: return true;
			case 5: return true;
			default: return false;
		}
	});
	const isAppReady = computed(() => {
		return appState.initialized && !universeData.loading && universeData.error === null && universeData.projects.length > 0;
	});
	async function loadUniverseContent(refresh = false) {
		if (universeData.loading) return;
		try {
			universeData.loading = true;
			universeData.error = null;
			ui.loadingMessage = "正在加载宇宙内容...";
			const api = initializeApiServices();
			const universeService = api.getUniverseService();
			const data = await universeService.getUniverseContent("universe_zhou_spring_autumn", refresh);
			universeData.projects = data.content.projects || [];
			universeData.questions = data.content.questions || {};
			universeData.mappings = data.content.mappings || {
				defaultUnit: "",
				units: {}
			};
			universeData.poems = data.content.poems || {};
			universeData.poemArchetypes = data.content.poemArchetypes?.poems || [];
			universeData.lastFetchTime = Date.now();
			appState.initialized = true;
			console.log("宇宙内容加载成功:", {
				projects: universeData.projects.length,
				questionsChapters: Object.keys(universeData.questions).length,
				poems: Object.keys(universeData.poems).length
			});
		} catch (error) {
			console.error("加载宇宙内容失败:", error);
			if (isApiError(error)) {
				universeData.error = error.message;
				ui.errorMessage = getUserFriendlyErrorMessage(error);
			} else {
				universeData.error = error instanceof Error ? error.message : "未知错误";
				ui.errorMessage = "加载数据失败，请稍后重试";
			}
		} finally {
			universeData.loading = false;
			ui.showLoadingScreen = false;
		}
	}
	function selectMainProject(project) {
		navigation.currentMainProject = project;
		navigation.canGoBack = true;
		appState.currentStep = 2;
		navigation.navigationHistory.push(`/project/${project.id}`);
		console.log("选择主项目:", project.name);
	}
	function selectChapter(chapterName) {
		navigation.currentChapterName = chapterName;
		const questions = universeData.questions[chapterName] || [];
		quiz.totalQuestions = questions.length;
		quiz.currentQuestionIndex = 0;
		quiz.userAnswers = [];
		quiz.userAnswerMeanings = [];
		quiz.isQuizComplete = false;
		quiz.quizStartTime = Date.now();
		const restored = restoreQuizState();
		if (restored) console.log("已恢复之前的问答进度");
		else console.log("开始新的问答流程");
		appState.currentStep = 3;
		navigation.navigationHistory.push(`/quiz/${chapterName}`);
		console.log("选择章节:", chapterName, "问题数量:", quiz.totalQuestions);
	}
	function goBack() {
		if (navigation.navigationHistory.length > 1) {
			navigation.navigationHistory.pop();
			const previousPath = navigation.navigationHistory[navigation.navigationHistory.length - 1];
			if (previousPath === "/") {
				appState.currentStep = 1;
				navigation.currentMainProject = null;
				navigation.currentChapterName = null;
			} else if (previousPath.startsWith("/project/")) {
				appState.currentStep = 2;
				navigation.currentChapterName = null;
				resetQuiz();
			}
		}
		navigation.canGoBack = navigation.navigationHistory.length > 1;
	}
	function saveQuizState() {
		if (!navigation.currentChapterName) return;
		const quizState = {
			chapterName: navigation.currentChapterName,
			currentQuestionIndex: quiz.currentQuestionIndex,
			totalQuestions: quiz.totalQuestions,
			userAnswers: quiz.userAnswers,
			userAnswerMeanings: quiz.userAnswerMeanings,
			isQuizComplete: quiz.isQuizComplete,
			quizStartTime: quiz.quizStartTime,
			savedAt: Date.now()
		};
		try {
			localStorage.setItem("zhou_quiz_state", JSON.stringify(quizState));
			console.log("问答状态已保存:", quizState);
		} catch (error) {
			console.warn("保存问答状态失败:", error);
		}
	}
	function restoreQuizState() {
		try {
			const savedState = localStorage.getItem("zhou_quiz_state");
			if (!savedState) return false;
			const state = JSON.parse(savedState);
			const isExpired = Date.now() - state.savedAt > 1440 * 60 * 1e3;
			if (isExpired) {
				localStorage.removeItem("zhou_quiz_state");
				return false;
			}
			if (state.chapterName !== navigation.currentChapterName) return false;
			quiz.currentQuestionIndex = state.currentQuestionIndex;
			quiz.totalQuestions = state.totalQuestions;
			quiz.userAnswers = state.userAnswers || [];
			quiz.userAnswerMeanings = state.userAnswerMeanings || [];
			quiz.isQuizComplete = state.isQuizComplete || false;
			quiz.quizStartTime = state.quizStartTime;
			console.log("问答状态已恢复:", {
				chapterName: state.chapterName,
				currentIndex: quiz.currentQuestionIndex,
				answersCount: quiz.userAnswers.length
			});
			return true;
		} catch (error) {
			console.warn("恢复问答状态失败:", error);
			localStorage.removeItem("zhou_quiz_state");
			return false;
		}
	}
	function clearSavedQuizState() {
		try {
			localStorage.removeItem("zhou_quiz_state");
			console.log("已清除保存的问答状态");
		} catch (error) {
			console.warn("清除问答状态失败:", error);
		}
	}
	function answerQuestion(selectedOption) {
		const question = currentQuestion.value;
		if (!question) return;
		const answer = {
			questionIndex: quiz.currentQuestionIndex,
			selectedOption,
			questionText: question.question,
			selectedText: question.options[selectedOption]
		};
		quiz.userAnswers.push(answer);
		const meaning = question.meaning[selectedOption];
		if (meaning) quiz.userAnswerMeanings.push(meaning);
		console.log("回答问题:", {
			index: quiz.currentQuestionIndex,
			option: selectedOption,
			text: answer.selectedText
		});
		saveQuizState();
		proceedToNextQuestion();
	}
	function proceedToNextQuestion() {
		const questions = currentChapterQuestions.value;
		if (quiz.currentQuestionIndex < questions.length - 1) quiz.currentQuestionIndex++;
		else completeQuiz();
	}
	function completeQuiz() {
		quiz.isQuizComplete = true;
		quiz.quizEndTime = Date.now();
		calculatePoemMapping();
		clearSavedQuizState();
		appState.currentStep = 4;
		navigation.navigationHistory.push("/classical-echo");
		console.log("问答完成，用户答案:", quiz.userAnswers.map((a) => a.selectedOption).join(""));
	}
	function resetQuiz() {
		quiz.currentQuestionIndex = 0;
		quiz.userAnswers = [];
		quiz.userAnswerMeanings = [];
		quiz.isQuizComplete = false;
		quiz.quizStartTime = null;
		quiz.quizEndTime = null;
		clearSavedQuizState();
	}
	function calculatePoemMapping() {
		if (!navigation.currentChapterName || quiz.userAnswers.length === 0) {
			console.error("无法计算诗歌映射：缺少必要数据");
			return;
		}
		const combination = quiz.userAnswers.map((answer) => answer.selectedOption === "A" ? "0" : "1").join("");
		const chapterMappings = universeData.mappings.units[navigation.currentChapterName];
		if (chapterMappings && chapterMappings[combination]) {
			const mapping = chapterMappings[combination];
			result.poemTitle = mapping.poemTitle;
			const poemContent = universeData.poems[mapping.poemTitle];
			if (poemContent) result.selectedPoem = {
				title: mapping.poemTitle,
				body: poemContent
			};
			console.log("诗歌映射计算完成:", {
				combination,
				poemTitle: result.poemTitle
			});
		} else console.error("未找到匹配的诗歌映射:", {
			combination,
			chapterName: navigation.currentChapterName
		});
	}
	async function loadPoemByParams(chapterName, answerPattern, poemTitle) {
		try {
			if (!appState.initialized || universeData.projects.length === 0) {
				console.log("[loadPoemByParams] 宇宙数据未加载，先加载数据");
				await loadUniverseContent();
			}
			if (!chapterName || !answerPattern || !poemTitle) throw new Error("URL参数不完整");
			navigation.currentChapterName = chapterName;
			const chapterMappings = universeData.mappings.units[chapterName];
			if (!chapterMappings || !chapterMappings[answerPattern]) throw new Error(`未找到匹配的诗歌映射: chapter=${chapterName}, pattern=${answerPattern}`);
			const poemContent = universeData.poems[poemTitle];
			if (!poemContent) throw new Error(`未找到诗歌内容: ${poemTitle}`);
			result.poemTitle = poemTitle;
			result.selectedPoem = {
				title: poemTitle,
				body: poemContent
			};
			console.log("[loadPoemByParams] 诗歌加载成功:", {
				chapterName,
				answerPattern,
				poemTitle
			});
		} catch (error) {
			console.error("[loadPoemByParams] 加载失败:", error);
			throw error;
		}
	}
	function reconstructQuizFromPattern(chapterName, answerPattern) {
		try {
			const questions = universeData.questions[chapterName];
			if (!questions || questions.length === 0) {
				console.warn("[reconstructQuizFromPattern] 未找到问题列表:", chapterName);
				return;
			}
			if (answerPattern.length !== questions.length) {
				console.warn("[reconstructQuizFromPattern] Pattern长度与问题数量不匹配:", {
					patternLength: answerPattern.length,
					questionsCount: questions.length
				});
				return;
			}
			quiz.userAnswers = answerPattern.split("").map((char, index) => {
				const selectedOption = char === "0" ? "A" : "B";
				const question = questions[index];
				return {
					questionIndex: index,
					selectedOption,
					questionText: question.question,
					selectedText: question.options[selectedOption]
				};
			});
			quiz.totalQuestions = questions.length;
			quiz.currentQuestionIndex = questions.length - 1;
			quiz.isQuizComplete = true;
			console.log("[reconstructQuizFromPattern] 问答状态重构完成:", {
				chapterName,
				answerPattern,
				answersCount: quiz.userAnswers.length
			});
		} catch (error) {
			console.error("[reconstructQuizFromPattern] 重构失败:", error);
		}
	}
	function showResult() {
		appState.currentStep = 5;
		navigation.navigationHistory.push("/result");
	}
	function buildFullPoemContent(poem) {
		if (!poem || !poem.body) return "";
		if (typeof poem.body === "string") return poem.body;
		if (typeof poem.body === "object" && poem.body !== null) {
			const parts = [];
			if (poem.body.quote_text) parts.push(poem.body.quote_text);
			if (poem.body.quote_citation) parts.push(`——${poem.body.quote_citation}`);
			if (poem.body.main_text) parts.push(poem.body.main_text);
			return parts.join("\n\n");
		}
		return "";
	}
	async function getInterpretation() {
		if (!result.selectedPoem) return;
		try {
			result.interpretationLoading = true;
			const api = initializeApiServices();
			const aiService = api.getAIService();
			const poemContent = buildFullPoemContent(result.selectedPoem);
			const combination = quiz.userAnswers.map((answer) => answer.selectedOption === "A" ? "0" : "1").join("");
			const data = await aiService.interpretPoem(poemContent, result.selectedPoem.title, combination, navigation.currentChapterName || "");
			result.interpretationContent = data.interpretation;
			console.log("解诗获取成功:", {
				title: data.poem_title,
				processed_at: data.processed_at
			});
		} catch (error) {
			console.error("获取解诗失败:", error);
			if (isApiError(error)) ui.errorMessage = getUserFriendlyErrorMessage(error);
			else ui.errorMessage = "获取解诗失败，请稍后重试";
		} finally {
			result.interpretationLoading = false;
		}
	}
	function showPoetExplanation() {
		if (!result.selectedPoem) return;
		result.poetButtonClickCount++;
		result.poetButtonClicked = true;
		const archetype = universeData.poemArchetypes.find((p) => p.title === result.selectedPoem?.title);
		if (archetype && archetype.poet_explanation) result.poetExplanation = archetype.poet_explanation;
		else result.poetExplanation = "恭喜你，虽然你不听劝，但诗人听劝，没给这首诗也提供官方解读";
	}
	function getPoetButtonText() {
		const count = result.poetButtonClickCount;
		switch (count) {
			case 0: return "最好不要点";
			case 1: return "哎，还是点了……";
			case 2: return "点都点了，看吧";
			case 3: return "别点了，别点了";
			default: return "点吧，点吧……";
		}
	}
	function showLoading(message = "正在加载...") {
		ui.showLoadingScreen = true;
		ui.loadingMessage = message;
	}
	function hideLoading() {
		ui.showLoadingScreen = false;
	}
	function showError(message) {
		ui.errorMessage = message;
	}
	function clearError() {
		ui.errorMessage = null;
	}
	function resetApp() {
		navigation.currentMainProject = null;
		navigation.currentChapterName = null;
		navigation.canGoBack = false;
		navigation.navigationHistory = ["/"];
		resetQuiz();
		result.selectedPoem = null;
		result.poemTitle = null;
		result.interpretationContent = null;
		result.poetExplanation = null;
		result.poetButtonClicked = false;
		result.poetButtonClickCount = 0;
		appState.currentStep = 1;
		appState.previousStep = 0;
		appState.isTransitioning = false;
		clearError();
		hideLoading();
	}
	function detectMobileDevice() {
		ui.isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
	return {
		universeData,
		appState,
		navigation,
		quiz,
		result,
		ui,
		currentChapterQuestions,
		currentQuestion,
		quizProgress,
		canProceedToNext,
		isAppReady,
		loadUniverseContent,
		selectMainProject,
		selectChapter,
		goBack,
		answerQuestion,
		proceedToNextQuestion,
		completeQuiz,
		resetQuiz,
		saveQuizState,
		restoreQuizState,
		clearSavedQuizState,
		calculatePoemMapping,
		loadPoemByParams,
		reconstructQuizFromPattern,
		showResult,
		getInterpretation,
		showPoetExplanation,
		getPoetButtonText,
		showLoading,
		hideLoading,
		showError,
		clearError,
		resetApp,
		detectMobileDevice
	};
});

//#endregion
export { useZhouStore as b };