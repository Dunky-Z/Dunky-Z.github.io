---
title: 解决VSCode配置远程连接，过程试图写入的管道不存在
date: 2022-01-19 23:07:49
updated:
tags: [Bug, VSCode]
categories:
---


## 保留现场

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201192309069.png)

## 探究原因

本地记录的服务器信息和现有的产生了冲突

## 解决方法

### 方法一：

将`known_hosts`文件的内容全部删除。

`C:\Users\user name\.ssh\known_hosts`

### 方法二：

搜遍全网几乎都是上述方法，应该绝大部分人通过上述方法都能解决。如果你也跟我一样不走运，不管是重新生成公私钥，还是删除`hnow_hosts`都不行，那么可以尝试修改VSCode使用的`ssh.exe`。windows下默认使用的是环境变量里配置的`OpenSSH`提供的`ssh.exe`。你可以将环境变量里的`OpenSSH`删除。然后在`VSCode`设置里搜索`remote`，也就是设置插件`remote ssh`。



将Path强制设置成`Git`安装包内的`ssh.exe`

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201192304598.png)

或者`mobaxterm`安装包内的`ssh.exe`

## 参考

[Debug | VSCode | 过程试图写入的管道不存在 - CodeAntenna](https://codeantenna.com/a/8z5QCm29iy)

[VScode通过remote ssh连接虚拟机 & 报错 过程试图写入的管道不存在（已解决）_Tasdily的博客-CSDN博客_vscode过程试图写入的管道不存在](https://blog.csdn.net/weixin_42096901/article/details/105193366)