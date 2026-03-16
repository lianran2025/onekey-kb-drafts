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

## 管理后台（GitHub 登录白名单）

本项目支持公开阅读页 + 私有管理后台：

- 公开页：`/`、`/kb/<slug>`
- 后台页：`/admin`、`/admin/kb/<slug>`

后台仅允许白名单中的 GitHub 账号登录访问。请在部署环境中配置：

```bash
AUTH_SECRET=随机长字符串
AUTH_GITHUB_ID=你的 GitHub OAuth App Client ID
AUTH_GITHUB_SECRET=你的 GitHub OAuth App Client Secret
ADMIN_GITHUB_USERS=sanmao2311
```

说明：

- `ADMIN_GITHUB_USERS` 支持多个 GitHub 用户名，以英文逗号分隔
- 后台中的发布、删除等操作都只会在登录且命中白名单后可用

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
- 配置完成后，后台删除按钮会通过 GitHub API 删除对应文章文件，并触发新的部署
- 如果未配置 `GITHUB_TOKEN`，删除功能只会在本地开发环境删除本地文件

## 发布到 Intercom（直连）

后台页面现在会实时读取 Intercom 的 collections，并允许管理员在发布前选择目标 collection。

请在部署环境中配置：

```bash
INTERCOM_REGION=us
INTERCOM_ACCESS_TOKEN=你的 Intercom Access Token
INTERCOM_LOCALE=zh-CN
```

说明：

- `INTERCOM_REGION` 支持 `us`、`eu`、`au`
- 后台会通过 Intercom API 读取 collection 列表
- 发布按钮会直接把当前文章渲染后的 HTML 发布到你选择的 collection
- 发布前会自动对标题、段落、列表、引用块、链接等标签做 Intercom 样式适配
- 参考来源模块不会被发布到 Intercom
- Intercom token 仅在服务端使用，不会暴露到前端

## 复制粘贴建议

- 优先用「复制（富文本/HTML）」
- 如果 Intercom 粘贴后格式怪，尝试「复制（HTML 容器）」
- 仍不行就用「复制（Markdown）」或手动全选复制白色正文区域
