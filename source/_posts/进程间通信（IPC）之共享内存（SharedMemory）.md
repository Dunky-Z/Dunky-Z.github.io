---
title: 进程间通信（IPC）之共享内存(SharedMemory)
date: 2021-08-10 17:41:26
tags: [Linux,IPC]
---
关于进程间通信的概述可以查看[Linux操作系统-进程间通信](https://dunky-z.github.io/2021/08/10/Linux%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1/)，[代码同步在这里](https://github.com/Dunky-Z/learning-linux/tree/main/IPC/SharedMemory)。

本文通过实例介绍通过共享内存实现进程间通信。

## shmget(得到一个共享内存标识符或创建一个共享内存对象)

我们可以通过`shmget`函数创建或打开共享内存，通过函数签名
```c
//key_t key:  唯一定位一个共享内存对象
//size_t size: 共享内存大小
//int flag: 如果是IPC_CREAT表示创建新的共享内存空间
int shmget(key_t key, size_t size, int flag);
```
- 第一个参数是共享内存的唯一标识，是需要我们指定的。那么如何指定`key`呢？如何保证唯一性呢？我们可以指定一个文件，`ftok `会根据这个文件的 `inode`，生成一个近乎唯一的 `key`。只要在这个消息队列的生命周期内，这个文件不要被删除就可以了。只要不删除，无论什么时刻，再调用 `ftok`，也会得到同样的` key`。
- 第二个参数是申请的空间大小，我们就申请1024B。
- 第三个参数是权限标识，`IPC_CREAT`表示创建共享内存，`0644`表示允许一个进程创建的共享内存被内存创建者所拥有的进程向共享内存读取和写入数据，同时其他用户创建的进程只能读取共享内存。

## shmat(把共享内存区对象映射到调用进程的地址空间)

第一次创建完共享内存时，它还不能被任何进程访问，`shmat()`函数的作用就是用来启动对该共享内存的访问，并把共享内存连接到当前进程的地址空间。它的签名如下：
```c
void *shmat(int shm_id, const void *shm_addr, int shmflg);
```
- 第一个参数就是上文产生的唯一标识。
- 第二个参数，`shm_addr`指定共享内存连接到当前进程中的地址位置，通常为空，表示让系统来选择共享内存的地址。
- 第三个参数，`shm_flg`是一组标志位，通常为0。
调用成功时返回一个指向共享内存第一个字节的指针，如果调用失败返回-1.

`(void *) - 1`把`-1`转换为指针`0xFFFFFFFF`，有时也会用到`(void*)0`，表示一个空指针。


## shmat(断开共享内存连接)

与shmat函数相反，是用来断开与共享内存附加点的地址，禁止本进程访问此片共享内存

函数签名如下：
```c
int shmdt(const void *shmaddr)
```
- 参数一`shmaddr`为连接共享内存的起始地址。

需要注意的是，本函数调用并不删除所指定的共享内存区，而只是将先前用shmat函数连接（attach）好的共享内存脱离（detach）目前的进程。删除共享内存就需要下面的这个函数。



## shmctl(共享内存管理)

完成对共享内存的控制，包括改变状态，删除共享内存等。

函数签名如下：
```c
int shmctl(int shmid, int cmd, struct shmid_ds *buf)
```
- `shmid`共享内存唯一标识符
- `cmd`执行的操作，包括如下
  - `IPC_STAT`：得到共享内存的状态，把共享内存的`shmid_ds`结构复制到`buf`中
  - `IPC_SET`：改变共享内存的状态，把`buf`所指的`shmid_ds`结构中的`uid`、`gid`、`mode`复制到共享内存的`shmid_ds`结构内
  - `IPC_RMID`：删除这片共享内存
- `buf`共享内存管理结构体。具体说明参见共享内存内核结构定义部分











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
//client.c
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

### 如何手动删除共享内存？
列出所有的共享内存段：
```
ipcs -m
------------ 共享内存段 --------------
键        shmid      拥有者  权限     字节     连接数  状态      
0x00000000 2          dominic    600        16384      1          目标       
0x00000000 753668     dominic    606        10089696   2          目标       
0x00000000 622597     dominic    600        4194304    2          目标       
0x00000000 753670     dominic    606        10089696   2          目标       
0x00000000 688135     dominic    600        899976     2          目标       
0x00000000 8          dominic    600        524288     2          目标       
0x00000000 9          dominic    600        524288     2          目标       
0x00000000 753674     dominic    600        7127040    2          目标 
0x0000006f 720918     dominic    666        1024        0
```
我们发现最后一个键值为`0x0000006f = 111`的共享内存段，就是我们创建的共享内存段。
删除指定共享内存段：
```
 ipcrm -m 720918  
 或者 
 ipcrm -M 0x0000006f  
```

信号量和消息队列的操作，命令类似，只是参数不同。
查看命令：
```
ipcs [-m|-q|-s]
```
- `-m` 输出有关共享内存(shared memory)的信息
- `-q` 输出有关信息队列(message queue)的信息
- `-s` 输出有关“信号量”(semaphore)的信息
  
删除命令
```
ipcrm [ -M key | -m id | -Q key | -q id | -S key | -s id ]
```
- `-M`用shmkey删除共享内存
- `-m`用shmid删除共享内存
- `-Q`用msgkey删除消息队列
- `-q`用msgid删除消息队列
- `-S`用semkey删除信号量
- `-s`用semid删除信号量