---
title: "止盈止损 TP/SL：如何设置、何时触发、为什么没触发"
description: "讲清楚 TP/SL 的触发价格（Mark Price）、市价/限价止盈止损的差异，以及常见误解。"
tags:
  - Perp
  - TP/SL
  - 风控
createdAt: "2026-02-28"
sources:
  - title: "Hyperliquid Docs：TP/SL"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/take-profit-and-stop-loss-orders-tp-sl"
  - title: "Hyperliquid Docs：Robust price indices（Mark Price）"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/robust-price-indices"
---

## 1) TP/SL 是什么？

- **TP（Take Profit）止盈**：达到目标盈利价格后自动平仓/减仓
- **SL（Stop Loss）止损**：达到最大可承受亏损价格后自动平仓/减仓

## 2) TP/SL 用什么价格触发？

在 Hyperliquid 上，TP/SL 触发使用 **Mark Price（标记价格）**。

这也是最常见“为什么到最新价了没触发”的原因：你看的可能是 **Last Price（最新成交价）**。

## 3) 在 OneKey App 中如何设置 TP/SL

- TODO：补充入口（从仓位设置 / 从下单时绑定）。
- TODO：补充一期支持范围（例如：一期仅支持市价止盈止损）。

## 4) 常见问题

### Q1：为什么到最新价了，止损没触发？

- 触发依据是 Mark Price，不是 Last Price。

### Q2：触发后成交价偏离很大怎么办？

- 市价止损在剧烈波动时可能出现滑点。
- 若支持限价止损，可通过设置更激进的限价提高成交概率（但也可能挂单不成交）。

### Q3：我取消了父订单，为什么子 TP/SL 也没了？

- 可能是“与父订单绑定”的 TP/SL 逻辑（OCO/子单）。
- TODO：结合 OneKey 实现补充解释与建议。
