---
title: "下单与订单类型（市价、限价、只减仓、取消订单）"
description: "解释常见订单类型与最常见问题：为什么成交价不一样、只减仓是什么、如何撤单。"
tags:
  - Perp
  - 订单
  - Reduce Only
createdAt: "2026-02-28"
sources:
  - title: "Hyperliquid Docs：Trading"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading"
---

## 1) 市价单 vs 限价单

- **市价单**：以当前市场可成交的价格尽快成交（可能产生滑点）。
- **限价单**：只有达到你设定的价格（或更优价格）才会成交（可能不成交）。

> TODO：补充 OneKey App 的“滑点”设置位置（如有）。

## 2) 只减仓（Reduce Only）是什么？

只减仓订单只会减少当前仓位，不会在相反方向开出新仓位。

典型用途：

- 平仓
- 止盈止损触发后减少仓位

## 3) 如何取消订单（撤单）

- TODO：补充 OneKey App 内撤单路径（Open Orders → Cancel）。

## 常见问题

### Q1：为什么我下了市价单，但成交价和我看到的不一样？

- 可能原因：滑点、盘口深度不足、行情快速波动。

### Q2：为什么我挂单一直没成交？

- 你设置的限价没有被市场触达，或触达后对手盘不足。

### Q3：为什么只减仓订单提示“数量超出”？

- Reduce Only 只能在“当前可减少的仓位范围内”设置数量。
