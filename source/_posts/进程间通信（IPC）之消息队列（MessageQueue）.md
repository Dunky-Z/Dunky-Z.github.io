---
title: 进程间通信（IPC）之消息队列（MessageQueue）
date: 2021-08-19 10:53:09
tags: [Linux,IPC]
---
## 简介
消息队列提供了一种从一个进程向另一个进程发送一个数据块的方法。 

每个数据块都被认为含有一个类型，接收进程可以独立地接收含有不同类型的数据结构。我们可以通过发送消息来避免命名管道的同步和阻塞问题。但是消息队列与命名管道一样，每个数据块都有一个最大长度的限制。

本文[代码同步在这里](https://github.com/Dunky-Z/learning-linux/tree/main/IPC/MessageQueue)。

## 相关函数
###  `msgget()`
该函数用来创建和访问一个消息队列。它的原型为：
```c
int msgget(key_t, key, int msgflg);
```
- `key`：与其他的IPC机制一样，程序**必须提供一个键**来命名某个特定的消息队列。
- `msgflg`是一个权限标志，表示消息队列的**访问权限**，它与文件的访问权限一样。`msgflg`可以与`IPC_CREAT`做或操作，表示当key所命名的消息队列不存在时创建一个消息队列，如果key所命名的消息队列存在时，`IPC_CREAT`标志会被忽略，而只返回一个标识符。

它返回一个以`key`命名的消息队列的标识符（非零整数），失败时返回`-1`.

### `msgsnd()`
该函数用来把消息添加到消息队列中。它的原型为：
```c
int msgsend(int msgid, const void *msg_ptr, size_t msg_sz, int msgflg);
```
- `msgid`是由`msgget`函数返回的消息队列标识符。
- `msg_ptr`是一个指向准备发送消息的指针，但是消息的数据结构却有一定的要求，指针`msg_ptr`所指向的消息结构一定要是以一个**长整型成员变量开始的结构体**，接收函数将用这个成员来确定消息的类型。所以消息结构要定义成这样： 
    ```c
    struct my_message {
        long int message_type;
        /* The data you wish to transfer */
    };
    ```
- `msg_sz` 是`msg_ptr`指向的消息的长度
- `msgflg` 用于控制当前消息队列满或队列消息到达系统范围的限制时将要发生的事情
- 如果调用成功，消息数据的副本将被放到消息队列中，并返回`0`，失败时返回`-1`.

### `msgrcv()`
该函数用来从一个消息队列获取消息，它的原型为
```c
int msgrcv(int msgid, void *msg_ptr, size_t msg_st, long int msgtype, int msgflg);
```
- 前三个参数参照前面的解释
- `msgtype` 可以实现一种简单的接收优先级。如果`msgtype`为`0`，就获取队列中的第一个消息。如果它的值大于零，将获取具有相同消息类型的第一个信息。如果它小于零，就获取类型等于或小于`msgtype`的绝对值的第一个消息。
- `msgflg` 用于控制当队列中没有相应类型的消息可以接收时将发生的事情。
- 调用成功时，该函数返回放到接收缓存区中的字节数，消息被复制到由`msg_ptr`指向的用户分配的缓存区中，然后删除消息队列中的对应消息。失败时返回`-1`。

### `msgctl()`
该函数用来控制消息队列，它与共享内存的shmctl函数相似，它的原型为：
```c
int msgctl(int msgid, int command, struct msgid_ds *buf);
```
- `msgid`同上
- `command`是将要采取的动作，它可以取3个值:
  - `IPC_STAT`：把`msgid_ds`结构中的数据设置为消息队列的当前关联值，即用消息队列的当前关联值覆盖`msgid_ds`的值。
  - `IPC_SET`：如果进程有足够的权限，就把消息列队的当前关联值设置为msgid_ds结构中给出的值
  - `IPC_RMID`：删除消息队列
- `buf`是指向`msgid_ds`结构的指针，它指向消息队列模式和访问权限的结构。`msgid_ds`结构至少包括以下成员： 
    ```c
    struct msgid_ds
    {
        uid_t shm_perm.uid;
        uid_t shm_perm.gid;
        mode_t shm_perm.mode;
    };
    ```
- 成功时返回0，失败时返回-1.
## Demo
```c
//msgsnd
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/msg.h>

#define MAX_TXT 512

struct msg_st
{
    long int msg_type;
    char msg[MAX_TXT];
};

int main()
{
    struct msg_st message;
    int msgid = 1;
    char buffer[BUFSIZ];
    key_t msgKey = ftok("./msgsnd.c", 0);
    msgid = msgget(msgKey, 0666 | IPC_CREAT);

    if (msgid == -1)
    {
        fprintf(stderr, "masget failed error: %d\n", errno);
        exit(EXIT_FAILURE);
    }
    while (1)
    {
        printf("Enter some text: \n");
        fgets(buffer, BUFSIZ, stdin);
        message.msg_type = 1; // 注意2
        strcpy(message.msg, buffer);

        // 向队列里发送数据
        if (msgsnd(msgid, (void *)&message, MAX_TXT, 0) == -1)
        {
            fprintf(stderr, "msgsnd failed\n");
            exit(EXIT_FAILURE);
        }

        // 输入end结束输入
        if (strncmp(buffer, "end", 3) == 0)
        {
            break;
        }

        sleep(1);
    }

    exit(EXIT_SUCCESS);
}
```
```c
//msgrcv
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include <sys/msg.h>

#define MAX_TXT 512

struct msg_st
{
    long int msg_type;
    char msg[MAX_TXT];
};

int main()
{
    struct msg_st message;
    int msgid = 1;
    long int msgtype = 0;
    key_t msgKey = ftok("./msgsnd.c", 0);
    msgid = msgget(msgKey, 0666 | IPC_CREAT);

    if (msgid == -1)
    {
        fprintf(stderr, "masget failed error: %d\n", errno);
        exit(EXIT_FAILURE);
    }
    while (1)
    {
        if (msgrcv(msgid, (void *)&message, BUFSIZ, msgtype, 0) == -1)
        {
            fprintf(stderr, "msgsnd failed\n");
            exit(EXIT_FAILURE);
        }

        printf("You wrote: %s\n", message.msg);

        if (strncmp(message.msg, "end", 3) == 0)
        {
            break;
        }
    }

    exit(EXIT_SUCCESS);
}
```

## 运行结果

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210819142858.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210819142913.png)