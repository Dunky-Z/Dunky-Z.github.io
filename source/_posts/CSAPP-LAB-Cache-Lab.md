---
title: CSAPP-LAB-Cache Lab
date: 2022-07-11 09:55:39
updated:
tags: [Linux,CSAPP, Cache]
categories: [CSAPP-Lab]
---

## 预备知识

开始这个实验前，需要学习《CSAPP第六章-存储器层次结构》的相关内容，与缓存相关的内容，我也做了相关的[CPU Cache高速缓存学习记录](https://dunky-z.github.io/2022/07/10/CPU-Cache%E9%AB%98%E9%80%9F%E7%BC%93%E5%AD%98/)可以参考。

实验相关的文件可以从[CS:APP3e, Bryant and O'Hallaron](http://csapp.cs.cmu.edu/3e/labs.html)下载。

其中，
- README：介绍实验目的和实验要求，以及实验的相关文件。需要注意的是，必须在64-bit x86-64 system上运行实验。需要安装Valgrind工具。
- Writeup：实验指导。
- Release Notes：版本发布信息。
- Self-Study Handout：**需要下载的压缩包**，里面包含了待修改的源码文件等。

下载Self-Study Handout并解压，得到如下文件：
```bash
├── cachelab.c    # 一些辅助函数，如打印输出等，不需要修改
├── cachelab.h    # 同上
├── csim.c        # 需要完善的主文件，需要在这里模拟Cache
├── csim-ref      # 已经编译好的程序，我们模拟的Cache需要与这个程序运行的结果保持一致
├── driver.py     # 驱动程序，运行 test-csim 和 test-trans
├── Makefile      # 用来编译csim程序
├── README        # 
├── test-csim     # 测试缓存模拟器
├── test-trans.c  # 测试转置功能
├── tracegen.c    # test-trans 辅助程序
├── traces        # test-csim.c 使用的跟踪文件
│   ├── dave.trace
│   ├── long.trace
│   ├── trans.trace
│   ├── yi2.trace
│   └── yi.trace
└── trans.c
```


![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220711145159.png)

## Part A —— Writing A Cache Simulator
在 Part A，我们将在 `csim.c` 中编写一个缓存模拟器，它将 `valgrind` 内存跟踪作为输入，在此跟踪上模拟高速缓存的命中/未命中行为，并输出命中、未命中和驱逐的总数。

这里的输入由`valgrind`通过以下命令生成的：

```bash
valgrind --log-fd=1 --tool=lackey -v --trace-mem=yes ls -l
```
`--log-fd=1`表示将输出输出到标准输出；
`--tool=lackey`：Lackey是一个简单的Valgrind工具，可进行各种基本程序测量；
`--trace-mem=yes`：Lackey的一个参数，启用后，Lackey会打印程序几乎所有内存访问的大小和地址；
`ls -l`：是一个简单的程序，可以查看当前目录下的文件列表。
也就是检测`ls -l`程序在运行时访问内存的情况。

执行结果像下面的形式：
```bash
# [space]operation address,size
I  0400639c,4
 L 1ffeffec00,8
I  040063a0,2
 S 1ffeffea50,8
I  040063a2,4
 L 1ffeffebf0,8
I  040063a6,3
I  040063a9,3
 L 1ffeffebf8,4
I  040063ac,7
```

操作字段表示内存访问的类型：`I`表示指令加载，`L`表示数据加载，`S`表示数据存储，`M`表示数据修改（即，数据加载后跟数据存储） ）。每个`I`之前都没有空格。每个`M`、`L`和`S`之前总是有一个空格。地址字段指定一个 `64` 位的十六进制内存地址。 `size` 字段指定操作访问的字节数。

了解这些基础后，**我们最主要的是要明确，我们需要实现一个什么样的程序，这个程序具体有哪些参数，怎么执行的**。`csim-ref`是已经完成的可执行文件，它的用法是

```bash
./csim-ref [-hv] -s <s> -E <E> -b <b> -t <tracefile>
```
- `-h`：打印帮助信息；
- `-v`：显示详细信息，如是I，L还是M；
- `-s <s>`：组索引位数（$S=2^{s}$组个数）；
- `-E <E>`：关联性（每组的行数）；
- `-b <b>`：块位数（$B=2^{b}$ 是块大小）；
- `-t <tracefile>`：valgrind 生成的文件；

如：
```bash
./csim-ref -s 4 -E 1 -b 4 -t traces/yi.trace
hits:4 misses:5 evictions:3
```
如果显示详细信息可以执行：
```bash
./csim-ref -v -s 4 -E 1 -b 4 -t traces/yi.trace
L 10,1 miss
M 20,1 miss hit
L 22,1 hit
S 18,1 hit
L 110,1 miss eviction
L 210,1 miss eviction
M 12,1 miss eviction hit
hits:4 misses:5 evictions:3
```

我们的目的就是要完善`csim.c`，使其能够使用上面相同的参数，得到与`csim-ref`相同的结果。
[Cache Lab Implementa/on and Blocking](http://www.cs.cmu.edu/afs/cs/academic/class/15213-f15/www/recitations/rec07.pdf)这份PPT里有一些实验指导，可以参考。
首先需要解决的就是如何处理输入的参数，我们可以使用PPT里提到的`getopt`库来解决。
```C
#include <stdbool.h>
#include <string.h>
#include "cachelab.h"
#include "getopt.h"

static int S; // 组个数
static int s; // 组占的位数
static int E;
static int B;
static int hits = 0;
static int misses = 0;
static int evictions = 0;

typedef struct _CacheLine {
    unsigned tag;
    struct _CacheLine *next;
    struct _CacheLine *prev;
} CacheLine;

typedef struct _Cache {
    CacheLine *head;
    CacheLine *tail;
    int *size;
} Cache;

static Cache *cache;

void parse_option(int argc, char **argv, char **fileName)
{
    int option;
    while ((option = getopt(argc, argv, "s:E:b:t:")) != -1) {
        switch (option) {
        case 's':
            s = atoi(optarg);
            // 传入的参数为占用的bit，需要转换为10进制
            S = 1 << s;
        case 'E':
            E = atoi(optarg);
        case 'b':
            B = atoi(optarg);
        case 't':
            strcpy(*fileName, optarg);
        }
    }
}

void initialize_cache()
{
    cache = malloc(S * sizeof(*cache));
    for (int i = 0; i < S; i++) {
        cache[i].head = malloc(sizeof(CacheLine));
        cache[i].tail = malloc(sizeof(CacheLine));

        cache[i].head->next = cache[i].tail;
        cache[i].tail->prev = cache[i].head;
        (cache[i].size) = (int *)malloc(sizeof(int));
        *(cache[i].size) = 0;
    }
}

/*!
 * @breif Add a new CacheLine to the Cache first line
 * @param nodeToDel CacheLine to be deleted
 * @param curLru  Current Cache
 */
void insert_first_line(CacheLine *node, Cache *curLru)
{
    node->next = curLru->head->next;
    node->prev = curLru->head;

    curLru->head->next->prev = node;
    curLru->head->next = node;

    *(curLru->size) = *(curLru->size) + 1;
}

void evict(CacheLine *nodeToDel, Cache *curLru)
{
    nodeToDel->next->prev = nodeToDel->prev;
    nodeToDel->prev->next = nodeToDel->next;
    *(curLru->size) = *(curLru->size) - 1;
}

void update(unsigned address)
{
    unsigned int mask = 0xFFFFFFFF;
    unsigned int maskSet = mask >> (32 - s);
    // 取出组索引
    unsigned int targetSet = ((maskSet) & (address >> B));
    // 取出标记
    unsigned int targetTag = address >> (s + B);

    Cache curLru = cache[targetSet];

    // 查找是否存与当前标记位相同的缓存行
    CacheLine *cur = curLru.head->next;
    bool found = 0;
    while (cur != curLru.tail) {
        if (cur->tag == targetTag) {
            found = true;
            break;
        }
        cur = cur->next;
    }

    if (found) {
        hits++;
        evict(cur, &curLru);
        insert_first_line(cur, &curLru);
        printf("> hit!, set: %d \n", targetSet);
    } else {
        CacheLine *newNode = malloc(sizeof(CacheLine));
        newNode->tag = targetTag;
        if (*(curLru.size) == E) { // 如果缓存已满，则删除最后一个缓存行
            evict(curLru.tail->prev, &curLru);
            insert_first_line(newNode, &curLru);
            evictions++;
            misses++;
            printf("> evic && miss set:%d\n", targetSet);
        } else {
            misses++;
            insert_first_line(newNode, &curLru);
            printf("> miss %d\n", targetSet);
        }
    }
}

void cache_simulate(char *fileName)
{
    // 分配并初始化S组缓存
    initialize_cache();

    FILE *file = fopen(fileName, "r");
    char op;
    unsigned int address;
    int size;

    while (fscanf(file, " %c %x,%d", &op, &address, &size) > 0) {
        printf("%c, %x %d\n", op, address, size);
        switch (op) {
        case 'L':
            update(address);
            break;
        case 'M':
            update(address);
        case 'S':
            update(address);
            break;
        }
    }
}

int main(int argc, char **argv)
{
    char *fileName = malloc(100 * sizeof(char));

    parse_option(argc, argv, &fileName);
    cache_simulate(fileName);
    printSummary(hits, misses, evictions);
    return 0;
}
```