---
title: "交易 Perp 前要准备什么？（链、资产、Gas、最低金额）"
description: "回答高频问题：准备哪条链/哪种资产；没 Gas 怎么办；最低存款/取款与到账时间。"
tags:
  - Perp
  - 资金
  - Gas
  - Arbitrum
createdAt: "2026-02-28"
sources:
  - title: "OneKey 帮助中心：在 OneKey App 内交易永续合约"
    url: "https://help.onekey.so/zh-CN/articles/12071735-%E5%9C%A8-onekey-app-%E5%86%85%E4%BA%A4%E6%98%93%E6%B0%B8%E7%BB%AD%E5%90%88%E7%BA%A6"
---

## 1) 交易 Perp 需要准备哪条链、哪种资产？

- TODO：按 OneKey 当前版本的实际支持补充。
-（一期产品方案示例）只支持通过 **Arbitrum** 存入 **USDC**。

## 2) 账户里没有 Gas 时该如何处理？

Gas 用于支付链上交易手续费（例如 Arbitrum 上的 ETH）。

常见解决方法：

1. 从交易所提币时，顺便提取少量 Arbitrum ETH 作为 Gas。
2. 使用 Swap/跨链把一部分资产换成少量 Gas（如果 OneKey App 支持）。

> 风险提示：不要把全部资产都换成 Gas；通常少量即可。

## 3) 最低存款/最低取款/到账时间

- TODO：按产品最新口径填写。
-（一期产品方案示例）
  - 最低存款：5 USDC
  - 最低取款：$2
  - 取款到账：约 5 分钟（批处理）

## 常见问题

### Q1：我转账成功了，但 Perp 余额没显示？

- 等待区块确认
- 刷新页面/重新进入 Perp
- TODO：给出“多长时间算异常”的建议阈值（例如 10-20 分钟）
