---
title: "仓位与面板字段说明（Position / Balance / Trades）"
description: "解释用户最常问的字段：仓位大小、仓位价值、开仓价、标记价、清算价、保证金占用、盈亏等。"
tags:
  - Perp
  - 仓位
  - PnL
createdAt: "2026-02-28"
sources:
  - title: "Hyperliquid Docs：Entry price and pnl"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/entry-price-and-pnl"
---

## Position（仓位）常见字段

> 字段名称以 OneKey App 实际 UI 为准。下面是常见字段的含义（与一期方案的字段口径一致）。

- **Asset / 交易对**：当前仓位对应的合约标的（ticker/coin）
- **方向（Long/Short）**：做多/做空（通常可由仓位 size 正负判断）
- **Position Size（仓位大小）**：你持有的合约数量（常见为币本位）
- **Position Value（仓位价值）**：仓位名义价值（常见为 USD 口径）
- **Leverage（杠杆）**：当前仓位杠杆
- **Entry Price（开仓均价）**：你的加权开仓价格
- **Mark Price（标记价格）**：用于风控/强平/触发类订单
- **Liq. Price（清算/强平价格）**：触发强平的关键阈值
- **Margin Used（保证金占用）**：为该仓位占用的保证金
- **Unrealized PnL（未实现盈亏）**：按 mark price 估算的浮动盈亏
- **PnL (ROE%)（收益率）**：常见计算口径为 `未实现盈亏 / 仓位价值 / 杠杆`（不同产品可能显示略有差异）

> 提示：不少用户最容易混淆的是 Mark / Last；如果你发现“到了价格却没触发/没强平”，优先核对 Mark Price。

## Open Orders（挂单）

- 展示未成交订单
- 常见操作：撤单、修改（如支持）

## Trades / History（历史成交）

- 用于核对成交价、手续费、触发类订单执行情况

## 常见问题

### Q1：为什么我的 PnL 和我自己算的不一样？

- PnL 通常按 Mark Price 计算（更稳健）。
- 多次加仓/减仓会导致 Entry Price 加权变化。
