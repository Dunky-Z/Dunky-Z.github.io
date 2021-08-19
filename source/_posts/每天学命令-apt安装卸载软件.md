---
title: 每天学命令-apt安装卸载软件
date: 2021-08-12 18:42:39
tags: [Linux,每天学命令]
---

这个命令应该是我们平时用的最多的命令之一了，应该早就拿出来讲一下的。但是平时用的太多，总感觉自己都会用了，但是仔细看了所有命令，还是有一些比较实用但是没记住的命令。

`apt`的全称是`Advanced Packaging Tool`是Linux系统下的一款安装包管理工具。 APT 可以自动下载、配置和安装二进制或源代码格式软件包，简化了 Unix 系统上管理软件的过程。

APT 主要由以下几个命令组成：
```
apt-get
apt-cache
apt-file
```

## Commands
### 搜索软件包
```
apt search python3
```

### 安装软件包
```
apt install python3
```

### 更新源
```
sudo apt install update
```

### 更新软件
执行完update命令后，就可以使用apt upgrade来升级软件包了。执行命令后系统会提示有几个软件需要升级。在得到你的同意后，系统即开始自动下载安装软件包。
```
sudo apt install upgrade
```

### 卸载软件
```
apt remove python3  # 移除软件包，但是保留配置文件
apt purge python3 #移除软件包并移除配置
apt autoremove # 移除孤立的并不被依赖的软件包
```

### 列出软件清单
```
apt list
```
