---
title: 每天学命令-df/du查看磁盘剩余空间
date: 2021-07-28 10:13:58
tags: [每天学命令,linux]
---
`df`全称`disk filesystem` ，以磁盘分区为单位查看文件系统，可以查看磁盘文件占用空间，磁盘剩余空间等信息。
## 命令格式
```
df [] []
```
## 可选参数
```
-a      全部文件系统列表
-h      方便阅读方式显示
-H      等于“-h”，但是计算式，1K=1000，而不是 1K=1024
-i      显示 inode 信息
-k      区块为 1024 字节
-l      只显示本地文件系统
-m      区块为 1048576 字节
--no-sync 忽略 sync 命令
-P      输出格式为 POSIX
--sync  在取得磁盘信息前，先执行 sync 命令
-T      文件系统类型
```

## 使用实例
`df -T`显示包含文件系统，类型，可用大小，已用大小，挂载点等信息。
```
dominic@hanhan:~$ df -T
文件系统       类型         1K-块      已用      可用 已用% 挂载点
udev           devtmpfs   1985056         0   1985056    0% /dev
tmpfs          tmpfs       403036      1304    401732    1% /run
/dev/sda5      ext4      50824704  20826256  27386992   44% /
tmpfs          tmpfs      2015172         0   2015172    0% /dev/shm
tmpfs          tmpfs         5120         4      5116    1% /run/lock
tmpfs          tmpfs      2015172         0   2015172    0% /sys/fs/cgroup
/dev/loop0     squashfs     56832     56832         0  100% /snap/core18/1988
/dev/loop1     squashfs     56832     56832         0  100% /snap/core18/2074
```