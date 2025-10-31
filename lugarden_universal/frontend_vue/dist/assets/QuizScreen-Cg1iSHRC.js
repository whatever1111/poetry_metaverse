import { D as ref, E as unref, G as normalizeStyle, H as toDisplayString, b as useRoute, c as useRouter, d as __plugin_vue_export_helper_default, j as Fragment, m as createBaseVNode, o as createCommentVNode, p as createElementBlock, q as createTextVNode, r as createVNode, s as defineComponent, t as onMounted, v as openBlock, w as renderList, z as watch } from "./index-B1xTxyf1.js";
import { b as LoadingSpinner_default } from "./LoadingSpinner-B-ZUe7SV.js";
import { b as render } from "./ArrowDownTrayIcon-WdJwsKtb.js";
import { b as ErrorState_default } from "./ErrorState-DE6rNWWA.js";
import { b as BackButton_default, c as EmptyState_default } from "./BackButton-_BnDcdOi.js";
import { b as ProgressBar_default } from "./ProgressBar-42JUQZi9.js";
import "./enhancedApi-9fV76Vys.js";
import { b as useZhouStore } from "./zhou-BIBg485p.js";

//#region src/modules/zhou/components/QuestionCard.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1$1 = { class: "max-w-4xl mx-auto" };
const _hoisted_2$1 = {
	class: "unified-content-card card-padding-normal content-spacing-normal rounded-base animate-fadeInUp",
	style: {
		"padding-top": "6rem",
		"padding-bottom": "2.5rem"
	}
};
const _hoisted_3$1 = {
	class: "flex flex-col gap-4 sm:gap-6 md:gap-8",
	style: { "margin-top": "5rem" }
};
const _hoisted_4$1 = ["onClick", "disabled"];
const _hoisted_5$1 = { class: "font-bold mr-2" };
var QuestionCard_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "QuestionCard",
	props: {
		question: {},
		questionIndex: {},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["answer"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const handleAnswer = (option) => {
			if (props.disabled) return;
			emit("answer", option);
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [(openBlock(), createElementBlock("div", {
				class: "text-heading-spaced text-center animate-textChange",
				key: _ctx.questionIndex
			}, toDisplayString(_ctx.question.question), 1)), createBaseVNode("div", _hoisted_3$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.question.options, (option, key) => {
				return openBlock(), createElementBlock("button", {
					key,
					class: "btn-option text-left justify-start whitespace-normal text-body px-6 py-4 max-sm:px-4 max-sm:py-3 animate-fadeInUp",
					style: normalizeStyle({ animationDelay: `${.3 + (key === "A" ? 0 : .1)}s` }),
					onClick: ($event) => handleAnswer(key),
					disabled: _ctx.disabled
				}, [createBaseVNode("span", _hoisted_5$1, toDisplayString(key) + ".", 1), createTextVNode(" " + toDisplayString(option), 1)], 12, _hoisted_4$1);
			}), 128))])])]);
		};
	}
});

//#endregion
//#region src/modules/zhou/components/QuestionCard.vue
var QuestionCard_default = /* @__PURE__ */ __plugin_vue_export_helper_default(QuestionCard_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-33a12d65"]]);

//#endregion
//#region src/modules/zhou/views/QuizScreen.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = {
	class: "min-h-screen",
	style: { "background-color": "var(--bg-primary)" }
};
const _hoisted_2 = { class: "container mx-auto px-4 py-8" };
const _hoisted_3 = { class: "mb-6" };
const _hoisted_4 = {
	key: 0,
	class: "restore-prompt mb-6 animate-fadeInUp"
};
const _hoisted_5 = { class: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4" };
const _hoisted_6 = { class: "flex items-start gap-3" };
const _hoisted_7 = { class: "text-blue-500" };
const _hoisted_8 = { class: "flex-1" };
const _hoisted_9 = { class: "text-sm text-blue-600 dark:text-blue-300 mb-3" };
const _hoisted_10 = {
	key: 1,
	class: "max-w-2xl mx-auto"
};
const _hoisted_11 = { class: "progress-indicator mt-8 mb-4 animate-fadeIn opacity-75" };
const _hoisted_12 = { key: 2 };
const _hoisted_13 = { key: 3 };
const _hoisted_14 = { key: 4 };
var QuizScreen_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "QuizScreen",
	setup(__props) {
		const router = useRouter();
		const route = useRoute();
		const zhouStore = useZhouStore();
		const showRestorePrompt = ref(false);
		const savedAnswersCount = ref(0);
		onMounted(async () => {
			if (!zhouStore.appState.initialized) await zhouStore.loadUniverseContent();
			const chapterParam = route.params.chapter;
			if (chapterParam && !zhouStore.navigation.currentChapterName) {
				const chapterName = decodeURIComponent(chapterParam);
				if (!zhouStore.navigation.currentMainProject) {
					const project = zhouStore.universeData.projects.find((p) => p.subProjects?.some((sp) => sp.name === chapterName));
					if (project) zhouStore.selectMainProject(project);
				}
				if (zhouStore.universeData.questions[chapterName]) {
					zhouStore.selectChapter(chapterName);
					checkForSavedState(chapterName);
				} else {
					router.replace("/");
					return;
				}
			} else if (zhouStore.navigation.currentChapterName) checkForSavedState(zhouStore.navigation.currentChapterName);
			if (!zhouStore.navigation.currentChapterName) router.replace("/project");
		});
		const checkForSavedState = (chapterName) => {
			try {
				const savedState = localStorage.getItem("zhou_quiz_state");
				if (savedState) {
					const state = JSON.parse(savedState);
					if (state.chapterName === chapterName && state.userAnswers && state.userAnswers.length > 0 && !state.isQuizComplete && Date.now() - state.savedAt < 1440 * 60 * 1e3) {
						savedAnswersCount.value = state.userAnswers.length;
						showRestorePrompt.value = true;
						console.log("发现可恢复的问答状态:", {
							chapter: chapterName,
							answersCount: savedAnswersCount.value,
							totalQuestions: state.totalQuestions
						});
					}
				}
			} catch (error) {
				console.warn("检查保存状态失败:", error);
			}
		};
		watch(() => zhouStore.quiz.isQuizComplete, (completed) => {
			if (completed) router.push("/classical-echo");
		});
		const handleAnswer = (selectedOption) => {
			zhouStore.answerQuestion(selectedOption);
		};
		const goBack = () => {
			zhouStore.goBack();
			if (zhouStore.navigation.currentMainProject) router.push(`/project/${zhouStore.navigation.currentMainProject.id}`);
			else router.push("/");
		};
		const retryLoad = async () => {
			zhouStore.clearError();
			await zhouStore.loadUniverseContent();
		};
		const restorePreviousProgress = () => {
			const restored = zhouStore.restoreQuizState();
			if (restored) {
				showRestorePrompt.value = false;
				console.log("已恢复之前的问答进度");
			} else {
				console.warn("恢复问答进度失败");
				startNewQuiz();
			}
		};
		const startNewQuiz = () => {
			zhouStore.clearSavedQuizState();
			zhouStore.resetQuiz();
			const chapterName = zhouStore.navigation.currentChapterName;
			if (chapterName && zhouStore.universeData.questions[chapterName]) {
				const questions = zhouStore.universeData.questions[chapterName];
				zhouStore.quiz.totalQuestions = questions.length;
				zhouStore.quiz.quizStartTime = Date.now();
			}
			showRestorePrompt.value = false;
			console.log("开始新的问答流程");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("div", _hoisted_3, [createVNode(BackButton_default, {
					text: "返回",
					variant: "default",
					size: "medium",
					"hover-animation": true,
					onClick: goBack
				})]),
				showRestorePrompt.value ? (openBlock(), createElementBlock("div", _hoisted_4, [createBaseVNode("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, [createBaseVNode("div", _hoisted_7, [createVNode(unref(render), {
					class: "w-5 h-5",
					"aria-hidden": "true"
				})]), createBaseVNode("div", _hoisted_8, [
					_cache[0] || (_cache[0] = createBaseVNode("h3", { class: "font-medium text-blue-800 dark:text-blue-200 mb-2" }, " 发现未完成的问答进度 ", -1)),
					createBaseVNode("p", _hoisted_9, " 您在此章节中已回答 " + toDisplayString(savedAnswersCount.value) + " / " + toDisplayString(unref(zhouStore).quiz.totalQuestions) + " 道题目，是否继续之前的进度？ ", 1),
					createBaseVNode("div", { class: "flex gap-2" }, [createBaseVNode("button", {
						onClick: restorePreviousProgress,
						class: "btn-primary-sm"
					}, " 继续上次进度 "), createBaseVNode("button", {
						onClick: startNewQuiz,
						class: "btn-secondary-sm"
					}, " 重新开始 ")])
				])])])])) : createCommentVNode("", true),
				unref(zhouStore).currentQuestion ? (openBlock(), createElementBlock("div", _hoisted_10, [createVNode(QuestionCard_default, {
					question: unref(zhouStore).currentQuestion,
					"question-index": unref(zhouStore).quiz.currentQuestionIndex,
					onAnswer: handleAnswer
				}, null, 8, ["question", "question-index"]), createBaseVNode("div", _hoisted_11, [createVNode(ProgressBar_default, {
					"model-value": unref(zhouStore).quizProgress,
					min: 0,
					max: 100,
					"show-label": false,
					"show-percentage": false,
					variant: "rounded",
					color: "primary",
					size: "medium",
					animated: true,
					smooth: true,
					"show-inner-text": true,
					"inner-text": `${Math.round(unref(zhouStore).quizProgress)}%`
				}, null, 8, ["model-value", "inner-text"])])])) : unref(zhouStore).universeData.loading ? (openBlock(), createElementBlock("div", _hoisted_12, [createVNode(LoadingSpinner_default, {
					size: "large",
					"loading-text": "正在加载问题...",
					subtitle: "请稍候，正在为您准备题目",
					"show-progress": false,
					centered: ""
				})])) : unref(zhouStore).universeData.error ? (openBlock(), createElementBlock("div", _hoisted_13, [createVNode(ErrorState_default, {
					"error-type": "network",
					"error-title": "加载失败",
					"error-message": unref(zhouStore).universeData.error,
					"show-retry": true,
					"show-back": true,
					"retry-text": "重新加载",
					"back-text": "返回上一页",
					onRetry: retryLoad,
					onBack: goBack
				}, null, 8, ["error-message"])])) : (openBlock(), createElementBlock("div", _hoisted_14, [createVNode(EmptyState_default, {
					icon: "❓",
					title: "没有找到问题",
					description: "当前章节没有可用的问题",
					"show-action": true,
					"action-text": "返回上一页",
					onAction: goBack
				})]))
			])]);
		};
	}
});

//#endregion
//#region src/modules/zhou/views/QuizScreen.vue
var QuizScreen_default = /* @__PURE__ */ __plugin_vue_export_helper_default(QuizScreen_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5234f69f"]]);

//#endregion
export { QuizScreen_default as default };