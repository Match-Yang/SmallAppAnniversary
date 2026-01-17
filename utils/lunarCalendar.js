/**
 * 农历工具类（UniApp）
 *
 * 目标：
 * - **停止维护手写农历表/位运算**（这类实现很容易出现闰月/大小月/边界年错误）
 * - 直接复用项目内已引入的成熟实现：`uni_modules/uni-calendar/components/uni-calendar/calendar.js`
 *
 * 说明：
 * - `uni-calendar` 的 `calendar.js`（jjonline/calendar.js）是一个成熟的 1900-2100 公历/农历互转实现，
 *   内部大量使用 `Date.UTC`/`getUTC*` 来规避 DST 导致的天数偏移问题。
 * - 本文件提供与现有 UniApp 代码一致的 API（`solarToLunar`、`getNextLunarBirthday` 等），避免上层大改。
 */

import calendar from '../uni_modules/uni-calendar/components/uni-calendar/calendar.js'

function toDate(value) {
	if (value instanceof Date) return value
	return new Date(value)
}

function toYMD(date) {
	const d = toDate(date)
	return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
}

/**
 * 公历转农历
 * @param {Date|String|Number} solarDate
 * @returns {{year:number, month:number, day:number, isLeapMonth:boolean} | null}
 */
function solarToLunar(solarDate) {
	const { y, m, d } = toYMD(solarDate)
	const res = calendar.solar2lunar(y, m, d)
	if (!res || res === -1) return null
	return {
		year: res.lYear,
		month: res.lMonth,
		day: res.lDay,
		isLeapMonth: !!res.isLeap
	}
}

/**
 * 农历转公历
 * @returns {Date|null}
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
	const res = calendar.lunar2solar(lunarYear, lunarMonth, lunarDay, !!isLeapMonth)
	if (!res || res === -1) return null
	return new Date(res.cYear, res.cMonth - 1, res.cDay)
}

function getLunarDayText(date) {
	const { y, m, d } = toYMD(date)
	const res = calendar.solar2lunar(y, m, d)
	return res && res !== -1 ? res.IDayCn : ''
}

function getLunarMonthText(date) {
	const { y, m, d } = toYMD(date)
	const res = calendar.solar2lunar(y, m, d)
	if (!res || res === -1) return ''
	// `IMonthCn` 可能包含“闰”前缀；上层会根据 `isLeapMonth` 自己加“闰”
	return String(res.IMonthCn || '').replace(/^闰/, '')
}

function getLunarYearText(date) {
	const lunar = solarToLunar(date)
	if (!lunar) return ''
	const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
	return String(lunar.year)
		.split('')
		.map(ch => digits[Number(ch)] ?? ch)
		.join('')
}

function getFullLunarText(date) {
	const lunar = solarToLunar(date)
	if (!lunar) return ''
	const leapPrefix = lunar.isLeapMonth ? '闰' : ''
	const month = getLunarMonthText(date)
	const day = getLunarDayText(date)
	return `${getLunarYearText(date)}年${leapPrefix}${month}${day}`
}

/**
 * 计算下一个农历生日的公历日期
 * 参考 Android 原生实现，通过向后查找匹配的农历日期
 * @param {Number} lunarMonth 农历月
 * @param {Number} lunarDay 农历日
 * @param {Boolean} isLeapMonth 是否闰月
 * @param {Date} fromDate 从哪个日期开始计算
 * @returns {Object} { solarDate, adjustmentNote, actualLunarDay }
 */
function getNextLunarBirthday(lunarMonth, lunarDay, isLeapMonth = false, fromDate = new Date()) {
	// 首先检查今天的农历日期是否匹配
	const todayLunar = solarToLunar(fromDate)
	if (todayLunar.month === lunarMonth &&
		todayLunar.day === lunarDay &&
		todayLunar.isLeapMonth === isLeapMonth) {
		return {
			solarDate: fromDate,
			adjustmentNote: null,
			actualLunarDay: lunarDay
		}
	}

	// 向后查找最多800天（约2年多）
	for (let daysToAdd = 1; daysToAdd <= 800; daysToAdd++) {
		const searchDate = new Date(fromDate)
		searchDate.setDate(searchDate.getDate() + daysToAdd)

		const lunarInfo = solarToLunar(searchDate)

		// 检查农历月和日是否匹配
		if (lunarInfo.month === lunarMonth && lunarInfo.day === lunarDay) {
			// 检查闰月匹配
			let isLeapMatch = false
			if (isLeapMonth) {
				// 用户指定闰月，必须匹配闰月
				isLeapMatch = lunarInfo.isLeapMonth
			} else {
				// 用户指定非闰月，匹配非闰月
				isLeapMatch = !lunarInfo.isLeapMonth
			}

			if (isLeapMatch) {
				return {
					solarDate: searchDate,
					adjustmentNote: null,
					actualLunarDay: lunarDay
				}
			}
		}
	}

	// 如果没找到，可能是闰月不存在，尝试使用非闰月
	if (isLeapMonth) {
		for (let daysToAdd = 1; daysToAdd <= 800; daysToAdd++) {
			const searchDate = new Date(fromDate)
			searchDate.setDate(searchDate.getDate() + daysToAdd)

			const lunarInfo = solarToLunar(searchDate)

			// 查找非闰月的匹配
			if (lunarInfo.month === lunarMonth && lunarInfo.day === lunarDay && !lunarInfo.isLeapMonth) {
				return {
					solarDate: searchDate,
					adjustmentNote: `无闰${LUNAR_MONTHS[lunarMonth - 1]}，已调整为${LUNAR_MONTHS[lunarMonth - 1]}`,
					actualLunarDay: lunarDay
				}
			}
		}
	}

	// 如果30号没找到，可能是小月，尝试29号
	if (lunarDay === 30) {
		for (let daysToAdd = 1; daysToAdd <= 800; daysToAdd++) {
			const searchDate = new Date(fromDate)
			searchDate.setDate(searchDate.getDate() + daysToAdd)

			const lunarInfo = solarToLunar(searchDate)

			// 查找29号的匹配
			if (lunarInfo.month === lunarMonth && lunarInfo.day === 29) {
				let isLeapMatch = false
				if (isLeapMonth) {
					isLeapMatch = lunarInfo.isLeapMonth
				} else {
					isLeapMatch = !lunarInfo.isLeapMonth
				}

				if (isLeapMatch) {
					return {
						solarDate: searchDate,
						adjustmentNote: `${LUNAR_MONTHS[lunarMonth - 1]}小月，已调整为廿九`,
						actualLunarDay: 29
					}
				}
			}
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
	// 兼容旧导出：提供与旧签名一致的闰月/月天数查询（底层委托给 uni-calendar）
	getLeapMonth,
	getLunarMonthDays
}

/**
 * 兼容旧导出：获取闰月月份（0 表示无闰月）
 */
function getLeapMonth(year) {
	return calendar.leapMonth(year)
}

/**
 * 兼容旧导出：获取农历月天数（29/30）
 * 注意：旧实现支持 isLeap 参数；uni-calendar 的闰月天数通过 `leapDays` 获取
 */
function getLunarMonthDays(year, month, isLeap = false) {
	if (isLeap) return calendar.leapDays(year)
	return calendar.monthDays(year, month)
}
