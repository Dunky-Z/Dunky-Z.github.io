---
title: QEMU学习记录
date: 2021-07-20 16:51:34
tags:
---
# QEMU学习记录
## 什么是KVM？
基于内核的虚拟机 `Kernel-based Virtual Machine（KVM）`是一种内建于 Linux 中的开源虚拟化技术。具体而言，`KVM` 可帮助用户将 Linux 转变为虚拟机监控程序，使主机计算机能够运行多个隔离的虚拟环境，即虚拟客户机或虚拟机（VM）。

## 什么是QEMU？
Qemu是一个完整的可以单独运行的软件，它可以用来模拟不同架构的机器，非常灵活和可移植。它主要通过一个特殊的'重编译器'将为特定处理器编写二进制代码转换为另一种。

## KVM与QEMU的关系
KVM是Linux的一个模块。可以用`modprobe`去加载KVM模块。加载了模块后，才能进一步通过其他工具创建虚拟机。但仅有KVM模块是 远远不够的，因为用户无法直接控制内核模块去作事情：还必须有一个用户空间的工具才行。这个用户空间的工具，开发者选择了已经成型的开源虚拟化软件 QEMU。KVM使用了QEMU的一部分，并稍加改造，就成了可控制KVM的用户空间工具了。所以你会看到，官方提供的KVM下载有两 大部分三个文件，分别是KVM模块、QEMU工具以及二者的合集。也就是说，你可以只升级KVM模块，也可以只升级QEMU工具。

## QEMU用户模式与系统模式
QEMU属于应用层的仿真程序，它支持两种操作模式：**用户模式**模拟和**系统模式**模拟。
- **用户模式仿真** 利用动态代码翻译机制，可以在当前CPU上执行被编译为支持其他CPU的程序，如可以在x86机器上执行一个ARM二进制可执行程序。（执行主机 CPU 指令的动态翻译并相应地转换 Linux 系统调用）。
- **系统模式仿真** 利用其它VMM(Xen, KVM)来使用硬件提供的虚拟化支持，创建接近于主机性能的全功能虚拟机，包括处理器和配套的外围设备（磁盘，以太网等）。

### 用户模式
支持的CPU：x86 (32 and 64 bit), PowerPC (32 and 64 bit), ARM, MIPS (32 bit only), Sparc (32 and 64 bit), Alpha, ColdFire(m68k), CRISv32 和 MicroBlaze
下列操作系统支持QEMU的用户模式模拟：
- Linux (referred as qemu-linux-user)
- BSD (referred as qemu-bsd-user)

调用（[具体参数含义](https://qemu.readthedocs.io/en/latest/user/main.html)）
```
qemu-i386 [-h] [-d] [-L path] [-s size] [-cpu model] [-g port] [-B offset] [-R size] program [arguments...]
```
用户模式模拟环境下运行速度要比系统模式模拟环境下快，但并不是完美模拟，比如程序读取`/proc/cpuinfo`内容时，由主机内核返回，因此返回的信息是描述主机CPU的，而不是模拟的CPU。
### 系统模式
首先创建虚拟镜像，模拟硬盘空间：
```
root@hanhan:/home/dominic/qemu/# qemu-img create -f qcow2 qmtest.img 10G
Formatting 'qmtest.img', fmt=qcow2 size=10737418240 encryption=off cluster_size=65536 lazy_refcounts=off 
root@hanhan:/home/dominic/qemu/# ls
qmtest.img
```
`-f`选项用于指定镜像的格式，`qcow2`格式是QEMU最常用的镜像格式，采用写时复制技术来优化性能。`qmtest.img`是镜像文件的名字，`10G`是镜像文件大小。

镜像文件创建完成后，可使用`qemu-system-x86`来启动`x86`架构的虚拟机：
```
qemu-system-x86_64 qmtest.img
```
qmtest.img中还未安装操作系统，所以会提示“No bootable device”的错误。

其次，准备操作系统镜像
下载需要的Linux发行版镜像文件,https://launchpad.net/ubuntu/+cdmirrors， 找到想要下载的镜像，这里以交通大学的镜像为例
右击链接复制地址：https://ftp.sjtu.edu.cn/ubuntu-cd/20.10/ubuntu-20.10-live-server-amd64.iso
```
root@hanhan:/home/dominic/qemu/# wget https://ftp.sjtu.edu.cn/ubuntu-cd/20.10/ubuntu-20.10-live-server-amd64.iso
```
最后，启动虚拟机安装操作系统
```
root@hanhan:/home/dominic/qemu/# qemu-system-x86_64 -m 2048 -enable-kvm qmtest.img -cdrom ./Fedora-Live-Desktop-x86_64-20-1.iso
```
`-m `指定虚拟机内存大小，默认单位是MB，`-enable-kvm`使用KVM进行加速，`-cdrom`添加fedora的安装镜像。


该模式下，要比用户模式模拟慢得多，因为模拟了目标内核，以及设备输入/输出、中断等。
