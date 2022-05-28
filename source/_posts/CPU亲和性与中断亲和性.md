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

**[超线程技术(Hyper-Threading)](https://mp.weixin.qq.com/s/HwDqCk8vtMdSEVSCLHAsbg)**：就是利用特殊的硬件指令，把两个逻辑内核(CPU core)模拟成两个物理芯片，
让单个处理器都能使用线程级并行计算，进而兼容多线程操作系统和软件，减少了CPU的闲置时间，提高的CPU的运行效率。
我们常听到的双核四线程/四核八线程指的就是支持超线程技术的CPU.

**物理CPU**：机器上安装的实际CPU, 比如说你的主板上安装了一个8核CPU,那么物理CPU个数就是1个,所以物理CPU个数就是主板上安装的CPU个数。

**逻辑CPU**：一般情况，我们认为一颗CPU可以有多核，加上intel的超线程技术(HT), 可以在逻辑上再分一倍数量的CPU core出来；

```
逻辑CPU数量 = 物理CPU数量 x CPU cores x 2(如果支持并开启HT) //前提是CPU的型号一致，如果不一致只能一个一个的加起来，不用直接乘以物理CPU数量
//比如你的电脑安装了一块4核CPU，并且支持且开启了超线程（HT）技术，那么逻辑CPU数量 = 1 × 4 × 2 = 8
```

### linux命令实现硬亲和性
**Linux下查看CPU相关信息**, CPU的信息主要都在`/proc/cupinfo`中,
```
# 查看物理CPU个数
➜  ~ cat /proc/cpuinfo|grep "physical id"|sort -u|wc -l
32

# 查看每个物理CPU中core的个数(即核数)
➜  ~ cat /proc/cpuinfo|grep "cpu cores"|uniq
1

# 查看逻辑CPU的个数
➜  ~ cat /proc/cpuinfo|grep "processor"|wc -l
32

# 查看CPU的名称型号
➜  ~ cat /proc/cpuinfo|grep "name"|cut -f2 -d:|uniq
Intel Xeon Processor (Skylake, IBRS)
```
**Linux查看某个进程运行在哪个逻辑CPU上**
```
ps -eo pid,args,psr
# 参数的含义：
# pid  - 进程ID
# args - 该进程执行时传入的命令行参数
# psr  - 分配给进程的逻辑CPU

例子:
➜  ~ ps -eo pid,args,psr | grep firefox
20118 /usr/lib/firefox/firefox -n  13
20208 /usr/lib/firefox/firefox -c   9
20266 /usr/lib/firefox/firefox -c  29
20329 /usr/lib/firefox/firefox -c  24
20499 /usr/lib/firefox/firefox -c   7
20565 /usr/lib/firefox/firefox -c  15
20596 /usr/lib/firefox/firefox -c  24
20760 /usr/lib/firefox/firefox -c  18
22110 /usr/lib/firefox/firefox -c  27
25857 /usr/lib/firefox/firefox -c  28
26347 /usr/lib/firefox/firefox -c  19
26899 /usr/lib/firefox/firefox -c  29
```
**Linux查看线程的TID**

TID就是Thread ID,他和POSIX中pthread_t表示的线程ID完全不是同一个东西.

Linux中的POSIX线程库实现的线程其实也是一个轻量级进程(LWP),这个TID就是这个线程的真实PID.

但是又不能通过`getpid()`函数获取，Linux中定义了`gettid()`这个接口，但是通常都是未实现的，所以需要使用下面的方式获取TID。
```
//program
#include <sys/syscall.h>  
pid_t tid;
tid = syscall(__NR_gettid);// or syscall(SYS_gettid)  

//command-line 3种方法(推荐第三种方法)
➜  ~ ps -efL | grep prog_name
➜  ~ ls /proc/pid/task            //文件夹名即TID
➜  ~ ps -To 'pid,lwp,psr,cmd' -p PID
```
#### 使用`taskset`命令设置CPU亲和性
**命令行形式**
```
taskset [options] mask command [arg]...
taskset [options] -p [mask] pid
```

**参数解析**
[OPTIONS]taskset的可选参数
- -a, --all-tasks (旧版本中没有这个选项)　　　　　　　　
        这个选项涉及到了linux中TID的概念,他会将一个进程中所有的TID都执行一次CPU亲和性设置.　　　　　　　　
        TID就是Thread ID,他和POSIX中pthread_t表示的线程ID完全不是同一个东西.　　　　　　　　
        Linux中的POSIX线程库实现的线程其实也是一个进程(LWP),这个TID就是这个线程的真实PID.
- -p, --pid
        操作已存在的PID,而不是加载一个新的程序
- -c, --cpu-list
              声明CPU的亲和力使用数字表示而不是用位掩码表示. 例如 0,5,7,9-11.
- -h, --help
        显示帮助信息
- -V, --version
        显示版本信息

- mask : cpu亲和性,当没有-c选项时, 其值前无论有没有0x标记都是16进制的,　　　　　　　　当有-c选项时,其值是十进制的.　　　　
- command : 命令或者可执行程序
- pid : 进程ID,可以通过ps/top/pidof等命令获取

[arg]command的参数　

**实例**
1) 使用指定的CPU亲和性运行一个新程序
```
taskset [-c] mask command [arg]...
举例:使用CPU0运行ls命令显示/etc/init.d下的所有内容 
　　 taskset -c 0 ls -al /etc/init.d/
```
2) 显示已经运行的进程的CPU亲和性
```
taskset -p pid
举例:查看init进程(PID=1)的CPU亲和性
　　 taskset -p 1
```
3) 改变已经运行进程的CPU亲和力
```
taskset -p[c] mask pid
举例:打开2个终端,在第一个终端运行top命令,第二个终端中
 　　首先运行:[~]# ps -eo pid,args,psr | grep top #获取top命令的pid和其所运行的CPU号
 　　其次运行:[~]# taskset -cp 新的CPU号 pid       #更改top命令运行的CPU号
 　　最后运行:[~]# ps -eo pid,args,psr | grep top #查看是否更改成功

➜  ~ ps -eo pid,args,psr | grep top
2501 nautilus-desktop             24
2634 /usr/libexec/xdg-desktop-po  18
2658 /usr/libexec/xdg-desktop-po  11
23848 top                           6
➜  ~ taskset -cp 10 23848
pid 23848's current affinity list: 0-31
pid 23848's new affinity list: 10
➜  ~ ps -eo pid,args,psr | grep top
 2501 nautilus-desktop             24
 2634 /usr/libexec/xdg-desktop-po  18
 2658 /usr/libexec/xdg-desktop-po  11
23848 top                          10
➜  ~ 
```
      
>  一个用户要设定一个进程的CPU亲和性,如果目标进程是该用户的,则可以设置,如果是其他用户的,则会设置失败,提示 Operation not permitted.当然root用户没有任何限制.
任何用户都可以获取任意一个进程的CPU亲和性.

### 程序API实现硬亲和性
参见[Linux中CPU亲和性(affinity) - LubinLew - 博客园](https://www.cnblogs.com/lubinlew/p/cpu_affinity.html)
## 什么是中断亲和性
计算机中，中断是一种电信号，由硬件产生并直接送到中断控制器上，再由中断控制器向 CPU 发送中断信号，CPU 检测到信号后，中断当前工作转而处理中断信号。CPU 会通知操作系统已经产生中断，操作系统就会对中断进行处理。
这里有篇推文：[CPU明明8个核，网卡为啥拼命折腾一号核？](https://mp.weixin.qq.com/s?__biz=MzIyNjMxOTY0NA==&mid=2247484717&idx=1&sn=2c1dd6c389c8476eb4fd178c714eaafc&scene=21#wechat_redirect)生动的解释了中断亲和性。

默认情况下，Linux 中断响应会被平均分配到所有 CPU 核心上，势必会发生写新的数据和指令缓存，并与 CPU 核心上原有进程产生冲突，造成中断响应延迟，影响进程处理时间。为了解决这个问题，可以将中断（或进程）绑定到指定 CPU 核心上，中断（或进程）所需要指令代码和数据有更大概率位于指定 CPU 本地数据和指令缓存内，而不必进行新的写缓存，从而提高中断响应（或进程）的处理速度。

## 中断亲和性的使用场景

对于文件服务器、Web 服务器，把不同的网卡 IRQ 均衡绑定到不同的 CPU 上将会减轻某 CP 的负载，提高多个 CPU 整体处理中断的能力; 对于数据库服务器，把磁盘控制器绑到一个 CPU、把网卡绑定到另一个 CPU 将会提高数据库的响应时间、优化性能。  
合理的根据自己的生产环境和应用的特点来平衡 IRQ 中断有助于提高系统的整体吞吐能力和性能。

## 中断绑定流程
1. 关闭中断平衡守护进程
中断平衡守护进程（irqbalance daemon）会周期性地将中断平均地公平地分配给各个 CPU 核心，默认开启。为了实现中断绑定，首先需要将中断平衡守护进程关闭。
    - `systemctl status irqbalance`查看守护进程的运行状态

    ```bash
    ➜  ~ systemctl status irqbalance

    ● irqbalance.service - irqbalance daemon
    Loaded: loaded (/lib/systemd/system/irqbalance.service; enabled; vendor preset: enable
    Active: active (running) since Thu 2022-05-19 14:46:20 CST; 1 weeks 1 days ago
    Main PID: 1062 (irqbalance)
        Tasks: 2 (limit: 4915)
    CGroup: /system.slice/irqbalance.service
            └─1062 /usr/sbin/irqbalance --foreground

    5月 19 14:46:20 zdd systemd[1]: Started irqbalance daemon.
    ```
    - `systemctl stop irqbalance`关闭中断平衡守护进程，中断响应默认都会由 CPU0 核心处理。或者`systemctl disable irqbalance`取消中断平衡守护进程开机重启。因为关闭中断平衡守护进程过于强硬，可以在不关闭中断平衡守护进程条件下，让某些 CPU 核心脱离中断平衡守护进程的管理。
2. 绑定中断
中断绑定时，需要关闭系统中断平衡守护进程`systemctl stop irqbalance`计算机当前各种中断响应情况在 `/proc/interrupts` 文件中。

    ![](https://s3.51cto.com/images/blog/202101/17/429383702d1cf9e331ee52409b7c1c07.png?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_100,g_se,x_10,y_10,shadow_90,type_ZmFuZ3poZW5naGVpdGk=)

    第一列是中断 ID 号，CPU N 列是中断在第 n 个 CPU 核心上的响应次数，倒数第二列是中断类型，最后一列是描述。  

    利用 echo 命令将 CPU 掩码写入 `/proc/irq/中断 ID/smp_affinity` 文件中，即可实现修改某一中断的 CPU 亲和性。例如  
    ```bash
    echo 0x0004 > /proc/irq /50/smp_affinity
    ```
## 参考资料
[Linux中CPU亲和性(affinity) - LubinLew - 博客园](https://www.cnblogs.com/lubinlew/p/cpu_affinity.html)
[操作系统底层技术——CPU亲和性_mb60ed33cfc44fa的技术博客_51CTO博客](https://blog.51cto.com/u_15302006/3075968)
[linux进程、线程与cpu的亲和性（affinity）_wx61d68abba262d的技术博客_51CTO博客](https://blog.51cto.com/u_15484754/4907846)
[CPU明明8个核，网卡为啥拼命折腾一号核？](https://mp.weixin.qq.com/s?__biz=MzIyNjMxOTY0NA==&mid=2247484717&idx=1&sn=2c1dd6c389c8476eb4fd178c714eaafc&scene=21#wechat_redirect)
[Processor affinity - Wikipedia](https://en.wikipedia.org/wiki/Processor_affinity)
[什么？一个核同时执行两个线程？](https://mp.weixin.qq.com/s/HwDqCk8vtMdSEVSCLHAsbg)
