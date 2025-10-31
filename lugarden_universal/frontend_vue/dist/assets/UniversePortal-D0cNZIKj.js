import { A as withCtx, C as reactive, D as ref, E as unref, F as normalizeClass, G as normalizeStyle, H as toDisplayString, c as useRouter, d as __plugin_vue_export_helper_default, e as defineStore, f as Transition, i as withModifiers, j as Fragment, k as Teleport, l as computed, m as createBaseVNode, n as createBlock, o as createCommentVNode, p as createElementBlock, q as createTextVNode, r as createVNode, s as defineComponent, t as onMounted, u as onUnmounted, v as openBlock, w as renderList, x as renderSlot, y as resolveDynamicComponent, z as watch } from "./index-B1xTxyf1.js";
import { b as LoadingSpinner_default } from "./LoadingSpinner-B-ZUe7SV.js";
import { b as ErrorState_default } from "./ErrorState-DE6rNWWA.js";
import { c as EmptyState_default } from "./BackButton-_BnDcdOi.js";
import "./ProgressBar-42JUQZi9.js";
import { b as getApiServices, c as getUserFriendlyErrorMessage, d as isApiError } from "./enhancedApi-9fV76Vys.js";

//#region src/shared/components/AnimationWrapper.vue?vue&type=script&setup=true&lang.ts
var AnimationWrapper_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "AnimationWrapper",
	props: {
		animationType: { default: "fadeInUp" },
		mode: { default: "default" },
		duration: { default: 300 },
		appear: {
			type: Boolean,
			default: true
		},
		visible: {
			type: Boolean,
			default: true
		},
		animationKey: { default: "default" },
		delay: { default: 0 },
		disableAnimationOnMobile: {
			type: Boolean,
			default: false
		},
		respectReducedMotion: {
			type: Boolean,
			default: true
		},
		customTransitionName: { default: "" },
		wrapperClass: { default: "" },
		preserveAspectRatio: {
			type: Boolean,
			default: false
		},
		preventScrollJump: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"beforeEnter",
		"enter",
		"afterEnter",
		"beforeLeave",
		"leave",
		"afterLeave",
		"enterCancelled",
		"leaveCancelled"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const isMobile = ref(false);
		const prefersReducedMotion = ref(false);
		const transitionName = computed(() => {
			if (props.customTransitionName) return props.customTransitionName;
			if (shouldDisableAnimation.value) return "no-animation";
			return `anim-${props.animationType}`;
		});
		const shouldDisableAnimation = computed(() => {
			if (props.respectReducedMotion && prefersReducedMotion.value) return true;
			if (props.disableAnimationOnMobile && isMobile.value) return true;
			return false;
		});
		const wrapperStyle = computed(() => {
			const style = {};
			if (props.delay > 0) style.animationDelay = `${props.delay}ms`;
			if (props.preserveAspectRatio) style.aspectRatio = "auto";
			return style;
		});
		const checkMobileDevice = () => {
			isMobile.value = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		};
		const checkReducedMotionPreference = () => {
			if (typeof window !== "undefined" && window.matchMedia) {
				const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
				prefersReducedMotion.value = mediaQuery.matches;
				mediaQuery.addEventListener("change", (e) => {
					prefersReducedMotion.value = e.matches;
				});
			}
		};
		const preventScrollJumpHandler = () => {
			if (props.preventScrollJump) document.body.style.overflow = "hidden";
		};
		const restoreScrollHandler = () => {
			if (props.preventScrollJump) document.body.style.overflow = "";
		};
		onMounted(() => {
			checkMobileDevice();
			checkReducedMotionPreference();
			window.addEventListener("resize", checkMobileDevice);
		});
		onUnmounted(() => {
			window.removeEventListener("resize", checkMobileDevice);
			restoreScrollHandler();
		});
		const handleBeforeEnter = (el) => {
			preventScrollJumpHandler();
			emit("beforeEnter", el);
		};
		const handleEnter = (el) => {
			emit("enter", el);
		};
		const handleAfterEnter = (el) => {
			restoreScrollHandler();
			emit("afterEnter", el);
		};
		const handleBeforeLeave = (el) => {
			preventScrollJumpHandler();
			emit("beforeLeave", el);
		};
		const handleLeave = (el) => {
			emit("leave", el);
		};
		const handleAfterLeave = (el) => {
			restoreScrollHandler();
			emit("afterLeave", el);
		};
		const handleEnterCancelled = (el) => {
			restoreScrollHandler();
			emit("enterCancelled", el);
		};
		const handleLeaveCancelled = (el) => {
			restoreScrollHandler();
			emit("leaveCancelled", el);
		};
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Transition, {
				name: transitionName.value,
				mode: _ctx.mode,
				duration: _ctx.duration,
				appear: _ctx.appear,
				onBeforeEnter: handleBeforeEnter,
				onEnter: handleEnter,
				onAfterEnter: handleAfterEnter,
				onBeforeLeave: handleBeforeLeave,
				onLeave: handleLeave,
				onAfterLeave: handleAfterLeave,
				onEnterCancelled: handleEnterCancelled,
				onLeaveCancelled: handleLeaveCancelled
			}, {
				default: withCtx(() => [_ctx.visible ? (openBlock(), createElementBlock("div", {
					key: _ctx.animationKey,
					class: normalizeClass(["animation-wrapper", _ctx.wrapperClass]),
					style: normalizeStyle(wrapperStyle.value)
				}, [renderSlot(_ctx.$slots, "default", {}, void 0, true)], 6)) : createCommentVNode("", true)]),
				_: 3
			}, 8, [
				"name",
				"mode",
				"duration",
				"appear"
			]);
		};
	}
});

//#endregion
//#region src/shared/components/AnimationWrapper.vue
var AnimationWrapper_default = /* @__PURE__ */ __plugin_vue_export_helper_default(AnimationWrapper_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e862d333"]]);

//#endregion
//#region src/shared/components/NotificationToast.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1$2 = { class: "toast-content" };
const _hoisted_2$2 = {
	key: 0,
	class: "toast-title font-semibold mb-xs"
};
const _hoisted_3$2 = { class: "toast-message opacity-90 break-words" };
const _hoisted_4$2 = {
	key: 1,
	class: "toast-actions flex gap-sm mt-sm"
};
const _hoisted_5$2 = ["onClick"];
var NotificationToast_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "NotificationToast",
	props: {
		title: { default: "" },
		message: { default: "" },
		visible: {
			type: Boolean,
			default: false
		},
		type: { default: "info" },
		variant: { default: "filled" },
		size: { default: "medium" },
		position: { default: "top-right" },
		duration: { default: 4e3 },
		closable: {
			type: Boolean,
			default: true
		},
		hideCloseButton: {
			type: Boolean,
			default: false
		},
		pauseOnHover: {
			type: Boolean,
			default: true
		},
		clickToClose: {
			type: Boolean,
			default: false
		},
		showIcon: {
			type: Boolean,
			default: true
		},
		customIcon: { default: "" },
		actions: { default: () => [] },
		showActions: {
			type: Boolean,
			default: false
		},
		animation: { default: "slide" },
		showProgress: {
			type: Boolean,
			default: true
		},
		persistent: {
			type: Boolean,
			default: false
		},
		zIndex: { default: 1e3 },
		customClass: { default: "" },
		customColor: { default: "" },
		customBackgroundColor: { default: "" }
	},
	emits: [
		"close",
		"update:visible",
		"action",
		"click",
		"timeout"
	],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const showToast = ref(false);
		const isPaused = ref(false);
		const progress = ref(100);
		const timeoutId = ref(null);
		const startTime = ref(0);
		const remainingTime = ref(0);
		const containerClass = computed(() => ({
			[`toast-container--${props.position}`]: true,
			[`toast-container--z-${props.zIndex}`]: true
		}));
		const toastClass = computed(() => ({
			[`toast--${props.type}`]: props.type !== "custom",
			[`toast--${props.variant}`]: true,
			[`toast--${props.size}`]: true,
			"text-xs max-sm:text-xs": props.size === "small",
			"text-sm max-md:text-xs": props.size === "medium",
			"text-base max-md:text-sm": props.size === "large",
			"toast--clickable": props.clickToClose,
			"toast--persistent": props.persistent,
			[props.customClass]: props.customClass
		}));
		const toastStyle = computed(() => {
			const style = { zIndex: props.zIndex.toString() };
			if (props.type === "custom") {
				if (props.customColor) style.color = props.customColor;
				if (props.customBackgroundColor) style.backgroundColor = props.customBackgroundColor;
			}
			return style;
		});
		const iconClass = computed(() => ({ [`toast-icon--${props.type}`]: props.type !== "custom" }));
		const iconSvgClass = computed(() => ({ [`icon--${props.type}`]: props.type !== "custom" }));
		const closeButtonClass = computed(() => ({ [`toast-close--${props.type}`]: props.type !== "custom" }));
		const transitionName = computed(() => {
			const position = props.position;
			switch (props.animation) {
				case "slide":
					if (position.includes("right")) return "slide-right";
					if (position.includes("left")) return "slide-left";
					if (position.includes("top")) return "slide-down";
					if (position.includes("bottom")) return "slide-up";
					return "slide-down";
				case "bounce": return "bounce";
				case "zoom": return "zoom";
				case "fade":
				default: return "fade";
			}
		});
		const iconComponent = computed(() => {
			if (props.customIcon) return props.customIcon;
			switch (props.type) {
				case "success": return "CheckCircleIcon";
				case "warning": return "ExclamationTriangleIcon";
				case "error": return "XCircleIcon";
				case "info":
				default: return "InformationCircleIcon";
			}
		});
		const progressStyle = computed(() => ({
			width: `${progress.value}%`,
			backgroundColor: getProgressColor()
		}));
		const getProgressColor = () => {
			switch (props.type) {
				case "success": return "#22c55e";
				case "warning": return "#f59e0b";
				case "error": return "#ef4444";
				case "info": return "#3b82f6";
				default: return props.customColor || "#3b82f6";
			}
		};
		const startTimer = () => {
			if (props.duration <= 0 || props.persistent) return;
			startTime.value = Date.now();
			remainingTime.value = props.duration;
			const updateProgress = () => {
				if (isPaused.value) return;
				const elapsed = Date.now() - startTime.value;
				const remaining = Math.max(0, props.duration - elapsed);
				progress.value = remaining / props.duration * 100;
				if (remaining <= 0) handleTimeout();
				else timeoutId.value = requestAnimationFrame(updateProgress);
			};
			timeoutId.value = requestAnimationFrame(updateProgress);
		};
		const pauseTimer = () => {
			if (!props.pauseOnHover || props.duration <= 0) return;
			isPaused.value = true;
			if (timeoutId.value) {
				cancelAnimationFrame(timeoutId.value);
				timeoutId.value = null;
			}
			const elapsed = Date.now() - startTime.value;
			remainingTime.value = Math.max(0, props.duration - elapsed);
		};
		const resumeTimer = () => {
			if (!props.pauseOnHover || props.duration <= 0) return;
			isPaused.value = false;
			startTime.value = Date.now();
			startTimer();
		};
		const clearTimer = () => {
			if (timeoutId.value) {
				cancelAnimationFrame(timeoutId.value);
				timeoutId.value = null;
			}
		};
		const handleTimeout = () => {
			clearTimer();
			emit("timeout");
			handleClose();
		};
		const handleClose = () => {
			clearTimer();
			showToast.value = false;
			emit("close");
			emit("update:visible", false);
		};
		const handleToastClick = (event) => {
			emit("click", event);
			if (props.clickToClose) handleClose();
		};
		const handleMouseEnter = () => {
			if (props.pauseOnHover) pauseTimer();
		};
		const handleMouseLeave = () => {
			if (props.pauseOnHover) resumeTimer();
		};
		const handleActionClick = (action) => {
			emit("action", action.key);
			if (action.handler) action.handler();
		};
		const handleAfterEnter = () => {
			startTimer();
		};
		const handleBeforeLeave = () => {
			clearTimer();
		};
		watch(() => props.visible, (newVisible) => {
			if (newVisible) {
				showToast.value = true;
				progress.value = 100;
			} else handleClose();
		}, { immediate: true });
		onUnmounted(() => {
			clearTimer();
		});
		__expose({
			close: handleClose,
			pause: pauseTimer,
			resume: resumeTimer
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Teleport, { to: "body" }, [_ctx.visible ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: normalizeClass(["toast-container", containerClass.value])
			}, [createVNode(Transition, {
				name: transitionName.value,
				appear: "",
				onAfterEnter: handleAfterEnter,
				onBeforeLeave: handleBeforeLeave
			}, {
				default: withCtx(() => [showToast.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: normalizeClass(["toast flex items-start gap-sm leading-6", toastClass.value]),
					style: normalizeStyle(toastStyle.value),
					onClick: handleToastClick,
					onMouseenter: handleMouseEnter,
					onMouseleave: handleMouseLeave
				}, [
					_ctx.showIcon ? (openBlock(), createElementBlock("div", {
						key: 0,
						class: normalizeClass(["toast-icon", iconClass.value])
					}, [renderSlot(_ctx.$slots, "icon", {}, () => [(openBlock(), createBlock(resolveDynamicComponent(iconComponent.value), { class: normalizeClass(["icon-svg", iconSvgClass.value]) }, null, 8, ["class"]))], true)], 2)) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_1$2, [
						_ctx.title ? (openBlock(), createElementBlock("div", _hoisted_2$2, toDisplayString(_ctx.title), 1)) : createCommentVNode("", true),
						createBaseVNode("div", _hoisted_3$2, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(_ctx.message), 1)], true)]),
						_ctx.showActions || _ctx.$slots.actions ? (openBlock(), createElementBlock("div", _hoisted_4$2, [renderSlot(_ctx.$slots, "actions", {}, () => [(openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.actions, (action) => {
							return openBlock(), createElementBlock("button", {
								key: action.key,
								class: normalizeClass(["toast-action-button text-xs font-medium px-sm py-xs border rounded-sm bg-transparent transition-all cursor-pointer", action.class]),
								onClick: ($event) => handleActionClick(action)
							}, toDisplayString(action.label), 11, _hoisted_5$2);
						}), 128))], true)])) : createCommentVNode("", true)
					]),
					_ctx.closable && !_ctx.hideCloseButton ? (openBlock(), createElementBlock("button", {
						key: 1,
						class: normalizeClass(["toast-close", closeButtonClass.value]),
						onClick: handleClose,
						"aria-label": "关闭通知"
					}, [renderSlot(_ctx.$slots, "close-icon", {}, () => [_cache[0] || (_cache[0] = createBaseVNode("svg", {
						class: "close-icon",
						fill: "none",
						stroke: "currentColor",
						viewBox: "0 0 24 24"
					}, [createBaseVNode("path", {
						"stroke-linecap": "round",
						"stroke-linejoin": "round",
						"stroke-width": "2",
						d: "M6 18L18 6M6 6l12 12"
					})], -1))], true)], 2)) : createCommentVNode("", true),
					_ctx.showProgress && _ctx.duration > 0 ? (openBlock(), createElementBlock("div", {
						key: 2,
						class: "toast-progress",
						style: normalizeStyle(progressStyle.value)
					}, null, 4)) : createCommentVNode("", true)
				], 38)) : createCommentVNode("", true)]),
				_: 3
			}, 8, ["name"])], 2)) : createCommentVNode("", true)]);
		};
	}
});

//#endregion
//#region src/shared/components/NotificationToast.vue
var NotificationToast_default = /* @__PURE__ */ __plugin_vue_export_helper_default(NotificationToast_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3b46a878"]]);

//#endregion
//#region src/modules/portal/components/UniverseCard.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1$1 = { class: "flex-1" };
const _hoisted_2$1 = { class: "flex justify-between items-start mb-4" };
const _hoisted_3$1 = { class: "text-2xl font-bold text-gray-800 m-0" };
const _hoisted_4$1 = { class: "text-base text-gray-600 mb-4 whitespace-pre-line leading-loose" };
const _hoisted_5$1 = { class: "flex justify-between items-center mt-4" };
const _hoisted_6 = { class: "text-xs text-gray-500 m-0" };
const _hoisted_7 = ["disabled"];
var UniverseCard_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "UniverseCard",
	props: {
		universe: {},
		disabled: {
			type: Boolean,
			default: false
		},
		index: { default: 0 }
	},
	emits: ["click", "enter"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const isActive = computed(() => {
			return props.universe.status === "active" && !props.disabled;
		});
		const animationDelay = computed(() => {
			return Math.min(props.index * 50, 200);
		});
		const statusText = computed(() => {
			const statusMap = {
				active: "已上线",
				developing: "开发中",
				maintenance: "维护中",
				archived: "已归档"
			};
			return statusMap[props.universe.status] || "未知";
		});
		const buttonText = computed(() => {
			if (!isActive.value) return props.universe.status === "developing" ? "敬请期待" : "暂不可用";
			return "进入宇宙";
		});
		const handleCardClick = () => {
			emit("click", props.universe);
		};
		const handleEnterClick = () => {
			if (isActive.value) emit("enter", props.universe);
		};
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(AnimationWrapper_default), {
				"animation-type": "fadeInUp",
				delay: animationDelay.value,
				class: "universe-card-wrapper"
			}, {
				default: withCtx(() => [createBaseVNode("div", {
					class: normalizeClass(["universe-card", { "card-disabled": !isActive.value }]),
					onClick: handleCardClick
				}, [createBaseVNode("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [createBaseVNode("h3", _hoisted_3$1, toDisplayString(_ctx.universe.name), 1), createBaseVNode("span", { class: normalizeClass(["universe-status", _ctx.universe.status]) }, toDisplayString(statusText.value), 3)]), createBaseVNode("p", _hoisted_4$1, toDisplayString(_ctx.universe.description), 1)]), createBaseVNode("div", _hoisted_5$1, [createBaseVNode("p", _hoisted_6, toDisplayString(_ctx.universe.meta), 1), createBaseVNode("button", {
					class: "enter-button",
					disabled: !isActive.value,
					onClick: withModifiers(handleEnterClick, ["stop"])
				}, toDisplayString(buttonText.value), 9, _hoisted_7)])], 2)]),
				_: 1
			}, 8, ["delay"]);
		};
	}
});

//#endregion
//#region src/modules/portal/components/UniverseCard.vue
var UniverseCard_default = /* @__PURE__ */ __plugin_vue_export_helper_default(UniverseCard_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0da30af0"]]);

//#endregion
//#region src/modules/portal/stores/portal.ts
const usePortalStore = defineStore("portal", () => {
	let apiServices = null;
	const initializeApiServices = () => {
		if (!apiServices) apiServices = getApiServices({
			onLoadingChange: (loading) => {
				console.log("[Portal API] Loading状态变化:", loading, "当前手动状态:", state.loading);
				if (!state.loading || loading === false) {
					console.log("[Portal API] 接受状态变化");
					state.loading = loading;
				} else console.log("[Portal API] 忽略状态变化，避免冲突");
			},
			onError: (error) => {
				console.error("Portal API错误:", error);
				state.error.hasError = true;
				state.error.message = getUserFriendlyErrorMessage(error);
			},
			enableLogging: true,
			enableCaching: true,
			cacheDuration: 600 * 1e3
		});
		return apiServices;
	};
	const state = reactive({
		universes: [],
		loading: false,
		error: {
			hasError: false,
			message: "",
			code: void 0
		},
		selectedUniverse: void 0
	});
	const navigationConfig = {
		zhou: "/zhou",
		maoxiaodou: "/maoxiaodou"
	};
	const activeUniverses = computed(() => {
		return state.universes.filter((universe) => universe.status === "active");
	});
	const developingUniverses = computed(() => {
		return state.universes.filter((universe) => universe.status === "developing");
	});
	const visibleUniverses = computed(() => {
		return state.universes.filter((universe) => universe.status !== "archived");
	});
	const universeStats = computed(() => {
		const stats = {
			total: state.universes.length,
			active: 0,
			developing: 0,
			maintenance: 0,
			archived: 0
		};
		state.universes.forEach((universe) => {
			stats[universe.status]++;
		});
		return stats;
	});
	const hasActiveUniverses = computed(() => {
		return activeUniverses.value.length > 0;
	});
	const isLoading = computed(() => state.loading);
	const hasError = computed(() => state.error.hasError);
	const errorMessage = computed(() => state.error.message);
	async function loadUniverses(refresh = false) {
		if (state.loading) {
			console.log("[Portal] 已在加载中，跳过重复请求");
			return;
		}
		try {
			console.log("[Portal] 开始加载宇宙列表, refresh:", refresh);
			state.loading = true;
			clearError();
			if (!refresh && state.universes.length > 0) {
				console.log("[Portal] 缓存数据存在且不需要刷新，直接返回");
				state.loading = false;
				return;
			}
			const api = initializeApiServices();
			const portalService = api.getPortalService();
			try {
				const response = await portalService.getUniverseList({
					refresh,
					includeAnalytics: false
				});
				if (response.status === "success" && response.universes) state.universes = response.universes;
				else throw new Error(response.message || "获取宇宙列表失败");
			} catch (apiError) {
				console.warn("API调用失败，使用硬编码数据作为降级方案:", apiError);
				await simulateApiCall();
				state.universes = [
					{
						id: "zhou",
						name: "周与春秋练习",
						description: "基于吴任几《周与春秋练习》系列诗歌的互动体验，通过问答与解诗探索古典诗歌的现代意义。",
						status: "active",
						meta: "诗歌问答 · 古典解读",
						version: "2.0.0",
						lastUpdated: "2025-08-28"
					},
					{
						id: "maoxiaodou",
						name: "毛小豆故事演绎",
						description: "毛小豆宇宙的奇幻冒险，包含前篇、正篇、番外的完整故事体系。",
						status: "developing",
						meta: "故事世界 · 角色扮演",
						version: "0.8.0",
						lastUpdated: "2025-08-15"
					},
					{
						id: "poet_universe",
						name: "诗人宇宙",
						description: "探索多位诗人的世界观和创作理念，通过AI对话体验不同的诗歌美学。",
						status: "developing",
						meta: "诗人对话 · AI体验",
						version: "0.3.0",
						lastUpdated: "2025-08-01"
					}
				];
			}
			console.log("[Portal] 宇宙列表加载成功:", {
				total: state.universes.length,
				active: activeUniverses.value.length,
				developing: developingUniverses.value.length
			});
		} catch (error) {
			console.error("加载宇宙列表失败:", error);
			if (isApiError(error)) {
				state.error.hasError = true;
				state.error.message = error.message;
				state.error.code = error.code;
			} else {
				state.error.hasError = true;
				state.error.message = error instanceof Error ? error.message : "加载宇宙列表失败";
			}
		} finally {
			console.log("[Portal] 加载完成，重置loading状态");
			state.loading = false;
		}
	}
	async function simulateApiCall() {
		const delay = Math.random() * 1e3 + 500;
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
	async function refreshUniverses() {
		return loadUniverses(true);
	}
	async function selectUniverse(universe) {
		state.selectedUniverse = universe;
		console.log("选择宇宙:", universe.name);
		try {
			const api = initializeApiServices();
			const portalService = api.getPortalService();
			await portalService.recordUniverseVisit(universe.id, "portal");
		} catch (error) {
			console.warn("记录宇宙访问失败:", error);
		}
	}
	function getUniverseNavigationPath(universeId) {
		const id = String(universeId);
		return navigationConfig[id] || "/";
	}
	function isUniverseAccessible(universe) {
		return universe.status === "active";
	}
	async function checkUniverseAccessPermission(universeId) {
		try {
			const api = initializeApiServices();
			const portalService = api.getPortalService();
			return await portalService.checkUniverseAccess(universeId);
		} catch (error) {
			console.warn("检查宇宙访问权限失败:", error);
			const universe = findUniverseById(universeId);
			return {
				accessible: universe ? isUniverseAccessible(universe) : false,
				reason: universe?.status !== "active" ? `宇宙状态：${getUniverseStatusText(universe?.status || "archived")}` : void 0
			};
		}
	}
	function getUniverseStatusText(status) {
		const statusMap = {
			active: "已上线",
			developing: "开发中",
			maintenance: "维护中",
			archived: "已归档"
		};
		return statusMap[status] || "未知";
	}
	function findUniverseById(id) {
		return state.universes.find((universe) => universe.id === id);
	}
	function clearError() {
		state.error.hasError = false;
		state.error.message = "";
		state.error.code = void 0;
	}
	function setError(message, code) {
		state.error.hasError = true;
		state.error.message = message;
		state.error.code = code;
	}
	async function retryLoad() {
		clearError();
		return loadUniverses(true);
	}
	function resetPortalState() {
		state.universes = [];
		state.selectedUniverse = void 0;
		clearError();
		console.log("Portal状态已重置");
	}
	function updateUniverse(universeId, updates) {
		const index = state.universes.findIndex((u) => u.id === universeId);
		if (index !== -1) {
			state.universes[index] = {
				...state.universes[index],
				...updates
			};
			console.log("宇宙信息已更新:", universeId, updates);
		}
	}
	function addUniverse(universe) {
		const exists = state.universes.some((u) => u.id === universe.id);
		if (!exists) {
			state.universes.push(universe);
			console.log("新宇宙已添加:", universe.name);
		}
	}
	function isDataStale() {
		return state.universes.length === 0;
	}
	async function preloadUniverseData() {
		console.log("[Portal] 预加载宇宙数据开始, isDataStale:", isDataStale(), "currentLoading:", state.loading);
		if (isDataStale()) {
			console.log("[Portal] 数据过期，开始加载");
			await loadUniverses();
		} else {
			console.log("[Portal] 数据新鲜，确保loading状态正确");
			if (state.loading && state.universes.length > 0) {
				console.log("[Portal] 检测到状态冲突，重置loading状态");
				state.loading = false;
			}
		}
		console.log("[Portal] 预加载完成, finalLoading:", state.loading, "universes:", state.universes.length);
	}
	return {
		state,
		activeUniverses,
		developingUniverses,
		visibleUniverses,
		universeStats,
		hasActiveUniverses,
		isLoading,
		hasError,
		errorMessage,
		loadUniverses,
		refreshUniverses,
		preloadUniverseData,
		selectUniverse,
		getUniverseNavigationPath,
		isUniverseAccessible,
		checkUniverseAccessPermission,
		getUniverseStatusText,
		findUniverseById,
		clearError,
		setError,
		retryLoad,
		resetPortalState,
		updateUniverse,
		addUniverse,
		isDataStale
	};
});

//#endregion
//#region src/modules/portal/views/UniversePortal.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = { class: "universe-portal" };
const _hoisted_2 = { class: "universes-container" };
const _hoisted_3 = {
	key: 3,
	class: "universes-grid"
};
const _hoisted_4 = { class: "site-footer" };
const _hoisted_5 = { class: "copyright" };
var UniversePortal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "UniversePortal",
	setup(__props) {
		const router = useRouter();
		const portalStore = usePortalStore();
		const showToast = ref(false);
		const toastMessage = ref("");
		const toastType = ref("info");
		const currentYear = computed(() => (/* @__PURE__ */ new Date()).getFullYear());
		const loading = computed(() => portalStore.isLoading);
		const error = computed(() => ({
			hasError: portalStore.hasError,
			message: portalStore.errorMessage
		}));
		const universes = computed(() => portalStore.visibleUniverses);
		const showToastMessage = (message, type = "info") => {
			toastMessage.value = message;
			toastType.value = type;
			showToast.value = true;
		};
		const navigateToUniverse = async (universe) => {
			await portalStore.selectUniverse(universe);
			if (!portalStore.isUniverseAccessible(universe)) {
				const statusMessages = {
					developing: `${universe.name} 正在紧张开发中，敬请期待！🚧`,
					maintenance: `${universe.name} 正在维护升级，请稍后再来～🔧`,
					archived: `${universe.name} 已暂时下线，感谢您的关注！📦`
				};
				const message = statusMessages[universe.status] || `${universe.name} 暂时无法访问`;
				showToastMessage(message, "info");
				return;
			}
			const navigationPath = portalStore.getUniverseNavigationPath(universe.id);
			showToastMessage(`正在进入 ${universe.name}～`, "success");
			router.push(navigationPath);
		};
		onMounted(async () => {
			await portalStore.preloadUniverseData();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[3] || (_cache[3] = createBaseVNode("header", { class: "portal-header" }, [createBaseVNode("h1", { class: "portal-title" }, "陆家花园"), createBaseVNode("p", { class: "portal-subtitle" }, "诗歌宇宙的探索入口")], -1)),
				createBaseVNode("main", _hoisted_2, [loading.value ? (openBlock(), createBlock(unref(LoadingSpinner_default), {
					key: 0,
					message: "正在加载宇宙列表...",
					size: "large"
				})) : error.value.hasError ? (openBlock(), createBlock(unref(ErrorState_default), {
					key: 1,
					message: error.value.message,
					onRetry: unref(portalStore).retryLoad
				}, null, 8, ["message", "onRetry"])) : universes.value.length === 0 ? (openBlock(), createBlock(unref(EmptyState_default), {
					key: 2,
					title: "暂无可用宇宙",
					description: "目前还没有已上线的宇宙项目，请稍后再来探索吧～",
					icon: "🌌",
					"show-action": true,
					"action-text": "刷新列表",
					onAction: unref(portalStore).refreshUniverses
				}, null, 8, ["onAction"])) : (openBlock(), createElementBlock("div", _hoisted_3, [(openBlock(true), createElementBlock(Fragment, null, renderList(universes.value, (universe, index) => {
					return openBlock(), createBlock(unref(UniverseCard_default), {
						key: universe.id,
						universe,
						index,
						onClick: navigateToUniverse,
						onEnter: navigateToUniverse
					}, null, 8, ["universe", "index"]);
				}), 128))]))]),
				createBaseVNode("footer", _hoisted_4, [
					createBaseVNode("p", _hoisted_5, "© " + toDisplayString(currentYear.value) + " 陆家花园", 1),
					_cache[1] || (_cache[1] = createBaseVNode("a", {
						href: "https://beian.miit.gov.cn",
						target: "_blank",
						rel: "noopener noreferrer",
						class: "beian-link icp-beian"
					}, " 沪ICP备2025147783号 ", -1)),
					_cache[2] || (_cache[2] = createBaseVNode("a", {
						href: "https://www.beian.gov.cn/portal/registerSystemInfo",
						target: "_blank",
						rel: "noopener noreferrer",
						class: "beian-link police-beian"
					}, " 沪公网安备31010702009727号 ", -1))
				]),
				showToast.value ? (openBlock(), createBlock(unref(NotificationToast_default), {
					key: 0,
					message: toastMessage.value,
					type: toastType.value,
					duration: 3e3,
					onClose: _cache[0] || (_cache[0] = ($event) => showToast.value = false)
				}, null, 8, ["message", "type"])) : createCommentVNode("", true)
			]);
		};
	}
});

//#endregion
//#region src/modules/portal/views/UniversePortal.vue
var UniversePortal_default = /* @__PURE__ */ __plugin_vue_export_helper_default(UniversePortal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9a2c25ee"]]);

//#endregion
export { UniversePortal_default as default };