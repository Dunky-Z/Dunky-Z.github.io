---
title: RISC-V入门（3）-RVOS系统引导
date: 2021-10-20 23:13:40
tags: [RISCV]
---

## 硬件的基本概念

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110202320868.png)

- Hart
- Platform
不能说是个板子，应该理解为芯片。早期的板子就是一块芯片加上各种外设，但是随着技术发展，板子越来越小，外设却并没有变少 ，是因为外设都被集成到了芯片中。当所有外设都被集成，那么芯片就是platform。
- SoC(System on Chip)
片上系统

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110202328649.png)

QEMU模拟virt这个平台，这个平台有八个Hart。

## 地址映射

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110202331403.png)

为了方便访问外设，现在主流的platform会对外设的内存地址做一个映射。映射到platform的真实物理地址。对真实物理地址进行操作时，就是对外设的地址进行操作。

物理地址从最低位到最高位都被分配给了各种外设。

## 引导过程介绍
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110202342918.png)

通电后，会先到箭头所指的地址，这个地址就是对应的ROM外设首地址。ROM相当于一个小硬盘，断电后不会丢失数据。这里面固化了一些指令。

主要就是跳转指令，运行到kernel段继续执行。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212317389.png)

八核同时在执行这个过程。

以上是硬件的部分过程，软件该如何写？

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212320524.png)

为了简化学习流程和降低调试难度，目前只支持单核，其余七个核处于空转状态。

### 如何判断当前Hart是不是第一个？


![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212323556.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212325328.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212325081.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212327552.png)

以上指令就是将寄存器值进行一次交换，只不过这个过程是原子性的，不能被打断。

`CSRRW`经常会用在伪指令`CSRW`中，完整指令中，第一步向`x0`写入数据，就是空操作，第二步将`rs`写入`csr`。这个伪指令就是完成了一个写入`csr`的操作。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212333753.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212335906.png)

`mhartid`就是`machine hart id`。

学习以上几个指令 ，就可以完成判断hart是否为第一个的工作了， 

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110212337619.png)

```
csrr t0, mhartid    #读寄存器值
mv tp, t0           #
bnez t0, park       # 跳转指令，不等于0就跳转到park标签
```