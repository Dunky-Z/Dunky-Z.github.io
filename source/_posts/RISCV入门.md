---
title: RISCV入门
date: 2021-08-26 13:42:34
tags: [RISCV]
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
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210826142737.png)

#### 小端序
- 主机字节序(HBO-Host Byte Order)
- 一个多字节整数在计算机内存中存储的字节顺序称主机字节序(HBO- Host Byte Order，或者叫本地字节序)
- 不同类型CPU的HBO不同,这与CPU的设计有关。分为大端序(Big-Endian)和小端序(Little-Endian)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210826144713.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210826145319.png)

### 指令分类
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210826145633.png)