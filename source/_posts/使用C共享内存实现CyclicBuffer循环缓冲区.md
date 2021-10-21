---
title: 使用C共享内存实现CyclicBuffer循环缓冲区
date: 2021-10-21 17:12:06
tags:
---

完整代码详见[GitHub CyclicBuffer](https://github.com/Dunky-Z/learning-linux/tree/main/helloworld/c/CyclicBuffer)。
## 什么是循环缓冲区
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211021171456.gif)

循环缓冲区通常应用在模块与模块之间的通信，可以减少程序挂起的时间，节省内存空间。

如图所示，蓝色箭头表示读取指针，红色表示写入指针。写入指针可以在缓冲区有剩余空间时不中断地写入数据，读取指针可以在循环缓冲区有数据时不停读取。
## 如何设计循环缓冲区

为了方便两个进程之间的通信，我们在共享内存中创建循环缓冲区。基本原理如图：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211021173628.png)
### 结构体定义
```c
typedef struct CyclicBuffer
{
    uint8_t buf[CYCBUFFSIZ];    //缓冲区
    uint8_t read;               //读指针
    uint8_t write;              //写指针
    uint32_t valid_size;        //已写入数据数
} CyCBuf;
```

### 写入数据
```c
void cycbuff_write(CyCBuf *cycbuff, uint8_t ch)
{
    while (cycbuff_isfull(cycbuff))
        ;
    cycbuff->buf[cycbuff->write] = ch;
    cycbuff->write++;
    cycbuff->write %= CYCBUFFSIZ;
    cycbuff->valid_size++;
}
```

写入数据前，要检查缓冲区是否已满，如果已满就得挂起等待。直到缓冲区有空间再进行写入。

写入指针每次写完向后偏移一位，`valid_size`记录当前缓冲区中有效数据个数。

### 读取数据
```c
uint8_t cycbuff_read(CyCBuf *cycbuff)
{
    uint8_t ch;
    while (cycbuff_isempty(cycbuff))
        ;
    ch = cycbuff->buf[cycbuff->read];
    cycbuff->read++;
    cycbuff->read %= CYCBUFFSIZ;
    cycbuff->valid_size--;
    return ch;
}
```
读取数据前，要检查缓冲区是否为空，如果为空就要挂起等待。
### 判断空
```c
bool cycbuff_isempty(CyCBuf *cycbuff)
{
    if (cycbuff->valid_size == 0)
        return true;
    return false;
}
```
### 判断满
```c
bool cycbuff_isfull(CyCBuf *cycbuff)
{
    if (cycbuff->valid_size == CYCBUFFSIZ)
        return true;
    return false;
}
```
本次实验中，为了方便期间，用`valid_size`保存有效数据个数，没有用读写指针是否重合来判断，这就无需再考虑读写指针重合时，是空还是满。

## 数据收发流程
### 服务端-写入
```c
void server(CyCBuf *cycbuff, SHMS *shms)
{
    cycbuff_init(cycbuff);
    while (1)
    {
        puts("Enter Message: ");
        uint8_t ch[BUFFERSIZE];
        fgets(ch, BUFFERSIZE, stdin);
        for (size_t i = 0; ch[i] != '\n' && i < BUFFERSIZE; i++)
        {
            cycbuff_write(cycbuff, ch[i]);
        }
        cycbuff_write(cycbuff, '\n');
    }
    exit(0);
}
```
`SHMS *shms`为共享内存相关数据，有关共享内存的使用可以参考[进程间通信（IPC）之共享内存（SharedMemory）](https://dunky-z.github.io/2021/08/10/%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1%EF%BC%88IPC%EF%BC%89%E4%B9%8B%E5%85%B1%E4%BA%AB%E5%86%85%E5%AD%98%EF%BC%88SharedMemory%EF%BC%89/)。
### 客户端-读取

```c
void client(CyCBuf *cycbuff, SHMS *shms)
{
    printf("Server operational: shm id is %d\n", shms->shmid);
    while (1)
    {
        uint8_t ch;
        puts("Recv Message: ");
        while (1)
        {
            ch = cycbuff_read(cycbuff);
            if (ch == '\n')
            {
                printf("\n");
                break;
            }
            fflush(stdout);
            printf("%c", ch);
        }
    }
}
```
读取数据以回车符为分界，当读到回车符时进行换行处理，并等待接收下一波数据。

## 实验结果
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211021195237.gif)
## Reference

[Circular buffer](https://en.wikipedia.org/wiki/Circular_buffer)