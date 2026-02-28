---
title: "OneKey Perp 是什么？（Hyperliquid 永续合约简介）"
description: "解释 Perp（永续合约）是什么、OneKey 与 Hyperliquid 的关系、是否为 U 本位体验，以及风险提示。"
tags:
  - Perp
  - 永续合约
  - Hyperliquid
createdAt: "2026-02-28"
sources:
  - title: "OneKey 帮助中心：在 OneKey App 内交易永续合约"
    url: "https://help.onekey.so/zh-CN/articles/12071735-%E5%9C%A8-onekey-app-%E5%86%85%E4%BA%A4%E6%98%93%E6%B0%B8%E7%BB%AD%E5%90%88%E7%BA%A6"
---

## 1. OneKey Perp 与 Hyperliquid 的关系

在 OneKey Desktop App 内，你可以通过内嵌的 Hyperliquid 平台进行 Perp（永续合约）交易。

## 2. Perp（永续合约）是什么？

Perp 全称 Perpetual Futures（永续合约）。它是一种类似传统期货的衍生品，但与交割合约不同：**没有到期日**。

Perp 常用于：

- 杠杆交易（放大收益/损失）
- 做空（在价格下跌时获利）

## 3. OneKey 的 Perp 是否是“U 本位”？

从用户体验上，“本位”通常指：**保证金/结算资产**是什么。

- TODO：按 OneKey 实际产品口径补充（例如：一期存入/使用 USDC 的规则，是否仅支持 USDC 作为保证金）。

## 4. 风险提示（必须阅读）

- **高风险**：杠杆会同时放大收益与亏损。
- **强制平仓风险**：当账户权益低于维持保证金要求时，仓位可能被强平。
- **滑点与成交不确定性**：市价单/止损在剧烈波动时可能产生较大滑点。

## 5. 相关文章

- [开始使用 OneKey Perp：需要硬件钱包吗？](/kb/perp-02-hardware-wallet-and-authorization)
- [如何完成第一笔合约交易](/kb/perp-06-first-trade)
- [强制平仓与保证金](/kb/perp-12-liquidation-and-margin)
