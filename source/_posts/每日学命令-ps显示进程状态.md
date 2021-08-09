---
title: 每日学命令-ps显示进程状态
date: 2021-08-09 19:37:38
tags: [每日学命令, Linux]
---
`ps`命令显示的信息类似于Windows的任务管理器。也是参数超级多的一个命令，所以就不列参数了，需要查看时直接搜索，这里列举一下实例。

## 使用实例
显示当前执行的所有程序
```
➜  ~ ps -a
    PID TTY          TIME CMD
    879 tty2     00:03:43 Xorg
    990 tty2     00:00:00 gnome-session-b
   2653 pts/0    00:00:00 zsh
  12365 pts/0    00:00:00 ps

```

显示所有程序
```
➜  ~ ps -A
    PID TTY          TIME CMD
      1 ?        00:00:01 systemd
      2 ?        00:00:00 kthreadd
      3 ?        00:00:00 rcu_gp
      4 ?        00:00:00 rcu_par_gp
      6 ?        00:00:00 kworker/0:0H-kblockd
      9 ?        00:00:00 mm_percpu_wq
     10 ?        00:00:00 ksoftirqd/0
     11 ?        00:00:02 rcu_sched
     12 ?        00:00:00 migration/0
     13 ?        00:00:00 idle_inject/0
     14 ?        00:00:00 cpuhp/0
     15 ?        00:00:00 kdevtmpfs
.
.
.
```

显示指定用户的信息
```
➜  ~ ps -u root
```

`a`显示现行终端机下的所有程序，包括其他用户的程序，`u`以用户为主的格式来显示程序状况，`x`显示所有程序，不以终端机来区分
`USER`－运行该流程的用户。

`%CPU`－进程cpu利用率。

`%MEM`－进程驻留集大小占计算机物理内存的百分比。

`VSZ`－KiB中进程的虚拟内存大小。

`RSS`－进程正在使用的物理内存的大小。

`STAT`－进程状态代码，可以是Z（zombie），S（休眠），R（运行）..等等。

`START`－命令启动的时间。
```
➜  ~ ps aux              
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.2 102084 11540 ?        Ss   09:09   0:01 /sbin/init splash
root           2  0.0  0.0      0     0 ?        S    09:09   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<   09:09   0:00 [rcu_gp]
```

按 CPU 资源的使用量对进程进行排序：
```
➜  ~ ps aux | sort -nk 3
avahi        492  0.0  0.0   8536  3260 ?        Ss   09:09   0:00 avahi-daemon: running [hanhan.local]
avahi        552  0.0  0.0   8352   332 ?        S    09:09   0:00 avahi-daemon: chroot helper
colord      1442  0.0  0.3 255144 14408 ?        Ssl  09:09   0:00 /usr/libexec/colord
dominic     1068  0.0  0.0  31244   364 ?        S    09:09   0:00 /usr/bin/VBoxClient --clipboard
dominic     1069  0.0  0.9 163512 39088 ?        Sl   09:09   0:00 /usr/bin/VBoxClient --clipboard
dominic     1080  0.0  0.0  31244   364 ?        S    09:09   0:00 /usr/bin/VBoxClient --seamless

# 其中`sort`命令中`-n`为按数值进行排序，`-k  3` 表示以输出结果的第三列来进行排序，
# 从上一个实例中看到，第三列为CPU使用率`%CPU`。
# 同理ps aux | sort -rnk 4 即按内存使用降序排序
```

显示前5名最耗cpu的进程
```
➜  ~ ps aux --sort=-pcpu | head -5
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  2.6  0.7  51396  7644 ?        Ss   02:02   0:03 /usr/lib/systemd/systemd --switched-root --system --deserialize 23
root      1249  2.6  3.0 355800 30896 tty1     Rsl+ 02:02   0:02 /usr/bin/X -background none :0 vt01 -nolisten tcp
root       508  2.4  1.6 248488 16776 ?        Ss   02:02   0:03 /usr/bin/python /usr/sbin/firewalld --nofor
```

下面的命令会显示进程id为3150的进程的所有线程
```
➜  ~ ps -p 3150 -L
```