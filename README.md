# OneKey KB Draft Pages (Vercel)

一个用于生成/展示“知识库草稿文章”的 Next.js 站点。

- 每篇文章 = 一个独立页面（`/kb/<slug>`）
- 页面内提供 **复制（富文本/HTML）** 按钮，便于粘贴到 Intercom
- 文章内容使用 `content/kb/*.md` 管理（带 frontmatter）

## 本地运行

```bash
npm install
npm run dev
# open http://localhost:3000
```

## 添加新文章

在 `content/kb/` 新建一个 `my-article-slug.md`，示例：

```md
---
title: "标题"
description: "一句话摘要（可选）"
tags:
  - 标签1
createdAt: "2026-02-24"
sources:
  - title: "参考来源标题"
    url: "https://example.com"
---

## 正文

...
```

## 部署到 Vercel

1. 把本目录推到 GitHub 仓库
2. Vercel → New Project → Import Git Repository
3. Framework 选择 Next.js（自动识别）
4. 直接 Deploy

> 默认是公开站点（不加权限）。

## 复制粘贴建议

- 优先用「复制（富文本/HTML）」
- 如果 Intercom 粘贴后格式怪，尝试「复制（HTML 容器）」
- 仍不行就用「复制（Markdown）」或手动全选复制白色正文区域
