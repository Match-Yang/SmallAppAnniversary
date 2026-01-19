# 纪念日 Uni-app 版

一个支持公历/农历的纪念日管理应用，使用 Vue 3 + Uni-app 开发。

## 功能特性

- ✅ 纪念日 CRUD（增删改查）
- ✅ 公历/农历双日历支持
- ✅ 每年重复 / 一次性模式
- ✅ 自定义分类管理
- ✅ 日期倒计时与年龄计算
- ✅ 农历闰月、大小月自动调整
- ⏳ 通知提醒（开发中）

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **状态管理**: Pinia
- **UI**: Uni-app 原生组件
- **农历支持**: lunar-javascript
- **跨平台**: 微信小程序 / H5 / App

## 项目结构

```
Anniversary/
├── pages/
│   ├── index/           # 纪念日列表页
│   └── add/             # 添加/编辑纪念日页
├── components/
│   └── CalendarPicker/  # 万年历选择器组件
├── store/
│   └── index.js         # Pinia 状态管理
├── utils/
│   ├── constants.js     # 常量定义
│   ├── storage.js       # 本地存储封装
│   ├── dateUtils.js     # 日期工具
│   └── lunarCalendar.js # 农历工具
├── App.vue
├── main.js
├── pages.json
└── manifest.json
```

## 安装依赖

```bash
npm install
```

主要依赖：
- `pinia` - 状态管理
- `lunar-javascript` - 农历转换库

## 运行项目

### H5 端
```bash
npm run dev:h5
```

### 微信小程序
```bash
npm run dev:mp-weixin
```
然后用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

### App（Android/iOS）
使用 HBuilderX 打开项目，点击运行。

## 与 Android 原生版本对比

| 功能 | Android | Uni-app |
|------|---------|---------|
| 纪念日 CRUD | ✅ | ✅ |
| 公历支持 | ✅ | ✅ |
| 农历支持 | ✅ | ✅ |
| 重复/一次性模式 | ✅ | ✅ |
| 自定义分类 | ✅ | ✅ |
| 日期计算 | ✅ | ✅ |
| 通知提醒 | ✅ | ⏳ 开发中 |
| 界面风格 | Material 3 | 复刻 Material 3 |

## 开发说明

### 状态管理

使用 Pinia 进行状态管理，store 位于 `store/index.js`：

```javascript
import { useAnniversaryStore } from './store/index.js'

const store = useAnniversaryStore()

// 加载数据
await store.loadFromStorage()

// 添加纪念日
await store.saveAnniversary(data)

// 删除纪念日
await store.deleteAnniversary(id)
```

### 农历工具

使用 `lunar-javascript` 库进行农历转换：

```javascript
import { solarToLunar, getLunarDayText } from './utils/lunarCalendar.js'

// 公历转农历
const lunar = solarToLunar(new Date())

// 获取农历日文本
const dayText = getLunarDayText(new Date()) // "初一"、"廿三"
```

### 日期格式化

```javascript
import { formatDateDisplayByCalendar } from './utils/dateUtils.js'

// 根据日历类型格式化日期
const dateStr = formatDateDisplayByCalendar(date, 'lunar', true)
// "正月初一" (农历, 重复模式)
```

## 待办事项

- [ ] 通知系统实现（平台权限处理）
- [ ] 暗黑模式支持
- [ ] 数据导入/导出
- [ ] 云端同步

## 注意事项

1. **农历支持范围**: 1900-2100 年
2. **闰月处理**: 自动调整，无闰月时显示说明
3. **大小月**: 30日自动调整为29日（小月）
4. **跨平台**: 小程序端不支持本地通知，需使用云函数

## 鸿蒙端白屏（已解决 / 经验记录）

如果你遇到“**浏览器和安卓正常，但构建运行到鸿蒙后只显示白屏**”，优先检查是否存在 **启动期 JS 异常**（常见于三方组件的条件编译/资源加载差异）。

本项目曾出现过一次典型问题，根因是 `uni_modules/lime-icon/index.ts` 里 **条件编译不一致**：

- **现象**：鸿蒙端启动白屏；H5/安卓正常。
- **原因**：Harmony 分支走到了 `icons: defalutIconList`，但上方对 `defalutIconList` 的 `import` 被条件编译排除了，导致运行时引用未定义变量，从而启动阶段崩溃。
- **修复**：在 `uni_modules/lime-icon/index.ts` 中将 **APP-HARMONY 与 APP-ANDROID 一致**，统一改为通过 `jsonUrl: '/uni_modules/lime-icon/static/icons.json'` 读取图标映射，避免 Harmony 端直接 `import` JSON 带来的打包/运行时差异。

你可以通过查看鸿蒙运行日志中是否存在类似 “`xxx is not defined` / module load failed” 的首条异常来快速确认是否属于这类问题。

## 鸿蒙端通知/提醒（现状与正确处理方式）

本项目的“纪念日提醒”目前实现方式偏向 **本地通知（local notification）**：在客户端计算提醒时间并调用 `uni.createPushMessage` 创建通知（见 `utils/notification.js`）。

### 1) 为什么鸿蒙端经常“发不出通知”

- **代码层原因（本项目已修复）**：早期版本里通知逻辑仅在 `APP-PLUS` 下执行，导致 `APP-HARMONY` 下不会初始化/调度任何通知。
- **平台能力差异**：不同版本/设备的鸿蒙运行环境对 `uni.createPushMessage` 等能力支持不完全一致，且通知权限开关可能默认关闭。

### 2) “应用被 kill 后仍能通知”怎么做？

这里要先区分两类能力：

- **本地定时提醒**：依赖应用进程/运行环境来调度，应用被强杀后通常不保证还能触发（鸿蒙/安卓的系统策略都可能影响）。
- **远程推送通知（推荐）**：由系统/厂商推送通道投递到设备，**即使应用被 kill** 也可以由系统展示通知（前提是通知权限开关打开，并且服务端发送的是“通知消息/notification message”，而不是仅 data 透传消息）。

因此：如果你的目标是“应用被 kill 后仍能收到通知”，应当接入 **uni-push / 厂商推送（华为 PushKit/AGC）**，并在服务端发送 **notification 类型** 消息。

### 3) 鸿蒙端需要检查/引导的权限与系统设置

- **通知开关**：用户必须在系统设置里允许该应用发送通知；代码层面可以用 `uni.getAppAuthorizeSetting()` 做 best-effort 检测（不同端字段可能不同）。
- **后台/省电限制**：部分设备会限制后台活动/自启动，影响“透传(data)消息”的到达与处理。
- **消息类型**：要离线可见（被 kill 仍展示），优先使用推送通道的 **notification 消息**；仅 data 透传在被 kill 时通常无法由应用处理。

> 备注：你提到的“被 kill 后仍能发送通知的权限（需申请）”，通常对应的是厂商/系统对后台能力、保活或推送场景的特殊授权要求；即便拿到该权限，也仍建议以 **厂商推送 + notification 消息** 作为主路径。

## 许可证

MIT
