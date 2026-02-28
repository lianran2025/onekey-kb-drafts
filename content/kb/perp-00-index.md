---
title: "OneKey Perp（永续合约）模块：文章目录（草稿）"
description: "OneKey App 内 Perp（Hyperliquid）功能的帮助中心草稿目录。覆盖常见操作与常见问题。"
tags:
  - Perp
  - 永续合约
  - Hyperliquid
  - OneKey App
createdAt: "2026-02-28"
sources:
  - title: "OneKey 帮助中心：在 OneKey App 内交易永续合约"
    url: "https://help.onekey.so/zh-CN/articles/12071735-%E5%9C%A8-onekey-app-%E5%86%85%E4%BA%A4%E6%98%93%E6%B0%B8%E7%BB%AD%E5%90%88%E7%BA%A6"
  - title: "Hyperliquid Docs：Trading"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading"
  - title: "视频教程 1"
    url: "https://youtu.be/FbgwJOdvXMc"
  - title: "视频教程 2"
    url: "https://youtu.be/ihsYwwdGN4A"
---

## 模块概览

OneKey Perp（永续合约）在 OneKey App 内由 Hyperliquid 提供交易能力。本文档用于帮助中心搭建：把常见操作（存/取款、下单、仓位、止盈止损、杠杆）与常见问题（价格、资金费率、强平、保证金、Gas）整理成一套可持续维护的文章。

同时，建议把费用口径（Hyperliquid Trading Fees + OneKey Builder fee）与风险提示放在每篇文章的固定位置，减少用户与客服的反复沟通成本。

> 说明：本文为「目录与写作提纲草稿」。每篇文章中的 **TODO** 代表需要按 OneKey 实际产品/页面路径/截图再补充。

## 推荐文章结构（按用户路径）

1. [01. OneKey Perp 是什么？（Hyperliquid 永续合约简介）](/kb/perp-01-what-is-perp)
2. [02. 开始使用 OneKey Perp：需要硬件钱包吗？需要每次确认吗？](/kb/perp-02-hardware-wallet-and-authorization)
3. [03. 交易前要准备什么？（链、资产、Gas、最低金额）](/kb/perp-03-prerequisites-chain-asset-gas)
4. [04. 存入资金到 Perp（一期：Arbitrum USDC 原生存款）](/kb/perp-04-deposit-usdc-arbitrum)
5. [05. 从 Perp 提取资金（签名、到账时间、失败排查）](/kb/perp-05-withdraw)
6. [06. 如何完成第一笔合约交易（开仓 → 平仓）](/kb/perp-06-first-trade)
7. [07. 下单与订单类型（市价、限价、只减仓、取消订单）](/kb/perp-07-order-types)
8. [08. 止盈止损 TP/SL（设置、触发价格、为什么没触发）](/kb/perp-08-tpsl)
9. [09. 仓位与面板字段说明（Position / Balance / Trades）](/kb/perp-09-position-balance-trades)
10. [10. 价格体系：标记价格 vs 最新价格（Mark vs Last）](/kb/perp-10-mark-vs-last)
11. [11. 资金费率 Funding：是什么、多久结算、为什么会收/付](/kb/perp-11-funding)
12. [12. 强制平仓与保证金：什么是强平？什么是保证金？](/kb/perp-12-liquidation-and-margin)

## 视频教程

- 教程 1：https://youtu.be/FbgwJOdvXMc
- 教程 2：https://youtu.be/ihsYwwdGN4A

## 维护建议（给内容维护者）

- 每篇文章尽量包含：**适用场景 → 最短操作路径 → 常见错误/排查 → 风险提示 → 相关链接**。
- 涉及风险/费用/清算的口径，优先引用官方来源（OneKey 帮助中心 + Hyperliquid Docs）。
