# 静态适配验证记录

验证日期：2026-10-16。以下为本子目录的本地验证，不使用远程服务。

- `app.js`、`search.mjs`、`primitives.mjs` 的 Node 语法检查通过。
- 原 `motion-library/search.ts` 使用原工程现有 TypeScript 转译后，在同一注册表上与 `search.mjs` 对照 **146 组查询**；资产顺序、分值和命中理由一致。包括空请求、空白、14 类规则、英文、组合语义、全部标题与标签、未命中及 240 字符截断。
- 原 SVG 渲染器检查 **216 组**资产/主题/帧/参数组合；均生成 SVG，没有非有限数值或脚本标签。超长标题拒绝与文本转义检查通过。这些字符串与参数检查不构成视觉审片。
- **18 个 MP4、18 个 PNG** 的字节数与 SHA-256 均与原件、原 evidence 中的媒体 SHA 一致，清单见 `MEDIA-INVENTORY.json`。
- FFprobe 独立读取全部 **18 个 MP4**，均为 **1920×1080、30 fps、60 帧、2 秒**；全部 **18 个 PNG** 的文件头尺寸为 1920×1080。
- 资产 JSON 仅包含登记字段与 `technicalPassed/contrastWarnings/reviewStatus/validatedAt/media{width,height,fps,duration}` 摘要；18 项状态仍为 `UNVERIFIED`，质量分仍为 null，审美状态仍为 `technical_only; visual review pending`。
- HTML 的本地链接、样式、脚本，JS 的本地模块与 JSON，登记 ID 的全部媒体路径存在。没有后端请求；没有外部依赖资源 URL。SVG 的 W3C 命名空间不是网络请求。
- 公开文本未检出 Windows 绝对路径、Bearer 值、常见私钥或凭据格式。路径检测已区分本地来源协议与盘符路径。原作者与许可声明已逐项保留，没有引入用户实名字段。
- 列表代码没有自动播放属性；视频初始不预加载，并保留可见性、隐藏文档和同源父页消息的暂停处理。此条为代码核对，实际浏览器播放、暂停、Range/seek、复制权限和交互需集成任务验证。

浏览器交互、全站构建、移动端观感和正式发布不在本记录的通过范围内。
