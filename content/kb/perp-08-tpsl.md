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

常见有两种入口：

- 从 **仓位（Position）** 里设置（更适合新手）
- 在 **下单时** 同时设置 TP/SL（与订单绑定）

（一期方案示例）

- 一期仅支持 **市价** 止盈止损（TP/SL market）。

> TODO：补充 OneKey App 内具体入口与截图。
## 4) 常见问题

### Q1：为什么到最新价了，止损没触发？

- 触发依据是 Mark Price，不是 Last Price。

### Q2：触发后成交价偏离很大怎么办？

- 市价止损在剧烈波动时可能出现滑点。
- 在 Hyperliquid，TP/SL 市价单通常会带有默认的滑点容忍度（例如 10%）。
- 如果后续版本支持 TP/SL 限价单，你可以通过设置更激进的限价提高成交概率（但也可能挂单不成交）。

### Q3：我取消了父订单，为什么子 TP/SL 也没了？

- 可能是“与父订单绑定”的 TP/SL 逻辑（OCO/子单）。
- TODO：结合 OneKey 实现补充解释与建议。
