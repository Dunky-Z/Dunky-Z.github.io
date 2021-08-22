---
title: RISC-V入门
date: 2021-08-21 15:51:03
tags: [RISCV]
---
## 计算机基础

### 计算机硬件基础

两大硬件架构

- 冯诺依曼架构

  - 一根总线，开销小，控制逻辑实现简单

  - 执行效率低

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211529332.png)

- 哈佛架构

  - 与上一架构相反

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211529619.png)

### 程序的存储与执行

`.c`文件经过编译链接，生成`.out`文件。加载到内存中，到控制单元运行。进行取值，译码，执行。

晶振发出脉冲。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211621792.png)

### 语言的设计与进化
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211735861.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211736944.png)
上图是冯诺依曼架构，特点就是指令与数据放在一起。黄色部分表示指令，绿色部分表示数据。我们来看看指令是如何执行的。
`ProgramCounter`指到右图内存的第一条指令，程序开始执行。将第一条 指令读入指令寄存器。然后将指令解码，根据之前的规定，我们可以知道这条指令是将`0100(二进制即5)`位置的数据，`00(load)`到`00(Register 0)`中。下面的指令一次类推，每次取指，`Program Counter`移动一次。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211743999.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202108211719114.png)

## RISCV介绍
### 什么是ISA
底层硬件电路面向上层软件程序提供的一种接口规范。
ISA定义了：
- 基本数据类型
- 寄存器
- 指令
- 寻址模式
- 异常或者中断等

### 为什么要ISA
为上层软件提供一层抽象，制定规则和约束，让编程者不用操心具体的电路结构。（微架构考虑的事）

IBM360是第一个将ISA与其实现分离的计算机。

### 复杂指令集（CISC）与简单指令集（RISC）
CISC(Complex Instruction Set Computing)：针对特定的功能实现特定的指令，导致指令数目比较多，但生成的程序长度相对较短。
RISC(Reduced Instruction Set Computing)：只定义常用指令,对复杂的功能采用常用指令组合实现，这导致指令数目比较精简，但生成的程序长度相对较长。

### ISA宽度
宽度指的是CPU通用寄存器的宽度（二进制位数），这决定了寻址大小，数据运算能力

