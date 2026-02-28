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

在 **OneKey Desktop App** 内，你可以通过内嵌的 **Hyperliquid** 平台进行 Perp（永续合约）交易。

## 2. Perp（永续合约）是什么？

Perps（Perpetual Futures，永续合约）是一种类似传统期货的衍生品，但与交割合约不同：**没有到期日**。

它通常适用于：

- 想进行杠杆交易的用户
- 想做空（在价格下跌时获利）的用户

## 3. OneKey 的 Perp 是否是“U 本位”？

从用户体验上，“本位”通常指：**保证金/计价资产**是什么。

- 在 OneKey App 内，Perps 交易由 Hyperliquid 提供支持。
- 关于“本位资产”的具体口径（例如：是否仅支持某种稳定币作为保证金）请以 OneKey App 内实际展示与后续文档为准。

> 建议写法：在帮助中心里尽量避免用“U 本位/币本位”一句话盖棺定论，而是明确写“支持的存入网络与资产”以及“交易面板/资产面板的计价单位”。

## 4. 交易手续费（你会看到哪些费用？）

在 OneKey App 内交易 Perps 时，可能包含两类费用：

1) **交易手续费（Trading Fees）**：由 Hyperliquid 收取，采用 14 天滚动交易量分层费率。

2) **Builder 手续费（Builder Fees）**：OneKey 对每笔交易收取 **固定 0.04%**。

> 具体费率分层与 Maker/Taker 费率以官方说明为准。

## 5. 其他可能产生的费用

根据 OneKey 帮助中心说明：OneKey **不收取**以下费用：

- 提现费用
- 资金费率（Funding Rate）

> 提示：Funding 机制本身属于永续合约的常见机制，通常是多空双方之间的交换。这里的“不收取”建议理解为：**OneKey 不向用户额外收取 Funding 费用**。

## 6. 风险提示（必须阅读）

- **高风险**：杠杆会同时放大收益与亏损。
- **强制平仓风险**：当账户权益低于维持保证金要求时，仓位可能被强平。
- **滑点与成交不确定性**：市价单/止损在剧烈波动时可能产生较大滑点。

## 7. 相关文章

- [开始使用 OneKey Perp：需要硬件钱包吗？](/kb/perp-02-hardware-wallet-and-authorization)
- [如何完成第一笔合约交易](/kb/perp-06-first-trade)
- [强制平仓与保证金](/kb/perp-12-liquidation-and-margin)
