import { D as ref, F as normalizeClass, G as normalizeStyle, H as toDisplayString, d as __plugin_vue_export_helper_default, j as Fragment, l as computed, m as createBaseVNode, o as createCommentVNode, p as createElementBlock, q as createTextVNode, s as defineComponent, t as onMounted, v as openBlock, w as renderList, x as renderSlot, z as watch } from "./index-B1xTxyf1.js";

//#region src/shared/components/ProgressBar.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = {
	key: 0,
	class: "flex justify-between items-center mb-sm"
};
const _hoisted_2 = { class: "text-caption font-medium text-gray-700" };
const _hoisted_3 = {
	key: 0,
	class: "text-caption font-semibold text-gray-900"
};
const _hoisted_4 = [
	"aria-valuenow",
	"aria-valuemin",
	"aria-valuemax",
	"aria-label"
];
const _hoisted_5 = {
	key: 0,
	class: "progress-shine"
};
const _hoisted_6 = {
	key: 1,
	class: "text-white text-label font-semibold text-shadow whitespace-nowrap overflow-hidden text-ellipsis"
};
const _hoisted_7 = {
	key: 0,
	class: "progress-steps"
};
const _hoisted_8 = ["onClick"];
const _hoisted_9 = {
	key: 0,
	class: "absolute top-full left-1/2 transform -translate-x-1/2 mt-xs text-label text-gray-600 whitespace-nowrap"
};
const _hoisted_10 = {
	key: 1,
	class: "flex justify-between items-center mt-sm"
};
const _hoisted_11 = {
	key: 0,
	class: "text-label text-gray-600"
};
const _hoisted_12 = {
	key: 1,
	class: "text-label text-gray-600"
};
var ProgressBar_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "ProgressBar",
	props: {
		modelValue: { default: 0 },
		min: { default: 0 },
		max: { default: 100 },
		showLabel: {
			type: Boolean,
			default: false
		},
		showPercentage: {
			type: Boolean,
			default: true
		},
		showInnerText: {
			type: Boolean,
			default: false
		},
		showDetails: {
			type: Boolean,
			default: false
		},
		showSteps: {
			type: Boolean,
			default: false
		},
		showTimeEstimate: {
			type: Boolean,
			default: false
		},
		showCurrentStep: {
			type: Boolean,
			default: false
		},
		labelText: { default: "进度" },
		innerText: { default: "" },
		ariaLabel: { default: "进度指示器" },
		currentStepInfo: { default: "" },
		timeEstimate: { default: "" },
		variant: { default: "default" },
		color: { default: "primary" },
		customColor: { default: "" },
		size: { default: "medium" },
		animated: {
			type: Boolean,
			default: true
		},
		smooth: {
			type: Boolean,
			default: true
		},
		duration: { default: 300 },
		steps: { default: () => [] },
		allowStepClick: {
			type: Boolean,
			default: false
		},
		striped: {
			type: Boolean,
			default: false
		},
		indeterminate: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"update:modelValue",
		"stepClick",
		"complete",
		"change"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const animatedValue = ref(props.modelValue);
		const previousValue = ref(props.modelValue);
		const currentValue = computed(() => {
			return Math.min(props.max, Math.max(props.min, props.modelValue));
		});
		const displayPercentage = computed(() => {
			const range = props.max - props.min;
			const progress = currentValue.value - props.min;
			return Math.round(progress / range * 100);
		});
		const containerClass = computed(() => ({
			[`progress-container--${props.size}`]: true,
			"progress-container--disabled": props.disabled
		}));
		const trackClass = computed(() => ({
			[`progress-track--${props.variant}`]: true,
			[`progress-track--${props.color}`]: props.color !== "custom",
			"progress-track--striped": props.striped,
			"progress-track--indeterminate": props.indeterminate,
			"rounded-base": props.variant !== "square"
		}));
		const trackStyle = computed(() => {
			const style = {};
			if (props.color === "custom" && props.customColor) style.borderColor = props.customColor + "40";
			return style;
		});
		const fillClass = computed(() => ({
			[`progress-fill--${props.color}`]: props.color !== "custom",
			"progress-fill--animated": props.animated,
			"progress-fill--smooth": props.smooth,
			"progress-fill--striped": props.striped,
			"rounded-base": props.variant !== "square"
		}));
		const fillStyle = computed(() => {
			const style = {};
			if (props.indeterminate) {
				style.width = "100%";
				style.animation = "progress-indeterminate 2s linear infinite";
			} else {
				const percentage = displayPercentage.value;
				style.width = `${percentage}%`;
				if (props.smooth) style.transition = `width ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
			}
			if (props.color === "custom" && props.customColor) style.backgroundColor = props.customColor;
			return style;
		});
		const stepClass = (index) => {
			const step = props.steps[index];
			const stepValue = step.value;
			const isActive = currentValue.value >= stepValue;
			const isCompleted = step.completed || currentValue.value > stepValue;
			const isClickable = props.allowStepClick && (step.clickable ?? true);
			return {
				"progress-step--active": isActive,
				"progress-step--completed": isCompleted,
				"progress-step--clickable": isClickable && !props.disabled
			};
		};
		const stepStyle = (index) => {
			const step = props.steps[index];
			const range = props.max - props.min;
			const percentage = (step.value - props.min) / range * 100;
			return { left: `${percentage}%` };
		};
		const handleStepClick = (index) => {
			if (!props.allowStepClick || props.disabled) return;
			const step = props.steps[index];
			if (step.clickable === false) return;
			emit("update:modelValue", step.value);
			emit("stepClick", index, step);
		};
		watch(() => props.modelValue, (newValue, oldValue) => {
			previousValue.value = oldValue;
			if (props.smooth) {
				const startValue = animatedValue.value;
				const endValue = newValue;
				const startTime = performance.now();
				const animate = (currentTime) => {
					const elapsed = currentTime - startTime;
					const progress = Math.min(elapsed / props.duration, 1);
					const easeOutCubic = 1 - Math.pow(1 - progress, 3);
					animatedValue.value = startValue + (endValue - startValue) * easeOutCubic;
					if (progress < 1) requestAnimationFrame(animate);
					else {
						animatedValue.value = endValue;
						if (newValue >= props.max) emit("complete");
						emit("change", newValue);
					}
				};
				requestAnimationFrame(animate);
			} else {
				animatedValue.value = newValue;
				if (newValue >= props.max) emit("complete");
				emit("change", newValue);
			}
		});
		onMounted(() => {
			animatedValue.value = props.modelValue;
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["progress-bar-container w-full", containerClass.value]) }, [
				_ctx.showLabel || _ctx.$slots.label ? (openBlock(), createElementBlock("div", _hoisted_1, [renderSlot(_ctx.$slots, "label", {}, () => [createBaseVNode("span", _hoisted_2, toDisplayString(_ctx.labelText), 1), _ctx.showPercentage ? (openBlock(), createElementBlock("span", _hoisted_3, toDisplayString(displayPercentage.value) + "% ", 1)) : createCommentVNode("", true)], true)])) : createCommentVNode("", true),
				createBaseVNode("div", {
					class: normalizeClass(["progress-track", trackClass.value]),
					style: normalizeStyle(trackStyle.value),
					role: "progressbar",
					"aria-valuenow": currentValue.value,
					"aria-valuemin": _ctx.min,
					"aria-valuemax": _ctx.max,
					"aria-label": _ctx.ariaLabel
				}, [createBaseVNode("div", {
					class: normalizeClass(["progress-fill", fillClass.value]),
					style: normalizeStyle(fillStyle.value)
				}, [_ctx.animated ? (openBlock(), createElementBlock("div", _hoisted_5)) : createCommentVNode("", true), _ctx.showInnerText ? (openBlock(), createElementBlock("div", _hoisted_6, [renderSlot(_ctx.$slots, "inner-text", {}, () => [createTextVNode(toDisplayString(_ctx.innerText), 1)], true)])) : createCommentVNode("", true)], 6), _ctx.showSteps && _ctx.steps.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.steps, (step, index) => {
					return openBlock(), createElementBlock("div", {
						key: index,
						class: normalizeClass(["progress-step", stepClass(index)]),
						style: normalizeStyle(stepStyle(index)),
						onClick: ($event) => handleStepClick(index)
					}, [_cache[0] || (_cache[0] = createBaseVNode("div", { class: "step-marker rounded-full" }, null, -1)), step.label ? (openBlock(), createElementBlock("div", _hoisted_9, toDisplayString(step.label), 1)) : createCommentVNode("", true)], 14, _hoisted_8);
				}), 128))])) : createCommentVNode("", true)], 14, _hoisted_4),
				_ctx.showDetails || _ctx.$slots.details ? (openBlock(), createElementBlock("div", _hoisted_10, [renderSlot(_ctx.$slots, "details", {}, () => [_ctx.showTimeEstimate && _ctx.timeEstimate ? (openBlock(), createElementBlock("div", _hoisted_11, " 预计剩余时间: " + toDisplayString(_ctx.timeEstimate), 1)) : createCommentVNode("", true), _ctx.showCurrentStep && _ctx.currentStepInfo ? (openBlock(), createElementBlock("div", _hoisted_12, toDisplayString(_ctx.currentStepInfo), 1)) : createCommentVNode("", true)], true)])) : createCommentVNode("", true)
			], 2);
		};
	}
});

//#endregion
//#region src/shared/components/ProgressBar.vue
var ProgressBar_default = /* @__PURE__ */ __plugin_vue_export_helper_default(ProgressBar_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5f6781d6"]]);

//#endregion
export { ProgressBar_default as b };