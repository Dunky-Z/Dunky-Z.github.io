---
title: RISC-V入门（4）- Trap和Exception
date: 2021-11-02 13:42:34
tags: [RISCV]
---
## 控制流（Control Flow）和 Trap

- 控制流（Control Flow）
  正常的程序运行指令都可以称为控制流，包括 `branch`,`jump`等跳转指令。
- 异常控制流（Exceptional Control Flow）
  - exception
  - interrupt

RISC-V 把 ECP 统称为 `Trap`。

## RISC-V Trap 处理中涉及的寄存器

| 寄存器 |用途说明 |
| :----: |:---- |
| mtvec <br> （Machine Trap-Vector Base-Address） |它保存发生异常时处理器需要跳转到的地址。 |
| mepc <br> （Machine Exception Program Counter）|当 trap 发生时，hart 会将发生 trap 所对应的指令的地址值（pc）保存在mepc 中。|
| mcause <br> （Machine Cause） |当 trap 发生时，hart 会设置该寄存器通知我们 trap 发生的原因。 |
| mtval <br> （Machine Trap Value）|它保存了 exception 发生时的附加信息：譬如访问地址出错时的地址信息、或者执行非法指令时的指令本身，对于其他异常，它的值为0。|
| mstatus <br> （Machine Status） | 用于跟踪和控制 hart 的当前操作状态（特别地，包括关闭和打开全局中断）。 |
| mscratch <br> （Machine Scratch）|Machine 模式下专用寄存器，我们可以自己定义其用法，譬如用该寄存器保存当前在 hart 上运行的 task 的上下文（context）的地址。|
| mie <br> （Machine Interrupt Enable） |用于进一步控制（打开和关闭）software interrupt/timer interrupt/external interrupt |
| mip <br> （Machine Interrupt Pending）|它列出目前已发生等待处理的中断。|

### mtvec（Machine Trap-Vector Base-Address）

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220104173734.png)

- BASE：trap入口函数的基地址，必须保证四字节对齐；
- MODE：进一步用于控制入口函数的地址配置方式：
  - Direct，所有异常和中断发生后，PC都跳转到BASE指定的地址处；
  - Vectored，异常的处理方式同上，但是中断的入口地址以数组方式排列；
可取值如下：
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220104174219.png)