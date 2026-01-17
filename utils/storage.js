/**
 * 本地存储工具
 * 封装 uni.storage API
 */

import { StorageKeys } from './constants.js'

/**
 * 获取数据
 * @param {String} key 存储键
 * @param {*} defaultValue 默认值
 * @returns {Promise<*>}
 */
export function getStorage(key, defaultValue = null) {
	return new Promise((resolve) => {
		uni.getStorage({
			key: key,
			success: (res) => {
				resolve(res.data)
			},
			fail: () => {
				resolve(defaultValue)
			}
		})
	})
}

/**
 * 设置数据
 * @param {String} key 存储键
 * @param {*} value 值
 * @returns {Promise<Boolean>}
 */
export function setStorage(key, value) {
	return new Promise((resolve) => {
		uni.setStorage({
			key: key,
			data: value,
			success: () => {
				resolve(true)
			},
			fail: () => {
				resolve(false)
			}
		})
	})
}

/**
 * 删除数据
 * @param {String} key 存储键
 * @returns {Promise<Boolean>}
 */
export function removeStorage(key) {
	return new Promise((resolve) => {
		uni.removeStorage({
			key: key,
			success: () => {
				resolve(true)
			},
			fail: () => {
				resolve(false)
			}
		})
	})
}

/**
 * 清空所有数据
 * @returns {Promise<Boolean>}
 */
export function clearStorage() {
	return new Promise((resolve) => {
		uni.clearStorage({
			success: () => {
				resolve(true)
			},
			fail: () => {
				resolve(false)
			}
		})
	})
}

/**
 * 获取所有纪念日
 * @returns {Promise<Array>}
 */
export async function getAnniversaries() {
	return await getStorage(StorageKeys.ANNIVERSARIES, [])
}

/**
 * 保存所有纪念日
 * @param {Array} anniversaries
 * @returns {Promise<Boolean>}
 */
export async function saveAnniversaries(anniversaries) {
	return await setStorage(StorageKeys.ANNIVERSARIES, anniversaries)
}

/**
 * 获取所有自定义分类
 * @returns {Promise<Array>}
 */
export async function getCustomCategories() {
	return await getStorage(StorageKeys.CUSTOM_CATEGORIES, [])
}

/**
 * 保存所有自定义分类
 * @param {Array} categories
 * @returns {Promise<Boolean>}
 */
export async function saveCustomCategories(categories) {
	return await setStorage(StorageKeys.CUSTOM_CATEGORIES, categories)
}

/**
 * 生成 UUID
 * @returns {String}
 */
export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0
		const v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}
