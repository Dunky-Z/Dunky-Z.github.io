---
title: RISC-V入门（4）- Trap和Exception
date: 2021-12-30 13:42:34
tags: [RISCV]
categories: [RISC-V入门]
---

## 控制流（Control Flow）和 Trap

- 控制流（Control Flow）
从给处理器加电开始，直到你断电为止，程序计数器假设一个值的序列
$$a_0,a_1,\dotsb,a_{n-1}$$
每个$a_k$都是指令的地址，每次从$a_{k}$到$a_{k+1}$的过渡称为控制转移，而这样的控制转移序列叫做处理器的控制流。
- 异常控制流（Exceptional Control Flow）
  系统也必须能够对系统状态的变化做出反应，这些系统状态不是被内部程序变量捕获的，而且也不一定要和程序的执行相关。比如，一个硬件定时器定期产生信号，这个事件必须得到处理。包到达网络适配器后，必须存放在内存中。程序向磁盘请求数据，然后休眠，直到被通知说数据已就绪。现代系统通过使控制流发生突变来对这些情况做出反应。我们把这些突变称为异常控制流。
    - exception
    - interrupt

RISC-V 把 ECF 统称为 `Trap`。

## RISC-V Trap 处理中涉及的寄存器

| 寄存器 |用途说明 |
| :----: |:---- |
| mtvec <br> （Machine Trap-Vector Base-Address） |它保存发生异常时处理器需要跳转到的地址。 |
| mepc <br> （Machine Exception Program Counter）|当 trap 发生时，hart 会将发生 trap 所对应的指令的地址值（pc）保存在mepc 中。|
| mcause <br> （Machine Cause） |当 trap 发生时，hart 会设置该寄存器通知我们 trap 发生的原因。 |
| mtval <br> （Machine Trap Value）|它保存了 exception 发生时的附加信息：譬如访问地址出错时的地址信息、或者执行非法指令时的指令本身，对于其他异常，它的值为0。|
| mstatus <br> （Machine Status） | 用于跟踪和控制 hart 的当前操作状态（特别地，包括关闭和打开全局中断）。 |
| mscratch <br> （Machine Scratch）|Machine 模式下专用寄存器，我们可以自己定义其用法，譬如用该寄存器保存当前在 hart 上运行的 task 的上下文（context）的地址。|


### mtvec（Machine Trap-Vector Base-Address）

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220104173734.png)

- BASE：trap入口函数的基地址，必须保证四字节对齐；
- MODE：进一步用于控制入口函数的地址配置方式：
    - Direct，所有异常和中断发生后，PC都跳转到BASE指定的地址处；
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201041945310.png)
    通常中断处理函数内部会有`switch case`条件语句，通过不同的中断采用不同的处理方式。
    ```c
    reg_t trap_handler(reg_t epc, reg_t cause)
    {
        reg_t return_pc = epc;
        reg_t cause_code = cause & 0xfff;
        
        if (cause & 0x80000000) {
            /* Asynchronous trap - interrupt */
            switch (cause_code) {
            case 3:
                uart_puts("software interruption!\n");
                break;
            case 7:
                uart_puts("timer interruption!\n");
                break;
            case 11:
                uart_puts("external interruption!\n");
                break;
            default:
                uart_puts("unknown async exception!\n");
                break;
            }
        } else {
            /* Synchronous trap - exception */
            printf("Sync exceptions!, code = %d\n", cause_code);
            panic("OOPS! What can I do!");
            //return_pc += 4;
        }

        return return_pc;
    }
    ```
    - Vectored，异常的处理方式同上，但是中断的入口地址以数组方式排列；
    ```
    trap_vector:
        # save context(registers).
        csrrw	t6, mscratch, t6	# swap t6 and mscratch
        reg_save t6

        # Save the actual t6 register, which we swapped into
        # mscratch
        mv	t5, t6		# t5 points to the context of current task
        csrr	t6, mscratch	# read t6 back from mscratch
        sw	t6, 120(t5)	# save t6 with t5 as base

        # Restore the context pointer into mscratch
        csrw	mscratch, t5

        # call the C trap handler in trap.c
        csrr	a0, mepc
        csrr	a1, mcause
        call	trap_handler

        # trap_handler will return the return address via a0.
        csrw	mepc, a0

        # restore context(registers).
        csrr	t6, mscratch
        reg_restore t6

        # return to whatever we were doing before trap.
        mret
    ```
    MODE可取值如下：
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220104174219.png)

采用`Vectored`方式效率更高。

### mepc（Machine Exception Program Counter）
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201041958237.png)

当`trap`发生时，`pc`会被替换为 `mtvec `设定的地址，同时`hart` 会设置` mepc `为当前指令或者下一条指令的地址（处理异常时，mepc为当前指令的地址，处理中断时，mepc为下一条指令的地址）。

当我们需要退出` trap` 时可以调用特殊的 `mret` 指令，该指令会将` mepc `中的值恢复到` pc `中（实现返回的效果）；

在处理 `trap` 的程序中我们可以修改 `mepc` 的值达到改变`mret` 返回地址的目的。

### mcause（Machine Cause）
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201042012549.png)

当 `trap` 发生时，`hart` 会设置该寄存器通知我们 `trap` 发生的原因。

最高位 `Interrupt` 为 1 时标识了当前 `trap` 为`interrupt`，否则是` exception`。

剩余的 `Exception Code` 用于标识具体的` interrupt `或者`exception` 的种类。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201042014689.png)

### mtval（Machine Trap Value）
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201042016744.png)

当 `trap` 发生时，除了通过` mcause` 可以获取` exception`的种类 `code` 值外，`hart` 还提供了 `mtval` 来提供`exception` 的其他信息来辅助我们执行更进一步的操作。

具体的辅助信息由特定的硬件实现定义，RISC-V 规范没有定义具体的值。但规范定义了一些行为，譬如访问地址出错时的地址信息、或者执行非法指令时的指令本身等。

### mstatus（Machine Status）
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201042020644.png)

寄存器各个位可以大致分为以下三类，其中`x`可以为`U,S,M`。表示用户模式以及两种特权模式。

- `xIE`（x=M/S/U）: 分别用于打开（1）或者关闭（0） M/S/U 模式下的全局中断。当 `trap` 发生时，` hart `会自动将 `xIE` 设置为 0。

- `xPIE`（x=M/S/U）:当 `trap` 发生时用于保存 `trap` 发生之前的 `xIE` 值。

- `xPP`（x=M/S）:当 `trap` 发生时用于保存 `trap` 发生之前的权限级别值。注意没有 `UPP`。因为异常只会从低权限向高权限跳转，通常低权限如`user`模式，会被置于上方，高权限如内核一般都会画在下方，这也解释了异常，中断处理为什么叫`trap`，因为是向下陷入的过程。

- 其他标志位涉及内存访问权限、虚拟内存控制等，暂不考虑。

## Trap处理流程

### 初始化
将`trap`的基地址写入寄存器，

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202201042053570.png)
### Top Half

1. 把 `mstatus` 的 `MIE` 值复制到 `MPIE` 中，清除 `mstatus `中的 `MIE` 标志位，效果是中断被禁止。
2. 设置` mepc `，同时` PC `被设置为 `mtvec`。（需要注意的是，对于`exception`， `mepc `指向导致异常的指令；对于 `interrupt`，它指向被中断的指令的下一条指令的位置。）
3. 根据 `trap` 的种类设置 `mcause`，并根据需要为` mtval `设置附加信息。
4. 将 `trap` 发生之前的权限模式保存在 `mstatus` 的 `MPP` 域中，再把`hart` 权限模式更改为 `M`（也就是说无论在任何 `Level` 下触发` trap`，`hart` 首先切换到 `Machine` 模式）。

### Bottom Half

1. 保存（save）当前控制流的上下文信息（利用 `mscratch`）；
2. 调用 C 语言的 `trap handler`;
3. 从 `trap handler` 函数返回，`mepc `的值有可能需要调整；
4. 恢复（restore）上下文的信息；
5. 执行` MRET `指令返回到 `trap`之前的状态。

```
trap_vector:
	# save context(registers).
	csrrw	t6, mscratch, t6	# swap t6 and mscratch
	reg_save t6

	# Save the actual t6 register, which we swapped into
	# mscratch
	mv	t5, t6		# t5 points to the context of current task
	csrr	t6, mscratch	# read t6 back from mscratch
	sw	t6, 120(t5)	# save t6 with t5 as base

	# Restore the context pointer into mscratch
	csrw	mscratch, t5

	# call the C trap handler in trap.c
	csrr	a0, mepc
	csrr	a1, mcause
	call	trap_handler

	# trap_handler will return the return address via a0.
	csrw	mepc, a0

	# restore context(registers).
	csrr	t6, mscratch
	reg_restore t6

	# return to whatever we were doing before trap.
	mret
```

### 退出 trap ：编程调用 MRET 指令
针对不同权限级别下如何退出 trap 有各自的返回指令`xRET`（x = M/S/U）。以在 `M` 模式下执行` mret` 指令为例，会执行如下操作：
- 当前 Hart的权限级别 = mstatus.MPP；mstatus.MPP = U（如果 hart 不支持 U 则为 M）
- mstatus.MIE = mstatus.MPIE; mstatus.MPIE = 1
- pc = mepc
<<<<<<< HEAD

=======
>>>>>>> d653fe09ec3df98cb68542dae9cb2f376e3ef45f
