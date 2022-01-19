---
title: RISC-V入门（5）- 中断
date: 2022-01-04 19:42:34
tags: [RISCV]
categories: [RISC-V入门]
---

## 中断分类
- 本地（Local）中断
    - 软中断software interrupt
    - 定时器中断timer interrupt
- 全局（Global）中断
  - 外部中断externel interrupt

## RISC-V 中断编程中涉及的寄存器
| 寄存器 |用途说明 |
| :----: |:---- |
| mie <br> （Machine Interrupt Enable） |用于进一步控制（打开和关闭）software interrupt/timer interrupt/external interrupt |
| mip <br> （Machine Interrupt Pending）|它列出目前已发生等待处理的中断。|

### mie(Machine Interrupt Enable)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201042159268.png)

打开（1）或者关闭（0）M/S/U 模式下对应的 External/Timer/Software 中断。

### mip(Machine Interrupt Pending)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201042200772.png)

获取当前 M/S/U 模式下对应的 External/Timer/Software 中断是否发生。


## 中断处理流程

### 中断处理
1. 把 `mstatus` 的 `MIE` 值复制到 `MPIE` 中，清除 `mstatus` 中的 MIE 标志位，效果是中断被禁止。
2. 当前的 `PC` 的下一条指令地址被复制到 `mepc` 中，同时 `PC` 被设置为`mtvec`。注意如果我们设置 `mtvec.MODE = vetcored`，`PC =mtvec.BASE + 4 × exception-code`。
3. 根据 `interrupt` 的种类设置 `mcause`，并根据需要为 `mtval` 设置附加信息。
4. 将 `trap` 发生之前的权限模式保存在 `mstatus` 的 `MPP` 域中，再把`hart` 权限模式更改为 `M`。

### 退出中断
以在 M 模式下执行 mret 指令为例，会执行如下操作：
- 当前 Hart 的权限级别 = mstatus.MPP; mstatus.MPP= U（如果 hart 不支持 U 则为 M）
- mstatus.MIE = mstatus.MPIE; mstatus.MPIE = 1
- pc = mepc

## PLIC（Platform-Level Interrupt Controller）

HART只能处理一个中断，PLIC相当于一个控制中心，它通过中断类型，优先级等等来选出一个需要处理的中断。协调多个中断，服务一个HART。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202201042206664.png)


```c
enum {
    UART0_IRQ = 10, //Interrupt Source ID
    RTC_IRQ = 11,
    VIRTIO_IRQ = 1, /* 1 to 8 */
    VIRTIO_COUNT = 8,
    PCIE_IRQ = 0x20, /* 32 to 35 */
    VIRTIO_NDEV = 0x35 /* Arbitrary maximum number of interrupts */
};
```
- Interrupt Source ID 范围：1 ~ 53（0x35）
- 0 预留不用

`PLIC`本身也是一个外设，RISC-V 规范规定，`PLIC` 的寄存器编址采用内存映射（memory map）方式。每个寄存器的宽度为32-bit。

具体寄存器编址采用 `base + offset` 的格式，且 `base` 由各个特定`platform` 自己定义。针对 `QEMU-virt`，其 `PLIC` 的设计参考了`FU540-C000`，`base` 为 `0x0c000000`。

```c
static const MemMapEntry virt_memmap[] = {
    [VIRT_DEBUG] =       {        0x0,         0x100 },
    [VIRT_MROM] =        {     0x1000,        0xf000 },
    [VIRT_TEST] =        {   0x100000,        0x1000 },
    [VIRT_RTC] =         {   0x101000,        0x1000 },
    [VIRT_CLINT] =       {  0x2000000,       0x10000 },
    [VIRT_ACLINT_SSWI] = {  0x2F00000,        0x4000 },
    [VIRT_PCIE_PIO] =    {  0x3000000,       0x10000 },
    [VIRT_PLIC] =        {  0xc000000, VIRT_PLIC_SIZE(VIRT_CPUS_MAX * 2) },
    [VIRT_UART0] =       { 0x10000000,         0x100 },
    [VIRT_VIRTIO] =      { 0x10001000,        0x1000 },
    [VIRT_FW_CFG] =      { 0x10100000,          0x18 },
    [VIRT_FLASH] =       { 0x20000000,     0x4000000 },
    [VIRT_PCIE_ECAM] =   { 0x30000000,    0x10000000 },
    [VIRT_PCIE_MMIO] =   { 0x40000000,    0x40000000 },
    [VIRT_DRAM] =        { 0x80000000,           0x0 },
};
```

## PLIC 编程接口 - 寄存器
### Priority
功能：设置某一路中断源的优先级
内存映射地址：`BASE + (interrupt-id) * 4`

- 每个 `PLIC` 中断源对应一个寄存器，用于配置该中断源的优先级。
- `QEMU-virt` 支持 7 个优先级。 0 表示对该中断源禁用中断。其余优先级，1 最低，7 最高。
- 如果两个中断源优先级相同，则根据中断源的 ID 值进一步区分优先级，ID 值越小的优先级越高。

### Pending
功能：用于指示某一路中断源是否发生
内存映射地址：`BASE + 0x1000 + ((interrupt-id) / 32) * 4`

- 每个 `PLIC` 包含 2 个 32 位的 `Pending` 寄存器，因为总共有54个中断源，每一个 `bit` 对应一个中断源，如果为 1 表示该中断源上发生了中断（进入`Pending` 状态），有待 `hart` 处理，否则表示该中断源上当前无中断发生。
- `Pending` 寄存器中断的 `Pending` 状态可以通过`claim` 方式清除。
- 第一个 `Pending` 寄存器的第 0 位对应不存在的 0 号中断源，其值永远为 0。

### Enable
功能：针对某个 `hart` 开启或者关闭某一路中断源
内存映射地址：`BASE + 0x2000 + (hart) * 0x80`

- 每个 `Hart` 有 2 个 `Enable` 寄存器 （`Enable1` 和 `Enable2`）用于针对该` Hart` 启动或者关闭某路中断源。
- 每个中断源对应 `Enable` 寄存器的一个 `bit`，其中`Enable1` 负责控制 1 ~ 31 号中断源；`Enable2` 负责控制 `32 ~ 53` 号中断源。 将对应的 `bit` 位设置为 1 表示使能该中断源，否则表示关闭该中断源。

### Threshold
功能：针对某个 hart 设置中断源优先级的阈值
内存映射地址：`BASE + 0x200000 + (hart) * 0x1000`

- 每个 `Hart` 有 1 个 `Threshold` 寄存器用于设置中断优先级的阈值。
- 所有小于或者等于（<=）该阈值的中断源即使发生了也会被 `PLIC` 丢弃。特别地，当阈值为 0 时允许所有中断源上发生的中断；当阈值为 7 时丢弃所有中断源上发生的中断。

### Claim/Complete
功能：如下
内存映射地址：`BASE + 0x200004 + (hart) * 0x1000`

- `Claim` 和 `Complete` 是同一个寄存器，每个 `Hart` 一个。
- 对该寄存器执行读操作称之为 `Claim`，即获取当前发生的最高优先级的中断源` ID`。`Claim` 成功后会清除对应的 `Pending` 位。
- 对该寄存器执行写操作称之为 `Complete`。所谓 `Complete `指的是通知` PLIC` 对该路中断的处理已经结束。

```c
void external_interrupt_handler()
{
	int irq = plic_claim(); //

	if (irq == UART0_IRQ){
      		uart_isr();
	} else if (irq) {
		printf("unexpected interrupt irq = %d\n", irq);
	}
	
	if (irq) {
		plic_complete(irq); //
	}
}
```


## CLINT （Core Local INTerruptor）
定时器中断，属于本地中断的一种，由芯片内部`CLINT`设备产生的中断。

- RISC-V 规范规定，CLINT 的寄存器编址采用内存映射（memory map）方式。
- 具体寄存器编址采用` base + offset `的格式，且 `base` 由各个特定 `platform` 自己定义。针对 `QEMU-virt`，其 CLINT 的设计参考了 `SFIVE`，`base` 为 `0x2000000`。

## CLINT 编程接口 - 寄存器 (Timer 部分)
### mtime
功能：`real-time` 计数器（counter）
内存映射地址：`BASE + 0xbff8`

- 由晶振产生，系统全局唯一，在 `RV32` 和 `RV64` 上都是 64-bit。系统必须保证该计数器的值始终按照一个固定的频率递增。
- 上电复位时，硬件负责将 `mtime` 的值恢复为 0。


### mtimecmp
功能：定时器比较寄存器
内存映射地址：`BASE + 0x4000 + (hart) * 8)`

- 每个 `hart` 一个 `mtimecmp` 寄存器，64-bit。
- 上电复位时，系统不负责设置 mt`imecmp 的初值。

- 当` mtime >= mtimecmp` 时，`CLINT` 会产生一个 `timer` 中断。如果要使能该中断需要保证全局中断打开并且` mie.MTIE` 标志位置 `1`。
- 当 `timer` 中断发生时，`hart` 会设置 `mip.MTIP`，程序可以在 `mtimecmp` 中写入新的值清除` mip.MTIP`。

## 时钟节拍tick

- 操作系统中最小的时间单位；
- `Tick` 的单位（周期）由硬件定时器的周期决定
（通常为 1 ~ 100ms）；
- `Tick` 周期越小，也就是`1s`内产生的中断越多，系统的精度越高，但开销越大。