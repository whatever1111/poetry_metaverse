import { B as withDirectives, D as ref, F as normalizeClass, H as toDisplayString, d as __plugin_vue_export_helper_default, h as vShow, j as Fragment, l as computed, m as createBaseVNode, n as createBlock, o as createCommentVNode, p as createElementBlock, q as createTextVNode, s as defineComponent, v as openBlock, w as renderList, x as renderSlot, y as resolveDynamicComponent } from "./index-B1xTxyf1.js";

//#region node_modules/@heroicons/vue/24/outline/esm/ExclamationTriangleIcon.js
function render(_ctx, _cache) {
	return openBlock(), createElementBlock("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		fill: "none",
		viewBox: "0 0 24 24",
		"stroke-width": "1.5",
		stroke: "currentColor",
		"aria-hidden": "true",
		"data-slot": "icon"
	}, [createBaseVNode("path", {
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
	})]);
}

//#endregion
//#region node_modules/@heroicons/vue/24/outline/esm/MagnifyingGlassIcon.js
function render$1(_ctx, _cache) {
	return openBlock(), createElementBlock("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		fill: "none",
		viewBox: "0 0 24 24",
		"stroke-width": "1.5",
		stroke: "currentColor",
		"aria-hidden": "true",
		"data-slot": "icon"
	}, [createBaseVNode("path", {
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
	})]);
}

//#endregion
//#region src/shared/components/ErrorState.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = { class: "error-content animate-fadeIn max-w-lg w-full card-padding-normal content-spacing-normal rounded-lg" };
const _hoisted_2 = { class: "mb-lg" };
const _hoisted_3 = {
	key: 0,
	class: "text-5xl mb-base opacity-80"
};
const _hoisted_4 = { class: "text-heading-spaced text-amber-800" };
const _hoisted_5 = {
	key: 0,
	class: "text-body-spaced text-amber-700"
};
const _hoisted_6 = {
	key: 1,
	class: "mb-lg text-left"
};
const _hoisted_7 = { class: "mt-base bg-white/50 border border-amber-300/30 p-base rounded-base" };
const _hoisted_8 = { class: "text-label text-amber-700 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto m-0 font-mono" };
const _hoisted_9 = {
	key: 2,
	class: "error-actions"
};
const _hoisted_10 = ["disabled"];
const _hoisted_11 = {
	key: 0,
	class: "animate-spin -ml-1 mr-2 h-4 w-4",
	fill: "none",
	viewBox: "0 0 24 24"
};
const _hoisted_12 = {
	key: 3,
	class: "text-left mb-base"
};
const _hoisted_13 = { class: "list-none p-0 m-0" };
const _hoisted_14 = {
	key: 4,
	class: "mt-base"
};
var ErrorState_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "ErrorState",
	props: {
		errorType: { default: "unknown" },
		errorCode: { default: "" },
		errorTitle: { default: "出现了问题" },
		errorMessage: { default: "请稍后重试或联系技术支持" },
		errorDetails: { default: "" },
		showDetails: {
			type: Boolean,
			default: false
		},
		showActions: {
			type: Boolean,
			default: true
		},
		showRetry: {
			type: Boolean,
			default: true
		},
		showBack: {
			type: Boolean,
			default: true
		},
		showReport: {
			type: Boolean,
			default: false
		},
		retryText: { default: "重试" },
		retryingText: { default: "重试中..." },
		backText: { default: "返回" },
		reportText: { default: "报告问题" },
		retrying: {
			type: Boolean,
			default: false
		},
		suggestions: { default: () => [] },
		size: { default: "medium" },
		centered: {
			type: Boolean,
			default: true
		}
	},
	emits: [
		"retry",
		"back",
		"report"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const detailsVisible = ref(false);
		const containerClass = computed(() => ({
			[`error-${props.size}`]: true,
			[`error-${props.errorType}`]: true,
			"error-centered": props.centered
		}));
		const errorIconComponent = computed(() => {
			switch (props.errorType) {
				case "network": return render;
				case "server": return render;
				case "client": return render;
				case "permission": return render;
				case "notfound": return render$1;
				default: return render;
			}
		});
		const toggleDetails = () => {
			detailsVisible.value = !detailsVisible.value;
		};
		const handleRetry = () => {
			if (!props.retrying) emit("retry");
		};
		const handleBack = () => {
			emit("back");
		};
		const handleReport = () => {
			emit("report");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["error-state flex items-center justify-center text-center", containerClass.value]) }, [createBaseVNode("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [!_ctx.$slots.icon ? (openBlock(), createElementBlock("div", _hoisted_3, [(openBlock(), createBlock(resolveDynamicComponent(errorIconComponent.value), {
					class: "w-6 h-6 mx-auto",
					"aria-hidden": "true"
				}))])) : createCommentVNode("", true), renderSlot(_ctx.$slots, "icon", {}, void 0, true)]),
				createBaseVNode("h3", _hoisted_4, toDisplayString(_ctx.errorTitle), 1),
				_ctx.errorMessage ? (openBlock(), createElementBlock("p", _hoisted_5, toDisplayString(_ctx.errorMessage), 1)) : createCommentVNode("", true),
				_ctx.errorDetails && _ctx.showDetails ? (openBlock(), createElementBlock("div", _hoisted_6, [createBaseVNode("button", {
					onClick: toggleDetails,
					class: "flex items-center justify-center bg-transparent border-0 text-amber-800 text-caption cursor-pointer px-xs py-0 transition-colors duration-200 hover:text-amber-900"
				}, [createBaseVNode("span", null, toDisplayString(detailsVisible.value ? "隐藏详情" : "显示详情"), 1), (openBlock(), createElementBlock("svg", {
					class: normalizeClass(["w-4 h-4 ml-1 transition-transform duration-200", { "rotate-180": detailsVisible.value }]),
					fill: "none",
					stroke: "currentColor",
					viewBox: "0 0 24 24"
				}, _cache[0] || (_cache[0] = [createBaseVNode("path", {
					"stroke-linecap": "round",
					"stroke-linejoin": "round",
					"stroke-width": "2",
					d: "M19 9l-7 7-7-7"
				}, null, -1)]), 2))]), withDirectives(createBaseVNode("div", _hoisted_7, [createBaseVNode("pre", _hoisted_8, toDisplayString(_ctx.errorDetails), 1)], 512), [[vShow, detailsVisible.value]])])) : createCommentVNode("", true),
				_ctx.showActions || _ctx.$slots.actions ? (openBlock(), createElementBlock("div", _hoisted_9, [renderSlot(_ctx.$slots, "actions", {}, () => [
					_ctx.showRetry ? (openBlock(), createElementBlock("button", {
						key: 0,
						onClick: handleRetry,
						class: "btn-retry-warning",
						disabled: _ctx.retrying
					}, [_ctx.retrying ? (openBlock(), createElementBlock("svg", _hoisted_11, _cache[1] || (_cache[1] = [createBaseVNode("circle", {
						class: "opacity-25",
						cx: "12",
						cy: "12",
						r: "10",
						stroke: "currentColor",
						"stroke-width": "4"
					}, null, -1), createBaseVNode("path", {
						class: "opacity-75",
						fill: "currentColor",
						d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					}, null, -1)]))) : createCommentVNode("", true), createBaseVNode("span", null, toDisplayString(_ctx.retrying ? _ctx.retryingText : _ctx.retryText), 1)], 8, _hoisted_10)) : createCommentVNode("", true),
					_ctx.showBack ? (openBlock(), createElementBlock("button", {
						key: 1,
						onClick: handleBack,
						class: "btn-back rounded-base text-sm font-semibold"
					}, toDisplayString(_ctx.backText), 1)) : createCommentVNode("", true),
					_ctx.showReport ? (openBlock(), createElementBlock("button", {
						key: 2,
						onClick: handleReport,
						class: "btn-report rounded-base text-sm font-semibold"
					}, toDisplayString(_ctx.reportText), 1)) : createCommentVNode("", true)
				], true)])) : createCommentVNode("", true),
				_ctx.suggestions.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_12, [_cache[3] || (_cache[3] = createBaseVNode("h4", { class: "text-caption-spaced font-semibold text-amber-800" }, "建议尝试：", -1)), createBaseVNode("ul", _hoisted_13, [(openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.suggestions, (suggestion, index) => {
					return openBlock(), createElementBlock("li", {
						key: index,
						class: "text-caption text-amber-700 mb-xs pl-base relative leading-relaxed"
					}, [_cache[2] || (_cache[2] = createBaseVNode("span", { class: "absolute left-0 text-amber-400 font-bold" }, "•", -1)), createTextVNode(" " + toDisplayString(suggestion), 1)]);
				}), 128))])])) : createCommentVNode("", true),
				_ctx.$slots.extra ? (openBlock(), createElementBlock("div", _hoisted_14, [renderSlot(_ctx.$slots, "extra", {}, void 0, true)])) : createCommentVNode("", true)
			])], 2);
		};
	}
});

//#endregion
//#region src/shared/components/ErrorState.vue
var ErrorState_default = /* @__PURE__ */ __plugin_vue_export_helper_default(ErrorState_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ff6f8ae8"]]);

//#endregion
export { ErrorState_default as b, render as c };