import { F as normalizeClass, G as normalizeStyle, H as toDisplayString, d as __plugin_vue_export_helper_default, l as computed, m as createBaseVNode, n as createBlock, o as createCommentVNode, p as createElementBlock, q as createTextVNode, s as defineComponent, v as openBlock, x as renderSlot, y as resolveDynamicComponent } from "./index-B1xTxyf1.js";

//#region node_modules/@heroicons/vue/24/outline/esm/PencilIcon.js
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
		d: "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
	})]);
}

//#endregion
//#region src/shared/components/EmptyState.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1$1 = { class: "empty-content animate-fadeIn max-w-sm w-full card-padding-normal content-spacing-normal" };
const _hoisted_2$1 = { class: "mb-lg" };
const _hoisted_3$1 = {
	key: 0,
	class: "text-6xl mb-base opacity-60"
};
const _hoisted_4 = { key: 1 };
const _hoisted_5 = { class: "text-heading-spaced text-gray-700" };
const _hoisted_6 = {
	key: 0,
	class: "text-body-spaced text-gray-600"
};
const _hoisted_7 = {
	key: 1,
	class: "mb-base"
};
const _hoisted_8 = ["disabled"];
const _hoisted_9 = { key: 0 };
const _hoisted_10 = { key: 1 };
const _hoisted_11 = {
	key: 2,
	class: "mt-base"
};
var EmptyState_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "EmptyState",
	props: {
		icon: { default: "" },
		iconComponent: { default: render },
		title: { default: "暂无内容" },
		description: { default: "" },
		actionText: { default: "" },
		actionLoadingText: { default: "处理中..." },
		actionLoading: {
			type: Boolean,
			default: false
		},
		showAction: {
			type: Boolean,
			default: false
		},
		size: { default: "medium" },
		variant: { default: "default" },
		centered: {
			type: Boolean,
			default: true
		}
	},
	emits: ["action"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const containerClass = computed(() => ({
			[`empty-${props.size}`]: true,
			[`empty-${props.variant}`]: true,
			"empty-centered": props.centered,
			"rounded-lg": true
		}));
		const handleAction = () => {
			if (!props.actionLoading) emit("action");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["empty-state flex items-center justify-center text-center", containerClass.value]) }, [createBaseVNode("div", _hoisted_1$1, [
				createBaseVNode("div", _hoisted_2$1, [!_ctx.$slots.icon ? (openBlock(), createElementBlock("div", _hoisted_3$1, [_ctx.iconComponent ? (openBlock(), createBlock(resolveDynamicComponent(_ctx.iconComponent), {
					key: 0,
					class: "w-6 h-6 mx-auto",
					"aria-hidden": "true"
				})) : (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(_ctx.icon), 1))])) : createCommentVNode("", true), renderSlot(_ctx.$slots, "icon", {}, void 0, true)]),
				createBaseVNode("h3", _hoisted_5, toDisplayString(_ctx.title), 1),
				_ctx.description ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(_ctx.description), 1)) : createCommentVNode("", true),
				_ctx.showAction || _ctx.$slots.action ? (openBlock(), createElementBlock("div", _hoisted_7, [renderSlot(_ctx.$slots, "action", {}, () => [_ctx.actionText ? (openBlock(), createElementBlock("button", {
					key: 0,
					onClick: handleAction,
					class: "btn-primary min-w-[120px]",
					disabled: _ctx.actionLoading
				}, [_ctx.actionLoading ? (openBlock(), createElementBlock("span", _hoisted_9, toDisplayString(_ctx.actionLoadingText), 1)) : (openBlock(), createElementBlock("span", _hoisted_10, toDisplayString(_ctx.actionText), 1))], 8, _hoisted_8)) : createCommentVNode("", true)], true)])) : createCommentVNode("", true),
				_ctx.$slots.extra ? (openBlock(), createElementBlock("div", _hoisted_11, [renderSlot(_ctx.$slots, "extra", {}, void 0, true)])) : createCommentVNode("", true)
			])], 2);
		};
	}
});

//#endregion
//#region src/shared/components/EmptyState.vue
var EmptyState_default = /* @__PURE__ */ __plugin_vue_export_helper_default(EmptyState_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6e5ada8c"]]);

//#endregion
//#region src/shared/components/BackButton.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = ["disabled", "aria-label"];
const _hoisted_2 = ["width", "height"];
const _hoisted_3 = ["stroke-width", "d"];
var BackButton_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "BackButton",
	props: {
		text: { default: "返回" },
		showText: {
			type: Boolean,
			default: true
		},
		disabled: {
			type: Boolean,
			default: false
		},
		variant: { default: "default" },
		size: { default: "medium" },
		color: { default: "default" },
		customColor: { default: "" },
		iconPosition: { default: "left" },
		iconSize: { default: 20 },
		strokeWidth: { default: 2 },
		arrowType: { default: "left" },
		block: {
			type: Boolean,
			default: false
		},
		rounded: {
			type: Boolean,
			default: false
		},
		shadow: {
			type: Boolean,
			default: false
		},
		ariaLabel: { default: "返回上一页" },
		rippleEffect: {
			type: Boolean,
			default: false
		},
		hoverAnimation: {
			type: Boolean,
			default: true
		}
	},
	emits: [
		"click",
		"focus",
		"blur"
	],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const buttonClass = computed(() => ({
			[`back-button--${props.variant}`]: true,
			[`back-button--${props.size}`]: true,
			[`back-button--${props.color}`]: props.color !== "custom",
			"text-sm": props.size === "small",
			"text-base": props.size === "medium",
			"text-lg max-md:text-base": props.size === "large",
			"max-md:text-sm": props.size === "medium",
			"back-button--block": props.block,
			"back-button--rounded": props.rounded,
			"back-button--shadow": props.shadow,
			"back-button--disabled": props.disabled,
			"rounded-full": props.rounded && !props.showText,
			"rounded-base": props.rounded && props.showText,
			[`back-button--icon-${props.iconPosition}`]: props.showText,
			"back-button--icon-only": !props.showText,
			"back-button--ripple": props.rippleEffect,
			"back-button--hover-animation": props.hoverAnimation && !props.disabled
		}));
		const buttonStyle = computed(() => {
			const style = {};
			if (props.color === "custom" && props.customColor) {
				style.color = props.customColor;
				style.borderColor = props.customColor;
			}
			return style;
		});
		const iconClass = computed(() => ({ [`back-icon--${props.iconPosition}`]: props.showText }));
		const arrowClass = computed(() => ({ [`back-arrow--${props.arrowType}`]: true }));
		const textClass = computed(() => ({ [`back-text--${props.iconPosition}`]: true }));
		const arrowPath = computed(() => {
			switch (props.arrowType) {
				case "left": return "M15 19l-7-7 7-7";
				case "up": return "M19 15l-7-7-7 7";
				case "chevron-left": return "M15 18l-6-6 6-6";
				case "chevron-up": return "M18 15l-6-6-6 6";
				default: return "M15 19l-7-7 7-7";
			}
		});
		const handleClick = (event) => {
			if (!props.disabled) emit("click", event);
		};
		__expose({
			focus: () => {},
			blur: () => {}
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("button", {
				class: normalizeClass(["back-button inline-flex items-center justify-center gap-sm font-medium", buttonClass.value]),
				style: normalizeStyle(buttonStyle.value),
				disabled: _ctx.disabled,
				onClick: handleClick,
				"aria-label": _ctx.ariaLabel
			}, [createBaseVNode("span", { class: normalizeClass(["back-icon", iconClass.value]) }, [renderSlot(_ctx.$slots, "icon", {}, () => [(openBlock(), createElementBlock("svg", {
				class: normalizeClass(["back-arrow", arrowClass.value]),
				fill: "none",
				stroke: "currentColor",
				viewBox: "0 0 24 24",
				width: _ctx.iconSize,
				height: _ctx.iconSize
			}, [createBaseVNode("path", {
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"stroke-width": _ctx.strokeWidth,
				d: arrowPath.value
			}, null, 8, _hoisted_3)], 10, _hoisted_2))], true)], 2), _ctx.showText ? (openBlock(), createElementBlock("span", {
				key: 0,
				class: normalizeClass(["back-text whitespace-nowrap leading-none", textClass.value])
			}, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(_ctx.text), 1)], true)], 2)) : createCommentVNode("", true)], 14, _hoisted_1);
		};
	}
});

//#endregion
//#region src/shared/components/BackButton.vue
var BackButton_default = /* @__PURE__ */ __plugin_vue_export_helper_default(BackButton_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c576bc1f"]]);

//#endregion
export { BackButton_default as b, EmptyState_default as c, render as d };