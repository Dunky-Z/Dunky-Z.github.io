---
title: CPU缓存一致性MESI协议
date: 2022-05-29 15:04:59
updated:
tags: [计算机组成原理, CPU, MESI协议, 通信协议]
categories:
---

## 为什么需要缓存一致
目前主流电脑的CPU都是多核心的，多核心的有点就是在不能提升CPU主频后，通过增加核心来提升CPU吞吐量。每个核心都有自己的L1 Cache和L2 Cache，只是共用L3 Cache和主内存。每个核心操作是独立的，每个核心的Cache就不是同步更新的，这样就会带来缓存一致性（Cache Coherence）的问题。

举个例子，如图：
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205291536919.gif)

有2个CPU，主内存里有个变量`x=0`。CPU A中有个需要将变量`x`加`1`。CPU A就将变量`x`加载到自己的缓存中，然后将变量`x`加`1`。因为此时CPU A 还未将缓存数据写回主内存，CPU B再读取变量`x`时，变量`x`的值依然是`0`。

这里的问题就是所谓的缓存一致性问题，因为CPU A的缓存与CPU B的缓存是不一致的。
## 如何解决缓存一致性问题

### 通过在总线加LOCK锁的方式
在锁住总线上加一个LOCK标识，CPU A进行读写操作时，锁住总线，其他CPU此时无法进行内存读写操作，只有等解锁了才能进行操作。

该方式因为锁住了整个总线，所以效率低。

### 缓存一致性协议MESI
该方式对单个缓存行的数据进行加锁，不会影响到内存其他数据的读写。

在学习MESI协议之前，简单了解一下总线嗅探机制（Bus Snooping）。要对自己的缓存加锁，需要通知其他CPU，多个 CPU 核心之间的数据传播问题。最常见的一种解决方案就是总线嗅探。

这个策略，本质上就是把所有的读写请求都通过总线广播给所有的 CPU 核心，然后让各个核心去“嗅探”这些请求，再根据本地的情况进行响应。MESI就是基于总线嗅探机制的缓存一致性协议。

MESI 协议的由来是对Cache Line 的四个不同的标记，分别是：

|<div style="width:50px">状态</div>|<div style="width:100px">状态</div>|<div style="width:200px">描述</div>|<div style="width:200px">监听任务</div>|
| :----: | :----: |  ---- | ---- |
|Modified|已修改|该 Cache Line 有效，数据被修改了，和内存中的数据不一致，数据只存在于本 Cache 中|Cache Line 必须时刻监听所有试图读该 Cache Line 相对于主存的操作，这种操作必须在缓存将该 Cache Line 写回主存并将状态改为S状态之前，被延迟执行| 
|Exclusive|独享，互斥| 该 Cache Line 有效，数据和内存中的数据一直，数据只存在于本 Cache|Cache Line 必须监听其他缓存读主存中该 Cache Line 的操作，一旦有这种操作，该 Cache Line 需要改为S状态| 
|Shared|共享的|该 Cache Line 有效，数据和内存中的数据一直，数据存在于很多个 Cache 中| Cache Line 必须监听其他  Cache Line 使该 Cache Line 无效或者独享该 Cache Line 的请求，并将 Cache Line 改为I状态| 
|Invalid|无效的|该 Cache Line 无效|无| 

整个 MESI 的状态，可以用一个有限状态机来表示它的状态流转。需要注意的是，对于不同状态触发的事件操作，可能来自于当前 CPU 核心，也可能来自总线里其他 CPU 核心广播出来的信号。我把各个状态之间的流转用表格总结了一下：

|<div style="width:80px">当前状态</div>|<div style="width:80px">事件</div>|<div style="width:300px,center">行为</div>|<div style="width:80px">下个状态</div>|
| :----: | :----: |  ---- | :----: |
|M|Local Read|从 Cache 中读，状态不变|M|
|M|Local Write|修改cache数据，状态不变|M|
|M|Remote Read|这行数据被写到内存中，使其他核能使用到最新数据，状态变为S|S|
|M|Remote Write|这行数据被写入内存中，其他核可以获取到最新数据，由于其他CPU修改该条数据，则本地Cache变为I|I|

|<div style="width:80px">当前状态</div>|<div style="width:80px">事件</div>|<div style="width:200px,center">行为</div>|<div style="width:80px">下个状态</div>|
| :----: | :----: |  ---- | :----: |
|E|Local Read|从 Cache 中读，状态不变|E|
|E|Local Write|修改数据，状态改为M|M|
|E|Remote Read|数据和其他CPU共享，变为S|S|
|E|Remote Write|数据被修改，本地缓存失效，变为I|I|

|<div style="width:80px">当前状态</div>|<div style="width:80px">事件</div>|<div style="width:200px,text-align: center">行为</div>|<div style="width:80px">下个状态</div>|
| :----: | :----: |  ---- | :----: |
|S|Local Read|从 Cache 中读，状态不变|S|
|S|Local Write|修改数据，状态改为M，其他CPU的Cache Line状态改为I|M|
|S|Remote Read|数据和其他CPU共享，状态不变|S|
|S|Remote Write|数据被修改，本地缓存失效，变为I|I|

|<div style="width:80px">当前状态</div>|<div style="width:80px">事件</div>|<div style="width:200px,center">行为</div>|<div style="width:80px">下个状态</div>|
| :----: | :----: |  ---- | :----: |
|I|Local Read|1. 如果其他CPU没有这份数据，直接从内存中加载数据，状态变为E；<br> 2. 如果其他CPU有这个数据，且Cache Line状态为M，则先把Cache Line中的内容写回到主存。本地Cache再从内存中读取数据，这时两个Cache Line的状态都变为S；<br>3. 如果其他Cache Line有这份数据，并且状态为S或者E，则本地Cache Line从主存读取数据，并将这些Cache Line状态改为S|E或者S|
|I|Local Write|1. 先从内存中读取数据，如果其他Cache Line中有这份数据，且状态为M，则现将数据更新到主存再读取，将Cache Line状态改为M；<br> 2. 如果其他Cache Line有这份数据，且状态为E或者S，则其他Cache Line状态改为I|M|
|I|Remote Read|数据和其他CPU共享，状态不变|S| 
|I|Remote Write|数据被修改，本地缓存失效，变为I|I|