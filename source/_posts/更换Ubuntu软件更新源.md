---
title: 更换Ubuntu软件更新源
date: 2021-07-30 11:14:41
tags: [linux]
---

Ubuntu默认是国外的源，软件下载和更新都比较慢。两种方法将下载源换成国内的源。
## 用"软件和更新"工具
从Ubuntu菜单中找到**软件和更新**这个应用并打开。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210730112638.png)

找到**下载自**，选择**其他-国内-aliyun**，然后勾选前四个选项。关闭时会弹出对话框，点击**更新**。然后就能愉**快**的下载软件了。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210730113029.png)

## 修改`sourcelist`
### 备份原文件
这也算是系统文件的一部分，还是保险一点，出错了再改回来。
```
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup
```
### 打开并修改
```
sudo vi /etc/apt/sources.list
```
`vim`用的不习惯的估计会和我一样找全选内容怎么操作。教给你了
在命令模式下，就是按一下`esc`键，然后输入`ggvG`。具体什么含义看`vim笔记`吧，选择后直接`delete`删除，再把阿里云源粘贴进去。保存退出。

```
#阿里云
deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse
```

## 更新
```
sudo apt-get update
sudo apt-get dist-upgrade
sudo apt-get upgrade
```