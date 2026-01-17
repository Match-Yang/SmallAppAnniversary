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

## 许可证

MIT
