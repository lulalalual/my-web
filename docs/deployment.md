# Hexo + AnZhiYu 部署说明

当前站点不再使用 Supabase，也不需要数据库环境变量。内容由仓库内 Markdown 文件维护，推送 GitHub 后由 Vercel 自动构建。

## Vercel 配置

导入 GitHub 仓库后，Vercel 使用以下配置：

- Framework Preset：`Other`
- Build Command：`npm run build`
- Output Directory：`public`
- Install Command：`npm install`
- Root Directory：`./`

仓库里已经提供 `vercel.json`，一般情况下 Vercel 会自动读取这些配置。

## 环境变量

当前版本不需要必填环境变量。

## 本地验证

部署前执行：

```bash
npm install
npm run clean
npm run build
```

如需本地预览：

```bash
npm run dev
```

打开 `http://127.0.0.1:53248`。这个端口是为了避开本机被系统占用的端口段。

## 发布流程

1. 修改 `source/_posts/`、`source/projects/index.md` 或主题配置。
2. 本地运行 `npm run build` 确认可构建。
3. 提交并推送到 GitHub。
4. Vercel 会自动部署最新站点。

## 线上验证

Vercel 部署成功后运行：

```bash
npm run verify:deployment -- https://my-web-pi-orcin.vercel.app
```

确认以下页面返回正常：

- `/`
- `/archives/`
- `/categories/`
- `/tags/`
- `/projects/`
- `/columns/`
- `/about/`
- `/comments/`
