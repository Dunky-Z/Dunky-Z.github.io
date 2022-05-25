---
title: CPU亲和性与中断亲和性
date: 2022-05-23 22:38:14
updated:
tags: [亲和性, CPU, Affinity, 操作系统, Linux]
categories:
---

## 什么是CPU亲和性
CPU的亲和性(Affinity)，属于一种调度属性，可以绑定进程到指定CPU上。 换句话说，就是进程要在指定的 CPU 上尽量长时间地运行而不被迁移到其他处理器。

为何会出现这种技术？在SMP(Symmetric Multi-Processing对称多处理)架构下，调度器会试图保持进程在相同的CPU上运行，这意味着进程通常不会在处理器之间频繁迁移，进程迁移的频率小就意味着产生的负载小。

又如，每个CPU本身自己会有缓存，缓存着进程使用的信息，而进程可能会被操作系统调度到其他CPU上，如此，CPU 缓存命中率就低了，当绑定CPU后，程序就会一直在指定的CPU跑，不会由操作系统调度到其他CPU上，性能有一定的提高。

软亲和性（affinity）:  就是进程要在指定的 CPU 上尽量长时间地运行而不被迁移到其他处理器，Linux 内核进程调度器天生就具有被称为 软 CPU 亲和性（affinity） 的特性，这意味着进程通常不会在处理器之间频繁迁移。这种状态正是我们希望的，因为进程迁移的频率小就意味着产生的负载小。

硬亲和性（affinity）：简单来说就是利用linux内核提供给用户的API，强行将进程或者线程绑定到某一个指定的cpu核运行。

## 硬亲和性
### linux命令实现硬亲和性
**Linux下查看CPU相关信息**, CPU的信息主要都在/proc/cupinfo中,
```
# 查看物理CPU个数
cat /proc/cpuinfo|grep "physical id"|sort -u|wc -l

# 查看每个物理CPU中core的个数(即核数)
cat /proc/cpuinfo|grep "cpu cores"|uniq

# 查看逻辑CPU的个数
cat /proc/cpuinfo|grep "processor"|wc -l

# 查看CPU的名称型号
cat /proc/cpuinfo|grep "name"|cut -f2 -d:|uniq
```
**Linux查看某个进程运行在哪个逻辑CPU上**
```
ps -eo pid,args,psr#参数的含义：
pid  - 进程ID
args - 该进程执行时传入的命令行参数
psr  - 分配给进程的逻辑CPU例子:[~]# ps -eo pid,args,psr | grep nginx9073 nginx: master process /usr/   19074 nginx: worker process         09075 nginx: worker process         19076 nginx: worker process         29077 nginx: worker process         313857 grep nginx                   3
```
**Linux查看线程的TID**

TID就是Thread ID,他和POSIX中pthread_t表示的线程ID完全不是同一个东西.

Linux中的POSIX线程库实现的线程其实也是一个轻量级进程(LWP),这个TID就是这个线程的真实PID.

但是又不能通过getpid()函数获取，Linux中定义了gettid()这个接口，但是通常都是未实现的，所以需要使用下面的方式获取TID。
```
//program
#include <sys/syscall.h>  
pid_t tid;
tid = syscall(__NR_gettid);// or syscall(SYS_gettid)  

//command-line 3种方法(推荐第三种方法)
ps -efL | grep prog_name
ls /proc/pid/task            //文件夹名即TID
ps -To 'pid,lwp,psr,cmd' -p PID
```

### 程序API实现硬亲和性

## 中断亲和性

## 参考资料
[Linux中CPU亲和性(affinity) - LubinLew - 博客园](https://www.cnblogs.com/lubinlew/p/cpu_affinity.html)
[操作系统底层技术——CPU亲和性_mb60ed33cfc44fa的技术博客_51CTO博客](https://blog.51cto.com/u_15302006/3075968)
[linux进程、线程与cpu的亲和性（affinity）_wx61d68abba262d的技术博客_51CTO博客](https://blog.51cto.com/u_15484754/4907846)
[CPU明明8个核，网卡为啥拼命折腾一号核？](https://mp.weixin.qq.com/s?__biz=MzIyNjMxOTY0NA==&mid=2247484717&idx=1&sn=2c1dd6c389c8476eb4fd178c714eaafc&scene=21#wechat_redirect)
[Processor affinity - Wikipedia](https://en.wikipedia.org/wiki/Processor_affinity)