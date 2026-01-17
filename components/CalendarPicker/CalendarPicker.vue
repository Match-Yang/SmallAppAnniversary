<template>
	<view class="calendar-drawer-mask" v-if="show" @click="handleClose">
		<view class="calendar-drawer-container" @click.stop>
			<view class="calendar-header">
				<view class="header-btn" @click="prevMonth">
					<text class="arrow">‹</text>
				</view>
				<view class="header-title" @click="showYearPicker = true">
					<text class="title-text">{{ currentYear }}年{{ currentMonth }}月</text>
				</view>
				<view class="header-btn" @click="nextMonth">
					<text class="arrow">›</text>
				</view>
			</view>
			<!-- 日历内容可滚动 -->
			<scroll-view class="calendar-scroll" scroll-y>
				<!-- 农历信息显示 -->
			<view class="lunar-info" v-if="selectedLunarText">
				<text class="lunar-text">{{ selectedLunarText }}</text>
			</view>

			<!-- 星期标题 -->
			<view class="week-header">
				<text class="week-day" v-for="day in weekDays" :key="day">{{ day }}</text>
			</view>

			<!-- 日期网格 -->
			<view class="date-grid">
				<view
					class="date-cell"
					v-for="(cell, index) in dateCells"
					:key="index"
					:class="{
						'is-empty': cell.isEmpty,
						'is-selected': cell.isSelected,
						'is-today': cell.isToday,
						'is-default': cell.isDefault
					}"
					@click="selectDate(cell)"
				>
					<template v-if="!cell.isEmpty">
						<text class="solar-day">{{ cell.day }}</text>
						<text class="lunar-day">{{ cell.lunarDay }}</text>
					</template>
				</view>
			</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="calendar-footer">
				<button class="btn-cancel" @click="handleClose">取消</button>
			</view>
		</view>

		<!-- 年份选择抽屉 -->
		<view class="year-drawer-mask" v-if="showYearPicker" @click="showYearPicker = false">
			<view class="year-drawer-container" @click.stop>
				<view class="year-picker-header">
					<text class="year-picker-title">选择年份</text>
				</view>
				<scroll-view
					class="year-list"
					scroll-y
					:key="yearScrollKey"
					:scroll-into-view="yearScrollIntoView"
					:scroll-with-animation="true"
				>
					<view
						class="year-item"
						:class="{ 'is-selected': year === currentYear }"
						v-for="year in yearList"
						:key="year"
						:id="`year-${year}`"
						@click="selectYear(year)"
					>
						<text class="year-text">{{ year }}年</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getLunarDayText, getFullLunarText, solarToLunar } from '../../utils/lunarCalendar.js'

const props = defineProps({
	// 是否显示
	show: {
		type: Boolean,
		default: false
	},
	// 选中的日期 (Date 或 ISO string)
	selectedDate: {
		type: [Date, String],
		default: null
	},
	// 是否重复模式（只显示月日）
	isRecurring: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['confirm', 'close'])

function normalizeToLocalDate(date) {
	if (date instanceof Date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate())
	}
	const d = new Date(date)
	return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// 当前显示的年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

// 选中的日期
const selectedDateObj = ref(null)

// 记录选中日期所在的年份（用于判断是否切换到了非当前年份）
const selectedYear = ref(new Date().getFullYear())

// 是否显示年份选择器
const showYearPicker = ref(false)
const yearScrollIntoView = ref('')
const yearScrollKey = ref(0)

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 判断选中日期是否在当前浏览的年月中
// - 重复模式：当前年份 = 选中年份 且 月份匹配
// - 非重复模式：年份和月份都匹配
const isSelectedInCurrentMonth = computed(() => {
	if (!selectedDateObj.value) return false
	const sel = selectedDateObj.value

	if (props.isRecurring) {
		// 重复模式：必须是选中日期所在的年份，且月份匹配
		return currentYear.value === selectedYear.value &&
			sel.getMonth() + 1 === currentMonth.value
	}
	// 非重复模式：必须年份和月份都匹配
	return sel.getFullYear() === currentYear.value && sel.getMonth() + 1 === currentMonth.value
})

const lunarDisplayDate = computed(() => {
	if (isSelectedInCurrentMonth.value && selectedDateObj.value) {
		if (props.isRecurring) {
			// 重复模式：显示当前浏览年份的该月该日
			return new Date(currentYear.value, currentMonth.value - 1, selectedDateObj.value.getDate())
		}
		return selectedDateObj.value
	}
	return new Date(currentYear.value, currentMonth.value - 1, 1)
})

// 农历信息显示（与 displayDate 同步）
const selectedLunarText = computed(() => {
	const date = lunarDisplayDate.value
	const fullLunar = getFullLunarText(date)
	const lunarDay = getLunarDayText(date)

	if (fullLunar && lunarDay) {
		return `${fullLunar}（${lunarDay}）`
	}
	return ''
})

// 年份列表
const yearList = computed(() => {
	const currentYear = new Date().getFullYear()
	const years = []
	// 显示前后150年
	for (let i = currentYear - 150; i <= currentYear + 50; i++) {
		years.push(i)
	}
	return years.reverse()
})

// 计算日期单元格
const dateCells = computed(() => {
	const cells = []
	const firstDayOfMonth = new Date(currentYear.value, currentMonth.value - 1, 1)
	const lastDayOfMonth = new Date(currentYear.value, currentMonth.value, 0)
	const daysInMonth = lastDayOfMonth.getDate()

	// 获取第一天是星期几 (0=周日, 1=周一, ...)
	const firstDayOfWeek = firstDayOfMonth.getDay()

	const today = new Date()
	const isCurrentMonth = today.getFullYear() === currentYear.value && today.getMonth() + 1 === currentMonth.value

	// 填充前面的空白
	for (let i = 0; i < firstDayOfWeek; i++) {
		cells.push({ isEmpty: true })
	}

	// 填充日期
	const selected = selectedDateObj.value ? normalizeToLocalDate(selectedDateObj.value) : null
	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(currentYear.value, currentMonth.value - 1, day)
		const localDate = normalizeToLocalDate(date)
		const lunar = solarToLunar(date)
		const lunarDay = getLunarDayText(date)

		// 判断是否选中
		let isSelected = false
		if (selected && props.isRecurring) {
			// 重复模式：只比较月日，但只在选中日期所在的月份显示
			// 如果切换到其他月份，不显示选中状态
			isSelected = isSelectedInCurrentMonth.value &&
				date.getMonth() === selected.getMonth() &&
				date.getDate() === selected.getDate()
		} else if (selected) {
			// 非重复模式：比较本地日期（避免时分秒/时区导致 getTime 不相等）
			isSelected = localDate.getFullYear() === selected.getFullYear() &&
				localDate.getMonth() === selected.getMonth() &&
				localDate.getDate() === selected.getDate()
		}

		// 判断是否是今天
		const isToday = isCurrentMonth && day === today.getDate()

		// 默认灰色高亮：当选中日期不在当前月时，高亮本月1号
		const isDefault = !!selected && !isSelectedInCurrentMonth.value && day === 1

		cells.push({
			day,
			date: localDate,
			isEmpty: false,
			isSelected,
			isToday,
			isDefault,
			lunarDay
		})
	}

	return cells
})

// 上一个月
function prevMonth() {
	if (currentMonth.value === 1) {
		currentYear.value--
		currentMonth.value = 12
	} else {
		currentMonth.value--
	}
}

// 下一个月
function nextMonth() {
	if (currentMonth.value === 12) {
		currentYear.value++
		currentMonth.value = 1
	} else {
		currentMonth.value++
	}
}

// 选择日期
function selectDate(cell) {
	if (cell.isEmpty) return

	selectedDateObj.value = normalizeToLocalDate(cell.date)
	// 点击即确认并关闭（两种模式一致）
	emit('confirm', selectedDateObj.value)
	emit('close')
}

// 选择年份
function selectYear(year) {
	currentYear.value = year
	// 月份保持不变，不需要额外操作
	showYearPicker.value = false
}

// 关闭弹窗
function handleClose() {
	emit('close')
}

// 年份选择器弹出时：使用“强制重建 + 轻微延迟设置锚点”的方式，兼容部分端 scroll-* 首次不生效的问题
watch(showYearPicker, async (visible) => {
	if (!visible) {
		yearScrollIntoView.value = ''
		return
	}

	// 强制重建列表
	yearScrollKey.value++

	// 清空后重新设置，确保触发滚动
	yearScrollIntoView.value = ''
	await nextTick()

	// 延迟设置，确保DOM已更新
	setTimeout(() => {
		yearScrollIntoView.value = `year-${currentYear.value}`
	}, 100)
})

// 弹窗打开期间，如果年份变化（例如点击年份），也同步滚动定位
watch(currentYear, async () => {
	if (!showYearPicker.value) return

	// 清空后重新设置，确保触发滚动
	yearScrollIntoView.value = ''
	await nextTick()

	setTimeout(() => {
		yearScrollIntoView.value = `year-${currentYear.value}`
	}, 50)
})

// 监听 show 变化，初始化选中的日期
watch(() => props.show, (newVal) => {
	if (newVal) {
		if (props.selectedDate) {
			const date = props.selectedDate instanceof Date ?
				props.selectedDate :
				new Date(props.selectedDate)
			const local = normalizeToLocalDate(date)
			selectedDateObj.value = local
			currentYear.value = local.getFullYear()
			currentMonth.value = local.getMonth() + 1
			// 记录选中日期所在的年份
			selectedYear.value = local.getFullYear()
		} else {
			const today = new Date()
			selectedDateObj.value = null
			currentYear.value = today.getFullYear()
			currentMonth.value = today.getMonth() + 1
			selectedYear.value = today.getFullYear()
		}
	}
})

// 初始化
onMounted(() => {
	if (props.selectedDate) {
		const date = props.selectedDate instanceof Date ?
			props.selectedDate :
			new Date(props.selectedDate)
		const local = normalizeToLocalDate(date)
		selectedDateObj.value = local
		currentYear.value = local.getFullYear()
		currentMonth.value = local.getMonth() + 1
		selectedYear.value = local.getFullYear()
	}
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.calendar-drawer-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
}

.calendar-drawer-container {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ffffff;
	border-radius: 16px 16px 0 0;
	padding-bottom: calc(16px + env(safe-area-inset-bottom));
	max-height: 80%;
	display: flex;
	flex-direction: column;
	z-index: 1001;
}

/* 拖拽指示器 */
.calendar-drawer-container::before {
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

.calendar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px 16px 16px;
	padding-top: 32px;
}

.calendar-scroll {
	flex: 1;
	overflow-y: auto;
}

.header-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow {
	font-size: 28px;
	color: #333;
}

.header-title {
	flex: 1;
	text-align: center;
}

.title-text {
	font-size: 18px;
	font-weight: bold;
	color: #181113;
}

.lunar-info {
	text-align: center;
	padding: 0 16px 8px;
}

.lunar-text {
	font-size: 12px;
	color: #6b7280;
}

.week-header {
	display: flex;
	padding: 8px 16px;
}

.week-day {
	flex: 1;
	text-align: center;
	font-size: 12px;
	font-weight: bold;
	color: #6b7280;
}

.date-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4px;
	padding: 0 12px 16px;
}

.date-cell {
	aspect-ratio: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	position: relative;
}

.date-cell:not(.is-empty):active {
	background-color: rgba(238, 43, 91, 0.1);
}

.date-cell.is-default {
	background-color: #f0eeee;
}

.date-cell.is-selected {
	background-color: #ee2b5b;
}

.date-cell.is-today {
	background-color: rgba(238, 43, 91, 0.1);
}

.date-cell.is-selected .solar-day,
.date-cell.is-selected .lunar-day {
	color: #ffffff;
}

.date-cell.is-today .solar-day {
	color: #ee2b5b;
	font-weight: bold;
}

.date-cell.is-today .lunar-day {
	color: #ee2b5b;
}

.solar-day {
	font-size: 16px;
	color: #181113;
	line-height: 1.2;
}

.lunar-day {
	font-size: 8px;
	color: #6b7280;
	line-height: 1;
	margin-top: 2px;
}

.calendar-footer {
	padding: 12px 16px;
	border-top: 1px solid #e6dbde;
}

.btn-cancel {
	width: 100%;
	height: 44px;
	background-color: #f5f5f5;
	border-radius: 8px;
	border: none;
	font-size: 16px;
	color: #333;
}

/* 年份选择器 - 抽屉样式 */
.year-drawer-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1002;
}

.year-drawer-container {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ffffff;
	border-radius: 16px 16px 0 0;
	padding-bottom: calc(16px + env(safe-area-inset-bottom));
	max-height: 50%;
	display: flex;
	flex-direction: column;
	z-index: 1003;
}

/* 拖拽指示器 */
.year-drawer-container::before {
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

.year-picker-header {
	padding: 24px 16px 16px;
	padding-top: 32px;
	border-bottom: 1px solid #e6dbde;
	text-align: center;
}

.year-picker-title {
	font-size: 18px;
	font-weight: bold;
	color: #181113;
}

.year-list {
	height: 400px;
	overflow-y: auto;
}

.year-item {
	padding: 14px 20px;
	text-align: center;
}

.year-item.is-selected {
	background-color: rgba(238, 43, 91, 0.15);
}

.year-text {
	font-size: 18px;
	color: #181113;
}

.year-item.is-selected .year-text {
	color: #ee2b5b;
	font-weight: bold;
}
</style>
