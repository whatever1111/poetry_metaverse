import { B as withDirectives, D as ref, F as normalizeClass, H as toDisplayString, b as useRoute, c as useRouter, d as __plugin_vue_export_helper_default, g as vModelText, m as createBaseVNode, o as createCommentVNode, p as createElementBlock, r as createVNode, s as defineComponent, t as onMounted, v as openBlock } from "./index-B1xTxyf1.js";
import "./ArrowDownTrayIcon-WdJwsKtb.js";
import { b as PoemViewer_default } from "./PoemViewer-BLcdSmCy.js";
import { b as ErrorState_default } from "./ErrorState-DE6rNWWA.js";
import "./enhancedApi-9fV76Vys.js";
import { b as useZhouStore } from "./zhou-BIBg485p.js";

//#region /lujiaming_icon.png
var lujiaming_icon_default = "/lujiaming_icon.png";

//#endregion
//#region src/modules/zhou/services/gongBiApi.ts
var GongBiApiError = class extends Error {
	constructor(code, message, details) {
		super(message);
		this.name = "GongBiApiError";
		this.code = code;
		this.details = details;
	}
};
/**
* 调用共笔API，生成陆家明的回应诗歌
*/
async function createGongBi(request) {
	try {
		console.log("[gongBiApi] 发起共笔请求:", {
			chapterKey: request.chapterKey,
			pattern: request.answerPattern,
			poemTitle: request.poemTitle,
			feelingLength: request.userFeeling.length
		});
		const response = await fetch("/api/zhou/gongbi", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(request)
		});
		if (!response.ok) {
			let errorData = null;
			try {
				errorData = await response.json();
			} catch {
				throw new GongBiApiError("HTTP_ERROR", `HTTP ${response.status}: ${response.statusText}`);
			}
			if (errorData && errorData.error) throw new GongBiApiError(errorData.error.code, errorData.error.message, errorData.error.details);
			throw new GongBiApiError("UNKNOWN_ERROR", "请求失败，请稍后重试");
		}
		const data = await response.json();
		if (!data.success || !data.poem) throw new GongBiApiError("INVALID_RESPONSE", "服务器响应格式异常");
		console.log("[gongBiApi] 共笔请求成功:", {
			title: data.poem.title,
			tokens: data.metadata?.tokens || 0
		});
		return data.poem;
	} catch (error) {
		console.error("[gongBiApi] 共笔请求失败:", error);
		if (error instanceof GongBiApiError) throw error;
		if (error instanceof TypeError && error.message.includes("fetch")) throw new GongBiApiError("NETWORK_ERROR", "网络连接失败，请检查网络后重试");
		throw new GongBiApiError("UNKNOWN_ERROR", error instanceof Error ? error.message : "未知错误");
	}
}
function getGongBiErrorMessage(error) {
	if (error instanceof GongBiApiError) switch (error.code) {
		case "MISSING_PARAMS": return "参数缺失，请返回重新尝试";
		case "FEELING_TOO_LONG": return "感受文字过长，请控制在50字以内";
		case "USER_PROFILE_NOT_FOUND": return "未找到用户原型数据，请重新完成问答";
		case "POEM_NOT_FOUND": return "未找到诗歌数据，请返回重试";
		case "DIFY_API_KEY_MISSING": return "服务器配置错误，请联系管理员";
		case "DIFY_API_ERROR": return "AI诗人服务异常，请稍后重试";
		case "DIFY_API_TIMEOUT": return "AI诗人响应超时，请稍后重试";
		case "DIFY_RESPONSE_INVALID": return "AI诗人响应格式异常，请稍后重试";
		case "NETWORK_ERROR": return "网络连接失败，请检查网络后重试";
		case "HTTP_ERROR": return `服务器错误：${error.message}`;
		case "INVALID_RESPONSE": return "服务器响应格式异常，请稍后重试";
		case "INTERNAL_ERROR": return "服务器内部错误，请稍后重试";
		default: return error.message || "未知错误，请稍后重试";
	}
	if (error instanceof Error) return error.message;
	return "未知错误，请稍后重试";
}

//#endregion
//#region src/modules/zhou/views/GongBiView.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = {
	class: "min-h-screen",
	style: { "background-color": "var(--bg-primary)" }
};
const _hoisted_2 = { class: "container mx-auto px-4 py-8" };
const _hoisted_3 = { class: "max-w-3xl mx-auto" };
const _hoisted_4 = {
	key: 0,
	class: "space-y-6 animate-fadeInUp"
};
const _hoisted_5 = {
	key: 1,
	class: "animate-fadeInUp"
};
const _hoisted_6 = {
	key: 0,
	class: "source-poem-section"
};
const _hoisted_7 = { class: "flex justify-between items-center mb-4" };
const _hoisted_8 = {
	key: 0,
	class: "source-poem-viewer"
};
const _hoisted_9 = { class: "input-section" };
const _hoisted_10 = { class: "w-full" };
const _hoisted_11 = { class: "flex justify-end items-center mt-1 w-full" };
const _hoisted_12 = {
	key: 0,
	class: "limit-hint mr-2"
};
const _hoisted_13 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" };
const _hoisted_14 = ["disabled"];
const _hoisted_15 = {
	key: 2,
	class: "gongbi-loading animate-fadeInUp"
};
const _hoisted_16 = {
	key: 3,
	class: "space-y-6"
};
var GongBiView_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "GongBiView",
	setup(__props) {
		const router = useRouter();
		const route = useRoute();
		const zhouStore = useZhouStore();
		const userFeeling = ref("");
		const loading = ref(false);
		const error = ref(null);
		const showSourcePoem = ref(true);
		const sourcePoem = ref(null);
		const generatedPoem = ref(null);
		const urlParams = ref(null);
		onMounted(async () => {
			const chapterParam = route.query.chapter;
			const patternParam = route.query.pattern;
			const poemParam = route.query.poem;
			if (!chapterParam || !patternParam || !poemParam) {
				error.value = "缺少必要参数，请重新完成问答";
				setTimeout(() => router.replace("/zhou"), 2e3);
				return;
			}
			urlParams.value = {
				chapter: chapterParam,
				pattern: patternParam,
				poem: poemParam
			};
			try {
				await zhouStore.loadPoemByParams(chapterParam, patternParam, poemParam);
				const poem = zhouStore.result.selectedPoem;
				if (!poem || !poem.body) throw new Error("未能加载诗歌数据");
				const poemBody = typeof poem.body === "string" ? JSON.parse(poem.body) : poem.body;
				sourcePoem.value = {
					title: poemParam,
					quote: poemBody?.quote_text || null,
					quoteSource: poemBody?.quote_citation || null,
					content: poemBody?.main_text || (typeof poem.body === "string" ? poem.body : "")
				};
				console.log("[GongBiView] 原诗加载成功:", sourcePoem.value.title);
			} catch (err) {
				console.error("[GongBiView] 加载原诗失败:", err);
				error.value = "加载诗歌失败，请稍后重试";
				setTimeout(() => router.replace("/zhou"), 2e3);
			}
		});
		const handleSubmit = async () => {
			if (!userFeeling.value.trim() || !urlParams.value) return;
			loading.value = true;
			error.value = null;
			try {
				console.log("[GongBiView] 提交感受:", {
					feeling: userFeeling.value,
					params: urlParams.value
				});
				const poem = await createGongBi({
					chapterKey: urlParams.value.chapter,
					answerPattern: urlParams.value.pattern,
					poemTitle: urlParams.value.poem,
					userFeeling: userFeeling.value
				});
				generatedPoem.value = poem;
				console.log("[GongBiView] 诗歌生成成功:", poem.title);
			} catch (err) {
				console.error("[GongBiView] 生成诗歌失败:", err);
				error.value = getGongBiErrorMessage(err);
			} finally {
				loading.value = false;
			}
		};
		const resetAndRetry = () => {
			userFeeling.value = "";
			generatedPoem.value = null;
			error.value = null;
			showSourcePoem.value = true;
		};
		const goBack = () => {
			if (urlParams.value) {
				const params = new URLSearchParams({
					chapter: urlParams.value.chapter,
					pattern: urlParams.value.pattern,
					poem: urlParams.value.poem
				});
				router.push(`/result?${params.toString()}`);
			} else router.back();
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
				error.value && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_4, [createVNode(ErrorState_default, {
					"error-type": "unknown",
					"error-title": "出现了问题",
					"error-message": error.value,
					"show-retry": false,
					"show-back": true,
					"back-text": "返回",
					onBack: goBack,
					suggestions: ["请重新完成问答", "返回诗歌页面"]
				}, null, 8, ["error-message"])])) : createCommentVNode("", true),
				!loading.value && !generatedPoem.value && !error.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
					_cache[4] || (_cache[4] = createBaseVNode("div", { class: "text-center mb-8" }, [createBaseVNode("h1", {
						class: "text-4xl font-bold mb-4",
						style: { "color": "var(--text-primary)" }
					}, "共笔"), createBaseVNode("p", {
						class: "text-lg",
						style: { "color": "var(--text-secondary)" }
					}, "你起意，我落笔")], -1)),
					sourcePoem.value ? (openBlock(), createElementBlock("div", _hoisted_6, [createBaseVNode("div", _hoisted_7, [_cache[2] || (_cache[2] = createBaseVNode("h2", {
						class: "text-2xl font-bold",
						style: { "color": "var(--text-primary)" }
					}, "你读到的诗", -1)), createBaseVNode("button", {
						onClick: _cache[0] || (_cache[0] = ($event) => showSourcePoem.value = !showSourcePoem.value),
						class: "toggle-button"
					}, toDisplayString(showSourcePoem.value ? "折叠" : "展开"), 1)]), showSourcePoem.value ? (openBlock(), createElementBlock("div", _hoisted_8, [createVNode(PoemViewer_default, {
						"poem-title": sourcePoem.value.title,
						"quote-text": sourcePoem.value.quote,
						"quote-citation": sourcePoem.value.quoteSource,
						"main-text": sourcePoem.value.content,
						"animation-delay": "0.1s",
						"show-actions": false,
						"show-download": false
					}, null, 8, [
						"poem-title",
						"quote-text",
						"quote-citation",
						"main-text"
					])])) : createCommentVNode("", true)])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_9, [
						_cache[3] || (_cache[3] = createBaseVNode("h2", {
							class: "text-2xl font-bold mb-4",
							style: { "color": "var(--text-primary)" }
						}, "你的临时起意", -1)),
						createBaseVNode("div", _hoisted_10, [withDirectives(createBaseVNode("textarea", {
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => userFeeling.value = $event),
							maxlength: 50,
							rows: "4",
							class: normalizeClass(["feeling-input", { "feeling-input-limit": userFeeling.value.length >= 50 }]),
							placeholder: ""
						}, null, 2), [[vModelText, userFeeling.value]]), createBaseVNode("div", _hoisted_11, [userFeeling.value.length >= 50 ? (openBlock(), createElementBlock("span", _hoisted_12, " 念头不用太纷扰 ")) : createCommentVNode("", true), createBaseVNode("span", { class: normalizeClass(["char-count", { "char-count-limit": userFeeling.value.length >= 50 }]) }, toDisplayString(userFeeling.value.length) + " / 50 ", 3)])]),
						createBaseVNode("div", _hoisted_13, [createBaseVNode("button", {
							onClick: goBack,
							class: "btn-control-base btn-control-hover btn-control-disabled px-6 py-3 rounded-lg font-medium text-body",
							style: {
								"background-color": "var(--bg-secondary)",
								"color": "var(--text-secondary)"
							}
						}, " 取消 "), createBaseVNode("button", {
							onClick: handleSubmit,
							disabled: !userFeeling.value.trim(),
							class: "btn-control-base btn-control-hover btn-control-active btn-control-disabled btn-gongbi px-6 py-3 rounded-lg font-medium text-body"
						}, " 陆家明的闻言落笔 ", 8, _hoisted_14)])
					])
				])) : createCommentVNode("", true),
				loading.value ? (openBlock(), createElementBlock("div", _hoisted_15, _cache[5] || (_cache[5] = [createBaseVNode("div", { class: "loading-icon-wrapper" }, [createBaseVNode("img", {
					src: lujiaming_icon_default,
					alt: "陆家明",
					class: "loading-icon"
				})], -1), createBaseVNode("p", { class: "loading-text" }, "诗渐浓，君稍待", -1)]))) : createCommentVNode("", true),
				generatedPoem.value && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_16, [createVNode(PoemViewer_default, {
					"poem-title": generatedPoem.value.title,
					"quote-text": generatedPoem.value.quote,
					"quote-citation": generatedPoem.value.quoteSource,
					"main-text": generatedPoem.value.content,
					"animation-delay": "0.2s",
					"show-actions": true,
					"show-download": true,
					"show-ai-label": true
				}, null, 8, [
					"poem-title",
					"quote-text",
					"quote-citation",
					"main-text"
				]), createBaseVNode("div", {
					class: "grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeInUp",
					style: { "animation-delay": "0.2s" }
				}, [createBaseVNode("button", {
					onClick: resetAndRetry,
					class: "btn-control-base btn-control-hover px-6 py-3 rounded-lg font-medium text-body",
					style: {
						"background-color": "var(--bg-secondary)",
						"color": "var(--text-secondary)"
					}
				}, " 再写一首 "), createBaseVNode("button", {
					onClick: goBack,
					class: "btn-restart px-6 py-3 rounded-lg font-medium text-body"
				}, " 返回诗歌页 ")])])) : createCommentVNode("", true)
			])])]);
		};
	}
});

//#endregion
//#region src/modules/zhou/views/GongBiView.vue
var GongBiView_default = /* @__PURE__ */ __plugin_vue_export_helper_default(GongBiView_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a9110db5"]]);

//#endregion
export { GongBiView_default as default };