---
title: 解决Linux启动出现fsck exited with status code 4
date: 2021-12-04 10:18:09
updated:
tags: [Linux, Bug]
categories: [Bug踩坑记录]
---
## 保留现场

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112041102634.png)

## 探究原因

磁盘检测不能通过，可能是因为系统突然断电或其它未正常关闭系统导致。

## 解决方法
根据提示可以看到是`dev/sda5`这个扇区出现了异常，所以通过`fsck`命令修复文件系统。[详细命令解释](https://www.runoob.com/linux/linux-comm-fsck.html)。

将`sda5`改为自己损坏的扇区即可，等待一段时间修复完成后，输入`exit`即可重启。

```bash
fsck -y  /dev/sda5
```


