---
title: "什么是标记价格（Mark Price）？什么是最新价格（Last Price）？"
description: "解释 Mark 与 Last 的区别，以及为什么强平/止损使用 Mark。"
tags:
  - Perp
  - Mark Price
  - 风控
createdAt: "2026-02-28"
sources:
  - title: "Hyperliquid Docs：Liquidations（强平使用 Mark Price）"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations"
  - title: "Hyperliquid Docs：TP/SL（触发使用 Mark Price）"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/take-profit-and-stop-loss-orders-tp-sl"
---

## 1) 最新价格（Last Price）

Last Price 通常指“最近一笔成交的价格”。

它更贴近用户直觉：你在图表上看到的短期跳动，很多时候就是 last。

## 2) 标记价格（Mark Price）

Mark Price 是用于风险控制的价格，通常结合外部指数/现货参考价与交易簿状态等信息计算。

在 Hyperliquid：

- **强制平仓（Liquidation）使用 Mark Price**
- **止盈止损（TP/SL）触发使用 Mark Price**

## 3) 为什么 Mark 可能和 Last 不一样？

常见原因：

- 市场波动很大、盘口深度不足
- 单笔成交把 last 打到极端价格
- Mark 更偏向“稳健风控”，避免被瞬时插针影响

## 4) 用户应该怎么用？

- 看强平风险：优先关注 Mark 与清算价的距离
- 设置止损：以 Mark 逻辑更贴近实际触发条件

## 常见问题

### Q：为什么我看到最新价没到清算价，但仓位还是被强平？

- 需要核对当时的 Mark Price（而不是 Last Price）。
