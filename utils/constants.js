/**
 * 常量定义
 * 与 Android 版本保持一致
 */

// 日历类型
export const CalendarType = {
	SOLAR: 'solar',   // 公历
	LUNAR: 'lunar'    // 农历
}

// 内置分类
export const BuiltInCategories = {
	ALL: {
		id: 'all',
		displayName: '全部',
		icon: 'apps',
		isBuiltIn: true
	},
	BIRTHDAY: {
		id: 'birthday',
		displayName: '生日',
		icon: 'cake',
		isBuiltIn: true
	}
}

// 图标颜色
export const IconColor = {
	ROSE: 'rose',      // 红色 - 恋爱/结婚
	PURPLE: 'purple',  // 紫色 - 生日
	BLUE: 'blue',      // 蓝色 - 宝宝/出生
	GRAY: 'gray',      // 灰色 - 已结束/忌日
	ORANGE: 'orange',  // 橙色 - 其他
	GREEN: 'green'     // 绿色 - 其他
}

// 提醒天数选项
export const ReminderDays = {
	TODAY: 0,      // 当天
	ONE_DAY: 1,    // 提前1天
	THREE_DAYS: 3, // 提前3天
	ONE_WEEK: 7    // 提前1周
}

// 提醒天数显示文本
export const ReminderDaysLabels = {
	0: '当天',
	1: '提前1天',
	3: '提前3天',
	7: '提前1周'
}

// 存储键
export const StorageKeys = {
	ANNIVERSARIES: 'anniversaries',
	CUSTOM_CATEGORIES: 'custom_categories'
}

// 分类图标列表
// 使用 lime-icon 组件，来源：https://icones.js.org/collection/material-symbols
export const CategoryIcons = [
	{ name: 'cake', value: 'cake', label: '蛋糕', iconName: 'material-symbols:cake-outline' },
	{ name: 'favorite', value: 'favorite', label: '爱心', iconName: 'material-symbols:favorite-outline' },
	{ name: 'celebration', value: 'celebration', label: '庆祝', iconName: 'material-symbols:celebration-outline' },
	{ name: 'home', value: 'home', label: '家', iconName: 'material-symbols:home-outline' },
	{ name: 'car', value: 'car', label: '汽车', iconName: 'material-symbols:directions-car-outline' },
	{ name: 'book', value: 'book', label: '学习', iconName: 'material-symbols:book-ribbon-outline' },
	{ name: 'flag', value: 'flag', label: '标记', iconName: 'material-symbols:flag-outline' },
	{ name: 'trophy', value: 'trophy', label: '奖杯', iconName: 'material-symbols:workspace-premium-outline' }
]

// 图标到 lime-icon name 的映射
export const IconLimeNameMap = {
	cake: 'material-symbols:cake-outline',
	favorite: 'material-symbols:favorite-outline',
	celebration: 'material-symbols:celebration-outline',
	home: 'material-symbols:home-outline',
	car: 'material-symbols:directions-car-outline',
	book: 'material-symbols:book-ribbon-outline',
	flag: 'material-symbols:flag-outline',
	trophy: 'material-symbols:workspace-premium-outline',
	apps: 'material-symbols:apps-outline'
}

// 获取图标的 lime-icon name
export function getIconLimeName(iconType) {
	return IconLimeNameMap[iconType] || 'material-symbols:favorite-outline'
}

// 获取图标的 emoji 表示
export function getIconEmoji(iconType) {
	return IconEmojiMap[iconType] || '♥'
}

// 获取图标的 uni-icons type
export function getIconUniType(iconType) {
	return IconUniTypeMap[iconType] || 'heart-filled'
}

// 农历月份名称
export const LunarMonthNames = [
	'正月', '二月', '三月', '四月', '五月', '六月',
	'七月', '八月', '九月', '十月', '冬月', '腊月'
]

// 农历日名称
export const LunarDayNames = [
	'初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
	'十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
	'廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

// 数字转中文
export const ChineseNumbers = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
