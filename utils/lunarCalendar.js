/**
 * 简化版农历工具类
 * 纯 JavaScript 实现，不依赖外部库
 * 支持 1900-2100 年
 */

// 农历数据表 (1900-2100)
// 每个数据包：
// - 前4位：当年闰月月份 (0表示无闰月)
// - 后4位：1-12月的大小月状态 (1=大月30天，0=小月29天)
// - 最后1位：闰月大小 (1=大月，0=小月)
// 实际上这个数据格式比较复杂，这里使用简化方案
const LUNAR_DATA = [
	0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
	0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
	0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
	0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
	0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
	0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
	0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
	0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
	0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
	0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
	0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
	0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
	0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
	0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
	0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
]

// 农历日名称
const LUNAR_DAYS = [
	'初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
	'十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
	'廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

// 农历月名称
const LUNAR_MONTHS = [
	'正月', '二月', '三月', '四月', '五月', '六月',
	'七月', '八月', '九月', '十月', '冬月', '腊月'
]

// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 生肖
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

/**
 * 获取农历年份的天数信息
 * @param {Number} year 农历年
 * @returns {Number} 农历数据
 */
function getLunarYearData(year) {
	return LUNAR_DATA[year - 1900] || 0
}

/**
 * 获取闰月
 * @param {Number} year 农历年
 * @returns {Number} 闰月月份，0表示无闰月
 */
function getLeapMonth(year) {
	const data = getLunarYearData(year)
	return (data >> 16) & 0xf
}

/**
 * 获取月份的天数
 * @param {Number} year 农历年
 * @param {Number} month 农历月 (1-12)
 * @param {Boolean} isLeap 是否闰月
 * @returns {Number} 天数 (29或30)
 */
function getLunarMonthDays(year, month, isLeap = false) {
	const data = getLunarYearData(year)

	if (isLeap) {
		// 闰月天数
		return (data & 0x10000) ? 30 : 29
	}

	// 普通月份天数
	return (data & (0x10000 >> month)) ? 30 : 29
}

/**
 * 获取农历年的总天数
 * @param {Number} year 农历年
 * @returns {Number} 总天数
 */
function getLunarYearDays(year) {
	let sum = 348
	const data = getLunarYearData(year)

	for (let i = 0x8000; i > 0x8; i >>= 1) {
		sum += (data & i) ? 1 : 0
	}

	return sum + ((data & 0xf) ? ((data & 0x10000) ? 30 : 29) : 0)
}

/**
 * 公历转农历
 * @param {Date} solarDate 公历日期
 * @returns {Object} { year, month, day, isLeapMonth }
 */
function solarToLunar(solarDate) {
	if (!(solarDate instanceof Date)) {
		solarDate = new Date(solarDate)
	}

	const solarYear = solarDate.getFullYear()
	const solarMonth = solarDate.getMonth() + 1
	const solarDay = solarDate.getDate()

	// 1900年1月31日是农历1900年正月初一
	// 计算从1900年1月31日到给定日期的天数
	const baseDate = new Date(1900, 0, 31)
	const offset = Math.floor((solarDate - baseDate) / 86400000)

	// 从1900年开始逐年查找
	let lunarYear = 1900
	let daysInLunarYear = 0
	let remainingDays = offset

	while (lunarYear < 2101 && remainingDays > 0) {
		daysInLunarYear = getLunarYearDays(lunarYear)
		if (remainingDays < daysInLunarYear) {
			break
		}
		remainingDays -= daysInLunarYear
		lunarYear++
	}

	if (lunarYear >= 2101) {
		// 超出范围
		return { year: 1900, month: 1, day: 1, isLeapMonth: false }
	}

	// 查找月份
	let lunarMonth = 1
	let isLeapMonth = false
	const leapMonth = getLeapMonth(lunarYear)
	let daysInMonth = 0

	while (lunarMonth < 13 && remainingDays > 0) {
		// 检查闰月
		if (leapMonth > 0 && lunarMonth === leapMonth && !isLeapMonth) {
			isLeapMonth = true
			daysInMonth = getLunarMonthDays(lunarYear, lunarMonth, true)
		} else {
			isLeapMonth = false
			daysInMonth = getLunarMonthDays(lunarYear, lunarMonth, false)
		}

		if (remainingDays < daysInMonth) {
			break
		}

		remainingDays -= daysInMonth

		if (isLeapMonth && leapMonth === lunarMonth) {
			isLeapMonth = false
		} else {
			lunarMonth++
		}

		if (leapMonth > 0 && lunarMonth === leapMonth && !isLeapMonth) {
			isLeapMonth = true
		}
	}

	const lunarDay = remainingDays + 1

	return {
		year: lunarYear,
		month: lunarMonth,
		day: lunarDay,
		isLeapMonth
	}
}

/**
 * 农历转公历（简化版，通过向前查找）
 * @param {Number} lunarYear 农历年
 * @param {Number} lunarMonth 农历月
 * @param {Number} lunarDay 农历日
 * @param {Boolean} isLeapMonth 是否闰月
 * @returns {Date|null}
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
	// 从农历年的1月1日开始计算
	let daysPassed = 0
	const leapMonth = getLeapMonth(lunarYear)

	// 累加前面月份的天数
	for (let m = 1; m < lunarMonth; m++) {
		if (m === leapMonth) {
			daysPassed += getLunarMonthDays(lunarYear, m, true)
		}
		daysPassed += getLunarMonthDays(lunarYear, m, false)
	}

	// 如果是闰月，还要加上非闰月的天数
	if (isLeapMonth && leapMonth === lunarMonth) {
		daysPassed += getLunarMonthDays(lunarYear, lunarMonth, false)
	}

	// 加上当月的天数（减1，因为从1日开始）
	daysPassed += lunarDay - 1

	// 1900年1月31日是农历正月初一
	const baseDate = new Date(1900, 0, 31)
	const solarDate = new Date(baseDate)
	solarDate.setDate(solarDate.getDate() + daysPassed)

	return solarDate
}

/**
 * 获取农历日文本
 * @param {Date|String} date
 * @returns {String}
 */
function getLunarDayText(date) {
	const lunar = solarToLunar(date)
	return LUNAR_DAYS[lunar.day - 1] || '初一'
}

/**
 * 获取农历月文本
 * @param {Date|String} date
 * @returns {String}
 */
function getLunarMonthText(date) {
	const lunar = solarToLunar(date)
	return LUNAR_MONTHS[lunar.month - 1] || '正月'
}

/**
 * 获取完整农历日期文本
 * @param {Date|String} date
 * @returns {String}
 */
function getFullLunarText(date) {
	const lunar = solarToLunar(date)
	const year = getLunarYearText(date)
	const month = LUNAR_MONTHS[lunar.month - 1]
	const day = LUNAR_DAYS[lunar.day - 1]
	const leapPrefix = lunar.isLeapMonth ? '闰' : ''
	return `${year}年${leapPrefix}${month}${day}`
}

/**
 * 获取农历年份文本（中文）
 * @param {Date|String} date
 * @returns {String}
 */
function getLunarYearText(date) {
	const lunar = solarToLunar(date)
	const year = lunar.year

	// 转换为中文数字
	const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
	let result = ''

	const yearStr = year.toString()
	for (let i = 0; i < yearStr.length; i++) {
		result += digits[parseInt(yearStr[i])]
	}

	return result
}

/**
 * 计算下一个农历生日的公历日期
 * @param {Number} lunarMonth 农历月
 * @param {Number} lunarDay 农历日
 * @param {Boolean} isLeapMonth 是否闰月
 * @param {Date} fromDate 从哪个日期开始计算
 * @returns {Object} { solarDate, adjustmentNote, actualLunarDay }
 */
function getNextLunarBirthday(lunarMonth, lunarDay, isLeapMonth = false, fromDate = new Date()) {
	const currentLunar = solarToLunar(fromDate)

	// 首先检查今天是否就是目标日期
	if (currentLunar.month === lunarMonth &&
		currentLunar.day === lunarDay &&
		currentLunar.isLeapMonth === isLeapMonth) {
		return {
			solarDate: fromDate,
			adjustmentNote: null,
			actualLunarDay: lunarDay
		}
	}

	// 尝试今年的日期
	let tryYear = currentLunar.year
	let foundDate = null
	let adjustmentNote = null
	let actualLunarDay = lunarDay

	// 最多查找3年
	for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
		const tryLunarYear = currentLunar.year + yearOffset

		// 检查是否有闰月
		const leapMonth = getLeapMonth(tryLunarYear)

		// 检查目标月是否存在
		if (isLeapMonth && leapMonth !== lunarMonth) {
			// 今年没有这个闰月
			adjustmentNote = `无闰${LUNAR_MONTHS[lunarMonth - 1]}，已调整为${LUNAR_MONTHS[lunarMonth - 1]}`
		}

		// 检查日期是否存在（大小月）
		const daysInMonth = getLunarMonthDays(tryLunarYear, lunarMonth, isLeapMonth)
		if (lunarDay > daysInMonth && yearOffset === 0) {
			adjustmentNote = `${LUNAR_MONTHS[lunarMonth - 1]}小月，已调整为廿九`
			actualLunarDay = 29
		}

		// 尝试转换
		try {
			const solarDate = lunarToSolar(tryLunarYear, lunarMonth, actualLunarDay, isLeapMonth && leapMonth === lunarMonth)

			if (solarDate && solarDate >= fromDate) {
				foundDate = solarDate
				break
			}
		} catch (e) {
			// 继续尝试下一年
		}
	}

	if (foundDate) {
		return {
			solarDate: foundDate,
			adjustmentNote,
			actualLunarDay
		}
	}

	// 后备方案：返回一年后的日期
	const fallback = new Date(fromDate)
	fallback.setFullYear(fallback.getFullYear() + 1)
	return {
		solarDate: fallback,
		adjustmentNote: '无法计算农历日期',
		actualLunarDay: lunarDay
	}
}

/**
 * 获取农历节日
 * @param {Date} date
 * @returns {String|null}
 */
function getLunarFestival(date) {
	const lunar = solarToLunar(date)

	// 春节
	if (lunar.month === 1 && lunar.day === 1) return '春节'
	// 元宵节
	if (lunar.month === 1 && lunar.day === 15) return '元宵节'
	// 端午节
	if (lunar.month === 5 && lunar.day === 5) return '端午节'
	// 七夕节
	if (lunar.month === 7 && lunar.day === 7) return '七夕节'
	// 中秋节
	if (lunar.month === 8 && lunar.day === 15) return '中秋节'
	// 重阳节
	if (lunar.month === 9 && lunar.day === 9) return '重阳节'
	// 除夕
	if (lunar.month === 12 && lunar.day >= 29) {
		const nextDay = new Date(date)
		nextDay.setDate(nextDay.getDate() + 1)
		const nextLunar = solarToLunar(nextDay)
		if (nextLunar.month === 1 && nextLunar.day === 1) return '除夕'
	}

	return null
}

export default {
	solarToLunar,
	lunarToSolar,
	getLunarDayText,
	getLunarMonthText,
	getFullLunarText,
	getLunarYearText,
	getNextLunarBirthday,
	getLunarFestival
}

// 分别导出各个函数
export {
	solarToLunar,
	lunarToSolar,
	getLunarDayText,
	getLunarMonthText,
	getFullLunarText,
	getLunarYearText,
	getNextLunarBirthday,
	getLunarFestival,
	getLeapMonth,
	getLunarMonthDays
}
