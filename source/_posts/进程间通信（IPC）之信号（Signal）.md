---
title: 进程间通信（IPC）之信号（Signal）
date: 2021-08-11 10:59:22
tags: [Linux,IPC]
---
关于进程间通信的概述可以查看[Linux操作系统-进程间通信](https://dunky-z.github.io/2021/08/10/Linux%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1/)，[代码同步在这里](https://github.com/Dunky-Z/learning-linux/tree/main/IPC/SharedMemory)。

本文通过实例介绍通过共享内存实现进程间通信。
## 简介
信号就像实际生产过程中的应急预案，发生了某个异常就会启动特定的应急预案，为了响应各类异常情况，所以就定义了很多个信号，信号的名称是在头文件`signal.h`中定义的，信号都以`SIG`开头，常用的信号并不多，常用的信号如下：
```
SIGALRM     #时钟定时信号, 计算的是实际的时间或时钟时间
SIGHUP      #终端的挂断或进程死亡
SIGINT      #来自键盘的中断信号
SIGKILL     #用来立即结束程序的运行. 本信号不能被阻塞、处理和忽略。
SIGPIPE     #管道破裂
SIGTERM     #程序结束(terminate)信号, 与SIGKILL不同的是该信号可以被阻塞和处理
SIGUSR1,SIGUSR2     #留给用户使用
```
## 实例
```c
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

void signalHandler(int sig)
{
    printf("\nOps! - I got signal %d\n", sig);

    // 恢复终端中断信号SIGINT的默认行为
    (void)signal(SIGINT, SIG_DFL);
}

int main()
{
    // 改变终端中断信号SIGINT的默认行为，使之执行ouch函数
    // 而不是终止程序的执行
    (void)signal(SIGINT, signalHandler);
    while (1)
    {
        printf("Hello World!\n");
        sleep(1);
    }

    return 0;
}
```
我们可以用`signal()`函数处理指定的信号，主要通过忽略和恢复其默认行为来工作。signal()函数的原型如下：
```c
void (*signal(int sig, void (*func)(int)))(int);
```
这是一个相当复杂的声明，耐心点看可以知道signal是一个带有`sig`和`func`两个参数的函数，`func`是一个类型为`void (*)(int)`的函数指针。该函数返回一个与`func`相同类型的指针，指向先前指定信号处理函数的函数指针。准备捕获的信号的参数由`sig`给出，接收到的指定信号后要调用的函数由参数`func`给出。其实这个函数的使用是相当简单的，通过下面的例子就可以知道。注意信号处理函数的原型必须为`void func（int）`，或者是下面的特殊值：
```
SIG_IGN : 忽略信号
SIG_DFL : 恢复信号的默认行为
```

我们程序的目的是想要捕获键盘输入`Ctrl+C`，这个中断。通过表里可以查到，我们使用`SIGINT`这个信号，当我们的程序出现`SIGINT`信号时，让程序接下来干啥呢？正常情况下，我们的`Ctrl+C`会中断当前运行的程序，但是现在我们做了一些更改，更改的内容在我们自己编写的`signalHandler`中。我们让程序输出一行字符串加上信号值。然后再把信号的行为恢复原样。此时我们运行程序可以得到如下

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210811143147.png)

在我们第一输入`Ctrl+C`时，程序没有中断，而是调用了`signalHanlder`函数，因为我们更改了信号的行为。但是第二次输入`Ctrl+C`时，程序中断了。