/**
 * 日期工具函数
 * 与 Android 版本 DateUtils.kt 保持一致
 */

import { CalendarType, ReminderDays } from './constants.js'
import { solarToLunar, getLunarDayText, getLunarMonthText, getFullLunarText, getLunarYearText, getNextLunarBirthday } from './lunarCalendar.js'

/**
 * 计算纪念日状态
 * @param {Object} anniversary 纪念日对象
 * @param {Date|String} currentDate 当前日期
 * @returns {Object} { isUpcoming, daysRemaining, isMilestone, milestoneDays }
 */
export function calculateAnniversaryStatus(anniversary, currentDate = new Date()) {
	const current = currentDate instanceof Date ? currentDate : new Date(currentDate)

	if (anniversary.isRecurring) {
		// 重复模式：计算今年或明年的该日期
		const targetDate = getNextRecurringDate(anniversary, current)
		const daysRemaining = daysBetween(current, targetDate)
		const isUpcoming = daysRemaining >= 0

		return {
			isUpcoming,
			daysRemaining: isUpcoming ? daysRemaining : null,
			isMilestone: false,
			milestoneDays: null
		}
	} else {
		// 一次性模式：直接使用目标日期
		const targetDate = new Date(anniversary.targetDate)
		const daysRemaining = daysBetween(current, targetDate)
		const isUpcoming = daysRemaining >= 0

		// 一次性模式可以计算里程碑
		const totalDays = daysBetween(new Date(anniversary.targetDate), current)
		const milestone = getMilestone(totalDays)
		const isMilestone = milestone !== null

		return {
			isUpcoming,
			daysRemaining: isUpcoming ? daysRemaining : null,
			isMilestone,
			milestoneDays: isMilestone ? totalDays : null
		}
	}
}

/**
 * 获取下一个重复日期
 * @param {Object} anniversary 纪念日对象
 * @param {Date} currentDate 当前日期
 * @returns {Date}
 */
export function getNextRecurringDate(anniversary, currentDate = new Date()) {
	if (anniversary.calendarType === CalendarType.SOLAR) {
		return getNextSolarRecurringDate(new Date(anniversary.targetDate), currentDate)
	} else {
		return getNextLunarRecurringDate(anniversary, currentDate)
	}
}

/**
 * 获取下一个公历重复日期
 * @param {Date} baseDate 基准日期
 * @param {Date} currentDate 当前日期
 * @returns {Date}
 */
function getNextSolarRecurringDate(baseDate, currentDate) {
	const month = baseDate.getMonth()
	const day = baseDate.getDate()
	const currentYear = currentDate.getFullYear()

	// 尝试构建今年的日期
	const thisYearDate = getValidDate(currentYear, month, day)

	// 如果今年的日期已过，返回明年的日期
	if (thisYearDate < currentDate || thisYearDate.getTime() === currentDate.getTime()) {
		if (thisYearDate < currentDate) {
			return getValidDate(currentYear + 1, month, day)
		} else {
			return thisYearDate
		}
	} else {
		return thisYearDate
	}
}

/**
 * 获取下一个农历重复日期
 * @param {Object} anniversary 纪念日对象
 * @param {Date} currentDate 当前日期
 * @returns {Date}
 */
function getNextLunarRecurringDate(anniversary, currentDate) {
	// 将公历日期转换为农历
	const baseDate = new Date(anniversary.targetDate)
	const lunarInfo = solarToLunar(baseDate)

	if (!lunarInfo) {
		return baseDate
	}

	// 计算下一个农历生日
	const result = getNextLunarBirthday(
		lunarInfo.month,
		lunarInfo.day,
		lunarInfo.isLeapMonth,
		currentDate
	)

	return result.solarDate
}

/**
 * 获取有效日期（处理特殊日期）
 * 例如：2月29日在非闰年降级为2月28日，31号在没有31号的月份降级为该月最后一天
 * @param {Number} year 年
 * @param {Number} month 月 (0-11)
 * @param {Number} day 日
 * @returns {Date}
 */
export function getValidDate(year, month, day) {
	const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
	const validDay = Math.min(day, lastDayOfMonth)
	return new Date(year, month, validDay)
}

/**
 * 获取里程碑类型
 * @param {Number} days 天数
 * @returns {String|null}
 */
function getMilestone(days) {
	if (days === 100) return 'DAYS_100'
	if (days === 365) return 'DAYS_365'
	if (days === 1000) return 'DAYS_1000'
	if ([30, 60, 90].includes(days)) return 'OTHER'
	return null
}

/**
 * 格式化日期显示（公历）
 * @param {Date|String} date
 * @returns {String} 如 "1月15日"
 */
export function formatDateDisplay(date) {
	const d = date instanceof Date ? date : new Date(date)
	return `${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 格式化农历日期显示
 * @param {Date|String} date
 * @returns {String} 如 "正月初一"
 */
export function formatLunarDateDisplay(date) {
	const d = date instanceof Date ? date : new Date(date)
	const lunarInfo = solarToLunar(d)

	if (lunarInfo) {
		const lunarMonth = getLunarMonthText(d)
		const lunarDay = getLunarDayText(d)
		const leapPrefix = lunarInfo.isLeapMonth ? '闰' : ''
		return `${leapPrefix}${lunarMonth}${lunarDay}`
	}

	return formatDateDisplay(date)
}

/**
 * 根据日历类型格式化日期显示
 * @param {Date|String} date
 * @param {String} calendarType 'solar' | 'lunar'
 * @param {Boolean} isRecurring 是否重复
 * @returns {String}
 */
export function formatDateDisplayByCalendar(date, calendarType, isRecurring) {
	const d = date instanceof Date ? date : new Date(date)

	if (calendarType === CalendarType.LUNAR) {
		const datePart = formatLunarDateDisplay(d)
		if (isRecurring) {
			return datePart
		} else {
			const lunarYear = getLunarYearText(d)
			return `${lunarYear}年${datePart}`
		}
	} else {
		const datePart = formatDateDisplay(d)
		if (isRecurring) {
			return datePart
		} else {
			return `${d.getFullYear()}年${datePart}`
		}
	}
}

/**
 * 获取下一个目标日期（用于通知）
 * @param {Object} anniversary
 * @returns {Date}
 */
export function getNextTargetDate(anniversary) {
	const currentDate = new Date()

	if (anniversary.isRecurring) {
		return getNextRecurringDate(anniversary, currentDate)
	} else {
		return new Date(anniversary.targetDate)
	}
}

/**
 * 计算提醒日期
 * @param {Object} anniversary
 * @param {Number} daysBefore 提前几天
 * @returns {Date}
 */
export function getReminderDate(anniversary, daysBefore = 0) {
	const targetDate = getNextTargetDate(anniversary)
	const result = new Date(targetDate)
	result.setDate(result.getDate() - daysBefore)
	return result
}

/**
 * 获取农历日期调整说明
 * @param {Object} anniversary
 * @param {Date|String} currentDate
 * @returns {String|null}
 */
export function getLunarAdjustmentNote(anniversary, currentDate = new Date()) {
	if (anniversary.calendarType !== CalendarType.LUNAR || !anniversary.isRecurring) {
		return null
	}

	const baseDate = new Date(anniversary.targetDate)
	const lunarInfo = solarToLunar(baseDate)

	if (!lunarInfo) return null

	const result = getNextLunarBirthday(
		lunarInfo.month,
		lunarInfo.day,
		lunarInfo.isLeapMonth,
		currentDate instanceof Date ? currentDate : new Date(currentDate)
	)

	return result.adjustmentNote
}

/**
 * 计算年龄/年数文本
 * @param {Object} anniversary
 * @param {Date|String} currentDate
 * @returns {String|null} 如 "3岁2个月"、"5年"、"15天"
 */
export function getYearsText(anniversary, currentDate = new Date()) {
	const current = currentDate instanceof Date ? currentDate : new Date(currentDate)
	const targetDate = new Date(anniversary.targetDate)

	let yearsPassed, monthsPassed

	if (anniversary.calendarType === CalendarType.SOLAR) {
		;[yearsPassed, monthsPassed] = calculateSolarYearsAndMonthsPassed(targetDate, current)
	} else {
		;[yearsPassed, monthsPassed] = calculateLunarYearsAndMonthsPassed(anniversary, current)
	}

	const totalMonths = yearsPassed * 12 + monthsPassed

	// 不满1个月：显示xx天
	if (totalMonths <= 0) {
		const daysPassed = calculateDaysPassed(targetDate, current)
		return daysPassed > 0 ? `${daysPassed}天` : null
	}

	const isBirthday = anniversary.category?.id === 'birthday'

	// 1年内：显示xx个月
	if (totalMonths < 12) {
		return `${totalMonths}个月`
	}

	// 3岁以内（含3岁）：显示xx岁xx个月
	if (yearsPassed <= 3 && isBirthday) {
		const unit = '岁'
		const monthsPart = monthsPassed > 0 ? `${monthsPassed}个月` : null
		return monthsPart ? `${yearsPassed}${unit}${monthsPart}` : `${yearsPassed}${unit}`
	}

	// 超过3岁或其他分类：显示xx岁/xx年
	const unit = isBirthday ? '岁' : '年'
	return `${yearsPassed}${unit}`
}

/**
 * 计算公历日期的年数和月数差
 * @returns {[Number, Number]} [年数, 月数]
 */
function calculateSolarYearsAndMonthsPassed(targetDate, currentDate) {
	if (currentDate < targetDate) {
		return [0, 0]
	}

	let years = currentDate.getFullYear() - targetDate.getFullYear()
	let months = currentDate.getMonth() - targetDate.getMonth()
	const dayDiff = currentDate.getDate() - targetDate.getDate()

	if (dayDiff < 0) {
		months--
	}

	if (months < 0) {
		years--
		months += 12
	}

	return [years, months]
}

/**
 * 计算农历日期的年数和月数差
 * @returns {[Number, Number]} [年数, 月数]
 */
function calculateLunarYearsAndMonthsPassed(anniversary, currentDate) {
	const targetDate = new Date(anniversary.targetDate)

	if (currentDate < targetDate) {
		return [0, 0]
	}

	const targetLunar = solarToLunar(targetDate)
	const currentLunar = solarToLunar(currentDate)

	if (!targetLunar || !currentLunar) {
		return [0, 0]
	}

	let years = currentLunar.year - targetLunar.year
	let months = currentLunar.month - targetLunar.month

	if (currentLunar.month === targetLunar.month && currentLunar.day < targetLunar.day) {
		months--
	}

	if (months < 0) {
		years--
		months += 12
	}

	return [Math.max(0, years), Math.max(0, months)]
}

/**
 * 计算天数差
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Number}
 */
function calculateDaysPassed(startDate, endDate) {
	if (endDate < startDate) {
		return 0
	}
	return daysBetween(startDate, endDate)
}

/**
 * 计算两个日期之间的天数差
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Number}
 */
function daysBetween(startDate, endDate) {
	const oneDay = 24 * 60 * 60 * 1000
	return Math.floor((endDate - startDate) / oneDay)
}

/**
 * 解析提醒天数字符串
 * @param {String} reminderDaysStr 如 "0,1,3,7"
 * @returns {Set<Number>}
 */
export function parseReminderDays(reminderDaysStr) {
	if (!reminderDaysStr || reminderDaysStr === '') {
		return new Set([1])
	}
	const parts = reminderDaysStr.split(',')
	const days = new Set()
	parts.forEach(p => {
		const num = parseInt(p)
		if (!isNaN(num)) {
			days.add(num)
		}
	})
	return days
}

/**
 * 格式化提醒天数字符串
 * @param {Set<Number>|Array<Number>} days
 * @returns {String}
 */
export function formatReminderDays(days) {
	if (days instanceof Set) {
		return Array.from(days).sort((a, b) => a - b).join(',')
	}
	return days.sort((a, b) => a - b).join(',')
}
