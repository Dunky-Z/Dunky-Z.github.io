---
title: Windows批处理定时任务
date: 2022-01-05 22:39:03
updated: 
tags: [DOS]
categories:
---

## 折腾背景
一些常用的离线软件在重新安装，重装电脑或者更好环境时，调教好的配置总需要重新设置一遍，甚是麻烦。但是这些设置通常都保存在配置文件里，只要能备份好这些配置文件，下次重装后覆盖就可以恢复所需设置。

现在的问题就是如何备份这些配置文件，可以选择各类网盘，硬盘等等。但是这些多少都有点炮打蚊子，小题大做。而且定时备份也不是很方便。既然配置文件都很小，其实就是个文本文件，那有个万能免费存储地GitHub就派上用场了。我们只要把配置文件定时push到GitHub即可，以后随时可以clone下来。

首先建立一个私密仓库，用来专门存放配置文件。其次通过批处理命令，将配置文件复制到本地仓库的文件夹下。最后设置定时任务。

## 折腾过程
### 新建仓库
这一步不用赘述了，主要就是要勾选私密仓库，保护隐私，一些配置文件可能会包含个人信息。

### 批处理
将仓库克隆到本地后就是个文件夹，这一步主要就是如何能把安装在不同位置的软件的配置文件，都汇集到这个仓库下。通过批处理命令可以快速，方便的完成。

```bat
echo Start backup config files! # 打印这句话

copy D:\Tools\MouseInc\MouseInc.json  D:\Develop\fxxk-config\mouseinc # 将前者复制到后者

copy D:\Tools\JD\Config.ini  D:\Develop\fxxk-config\jd

cd  /d D:\Develop\fxxk-config # 切换目录

# git推送的一些命令
git add .   
git commit -m "update"
git push

# 防止窗口闪退
pause
```
一些常用命令参考[WindowDos批处理指导](https://gist.github.com/675816156/7bcec2bc6f45faa64acdb75acfef6912)。

### 定时任务

控制面板-管理工具-任务计划程序
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201052247765.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201052247153.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201052247889.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201052248070.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201052248353.png)