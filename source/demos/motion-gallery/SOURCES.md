# Motion Gallery 静态复用来源

本子页复用 Pixel Motion Factory 原 Motion Gallery，作为同源的动效实验页面。来源文件以原工程相对路径记录；没有提交号的工作目录使用文件 SHA-256 定位，见 `SOURCE-FILES.json`。

| 本目录文件 | 原工程来源 | 处理 |
| --- | --- | --- |
| `index.html` | `apps/motion-gallery/index.html` | 保留原版工作台、详情、对比与弹窗结构；资源地址改为相对路径，加入同源资源策略 |
| `app.js` | `apps/motion-gallery/app.js` | 保留搜索、分类、MP4/SVG、参数、逐帧、主题、收藏、本地评分备注、复制、对比与大预览；适配静态索引和可见性暂停 |
| `style.css` | `apps/motion-gallery/style.css` | 保留原布局、配色、响应式样式；补充剪贴板兼容节点样式 |
| `primitives.mjs` | `motion-library/verified/primitives.mjs` | 字节一致复制原可参数化 SVG 渲染器 |
| `search.mjs` | `motion-library/search.ts` | 复刻原 14 条语义规则、权重、标签和名称加分、文字类降权、去重与排序；查询截断为 240 字符，空请求保持注册表顺序 |
| `assets.json` | `motion-library/registry/assets.json` 与已登记媒体的 evidence 摘要 | 仅导出页面使用的白名单字段；不复制完整 evidence、运行记录或配置 |
| `media/*.mp4`、`media/*.png` | `motion-library/previews/{登记ID}.mp4/.png` | 仅复制 18 个登记 ID 对应的 36 个文件，逐文件大小、SHA-256、作者和许可见 `MEDIA-INVENTORY.json` |

## 署名与版权登记

本次 18 项的原始 `source_url` 均为 `local://motion-library/verified/primitives.mjs`，`author` 均为 `Pixel Motion Factory`，原许可声明为 `Project-local original code`，逐项保留。当前快照没有需改名的用户实名，也没有第三方候选资产混入这 18 项。此处记录原项目声明，没有新增 MIT、CC 或其他再许可。UI 与渲染器保留 Pixel Motion Factory 来源标识。原工程根目录未见独立 LICENSE、COPYING 或 NOTICE 文件；本适配没有给原 UI 或渲染代码追加许可。

36 个媒体文件合计 **4,149,055 字节**（约 **3.96 MiB**）。视频为 18 个原始 MP4，封面为 18 个原始 PNG。未重新压缩、转码或请求远程生成；资源 SHA 与原件一致。全部视频的登记媒体信息为 1920×1080、30 fps、2 秒；建议时长仅用于 SVG 参数预览和 SceneSpec 示例，不改变实际 MP4 时长。

所有注册项维持 `validation_status=UNVERIFIED`、`quality_score=null`。QA 摘要保留原 `technical_only; visual review pending` 以及原验证日期；本次静态适配没有将原技术记录改称新审片通过。

## 静态运行与父页协议

运行依赖仅为浏览器原生 ES Modules、SVG、HTML Video、Fetch、LocalStorage、Dialog、IntersectionObserver 和 Clipboard API；字体使用系统回退。没有后端、外部 CDN、远程字体或第三方运行时依赖。通过 HTTP(S) 服务本目录后打开 `index.html`；`file://` 的模块与 Fetch 限制不属于支持方式。托管端需提供标准静态 MP4 Range 响应以支持视频拖动与浏览器 seek。

列表 MP4 使用 `preload="none"` 且不自动播放，显示本地封面。详情、双资产对比和弹窗仅在页面与相应区域可见且播放状态开启时播放；弹窗打开时暂停其后方视频。隐藏文档、离开视口、父页暂停和离开页面均会暂停视频；隐藏 iframe 同时停止 SVG 帧更新。备注、评分与收藏只写本浏览器的 `portfolio-pmf-motion-gallery-v1`，没有上传。

嵌入 iframe 初始暂停。父页面在 iframe 加载后和可见性变化时发送：

```js
iframe.contentWindow.postMessage(
  { type: 'portfolio:viewport', visible: true },
  location.origin
);
```

离开父页视口时发送 `visible: false`；进入时发送 `true`。子页只接受同源父窗口、类型与布尔字段均符合协议的消息，并向父页发出 `{ type: 'portfolio:ready' }`。独立打开本子页无需消息即可播放。

未公开原始绝对路径、完整 skill、运行日志、提示词、配置或凭据。`code_path`、`preview_path` 与 `thumbnail_path` 保留原工程内的相对来源含义，浏览器实际加载 `./primitives.mjs` 和 `./media/`。

## 本次验证范围

语法、搜索规则对照、媒体登记与哈希、静态引用和白名单扫描记录见 `VALIDATION.md`。整站构建、真实浏览器交互、窄屏与发布由集成任务验证，不能由这些静态检查替代。
