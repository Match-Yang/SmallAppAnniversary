import App from './App'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

// 创建 Pinia 实例
const pinia = createPinia()

export function createApp() {
	const app = createSSRApp(App)
	app.use(pinia)
	return {
		app
	}
}
