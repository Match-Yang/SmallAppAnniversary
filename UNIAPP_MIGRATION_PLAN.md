# Uni-app 纪念日应用实现计划

## 项目概述

将 Android 原生 Kotlin/Compose 版本的纪念日应用完整迁移到 Uni-app (Vue 3)。

---

## 一、功能清单

### 1. 核心功能
- [x] 纪念日 CRUD（增删改查）
- [x] 公历/农历双日历支持
- [x] 每年重复 / 一次性模式
- [x] 自定义分类管理
- [x] 通知提醒系统
- [x] 日期计算与倒计时
- [x] 农历闰月、大小月自动调整

### 2. UI 页面
- [x] 纪念日列表页（首页）
- [x] 添加/编辑纪念日页
- [x] 万年历日期选择器
- [x] 添加分类对话框
- [x] 分类选择对话框

### 3. 数据模型
- [x] Anniversary（纪念日）
- [x] Category（分类：内置+自定义）
- [x] CalendarType（公历/农历）
- [x] IconColor（图标颜色）

---

## 二、技术栈选型

| 技术 | 用途 | 说明 |
|------|------|------|
| Vue 3 | 前端框架 | Composition API |
| uni-app | 跨平台框架 | 支持微信小程序/App |
| Pinia | 状态管理 | 替代 Android ViewModel |
| uni-storage | 本地存储 | 替代 SharedPreferences |
| 农历库 | 农历转换 | 需引入 JS 农历库 |

---

## 三、目录结构设计

```
Anniversary/
├── pages/
│   ├── index/
│   │   └── index.vue           # 纪念日列表页
│   ├── add/
│   │   └── add.vue              # 添加/编辑纪念日页
│   └── components/
│       └── (共享组件放在 components/)
├── components/
│   ├── CalendarPicker/
│   │   └── CalendarPicker.vue  # 万年历选择器
│   ├── AnniversaryItem/
│   │   └── AnniversaryItem.vue # 纪念日列表项
│   ├── CategoryDialog/
│   │   └── CategoryDialog.vue  # 添加分类对话框
│   └── CategoryPicker/
│       └── CategoryPicker.vue  # 分类选择器
├── store/
│   └── index.js                # Pinia store
├── utils/
│   ├── dateUtils.js            # 日期工具
│   ├── lunarCalendar.js        # 农历工具
│   ├── storage.js              # 存储工具
│   └── constants.js            # 常量定义
├── static/
│   └── icons/                  # 图标资源
├── App.vue
├── main.js
├── pages.json
└── manifest.json
```

---

## 四、数据模型定义

### 1. Anniversary 纪念日
```javascript
{
  id: String,              // UUID
  title: String,           // 标题
  targetDate: String,      // 目标日期 ISO格式
  calendarType: String,    // 'solar' | 'lunar'
  category: Object,        // Category对象
  isRecurring: Boolean,    // 每年重复/一次性
  hasNotification: Boolean,// 是否启用提醒
  reminderDaysStr: String, // "0,1,3,7"
  reminderHour: Number,    // 0-12
  reminderMinute: Number,  // 0-59
  isPm: Boolean,           // 是否下午
  icon: String,            // 图标名
  createdAt: String,       // 创建时间
  color: String            // 颜色类型
}
```

### 2. Category 分类
```javascript
// 内置分类
{ id: 'all', displayName: '全部', icon: 'apps', isBuiltIn: true }
{ id: 'birthday', displayName: '生日', icon: 'cake', isBuiltIn: true }

// 自定义分类
{ id: UUID, displayName: String, icon: String, isBuiltIn: false }
```

### 3. CalendarType 日历类型
```javascript
const CalendarType = {
  SOLAR: 'solar',   // 公历
  LUNAR: 'lunar'    // 农历
}
```

---

## 五、设计规范

### 1. 颜色系统
```scss
// 主色
$primary: #ee2b5b;
$background-light: #f8f6f6;

// 标签颜色
$tag-solar-bg: #fed7aa;
$tag-solar-text: #c2410c;
$tag-lunar-bg: #c7d2fe;
$tag-lunar-text: #4338ca;

// 文字颜色
$text-primary: #181113;
$text-secondary: #6b7280;
```

### 2. 字体大小
```scss
$font-title: 20px;      // 标题（欢迎回来）
$font-headline: 18px;   // 页面标题
$font-body-large: 16px; // 正文大
$font-body-medium: 14px;// 正文中
$font-body-small: 12px; // 正文小
$font-label: 10px;      // 标签
```

### 3. 圆角
```scss
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16dp;
$radius-xl: 18px;
$radius-round: 50%;
```

---

## 六、核心功能实现步骤

### 阶段一：基础架构（第1步）

**任务清单：**
1. 更新 `pages.json` 配置页面路由
2. 创建 Pinia store
3. 创建 utils 目录和基础工具函数
4. 定义数据模型常量

**关键文件：**
- `pages.json` - 配置 index、add 页面
- `store/index.js` - 创建 anniversaries、categories、selectedCategory 状态
- `utils/constants.js` - 定义 CalendarType、内置分类等
- `utils/storage.js` - 封装 uni.getStorage/setStorage

---

### 阶段二：列表页（第2步）

**任务清单：**
1. 顶部欢迎区域 + 添加按钮
2. 分类筛选横向滚动列表
3. 纪念日列表卡片
4. 空状态占位
5. 通知权限提示横幅（可选）

**组件：**
- `pages/index/index.vue` - 主页面
- `components/AnniversaryItem/AnniversaryItem.vue` - 列表项组件

**样式复现：**
- 欢迎文字："欢迎回来，"+"我的纪念日"
- 分类 chip：圆角 18dp，选中为 Primary 色
- 卡片样式：圆角 16dp，带 1dp 边框
- 公历/农历标签：圆角 4dp，不同背景色

---

### 阶段三：添加/编辑页（第3步）

**任务清单：**
1. 顶部导航栏（关闭按钮 + 标题）
2. 标题输入框
3. 公历/农历切换
4. 每年重复/一次性切换
5. 日期选择区域
6. 分类选择
7. 提醒设置：
   - 启用提醒开关
   - 提醒时间多选（当天/提前1天/提前3天/提前1周）
   - 精确时间选择器
8. 保存/删除按钮

**组件：**
- `pages/add/add.vue` - 添加编辑页

---

### 阶段四：万年历选择器（第4步）

**任务清单：**
1. 月视图网格布局
2. 年份选择对话框
3. 月份导航
4. 农历日期显示（小字）
5. 今天高亮
6. 选中状态

**组件：**
- `components/CalendarPicker/CalendarPicker.vue` - 万年历主组件

**农历支持：**
- 引入 JS 农历库（如 `lunar-javascript`）
- 实现公历转农历、农历转公历
- 显示农历日（初一、廿三等）
- 显示农历月（正月、腊月等）

---

### 阶段五：分类管理（第5步）

**任务清单：**
1. 添加分类对话框
2. 图标选择网格（8个预设图标）
3. 分类选择对话框
4. 长按删除自定义分类
5. 删除确认对话框

**组件：**
- `components/CategoryDialog/CategoryDialog.vue` - 添加分类
- `components/CategoryPicker/CategoryPicker.vue` - 分类选择

**预设图标：**
- favorite（爱心）
- cake（蛋糕/生日）
- event（事件）
- star（星星）
- heart（心形）
- gift（礼物）
- balloon（气球）
- flower（花朵）

---

### 阶段六：日期计算工具（第6步）

**任务清单：**
1. `utils/dateUtils.js` 实现：
   - `calculateAnniversaryStatus()` - 计算纪念日状态
   - `getNextRecurringDate()` - 获取下一个重复日期
   - `formatDateDisplay()` - 格式化日期显示
   - `getYearsText()` - 计算年龄/年数
   - `getLunarAdjustmentNote()` - 获取农历调整说明

2. `utils/lunarCalendar.js` 实现：
   - `solarToLunar()` - 公历转农历
   - `lunarToSolar()` - 农历转公历
   - `getLunarDayText()` - 获取农历日文本
   - `getLunarMonthText()` - 获取农历月文本
   - `getFullLunarText()` - 获取完整农历文本
   - `getNextLunarBirthday()` - 计算下一个农历生日

**边界处理：**
- 闰月处理
- 大小月处理（30日→29日）
- 2月29日处理

---

### 阶段七：通知系统（第7步）

**任务清单：**
1. 权限请求（Android/iOS）
2. 本地通知调度
3. 多提醒支持
4. 通知取消

**API 使用：**
```javascript
// 权限请求
uni.requestPermissions()

// 创建通知
uni.createLocalNotification({
  title: String,
  content: String,
  when: Date,
  ...
})

// 取消通知
uni.cancelLocalNotification(id)
```

---

### 阶段八：持久化存储（第8步）

**任务清单：**
1. 封装 storage 工具
2. 纪念日列表存储
3. 自定义分类存储
4. 数据版本迁移支持

**存储键：**
```javascript
const STORAGE_KEYS = {
  ANNIVERSARIES: 'anniversaries',
  CUSTOM_CATEGORIES: 'custom_categories'
}
```

---

## 七、图标资源迁移

Android 使用 Material Icons Extended，需要转换为 Uni-app 可用格式：

**方案一：使用 uni-icons**
```javascript
import uniIcons from '@uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
```

**方案二：使用自定义图标**
- 将 Material Icons SVG 导入 `static/icons/`
- 使用 `<image>` 组件显示

**图标映射：**
| 功能 | Android | Uni-app |
|------|---------|---------|
| 添加 | Icons.Default.Add | \ue900 |
| 关闭 | Icons.Default.Close | \ue901 |
| 通知 | Icons.Default.Notifications | \ue902 |
| 信息 | Icons.Default.Info | \ue903 |
| 左箭头 | KeyboardArrowLeft | \ue904 |
| 右箭头 | KeyboardArrowRight | \ue905 |
| 蛋糕 | Icons.Default.Cake | 自定义 |
| 爱心 | Icons.Default.Favorite | 自定义 |

---

## 八、实现顺序建议

```
第1步: 基础架构
  └─ pages.json 配置、store 创建、utils 基础

第2步: 列表页
  └─ 静态布局 → 数据绑定 → 列表渲染

第3步: 添加/编辑页
  └─ 表单布局 → 数据收集 → 保存逻辑

第4步: 日期选择器
  └─ 日历网格 → 农历显示 → 日期选择

第5步: 分类管理
  └─ 对话框 → 图标选择 → CRUD 操作

第6步: 日期计算
  └─ 工具函数 → 农历支持 → 边界处理

第7步: 通知系统
  └─ 权限处理 → 调度逻辑 → 测试

第8步: 优化与测试
  └─ 性能优化 → 边界测试 → 跨平台测试
```

---

## 九、注意事项

### 1. 农历库选择
推荐使用 `lunar-javascript` (https://github.com/6tail/lunar-js)
- 支持 1900-2100 年
- 支持闰月、大小月
- 与 Android 版本使用的库数据一致

### 2. 跨平台兼容性
- 小程序端不支持本地通知，需使用云函数
- App 端可使用原生插件
- 某些 CSS 属性需添加平台前缀

### 3. 数据迁移
如果已有 Android 版本用户数据，需要提供数据导入方案

---

## 十、验收标准

1. 功能完整性：与 Android 版本功能一致
2. UI 一致性：视觉效果和交互体验一致
3. 农历准确性：与 Android 版本计算结果一致
4. 性能：列表滚动流畅，无卡顿
5. 跨平台：微信小程序和 App 均可正常运行
