---
title: "如何在 Linux 系统上安装 OneKey 应用"
description: "介绍如何在 Linux 系统上安装 OneKey App，包括 udev 规则、Snap 安装、AppImage 运行，以及新版 Ubuntu 的常见启动问题。"
tags:
  - Linux
  - OneKey App
  - AppImage
  - Snap
createdAt: "2026-07-01"
sources:
  - title: "OneKey 帮助中心：如何在 Linux 系统上安装 OneKey 应用"
    url: "https://help.onekey.so/zh-CN/articles/11461181"
  - title: "Trezor：Installing Trezor Suite on Linux"
    url: "https://trezor.io/guides/trezor-suite/installing-trezor-suite-on-linux"
---

## 适用范围

本文适用于需要在 Linux 系统上安装和运行 OneKey App 的用户。

不同 Linux 发行版的依赖和权限策略可能不同。本文以 Ubuntu / Debian 系统为主要示例，同时提供通用的 udev 规则配置方法。

## 安装前准备：配置 udev 规则

在 Linux 系统中，udev 规则用于让系统正确识别 OneKey 硬件钱包。无论你使用 Snap 还是 AppImage，都建议先完成此步骤。

1. 下载并安装 OneKey udev 规则：

```bash
sudo curl -fsSL https://data.onekey.so/onekey.rules -o /etc/udev/rules.d/99-onekey.rules
```

如果系统未安装 `curl`，可以先运行：

```bash
sudo apt update
sudo apt install curl
```

2. 重新加载 udev 规则：

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

3. 重新插拔 OneKey 硬件钱包，然后再打开 OneKey App。

## 方法一：通过 Snap 安装

1. 安装 Snap：

```bash
sudo apt update
sudo apt install snapd
```

如果你使用的是其他 Linux 发行版，可参考 Snap 官方文档安装 `snapd`。

2. 安装 OneKey App：

```bash
sudo snap install onekey-wallet
```

你也可以打开 Snap 商店页面安装：

https://snapcraft.io/onekey-wallet

3. 允许 OneKey App 访问 USB 设备：

```bash
sudo snap connect onekey-wallet:raw-usb
```

4. 打开 OneKey App，并选择连接硬件钱包。

### 如果 Snap 版本无法启动

如果启动时出现类似错误：

```bash
error while loading shared libraries: libgbm.so.1: cannot open shared object file
```

通常表示当前 Snap 包内缺少图形库依赖。由于 Snap 使用沙箱隔离机制，即使在宿主机系统中安装 `libgbm1`，Snap 应用也不一定能读取宿主机中的图形库。

如遇到该问题，建议暂时改用 AppImage 版本，或等待 OneKey 更新 Snap 安装包后再使用 Snap 版本。

## 方法二：下载并运行 AppImage

1. 前往 OneKey 官网下载 Linux AppImage 文件：

https://onekey.so/download

2. 安装 AppImage 所需依赖。

Ubuntu / Debian 系统可运行：

```bash
sudo apt update
sudo apt install libfuse2
```

如果你的系统提示找不到 `libfuse2`，请根据当前发行版的 AppImage / FUSE 依赖说明安装对应包。

3. 切换到 AppImage 文件所在目录，例如：

```bash
cd ~/Downloads
```

4. 赋予 AppImage 可执行权限：

```bash
chmod +x OneKey-Wallet-*.AppImage
```

5. 运行 OneKey App：

```bash
./OneKey-Wallet-*.AppImage
```

### Ubuntu 24.04 及以上版本无法启动怎么办

在 Ubuntu 24.04 及以上版本中，系统默认启用了更严格的非特权用户命名空间限制。部分 AppImage 应用可能会因为 Electron / Chromium 沙箱初始化失败而无法启动。

如果运行 AppImage 时出现类似错误：

```bash
The SUID sandbox helper binary was found, but is not configured correctly
```

或提示 `chrome-sandbox` 权限异常，可尝试使用以下命令启动：

```bash
./OneKey-Wallet-*.AppImage --no-sandbox
```

请确保命令在 AppImage 文件所在目录中运行。

## 常见问题

### AppImage 提示缺少 X Server 或 DISPLAY

如果运行时遇到缺少 X Server 或 `$DISPLAY` 的错误，通常表示当前系统缺少图形桌面环境或相关组件。

对于 Ubuntu / Debian 系统，可以安装图形环境相关组件后再尝试运行。

### 配置 udev 规则后仍无法识别硬件钱包

请依次检查：

1. 是否已经重新插拔硬件钱包
2. 是否已经运行 `sudo udevadm control --reload-rules`
3. 是否已经运行 `sudo udevadm trigger`
4. OneKey App 是否已获得 USB 访问权限

如果你使用 Snap 版本，请确认已经运行：

```bash
sudo snap connect onekey-wallet:raw-usb
```

## 总结

在 Linux 系统上使用 OneKey App 时，建议先配置 udev 规则，再根据需要选择 Snap 或 AppImage 安装方式。

如果新版 Ubuntu 中 AppImage 无法正常启动，可尝试使用 `--no-sandbox` 参数运行；如果 Snap 版本提示缺少 `libgbm.so.1`，建议暂时改用 AppImage 版本。

如有其他疑问，可联系在线客服：https://onekey.so?openMessenger ，或发送邮件至：hi@onekey.so
