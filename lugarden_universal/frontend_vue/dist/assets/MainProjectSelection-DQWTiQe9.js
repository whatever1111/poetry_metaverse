import { E as unref, G as normalizeStyle, H as toDisplayString, c as useRouter, d as __plugin_vue_export_helper_default, j as Fragment, m as createBaseVNode, p as createElementBlock, r as createVNode, s as defineComponent, t as onMounted, v as openBlock, w as renderList } from "./index-B1xTxyf1.js";
import { b as LoadingSpinner_default } from "./LoadingSpinner-B-ZUe7SV.js";
import { b as ErrorState_default } from "./ErrorState-DE6rNWWA.js";
import { b as BackButton_default, c as EmptyState_default } from "./BackButton-_BnDcdOi.js";
import "./enhancedApi-9fV76Vys.js";
import { b as useZhouStore } from "./zhou-BIBg485p.js";

//#region src/modules/zhou/views/MainProjectSelection.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = {
	class: "min-h-screen",
	style: { "background-color": "var(--bg-primary)" }
};
const _hoisted_2 = { class: "container mx-auto px-4 py-8" };
const _hoisted_3 = { class: "mb-6" };
const _hoisted_4 = { key: 0 };
const _hoisted_5 = { key: 1 };
const _hoisted_6 = { key: 2 };
const _hoisted_7 = {
	key: 3,
	class: "grid grid-responsive"
};
const _hoisted_8 = ["onClick"];
const _hoisted_9 = { class: "flex-1" };
const _hoisted_10 = { class: "text-2xl font-bold mb-2 text-gray-800" };
const _hoisted_11 = { class: "text-base text-gray-600 mb-4 whitespace-pre-line leading-loose" };
const _hoisted_12 = { class: "flex justify-between items-center mt-4" };
const _hoisted_13 = { class: "text-xs text-gray-500 m-0" };
var MainProjectSelection_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "MainProjectSelection",
	setup(__props) {
		const router = useRouter();
		const zhouStore = useZhouStore();
		onMounted(async () => {
			zhouStore.detectMobileDevice();
			if (!zhouStore.appState.initialized || shouldRefreshData()) await zhouStore.loadUniverseContent();
		});
		function shouldRefreshData() {
			if (!zhouStore.universeData.lastFetchTime) return true;
			const CACHE_DURATION = 600 * 1e3;
			const now = Date.now();
			return now - zhouStore.universeData.lastFetchTime > CACHE_DURATION;
		}
		function selectProject(project) {
			zhouStore.selectMainProject(project);
			router.push(`/project/${project.id}`);
		}
		function goBack() {
			router.push("/");
		}
		async function retryLoad() {
			zhouStore.clearError();
			await zhouStore.loadUniverseContent();
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("div", _hoisted_3, [createVNode(BackButton_default, {
					text: "返回",
					variant: "default",
					size: "medium",
					"hover-animation": true,
					onClick: goBack
				})]),
				_cache[1] || (_cache[1] = createBaseVNode("h1", { class: "text-3xl font-bold text-center mb-8 text-gray-800" }, " 周与春秋 ", -1)),
				_cache[2] || (_cache[2] = createBaseVNode("div", { class: "text-center mb-8" }, [createBaseVNode("p", { class: "text-gray-600" }, "请选择一个项目开始您的诗歌之旅")], -1)),
				unref(zhouStore).universeData.loading ? (openBlock(), createElementBlock("div", _hoisted_4, [createVNode(LoadingSpinner_default, {
					size: "large",
					"loading-text": unref(zhouStore).ui.loadingMessage || "正在加载项目...",
					subtitle: "为您准备诗歌之旅",
					variant: "default",
					"show-progress": false,
					centered: ""
				}, null, 8, ["loading-text"])])) : unref(zhouStore).universeData.error ? (openBlock(), createElementBlock("div", _hoisted_5, [createVNode(ErrorState_default, {
					"error-type": "network",
					"error-title": "加载失败",
					"error-message": unref(zhouStore).universeData.error,
					"show-retry": true,
					"show-back": false,
					"retry-text": "重试",
					onRetry: retryLoad,
					suggestions: [
						"请检查网络连接",
						"刷新页面重试",
						"联系技术支持"
					]
				}, null, 8, ["error-message"])])) : unref(zhouStore).universeData.projects.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_6, [createVNode(EmptyState_default, {
					icon: "📚",
					title: "暂无项目",
					description: "当前没有可用的项目，请稍后再试",
					size: "large",
					variant: "default"
				})])) : (openBlock(), createElementBlock("div", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(zhouStore).universeData.projects, (project, index) => {
					return openBlock(), createElementBlock("div", {
						key: project.id,
						class: "unified-content-card rounded-base animate-fadeInUp flex flex-col h-full",
						style: normalizeStyle({ animationDelay: `${.1 * index}s` }),
						onClick: ($event) => selectProject(project)
					}, [createBaseVNode("div", _hoisted_9, [createBaseVNode("h2", _hoisted_10, toDisplayString(project.name), 1), createBaseVNode("div", _hoisted_11, toDisplayString(project.description), 1)]), createBaseVNode("div", _hoisted_12, [createBaseVNode("p", _hoisted_13, "作者: " + toDisplayString(project.poet || "未指定"), 1), _cache[0] || (_cache[0] = createBaseVNode("button", { class: "btn-primary" }, " 进入 ", -1))])], 12, _hoisted_8);
				}), 128))]))
			])]);
		};
	}
});

//#endregion
//#region src/modules/zhou/views/MainProjectSelection.vue
var MainProjectSelection_default = /* @__PURE__ */ __plugin_vue_export_helper_default(MainProjectSelection_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9be9f14d"]]);

//#endregion
export { MainProjectSelection_default as default };