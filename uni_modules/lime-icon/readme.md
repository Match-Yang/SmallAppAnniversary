# lime-icon 图标
图标组件，支持字体图标、Iconify图标和图片图标，提供灵活的图标注册和使用方式，支持自定义颜色、大小、前缀等属性。

> 注意：插件依赖的`lime-svg`为收费插件，若不需要svg功能，删除svg插件即可。

## 文档链接
📚 组件详细文档请访问以下站点：
- [图标文档 - 站点1](https://limex.qcoon.cn/components/icon.html)
- [图标文档 - 站点2](https://limeui.netlify.app/components/icon.html)
- [图标文档 - 站点3](https://limeui.familyzone.top/components/icon.html)

## 安装方法
1. 在uni-app插件市场中搜索并导入`lime-icon`
2. 导入后可能需要重新编译项目
3. 在页面中使用`l-icon`组件（组件）或`lime-icon`（演示）

::: tip 注意🔔 
本插件依赖的[【lime-svg】](https://ext.dcloud.net.cn/plugin?id=18519)是原生插件，如果购买(收费为8元)则需要自定义基座，才能使用，
若不需要删除即可
:::

## 基础用法

### 内置字体图标
使用默认的内置字体图标：👉️[【全部图标】](#全部图标)

```html
<l-icon name="circle" />
<l-icon name="arrow-right" />
```

### Iconify图标
支持使用[icones](https://icones.js.org/)网站上的所有Iconify图标，通过`name`属性指定：

```html
<l-icon name="ri:account-box-fill" />
<l-icon name="icon-park-outline:acoustic" />
```

### 图片图标
支持直接使用图片URL作为图标：

```html
<l-icon name="https://fastly.jsdelivr.net/npm/@vant/assets/icon-demo.png" />
<l-icon name="/static/images/icon.png" />
```

#### Unicode字符
直接使用Unicode字符作为图标：

```html
<l-icon :name="`\uE6EF`" />
```

### 图标颜色
通过`color`属性设置图标的颜色：

```html
<l-icon name="ri:aliens-fill" color="#1989fa" />
<l-icon name="icon-park-outline:acoustic" color="#ee0a24" />
```

### 图标大小
通过`size`属性设置图标的尺寸，可以指定任意CSS单位：

```html
<!-- 不指定单位，默认使用px -->
<l-icon name="ri:aliens-fill" size="40" />
<!-- 指定使用rpx单位 -->
<l-icon name="ri:aliens-fill" size="34rpx" />
```


## 高级功能

### 图标注册

#### 注册字体图标

```html
<l-icon prefix="my-icon" name="custom-icon" size="40" />
```

```javascript
// 非ts不需要引入 type FontIconConfig 
import { registerFontIcon, type FontIconConfig } from '@/uni_modules/lime-icon'

// 注册字体图标库
registerFontIcon({
  prefix: 'my-icon', // 图标前缀
  fontFamily: 'my-icon', // 字体家族名称
  icons: {
    'custom-icon': 'E600', // 图标名: Unicode编码
    'another-icon': 'E601'
  },
  fontUrl: 'https://example.com/my-icon.ttf', // 字体文件URL（可选）
  jsonUrl: 'https://example.com/icons.json' // JSON文件URL（可选）
// 非ts不需要as FontIconConfig 
} as FontIconConfig)
```

#### 注册Iconify图标
```html
<l-icon name="my-svg:custom-svg" size="40" />
```
```javascript
// 非ts不需要引入 type IconifyConfig 
import { registerIconify, type IconifyConfig } from '@/uni_modules/lime-icon'

// 注册本地Iconify图标库
registerIconify({
  prefix: 'my-svg', // 图标前缀
  icons: {
    'custom-svg': '<svg>...</svg>', // 图标名: SVG内容
    'another-svg': '<svg>...</svg>'
  },
  jsonUrl: 'https://example.com/svg-icons.json' // JSON文件URL（可选）
// 非ts不需要as IconifyConfig 
} as IconifyConfig)

```

### 私有化Iconify
默认会使用Iconify的API，如果你想私有化可按以下步骤来：

#### 第一步 安装依赖

```cmd
yarn add @iconify/json @iconify/tools @iconify/utils
```

#### 第二步 配置生成脚本
- 在根目录新建一个`lime-icons.config.js`文件：

```javascript
// lime-icons.config.js
module.exports = {
	// 输入的文件目录，自有的SVG，如果没有则不需要
	input: {
		prefix: "my-icons",
		dir: '/static/svg',
	},
	// 输出的配置
	output: {
		// 输出的文件目录
		dir: '/static/icons',
		// 输出的文件的格式，如果是JSON则是一个图标合集
		// file: 'icons.json',
		// 如果是SVG则是每个图标做为单独的文件
		file: '*.svg',
	},
	// 指定使用的图标
	icons: [
		'el:address-book', 
		'uil:12-plus',
		'icon-park-outline:abdominal',
		'icon-park-outline:acoustic'
	]
}
```

在终端执行脚本：
```cmd
node ./uni_modules/lime-icon/generate-icons.js
```

#### 第三步 挂载图标地址

> 注意：如果使用了Iconify的API，小程序需要去公众平台设置下载白名单 `https://api.iconify.design`

```javascript
// main.js | main.ts | main.uts
// 配置svg指定路径，后期可上传到后端，不占用本地空间，如果使用的是Iconify也可以不配置这一步
import { setIconifyApi } from '@/uni_modules/lime-icon'

// 设置自定义Iconify API地址
setIconifyApi('https://your-custom-api.com')
```

## API文档

### 组件API

#### Props
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 图标名称、URL或Unicode字符 | <em>string</em> | `` |
| prefix | 图标前缀 | <em>string</em> | `l` |
| color | 图标颜色 | <em>string</em> | `` |
| size | 图标尺寸 | <em>string/number</em> | `16px` |
| inherit | 是否继承颜色 | <em>boolean</em> | `true` |
| web | 原生app是否使用web渲染 | <em>boolean</em> | `false` |
| lClass | 自定义类名 | <em>string</em> | `` |
| lStyle | 自定义样式 | <em>string/object/array</em> | `` |

#### Events
| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击事件 | - |

### 工具函数API

#### registerFontIcon
注册字体图标库

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| config | `FontIconConfig` | 字体图标配置对象 |
| config.prefix | `string` | 图标前缀 |
| config.fontFamily | `string` | 字体家族名称 |
| config.icons | `UTSJSONObject` | 图标映射（可选） |
| config.fontUrl | `string` | 字体文件URL（可选） |
| config.jsonUrl | `string` | JSON文件URL（可选） |
| config.autoLoadJson | `boolean` | 是否自动加载JSON（可选） |
```js
registerFontIcon(config: FontIconConfig)
```


**类型定义**：`(config: FontIconConfig) => Promise<void>`
**返回值**：`Promise<void>`

#### registerIconify
注册Iconify图标库

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| config | `IconifyConfig` | Iconify图标配置对象 |
| config.prefix | `string` | 图标前缀 |
| config.icons | `UTSJSONObject` | 图标映射（可选） |
| config.apiUrl | `string` | Iconify API地址（可选，默认：`https://api.iconify.design`） |
| config.jsonUrl | `string` | JSON文件URL（可选） |
| config.autoLoadJson | `boolean` | 是否自动加载JSON（可选） |

```js
registerIconify(config: IconifyConfig)
```


**类型定义**：`(config: IconifyConfig) => Promise<void>`
**返回值**：`Promise<void>`

#### setIconifyApi
设置默认Iconify API地址

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| apiUrl | `string` | Iconify API地址 |

```js
setIconifyApi(url: string)
```

**类型定义**：`(apiUrl: string) => void`
**返回值**：`void`

#### getIconifyApi
获取当前默认Iconify API地址

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| 无 | | |

```js
getIconifyApi()
```


**类型定义**：`() => string`
**返回值**：`string`

#### parseIconName
解析图标名称

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| name | `string` | 图标名称 |
| prefix | `string` | 默认前缀（可选） |

```js
parseIconName(name: string, prefix?: string)
```

**类型定义**：`(name: string, prefix?: string) => ParsedIconName`
**返回值**：`ParsedIconName` 对象

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| prefix | `string` | 图标前缀 |
| iconName | `string` | 图标名称 |
| hasPrefix | `boolean` | 是否有前缀 |
| isImage | `boolean` | 是否是图片 |
| isUnicode | `boolean` | 是否是Unicode字符 |
| isSvg | `boolean` | 是否是SVG图标的路径 |

#### useIcon
核心Hook，返回图标信息

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| name | `string` | 图标名称 |
| options | `UseIconOptions` | 配置选项（可选） |
| options.prefix | `string` | 默认前缀 |

```js
useIcon(name: string, options?: UseIconOptions)
```

**类型定义**：`(name: string, options?: UseIconOptions) => UseIconReturn`
**返回值**：`UseIconReturn` 对象

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| type | `string` | 图标类型（`image`/`font`/`iconify`/`unknown`） |
| fontIcon | `FontIconInfo` | 字体图标信息 |
| iconifyUrl | `string` | Iconify图标URL |
| iconifyInfo | `IconifyInfo` | Iconify图标信息 |
| imageUrl | `string` | 图片URL |
| parsed | `ParsedIconName` | 解析后的图标信息 |

#### font
获取字体图标对应的Unicode字符

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| iconName | `string` | 图标名称 |
| prefix | `string` | 图标前缀（可选） |

```js
font(name: string, prefix?: string)
```


**类型定义**：`(iconName: string, prefix?: string) => string`
**返回值**：`string`（Unicode字符）

## 主题定制

组件提供了丰富的CSS变量用于自定义样式：

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --l-icon-size | <em>16px</em> | 图标大小 |
| --l-icon-color | <em></em> | 图标颜色（仅icon-font生效） |

## 快速预览
导入插件后，可以直接使用以下标签查看演示效果：

```html
<!-- 代码位于 uni_modules/lime-icon/components/lime-icon -->
<lime-icon />
```


## 插件标签说明

| 标签名 | 说明 |
| --- | --- |
| `l-icon` | 组件标签，用于实际开发中 |
| `lime-icon` | 演示标签，用于查看示例效果 |

## Vue2使用说明
本插件使用了`composition-api`，如需在Vue2项目中使用，请按照[官方教程](https://uniapp.dcloud.net.cn/tutorial/vue-composition-api.html)配置。

### 基础配置
关键配置代码（在main.js中添加）：

```js
// vue2
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)
```


## 支持与赞赏

如果你觉得本插件解决了你的问题，可以考虑支持作者：

| 支付宝赞助 | 微信赞助 |
|------------|------------|
| ![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/alipay.png) | ![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/wpay.png) |