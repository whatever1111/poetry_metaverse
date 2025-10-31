import { F as normalizeClass, G as normalizeStyle, H as toDisplayString, d as __plugin_vue_export_helper_default, l as computed, m as createBaseVNode, o as createCommentVNode, p as createElementBlock, s as defineComponent, v as openBlock, x as renderSlot } from "./index-B1xTxyf1.js";

//#region src/shared/components/LoadingSpinner.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = { class: "loading-content flex flex-col items-center justify-center relative z-2" };
const _hoisted_2 = { class: "spinner-wrapper mb-lg" };
const _hoisted_3 = {
	key: 0,
	class: "inner-ring rounded-full"
};
const _hoisted_4 = {
	key: 0,
	class: "loading-text-section text-center max-w-sm max-sm:max-w-xs max-sm:px-base"
};
const _hoisted_5 = { class: "text-body font-medium text-gray-600 mb-sm max-sm:text-base" };
const _hoisted_6 = {
	key: 0,
	class: "text-caption italic text-gray-500 mb-base max-sm:text-xs"
};
const _hoisted_7 = {
	key: 1,
	class: "loading-progress"
};
const _hoisted_8 = { class: "progress-bar rounded-sm" };
const _hoisted_9 = { class: "text-caption text-gray-500 text-center" };
const _hoisted_10 = {
	key: 1,
	class: "mt-lg text-center"
};
var LoadingSpinner_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "LoadingSpinner",
	props: {
		size: { default: "medium" },
		variant: { default: "default" },
		color: { default: "" },
		loadingText: { default: "正在加载..." },
		subtitle: { default: "" },
		showText: {
			type: Boolean,
			default: true
		},
		showInnerRing: {
			type: Boolean,
			default: false
		},
		showOverlay: {
			type: Boolean,
			default: false
		},
		showProgress: {
			type: Boolean,
			default: false
		},
		progress: { default: 0 },
		fullScreen: {
			type: Boolean,
			default: false
		},
		centered: {
			type: Boolean,
			default: true
		},
		overlayClickable: {
			type: Boolean,
			default: false
		}
	},
	emits: ["overlayClick"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const containerClass = computed(() => ({
			"loading-fullscreen": props.fullScreen,
			"loading-centered": props.centered,
			"loading-with-overlay": props.showOverlay
		}));
		const spinnerClass = computed(() => {
			const classes = [`loading-${props.variant}`, `loading-${props.size}`];
			return classes;
		});
		const spinnerStyle = computed(() => {
			const style = {};
			if (props.color) if (props.variant === "default") style.borderTopColor = props.color;
			else style.backgroundColor = props.color;
			return style;
		});
		const handleOverlayClick = () => {
			if (props.overlayClickable) emit("overlayClick");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["loading-spinner-container relative flex flex-col items-center justify-center", containerClass.value]) }, [createBaseVNode("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", {
					class: normalizeClass(["loading-spinner rounded-full", spinnerClass.value]),
					style: normalizeStyle(spinnerStyle.value)
				}, null, 6), _ctx.showInnerRing ? (openBlock(), createElementBlock("div", _hoisted_3)) : createCommentVNode("", true)]),
				_ctx.showText ? (openBlock(), createElementBlock("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, toDisplayString(_ctx.loadingText), 1),
					_ctx.subtitle ? (openBlock(), createElementBlock("div", _hoisted_6, toDisplayString(_ctx.subtitle), 1)) : createCommentVNode("", true),
					_ctx.showProgress && typeof _ctx.progress === "number" ? (openBlock(), createElementBlock("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, [createBaseVNode("div", {
						class: "progress-fill rounded-sm",
						style: normalizeStyle({ width: `${Math.min(100, Math.max(0, _ctx.progress))}%` })
					}, null, 4)]), createBaseVNode("div", _hoisted_9, toDisplayString(Math.round(_ctx.progress)) + "%", 1)])) : createCommentVNode("", true)
				])) : createCommentVNode("", true),
				_ctx.$slots.extra ? (openBlock(), createElementBlock("div", _hoisted_10, [renderSlot(_ctx.$slots, "extra", {}, void 0, true)])) : createCommentVNode("", true)
			]), _ctx.showOverlay ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: "loading-overlay",
				onClick: handleOverlayClick
			})) : createCommentVNode("", true)], 2);
		};
	}
});

//#endregion
//#region src/shared/components/LoadingSpinner.vue
var LoadingSpinner_default = /* @__PURE__ */ __plugin_vue_export_helper_default(LoadingSpinner_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-162fc9a8"]]);

//#endregion
export { LoadingSpinner_default as b };