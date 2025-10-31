import { E as unref, G as normalizeStyle, H as toDisplayString, b as useRoute, c as useRouter, j as Fragment, m as createBaseVNode, o as createCommentVNode, p as createElementBlock, r as createVNode, s as defineComponent, t as onMounted, v as openBlock, w as renderList, z as watch } from "./index-B1xTxyf1.js";
import { b as LoadingSpinner_default } from "./LoadingSpinner-B-ZUe7SV.js";
import { b as BackButton_default, c as EmptyState_default, d as render } from "./BackButton-_BnDcdOi.js";
import "./enhancedApi-9fV76Vys.js";
import { b as useZhouStore } from "./zhou-BIBg485p.js";

//#region src/modules/zhou/views/SubProjectSelection.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = {
	class: "min-h-screen",
	style: { "background-color": "var(--bg-primary)" }
};
const _hoisted_2 = { class: "container mx-auto px-4 py-8" };
const _hoisted_3 = { class: "mb-6" };
const _hoisted_4 = {
	key: 0,
	class: "text-center mb-8"
};
const _hoisted_5 = { class: "content-title animate-fadeInDown" };
const _hoisted_6 = {
	class: "content-subtitle animate-fadeIn",
	style: { "animation-delay": "0.2s" }
};
const _hoisted_7 = { class: "text-gray-500 mb-8" };
const _hoisted_8 = {
	key: 1,
	class: "grid grid-responsive"
};
const _hoisted_9 = ["onClick"];
const _hoisted_10 = { class: "flex-1" };
const _hoisted_11 = { class: "text-2xl font-bold mb-4 text-gray-800" };
const _hoisted_12 = { class: "text-base text-gray-600 mb-4 whitespace-pre-line leading-loose" };
const _hoisted_13 = { key: 2 };
const _hoisted_14 = { key: 3 };
var SubProjectSelection_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "SubProjectSelection",
	setup(__props) {
		const router = useRouter();
		const route = useRoute();
		const zhouStore = useZhouStore();
		onMounted(async () => {
			if (!zhouStore.navigation.currentMainProject && route.params.projectId) {
				if (!zhouStore.appState.initialized) await zhouStore.loadUniverseContent();
				const projectId = route.params.projectId;
				const project = zhouStore.universeData.projects.find((p) => p.id === projectId);
				if (project) zhouStore.selectMainProject(project);
				else {
					router.replace("/");
					return;
				}
			}
			if (!zhouStore.navigation.currentMainProject) router.replace("/");
		});
		watch(() => zhouStore.navigation.currentMainProject, (newProject) => {
			if (!newProject) router.replace("/");
		});
		const goBack = () => {
			router.push("/zhou");
		};
		const selectChapter = (chapterName) => {
			zhouStore.selectChapter(chapterName);
			router.push(`/quiz/${encodeURIComponent(chapterName)}`);
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
				unref(zhouStore).navigation.currentMainProject ? (openBlock(), createElementBlock("div", _hoisted_4, [
					createBaseVNode("h1", _hoisted_5, toDisplayString(unref(zhouStore).navigation.currentMainProject.name), 1),
					createBaseVNode("div", _hoisted_6, toDisplayString(unref(zhouStore).navigation.currentMainProject.description), 1),
					createBaseVNode("p", _hoisted_7, " 作者: " + toDisplayString(unref(zhouStore).navigation.currentMainProject.poet || "未指定"), 1)
				])) : createCommentVNode("", true),
				unref(zhouStore).navigation.currentMainProject?.subProjects ? (openBlock(), createElementBlock("div", _hoisted_8, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(zhouStore).navigation.currentMainProject.subProjects, (subProject, index) => {
					return openBlock(), createElementBlock("div", {
						key: `${subProject.name}-${index}`,
						class: "unified-content-card rounded-base animate-fadeInUp cursor-pointer flex flex-col h-full",
						style: normalizeStyle({ animationDelay: `${.3 + .1 * index}s` }),
						onClick: ($event) => selectChapter(subProject.name)
					}, [createBaseVNode("div", _hoisted_10, [createBaseVNode("h2", _hoisted_11, toDisplayString(subProject.name), 1), createBaseVNode("div", _hoisted_12, toDisplayString(subProject.description), 1)]), _cache[0] || (_cache[0] = createBaseVNode("div", { class: "flex justify-end mt-4" }, [createBaseVNode("button", { class: "btn-primary" }, " 开始问答 ")], -1))], 12, _hoisted_9);
				}), 128))])) : !unref(zhouStore).universeData.loading ? (openBlock(), createElementBlock("div", _hoisted_13, [createVNode(EmptyState_default, {
					"icon-component": unref(render),
					title: "暂无子项目",
					description: "当前项目没有可用的子项目",
					size: "medium",
					variant: "default"
				}, null, 8, ["icon-component"])])) : (openBlock(), createElementBlock("div", _hoisted_14, [createVNode(LoadingSpinner_default, {
					size: "large",
					"loading-text": "正在加载项目信息...",
					subtitle: "请稍候，正在为您准备内容",
					variant: "default",
					centered: ""
				})]))
			])]);
		};
	}
});

//#endregion
export { SubProjectSelection_vue_vue_type_script_setup_true_lang_default as default };