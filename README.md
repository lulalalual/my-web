# 青阳寻雪

青阳寻雪的个人技术博客，使用 `Hexo + AnZhiYu` 主题构建，部署在 Vercel。

## 本地开发

```bash
npm install
npm run dev
```

默认打开 `http://127.0.0.1:53248`。

## 内容维护

- 文章：`source/_posts/*.md`
- 项目页：`source/projects/index.md`
- 专栏页：`source/columns/index.md`
- 关于页：`source/about/index.md`
- 站点配置：`_config.yml`
- 主题配置：`_config.anzhiyu.yml`
- 自定义样式：`source/css/custom.css`

新增文章时，在 `source/_posts/` 下创建 Markdown 文件，并写入 Hexo front matter。

## 构建

```bash
npm run clean
npm run build
```

构建产物输出到 `public/`，Vercel 会使用该目录作为静态站点输出。

## 部署

部署说明见 [docs/deployment.md](./docs/deployment.md)。
