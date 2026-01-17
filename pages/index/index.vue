<template>
	<view class="page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部欢迎区域 -->
		<view class="top-bar">
			<view class="welcome-section">
				<text class="welcome-text">欢迎回来，</text>
				<text class="title-text">我的纪念日</text>
			</view>
			<view class="add-btn" @click="handleAdd">
				<l-icon name="material-symbols:add" :size="24" color="#ee2b5b"></l-icon>
			</view>
		</view>

		<!-- 分类筛选器 -->
		<scroll-view class="category-filter" scroll-x show-scrollbar="false">
			<view class="filter-list">
				<view
					class="filter-chip"
					:class="{ active: selectedCategory?.id === category.id }"
					v-for="category in allCategories"
					:key="category.id"
					@click="selectCategory(category)"
					@longpress="handleCategoryLongPress(category)"
				>
					<text class="chip-text">{{ category.displayName }}</text>
				</view>
				<!-- 添加分类按钮 -->
				<view class="add-category-btn" @click="showAddCategory">
					<l-icon name="material-symbols:add" :size="18" color="#ee2b5b"></l-icon>
				</view>
			</view>
		</scroll-view>

		<!-- 纪念日列表 -->
		<scroll-view class="anniversary-list" scroll-y>
			<!-- 空状态 -->
			<view v-if="isEmpty" class="empty-state-wrapper">
				<view class="empty-state">
					<text class="empty-title">还没有纪念日</text>
					<text class="empty-hint">点击右上角的 + 按钮添加第一个纪念日</text>
				</view>
			</view>

			<!-- 列表项 -->
			<view v-else class="list-items">
				<view
					class="anniversary-item"
					v-for="item in filteredAnniversaries"
					:key="item.id"
					@click="handleEdit(item)"
				>
					<view class="item-left">
						<view class="item-icon">
							<l-icon :name="getIconLimeName(item.icon)" :size="24" color="#ee2b5b"></l-icon>
						</view>
						<view class="item-info">
							<text class="item-title">{{ item.title }}</text>
							<view class="item-meta">
								<!-- 公历/农历标签 -->
								<view class="calendar-tag" :class="item.calendarType">
									<text class="tag-text">{{ item.calendarType === 'solar' ? '公历' : '农历' }}</text>
								</view>
								<text class="item-date">{{ formattedDate(item) }}</text>
								<text v-if="item.status?.isUpcoming && item.status?.daysRemaining !== null" class="days-remaining">
									{{ item.status.daysRemaining === 0 ? '今天' : item.status.daysRemaining + '天后' }}
								</text>
							</view>
							<!-- 农历调整说明 -->
							<view v-if="item.lunarAdjustmentNote" class="adjustment-note">
								<text class="note-icon">ℹ</text>
								<text class="note-text">{{ item.lunarAdjustmentNote }}</text>
							</view>
						</view>
					</view>
					<view class="item-right">
						<!-- 年龄/年数显示 -->
						<text v-if="item.yearsText" class="years-text">{{ item.yearsText }}</text>
						<text v-else-if="item.status?.isMilestone && item.status?.milestoneDays" class="years-text">
							第{{ item.status.milestoneDays }}天
						</text>
						<text v-else-if="!item.status?.isUpcoming" class="years-text ended">已结束</text>

						<!-- 通知图标 -->
						<view class="notification-btn" @click.stop="toggleNotification(item.id)">
							<l-icon
								:name="item.hasNotification && canNotify(item) ? 'material-symbols:notifications-active-outline' : 'material-symbols:notifications-outline'"
								:size="20"
								:color="item.hasNotification && canNotify(item) ? '#ee2b5b' : '#999'"
							></l-icon>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 添加分类对话框 - 底部抽屉式 -->
		<view class="drawer-mask" v-if="showAddCategoryDialog" @click="showAddCategoryDialog = false">
			<view class="drawer-content" :class="{ 'input-focused': isInputFocused }" @click.stop>
				<view class="modal-header">
					<text class="modal-title">添加分类</text>
				</view>
				<view class="modal-body">
					<!-- 分类名称输入 -->
					<view class="input-section">
						<input
							class="category-input"
							type="text"
							placeholder="分类名称（最多10个字）"
							v-model="newCategoryName"
							maxlength="10"
							placeholder-class="input-placeholder"
							:adjust-position="true"
							@focus="handleInputFocus"
							@blur="handleInputBlur"
						/>
					</view>

					<!-- 图标选择 -->
					<view class="icon-section">
						<text class="icon-section-title">选择图标</text>
						<view class="icon-grid">
							<view
								class="icon-item"
								:class="{ selected: newCategoryIcon === icon.value }"
								v-for="icon in iconList"
								:key="icon.value"
								@click="newCategoryIcon = icon.value"
							>
								<view class="icon-circle">
									<l-icon :name="icon.iconName" :size="24" :color="newCategoryIcon === icon.value ? '#ee2b5b' : '#181113'"></l-icon>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<button class="btn-modal-cancel" @click="showAddCategoryDialog = false">取消</button>
					<button class="btn-modal-confirm" :disabled="!newCategoryName" @click="handleAddCategory">确定</button>
				</view>
			</view>
		</view>

		<!-- 删除分类确认对话框 - 底部抽屉式 -->
		<view class="drawer-mask" v-if="showDeleteCategoryDialog" @click="showDeleteCategoryDialog = false">
			<view class="drawer-content drawer-small" @click.stop>
				<view class="modal-header">
					<text class="modal-title">删除分类</text>
				</view>
				<view class="modal-body">
					<text class="modal-text">确定要删除「{{ categoryToDelete?.displayName }}」分类吗？该分类下的所有纪念日将自动迁移到「生日」分类。</text>
				</view>
				<view class="modal-footer modal-footer-buttons">
					<button class="btn-modal-cancel" @click="showDeleteCategoryDialog = false">取消</button>
					<button class="btn-modal-confirm-delete" @click="handleDeleteCategory">删除</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAnniversaryStore } from '../../store/index.js'
import { BuiltInCategories, CategoryIcons, getIconLimeName } from '../../utils/constants.js'
import { formatDateDisplayByCalendar, getYearsText } from '../../utils/dateUtils.js'

const store = useAnniversaryStore()

// 状态栏高度
const statusBarHeight = ref(0)
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 0

// 弹窗状态
const showAddCategoryDialog = ref(false)
const showDeleteCategoryDialog = ref(false)
const categoryToDelete = ref(null)
const isInputFocused = ref(false)

// 新分类数据
const newCategoryName = ref('')
const newCategoryIcon = ref('favorite')

// 图标列表
const iconList = CategoryIcons

// 计算属性
const allCategories = computed(() => store.allCategories)
const selectedCategory = computed(() => store.selectedCategory)
const isEmpty = computed(() => store.isEmpty)
const customCategories = computed(() => store.customCategories)
const filteredAnniversaries = computed(() => {
	const items = store.filteredAnniversaries
	// 计算年龄/年数文本
	return items.map(item => ({
		...item,
		yearsText: getYearsText(item)
	}))
})

// 选择分类
function selectCategory(category) {
	store.selectCategory(category)
}

// 分类长按
function handleCategoryLongPress(category) {
	if (!category.isBuiltIn) {
		categoryToDelete.value = category
		showDeleteCategoryDialog.value = true
	}
}

// 显示添加分类
function showAddCategory() {
	newCategoryName.value = ''
	newCategoryIcon.value = 'favorite'
	showAddCategoryDialog.value = true
}

// 添加分类
function handleAddCategory() {
	if (newCategoryName.value.trim()) {
		store.addCustomCategory(newCategoryName.value.trim(), newCategoryIcon.value)
		showAddCategoryDialog.value = false
	}
}

// 输入框获取焦点时的处理
function handleInputFocus() {
	isInputFocused.value = true
}

// 输入框失去焦点时的处理
function handleInputBlur() {
	isInputFocused.value = false
}

// 删除分类
function handleDeleteCategory() {
	if (categoryToDelete.value) {
		store.deleteCustomCategory(categoryToDelete.value.id)
		showDeleteCategoryDialog.value = false
		categoryToDelete.value = null
	}
}

// 格式化日期
function formattedDate(item) {
	return formatDateDisplayByCalendar(
		item.targetDate,
		item.calendarType,
		item.isRecurring
	)
}

// 判断是否可以通知
function canNotify(item) {
	return item.hasNotification && (item.isRecurring || item.status?.isUpcoming)
}

// 切换通知状态
function toggleNotification(id) {
	store.toggleNotification(id)
}

// 添加纪念日
function handleAdd() {
	store.navigateToAdd()
	uni.navigateTo({ url: '/pages/add/add' })
}

// 编辑纪念日
function handleEdit(item) {
	store.navigateToEdit(item.id)
	uni.navigateTo({ url: '/pages/add/add' })
}

// 初始化
onMounted(() => {
	// 刷新数据
	store.loadFromStorage()
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f6f6;
}

.status-bar {
	background-color: #f8f6f6;
	width: 100%;
}

/* 顶部欢迎区域 */
.top-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
}

.welcome-section {
	display: flex;
	flex-direction: column;
}

.welcome-text {
	font-size: 14px;
	color: #6b7280;
	margin-bottom: 4px;
}

.title-text {
	font-size: 20px;
	font-weight: bold;
	color: #181113;
}

.add-btn {
	width: 40px;
	height: 40px;
	background-color: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

/* 分类筛选器 */
.category-filter {
	padding: 0 24px 8px;
	white-space: nowrap;
}

.filter-list {
	display: inline-flex;
	align-items: center;
	gap: 12px;
}

.filter-chip {
	height: 36px;
	padding: 0 16px;
	border-radius: 18px;
	background-color: #ffffff;
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.filter-chip.active {
	background-color: #ee2b5b;
}

.chip-text {
	font-size: 14px;
	color: #6b7280;
}

.filter-chip.active .chip-text {
	color: #ffffff;
	font-weight: bold;
}

.add-category-btn {
	width: 36px;
	height: 36px;
	background-color: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

/* 纪念日列表 */
.anniversary-list {
	flex: 1;
}

/* 空状态容器 - 用于居中 */
.empty-state-wrapper {
	width: 100%;
	display: flex;
	justify-content: center;
	padding-top: 64px;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.empty-icon {
	width: 80px;
	height: 80px;
	background-color: rgba(167, 139, 250, 0.08);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-title {
	font-size: 20px;
	font-weight: bold;
	color: #181113;
	margin-top: 24px;
}

.empty-hint {
	font-size: 16px;
	color: #6b7280;
	margin-top: 8px;
}

/* 列表项 */
.list-items {
	padding: 0 24px 24px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.anniversary-item {
	background-color: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 16px;
	padding: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.item-left {
	display: flex;
	align-items: center;
	flex: 1;
	gap: 16px;
}

.item-icon {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.item-info {
	flex: 1;
}

.item-title {
	font-size: 16px;
	font-weight: bold;
	color: #181113;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-meta {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 4px;
}

.calendar-tag {
	padding: 2px 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.calendar-tag.solar {
	background-color: #fed7aa;
}

.calendar-tag.solar .tag-text {
	color: #c2410c;
}

.calendar-tag.lunar {
	background-color: #c7d2fe;
}

.calendar-tag.lunar .tag-text {
	color: #4338ca;
}

.tag-text {
	font-size: 10px;
	font-weight: bold;
}

.item-date {
	font-size: 12px;
	color: #6b7280;
}

.days-remaining {
	font-size: 12px;
	color: #ee2b5b;
}

/* 调整说明 */
.adjustment-note {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 4px;
}

.note-icon {
	font-size: 12px;
	color: rgba(238, 43, 91, 0.7);
}

.note-text {
	font-size: 11px;
	color: rgba(238, 43, 91, 0.7);
}

/* 右侧区域 */
.item-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
}

.years-text {
	font-size: 18px;
	font-weight: bold;
	color: #ee2b5b;
}

.years-text.ended {
	font-size: 16px;
	color: rgba(0, 0, 0, 0.3);
}

.notification-btn {
	padding: 0;
}

/* 弹窗 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	width: 80%;
	max-height: 70%;
	background-color: #ffffff;
	border-radius: 16px;
	overflow: hidden;
}

.modal-small {
	max-height: none;
}

.modal-header {
	padding: 24px 16px 16px;
	padding-top: 32px;
	border-bottom: 1px solid #e6dbde;
}

.modal-title {
	font-size: 18px;
	font-weight: bold;
	color: #181113;
	text-align: center;
	display: block;
}

.modal-body {
	padding: 0;
	max-height: 400px;
	overflow-y: auto;
}

.modal-text {
	font-size: 16px;
	color: #6b7280;
	line-height: 1.5;
	padding: 16px;
}

.modal-footer {
	padding: 16px;
	padding-left: 16px;
	padding-right: 16px;
	display: flex;
	gap: 12px;
}

.modal-footer-buttons {
	display: flex;
	gap: 12px;
}

.btn-modal-cancel,
.btn-modal-confirm,
.btn-modal-confirm-delete {
	flex: 1;
	height: 44px;
	border-radius: 8px;
	border: none;
	font-size: 16px;
	padding: 0;
	line-height: normal;
	background-color: transparent;
}

/* 移除 uni-app button 默认边框 */
.btn-modal-cancel::after,
.btn-modal-confirm::after,
.btn-modal-confirm-delete::after {
	border: none;
}

.btn-modal-cancel {
	background-color: #f0eeee;
	color: #181113;
}

.btn-modal-confirm {
	background-color: #ee2b5b;
	color: #ffffff;
}

.btn-modal-confirm[disabled] {
	background-color: #ccc;
}

.btn-modal-confirm-delete {
	background-color: #dd524d;
	color: #ffffff;
}

/* 添加分类弹窗 */
.input-section {
	margin-bottom: 8px;
	padding: 0 16px;
	padding-top: 16px;
}

.category-input {
	width: 100%;
	height: 48px;
	background-color: #f0eeee;
	border-radius: 8px;
	padding: 0 16px;
	font-size: 16px;
	box-sizing: border-box;
}

.input-placeholder {
	color: #999;
}

.icon-section {
	margin-top: 16px;
	margin-bottom: 16px;
	padding: 0 16px;
}

.icon-section-title {
	display: block;
	font-size: 14px;
	color: #6b7280;
	margin-bottom: 12px;
}

.icon-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 8px;
	row-gap: 16px;
}

.icon-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.icon-circle {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: transparent;
	border: 2px solid rgba(0, 0, 0, 0.1);
}

.icon-item.selected .icon-circle {
	background-color: rgba(238, 43, 91, 0.1);
	border-color: #ee2b5b;
}

/* 底部抽屉样式 */
.drawer-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
}

.drawer-content {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ffffff;
	border-radius: 16px 16px 0 0;
	padding-bottom: calc(16px + env(safe-area-inset-bottom));
	transform: translateY(0);
	transition: transform 0.3s ease;
	z-index: 1001;
	max-height: 70%;
	display: flex;
	flex-direction: column;
}

/* 输入框聚焦时，抽屉适配键盘 */
.drawer-content.input-focused {
	max-height: 80%;
}

.drawer-small {
	max-height: auto;
}

.drawer-mask:empty + .drawer-content {
	transform: translateY(100%);
}

/* 拖拽指示器 */
.drawer-content::before {
	content: '';
	position: absolute;
	top: 8px;
	left: 50%;
	transform: translateX(-50%);
	width: 36px;
	height: 4px;
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: 2px;
}
</style>
