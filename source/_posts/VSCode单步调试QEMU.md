---
title: VSCode单步调试QEMU
date: 2021-08-24 19:24:08
tags: [VSCode,Linux,QEMU]
---

了解了如何在[VSCode中调试程序](https://dunky-z.github.io/2021/08/23/VSCode%E8%B0%83%E8%AF%95%E7%A8%8B%E5%BA%8F/)，接下来我们在VSCode中搭建调试QEMU的环境。

## 配置
首先我们需要[下载和编译QEMU源码](https://dunky-z.github.io/2021/07/23/QEMU%E5%88%9D%E8%AF%86/)
```
./configure --enable-debug --target-list=riscv32-softmmu,riscv32-linux-user --enable-kvm
```
一定要加上`--enable-debug`，编译出的程序才带有调试信息，不用设置安装路径，编译时会自动在qemu文件夹下自动创建一个`build`文件夹，编译后的程序也在`build`文件夹下。

用VSCode打开`qemu-6.X.X`文件夹，`Ctrl+Shift+D`打开调试配置。如果参考过[VSCode中调试程序](https://dunky-z.github.io/2021/08/23/VSCode%E8%B0%83%E8%AF%95%E7%A8%8B%E5%BA%8F/)这篇文章，接下来就很容易。我们只需要将`launch.jason`文件中的`program`属性改为`${workspaceFolder}/build/qemu-system-riscv32`即可。

## 调试
打开`qemu-6.X.X/softmmu/main.c`文件，在`main`函数入口处打上断点，即可开始调试。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210824194442.png)

现在只需要点击屏幕上的图标，就可以快速的进行单步调试。

如果需要进行命令行操作，在屏幕下方打开`DEBUG CONSOLE`，输入`-exec+正常命令行下的命令`即可在命令行中进行更多的调试。如查看断点信息`-exec info breakpoints`

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210824201427.png)
