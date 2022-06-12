---
title: 计算机组成原理-存储于IO系统
date: 2022-05-08 10:48:23
updated:
tags: [计算机组成原理]
categories: [计算机组成原理]
---
## 存储器

### 存储器的层次结构

#### SRAM（Static Random-Access Memory，静态随机存取存储器）

CPU如果形容成人的大脑的话，那么CPU Cache (高速缓存)就好比人的记忆。它用的是SRAM芯片。

SRAM的“静态”的意思是，只要处于通电状态，里面的数据就保持存在，一旦断电，数据就会丢失。SRAM里1bit数据需要6-8个晶体管，所以SRAM的存储密度不高，同样的物理空间，能够存的数据有限。因为其电路简单，访问速度非常快。

在CPU里，通常会有L1、L2、L3这样三层高速缓存。每个CPU核心都有一块属于自己的L1高速缓存，通常分成指令缓存和数据缓存，分开存放CPU使用的指令和数据。

L2的Cache同样是每个CPU核心都有的，不过它往往不在CPU核心的内部。所以，L2 Cache 的访问速度会比L1稍微慢一些。而L3Cache，则通常是多个CPU核心共用的，尺寸会更大一些，访问速度自然也就更慢一些。


你可以把CPU中的L1Cache理解为我们的短期记忆，把L2/L3Cache理解成长期记忆，把内存当成我们拥有的书架或者书桌。当我们自己记忆中没有资料的时候，可以从书桌或者书架上拿书来翻阅。这个过程中就相当于，数据从内存中加载到CPU的寄存器和Cache中，然后通过“大脑”，也就是CPU，进行处理和运算。


#### DRAM（Dynamic Random Access Memory，动态随机存取存储器）

内存用的芯片和Cache有所不同，它用的是一种叫作DRAM的芯片，比起SRAM来说，它的密度更高，有更大的容量，而且它也比SRAM芯片便宜不少。

DRAM被称为“动态”存储器，是因为DRAM需要靠不断地“刷新”，才能保持数据被存储起来。DRAM的一个比特，只需要一个晶体管和一个电容就能存储。所以，DRAM在同样的物理空间下，能够存储的数据也就更多，也就是存储的“密度”更大。但是，因为数据是存储在电容里的，电容会不断漏电，所以需要定时刷新充电，才能保持数据不丢失。DRAM的数据访问电路和刷新电路都比SRAM更复杂，所以访问延时也就更长。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205081652018.png)


从Cache、内存，到SSD和HDD硬盘，一台现代计算机中，就用上了所有这些存储器设备。其中，容量越小的设备速度越快，而且，CPU并不是直接和每一种存储器设备打交道，而是每一种存储器设备，只和它相邻的存储设备打交道。比如，CPUCache是从内存里加载而来的，或者需要写回内存，并不会直接写回数据到硬盘，也不会直接从硬盘加载数据到CPUCache中，而是先加载到内存，再从内存加载到Cache中。

这样，各个存储器只和相邻的一层存储器打交道，并且随着一层层向下，存储器的容量逐层增大，访问速度逐层变慢，而单位存储成本也逐层下降，也就构成了我们日常所说的存储器层次结构。







## 缓存
### CPU cache
### 高速缓存

### 缓存一致性协议MESI

#### 为什么需要缓存一致
目前主流电脑的CPU都是多核心的，多核心的有点就是在不能提升CPU主频后，通过增加核心来提升CPU吞吐量。每个核心都有自己的L1 Cache和L2 Cache，只是共用L3 Cache和主内存。每个核心操作是独立的，每个核心的Cache就不是同步更新的，这样就会带来缓存一致性（Cache Coherence）的问题。

举个例子，如图：
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205291536919.gif)

有2个CPU，主内存里有个变量`x=0`。CPU A中有个需要将变量`x`加`1`。CPU A就将变量`x`加载到自己的缓存中，然后将变量`x`加`1`。因为此时CPU A 还未将缓存数据写回主内存，CPU B再读取变量`x`时，变量`x`的值依然是`0`。

这里的问题就是所谓的缓存一致性问题，因为CPU A的缓存与CPU B的缓存是不一致的。
#### 如何解决缓存一致性问题

##### 通过在总线加LOCK锁的方式
在锁住总线上加一个LOCK标识，CPU A进行读写操作时，锁住总线，其他CPU此时无法进行内存读写操作，只有等解锁了才能进行操作。

该方式因为锁住了整个总线，所以效率低。

##### 缓存一致性协议MESI
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











## 内存

## 总线： 计算机内部的高速公路

计算机由控制器、运算器、存储器、输入设备以及输出设备五大部分组成。CPU所代表的控制器和运算器，要和存储器，也就是我们的主内存，以及输入和输出设备进行通信。那么计算机是用什么样的方式来完成，CPU和内存、以及外部输入输出设备的通信呢？答案就是通过总线来通信。

计算机里有不同的硬件设备，如果设备与设备之间都单独连接，那么就需要N*N的连线。那么怎么降低复杂度呢？与其让各个设备之间互相单独通信，不如我们去设计一个公用的线路。CPU想要和什么设备通信，通信的指令是什么，对应的数据是什么，都发送到这个线路上；设备要向CPU发送什么信息呢，也发送到这个线路上。这个线路就好像一个高速公路，各个设备和其他设备之间，不需要单独建公路，只建一条小路通向这条高速公路就好了。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205081510203.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205081510711.png)

### 三种线路和多总线架构

首先，CPU和内存以及高速缓存通信的总线，这里面通常有两种总线。这种方式，我们称之为双独立总线（Dual Independent Bus，缩写为 DIB）。CPU里，有一个快速的本地总线（Local Bus），以及一个速度相对较慢的前端总线（Front-side Bus）。

现代的CPU里，通常有专门的高速缓存芯片。这里的高速本地总线，就是用来和高速缓存通信的。而前端总线，则是用来和主内存以及输入输出设备通信的。有时候，我们会把本地总线也叫作后端总线（Back-sideBus），和前面的前端总线对应起来。


除了前端总线呢，我们常常还会听到PCI总线、I/O总线或者系统总线（System Bus）。看到这么多总线的名字，你是不是已经有点晕了。这些名词确实容易混为一谈。其实各种总线的命名一直都很混乱，我们不如直接来看一看CPU的硬件架构图。对照图来看，一切问题就都清楚了。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205081513938.png)


CPU里面的北桥芯片，把我们上面说的前端总线，一分为二，变成了三个总线。我们的前端总线，其实就是系统总线。CPU里面的内存接口，直接和系统总线通信，然后系统总线再接入一个I/O桥接器（I/OBridge）。这个I/O桥接器，一边接入了我们的内存总线，使得我们的CPU和内存通信；另一边呢，又接入了一个I/O总线，用来连接I/O设备。


事实上，真实的计算机里，这个总线层面拆分得更细。根据不同的设备，还会分成独立的PCI总线、ISA总线等等。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205081516341.png)

在物理层面，其实我们完全可以把总线看作一组“电线”。不过呢，这些电线之间也是有分工的，我们通常有三类线路。
1. 数据线（Data Bus），用来传输实际的数据信息，也就是实际上了公交车的“人”。
2. 地址线（Address Bus），用来确定到底把数据传输到哪里去，是内存的某个位置，还是某一个I/O设备。这个其实就相当于拿了个纸条，写下了上面的人要下车的站点。
3. 控制线（ControlBus），用来控制对于总线的访问。虽然我们把总线比喻成了一辆公交车。那么有人想要做公交车的时候，需要告诉公交车司机，这个就是我们的控制信号。

尽管总线减少了设备之间的耦合，也降低了系统设计的复杂度，但同时也带来了一个新问题，那就是**总线不能同时给多个设备提供通信功能**。

我们的总线是很多个设备公用的，那多个设备都想要用总线，我们就需要有一个机制，去决定这种情况下，到底把总线给哪一个设备用。这个机制，就叫作**总线裁决**（Bus Arbitraction）


[【硬件科普】电脑主板右下角的散热片下面究竟隐藏着什么？详解主板南桥芯片组的功能和作用_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1cJ411K7HW?spm_id_from=333.999.0.0)














