---
title: RISC-V入门（1）- 计算机基础
date: 2021-08-26 13:42:34
tags: [RISCV]
categories: [RISC-V入门]
---

## 计算机基础

### 计算机硬件基础

两大硬件架构

- 冯诺依曼架构

  - 一根总线，开销小，控制逻辑实现简单

  - 执行效率低

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211529332.png)

- 哈佛架构

  - 与上一架构相反

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211529619.png)

### 程序的存储与执行

`.c`文件经过编译链接，生成`.out`文件。加载到内存中，到控制单元运行。进行取值，译码，执行。

晶振发出脉冲。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211621792.png)

### 语言的设计与进化
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211735861.png)
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211736944.png)
上图是冯诺依曼架构，特点就是指令与数据放在一起。黄色部分表示指令，绿色部分表示数据。我们来看看指令是如何执行的。
`ProgramCounter`指到右图内存的第一条指令，程序开始执行。将第一条 指令读入指令寄存器。然后将指令解码，根据之前的规定，我们可以知道这条指令是将`0100(二进制即5)`位置的数据，`00(load)`到`00(Register 0)`中。下面的指令一次类推，每次取指，`Program Counter`移动一次。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211743999.png)
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108211719114.png)
