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

## 常见问题（高频问法）

### Q1：为什么我看到最新价（Last）没到清算价，但仓位还是被强平？

- 强平通常依据 **Mark Price**，不是 Last。
- 建议在仓位面板里查看“Mark Price / Liq. Price”的距离。

### Q2：为什么我看到最新价到了止损价，但止损没触发？

- TP/SL 触发通常也依据 **Mark Price**。

### Q3：我应该看哪一个来做风险判断？

- 风控（强平、触发类订单）：优先看 **Mark Price**
- 交易决策/成交体验：Last Price 更符合“刚刚成交价”的直觉，但不适合作为风控触发判断

### Q4：怎么减少“插针误触发”的风险？

- 用更合理的止损位置（给波动留出空间）
- 降低杠杆
- 关注 Mark 与 Last 的差异（波动大时差异可能变大）
