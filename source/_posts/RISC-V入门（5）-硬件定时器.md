---
title: RISC-V入门（4）- 硬件定时器
date: 2021-11-02 13:42:34
tags: [RISCV]
---
## 定时器中断
定时器中断属于本地（Local）中断，所以他不是由普通外部设备触发的，而是由特定的`CLINT`设备触发。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111011949763.png)

## CLINT介绍
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111011952239.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111011953920.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111011956642.png)