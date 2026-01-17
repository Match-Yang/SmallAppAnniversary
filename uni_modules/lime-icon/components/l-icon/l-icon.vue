<template>
	<!-- 字体图标 -->
	<text 
		v-if="type == 'font'" 
		class="l-icon l-icon--font" 
		:class="[prefixClass, lClass]" 
		:style="[iconStyles, lStyle]"
		@click="handleClick">
		{{ fontIcon && fontIcon.char }}
	</text>

	<!-- 图片图标 -->
	<image 
		v-else-if="type == 'image' && (!parsed.isSvg || !color)" 
		class="l-icon l-icon--image" 
		:class="[lClass]"
		:style="[iconStyles, lStyle]" 
		:src="imageUrl" @click="handleClick">
	</image>

	<!-- SVG图标（包括Iconify和带有颜色的SVG图片） -->
	<l-svg 
		v-else-if="iconifyUrl || (type == 'image' && parsed.isSvg && color)" 
		class="l-icon l-icon--image"
		:class="[lClass]" 
		:style="[iconStyles, lStyle]" 
		:src="iconifyUrl || imageUrl" 
		:color="color" 
		:inherit="inherit"
		:web="web" 
		@click="handleClick">
	</l-svg>
</template>
<script lang="ts">
	// @ts-nocheck
	/**
	 * LimeIcon 图标
	 * @description ICON集
	 * <br> 插件类型：LIconComponentPublicInstance 
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=14057
	 * @property {String} name 图标名称
	 * @property {String} color 颜色
	 * @property {String} size 尺寸
	 * @property {String} prefix 字体图标前缀  
	 * @property {Boolean} inherit 是否继承颜色 
	 * @property {Boolean} web 原生 app(nvue,uvue) 是否使用web渲染  
	 * @event {Function} click 点击事件
	 */

	import { computed, defineComponent, inject } from '@/uni_modules/lime-shared/vue';
	import { addUnit } from '@/uni_modules/lime-shared/addUnit';
	import { useIcon, loadingFonts } from '@/uni_modules/lime-icon';
	import iconProps from './props';
	// #ifdef APP-NVUE
	import iconSrc from '@/uni_modules/lime-icon/hybrid/html/t3.ttf';
	var domModule = weex.requireModule('dom');
	domModule.addRule('fontFace', {
		'fontFamily': "uniicons",
		'src': "url('" + iconSrc + "')"
	});
	// #endif

	const name = 'l-icon';
	export default defineComponent({
		name,
		externalClasses: ['l-class'],
		options: {
			addGlobalClass: true,
			virtualHost: true,
		},
		props: iconProps,
		emits: ['click'],
		setup(props, { emit }) {
			// 使用 useIcon hook 获取图标信息
			const { type, fontIcon, imageUrl, iconifyUrl, parsed } = useIcon(
			computed((): string => props.name), 
			{ prefix: props.prefix },
		);

			// 计算前缀类名 兼容旧版
			const prefixClass = computed(() : string => {
				if (type.value == 'font') {
					return props.prefix || 'l';
				}
				return '';
			});

			// 计算图标样式
			const iconStyles = computed(() => {
				const style = {};
				if (type.value == 'font' && fontIcon.value?.fontFamily) {
					style['font-family'] = fontIcon.value.fontFamily;
				}

				// 设置颜色
				if (props.color && type.value == 'font') {
					style['color'] = props.color;
				}

				// 设置尺寸
				if (props.size) {
					const fontSize = addUnit(props.size);
					if (!fontSize) return style;
					if (type.value == 'font') {
						style['font-size'] = fontSize;
					} else {
						style['height'] = fontSize;
						style['width'] = fontSize;
					}
				}

				// #ifdef VUE2
				// VUE2小程序最后一个值莫名的出现undefined
				style['undefined'] = '';
				// #endif

				return style;
			});

			// 处理点击事件
			const handleClick = () => {
				emit('click');
			};

			return {
				type,
				fontIcon,
				imageUrl,
				iconifyUrl,
				parsed,
				prefixClass,
				iconStyles,
				handleClick
			};
		}
	});
</script>
<style lang="scss">
	@import './index.scss';
</style>