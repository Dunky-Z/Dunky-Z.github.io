---
title: 进程间通信（IPC）之共享内存(SharedMemory)
date: 2021-08-10 17:41:26
tags: [Linux]
---
关于进程间通信的概述可以查看[Linux操作系统-进程间通信](https://dunky-z.github.io/2021/08/10/Linux%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1/)，[代码同步在这里](https://github.com/Dunky-Z/learning-linux/tree/main/IPC/SharedMemory)。

本文通过实例介绍通过共享内存实现进程间通信。

我们可以通过`shmpt`函数创建或打开共享内存，通过函数签名
```c
//key_t key:  唯一定位一个共享内存对象
//size_t size: 共享内存大小
//int flag: 如果是IPC_CREAT表示创建新的共享内存空间
int shmget(key_t key, size_t size, int flag);
```
- 第一个参数是共享内存的唯一标识，是需要我们指定的。那么如何指定`key`呢？如何保证唯一性呢？我们可以指定一个文件，`ftok `会根据这个文件的 `inode`，生成一个近乎唯一的 `key`。只要在这个消息队列的生命周期内，这个文件不要被删除就可以了。只要不删除，无论什么时刻，再调用 `ftok`，也会得到同样的` key`。
- 第二个参数是申请的空间大小，我们就申请1024B。
- 第三个参数是权限标识，`IPC_CREAT`表示创建共享内存，`0644`表示允许一个进程创建的共享内存被内存创建者所拥有的进程向共享内存读取和写入数据，同时其他用户创建的进程只能读取共享内存。

第一次创建完共享内存时，它还不能被任何进程访问，`shmat()`函数的作用就是用来启动对该共享内存的访问，并把共享内存连接到当前进程的地址空间。它的签名如下：
```c
void *shmat(int shm_id, const void *shm_addr, int shmflg);
```
第一个参数就是上文产生的唯一标识。
第二个参数，`shm_addr`指定共享内存连接到当前进程中的地址位置，通常为空，表示让系统来选择共享内存的地址。
第三个参数，`shm_flg`是一组标志位，通常为0。
调用成功时返回一个指向共享内存第一个字节的指针，如果调用失败返回-1.

`(void *) - 1`把`-1`转换为指针`0xFFFFFFFF`，有时也会用到`(void*)0`，表示一个空指针。


```c
//server.c
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int shmid;
    key_t shmkey;
    char *shmptr;
    shmkey = ftok("./client.c", 0);
    // 创建或打开内存共享区域
    shmid = shmget(shmkey, 1024, 0666 | IPC_CREAT);
    if (shmid == -1)
    {
        printf("shmget error!\n");
        exit(1);
    }

    //将共享内存映射到当前进程的地址中，
    //之后直接对进程中的地址addr操作就是对共享内存操作
    shmptr = (char *)shmat(shmid, NULL, 0);
    if (shmptr == (void *)-1)
    {
        printf("shmat error!\n");
        exit(1);
    }

    while (1)
    {
        // 把用户的输入存到共享内存区域中
        printf("input:");
        scanf("%s", shmptr);
    }
    exit(0);
}
```

```c
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void)
{
    int shmid;
    char *shmptr;
    key_t shmkey;
    shmkey = ftok("./client.c", 0);
    // 创建或打开内存共享区域
    shmid = shmget(shmkey, 1024, 0666 | IPC_CREAT);
    if (shmid == -1)
    {
        printf("shmget error!\n");
        exit(1);
    }

    //将共享内存映射到当前进程的地址中，
    //之后直接对进程中的地址addr操作就是对共享内存操作
    shmptr = (char *)shmat(shmid, NULL, 0);
    if (shmptr == (void *)-1)
    {
        fprintf(stderr, "shmat error!\n");
        exit(1);
    }

    while (1)
    {
        // 每隔 3 秒从共享内存中取一次数据并打印到控制台
        printf("string:%s\n", shmptr);
        sleep(3);
    }
    exit(0);
}
```
在两个终端分别运行`client`和`server`，`client`会每三秒在终端打印出`server`输入的内容。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210810205816.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210810205830.png)