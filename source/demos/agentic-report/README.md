# Agent 轨迹实验结果展示

可从 `/demos/agentic-report/` 单独打开，也可同源 iframe 嵌入。只有本地 HTML、CSS、JavaScript 和数据文件；站内字体与图标 CSS 使用已有公共路径，不调用模型或外部服务。

## 展示内容

- 1 个手工任务、3 条预设轨迹、15 个原奖励指标。
- 5 项投机提示、失败归因、2 对原偏好记录。
- SFT 2 条、DPO 2 条、GRPO 1 组的全部实际字段与嵌套内容。
- 原报告的 8 轮小型特征权重实验与独立的单步权重更新。
- 原报告 JSON、三种原 JSONL、原结构 SVG 和派生轨迹数据下载。

## 来源与调整

`data/original/` 的 5 个文件共 16,958 字节，来自 `agentic_rl_tool_optimizer`，复制时保留原字节。原来源相对路径、公示路径、SHA256 和字节数记录在 `data/source-manifest.json`。只调整公开目录位置，没有改原 JSON 的字段或数值；其 `training_exports` 原本就是相对路径。

原工程没有 `training_rows.json`。本页从原 `src/agentic_rl_tool_optimizer/cli.py::_demo_data` 只读提取 dataclass，生成 `data/training_rows.json`。其中任务、计划、调用参数、输出、最终回答和特征值均未改写；派生标记和原 CLI 的 SHA 单独保留。网页不把该文件称为历史输出。

网页是本次新增的结果阅读层，不冒称原工程自带 dashboard。原终端风格排版 PNG 未复制、未用作运行截图。SFT 导出仍保留原 `traj_gaming`，界面说明提示与筛选阈值分离，不宣称硬门禁或真实模型训练。

## 主题、移动与耗电

同源 iframe 读取父页 `data-theme` 与作品区色彩变量，使用 MutationObserver 随主题变化更新；独立打开按系统偏好初始化，也可切换深浅色或用 `?theme=dark` / `?theme=light`。没有轮询、计时训练、自动播放、常驻 canvas 或动画循环；`prefers-reduced-motion` 禁止动效并关闭平滑滚动。

界面按 320px 起设计：单列轨迹、换行字段与 JSON、两列规模数字、44px 控件和原生 details。浏览器端的真实 320px、深浅色和 iframe 视觉验收由主代理接入时完成；此目录的 Node 检查不能替代浏览器布局验收。

## 轻量检查

```text
node --check app.js
node check.mjs
```

检查读取实际本地数据，用 Node VM 验证动态结果构建、奖励数值、偏好对、导出字段、主题按钮、链接存在和原件 SHA；结果写 `verification.json`。不启动服务、不调用外网、不安装依赖。
