---
title: Linux(Ubuntu)环境下安装VSCode
date: 2021-08-19 09:38:22
tags: [Linux,VSCode]
---

本来不想写这一篇的，安装VSCode时随便搜一下就OK了，但是因为APT源中没有VSCode，所以需要找下载网址，几次的安装经历下来，找下载网址也经历了一番折腾。今天又要安装一遍，就顺手记录一下吧。以后翻自己记录总比翻全网记录方便。

## 官方文档
其实最完备安装教程在[官方文档](https://code.visualstudio.com/docs/setup/linux)里。本文也算是对官方文档的一个翻译版吧。

## 基于 Debian 和 Ubuntu 的发行版
如果[下载了.deb安装包](https://go.microsoft.com/fwlink/?LinkID=760868)，那么只需要一个命令就可以完成安装了。
```
sudo apt install ./<file>.deb
```

无奈的是，我需要在开发机安装，无法下载安装包，但是我又不想用`ftp`传来传去，要是`apt`能完成，绝不单独下载安装包。

可以使用以下脚本手动安装存储库和密钥

```
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
```
```
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
```
```
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
```
```
rm -f packages.microsoft.gpg
```
更新与安装
```
sudo apt install apt-transport-https
sudo apt update
sudo apt install code # or code-insiders
```