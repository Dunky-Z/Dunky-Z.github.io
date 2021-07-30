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


## QEMU工作原理
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210721140349.png)
单纯使用 qemu，采用的是完全虚拟化的模式。qemu 向 Guest OS 模拟 CPU，也模拟其他的硬件，GuestOS 认为自己和硬件直接打交道，其实是同 qemu 模拟出来的硬件打交道，qemu 会将这些指令转译给真正的硬件。由于所有的指令都要从 qemu 里面过一手，因而性能就会比较差。

完全虚拟化是非常慢的，所以要使用硬件辅助虚拟化技术 `Intel-VT`，`AMD-V`，所以需要 CPU 硬件开启这个标志位，一般在 BIOS 里面设置。当确认开始了标志位之后，通过` KVM`，GuestOS 的 CPU 指令不用经过 Qemu 转译，直接运行，大大提高了速度。所以，`KVM` 在内核里面需要有一个模块，来设置当前 CPU 是 Guest OS 在用，还是 Host OS 在用。

可以通过如下命令查看内核模块中是否有KVM
```
lsmod | grep kvm
```
KVM 内核模块通过 `/dev/kvm` 暴露接口，用户态程序可以通过 `ioctl`来访问这个接口。Qemu 将 KVM 整合进来，将有关 CPU 指令的部分交由内核模块来做，就是 `qemu-kvm (qemu-system-XXX)`。

qemu 和 kvm 整合之后，CPU 的性能问题解决了。另外 Qemu 还会模拟其他的硬件，如网络和硬盘。同样，全虚拟化的方式也会影响这些设备的性能。

于是，qemu 采取半虚拟化的方式，让 Guest OS 加载特殊的驱动来做这件事情。

例如，网络需要加载 `virtio_net`，存储需要加载 `virtio_blk`，Guest 需要安装这些半虚拟化驱动，GuestOS 知道自己是虚拟机，所以数据会直接发送给半虚拟化设备，经过特殊处理（例如排队、缓存、批量处理等性能优化方式），最终发送给真正的硬件。这在一定程度上提高了性能。

> Q : 系统模式和用户模式的区别？
> 系统模式 是qemu虚拟出一套完整的硬件环境， 包含cpu，内存，网卡，硬盘，对于虚拟机上运行的OS看到的和硬件和真实的是一样的。
> 用户模式是直接将可执行的文件进行指令翻译，只虚拟出cpu。
> 假设有KVM：host 是 x86 ，QEMU 虚拟出x86 的系统模式 运行windows系统。QEMU会将 windows 指令直接交给  host cpu 直接运行（ 这个功能是由KVM 实现的，相当于直接调用host CPU）， 性能损失小  。 内存，硬盘，网洛等外设是由qemu虚拟出来的。
> 假设无KVM：host 是 x86 ，QEMU 虚拟出x86 的系统模式运行windows系统。QEMU会将windows指令翻译成中间码，中间码再转成   host cpu 指令（ 这个功能是由qemu TCG 实现的），性能损失大。内存，硬盘，网洛等外设是由qemu 虚拟出来的。
> 假设有KVM：host 是 x86 ，QEMU 虚拟出riscv 的系统模式 运行Linux系统。QEMU会将Linux指令翻译成中间码，中间码再转成host cpu指令（ 这个功能是由qemu TCG 实现的），性能损失大。内存，硬盘，网洛等外设是由qemu 虚拟出来的。
> KVM需要在虚拟机与宿主机架构相同时才生效。
此外， 用户模式下调用IO硬件会报错。qemu系统模式下会模拟出所有设备，但是模拟的IO设备效率低，所以后来有了半虚拟化。

## TCG动态二进制翻译

微指令
基本块