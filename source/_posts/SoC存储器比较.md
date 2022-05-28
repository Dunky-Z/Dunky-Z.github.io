---
title: SoC存储器比较
date: 2022-05-21 17:13:33
updated:
tags: [固件开发,芯片开发,SoC,存储器]
categories: 
---

## 内存  

也就是内部存储器，主要用来运行程序的，典型的就是 RAM随机存储器（Random Access Memory），那么随机是什么意思？所谓随机，指的是当存储器中的数据被读取或写入时，所需要的时间与这段信息所在的位置无关（任何位置读写速度一样）。

**DRAM**（Dynamic Random Access Memory，动态随机存储器）是最为常见的系统内存。我们使用的电脑和手机的运行内存都是DRAM。DRAM使用电容存储，DRAM 只能将数据保持很短的时间。为了保持数据，所以必须隔一段时间刷新（refresh）一次，如果存储单元没有被刷新，存储的信息就会丢失。数据的存储，请参考数据存储模型。我们知道，电容中的电荷很容易变化，所以随着时间推移，电容中的电荷数会增加或减少，为了确保数据不会丢失，DRAM每隔一段时间会给电容刷新（充电或放电）。动态：定时刷新数据

**SRAM**（Static Random Access Memory，静态随机存储器），它是一种具有静止存取功能的内存，其内部机构比DRAM复杂，可以做到不刷新电路即能保存它内部存储的数据。**静态：不需要刷新**

**DDR SDRAM**（Double Data Rate SDRAM）：为双信道同步动态随机存取内存，是新一代的SDRAM技术。DDR内存芯片的数据预取宽度（Prefetch）为2 bit（SDRAM的两倍）。

**DDR2 SDRAM**（Double Data Rate Two SDRAM）：为双信道两次同步动态随机存取内存。DDR2内存Prefetch又再度提升至4 bit（DDR的两倍）

**DDR3 SDRAM**（Double Data Rate Three SDRAM）：为双信道三次同步动态随机存取内存。DDR3内存Prefetch提升至8 bit，即每次会存取8 bits为一组的数据。运算频率介于 800MHz -1600MHz之间。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205211606655.png)

## 外存

外部存储器 ，通常用来存储文件的，一般也叫 ROM （**Read-only memory**）只读存储器。

CPU连接内存和外存的连接方式不同。内存需要直接地址访问，所以是通过地址总线&数据总线的总线式访问方式连接的（好处是直接访问，随机访问；坏处是占用CPU的地址空间，大小受限）；外存是通过CPU的外存接口来连接的（好处是不占用CPU的地址空间，坏处是访问速度没有总线式快，访问时序较复杂）

> 我们平时用的硬盘，SD卡都属于ROM，但是他们却可以写入？ROM严格意义来讲确实是只读的，但是随着储存器的发展，出现了可擦可编程只读存储器（EPROM）、电可擦可编程只读存储器（EEPROM）形式的半导体存储器，以及flash。他们都是可写的。ROM就不再单单只表示只读存储器了，一般来说与RAM相对，掉电不易失的存储器都被当做ROM。

### ROM

ROM（Read Only Memory）只读存储器，这种存储器（Memory）的内容任何情况下都不会改变，电脑与用户只能读取保存在这里的指令，和使用存储在ROM的资料，但不能变更或存入资料。ROM被存储在一个非易失性芯片上，也就是说，即使在关机之后记忆的内容仍可以被保存，所以这种存储器多用来存储特定功能的程序，如[固件](https://zh.wikipedia.org/wiki/固件)。ROM存储用来启动电脑的程序（如[BIOS](https://zh.wikipedia.org/wiki/BIOS)），电脑引导的时候BIOS提供一连串的指令对中央处理器（[CPU](https://zh.wikipedia.org/wiki/CPU)）等组件进行初始化，在初始化过程中，BIOS程序初始化并检查[RAM](https://zh.wikipedia.org/wiki/随机存取存储器)。

### NorFlash   

总线式访问，接到SROM bank，优点是可以直接总线访问，一般用来启动。

### NandFlash

SLC：容量小，价格高，稳定性高

MLC：容量大，价格低，稳定性差，易出坏块

**iNand**
SanDisk公司出产的eMMC

**moviNand**
三星公司出产的eMMC

**oneNAND**
三星公司出的一种Nand，价格贵，用的少

**SD卡（Secure Digital Memory Card）**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205192308956.png)

**TF卡（TransFLash Card, MicroSD）**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205192309547.png)

**MMC卡**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205192312777.png)

**eMMC卡（embeded MMC）**
嵌入式的MMC，可以当成一种芯片，内部做了坏块处理

**SATA硬盘**

特点：机械式访问、磁存储原理、SATA是接口。


