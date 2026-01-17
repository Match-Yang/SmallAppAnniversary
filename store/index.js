/**
 * Pinia Store
 * 纪念日应用状态管理
 * 与 Android 版本 AnniversaryViewModel.kt 保持一致
 */

import { defineStore } from 'pinia'
import { getAnniversaries, saveAnniversaries, getCustomCategories, saveCustomCategories, generateUUID } from '../utils/storage.js'
import { BuiltInCategories, CalendarType, IconColor } from '../utils/constants.js'
import { calculateAnniversaryStatus, getLunarAdjustmentNote } from '../utils/dateUtils.js'

export const useAnniversaryStore = defineStore('anniversary', {
	state: () => ({
		// 纪念日列表
		anniversaries: [],
		// 选中的分类
		selectedCategory: BuiltInCategories.ALL,
		// 当前页面 'list' | 'add'
		currentScreen: 'list',
		// 正在编辑的纪念日
		editingAnniversary: null,
		// 自定义分类列表
		customCategories: [],
		// 是否显示添加分类对话框
		showAddCategoryDialog: false
	}),

	getters: {
		/**
		 * 获取所有分类（内置+自定义）
		 */
		allCategories: (state) => {
			return [
				BuiltInCategories.ALL,
				BuiltInCategories.BIRTHDAY,
				...state.customCategories
			]
		},

		/**
		 * 获取筛选后的纪念日列表
		 */
		filteredAnniversaries: (state) => {
			const today = new Date()
			const category = state.selectedCategory

			return state.anniversaries
				.filter(item => {
					if (category.id === 'all') return true
					return item.category?.id === category.id
				})
				.map(item => {
					const status = calculateAnniversaryStatus(item, today)
					return {
						...item,
						status,
						lunarAdjustmentNote: getLunarAdjustmentNote(item, today)
					}
				})
				.sort((a, b) => {
					// 一次性且已过的放在最后
					const aIsPastOneTime = !a.isRecurring && !a.status.isUpcoming
					const bIsPastOneTime = !b.isRecurring && !b.status.isUpcoming

					if (aIsPastOneTime && !bIsPastOneTime) return 1
					if (!aIsPastOneTime && bIsPastOneTime) return -1

					// 按剩余天数排序
					const aDays = a.status.daysRemaining ?? Infinity
					const bDays = b.status.daysRemaining ?? Infinity
					return aDays - bDays
				})
		},

		/**
		 * 获取即将到来的纪念日
		 */
		upcomingAnniversaries: (state) => {
			return state.filteredAnniversaries.filter(item => item.status.isUpcoming)
		},

		/**
		 * 获取已过去的纪念日
		 */
		pastAnniversaries: (state) => {
			return state.filteredAnniversaries.filter(item => !item.status.isUpcoming)
		},

		/**
		 * 是否为空列表
		 */
		isEmpty: (state) => {
			return state.anniversaries.length === 0
		}
	},

	actions: {
		/**
		 * 初始化：从本地存储加载数据
		 */
		async loadFromStorage() {
			const [anniversaries, customCategories] = await Promise.all([
				getAnniversaries(),
				getCustomCategories()
			])
			this.anniversaries = anniversaries
			this.customCategories = customCategories
		},

		/**
		 * 导航到添加页面
		 */
		navigateToAdd() {
			this.editingAnniversary = null
			this.currentScreen = 'add'
		},

		/**
		 * 导航到编辑页面
		 * @param {Object|String} anniversary 纪念日对象或ID
		 */
		navigateToEdit(anniversary) {
			if (typeof anniversary === 'string') {
				anniversary = this.anniversaries.find(a => a.id === anniversary)
			}
			this.editingAnniversary = anniversary
			this.currentScreen = 'add'
		},

		/**
		 * 导航到列表页面
		 */
		navigateToList() {
			this.currentScreen = 'list'
		},

		/**
		 * 选择分类
		 */
		selectCategory(category) {
			this.selectedCategory = category
		},

		/**
		 * 显示添加分类对话框
		 */
		showAddCategory() {
			this.showAddCategoryDialog = true
		},

		/**
		 * 隐藏添加分类对话框
		 */
		hideAddCategory() {
			this.showAddCategoryDialog = false
		},

		/**
		 * 添加自定义分类
		 */
		async addCustomCategory(name, icon = 'favorite') {
			if (!name || name.trim() === '') return

			const newCategory = {
				id: generateUUID(),
				displayName: name.trim(),
				icon: icon,
				isBuiltIn: false
			}

			this.customCategories.push(newCategory)
			await saveCustomCategories(this.customCategories)

			// 自动选中新添加的分类
			this.selectedCategory = newCategory
			this.showAddCategoryDialog = false
		},

		/**
		 * 删除自定义分类
		 * 将该分类下的所有纪念日迁移到生日分类
		 */
		async deleteCustomCategory(categoryId) {
			const categoryIndex = this.customCategories.findIndex(c => c.id === categoryId)
			if (categoryIndex === -1) return

			const category = this.customCategories[categoryIndex]
			this.customCategories.splice(categoryIndex, 1)
			await saveCustomCategories(this.customCategories)

			// 将该分类下的所有纪念日迁移到生日分类
			let hasChanges = false
			this.anniversaries.forEach((anniversary, index) => {
				if (anniversary.category?.id === categoryId) {
					this.anniversaries[index] = {
						...anniversary,
						category: BuiltInCategories.BIRTHDAY,
						icon: 'cake',
						color: IconColor.PURPLE
					}
					hasChanges = true
				}
			})

			if (hasChanges) {
				await saveAnniversaries(this.anniversaries)
			}

			// 如果当前选中的是被删除的分类，切换到"全部"
			if (this.selectedCategory.id === categoryId) {
				this.selectedCategory = BuiltInCategories.ALL
			}
		},

		/**
		 * 保存纪念日
		 */
		async saveAnniversary(data) {
			const isEdit = !!this.editingAnniversary

			const anniversary = {
				id: this.editingAnniversary?.id || generateUUID(),
				title: data.title,
				targetDate: data.targetDate, // ISO string
				calendarType: data.calendarType || CalendarType.SOLAR,
				category: data.category || BuiltInCategories.BIRTHDAY,
				isRecurring: data.isRecurring !== undefined ? data.isRecurring : true,
				hasNotification: data.hasNotification !== undefined ? data.hasNotification : true,
				reminderDaysStr: data.reminderDaysStr || '1',
				reminderHour: data.reminderHour || 9,
				reminderMinute: data.reminderMinute || 0,
				isPm: data.isPm || false,
				icon: data.icon || (data.category?.id === 'birthday' ? 'cake' : 'favorite'),
				createdAt: this.editingAnniversary?.createdAt || new Date().toISOString(),
				color: data.color || (data.category?.id === 'birthday' ? IconColor.PURPLE : IconColor.ROSE)
			}

			if (isEdit) {
				const index = this.anniversaries.findIndex(a => a.id === anniversary.id)
				if (index !== -1) {
					this.anniversaries[index] = anniversary
				}
			} else {
				this.anniversaries.push(anniversary)
			}

			await saveAnniversaries(this.anniversaries)

			// TODO: 调度通知
			// await scheduleNotification(anniversary)

			this.navigateToList()
		},

		/**
		 * 删除纪念日
		 */
		async deleteAnniversary(id) {
			const index = this.anniversaries.findIndex(a => a.id === id)
			if (index === -1) return

			this.anniversaries.splice(index, 1)
			await saveAnniversaries(this.anniversaries)

			// TODO: 取消通知
			// await cancelNotification(id)

			this.navigateToList()
		},

		/**
		 * 切换通知状态
		 */
		async toggleNotification(id) {
			const index = this.anniversaries.findIndex(a => a.id === id)
			if (index === -1) return

			this.anniversaries[index] = {
				...this.anniversaries[index],
				hasNotification: !this.anniversaries[index].hasNotification
			}

			await saveAnniversaries(this.anniversaries)

			// TODO: 重新调度通知
			// if (this.anniversaries[index].hasNotification) {
			//     await scheduleNotification(this.anniversaries[index])
			// } else {
			//     await cancelNotification(id)
			// }
		}
	}
})

export default useAnniversaryStore
