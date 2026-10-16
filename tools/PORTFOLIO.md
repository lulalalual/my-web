# 作品集维护

保留 Hexo / AnZhiYu 与既有文章地址。运行 `npm run build` 会先生成作品集页面，再生成 Hexo 公共文件。

- `source/portfolio-assets/projects.json`：项目说明、角色、交付状态、封面、应用路径。一份数据生成首页卡片、体验切换与独立项目页。
- `opensource.json`、`journal.json`：贡献及精选文章。贡献状态需核实后更新。
- `tools/templates/portfolio-home.html`：精简首页与栏目入口。工作经历维护于 `source/experience/index.html`；方案实践与开源页由构建器生成。不要直接修改生成的 `source/index.html`、`source/practice/index.html`、`source/opensource/index.html` 或 `source/work/*/index.html`。
- `site.css`：作品集布局及主题变量；`theme-bridge.css`：原主题的接合边界。
- `site.js`：旧首页锚点兼容、动效协调与邮箱复制；`native-navigation.js`：原生横向菜单、当前栏目与边界校正；`portfolio-media.js`：共享体验框、加载和全屏。详情使用原生独立页面。全站动效约定见 `tools/MOTION.md`，独立样式位于 `motion.css`，默认开启且没有手动开关。
- `explanation-player.js/css`：项目与博客图解共用控制器。主题分别存于 `diagrams/topics.json` 与 `knowledge/topics.json`；构建时自动同步到内层动画的数据与时长，避免播放器文字与画面各改一份。每主题四步、12 秒；播放器不把图解当作真实运行结果。
- `tools/templates/portfolio-diagram.html` 与 `diagrams/scenes.js`：方案与实践图解的时间线和独立场景。修改模板后重新构建，勿直接编辑生成的 `composition.html`。
- `source/demos/`：原项目。塔防 `web-ui.js` 处理父页面的可见性消息，离屏暂停实际 WASM 主循环；回到视口后由用户继续。

封面保留原图。可选 `responsive/名称-480.webp`、`名称-800.webp`；没有变体时自动使用原图，不产生缺失链接。设置真实 `coverWidth/coverHeight` 预留空间。

项目卡片与体验合并在 `#work` 内；点击卡片的体验入口才展开共用框，不再另列体验栏目或重复的项目标签。旧 `#showcase` 与 `?project=` 链接继续兼容。

修改媒体管理器后需检查详情→启动、卡片切换、失败重试、全屏、离屏暂停；修改样式后需检查 320/390/768/1440 宽度、横屏、浅深主题与减少动效。不要在公共目录加入简历、密钥、个人实名或公司名称。
