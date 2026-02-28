---
title: "强制平仓（Liquidation）与保证金（Margin）：什么是强平？什么是保证金？"
description: "解释保证金、维持保证金、强平触发条件、清算价的意义，以及降低强平风险的方法。"
tags:
  - Perp
  - 强平
  - 保证金
createdAt: "2026-02-28"
sources:
  - title: "Hyperliquid Docs：Liquidations"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations"
---

## 1) 什么是保证金（Margin）？

保证金可以理解为：为了支撑你的杠杆仓位，系统要求你锁定的一部分资金。

- 初始保证金（Initial Margin）：开仓时所需
- 维持保证金（Maintenance Margin）：维持仓位不被强平的最低要求

## 2) 什么是强制平仓（Liquidation）？

当仓位朝不利方向波动，导致账户权益（Equity）低于维持保证金要求时，系统可能触发强平。

根据 Hyperliquid 文档：强平使用 **Mark Price（标记价格）**。

## 3) 清算/强平价格（Liq. Price）怎么理解？

- Liq. Price 是一个“风险阈值”：当 Mark 触及/穿过该阈值，仓位可能被强平。
- TODO：结合 OneKey UI 写清楚“预估清算价”和“开仓后清算价”的差异。

## 4) 如何降低强平风险（实用清单）

- 降低杠杆
- 减少仓位
- 补充保证金（增加账户权益）
- 设置止损（SL）

## 常见问题

### Q1：为什么我设置了较低杠杆，清算价还是很接近？

- 可能原因：保证金不足、仓位价值较大、其他仓位/未实现盈亏影响（全仓模式）。

### Q2：为什么我觉得“还没到”，但还是被强平？

- 核对当时的 Mark Price（强平依据），而不是 Last Price。
