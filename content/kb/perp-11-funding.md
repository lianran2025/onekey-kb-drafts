---
title: "资金费率 Funding：是什么、多久结算、为什么会收/付"
description: "解释资金费率的作用、正负含义、结算频率，以及和手续费的区别。"
tags:
  - Perp
  - Funding
  - 费用
createdAt: "2026-02-28"
sources:
  - title: "Hyperliquid Docs：Funding"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding"
---

## 1) Funding 是什么？

资金费率（Funding）是永续合约中用于让合约价格贴近现货价格的一种机制。

- Funding 通常是 **多空双方之间的定期交换**
- Funding **不是**每笔成交收取的交易手续费

> OneKey 帮助中心中提到 “OneKey 不收取资金费率（Funding Rate）”。建议理解为：OneKey 不会向你额外加收 Funding 费用；Funding 机制本身如何产生与结算，仍以 Hyperliquid 规则为准。

## 2) Hyperliquid 的 Funding 频率

根据 Hyperliquid 文档：Funding **每小时支付一次**。

## 3) Funding 为正/负分别代表什么？

- Funding > 0：通常代表 **多头支付空头**
- Funding < 0：通常代表 **空头支付多头**

## 4) 常见问题

### Q1：我没交易，为什么也产生了 Funding？

只要你持有仓位，到了结算时间点就可能产生 Funding 收/付。

### Q2：Funding 和手续费有什么区别？

- 手续费：每次成交产生
- Funding：按时间间隔在持仓双方之间发生
