<script>
	import { useAnniversaryStore } from './store/index.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 初始化：从本地存储加载数据
			const store = useAnniversaryStore()
			store.loadFromStorage()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		background-color: #f8f6f6;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
	}

	/* 主色 */
	.text-primary {
		color: #ee2b5b;
	}

	.bg-primary {
		background-color: #ee2b5b;
	}

	/* 文字颜色 */
	.text-secondary {
		color: #6b7280;
	}

	/* 常用 flex 布局 */
	.flex {
		display: flex;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
	}

	.items-center {
		align-items: center;
	}

	.justify-center {
		justify-content: center;
	}

	.justify-between {
		justify-content: space-between;
	}

	.justify-around {
		justify-content: space-around;
	}

	/* 间距 */
	.p-4 {
		padding: 16rpx;
	}

	.p-8 {
		padding: 32rpx;
	}

	.px-4 {
		padding-left: 16rpx;
		padding-right: 16rpx;
	}

	.py-4 {
		padding-top: 16rpx;
		padding-bottom: 16rpx;
	}

	.mt-2 {
		margin-top: 8rpx;
	}

	.mt-4 {
		margin-top: 16rpx;
	}

	.mb-4 {
		margin-bottom: 16rpx;
	}

	/* 安全区域 */
	.safe-area-top {
		padding-top: constant(safe-area-inset-top);
		padding-top: env(safe-area-inset-top);
	}

	.safe-area-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* 移除 scroll-view 默认边框 */
	scroll-view {
		border: none !important;
		border-top: none !important;
		border-bottom: none !important;
		outline: none !important;
		box-shadow: none !important;
	}
</style>
