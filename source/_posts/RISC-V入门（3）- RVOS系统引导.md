---
title: RISC-V入门（3）-RVOS系统引导
date: 2021-10-20 23:13:40
tags: [RISCV]
categories: [RISC-V入门]
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

## UART硬件介绍

### 连接方式
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211022171638.png)

真实的硬件开发是有一个快开发板，但是这个课程里使用的是QEMU来模拟开发板的硬件环境。如果要在程序里打印一段信息，正常的情况是在开发板上连接显示器，但是这里是通过将信息用串口传到主机上，然后用主机的屏幕显示信息。

串口线里是有两根线，负责收信息和发信息。

### UART特点

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211022172156.png)

- 并行就是需要多根线，比如有两根线，那么就可以一次发送两位。但是串行节省材料。
- 数据通信就会涉及同步的问题，同步的话需要一根时钟线来协商好发送时间和接收时间。而UART使用异步，发送的数据不仅仅是真实的数据，还会带有一些标识信息。这些标识可以判断出是收还是发。

### 物理接口

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110252233134.png)

### UART通讯协议

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110252235270.png)

图示中横轴可以表示时间，纵轴表示高低电平。

在需要发送数据时，会进行“下拉”1bit，1bit持续的时间就是波特率分之一秒。

数据在发送过程中可能会受到干扰，会产生畸变，所以需要检验位来判断是否发生畸变。


![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110252246423.png)

### 初始化

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110252305528.png)

在软件中，配置UART就是配置寄存器的信息。

在板子上有个元器件叫晶振（crystal），他会产生固定频率的时钟。一种是1.8432MHZ，一种是7.3728MHZ。想要获得指定的输出频率就需要对寄存器进行配置。查表可以得到配置信息。比如获得38.4K频率的输出，就要配置寄存器值为3。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202110252310435.png)

LCR寄存器功能比较多，将第7位设置为1就是用来设置波特率。

图中`DLL`和`DLM`寄存器就是需要配置的寄存器。因为UART寄存器都是8位的，将值`0x0003`高位`0x00`存在`DLM`中，将低位`0x03`存入`DLL`。



