---
title: RISC-V入门（2）-RISC-V汇编语言编程
date: 2021-10-16 23:26:42
tags: [RISCV]
categories: [RISC-V入门]
---



## 汇编语法介绍
一条典型的RISCV汇编语句由三个部分组成`[label:][operation][comment]`。
后缀`.s`和`.S`区别：后者纯汇编。
- label(标号)
- operation可以有以下多种类型:
  - instruction (指令) ：直接对应二进制机器指令的宇符串
  - pseudo-instruction (伪指令) ：为了提高编写代码的效率,可以用一条伪指令指示汇编器产生多条实际的指令(instructions)。
  - directive (指示/伪操作) ：通过类似指令的形式(以"."开头),通知汇编器如何控制代码的产生等，不对应具体的指令。
  - macro：采用.macro/.endm自定义的宏

	例子
	```
	.macro do_nothing	# directive
		nop		# pseudo-instruction
		nop		# pseudo-instruction
	.endm			# directive

		.text		# directive
		.global _start	# directive
	_start: 		# Label
		li x6, 5	# pseudo-instruction
		li x7, 4	# pseudo-instruction
		add x5, x6, x7	# instruction
		do_nothing	# Calling macro
	stop:	j stop		# statement in one line

		.end		# End of file
	```
- comment（注释）以`#`开头到行尾

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

### 开源与闭源
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108232257173.png)

### RISCV是什么
- 一款高质量,免许可证，开放的RISC ISA
- 一套由非营利的RISC-V基金会维护的标准: https://riscv.org/
- 适用于所有类型的计算系统：从微控制器到超级计算机
- RISC-V不是一家公司，也不是一款CPU实现。

### 命名规范
ISA命名格式: `RV[###][abc...xyz]`
- `RV`:用于标识RISC-V体系架构的前缀，即`RISC-V`的缩写。
- `[##]`: `{32, 64, 128}`用于标识处理器的字宽,也就是处理器的寄存器的宽度单位为bit
- `[abc xyz]`:标识该处理器支持的指令集模块集合。例子: `RV32IMA`, `RV64GC`
### 模块化
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108232325834.png)

### 通用寄存器
`PC`寄存器没有暴露出来，无法直接获取，改动。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108232328265.png)

### HART
HART = HARdware+Thread=硬件线程
以往一个Core里可能有两个执行流，
### 特权级别
不同特权级别下分别对应一套寄存器，比如用户态不能访问内核态的寄存器，这就起到了保护的作用。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108232356276.png)

高级别可以访问低级别的寄存器。

## RISCV汇编指令总览
### 操作对象
- 寄存器
	- 32个通用寄存器,`x0 ~ x31`（注意：本章节课程仅涉及RV32I的通用寄存器组）；
	- 在RISC-V中，Hart在执行算术逻辑运算时所操作的数据必须直接来自寄存器。
- 内存
	- Hart可以执行在寄存器和内存之间的数据读写操作;
	- 读写操作使用字节(Byte)为基本单位进行寻址;
	- RV32可以访问最多`2^32`个字节的内存空间。

### 编码格式
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826142737.png)

#### 小端序
- 主机字节序(HBO-Host Byte Order)
- 一个多字节整数在计算机内存中存储的字节顺序称主机字节序(HBO- Host Byte Order，或者叫本地字节序)
- 不同类型CPU的HBO不同,这与CPU的设计有关。分为大端序(Big-Endian)和小端序(Little-Endian)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826144713.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826145319.png)

### 指令分类
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826145633.png)


## 指令详解
### 算术运算指令
#### ADD
算数指令只包含加减，不包含乘除，乘除运算有专门的扩展。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108262335167.png)
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202108262343942.png)

数据传送顺序是由后向前，和正常的编码习惯类似。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202109172320337.png)
`.text`告诉编译器下面内容放到`elf`的`text section`中。
`.global`声明一个全局函数

elf文件包含了调试信息
使用objcopy命令生成的bin文件，剔除了调试信息

#### SUB Substract
##### 练习
现知道某条RISC-V的机器指令在内存中的值为`b3 05 95 00`,从左往右为从低地址到高地址，单位为字节，请将其翻译为对应的汇编指令。
- 确定字节序
在RISCV中存放是小端序，根据题意真正指令应该是`00 95 05 b3`
- 转换二进制
机器码是二进制，所以需要将上述指令值转换为二进制，可得`0000000 01001 01010 000 01011 0110011`
- 查阅手册
查阅`The RISC-V Instruction Set Manual Volume I: Unprivileged ISA`找到`RV32/64G Instruction Set Listings`指令表格，低7位是`opcode`，查表可得`0110011`对应操作码有多个`SLLI SRAI SUB `等等，此时再看最高位`00000000`,可以确定是`ADD`指令
- 将分割的二进制转成十进制
`0000000 9 10 000 11 010011`->`ADD x11 x10 x9`
#### ADDI ADD Immediate

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918102935.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918104115.png)

#### LUI Load Upper Immediate

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918104625.png)
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918104556.png)
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918104911.png)
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918104929.png)
#### 基于算术运算指令实现的其他伪指令

`x0`寄存器具有特殊含义，往里写数据没有意义。
`NOP`指令主要为了占位，空转。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210918103237.png)



### 逻辑运算指令
#### 逻辑运算

### 移位运算指令
#### 逻辑移位
#### 算数移位
只有右移，没有左移。左移会把最高位覆盖。
### 内存读写指令
### 条件分支指令
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211008115038.png)

指令格式中的立即数(imm)存放有些奇怪，第[1-4]位和第[11]位放在一起，第[5-10]位和第[12]位放在一起。这是为了迎合硬件处理效率，编程时不需要考虑立即数存储方式。

### 无条件跳转指令
### RISC-V指令寻址模式总结
## 汇编函数调用约定
### 函数调用过程概述
栈（stack）数据结构，在函数调用过程中会用来保存变量，函数地址等等。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162130267.png)

栈帧里保存的变量是自动变量，会被内存自动释放。

为何要有调用者与被调用者保存的概念
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162137133.png)

函数调用过程中就会有参数和返回值的传递，自己写的函数可能由别人来调用，如果没有约定好某个参数存放位置，就不能够顺利执行函数。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162144447.png)

因为寄存器需要经常在编程中使用，所以ABI名就是寄存器的别名。

> 这些寄存器其实都可以设置成被调用者保存，也就是在被调用函数中保存一遍为啥还要分这么多
答：因为保存一遍效率低

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162209273.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162217164.gif)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162234551.png)
## 汇编与C混合编程
###  前提
遵守ABI（Abstract Binary Interface）的规定
- 数据类型大小，布局，对齐
- 函数调用约定
- 系统调用约定
等等

RISC-V函数调用约定规定
- 函数参数采用寄存器`a0-a7`
- 函数返回值采用寄存器`a0,a1`

### 汇编嵌入C语言
```ASM
# ASM call C

	.text			# Define beginning of text section
	.global	_start		# Define entry _start
	.global	foo		# foo is a C function defined in test.c

_start:
	la sp, stack_end	# prepare stack for calling functions

	# RISC-V uses a0 ~ a7 to transfer parameters
	li a0, 1
	li a1, 2
	call foo    #调用了C语言函数
	# RISC-V uses a0 & a1 to transfer return value
	# check value of a0

stop:
	j stop			# Infinite loop to stop execution

	nop			# just for demo effect

stack_start:
	.rept 10
	.word 0
	.endr
stack_end:

	.end			# End of file

```

`call foo`就是在调用C语言函数，`foo`。
`.global foo`告诉编译器`foo`函数定义在外面。

### C语言嵌入汇编
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162347033.png)
下图中为简化写法
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202110162342119.png)
