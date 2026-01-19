<template>
	<view class="add-page">
		<!-- 顶部标题栏 - 固定在状态栏下方 -->
		<view class="top-bar" :style="{ top: statusBarHeight + 'px' }">
			<view class="close-btn" @click="handleBack">
				<l-icon name="material-symbols:close" :size="20" color="#181113"></l-icon>
			</view>
			<text class="page-title">{{ isEditMode ? '更新纪念日' : '添加纪念日' }}</text>
		</view>

		<!-- 表单内容区域 - 从标题栏下方开始 -->
		<scroll-view class="form-content" :style="{ top: totalTopHeight + 'px', border: 'none' }" scroll-y>
			<view class="form-container">
				<!-- 标题输入 -->
				<view class="input-section">
				<text class="section-label">标题</text>
				<input
					class="input-field"
					type="text"
					placeholder="例如：妈妈的生日"
					v-model="formData.title"
					placeholder-class="input-placeholder"
				/>
			</view>

			<!-- 公历/农历切换 -->
			<view class="toggle-section">
				<view
					class="toggle-item"
					:class="{ active: formData.calendarType === 'solar' }"
					@click="formData.calendarType = 'solar'"
				>
					<text>公历</text>
				</view>
				<view
					class="toggle-item"
					:class="{ active: formData.calendarType === 'lunar' }"
					@click="formData.calendarType = 'lunar'"
				>
					<text>农历</text>
				</view>
			</view>

			<!-- 提醒模式切换 -->
			<view class="mode-section">
				<text class="section-label">提醒模式</text>
				<view class="toggle-section">
					<view
						class="toggle-item"
						:class="{ active: formData.isRecurring }"
						@click="formData.isRecurring = true"
					>
						<text>每年重复</text>
					</view>
					<view
						class="toggle-item"
						:class="{ active: !formData.isRecurring }"
						@click="formData.isRecurring = false"
					>
						<text>一次性</text>
					</view>
				</view>
			</view>

			<!-- 日期选择 -->
			<view class="date-section">
				<text class="section-label">{{ formData.isRecurring ? '日期（每年重复）' : '日期（一次性）' }}</text>
				<view class="date-selector" @click="showDatePicker = true">
					<text class="date-text">{{ formattedDate }}</text>
				</view>
			</view>

			<!-- 分类选择 -->
			<view class="category-section">
				<text class="section-label">分类</text>
				<view class="category-selector" @click="showCategoryPicker = true">
					<view class="category-icon-wrapper">
						<l-icon :name="getIconLimeName(selectedCategory?.icon || 'favorite')" :size="24" color="#ee2b5b"></l-icon>
					</view>
					<text class="category-name">{{ selectedCategory?.displayName || '请选择' }}</text>
				</view>
			</view>

			<!-- 提醒设置 -->
			<!-- #ifdef APP-PLUS -->
			<view class="reminder-section" v-if="shouldShowReminder">
				<view class="reminder-header">
					<text class="section-title">提醒设置</text>
				</view>

				<!-- 启用提醒开关 -->
				<view class="reminder-toggle-row">
					<text class="toggle-label">启用提醒</text>
					<view class="switch" :class="{ on: formData.hasNotification }" @click="toggleNotification">
						<view class="switch-thumb"></view>
					</view>
				</view>

				<template v-if="formData.hasNotification">
					<!-- 提醒时间选项 -->
					<view class="reminder-time-section">
						<text class="reminder-hint">提醒时间（至少选一个）</text>
						<view class="reminder-options">
							<view
								class="reminder-option"
								:class="{ selected: reminderDaysSet.has(0) }"
								@click="toggleReminderDay(0)"
							>
								<text>当天</text>
							</view>
							<view
								class="reminder-option"
								:class="{ selected: reminderDaysSet.has(1) }"
								@click="toggleReminderDay(1)"
							>
								<text>提前1天</text>
							</view>
							<view
								class="reminder-option"
								:class="{ selected: reminderDaysSet.has(3) }"
								@click="toggleReminderDay(3)"
							>
								<text>提前3天</text>
							</view>
							<view
								class="reminder-option"
								:class="{ selected: reminderDaysSet.has(7) }"
								@click="toggleReminderDay(7)"
							>
								<text>提前1周</text>
							</view>
						</view>
					</view>

					<!-- 精确时间选择 - picker-view 内联滚轮，始终显示 -->
					<view class="time-picker-section">
						<picker-view
							class="time-picker-view"
							indicator-style="height: 50px;"
							:value="pickerValue"
							@change="onPickerChange"
						>
							<picker-view-column>
								<view class="picker-item" v-for="(item, index) in hours" :key="index">
									<text class="picker-text">{{ item }}时</text>
								</view>
							</picker-view-column>
							<picker-view-column>
								<view class="picker-item" v-for="(item, index) in minutes" :key="index">
									<text class="picker-text">{{ item }}分</text>
								</view>
							</picker-view-column>
						</picker-view>
					</view>
				</template>
			</view>
			<!-- #endif -->
		</view>
	</scroll-view>

		<!-- 底部按钮 -->
		<view class="bottom-buttons">
			<view v-if="isEditMode" class="button-row">
				<button class="btn btn-delete" @click="showDeleteDialog = true">删除</button>
				<button class="btn btn-primary" :disabled="!formData.title" @click="handleSave">保存</button>
			</view>
			<button v-else class="btn btn-primary" :disabled="!formData.title" @click="handleSave">保存纪念日</button>
		</view>

		<!-- 日期选择弹窗 -->
		<CalendarPicker
			:show="showDatePicker"
			:selectedDate="formData.targetDate"
			:isRecurring="formData.isRecurring"
			@confirm="onDateConfirm"
			@close="showDatePicker = false"
		/>

		<!-- 分类选择弹窗 - 底部抽屉式 -->
		<view class="drawer-mask" v-if="showCategoryPicker" @click="showCategoryPicker = false">
			<view class="drawer-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择分类</text>
				</view>
				<scroll-view class="category-list" scroll-y>
					<view
						class="category-item"
						:class="{ selected: item.id === selectedCategory?.id }"
						v-for="item in availableCategories"
						:key="item.id"
						@click="selectCategory(item)"
					>
						<view class="category-icon-wrapper">
							<l-icon :name="getIconLimeName(item.icon)" :size="28" :color="item.id === selectedCategory?.id ? '#ee2b5b' : '#181113'"></l-icon>
						</view>
						<text class="category-item-name">{{ item.displayName }}</text>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<button class="btn-modal-close" @click="showCategoryPicker = false">关闭</button>
				</view>
			</view>
		</view>

		<!-- 删除确认弹窗 - 底部抽屉式 -->
		<view class="drawer-mask" v-if="showDeleteDialog" @click="showDeleteDialog = false">
			<view class="drawer-content drawer-small" @click.stop>
				<view class="modal-header">
					<text class="modal-title">确认删除</text>
				</view>
				<view class="modal-body">
					<text class="modal-text">确定要删除这个纪念日吗？此操作无法撤销。</text>
				</view>
				<view class="modal-footer modal-footer-buttons">
					<button class="btn-modal-cancel" @click="showDeleteDialog = false">取消</button>
					<button class="btn-modal-confirm" @click="handleDelete">删除</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAnniversaryStore } from '../../store/index.js'
import { CalendarType, BuiltInCategories, getIconLimeName } from '../../utils/constants.js'
import { formatDateDisplayByCalendar } from '../../utils/dateUtils.js'
import CalendarPicker from '../../components/CalendarPicker/CalendarPicker.vue'

const store = useAnniversaryStore()

// 状态栏高度（包含安全区）
const statusBarHeight = ref(0)
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 0

// 顶部栏总高度（状态栏 + 标题栏）
const topBarHeight = 56 // 标题栏固定高度
const totalTopHeight = computed(() => statusBarHeight.value + topBarHeight)

// 表单数据
const formData = ref({
	title: '',
	targetDate: new Date().toISOString(),
	calendarType: CalendarType.SOLAR,
	isRecurring: true,
	hasNotification: true,
	reminderHour: 9,
	reminderMinute: 0,
	isPm: false
})

// 非 APP-PLUS 平台隐藏提醒功能：新建默认关闭通知（编辑模式会保留原值，不主动改写）
// #ifndef APP-PLUS
formData.value.hasNotification = false
// #endif

// 提醒天数集合
const reminderDaysSet = ref(new Set([1]))

// picker-view 数据
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const pickerValue = ref([9, 0]) // 默认 09:00

// 弹窗状态
const showDatePicker = ref(false)
const showCategoryPicker = ref(false)
const showDeleteDialog = ref(false)

// 选中的分类
const selectedCategory = ref(BuiltInCategories.BIRTHDAY)

// 是否为编辑模式
const isEditMode = computed(() => !!store.editingAnniversary)

// 格式化日期显示
const formattedDate = computed(() => {
	return formatDateDisplayByCalendar(
		formData.value.targetDate,
		formData.value.calendarType,
		formData.value.isRecurring
	)
})

// 是否显示提醒设置
const shouldShowReminder = computed(() => {
	return formData.value.isRecurring || new Date(formData.value.targetDate) > new Date()
})

// 时间选择器的值
const timeValue = computed(() => {
	return `${String(formData.value.reminderHour).padStart(2, '0')}:${String(formData.value.reminderMinute).padStart(2, '0')}`
})

// 时间显示
const timeDisplay = computed(() => {
	const hour = formData.value.reminderHour
	const minute = formData.value.reminderMinute
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
})

// 可用分类
const availableCategories = computed(() => {
	return store.allCategories.filter(c => c.id !== 'all')
})

// 切换通知状态
function toggleNotification() {
	formData.value.hasNotification = !formData.value.hasNotification
}

// 切换提醒天数
function toggleReminderDay(day) {
	if (reminderDaysSet.value.has(day)) {
		// 至少保留一个
		if (reminderDaysSet.value.size > 1) {
			reminderDaysSet.value.delete(day)
		}
	} else {
		reminderDaysSet.value.add(day)
	}
}

// 时间变化（保留给可能的将来使用）
function onTimeChange(e) {
	const [hour, minute] = e.detail.value.split(':').map(Number)
	formData.value.reminderHour = hour
	formData.value.reminderMinute = minute
}

// picker-view 变化
function onPickerChange(e) {
	const [hourIndex, minuteIndex] = e.detail.value
	pickerValue.value = [hourIndex, minuteIndex]
	formData.value.reminderHour = parseInt(hours[hourIndex])
	formData.value.reminderMinute = parseInt(minutes[minuteIndex])
}

// 日期确认
function onDateConfirm(date) {
	if (date instanceof Date) {
		formData.value.targetDate = date.toISOString()
	} else if (typeof date === 'string') {
		formData.value.targetDate = new Date(date).toISOString()
	}
	showDatePicker.value = false
}

// 选择分类
function selectCategory(category) {
	selectedCategory.value = category
	showCategoryPicker.value = false
}

// 返回
function handleBack() {
	store.navigateToList()
	uni.navigateBack()
}

// 保存
async function handleSave() {
	if (!formData.value.title) return

	const reminderDaysStr = Array.from(reminderDaysSet.value).sort((a, b) => a - b).join(',')

	await store.saveAnniversary({
		...formData.value,
		reminderDaysStr,
		category: selectedCategory.value,
		icon: selectedCategory.value.icon
	})

	uni.navigateBack()
}

// 删除
async function handleDelete() {
	if (store.editingAnniversary) {
		await store.deleteAnniversary(store.editingAnniversary.id)
	}
	showDeleteDialog.value = false
	uni.navigateBack()
}

// 初始化
onMounted(() => {
	// 获取状态栏高度
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 0

	// 如果是编辑模式，加载现有数据
	if (store.editingAnniversary) {
		const data = store.editingAnniversary
		formData.value = {
			title: data.title,
			targetDate: data.targetDate,
			calendarType: data.calendarType,
			isRecurring: data.isRecurring,
			hasNotification: data.hasNotification,
			reminderHour: data.reminderHour,
			reminderMinute: data.reminderMinute,
			isPm: data.isPm
		}
		selectedCategory.value = data.category || BuiltInCategories.BIRTHDAY
		reminderDaysSet.value = new Set(data.reminderDaysStr?.split(',').map(Number) || [1])
		// 初始化 pickerValue
		pickerValue.value = [data.reminderHour || 9, data.reminderMinute || 0]
	} else {
		// 新建模式，使用默认值
		pickerValue.value = [formData.value.reminderHour, formData.value.reminderMinute]
	}
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.add-page {
	position: relative;
	height: 100vh;
	background-color: #f8f6f6;
	border: none;
}

/* 顶部标题栏 - 固定定位 */
.top-bar {
	position: fixed;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 56px;
	padding: 0 20px;
	background-color: #f8f6f6;
	z-index: 100;
	border: none !important;
	box-shadow: none !important;
	border-bottom: none !important;
}

.close-btn {
	position: absolute;
	left: 20px;
	width: 40px;
	height: 40px;
	background-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.page-title {
	font-size: 18px;
	font-weight: bold;
	color: #181113;
}

/* 表单内容 - 绝对定位，从标题栏下方开始 */
.form-content {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	/* top 通过内联样式动态设置 */
	border: none !important;
	outline: none !important;
	box-shadow: none !important;
	background-color: #f8f6f6;
}

.form-content::before,
.form-content::after {
	display: none !important;
}

/* 深度选择器 - 移除 scroll-view 内部可能的边框 */
::v-deep .form-content {
	border: none !important;
}

::v-deep scroll-view {
	border: none !important;
	border-top: none !important;
}

.form-container {
	width: 100%;
	padding: 16px 20px;
	padding-bottom: 100px; /* 为底部按钮留出空间 */
	box-sizing: border-box;
	border: none;
	margin: 0;
}

.input-section {
	margin-bottom: 16px;
	border: none !important;
	outline: none !important;
}

.section-label {
	display: block;
	font-size: 14px;
	font-weight: 500;
	color: #181113;
	margin-bottom: 8px;
	padding-left: 4px;
	border: none !important;
}

.input-field {
	width: 100%;
	height: 56px;
	background-color: #ffffff;
	border: 1px solid #e6dbde;
	border-radius: 12px;
	padding: 0 16px;
	font-size: 16px;
	box-sizing: border-box;
}

.input-placeholder {
	color: #999;
}

/* 切换按钮组 */
.toggle-section {
	display: flex;
	height: 48px;
	background-color: #f0eeee;
	border-radius: 12px;
	padding: 4px;
	margin-bottom: 16px;
}

.toggle-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	font-size: 14px;
	color: #6b7280;
	transition: all 0.2s;
}

.toggle-item.active {
	background-color: #ffffff;
	color: #181113;
	font-weight: bold;
}

.mode-section {
	margin-bottom: 16px;
}

/* 日期选择 */
.date-section {
	margin-bottom: 16px;
}

.date-selector {
	height: 56px;
	background-color: #ffffff;
	border: 1px solid #e6dbde;
	border-radius: 12px;
	display: flex;
	align-items: center;
	padding: 0 16px;
}

.date-text {
	font-size: 16px;
	color: #181113;
}

/* 分类选择 */
.category-section {
	margin-bottom: 16px;
}

.category-selector {
	height: 56px;
	background-color: #ffffff;
	border: 1px solid #e6dbde;
	border-radius: 12px;
	display: flex;
	align-items: center;
	padding: 0 16px;
	gap: 12px;
}

.category-icon-wrapper {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.category-name {
	font-size: 16px;
	color: #181113;
}

/* 提醒设置 */
.reminder-section {
	margin-top: 16px;
	border-top: 1px solid #e6dbde;
	padding-top: 16px;
}

.reminder-header {
	margin-bottom: 16px;
}

.section-title {
	font-size: 18px;
	font-weight: bold;
	color: #181113;
}

.reminder-toggle-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 48px;
	padding: 0 16px;
}

.toggle-label {
	font-size: 16px;
	color: #181113;
}

.switch {
	width: 51px;
	height: 31px;
	background-color: #e5e5e5;
	border-radius: 31px;
	position: relative;
	transition: background-color 0.2s;
}

.switch.on {
	background-color: #ee2b5b;
}

.switch-thumb {
	width: 23px;
	height: 23px;
	background-color: #ffffff;
	border-radius: 50%;
	position: absolute;
	top: 4px;
	left: 4px;
	transition: left 0.2s;
}

.switch.on .switch-thumb {
	left: 24px;
}

/* 提醒时间选项 */
.reminder-time-section {
	margin-top: 12px;
	padding: 0 16px;
}

.reminder-hint {
	display: block;
	font-size: 13px;
	color: #6b7280;
	margin-bottom: 12px;
}

.reminder-options {
	display: flex;
	gap: 8px;
}

.reminder-option {
	flex: 1;
	height: 36px;
	border-radius: 8px;
	background-color: #f0eeee;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	color: #6b7280;
}

.reminder-option.selected {
	background-color: rgba(238, 43, 91, 0.1);
	border: 1px solid rgba(238, 43, 91, 0.2);
	color: #ee2b5b;
	font-weight: bold;
}

/* 时间选择器 */
.time-picker-section {
	padding: 0 16px;
	margin-top: 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.time-label {
	display: block;
	font-size: 13px;
	color: #6b7280;
	margin-bottom: 12px;
}

.time-picker-view {
	height: 150px;
	width: 50%;
	background-color: #f0eeee;
	border-radius: 12px;
	overflow: hidden;
}

.picker-item {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 50px;
}

.picker-text {
	font-size: 18px;
	color: #181113;
}

.time-picker {
	height: 48px;
	display: flex;
	align-items: center;
}

/* 底部按钮 - 固定在底部 */
.bottom-buttons {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #f8f6f6;
	padding: 16px 20px;
	padding-bottom: calc(16px + env(safe-area-inset-bottom));
	z-index: 10;
	border: none !important;
}

.button-row {
	display: flex;
	gap: 12px;
}

.btn {
	height: 56px;
	border-radius: 12px;
	font-size: 16px;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	padding: 0;
	line-height: normal;
	background-color: transparent;
}

/* 移除 uni-app button 默认边框 */
.btn::after {
	border: none;
}

.btn-primary {
	flex: 1;
	background-color: #ee2b5b;
	color: #ffffff;
}

.btn-primary[disabled] {
	background-color: #ccc;
}

.btn-delete {
	flex: 1;
	background-color: #dd524d;
	color: #ffffff;
}

/* 新增模式下，按钮占满宽度 */
.bottom-buttons > .btn-primary {
	width: 100%;
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
	padding: 16px;
}

.modal-text {
	font-size: 16px;
	color: #6b7280;
	text-align: center;
}

.category-list {
	max-height: 300px;
}

.category-item {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	gap: 12px;
}

.category-item.selected {
	background-color: rgba(238, 43, 91, 0.1);
}

.category-icon-wrapper {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.category-item-name {
	font-size: 16px;
	color: #181113;
}

.category-item.selected .category-item-name {
	color: #ee2b5b;
	font-weight: bold;
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

.drawer-small {
	max-height: auto;
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

.modal-footer {
	padding: 16px;
	border-top: 1px solid #e6dbde;
}

.modal-footer-buttons {
	display: flex;
	gap: 12px;
}

.btn-modal-close {
	width: 100%;
	height: 44px;
	background-color: #f0eeee;
	color: #181113;
	border-radius: 8px;
	border: none;
	font-size: 16px;
}

.btn-modal-cancel {
	flex: 1;
	height: 44px;
	background-color: #f0eeee;
	color: #181113;
	border-radius: 8px;
	border: none;
	font-size: 16px;
}

.btn-modal-confirm {
	flex: 1;
	height: 44px;
	background-color: #ee2b5b;
	color: #ffffff;
	border-radius: 8px;
	border: none;
	font-size: 16px;
}

/* 移除 uni-app button 默认边框 */
.btn-modal-close::after,
.btn-modal-cancel::after,
.btn-modal-confirm::after {
	border: none;
}

/* 移除可能导致问题的边框 - 只针对容器元素 */
.add-page,
.form-content,
.form-container,
.input-section,
.section-label,
.toggle-section,
.toggle-item,
.mode-section,
.date-section,
.category-section,
.reminder-section,
.time-section,
.bottom-buttons,
.button-row {
	border-top: none !important;
	border-left: none !important;
	border-right: none !important;
}
</style>
