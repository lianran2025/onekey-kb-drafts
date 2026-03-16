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

## 删除文章功能（GitHub 仓库删除）

如果你希望在线上页面点击“删除文章”后，直接删除 GitHub 仓库中的 `content/kb/<slug>.md` 文件，请在部署环境中配置以下变量：

```bash
GITHUB_OWNER=lianran2025
GITHUB_REPO=onekey-kb-drafts
GITHUB_BRANCH=main
GITHUB_TOKEN=你的 GitHub Token
```

说明：

- `GITHUB_TOKEN` 需要对当前仓库具有 **Contents: Read and write** 权限
- 配置完成后，删除按钮会通过 GitHub API 删除对应文章文件，并触发新的部署
- 如果未配置 `GITHUB_TOKEN`，删除功能只会在本地开发环境删除本地文件

## 复制粘贴建议

- 优先用「复制（富文本/HTML）」
- 如果 Intercom 粘贴后格式怪，尝试「复制（HTML 容器）」
- 仍不行就用「复制（Markdown）」或手动全选复制白色正文区域
