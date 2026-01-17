/**
 * 通知工具类 - 处理本地通知提醒
 */

// 通知渠道ID
const CHANNEL_ID = 'anniversary_reminder'

// 初始化通知渠道（Android 8.0+）
function initNotificationChannel() {
	// #ifdef APP-PLUS
	// Android 8.0+ 需要创建通知渠道
	const channelManager = uni.getChannelManager()
	if (channelManager) {
		channelManager.setPushChannel({
			channelId: CHANNEL_ID,
			channelDesc: '纪念日提醒通知',
			enableLights: true,
			enableVibration: true,
			importance: 4 // IMPORTANCE_HIGH
		})
	}
	// #endif
}

/**
 * 计算下次提醒时间
 * @param {Object} anniversary 纪念日对象
 * @param {Number} daysBefore 提前几天提醒（0=当天）
 * @returns {Date|null} 提醒时间，如果时间已过则返回null
 */
function calculateNextReminderTime(anniversary, daysBefore = 0) {
	const targetDate = new Date(anniversary.targetDate)

	// 如果是每年重复的纪念日
	if (anniversary.isRecurring) {
		const now = new Date()
		let reminderDate = new Date(targetDate)

		// 设置今年的日期
		reminderDate.setFullYear(now.getFullYear())

		// 减去提前天数
		reminderDate.setDate(reminderDate.getDate() - daysBefore)

		// 如果时间已过，计算明年的
		if (reminderDate <= now) {
			reminderDate.setFullYear(now.getFullYear() + 1)
		}

		// 设置提醒的具体时间
		reminderDate.setHours(anniversary.reminderHour || 9, anniversary.reminderMinute || 0, 0, 0)

		return reminderDate
	} else {
		// 一次性纪念日
		const reminderDate = new Date(targetDate)
		reminderDate.setDate(reminderDate.getDate() - daysBefore)
		reminderDate.setHours(anniversary.reminderHour || 9, anniversary.reminderMinute || 0, 0, 0)

		const now = new Date()
		if (reminderDate <= now) {
			return null
		}

		return reminderDate
	}
}

/**
 * 获取延迟秒数
 * @param {Date} reminderDate 提醒时间
 * @returns {Number} 延迟秒数
 */
function getDelaySeconds(reminderDate) {
	const now = new Date()
	const delay = Math.floor((reminderDate.getTime() - now.getTime()) / 1000)

	// 如果延迟时间小于0，返回0
	return delay > 0 ? delay : 0
}

/**
 * 创建单个提醒通知
 * @param {Object} anniversary 纪念日对象
 * @param {Number} daysBefore 提前几天提醒
 */
function scheduleReminder(anniversary, daysBefore) {
	// #ifdef APP-PLUS
	const reminderDate = calculateNextReminderTime(anniversary, daysBefore)
	if (!reminderDate) {
		console.log('[通知] 提醒时间已过，跳过:', anniversary.title, daysBefore, '天前')
		return
	}

	const delay = getDelaySeconds(reminderDate)
	const delayText = daysBefore === 0 ? '今天' : daysBefore === 1 ? '明天' : `${daysBefore}天后`

	uni.createPushMessage({
		title: '纪念日提醒',
		content: `${anniversary.title} ${delayText}到了！`,
		payload: JSON.stringify({
			id: anniversary.id,
			title: anniversary.title,
			type: 'anniversary_reminder'
		}),
		sound: 'system',
		delay: delay,
		when: reminderDate,
		channelId: CHANNEL_ID,
		success: () => {
			console.log('[通知] 提醒设置成功:', anniversary.title, delayText, '延迟', delay, '秒')
		},
		fail: (err) => {
			console.error('[通知] 提醒设置失败:', anniversary.title, err)
		}
	})
	// #endif
}

/**
 * 为纪念日设置所有提醒
 * @param {Object} anniversary 纪念日对象
 */
function scheduleAllReminders(anniversary) {
	// #ifdef APP-PLUS
	if (!anniversary.hasNotification) {
		console.log('[通知] 未开启通知，跳过:', anniversary.title)
		return
	}

	// 解析提醒天数
	const reminderDays = anniversary.reminderDaysStr
		? anniversary.reminderDaysStr.split(',').map(d => parseInt(d.trim()))
		: [1]

	console.log('[通知] 为纪念日设置提醒:', anniversary.title, '提醒天数:', reminderDays)

	// 为每个提前天数创建通知
	reminderDays.forEach(days => {
		scheduleReminder(anniversary, days)
	})
	// #endif
}

/**
 * 取消纪念日所有提醒
 * @param {String} anniversaryId 纪念日ID
 */
// 注意：uni-app 的本地通知 API 不支持直接取消特定通知
// 可以通过覆盖方式或重新设置所有通知来实现

/**
 * 初始化通知系统
 * 在应用启动时调用
 */
function init() {
	// #ifdef APP-PLUS
	initNotificationChannel()
	console.log('[通知] 通知系统已初始化')
	// #endif
}

export {
	init,
	initNotificationChannel,
	scheduleReminder,
	scheduleAllReminders,
	calculateNextReminderTime
}
