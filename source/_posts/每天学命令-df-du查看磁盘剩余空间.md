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

---
`du`全称`disk usage`可以查看文件，文件夹占用情况。

## 命令格式
```
du [opt] [filename]
```
## 可选参数
```
-a或-all                    #显示目录中个别文件的大小。
-b或-bytes                  #显示目录或文件大小时，以byte为单位。
-c或--total                 #除了显示个别目录或文件的大小外，同时也显示所有目录或文件的总和。
-D或--dereference-args      #显示指定符号连接的源文件大小。
-h或--human-readable        #以K，M，G为单位，提高信息的可读性。
-H或--si                    #与-h参数相同，但是K，M，G是以1000为换算单位。
-k或--kilobytes             #以1024 bytes为单位。
-l或--count-links           #重复计算硬件连接的文件。
-L<符号连接>或-
-dereference<符号连接>          #显示选项中所指定符号连接的源文件大小。
-m或--megabytes                 #以1MB为单位。
-s或--summarize                 #仅显示总计。
-S或--separate-dirs             #显示个别目录的大小时，并不含其子目录的大小。
-x或--one-file-xystem           #以一开始处理时的文件系统为准，若遇上其它不同的文件系统目录则略过。
-X<文件>或--exclude-from=<文件>  #在<文件>指定目录或文件。
--exclude=<目录或文件>           #略过指定的目录或文件。
--max-depth=<目录层数>           #超过指定层数的目录后，予以忽略。
--help          #显示帮助。
--version       #显示版本信息
```


## 使用实例
查看当前目录使用情况
```
dominic@hanhan:~/learning-linux$ du
56	./.git/hooks
8	./.git/logs/refs/heads
8	./.git/logs/refs/remotes/origin
12	./.git/logs/refs/remotes
24	./.git/logs/refs
32	./.git/logs
8	./.git/info
```
以易读的方式查看使用情况
```
dominic@hanhan:~/learning-linux$ du -h
56K	./.git/hooks
8.0K	./.git/logs/refs/heads
8.0K	./.git/logs/refs/remotes/origin
12K	./.git/logs/refs/remotes
24K	./.git/logs/refs
32K	./.git/logs
8.0K	./.git/info
```
只输出当前目录占用总空间，同上`-h`命令就是以人读的方式（加上了数据单位）
```
dominic@hanhan:~/learning-linux$ du -hs
264K	.
```
查看当前目录及其指定深度目录的大小
```
不深入子目录，就是当前文件夹所占用大小
dominic@hanhan:~/learning-linux$ du -h --max-depth=0
264K	.
```
```
深入一层
dominic@hanhan:~/learning-linux$ du -h --max-depth=2
56K	./.git/hooks
32K	./.git/logs
8.0K	./.git/info
28K	./.git/objects
4.0K	./.git/branches
28K	./.git/refs
180K	./.git
24K	./helloworld/c
44K	./helloworld/shell
72K	./helloworld
264K	.
```
忽略`helloworld`这个文件夹
```
dominic@hanhan:~/learning-linux$ du --exclude=helloworld
56	./.git/hooks
8	./.git/logs/refs/heads
8	./.git/logs/refs/remotes/origin
12	./.git/logs/refs/remotes
24	./.git/logs/refs
32	./.git/logs
8	./.git/info
4	./.git/objects/info
20	./.git/objects/pack
28	./.git/objects
4	./.git/branches
8	./.git/refs/heads
4	./.git/refs/tags
8	./.git/refs/remotes/origin
12	./.git/refs/remotes
28	./.git/refs
180	./.git
192	.
```

## Refernece
1. https://einverne.github.io/post/2018/03/du-find-out-which-fold-take-space.html
2. https://www.runoob.com/linux/linux-comm-du.html